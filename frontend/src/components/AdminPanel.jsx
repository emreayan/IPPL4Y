import React from 'react';
import { useApp } from '../context/AppContext';
import ProviderDashboard from './ProviderDashboard';
import SuperadminDashboard from './SuperadminDashboard';
import { Navigate } from 'react-router-dom';

const AdminPanel = () => {
  const { user } = useApp();

  // Route based on user role
  if (user?.role === 'superadmin') {
    return <SuperadminDashboard />;
  } else if (user?.role === 'admin') {
    return <ProviderDashboard />;
  } else {
    return <Navigate to="/home" replace />;
  }
};

export default AdminPanel;
