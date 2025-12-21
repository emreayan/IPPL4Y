import React from 'react';
import { useApp } from '../context/AppContext';
import { Tv, Film, TvMinimal, Heart, Search, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';

const Navigation = () => {
  const { currentTab, setCurrentTab, logout } = useApp();
  const navigate = useNavigate();

  const tabs = [
    { id: 'live', label: 'Live TV', icon: Tv },
    { id: 'movies', label: 'Movies', icon: Film },
    { id: 'series', label: 'Series', icon: TvMinimal },
    { id: 'favorites', label: 'Favorites', icon: Heart },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="bg-slate-900/95 backdrop-blur-xl border-b border-slate-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Tv className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">IPTV Smarters</h1>
          </div>

          <div className="flex items-center space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    currentTab === tab.id
                      ? 'bg-purple-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden md:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/search')}
              className="text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <Search className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <Settings className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
