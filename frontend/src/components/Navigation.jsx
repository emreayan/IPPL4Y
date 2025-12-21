import React from 'react';
import { useApp } from '../context/AppContext';
import { Tv, Heart, Settings as SettingsIcon, LogOut, Palette, Shield, Wifi, WifiOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const Navigation = () => {
  const { currentTab, setCurrentTab, logout, user, theme, changeTheme, iptvConnected, iptvService, customLogo } = useApp();
  const navigate = useNavigate();

  const tabs = [
    { id: 'live', label: 'Live TV', icon: Tv },
    { id: 'favorites', label: 'Favorites', icon: Heart },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSettings = () => {
    if (user?.role === 'admin') {
      navigate('/admin');
    } else if (user?.role === 'superadmin') {
      navigate('/superadmin');
    } else {
      navigate('/bouquet-settings');
    }
  };

  return (
    <div className="bg-card/95 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
              <Tv className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">IPPL4Y</h1>
              <div className="flex items-center space-x-2">
                {user?.role && (
                  <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                )}
                {user?.role === 'user' && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    {iptvConnected ? (
                      <div className="flex items-center space-x-1">
                        <Wifi className="w-3 h-3 text-green-500" />
                        <span className="text-xs text-green-500">IPTV Bağlı</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1">
                        <WifiOff className="w-3 h-3 text-amber-500" />
                        <span className="text-xs text-amber-500">IPTV Yok</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
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
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden md:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center space-x-2">
            {/* IPTV Service Info (for users) */}
            {user?.role === 'user' && iptvService && (
              <Badge variant="outline" className="border-primary/50 text-primary">
                {iptvService.provider.replace('provider_', '')}
              </Badge>
            )}

            {/* Theme Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground hover:bg-secondary"
                >
                  <Palette className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card border-border">
                <DropdownMenuLabel className="text-foreground">Tema</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem 
                  onClick={() => changeTheme('ippl4y-prime')}
                  className={theme === 'ippl4y-prime' ? 'bg-primary/10' : ''}
                >
                  IPPL4Y Prime
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => changeTheme('dark')}
                  className={theme === 'dark' ? 'bg-primary/10' : ''}
                >
                  Koyu
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => changeTheme('light')}
                  className={theme === 'light' ? 'bg-primary/10' : ''}
                >
                  Açık
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Settings - Role based */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSettings}
              className="text-muted-foreground hover:text-foreground hover:bg-secondary"
            >
              {user?.role === 'admin' || user?.role === 'superadmin' ? (
                <Shield className="w-5 h-5" />
              ) : (
                <SettingsIcon className="w-5 h-5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground hover:bg-secondary"
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
