import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import { getPlans } from '../utils/storage';
import { TradingContext } from '../context/TradingContext';

const ForecastTracker = () => {
  const { colors } = useTheme();
  const { refreshFlag } = useContext(TradingContext);

  const [monthTarget, setMonthTarget] = useState(0);
  const [adjustedTarget, setAdjustedTarget] = useState(0);
  const [finalTarget, setFinalTarget] = useState(0);

  useEffect(() => {
    const calculateForecast = async () => {
      console.log('📊 ForecastTracker: Recalculating forecast on refreshFlag =', refreshFlag);

      const plans = await getPlans();
      if (!plans || plans.length === 0) {
        console.log('⚠️ No plan data available');
        return;
      }

      const plan = plans[plans.length - 1];
      const initialCapital = parseFloat(plan.initialCapital);
      const dailyRate = parseFloat(plan.dailyRate); // ✅ Already a decimal like 0.01
      const startDate = plan.startDate;

      const period = parseInt(plan.periodDays, 10); // ✅ match key in saved plan

      console.log('✅ Parsed plan values:', { initialCapital, dailyRate, startDate, period });

      const today = dayjs();
      const start = dayjs(startDate);

      const daysToMonthEnd = dayjs().endOf('month').diff(start, 'day');
      const remainingDays = dayjs().endOf('month').diff(today, 'day');

      const expectedMonthTarget = initialCapital * Math.pow(1 + dailyRate, daysToMonthEnd);

      let actualPnL = 0;
      for (let i = 0; i <= today.diff(start, 'day'); i++) {
        const date = start.add(i, 'day').format('YYYY-MM-DD');
        const val = await AsyncStorage.getItem(`PNL_${date}`);
        if (val) {
          actualPnL += parseFloat(val);
        }
      }

      const currentCapital = initialCapital + actualPnL;
      const adjustedMonthForecast = currentCapital * Math.pow(1 + dailyRate, remainingDays);
      const fullPeriodTarget = initialCapital * Math.pow(1 + dailyRate, period);

      setMonthTarget(Math.round(expectedMonthTarget));
      setAdjustedTarget(Math.round(adjustedMonthForecast));
      setFinalTarget(Math.round(fullPeriodTarget));
    };

    calculateForecast();
  }, [refreshFlag]);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <Text style={[styles.title, { color: colors.primary }]}>📈 Forecast</Text>

      <View style={styles.row}>
        <Text style={[styles.label, { color: colors.text }]}>🎯 Target by Month-End</Text>
        <Text style={[styles.value, { color: 'gold' }]}>${monthTarget}</Text>
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, { color: colors.text }]}>📊 Based on your PNL</Text>
        <Text style={[styles.value, { color: 'deepskyblue' }]}>${adjustedTarget}</Text>
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, { color: colors.text }]}>🏁 Final Target (Full Period)</Text>
        <Text style={[styles.value, { color: 'limegreen' }]}>${finalTarget}</Text>
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
  },
  label: {
    fontSize: 16,
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ForecastTracker;
