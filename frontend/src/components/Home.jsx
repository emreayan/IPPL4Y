import React from 'react';
import Navigation from './Navigation';
import LiveTV from './LiveTV';
import Favorites from './Favorites';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from './ui/button';

const Home = () => {
  const { currentTab, user, iptvConnected } = useApp();
  const navigate = useNavigate();

  // If user is a customer and hasn't connected IPTV service yet
  const showIptvWarning = user?.role === 'user' && !iptvConnected;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        {showIptvWarning && (
          <Alert className="mb-6 bg-accent/10 border-accent/50">
            <AlertCircle className="h-4 w-4 text-accent" />
            <AlertDescription className="flex items-center justify-between">
              <span className="text-foreground">
                IPTV servisi bağlı değil. Kanalları izleyebilmek için IPTV provider'ınızdan aldığınız bilgileri ekleyin.
              </span>
              <Button
                onClick={() => navigate('/iptv-setup')}
                className="ml-4 bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                IPTV Ekle
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {currentTab === 'live' && <LiveTV />}
        {currentTab === 'favorites' && <Favorites />}
      </div>
    </div>
  );
};

export default Home;
