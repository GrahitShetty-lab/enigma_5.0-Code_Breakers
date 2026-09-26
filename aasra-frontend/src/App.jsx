import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/layout/Layout';
import Landing from './pages/Landing';
import Setup from './pages/Setup';
import Dashboard from './pages/Dashboard';
import FinancialInventory from './pages/FinancialInventory';
import ActionCenter from './pages/ActionCenter';
import Documents from './pages/Documents';
import Timeline from './pages/Timeline';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/setup" element={<Setup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/assets" element={<FinancialInventory />} />
            <Route path="/actions" element={<ActionCenter />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/timeline" element={<Timeline />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
