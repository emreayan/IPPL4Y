import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { liveCategories, seriesCategories, movieCategories } from '../mockData';
import { Tv, Heart, LogOut, Palette, Settings as SettingsIcon, Shield, Wifi, WifiOff, Play, Star } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';

const MainLayout = () => {
  const { user, theme, changeTheme, logout, iptvConnected, iptvService, toggleFavorite, isFavorite, channelVisibility } = useApp();
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState('live'); // live, series, movies, favorites
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [isSeriesDialogOpen, setIsSeriesDialogOpen] = useState(false);

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

  // Get visible categories and items
  const visibleLiveCategories = liveCategories.map(cat => ({
    ...cat,
    channels: cat.channels?.filter(ch => channelVisibility[ch.id] !== false) || []
  })).filter(cat => cat.channels.length > 0);

  const visibleSeriesCategories = seriesCategories.map(cat => ({
    ...cat,
    series: cat.series?.filter(s => channelVisibility[s.id] !== false) || []
  })).filter(cat => cat.series.length > 0);

  const visibleMovieCategories = movieCategories.map(cat => ({
    ...cat,
    movies: cat.movies?.filter(m => channelVisibility[m.id] !== false) || []
  })).filter(cat => cat.movies.length > 0);

  const currentCategories = currentSection === 'live' 
    ? visibleLiveCategories
    : currentSection === 'series'
    ? visibleSeriesCategories
    : currentSection === 'movies'
    ? visibleMovieCategories
    : [];

  const currentCategory = selectedCategory || currentCategories[0];

  const handlePlay = (item, type) => {
    navigate('/player', { state: { content: item, type } });
  };

  const handleSeriesClick = (series) => {
    setSelectedSeries(series);
    setIsSeriesDialogOpen(true);
  };

  const handleEpisodePlay = (series, season, episode) => {
    navigate('/player', { 
      state: { 
        content: { 
          ...series, 
          currentSeason: season.season, 
          currentEpisode: episode 
        }, 
        type: 'series' 
      } 
    });
  };

  // Show IPTV warning if not connected
  const showIptvWarning = user?.role === 'user' && !iptvConnected;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navigation */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
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

            {/* Section Tabs */}
            <div className="flex items-center space-x-1">
              {['live', 'series', 'movies', 'favorites'].map((section) => {
                const labels = { live: 'Canlı', series: 'Diziler', movies: 'Filmler', favorites: 'Favoriler' };
                return (
                  <button
                    key={section}
                    onClick={() => {
                      setCurrentSection(section);
                      setSelectedCategory(null);
                    }}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                      currentSection === section
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }`}
                  >
                    {labels[section]}
                  </button>
                );
              })}
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-2">
              {user?.role === 'user' && iptvService && (
                <Badge variant="outline" className="border-primary/50 text-primary">
                  {iptvService.name || iptvService.provider?.replace('provider_', '') || 'IPTV'}
                </Badge>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-secondary">
                    <Palette className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card border-border">
                  <DropdownMenuLabel className="text-foreground">Tema</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem onClick={() => changeTheme('ippl4y-prime')} className={theme === 'ippl4y-prime' ? 'bg-primary/10' : ''}>
                    IPPL4Y Prime
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => changeTheme('dark')} className={theme === 'dark' ? 'bg-primary/10' : ''}>
                    Koyu
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => changeTheme('light')} className={theme === 'light' ? 'bg-primary/10' : ''}>
                    Açık
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="ghost" size="icon" onClick={handleSettings} className="text-muted-foreground hover:text-foreground hover:bg-secondary">
                {user?.role === 'admin' || user?.role === 'superadmin' ? (
                  <Shield className="w-5 h-5" />
                ) : (
                  <SettingsIcon className="w-5 h-5" />
                )}
              </Button>

              <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-foreground hover:bg-secondary">
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* IPTV Warning */}
      {showIptvWarning && (
        <div className="container mx-auto px-4 pt-4">
          <Alert className="bg-accent/10 border-accent/50">
            <AlertCircle className="h-4 w-4 text-accent" />
            <AlertDescription className="flex items-center justify-between">
              <span className="text-foreground">
                IPTV servisi bağlı değil. Cihaz ayarlarından playlist ekleyerek kanalları izleyebilirsiniz.
              </span>
              <Button
                onClick={() => navigate('/device-setup')}
                className="ml-4 bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                Cihaz Ayarları
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Left Sidebar - Categories */}
        {currentSection !== 'favorites' && (
          <div className="w-64 border-r border-border bg-card">
            <ScrollArea className="h-[calc(100vh-4rem)]">
              <div className="p-4">
                <h2 className="font-semibold text-foreground mb-4">Kategoriler</h2>
                <div className="space-y-1">
                  {currentCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        currentCategory?.id === category.id
                          ? 'bg-primary text-primary-foreground'
                          : 'text-foreground hover:bg-secondary'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-6 py-6">
            {currentSection === 'live' && currentCategory && (
              <div className="space-y-2">
                {currentCategory.channels?.map((channel) => (
                  <Card
                    key={channel.id}
                    className="bg-card/50 border-border hover:border-primary transition-all duration-300 overflow-hidden group cursor-pointer hover:shadow-lg hover:shadow-primary/20"
                    onClick={() => handlePlay(channel, 'channel')}
                  >
                    <div className="flex items-center p-4">
                      {/* Channel Logo */}
                      <div className="relative w-16 h-16 flex-shrink-0 bg-secondary rounded-lg overflow-hidden">
                        <img 
                          src={channel.logo} 
                          alt={channel.name} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <Play className="w-6 h-6 text-primary-foreground" fill="currentColor" />
                        </div>
                      </div>

                      {/* Channel Info */}
                      <div className="flex-1 ml-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-foreground text-lg">{channel.name}</h3>
                          <div className="flex items-center space-x-2">
                            <Badge className="bg-red-600 hover:bg-red-600 text-white border-none">
                              LIVE
                            </Badge>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(channel, 'channel');
                              }}
                              className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center hover:bg-secondary transition-all duration-200"
                            >
                              <Heart
                                className={`w-4 h-4 ${
                                  isFavorite(channel.id, 'channel') ? 'fill-accent text-accent' : 'text-muted-foreground'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                        {channel.epg && (
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <span className="text-primary font-medium mr-2">Şimdi:</span>
                              <span className="text-foreground">{channel.epg.current.title}</span>
                              <span className="text-muted-foreground ml-auto text-xs">{channel.epg.current.time}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <span className="text-muted-foreground font-medium mr-2">Sonra:</span>
                              <span className="text-muted-foreground">{channel.epg.next.title}</span>
                              <span className="text-muted-foreground ml-auto text-xs">{channel.epg.next.time}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {(currentSection === 'series' || currentSection === 'movies') && (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3">
                {currentSection === 'series' && currentCategory?.series?.map((series) => (
                  <Card
                    key={series.id}
                    className="bg-card/50 border-border hover:border-primary transition-all duration-300 overflow-hidden group cursor-pointer hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1"
                    onClick={() => handleSeriesClick(series)}
                  >
                    <div className="relative aspect-[2/3] bg-secondary">
                      <img src={series.poster} alt={series.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary/50">
                            <Play className="w-6 h-6 text-primary-foreground" fill="currentColor" />
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-2">
                          <p className="text-xs text-white/90 line-clamp-2">{series.description}</p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(series, 'series');
                        }}
                        className="absolute top-1 right-1 w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 transition-all duration-200 z-10"
                      >
                        <Heart className={`w-3 h-3 ${isFavorite(series.id, 'series') ? 'fill-accent text-accent' : 'text-white'}`} />
                      </button>
                      <div className="absolute top-1 left-1 flex items-center space-x-1 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded">
                        <Star className="w-3 h-3 text-accent" fill="#facc15" />
                        <span className="text-xs text-white font-semibold">{series.imdb}</span>
                      </div>
                    </div>
                    <div className="p-2">
                      <h3 className="font-semibold text-foreground text-xs mb-1 line-clamp-1">{series.title}</h3>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>{series.year}</span>
                        <span>{series.seasons?.length} Sezon</span>
                      </div>
                    </div>
                  </Card>
                ))}

                {currentSection === 'movies' && currentCategory?.movies?.map((movie) => (
                  <Card
                    key={movie.id}
                    className="bg-card/50 border-border hover:border-primary transition-all duration-300 overflow-hidden group cursor-pointer hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1"
                    onClick={() => handlePlay(movie, 'movie')}
                  >
                    <div className="relative aspect-[2/3] bg-secondary">
                      <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary/50">
                            <Play className="w-6 h-6 text-primary-foreground" fill="currentColor" />
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-2">
                          <p className="text-xs text-white/90 line-clamp-2">{movie.description}</p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(movie, 'movie');
                        }}
                        className="absolute top-1 right-1 w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 transition-all duration-200 z-10"
                      >
                        <Heart className={`w-4 h-4 ${isFavorite(movie.id, 'movie') ? 'fill-accent text-accent' : 'text-white'}`} />
                      </button>
                      <div className="absolute top-1 left-1 flex items-center space-x-1 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded">
                        <Star className="w-3 h-3 text-accent" fill="#facc15" />
                        <span className="text-xs text-white font-semibold">{movie.imdb}</span>
                      </div>
                    </div>
                    <div className="p-2">
                      <h3 className="font-semibold text-foreground text-xs mb-1 line-clamp-1">{movie.title}</h3>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>{movie.year}</span>
                        <span>{movie.duration}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Series Episodes Dialog */}
      <Dialog open={isSeriesDialogOpen} onOpenChange={setIsSeriesDialogOpen}>
        <DialogContent className="bg-card border-border text-foreground max-w-3xl max-h-[80vh]">
          {selectedSeries && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedSeries.title}</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  {selectedSeries.description}
                </DialogDescription>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground pt-2">
                  <span>{selectedSeries.year}</span>
                  <span>•</span>
                  <span>{selectedSeries.seasons?.length} Sezon</span>
                  <span>•</span>
                  <span>{selectedSeries.genre}</span>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-accent" fill="#facc15" />
                    <span>{selectedSeries.imdb}</span>
                  </div>
                </div>
              </DialogHeader>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-6">
                  {selectedSeries.seasons?.map((season) => (
                    <div key={season.season}>
                      <h3 className="text-lg font-semibold mb-3">Sezon {season.season}</h3>
                      <div className="space-y-2">
                        {season.episodes.map((episode) => (
                          <div
                            key={episode.episode}
                            onClick={() => handleEpisodePlay(selectedSeries, season, episode)}
                            className="flex items-center justify-between p-3 bg-secondary/50 hover:bg-secondary rounded-lg cursor-pointer transition-colors duration-200 group"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 rounded bg-muted flex items-center justify-center group-hover:bg-primary transition-colors duration-200">
                                <Play className="w-5 h-5 text-foreground group-hover:text-primary-foreground" />
                              </div>
                              <div>
                                <p className="font-medium">Bölüm {episode.episode}: {episode.title}</p>
                                <p className="text-sm text-muted-foreground">{episode.duration}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MainLayout;
