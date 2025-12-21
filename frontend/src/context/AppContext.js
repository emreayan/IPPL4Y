import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

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
  const [favorites, setFavorites] = useState({ channels: [], movies: [], series: [] });
  const [currentTab, setCurrentTab] = useState('live');
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState('ippl4y-prime');
  const [channelVisibility, setChannelVisibility] = useState({});

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('ippl4yUser');
    const storedFavorites = localStorage.getItem('ippl4yFavorites');
    const storedTheme = localStorage.getItem('ippl4yTheme');
    const storedVisibility = localStorage.getItem('ippl4yChannelVisibility');
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
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
  }, []);

  const applyTheme = (themeName) => {
    document.documentElement.setAttribute('data-theme', themeName);
  };

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('ippl4yTheme', newTheme);
    applyTheme(newTheme);
  };

  const login = (username, password, serverUrl, role = 'user') => {
    // Mock login with role support
    const userData = { username, serverUrl, role };
    localStorage.setItem('ippl4yUser', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('ippl4yUser');
    setUser(null);
    setIsAuthenticated(false);
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
        login,
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
        isChannelVisible
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
