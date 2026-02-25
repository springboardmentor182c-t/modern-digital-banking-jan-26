import React from 'react';
import './assets/global.css';
import PageContainer from './layout/PageContainer';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <PageContainer activePage="dashboard">
      <Dashboard />
    </PageContainer>
  );
}

export default App;
