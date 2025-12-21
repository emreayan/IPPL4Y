import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { liveCategories, seriesCategories, movieCategories } from '../mockData';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { ArrowLeft, Lock, User, CheckCircle2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

const BouquetSettings = () => {
  const navigate = useNavigate();
  const { user, iptvService, channelVisibility, toggleChannelVisibility } = useApp();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleAuth = (e) => {
    e.preventDefault();
    setError('');

    if (!iptvService) {
      setError('IPTV servisi bağlı değil');
      return;
    }

    // Verify IPTV credentials
    if (username === iptvService.username && password === iptvService.password) {
      setIsAuthenticated(true);
    } else {
      setError('Geçersiz IPTV kullanıcı adı veya şifre');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card border-border p-6">
          <div className="mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/home')}
              className="mb-4 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Geri
            </Button>
            <h2 className="text-2xl font-bold text-foreground mb-2">User Settings Portal</h2>
            <p className="text-sm text-muted-foreground">
              Kanal görünürlük ayarlarını değiştirmek için IPTV kimlik bilgilerinizle giriş yapın
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4 bg-destructive/10 border-destructive/50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="iptv-username" className="text-foreground">IPTV Kullanıcı Adı</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="iptv-username"
                  type="text"
                  placeholder="IPTV kullanıcı adı"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 bg-secondary/50 border-border"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="iptv-password" className="text-foreground">IPTV Şifre</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="iptv-password"
                  type="password"
                  placeholder="IPTV şifre"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-secondary/50 border-border"
                  required
                />
              </div>
            </div>

            {iptvService && (
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg text-sm">
                <p className="text-foreground">
                  <strong>Test Bilgileri:</strong><br/>
                  Kullanıcı: {iptvService.username}<br/>
                  Şifre: {iptvService.password}
                </p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
            >
              Giriş Yap
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  // All categories combined
  const allCategories = [
    ...liveCategories.map(cat => ({ ...cat, type: 'live' })),
    ...seriesCategories.map(cat => ({ ...cat, type: 'series' })),
    ...movieCategories.map(cat => ({ ...cat, type: 'movies' }))
  ];

  const currentCategory = selectedCategory || allCategories[0];
  const items = currentCategory.type === 'live' 
    ? currentCategory.channels 
    : currentCategory.type === 'series'
    ? currentCategory.series
    : currentCategory.movies;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/home')}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">User Settings Portal</h1>
                <p className="text-sm text-muted-foreground">Kanal ve içerik görünürlük ayarları</p>
              </div>
            </div>
            <Alert className="bg-green-500/10 border-green-500/20 py-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-500 text-sm">
                {user?.username} - Giriş başarılı
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Categories */}
          <div className="col-span-3">
            <Card className="bg-card border-border p-4">
              <h2 className="font-semibold text-foreground mb-4">Categories</h2>
              <div className="space-y-2">
                {allCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      currentCategory.id === category.id
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-secondary'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{category.name}</span>
                      <span className="text-xs opacity-70">
                        ({category.type === 'live' ? 'Canlı' : category.type === 'series' ? 'Dizi' : 'Film'})
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Content - Category Details */}
          <div className="col-span-9">
            <Card className="bg-card border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground">{currentCategory.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {items?.length || 0} {currentCategory.type === 'live' ? 'kanal' : 'içerik'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Kategori Görünürlüğü:</span>
                  <Switch checked={currentCategory.visible !== false} />
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.logo || item.poster}
                        alt={item.name || item.title}
                        className="w-12 h-12 rounded object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-foreground">{item.name || item.title}</h3>
                        {item.epg && (
                          <p className="text-xs text-muted-foreground">
                            {item.epg.current.title}
                          </p>
                        )}
                        {item.imdb && (
                          <p className="text-xs text-accent">
                            ⭐ {item.imdb} IMDB
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`text-sm ${
                        channelVisibility[item.id] !== false ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {channelVisibility[item.id] !== false ? 'Visible' : 'Not Visible'}
                      </span>
                      <Switch
                        checked={channelVisibility[item.id] !== false}
                        onCheckedChange={() => toggleChannelVisibility(item.id)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BouquetSettings;
