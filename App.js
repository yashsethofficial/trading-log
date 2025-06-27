import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import Navigation from './Navigation';
import { customDarkTheme } from './customtheme';
import { TradingProvider } from './context/TradingContext';
export default function App() {
  return (
    <PaperProvider theme={customDarkTheme}>
      <TradingProvider>
        <Navigation theme={customDarkTheme} />
      </TradingProvider>
    </PaperProvider>
  );
}
