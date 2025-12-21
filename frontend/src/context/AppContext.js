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
  
  // Device & Playlist State
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [activePlaylist, setActivePlaylist] = useState(null);
  const [playlistsLoading, setPlaylistsLoading] = useState(false);

  // Fetch logo from API
  const fetchLogo = useCallback(async () => {
    try {
      setLogoLoading(true);
      const response = await axios.get(`${API_URL}/api/admin/logo`);
      if (response.data.has_custom_logo) {
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

  const refreshLogo = useCallback(() => {
    fetchLogo();
  }, [fetchLogo]);

  // Generate simulated Device ID (MAC-like format) for web
  const generateDeviceId = useCallback(() => {
    const stored = localStorage.getItem('ippl4yDeviceId');
    if (stored) return stored;
    
    // Generate MAC-like format: XX:XX:XX:XX:XX:XX
    const hex = () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
    const deviceId = `${hex()}:${hex()}:${hex()}:${hex()}:${hex()}:${hex()}`;
    localStorage.setItem('ippl4yDeviceId', deviceId);
    return deviceId;
  }, []);

  // Generate simulated Device Key for web
  const generateDeviceKey = useCallback(() => {
    const stored = localStorage.getItem('ippl4yDeviceKey');
    if (stored) return stored;
    
    // Generate 10-digit numeric key
    const deviceKey = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    localStorage.setItem('ippl4yDeviceKey', deviceKey);
    return deviceKey;
  }, []);

  // Get or create device credentials
  const getDeviceCredentials = useCallback(() => {
    return {
      device_id: generateDeviceId(),
      device_key: generateDeviceKey()
    };
  }, [generateDeviceId, generateDeviceKey]);

  // Register device with backend
  const registerDevice = useCallback(async (deviceId, deviceKey, platform = 'web') => {
    try {
      const response = await axios.post(`${API_URL}/api/device/register`, {
        device_id: deviceId,
        device_key: deviceKey,
        platform
      });
      
      if (response.data.success) {
        setDeviceInfo(response.data.device);
        localStorage.setItem('ippl4yDeviceInfo', JSON.stringify(response.data.device));
        return { success: true, device: response.data.device };
      }
      return { success: false, error: response.data.message };
    } catch (error) {
      console.error('Device registration failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Cihaz kaydı başarısız' 
      };
    }
  }, []);

  // Fetch playlists for device
  const fetchPlaylists = useCallback(async (deviceId) => {
    if (!deviceId) return;
    
    setPlaylistsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/device/${deviceId}/playlists`);
      const data = response.data;
      
      setPlaylists(data.playlists || []);
      setActivePlaylist(data.active_playlist || null);
      
      // If we have an active playlist, set it as the IPTV service
      if (data.active_playlist) {
        const playlist = data.active_playlist;
        const serviceData = {
          id: playlist.id,
          name: playlist.playlist_name,
          url: playlist.playlist_url,
          type: playlist.playlist_type,
          username: playlist.xtream_username,
          isActive: true
        };
        setIptvService(serviceData);
        setIptvConnected(true);
        localStorage.setItem('ippl4yIptvService', JSON.stringify(serviceData));
        
        // Also store the full playlist with password for API calls
        localStorage.setItem('ippl4yActivePlaylist', JSON.stringify(playlist));
      }
      
      return { success: true, playlists: data.playlists };
    } catch (error) {
      console.error('Failed to fetch playlists:', error);
      return { success: false, error: 'Playlistler yüklenemedi' };
    } finally {
      setPlaylistsLoading(false);
    }
  }, []);

  // Add playlist to device
  const addPlaylist = useCallback(async (deviceId, playlistData) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/device/${deviceId}/playlist`,
        playlistData
      );
      
      if (response.data.success) {
        // Store full playlist data including password in localStorage for later use
        if (playlistData.playlist_type === 'xtream' && playlistData.xtream_password) {
          localStorage.setItem('ippl4yActivePlaylistFull', JSON.stringify({
            ...response.data.playlist,
            xtream_password: playlistData.xtream_password
          }));
        }
        
        // Refresh playlists
        await fetchPlaylists(deviceId);
        return { success: true, playlist: response.data.playlist };
      }
      return { success: false, error: response.data.message };
    } catch (error) {
      console.error('Failed to add playlist:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Playlist eklenemedi' 
      };
    }
  }, [fetchPlaylists]);

  // Delete playlist
  const deletePlaylist = useCallback(async (deviceId, playlistId) => {
    try {
      const response = await axios.delete(
        `${API_URL}/api/device/${deviceId}/playlist/${playlistId}`
      );
      
      if (response.data.success) {
        await fetchPlaylists(deviceId);
        return { success: true };
      }
      return { success: false, error: response.data.message };
    } catch (error) {
      console.error('Failed to delete playlist:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Playlist silinemedi' 
      };
    }
  }, [fetchPlaylists]);

  // Switch active playlist
  const switchPlaylist = useCallback(async (deviceId, playlistId) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/device/${deviceId}/playlist/${playlistId}/active`
      );
      
      if (response.data.success) {
        await fetchPlaylists(deviceId);
        return { success: true };
      }
      return { success: false, error: response.data.message };
    } catch (error) {
      console.error('Failed to switch playlist:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Playlist değiştirilemedi' 
      };
    }
  }, [fetchPlaylists]);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('ippl4yUser');
    const storedIptvService = localStorage.getItem('ippl4yIptvService');
    const storedFavorites = localStorage.getItem('ippl4yFavorites');
    const storedTheme = localStorage.getItem('ippl4yTheme');
    const storedVisibility = localStorage.getItem('ippl4yChannelVisibility');
    const storedDeviceInfo = localStorage.getItem('ippl4yDeviceInfo');
    
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setIsAuthenticated(true);
      
      // If user is a customer, auto-register device and fetch playlists
      if (userData.role === 'user') {
        const initDevice = async () => {
          // Get device credentials
          const creds = getDeviceCredentials();
          
          // Register device
          const regResult = await registerDevice(creds.device_id, creds.device_key, 'web');
          
          if (regResult.success) {
            // Fetch playlists for this device
            await fetchPlaylists(creds.device_id);
          }
        };
        
        initDevice();
      }
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
  }, [fetchLogo, fetchPlaylists, getDeviceCredentials, registerDevice]);

  const applyTheme = (themeName) => {
    document.documentElement.setAttribute('data-theme', themeName);
  };

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('ippl4yTheme', newTheme);
    applyTheme(newTheme);
  };

  // Step 1: Login to IPPL4Y application
  const loginToApp = async (username, password) => {
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
      
      // Auto-register device and fetch playlists for customer
      try {
        const creds = getDeviceCredentials();
        const regResult = await registerDevice(creds.device_id, creds.device_key, 'web');
        if (regResult.success) {
          await fetchPlaylists(creds.device_id);
        }
      } catch (err) {
        console.error('Failed to init device:', err);
      }
      
      return { success: true, role: 'user', requiresIptvSetup: true };
    }

    return { success: false, error: 'Invalid IPPL4Y credentials' };
  };

  // Step 2: Connect to IPTV Service (legacy - kept for backward compatibility)
  const connectToIptvService = (m3uUrl, username, password) => {
    if (!user || user.role !== 'user') {
      return { success: false, error: 'Only customers can connect to IPTV service' };
    }

    const iptvCreds = iptvServiceCredentials[user.username];
    
    if (iptvCreds) {
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
    setPlaylists([]);
    setActivePlaylist(null);
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
    return channelVisibility[channelId] !== false;
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
        refreshLogo,
        // Device & Playlist
        deviceInfo,
        playlists,
        activePlaylist,
        playlistsLoading,
        getDeviceCredentials,
        registerDevice,
        fetchPlaylists,
        addPlaylist,
        deletePlaylist,
        switchPlaylist
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
