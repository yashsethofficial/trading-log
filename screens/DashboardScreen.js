import React, { useLayoutEffect, useContext } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import CompoundCalculator from '../components/CompoundCalculator';
import DailyPnLEntry from '../components/DailyPnLEntry';
import ProgressTracker from '../components/ProgressTracker';
import ForecastTracker from '../components/ForecastTracker';
import { TradingContext } from '../context/TradingContext';

const DashboardScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { triggerRefresh } = useContext(TradingContext);
 
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={confirmReset} style={{ marginRight: 16 }}>
          <MaterialCommunityIcons name="delete" size={24} color={colors.background} />
        </Pressable>
      ),
    });
  }, [navigation, colors.text]);

  // Confirm reset and clear storage
  const confirmReset = () => {
    Alert.alert('Reset All Data', 'Are you sure you want to clear all data?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes, Reset',
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.clear();
            triggerRefresh();
            Alert.alert('Reset Done', 'All data has been cleared.');
          } catch (error) {
            console.error('Failed to reset data:', error);
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <CompoundCalculator />
        <DailyPnLEntry />
        <ProgressTracker />
        <ForecastTracker />
      </ScrollView>

      <Pressable
        onPress={() => navigation.navigate('Add Trade')}
        style={[styles.fabButton, { backgroundColor: colors.primary }]}
      >
        <MaterialCommunityIcons name="plus" size={28} color={colors.text} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    position: 'relative',
  },
  container: {
    padding: 20,
    paddingBottom: 100, // padding for FAB
  },
  fabButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    padding: 16,
    borderRadius: 50,
    elevation: 6,
  },
});

export default DashboardScreen;
