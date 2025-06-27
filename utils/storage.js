// utils/storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export const savePlan = async (plan) => {
  const existing = JSON.parse(await AsyncStorage.getItem('compoundPlans')) || [];
  const updated = [...existing, plan];
  await AsyncStorage.setItem('compoundPlans', JSON.stringify(updated));
};

export const getPlans = async () => {
  const data = await AsyncStorage.getItem('compoundPlans');
  return data ? JSON.parse(data) : [];
};
