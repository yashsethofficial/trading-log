import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import { useContext } from 'react';
import { TradingContext } from '../context/TradingContext';

const DailyPnLEntry = () => {
  const { colors } = useTheme();
  const { triggerRefresh } = useContext(TradingContext);

  const [currentDate, setCurrentDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [pnl, setPnl] = useState('');
  const [isEditing, setIsEditing] = useState(true);

  useEffect(() => {
    loadPnL(currentDate);
  }, [currentDate]);

  const loadPnL = async (date) => {
    const key = `PNL_${date}`;
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      setPnl(value);
      setIsEditing(false);
    } else {
      setPnl('');
      setIsEditing(true);
    }
  };

  const savePnL = async () => {
    if (pnl.trim() === '') return;
    const key = `PNL_${currentDate}`;
    await AsyncStorage.setItem(key, pnl);
    setIsEditing(false);
    triggerRefresh(); // Notify other components to update
  };

  const changeDate = (offset) => {
    const newDate = dayjs(currentDate).add(offset, 'day').format('YYYY-MM-DD');
    setCurrentDate(newDate);
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <Pressable onPress={() => changeDate(-1)}>
          <MaterialCommunityIcons name="chevron-left" size={24} color={colors.primary} />
        </Pressable>
        <Text style={[styles.date, { color: colors.text }]}>{currentDate}</Text>
        <Pressable onPress={() => changeDate(1)}>
          <MaterialCommunityIcons name="chevron-right" size={24} color={colors.primary} />
        </Pressable>
      </View>

      {isEditing ? (
        <>
          <TextInput
            style={[
              styles.input,
              { color: colors.inputText, backgroundColor: colors.inputBackground },
            ]}
            placeholder="Enter PnL (e.g. +20 or -15)"
            value={pnl}
            onChangeText={setPnl}
            keyboardType="numeric"
            placeholderTextColor={colors.placeholder}
          />
          <Pressable
            onPress={savePnL}
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
          >
            <Text style={{ color: colors.text }}>Save</Text>
          </Pressable>
        </>
      ) : (
        <View style={styles.viewMode}>
          <Text
            style={[styles.pnlText, { color: parseFloat(pnl) >= 0 ? 'limegreen' : colors.error }]}
          >
            {parseFloat(pnl) >= 0 ? `Profit: $${pnl}` : `Loss: $${Math.abs(pnl)}`}
          </Text>
          <Pressable onPress={() => setIsEditing(true)}>
            <MaterialCommunityIcons name="pencil" size={20} color={colors.accent} />
          </Pressable>
        </View>
      )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  date: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#555',
  },
  saveButton: {
    marginTop: 10,
    padding: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  viewMode: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pnlText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DailyPnLEntry;
