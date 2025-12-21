import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ippl4yUsers, iptvServiceCredentials } from '../authData';
import axios from 'axios';

const AppContext = createContext();

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [iptvConnected, setIptvConnected] = useState(false);
  const [iptvService, setIptvService] = useState(null);
  const [favorites, setFavorites] = useState({ channels: [], movies: [], series: [] });
  const [currentTab, setCurrentTab] = useState('live');
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState('ippl4y-prime');
  const [channelVisibility, setChannelVisibility] = useState({});
  const [customLogo, setCustomLogo] = useState(null);
  const [logoLoading, setLogoLoading] = useState(true);

  // Fetch logo from API
  const fetchLogo = useCallback(async () => {
    try {
      setLogoLoading(true);
      const response = await axios.get(`${API_URL}/api/admin/logo`);
      if (response.data.has_custom_logo) {
        // Add timestamp to prevent caching
        setCustomLogo(`${API_URL}/api/admin/logo/file?t=${Date.now()}`);
      } else {
        setCustomLogo(null);
      }
    } catch (error) {
      console.error('Failed to fetch logo:', error);
      setCustomLogo(null);
    } finally {
      setLogoLoading(false);
    }
  }, []);

  // Refresh logo (called after upload/delete)
  const refreshLogo = useCallback(() => {
    fetchLogo();
  }, [fetchLogo]);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('ippl4yUser');
    const storedIptvService = localStorage.getItem('ippl4yIptvService');
    const storedFavorites = localStorage.getItem('ippl4yFavorites');
    const storedTheme = localStorage.getItem('ippl4yTheme');
    const storedVisibility = localStorage.getItem('ippl4yChannelVisibility');
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }

    if (storedIptvService) {
      setIptvService(JSON.parse(storedIptvService));
      setIptvConnected(true);
    }
    
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }

    if (storedTheme) {
      setTheme(storedTheme);
      applyTheme(storedTheme);
    } else {
      applyTheme('ippl4y-prime');
    }

    if (storedVisibility) {
      setChannelVisibility(JSON.parse(storedVisibility));
    }

    // Fetch logo on app load
    fetchLogo();
  }, [fetchLogo]);

  const applyTheme = (themeName) => {
    document.documentElement.setAttribute('data-theme', themeName);
  };

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('ippl4yTheme', newTheme);
    applyTheme(newTheme);
  };

  // Step 1: Login to IPPL4Y application
  const loginToApp = (username, password) => {
    // Check superadmin
    if (username === ippl4yUsers.superadmin.username && password === ippl4yUsers.superadmin.password) {
      const userData = { ...ippl4yUsers.superadmin };
      localStorage.setItem('ippl4yUser', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      return { success: true, role: 'superadmin' };
    }

    // Check admins
    const admin = ippl4yUsers.admins.find(a => a.username === username && a.password === password);
    if (admin) {
      if (admin.paymentStatus !== 'active') {
        return { success: false, error: 'Subscription expired. Please renew to continue.' };
      }
      const userData = { ...admin };
      localStorage.setItem('ippl4yUser', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      return { success: true, role: 'admin' };
    }

    // Check users
    const customer = ippl4yUsers.users.find(u => u.username === username && u.password === password);
    if (customer) {
      if (customer.paymentStatus !== 'active') {
        return { success: false, error: 'IPPL4Y subscription expired. Please renew to continue.' };
      }
      const userData = { ...customer };
      localStorage.setItem('ippl4yUser', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      return { success: true, role: 'user', requiresIptvSetup: true };
    }

    return { success: false, error: 'Invalid IPPL4Y credentials' };
  };

  // Step 2: Connect to IPTV Service (only for users)
  const connectToIptvService = (m3uUrl, username, password) => {
    if (!user || user.role !== 'user') {
      return { success: false, error: 'Only customers can connect to IPTV service' };
    }

    // Check if user has valid IPTV credentials from an admin
    const iptvCreds = iptvServiceCredentials[user.username];
    
    if (iptvCreds) {
      // Verify credentials
      if (iptvCreds.m3uUrl === m3uUrl && 
          iptvCreds.username === username && 
          iptvCreds.password === password) {
        const serviceData = { ...iptvCreds };
        localStorage.setItem('ippl4yIptvService', JSON.stringify(serviceData));
        setIptvService(serviceData);
        setIptvConnected(true);
        return { success: true };
      } else {
        return { success: false, error: 'Invalid IPTV service credentials' };
      }
    }

    return { success: false, error: 'No IPTV subscription found. Please purchase from an IPTV provider.' };
  };

  const logout = () => {
    localStorage.removeItem('ippl4yUser');
    localStorage.removeItem('ippl4yIptvService');
    setUser(null);
    setIptvService(null);
    setIsAuthenticated(false);
    setIptvConnected(false);
  };

  const toggleFavorite = (item, type) => {
    setFavorites(prev => {
      const key = type === 'channel' ? 'channels' : type === 'movie' ? 'movies' : 'series';
      const isFavorite = prev[key].some(fav => fav.id === item.id);
      
      let updated;
      if (isFavorite) {
        updated = { ...prev, [key]: prev[key].filter(fav => fav.id !== item.id) };
      } else {
        updated = { ...prev, [key]: [...prev[key], item] };
      }
      
      localStorage.setItem('ippl4yFavorites', JSON.stringify(updated));
      return updated;
    });
  };

  const isFavorite = (itemId, type) => {
    const key = type === 'channel' ? 'channels' : type === 'movie' ? 'movies' : 'series';
    return favorites[key].some(fav => fav.id === itemId);
  };

  const toggleChannelVisibility = (channelId) => {
    setChannelVisibility(prev => {
      const updated = { ...prev, [channelId]: !prev[channelId] };
      localStorage.setItem('ippl4yChannelVisibility', JSON.stringify(updated));
      return updated;
    });
  };

  const isChannelVisible = (channelId) => {
    return channelVisibility[channelId] !== false; // Default to visible
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        user,
        iptvConnected,
        iptvService,
        loginToApp,
        connectToIptvService,
        logout,
        favorites,
        toggleFavorite,
        isFavorite,
        currentTab,
        setCurrentTab,
        searchQuery,
        setSearchQuery,
        theme,
        changeTheme,
        channelVisibility,
        toggleChannelVisibility,
        isChannelVisible,
        customLogo,
        logoLoading,
        refreshLogo
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
