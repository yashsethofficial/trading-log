import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import { getPlans } from '../utils/storage';
import { TradingContext } from '../context/TradingContext';

const ProgressTracker = () => {
  const { colors } = useTheme();
  const { refreshFlag } = useContext(TradingContext);

  const [expectedProfit, setExpectedProfit] = useState(0);
  const [actualProfit, setActualProfit] = useState(0);
  const [diff, setDiff] = useState(0);
  const [avgProfitThisMonth, setAvgProfitThisMonth] = useState(null);

  useEffect(() => {
    const calculateProgress = async () => {
      const plans = await getPlans();
      if (!plans || plans.length === 0) return;

      const plan = plans[plans.length - 1];
      const { initialCapital, dailyRate, startDate } = plan;

      const today = dayjs();
      const start = dayjs(startDate);
      const daysPassed = today.diff(start, 'day');
      const expected = initialCapital * (Math.pow(1 + dailyRate, daysPassed) - 1);

      let actual = 0;
      for (let i = 0; i <= daysPassed; i++) {
        const date = dayjs(start).add(i, 'day').format('YYYY-MM-DD');
        const val = await AsyncStorage.getItem(`PNL_${date}`);
        if (val !== null) {
          actual += parseFloat(val);
        }
      }

      setExpectedProfit(Math.round(expected));
      setActualProfit(Math.round(actual));
      setDiff(Math.round(actual - expected));
    };

    const calculateAvgProfitForCurrentMonth = async () => {
      const plans = await getPlans();
      if (!plans || plans.length === 0) return;

      const plan = plans[plans.length - 1];
      const { initialCapital, dailyRate, startDate } = plan;

      const today = dayjs();
      const start = dayjs(startDate);
      const startOfMonth = today.startOf('month');
      const endOfMonth = today.endOf('month');

      // Use later of startDate or first day of current month
      const effectiveStart = start.isAfter(startOfMonth) ? start : startOfMonth;

      let totalProfit = 0;
      let daysCount = 0;

      for (
        let d = effectiveStart;
        d.isBefore(endOfMonth) || d.isSame(endOfMonth, 'day');
        d = d.add(1, 'day')
      ) {
        const dayIndex = d.diff(start, 'day');
        const profit =
          initialCapital * (Math.pow(1 + dailyRate, dayIndex) - 1) -
          initialCapital * (Math.pow(1 + dailyRate, dayIndex - 1) - 1);
        totalProfit += profit;
        daysCount += 1;
      }

      const avg = totalProfit / daysCount;
      setAvgProfitThisMonth(avg);
    };

    calculateProgress();
    calculateAvgProfitForCurrentMonth();
  }, [refreshFlag]);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <Text style={[styles.title, { color: colors.primary }]}>📊 Progress Tracker</Text>

      <View style={styles.row}>
        <Text style={[styles.label, { color: colors.text }]}>Expected Profit</Text>
        <Text style={[styles.value, { color: 'gold' }]}>${expectedProfit}</Text>
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, { color: colors.text }]}>Actual PnL</Text>
        <Text style={[styles.value, { color: actualProfit >= 0 ? 'limegreen' : colors.error }]}>
          ${actualProfit}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, { color: colors.text }]}>You are</Text>
        <Text
          style={[
            styles.value,
            { color: diff >= 0 ? 'limegreen' : colors.error, fontWeight: 'bold' },
          ]}
        >
          {diff >= 0 ? `$${diff} ahead 📈` : `$${Math.abs(diff)} behind 📉`}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, { color: colors.text }]}>Avg Needed This Month</Text>
        {avgProfitThisMonth === null ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Text style={[styles.value, { color: colors.secondary }]}>
            ${avgProfitThisMonth.toFixed(2)} / day
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
  },
  value: {
    fontSize: 16,
  },
});

export default ProgressTracker;
