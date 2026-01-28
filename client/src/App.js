import React from 'react';
import { AnalyticsProvider } from './context/AnalyticsContext';
import './assets/global.css';

function App() {
  return (
    <AnalyticsProvider>
      <div className="App">
        <header className="App-header">
          <h1>Modern Banking App</h1>
        </header>
      </div>
    </AnalyticsProvider>
  );
}

export default App;
