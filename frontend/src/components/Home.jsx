import React from 'react';
import Navigation from './Navigation';
import LiveTV from './LiveTV';
import Favorites from './Favorites';
import { useApp } from '../context/AppContext';

const Home = () => {
  const { currentTab } = useApp();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        {currentTab === 'live' && <LiveTV />}
        {currentTab === 'favorites' && <Favorites />}
      </div>
    </div>
  );
};

export default Home;
