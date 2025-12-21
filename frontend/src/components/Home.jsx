import React from 'react';
import MainLayout from './MainLayout';
import SuperadminDashboard from './SuperadminDashboard';
import ProviderDashboard from './ProviderDashboard';
import { useApp } from '../context/AppContext';

const Home = () => {
  const { user } = useApp();

  // Route based on user role
  if (user?.role === 'superadmin') {
    return <SuperadminDashboard />;
  } else if (user?.role === 'admin') {
    return <ProviderDashboard />;
  } else {
    // Regular customer - show IPTV content
    return <MainLayout />;
  }
};

export default Home;
