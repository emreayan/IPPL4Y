import React from 'react';
import Navigation from './Navigation';
import LiveTV from './LiveTV';
import Movies from './Movies';
import Series from './Series';
import Favorites from './Favorites';
import { useApp } from '../context/AppContext';

const Home = () => {
  const { currentTab } = useApp();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        {currentTab === 'live' && <LiveTV />}
        {currentTab === 'movies' && <Movies />}
        {currentTab === 'series' && <Series />}
        {currentTab === 'favorites' && <Favorites />}
      </div>
    </div>
  );
};

export default Home;
