import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Alert, AlertDescription } from './ui/alert';
import VideoPlayer from './VideoPlayer';
import { 
  Tv, 
  Play, 
  Heart, 
  Search, 
  Loader2, 
  RefreshCw, 
  AlertCircle,
  ChevronRight,
  Radio,
  Wifi
} from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const LiveTVContent = () => {
  const navigate = useNavigate();
  const { activePlaylist, iptvService, toggleFavorite, isFavorite, deviceInfo } = useApp();
  
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [currentChannelIndex, setCurrentChannelIndex] = useState(-1);
  const [streamLoading, setStreamLoading] = useState(false);

  // Fetch channels from API
  const fetchChannels = useCallback(async () => {
    if (!activePlaylist) return;

    setLoading(true);
    setError(null);

    try {
      // Use the parse endpoint which handles both M3U and Xtream
      const response = await axios.get(`${API_URL}/api/playlist/${activePlaylist.id}/parse`);

      if (response.data.success) {
        setCategories(response.data.categories || []);
        if (response.data.categories?.length > 0 && !selectedCategory) {
          // Try to find a Turkish category first
          const turkCat = response.data.categories.find(c => 
            c.name.toUpperCase().includes('TURK') || 
            c.name.toUpperCase().includes('TÜRKİYE')
          );
          setSelectedCategory(turkCat || response.data.categories[0]);
        }
      } else {
        setError(response.data.error || 'Kanallar yüklenemedi');
      }
    } catch (err) {
      console.error('Failed to fetch channels:', err);
      setError('Kanallar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [activePlaylist, selectedCategory]);

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  // Filter channels by search
  const filteredChannels = selectedCategory?.channels?.filter(ch =>
    ch.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handlePlay = (channel) => {
    navigate('/player', { 
      state: { 
        content: {
          id: channel.id,
          name: channel.name,
          logo: channel.logo,
          streamUrl: channel.stream_url
        }, 
        type: 'live' 
      } 
    });
  };

  const handleChannelChange = async (channel, index) => {
    setCurrentChannelIndex(index);
    
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(
        `${backendUrl}/api/channels/stream/${channel.id}?device_id=${deviceInfo.device_id}`
      );
      const data = await response.json();
      
      if (data.success && data.stream_url) {
        setSelectedChannel({
          ...channel,
          stream_url: data.stream_url
        });
      } else {
        setError('Stream URL alınamadı');
      }
    } catch (err) {
      console.error('Error fetching stream:', err);
      setError('Stream yüklenirken hata oluştu');
    }
  };

  const handleWatchClick = async (channel, e) => {
    e.stopPropagation();
    
    console.log('▶️ Playing channel:', channel.name);
    
    // Find channel index
    const index = filteredChannels.findIndex(ch => ch.id === channel.id);
    setCurrentChannelIndex(index);
    
    // Fetch stream URL from backend
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(
        `${backendUrl}/api/channels/stream/${channel.id}?device_id=${deviceInfo.device_id}`
      );
      const data = await response.json();
      
      if (data.success && data.stream_url) {
        console.log('Stream URL:', data.stream_url);
        
        // Open fullscreen player with stream - use URL directly
        setSelectedChannel({
          ...channel,
          stream_url: data.stream_url
        });
      } else {
        setError('Stream URL alınamadı');
      }
    } catch (err) {
      console.error('Error fetching stream:', err);
      setError('Stream yüklenirken hata oluştu');
    }
  };

  const closePlayer = () => {
    setSelectedChannel(null);
    setCurrentChannelIndex(-1);
  };

  if (!activePlaylist) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Wifi className="w-16 h-16 text-muted-foreground mb-4" />
        <p className="text-muted-foreground text-lg mb-4">IPTV playlist bağlı değil</p>
        <Button onClick={() => navigate('/device-setup')} className="bg-primary hover:bg-primary/90">
          Playlist Ekle
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-200px)]">
      {/* Categories Sidebar */}
      <div className="w-64 border-r border-border bg-card/50 flex-shrink-0">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-foreground flex items-center">
            <Radio className="w-4 h-4 mr-2 text-primary" />
            Kategoriler
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {categories.length} kategori
          </p>
        </div>
        <ScrollArea className="h-[calc(100%-80px)]">
          <div className="p-2 space-y-1">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              categories.map((cat) => (
                <button
                  key={cat.id || cat.name}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-all flex items-center justify-between ${
                    selectedCategory?.name === cat.name
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-secondary'
                  }`}
                >
                  <span className="truncate text-sm">{cat.name}</span>
                  <Badge variant="outline" className="ml-2 text-xs">
                    {cat.channels?.length || 0}
                  </Badge>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Channels List */}
      <div className="flex-1 flex flex-col">
        {/* Search Bar */}
        <div className="p-4 border-b border-border flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Kanal ara..."
              className="pl-10 bg-secondary/50 border-border"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={fetchChannels}
            disabled={loading}
            className="border-border"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <div className="text-sm text-muted-foreground">
            {selectedCategory && (
              <span>{filteredChannels.length} kanal</span>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Alert className="m-4 bg-red-500/10 border-red-500/20">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-500">{error}</AlertDescription>
          </Alert>
        )}

        {/* Channels */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">Kanallar yükleniyor...</span>
              </div>
            ) : filteredChannels.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                {searchQuery ? 'Aramanızla eşleşen kanal bulunamadı' : 'Bu kategoride kanal yok'}
              </div>
            ) : (
              filteredChannels.map((channel) => (
                <Card
                  key={channel.id}
                  className="p-3 bg-card/50 border-border hover:bg-secondary/50 transition-all cursor-pointer group"
                  onClick={() => handlePlay(channel)}
                >
                  <div className="flex items-center space-x-4">
                    {/* Channel Logo */}
                    <div className="w-12 h-12 rounded-lg bg-secondary/50 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {channel.logo ? (
                        <img
                          src={channel.logo}
                          alt={channel.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`w-full h-full items-center justify-center ${channel.logo ? 'hidden' : 'flex'}`}>
                        <Tv className="w-6 h-6 text-muted-foreground" />
                      </div>
                    </div>

                    {/* Channel Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate">{channel.name}</h4>
                      <p className="text-xs text-muted-foreground">{selectedCategory?.name}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(channel, 'channel');
                        }}
                        className={isFavorite(channel.id, 'channel') ? 'text-red-500' : 'text-muted-foreground'}
                      >
                        <Heart className={`w-4 h-4 ${isFavorite(channel.id, 'channel') ? 'fill-current' : ''}`} />
                      </Button>
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90"
                        onClick={(e) => handleWatchClick(channel, e)}
                        disabled={streamLoading}
                      >
                        {streamLoading ? (
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <Play className="w-4 h-4 mr-1" />
                        )}
                        İzle
                      </Button>
                    </div>

                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Fullscreen Player Modal */}
      {selectedChannel?.stream_url && (
        <div className="fixed inset-0 z-50 bg-black">
          <VideoPlayer
            streamUrl={selectedChannel.stream_url}
            channel={selectedChannel}
            channels={filteredChannels}
            currentChannelIndex={currentChannelIndex}
            onClose={closePlayer}
            onChannelChange={handleChannelChange}
            onToggleFavorite={toggleFavorite}
            isFavorite={isFavorite}
          />
        </div>
      )}
    </div>
  );
};

export default LiveTVContent;
