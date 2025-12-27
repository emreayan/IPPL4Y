import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Search, Loader2, AlertCircle } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import VideoPlayer from './VideoPlayer';

const LiveTVPage = () => {
  const navigate = useNavigate();
  const { deviceInfo, currentPlaylist } = useApp();
  const [categories, setCategories] = useState([]);
  const [channels, setChannels] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [clickTimeout, setClickTimeout] = useState(null);

  useEffect(() => {
    if (deviceInfo?.device_id) {
      loadCategories();
    }
  }, [deviceInfo]);

  useEffect(() => {
    if (deviceInfo?.device_id) {
      loadChannels();
    }
  }, [selectedCategory, deviceInfo]);

  const loadCategories = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(
        `${backendUrl}/api/channels/categories?device_id=${deviceInfo.device_id}`
      );
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.categories);
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('Kategoriler yüklenemedi');
    }
  };

  const loadChannels = async () => {
    try {
      setLoading(true);
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(
        `${backendUrl}/api/channels/by-category?device_id=${deviceInfo.device_id}&category_id=${selectedCategory}${searchQuery ? `&search=${searchQuery}` : ''}`
      );
      const data = await response.json();
      
      if (data.success) {
        setChannels(data.channels);
      } else {
        setError(data.message);
        setChannels([]);
      }
    } catch (err) {
      console.error('Error loading channels:', err);
      setError('Kanallar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadChannels();
  };

  const handleChannelClick = (channel) => {
    // Single click - play in small player
    if (clickTimeout) {
      // This is a double click
      clearTimeout(clickTimeout);
      setClickTimeout(null);
      handleChannelDoubleClick(channel);
    } else {
      // Wait to see if it's a double click
      const timeout = setTimeout(() => {
        handleChannelSingleClick(channel);
        setClickTimeout(null);
      }, 250);
      setClickTimeout(timeout);
    }
  };

  const handleChannelSingleClick = async (channel) => {
    // Single click - play in side player (small)
    setSelectedChannel(channel);
    setIsFullscreen(false);
    
    // Fetch stream URL
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(
        `${backendUrl}/api/channels/stream/${channel.id}?device_id=${deviceInfo.device_id}`
      );
      const data = await response.json();
      
      if (data.success) {
        setSelectedChannel({
          ...channel,
          stream_url: data.stream_url
        });
      }
    } catch (err) {
      console.error('Error fetching stream:', err);
    }
  };

  const handleChannelDoubleClick = async (channel) => {
    // Double click - open fullscreen player
    setIsFullscreen(true);
    
    // Fetch stream URL
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(
        `${backendUrl}/api/channels/stream/${channel.id}?device_id=${deviceInfo.device_id}`
      );
      const data = await response.json();
      
      if (data.success) {
        setSelectedChannel({
          ...channel,
          stream_url: data.stream_url
        });
      }
    } catch (err) {
      console.error('Error fetching stream:', err);
    }
  };

  const closeFullscreenPlayer = () => {
    setIsFullscreen(false);
  };

  if (!deviceInfo) {
    return (
      <div className="min-h-screen bg-[#0F171E] flex items-center justify-center">
        <Alert className="max-w-md bg-orange-500/20 border-orange-500/50">
          <AlertCircle className="h-5 w-5 text-orange-500" />
          <AlertDescription className="text-white">
            Cihaz bilgisi yükleniyor...
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F171E] text-white flex flex-col">
      {/* Top Bar */}
      <div className="bg-[#1A242F] px-6 py-4 flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center gap-4">
          <img src="/ippl4y-logo.png" alt="IPPL4Y" className="h-10" />
          <h1 className="text-xl font-bold">Canlı TV</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Kanal ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 bg-[#0F171E] border-gray-700"
            />
          </div>
          <Button onClick={() => navigate('/device-setup')} variant="ghost" size="sm">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Playlist
          </Button>
          <Button onClick={() => navigate('/home')} variant="ghost">
            Ana Sayfa
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Categories */}
        <div className="w-64 bg-[#1A242F] border-r border-gray-800 overflow-y-auto">
          <div className="p-4">
            <Input
              placeholder="Kategorilerde ara"
              className="mb-4 bg-[#0F171E] border-gray-700"
            />
            <div className="space-y-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition ${
                    selectedCategory === cat.id
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-[#0F171E] text-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{cat.name}</span>
                    <span className="text-sm opacity-75">{cat.count}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center - Channel List */}
        <div className="flex-1 bg-[#0F171E] overflow-y-auto">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">
              {categories.find((c) => c.id === selectedCategory)?.name || 'Kanallar'}
            </h2>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : error ? (
              <Alert className="bg-red-500/20 border-red-500/50">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <AlertDescription className="text-red-500">{error}</AlertDescription>
              </Alert>
            ) : channels.length === 0 ? (
              <div className="text-center text-gray-400 py-12">
                Bu kategoride kanal bulunamadı
              </div>
            ) : (
              <div className="space-y-2">
                {channels.map((channel) => (
                  <div
                    key={channel.id}
                    onClick={() => handleChannelClick(channel)}
                    className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer transition ${
                      selectedChannel?.id === channel.id
                        ? 'bg-blue-600'
                        : 'bg-[#1A242F] hover:bg-[#1A242F]/70'
                    }`}
                  >
                    {/* Channel Logo */}
                    {channel.logo ? (
                      <img
                        src={channel.logo}
                        alt={channel.name}
                        className="w-16 h-16 object-contain rounded"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-700 rounded flex items-center justify-center">
                        <span className="text-xs text-gray-400">NO LOGO</span>
                      </div>
                    )}

                    {/* Channel Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{channel.name}</h3>
                        {channel.name.includes('4K') || channel.name.includes('UHD') ? (
                          <span className="px-2 py-0.5 text-xs bg-red-600 rounded">UHD</span>
                        ) : null}
                      </div>
                      <p className="text-sm text-gray-400">Program Bulunamadı</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right - Player Area */}
        <div className="w-96 bg-black">
          {selectedChannel ? (
            selectedChannel.stream_url ? (
              <VideoPlayer
                streamUrl={selectedChannel.stream_url}
                channelName={selectedChannel.name}
                onClose={() => setSelectedChannel(null)}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-6">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
                  <p className="text-gray-400">Stream hazırlanıyor...</p>
                </div>
              </div>
            )
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-6">
                <p className="text-gray-400">Tek tıklama: Burada oynat</p>
                <p className="text-gray-400 text-sm mt-2">Çift tıklama: Tam ekran</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Player Modal */}
      {isFullscreen && selectedChannel?.stream_url && (
        <div className="fixed inset-0 z-50 bg-black">
          <VideoPlayer
            streamUrl={selectedChannel.stream_url}
            channelName={selectedChannel.name}
            onClose={closeFullscreenPlayer}
          />
        </div>
      )}
    </div>
  );
};

export default LiveTVPage;
