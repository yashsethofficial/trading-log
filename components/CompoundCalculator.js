import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Alert, ToastAndroid } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useContext } from 'react';

import { TradingContext } from '../context/TradingContext';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { savePlan, getPlans } from '../utils/storage';

const CompoundCalculator = () => {
  const { colors } = useTheme();
  const { triggerRefresh } = useContext(TradingContext);

  const [capital, setCapital] = useState('');
  const [rate, setRate] = useState('');
  const [days, setDays] = useState('');
  const [startDate, setStartDate] = useState('');
  const [result, setResult] = useState(null);
  const [savedPlan, setSavedPlan] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const loadSavedPlan = async () => {
      const plans = await getPlans();
      if (plans.length > 0) {
        const latest = plans[plans.length - 1];
        setSavedPlan(latest);
        setCapital(latest.initialCapital.toString());
        setRate((latest.dailyRate * 100).toString());
        setDays(latest.periodDays.toString());
        setStartDate(latest.startDate);
        setResult({ final: latest.finalAmount, profit: latest.profit });
      }
    };
    loadSavedPlan();
  }, []);

  const validateInputs = () => {
    const P = parseFloat(capital.replace(/,/g, ''));
    const r = parseFloat(rate);
    const t = parseInt(days);
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (isNaN(P) || P <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid Initial Capital.');
      return false;
    }
    if (isNaN(r) || r <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid Interest Rate.');
      return false;
    }
    if (isNaN(t) || t <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid number of Days.');
      return false;
    }
    if (!dateRegex.test(startDate)) {
      Alert.alert('Invalid Input', 'Please enter Start Date in YYYY-MM-DD format.');
      return false;
    }
    return true;
  };

  const saveCalculation = async () => {
    if (!validateInputs()) return;

    const P = parseFloat(capital.replace(/,/g, ''));
    const r = parseFloat(rate) / 100;
    const t = parseInt(days);
    const A = P * Math.pow(1 + r, t);
    const profit = A - P;

    const plan = {
      initialCapital: P,
      dailyRate: r,
      periodDays: t,
      startDate,
      createdAt: new Date().toISOString(),
      finalAmount: A,
      profit,
    };

    try {
      await savePlan(plan);
      setSavedPlan(plan);
      setResult({ final: A, profit });
      setIsEditing(false);
      triggerRefresh(); // <-- add this
      ToastAndroid.show('Calculation saved successfully!', ToastAndroid.SHORT);
      Alert.alert('Saved', 'Calculation saved successfully!');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to save calculation.');
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      {savedPlan && !isEditing ? (
        <View style={styles.displaySection}>
          <Pressable onPress={() => setIsEditing(true)} style={styles.editIcon}>
            <MaterialCommunityIcons name="pencil" size={24} color={colors.primary} />
          </Pressable>

          <Text style={styles.displayTitle}>📥 Inputs</Text>
          <View style={styles.displayGroup}>
            <Text style={styles.displayLabel}>Initial Capital</Text>
            <Text style={styles.displayValue}>
              ${savedPlan.initialCapital.toLocaleString('en-IN')}
            </Text>
          </View>
          <View style={styles.displayGroup}>
            <Text style={styles.displayLabel}>Daily ROI</Text>
            <Text style={styles.displayValue}>{(savedPlan.dailyRate * 100).toFixed(2)}%</Text>
          </View>
          <View style={styles.displayGroup}>
            <Text style={styles.displayLabel}>Period</Text>
            <Text style={styles.displayValue}>{savedPlan.periodDays} days</Text>
          </View>
          <View style={styles.displayGroup}>
            <Text style={styles.displayLabel}>Start Date</Text>
            <Text style={styles.displayValue}>{savedPlan.startDate}</Text>
          </View>

          <Text style={[styles.displayTitle, { marginTop: 20 }]}>📈 Result</Text>
          <View style={styles.displayGroup}>
            <Text style={styles.displayLabel}>Total Profit</Text>
            <Text style={[styles.displayValue, { color: 'limegreen' }]}>
              ${Math.round(savedPlan.profit).toLocaleString('en-IN')}
            </Text>
          </View>
          <View style={styles.displayGroup}>
            <Text style={styles.displayLabel}>Final Amount</Text>
            <Text style={[styles.displayValue, { color: 'limegreen' }]}>
              ${Math.round(savedPlan.finalAmount).toLocaleString('en-IN')}
            </Text>
          </View>
        </View>
      ) : (
        <>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Initial Capital ($)</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.inputBackground, color: colors.inputText },
              ]}
              value={capital}
              onChangeText={setCapital}
              keyboardType="numeric"
              placeholder="e.g. 100000"
              placeholderTextColor={colors.placeholder}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Interest Rate per Day (%)</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.inputBackground, color: colors.inputText },
              ]}
              value={rate}
              onChangeText={setRate}
              keyboardType="numeric"
              placeholder="e.g. 1"
              placeholderTextColor={colors.placeholder}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Number of Days</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.inputBackground, color: colors.inputText },
              ]}
              value={days}
              onChangeText={setDays}
              keyboardType="numeric"
              placeholder="e.g. 365"
              placeholderTextColor={colors.placeholder}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Start Date (YYYY-MM-DD)</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.inputBackground, color: colors.inputText },
              ]}
              value={startDate}
              onChangeText={setStartDate}
              placeholder="e.g. 2025-06-25"
              placeholderTextColor={colors.placeholder}
            />
          </View>

          <Pressable
            onPress={saveCalculation}
            style={[styles.button, { backgroundColor: colors.primary }]}
          >
            <MaterialCommunityIcons name="content-save" size={24} color={colors.text} />
          </Pressable>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  displaySection: {
    paddingTop: 10,
  },
  editIcon: {
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  displayTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#BB86FC',
  },
  displayGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    paddingVertical: 8,
    borderBottomColor: '#2A2A2A', // from theme.border
  },
  displayLabel: {
    fontSize: 14,
    color: '#AAAAAA', // from theme.placeholder
  },
  displayValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF', // from theme.text
  },
});

export default CompoundCalculator;
