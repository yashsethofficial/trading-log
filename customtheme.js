import { MD3DarkTheme } from 'react-native-paper';

export const customDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,

    // === Core Backgrounds ===
    background: '#121212',
    surface: '#1F1B24',
    card: '#2C2C2C',
    border: '#2A2A2A',

    // === Primary Palette ===
    primary: '#BB86FC',
    secondary: '#03DAC6',
    accent: '#FF4081',

    // === Text Colors ===
    text: '#FFFFFF',
    inputText: '#FFFFFF',
    placeholder: '#AAAAAA',
    muted: '#888888',
    disabled: '#444444',

    // === Inputs and UI ===
    inputBackground: '#2A2A2A',
    backdrop: '#000000AA',

    // === Status Colors ===
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#CF6679',
    info: '#2196F3',
  },
};
