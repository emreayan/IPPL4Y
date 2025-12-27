import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  Clapperboard, Search, Star, Calendar, Clock, Heart, Plus, Play, 
  ChevronLeft, ChevronRight, Loader2, Filter, Grid, List,
  TrendingUp, Bookmark, X, Tv
} from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const SeriesPage = () => {
  const navigate = useNavigate();
  const { deviceInfo, currentPlaylist } = useApp();
  
  const [categories, setCategories] = useState([]);
  const [series, setSeries] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingSeries, setLoadingSeries] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [continueWatching, setContinueWatching] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  
  const searchTimeoutRef = useRef(null);
  
  // Helper function to proxy image URLs
  const getProxiedImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('https://')) return url;
    if (url.startsWith('http://')) {
      return `${API_URL}/api/image/proxy?url=${encodeURIComponent(url)}`;
    }
    return url;
  };

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      if (!deviceInfo?.device_id) return;
      
      try {
        const response = await axios.get(`${API_URL}/api/vod/series/categories`, {
          params: { device_id: deviceInfo.device_id }
        });
        
        if (response.data.success) {
          setCategories(response.data.categories || []);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    
    fetchCategories();
  }, [deviceInfo]);

  // Fetch series
  const fetchSeries = useCallback(async (categoryId, search = '', pageNum = 1) => {
    if (!deviceInfo?.device_id) return;
    
    setLoadingSeries(true);
    try {
      const response = await axios.get(`${API_URL}/api/vod/series`, {
        params: {
          device_id: deviceInfo.device_id,
          category_id: categoryId,
          search: search || undefined,
          page: pageNum,
          limit: 50
        }
      });
      
      if (response.data.success) {
        setSeries(response.data.series || []);
        setTotalPages(response.data.pages || 1);
      } else {
        setError(response.data.message || 'Diziler yüklenemedi');
      }
    } catch (err) {
      console.error('Failed to fetch series:', err);
      setError('Diziler yüklenirken hata oluştu');
    } finally {
      setLoadingSeries(false);
      setLoading(false);
    }
  }, [deviceInfo]);

  // Fetch continue watching
  useEffect(() => {
    const fetchContinueWatching = async () => {
      if (!deviceInfo?.device_id) return;
      
      try {
        const response = await axios.get(`${API_URL}/api/user/continue-watching`, {
          params: { device_id: deviceInfo.device_id }
        });
        
        if (response.data.success) {
          const seriesItems = response.data.items.filter(i => i.item_type === 'series_episode');
          setContinueWatching(seriesItems);
        }
      } catch (err) {
        console.error('Failed to fetch continue watching:', err);
      }
    };
    
    fetchContinueWatching();
  }, [deviceInfo]);

  // Fetch watchlist
  useEffect(() => {
    const fetchWatchlist = async () => {
      if (!deviceInfo?.device_id) return;
      
      try {
        const response = await axios.get(`${API_URL}/api/user/watchlist`, {
          params: { device_id: deviceInfo.device_id }
        });
        
        if (response.data.success) {
          setWatchlist(response.data.series || []);
        }
      } catch (err) {
        console.error('Failed to fetch watchlist:', err);
      }
    };
    
    fetchWatchlist();
  }, [deviceInfo]);

  // Initial load and category/search changes
  useEffect(() => {
    if (deviceInfo?.device_id) {
      fetchSeries(selectedCategory, searchQuery, page);
    }
  }, [deviceInfo, selectedCategory, page, fetchSeries]);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      if (deviceInfo?.device_id) {
        setPage(1);
        fetchSeries(selectedCategory, searchQuery, 1);
      }
    }, 500);
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handleSeriesClick = (seriesItem) => {
    navigate(`/series/${seriesItem.id}`);
  };

  const isInWatchlist = (seriesId) => {
    return watchlist.some(s => s.id === seriesId);
  };

  const toggleWatchlist = async (e, seriesItem) => {
    e.stopPropagation();
    
    try {
      if (isInWatchlist(seriesItem.id)) {
        await axios.delete(`${API_URL}/api/user/watchlist/remove`, {
          params: {
            device_id: deviceInfo.device_id,
            item_id: seriesItem.id,
            item_type: 'series'
          }
        });
        setWatchlist(prev => prev.filter(s => s.id !== seriesItem.id));
      } else {
        await axios.post(`${API_URL}/api/user/watchlist/add`, {
          item_id: seriesItem.id,
          item_type: 'series',
          name: seriesItem.name,
          poster: seriesItem.poster,
          year: seriesItem.year
        }, {
          params: { device_id: deviceInfo.device_id }
        });
        setWatchlist(prev => [...prev, { id: seriesItem.id, name: seriesItem.name, poster: seriesItem.poster, year: seriesItem.year }]);
      }
    } catch (err) {
      console.error('Failed to toggle watchlist:', err);
    }
  };

  // Series Card Component
  const SeriesCard = ({ seriesItem, size = 'normal' }) => (
    <div 
      className={`group relative cursor-pointer transition-all duration-300 hover:scale-105 hover:z-10
        ${size === 'large' ? 'w-48' : 'w-36 sm:w-40'}`}
      onClick={() => handleSeriesClick(seriesItem)}
    >
      {/* Poster */}
      <div className={`relative rounded-lg overflow-hidden bg-gray-800 shadow-lg aspect-[2/3]`}>
        {seriesItem.poster ? (
          <img
            src={getProxiedImageUrl(seriesItem.poster)}
            alt={seriesItem.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '';
              e.target.className = 'hidden';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
            <Tv className="w-12 h-12 text-gray-600" />
          </div>
        )}
        
        {/* Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent 
          opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
          
          {/* Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center 
              transform scale-0 group-hover:scale-100 transition-transform duration-300 shadow-lg">
              <Play className="w-7 h-7 text-white ml-1" fill="white" />
            </div>
          </div>
          
          {/* Info */}
          <div className="space-y-1">
            <h3 className="text-white font-semibold text-sm line-clamp-2">{seriesItem.name}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-300">
              {seriesItem.year && <span>{seriesItem.year}</span>}
              {seriesItem.rating && (
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-400" fill="currentColor" />
                  {seriesItem.rating}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Rating Badge */}
        {seriesItem.rating && (
          <div className="absolute top-2 right-2 bg-black/70 rounded px-1.5 py-0.5 flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-400" fill="currentColor" />
            <span className="text-xs text-white font-medium">{seriesItem.rating}</span>
          </div>
        )}
        
        {/* Watchlist Button */}
        <button
          onClick={(e) => toggleWatchlist(e, seriesItem)}
          className={`absolute top-2 left-2 p-1.5 rounded-full transition-all
            ${isInWatchlist(seriesItem.id) 
              ? 'bg-purple-600 text-white' 
              : 'bg-black/50 text-white hover:bg-black/70'}`}
        >
          {isInWatchlist(seriesItem.id) ? (
            <Bookmark className="w-4 h-4" fill="currentColor" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
        </button>
      </div>
      
      {/* Title (visible always) */}
      <h3 className="mt-2 text-sm text-gray-300 font-medium line-clamp-1 group-hover:text-white transition-colors">
        {seriesItem.name}
      </h3>
      {seriesItem.year && (
        <p className="text-xs text-gray-500">{seriesItem.year}</p>
      )}
    </div>
  );

  // Continue Watching Row with Progress
  const ContinueWatchingRow = () => {
    if (continueWatching.length === 0) return null;
    
    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-blue-500" />
          Devam Et
        </h2>
        
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
          {continueWatching.map((item) => (
            <div 
              key={item.item_id}
              className="flex-shrink-0 w-64 cursor-pointer group"
              onClick={() => navigate(`/series/${item.series_id}`)}
            >
              <div className="relative rounded-lg overflow-hidden bg-gray-800">
                <div className="aspect-video">
                  {item.poster ? (
                    <img
                      src={getProxiedImageUrl(item.poster)}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                      <Tv className="w-10 h-10 text-gray-600" />
                    </div>
                  )}
                </div>
                
                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                  <div 
                    className="h-full bg-purple-600"
                    style={{ width: `${item.progress_percent || 0}%` }}
                  />
                </div>
                
                {/* Play Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 
                  transition-opacity flex items-center justify-center">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                    <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
                  </div>
                </div>
              </div>
              
              <h3 className="mt-2 text-sm text-gray-300 font-medium line-clamp-1">{item.name}</h3>
              <p className="text-xs text-gray-500">
                S{item.season_number}E{item.episode_number} • {Math.round(item.progress_percent || 0)}%
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Watchlist Row
  const WatchlistRow = () => {
    const scrollRef = useRef(null);
    
    const scroll = (direction) => {
      if (scrollRef.current) {
        const scrollAmount = direction === 'left' ? -400 : 400;
        scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    };
    
    if (watchlist.length === 0) return null;
    
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-purple-500" />
            İzleme Listem
            <span className="text-sm font-normal text-gray-500">({watchlist.length})</span>
          </h2>
          <div className="flex gap-2">
            <button 
              onClick={() => scroll('left')}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
        
        <div 
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {watchlist.map((item) => (
            <div key={item.id} className="flex-shrink-0">
              <SeriesCard seriesItem={item} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!currentPlaylist) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <Clapperboard className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Playlist Bulunamadı</h2>
          <p className="text-gray-400 mb-4">Dizi izlemek için önce bir playlist eklemeniz gerekiyor.</p>
          <button
            onClick={() => navigate('/home')}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Ana Sayfaya Git
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gray-900/95 backdrop-blur border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Title */}
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Clapperboard className="w-7 h-7 text-purple-500" />
              Diziler
            </h1>
            
            {/* Search & Controls */}
            <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:flex-none sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Dizi ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg 
                    text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="w-4 h-4 text-gray-400 hover:text-white" />
                  </button>
                )}
              </div>
              
              {/* View Toggle */}
              <div className="flex bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Category Pills */}
          <div className="mt-4 flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            <button
              onClick={() => { setSelectedCategory('all'); setPage(1); }}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                ${selectedCategory === 'all' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              Tümü
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setSelectedCategory(cat.id); setPage(1); }}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                  ${selectedCategory === cat.id 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-400">{error}</p>
          </div>
        ) : (
          <>
            {/* Continue Watching */}
            <ContinueWatchingRow />
            
            {/* Watchlist */}
            <WatchlistRow />
            
            {/* Main Series Grid */}
            {loadingSeries ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
              </div>
            ) : series.length === 0 ? (
              <div className="text-center py-20">
                <Clapperboard className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Bu kategoride dizi bulunamadı</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {series.map((seriesItem) => (
                  <SeriesCard key={seriesItem.id} seriesItem={seriesItem} />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {series.map((seriesItem) => (
                  <div 
                    key={seriesItem.id}
                    onClick={() => handleSeriesClick(seriesItem)}
                    className="flex gap-4 p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-750 transition-colors"
                  >
                    <div className="w-20 h-28 flex-shrink-0 rounded overflow-hidden bg-gray-700">
                      {seriesItem.poster ? (
                        <img
                          src={getProxiedImageUrl(seriesItem.poster)}
                          alt={seriesItem.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Tv className="w-8 h-8 text-gray-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold line-clamp-1">{seriesItem.name}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                        {seriesItem.year && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {seriesItem.year}
                          </span>
                        )}
                        {seriesItem.rating && (
                          <span className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" />
                            {seriesItem.rating}
                          </span>
                        )}
                      </div>
                      {seriesItem.plot && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{seriesItem.plot}</p>
                      )}
                    </div>
                    <button
                      onClick={(e) => toggleWatchlist(e, seriesItem)}
                      className={`self-center p-2 rounded-full transition-colors
                        ${isInWatchlist(seriesItem.id) 
                          ? 'bg-purple-600/20 text-purple-500' 
                          : 'bg-gray-700 text-gray-400 hover:text-white'}`}
                    >
                      {isInWatchlist(seriesItem.id) ? (
                        <Bookmark className="w-5 h-5" fill="currentColor" />
                      ) : (
                        <Plus className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-gray-400 px-4">
                  Sayfa {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SeriesPage;
