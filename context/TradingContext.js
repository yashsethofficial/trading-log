import React, { createContext, useState, useEffect } from 'react';

export const TradingContext = createContext();

export const TradingProvider = ({ children }) => {
  const [refreshFlag, setRefreshFlag] = useState(0);

  const triggerRefresh = () => {
    console.log('🔄 triggerRefresh called');
    setRefreshFlag((prev) => {
      const updated = prev + 1;
      console.log('✅ refreshFlag updated to:', updated);
      return updated;
    });
  };

  useEffect(() => {
    console.log('📦 TradingContext mounted with refreshFlag:', refreshFlag);
  }, []);

  return (
    <TradingContext.Provider value={{ refreshFlag, triggerRefresh }}>
      {children}
    </TradingContext.Provider>
  );
};
