import React, { createContext, useState } from 'react';

export const AnalyticsContext = createContext();

export const AnalyticsProvider = ({ children }) => {
  const [analytics, setAnalytics] = useState({});

  const trackEvent = (eventName, data) => {
    console.log(`Event: ${eventName}`, data);
    setAnalytics((prev) => ({
      ...prev,
      [eventName]: data,
    }));
  };

  return (
    <AnalyticsContext.Provider value={{ analytics, trackEvent }}>
      {children}
    </AnalyticsContext.Provider>
  );
};
