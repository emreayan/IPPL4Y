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

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('iptvUser');
    const storedFavorites = localStorage.getItem('iptvFavorites');
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
    
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
  }, []);

  const login = (username, password, serverUrl) => {
    // Mock login
    const userData = { username, serverUrl };
    localStorage.setItem('iptvUser', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('iptvUser');
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
      
      localStorage.setItem('iptvFavorites', JSON.stringify(updated));
      return updated;
    });
  };

  const isFavorite = (itemId, type) => {
    const key = type === 'channel' ? 'channels' : type === 'movie' ? 'movies' : 'series';
    return favorites[key].some(fav => fav.id === itemId);
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
        setSearchQuery
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
