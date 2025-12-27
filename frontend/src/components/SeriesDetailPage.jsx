import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import VideoPlayer from './VideoPlayer';
import { 
  ArrowLeft, Star, Clock, Calendar, Play, Bookmark, Share2, 
  Info, Users, Tv, Award, Globe, Languages, ExternalLink,
  Loader2, X, Youtube, ChevronDown, ChevronUp, PlayCircle, List
} from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const SeriesDetailPage = () => {
  const { seriesId } = useParams();
  const navigate = useNavigate();
  const { deviceInfo } = useApp();
  
  const [series, setSeries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [expandedSeasons, setExpandedSeasons] = useState({});
  
  const playerRef = useRef(null);
  
  // Helper function to proxy image URLs
  const getProxiedImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('https://')) return url;
    if (url.startsWith('http://')) {
      return `${API_URL}/api/image/proxy?url=${encodeURIComponent(url)}`;
    }
    return url;
  };
  
  // Proxy stream URL
  const getProxiedStreamUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://')) {
      return `${API_URL}/api/stream/proxy?url=${encodeURIComponent(url)}`;
    }
    return url;
  };

  // Fetch series details
  useEffect(() => {
    const fetchSeriesDetail = async () => {
      if (!deviceInfo?.device_id || !seriesId) return;
      
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/api/vod/series/${seriesId}`, {
          params: { device_id: deviceInfo.device_id }
        });
        
        if (response.data.success) {
          setSeries(response.data.series);
          // Auto-expand first season
          if (response.data.series.seasons?.length > 0) {
            setSelectedSeason(response.data.series.seasons[0].season_number);
            setExpandedSeasons({ [response.data.series.seasons[0].season_number]: true });
          }
        } else {
          setError(response.data.message || 'Dizi bilgisi alınamadı');
        }
      } catch (err) {
        console.error('Failed to fetch series:', err);
        setError('Dizi bilgisi yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSeriesDetail();
  }, [deviceInfo, seriesId]);

  // Check watchlist status
  useEffect(() => {
    const checkWatchlist = async () => {
      if (!deviceInfo?.device_id) return;
      
      try {
        const response = await axios.get(`${API_URL}/api/user/watchlist`, {
          params: { device_id: deviceInfo.device_id }
        });
        
        if (response.data.success) {
          const isInList = response.data.series.some(s => s.id === seriesId);
          setInWatchlist(isInList);
        }
      } catch (err) {
        console.error('Failed to check watchlist:', err);
      }
    };
    
    checkWatchlist();
  }, [deviceInfo, seriesId]);

  const toggleWatchlist = async () => {
    if (!deviceInfo?.device_id || !series) return;
    
    try {
      if (inWatchlist) {
        await axios.delete(`${API_URL}/api/user/watchlist/remove`, {
          params: {
            device_id: deviceInfo.device_id,
            item_id: series.id,
            item_type: 'series'
          }
        });
        setInWatchlist(false);
      } else {
        await axios.post(`${API_URL}/api/user/watchlist/add`, {
          item_id: series.id,
          item_type: 'series',
          name: series.name,
          poster: series.poster,
          year: series.year
        }, {
          params: { device_id: deviceInfo.device_id }
        });
        setInWatchlist(true);
      }
    } catch (err) {
      console.error('Failed to toggle watchlist:', err);
    }
  };

  const handlePlayEpisode = (episode, seasonNum) => {
    setCurrentEpisode({ ...episode, season_number: seasonNum });
    setIsPlaying(true);
  };

  const handleClose = () => {
    setIsPlaying(false);
    setCurrentEpisode(null);
  };

  const handleTimeUpdate = async (currentTime, duration) => {
    if (!deviceInfo?.device_id || !series || !currentEpisode || !duration) return;
    
    try {
      await axios.post(`${API_URL}/api/user/continue-watching/update`, {
        item_id: currentEpisode.id,
        item_type: 'series_episode',
        name: series.name,
        poster: series.poster,
        progress_seconds: Math.floor(currentTime),
        duration_seconds: Math.floor(duration),
        series_id: series.id,
        season_number: currentEpisode.season_number,
        episode_number: currentEpisode.episode_num,
        episode_title: currentEpisode.title
      }, {
        params: { device_id: deviceInfo.device_id }
      });
    } catch (err) {
      console.error('Failed to update progress:', err);
    }
  };

  const toggleSeasonExpand = (seasonNum) => {
    setExpandedSeasons(prev => ({
      ...prev,
      [seasonNum]: !prev[seasonNum]
    }));
  };

  const openTrailer = () => {
    if (series?.youtube_trailer) {
      window.open(`https://www.youtube.com/watch?v=${series.youtube_trailer}`, '_blank');
    } else if (series?.trailer_search_url) {
      window.open(series.trailer_search_url, '_blank');
    }
  };

  // Play first episode
  const playFirstEpisode = () => {
    if (series?.seasons?.length > 0) {
      const firstSeason = series.seasons[0];
      if (firstSeason.episodes?.length > 0) {
        handlePlayEpisode(firstSeason.episodes[0], firstSeason.season_number);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
      </div>
    );
  }

  if (error || !series) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <Tv className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Dizi Bulunamadı</h2>
          <p className="text-gray-400 mb-4">{error || 'İstediğiniz dizi bulunamadı.'}</p>
          <button
            onClick={() => navigate('/series')}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Dizilere Dön
          </button>
        </div>
      </div>
    );
  }

  // Fullscreen Player
  if (isPlaying && currentEpisode) {
    return (
      <div className="fixed inset-0 bg-black z-50">
        <div className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between">
          <div className="text-white">
            <h2 className="font-semibold">{series.name}</h2>
            <p className="text-sm text-gray-400">
              S{currentEpisode.season_number}E{currentEpisode.episode_num}: {currentEpisode.title}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>
        
        <VideoPlayer
          ref={playerRef}
          url={getProxiedStreamUrl(currentEpisode.stream_url)}
          poster={getProxiedImageUrl(currentEpisode.poster || series.poster)}
          autoPlay={true}
          onTimeUpdate={handleTimeUpdate}
          className="w-full h-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section with Backdrop */}
      <div className="relative">
        {/* Backdrop Image */}
        <div className="absolute inset-0 h-[60vh]">
          {series.backdrop || series.poster ? (
            <img
              src={getProxiedImageUrl(series.backdrop || series.poster)}
              alt={series.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
          )}
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-gray-900/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/50 to-transparent" />
        </div>
        
        {/* Back Button */}
        <div className="relative z-10 p-4">
          <button
            onClick={() => navigate('/series')}
            className="flex items-center gap-2 text-white hover:text-purple-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Geri</span>
          </button>
        </div>
        
        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 pt-10 pb-6">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Poster */}
            <div className="flex-shrink-0">
              <div className="w-52 mx-auto md:mx-0 rounded-xl overflow-hidden shadow-2xl">
                {series.poster ? (
                  <img
                    src={getProxiedImageUrl(series.poster)}
                    alt={series.name}
                    className="w-full aspect-[2/3] object-cover"
                  />
                ) : (
                  <div className="w-full aspect-[2/3] bg-gray-800 flex items-center justify-center">
                    <Tv className="w-16 h-16 text-gray-600" />
                  </div>
                )}
              </div>
            </div>
            
            {/* Info */}
            <div className="flex-1 text-white">
              <h1 className="text-3xl md:text-4xl font-bold mb-3">{series.name}</h1>
              
              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300 mb-4">
                {series.year && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {series.year}
                  </span>
                )}
                {series.total_seasons > 0 && (
                  <span className="flex items-center gap-1">
                    <List className="w-4 h-4" />
                    {series.total_seasons} Sezon
                  </span>
                )}
                {series.total_episodes > 0 && (
                  <span className="flex items-center gap-1">
                    <PlayCircle className="w-4 h-4" />
                    {series.total_episodes} Bölüm
                  </span>
                )}
                {(series.rating || series.imdb_rating) && (
                  <span className="flex items-center gap-1 text-yellow-400">
                    <Star className="w-4 h-4" fill="currentColor" />
                    {series.imdb_rating || series.rating}
                  </span>
                )}
              </div>
              
              {/* Genres */}
              {series.genre && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {series.genre.split(',').map((genre, i) => (
                    <span 
                      key={i}
                      className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded-full text-sm"
                    >
                      {genre.trim()}
                    </span>
                  ))}
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mb-6">
                <button
                  onClick={playFirstEpisode}
                  className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 
                    text-white font-semibold rounded-lg transition-colors"
                >
                  <Play className="w-5 h-5" fill="white" />
                  İzlemeye Başla
                </button>
                
                {(series.youtube_trailer || series.trailer_search_url) && (
                  <button
                    onClick={openTrailer}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 
                      text-white font-semibold rounded-lg transition-colors"
                  >
                    <Youtube className="w-5 h-5 text-red-500" />
                    Fragman
                  </button>
                )}
                
                <button
                  onClick={toggleWatchlist}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg font-semibold transition-colors
                    ${inWatchlist 
                      ? 'bg-purple-600/20 text-purple-400 hover:bg-purple-600/30' 
                      : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                >
                  <Bookmark className="w-5 h-5" fill={inWatchlist ? 'currentColor' : 'none'} />
                  {inWatchlist ? 'Listede' : 'Listeye Ekle'}
                </button>
              </div>
              
              {/* Plot */}
              {series.plot && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Özet</h3>
                  <p className="text-gray-300 leading-relaxed">{series.plot}</p>
                </div>
              )}
              
              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {series.director && (
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-gray-400 block">Yönetmen</span>
                      <span className="text-white">{series.director}</span>
                    </div>
                  </div>
                )}
                
                {series.cast && (
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-gray-400 block">Oyuncular</span>
                      <span className="text-white">{series.cast}</span>
                    </div>
                  </div>
                )}
                
                {series.country && (
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-gray-400 block">Ülke</span>
                      <span className="text-white">{series.country}</span>
                    </div>
                  </div>
                )}
                
                {series.language && (
                  <div className="flex items-start gap-3">
                    <Languages className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-gray-400 block">Dil</span>
                      <span className="text-white">{series.language}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Seasons & Episodes */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-white mb-6">Sezonlar & Bölümler</h2>
        
        {series.seasons?.length > 0 ? (
          <div className="space-y-4">
            {series.seasons.map((season) => (
              <div key={season.season_number} className="bg-gray-800 rounded-xl overflow-hidden">
                {/* Season Header */}
                <button
                  onClick={() => toggleSeasonExpand(season.season_number)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-750 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold text-white">
                      Sezon {season.season_number}
                    </span>
                    <span className="text-sm text-gray-400">
                      {season.episode_count} Bölüm
                    </span>
                  </div>
                  {expandedSeasons[season.season_number] ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                
                {/* Episodes List */}
                {expandedSeasons[season.season_number] && (
                  <div className="border-t border-gray-700">
                    {season.episodes?.map((episode) => (
                      <div
                        key={episode.id}
                        onClick={() => handlePlayEpisode(episode, season.season_number)}
                        className="flex items-center gap-4 p-4 hover:bg-gray-750 cursor-pointer transition-colors border-b border-gray-700 last:border-0"
                      >
                        {/* Episode Thumbnail */}
                        <div className="relative w-32 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-700">
                          {episode.poster ? (
                            <img
                              src={getProxiedImageUrl(episode.poster)}
                              alt={episode.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <PlayCircle className="w-8 h-8 text-gray-500" />
                            </div>
                          )}
                          {/* Play Overlay */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 
                            transition-opacity flex items-center justify-center">
                            <Play className="w-8 h-8 text-white" fill="white" />
                          </div>
                        </div>
                        
                        {/* Episode Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-purple-400 font-medium">
                              E{episode.episode_num}
                            </span>
                            <h4 className="text-white font-medium line-clamp-1">
                              {episode.title}
                            </h4>
                          </div>
                          {episode.plot && (
                            <p className="text-sm text-gray-400 line-clamp-2 mt-1">
                              {episode.plot}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                            {episode.duration && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {episode.duration}
                              </span>
                            )}
                            {episode.rating && (
                              <span className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-400" />
                                {episode.rating}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Play Button */}
                        <button className="p-3 bg-purple-600/20 hover:bg-purple-600/40 rounded-full transition-colors">
                          <Play className="w-5 h-5 text-purple-400" fill="currentColor" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <Tv className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">Henüz bölüm bilgisi yok</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeriesDetailPage;
