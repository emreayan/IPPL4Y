import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import VideoPlayer from './VideoPlayer';
import { 
  ArrowLeft, Star, Clock, Calendar, Play, Bookmark, Share2, 
  Info, Users, Film, Award, Globe, Languages, ExternalLink,
  Loader2, X, Youtube, Heart
} from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const MovieDetailPage = () => {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const { deviceInfo } = useApp();
  
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [watchProgress, setWatchProgress] = useState(0);
  
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

  // Fetch movie details
  useEffect(() => {
    const fetchMovieDetail = async () => {
      if (!deviceInfo?.device_id || !movieId) return;
      
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/api/vod/movie/${movieId}`, {
          params: { device_id: deviceInfo.device_id }
        });
        
        if (response.data.success) {
          setMovie(response.data.movie);
        } else {
          setError(response.data.message || 'Film bilgisi alınamadı');
        }
      } catch (err) {
        console.error('Failed to fetch movie:', err);
        setError('Film bilgisi yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMovieDetail();
  }, [deviceInfo, movieId]);

  // Check watchlist status
  useEffect(() => {
    const checkWatchlist = async () => {
      if (!deviceInfo?.device_id) return;
      
      try {
        const response = await axios.get(`${API_URL}/api/user/watchlist`, {
          params: { device_id: deviceInfo.device_id }
        });
        
        if (response.data.success) {
          const isInList = response.data.movies.some(m => m.id === movieId);
          setInWatchlist(isInList);
        }
      } catch (err) {
        console.error('Failed to check watchlist:', err);
      }
    };
    
    checkWatchlist();
  }, [deviceInfo, movieId]);

  // Check continue watching progress
  useEffect(() => {
    const checkProgress = async () => {
      if (!deviceInfo?.device_id) return;
      
      try {
        const response = await axios.get(`${API_URL}/api/user/continue-watching`, {
          params: { device_id: deviceInfo.device_id }
        });
        
        if (response.data.success) {
          const item = response.data.items.find(i => i.item_id === movieId);
          if (item) {
            setWatchProgress(item.progress_percent || 0);
          }
        }
      } catch (err) {
        console.error('Failed to check progress:', err);
      }
    };
    
    checkProgress();
  }, [deviceInfo, movieId]);

  const toggleWatchlist = async () => {
    if (!deviceInfo?.device_id || !movie) return;
    
    try {
      if (inWatchlist) {
        await axios.delete(`${API_URL}/api/user/watchlist/remove`, {
          params: {
            device_id: deviceInfo.device_id,
            item_id: movie.id,
            item_type: 'movie'
          }
        });
        setInWatchlist(false);
      } else {
        await axios.post(`${API_URL}/api/user/watchlist/add`, {
          item_id: movie.id,
          item_type: 'movie',
          name: movie.name,
          poster: movie.poster,
          year: movie.year
        }, {
          params: { device_id: deviceInfo.device_id }
        });
        setInWatchlist(true);
      }
    } catch (err) {
      console.error('Failed to toggle watchlist:', err);
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
    setShowTrailer(false);
  };

  const handleClose = () => {
    setIsPlaying(false);
  };

  const handleTimeUpdate = async (currentTime, duration) => {
    if (!deviceInfo?.device_id || !movie || !duration) return;
    
    // Update every 30 seconds
    const progress = (currentTime / duration) * 100;
    
    try {
      await axios.post(`${API_URL}/api/user/continue-watching/update`, {
        item_id: movie.id,
        item_type: 'movie',
        name: movie.name,
        poster: movie.poster,
        progress_seconds: Math.floor(currentTime),
        duration_seconds: Math.floor(duration)
      }, {
        params: { device_id: deviceInfo.device_id }
      });
    } catch (err) {
      console.error('Failed to update progress:', err);
    }
  };

  const openTrailer = () => {
    if (movie?.youtube_trailer) {
      // If it's a YouTube video ID, open in new tab
      window.open(`https://www.youtube.com/watch?v=${movie.youtube_trailer}`, '_blank');
    } else if (movie?.trailer_search_url) {
      // If it's a search URL, open that
      window.open(movie.trailer_search_url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-red-500" />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <Film className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Film Bulunamadı</h2>
          <p className="text-gray-400 mb-4">{error || 'İstediğiniz film bulunamadı.'}</p>
          <button
            onClick={() => navigate('/movies')}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Filmlere Dön
          </button>
        </div>
      </div>
    );
  }

  // Fullscreen Player
  if (isPlaying) {
    return (
      <div className="fixed inset-0 bg-black z-50">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>
        
        <VideoPlayer
          ref={playerRef}
          url={getProxiedStreamUrl(movie.stream_url)}
          poster={getProxiedImageUrl(movie.poster)}
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
        <div className="absolute inset-0 h-[70vh]">
          {movie.backdrop || movie.poster ? (
            <img
              src={getProxiedImageUrl(movie.backdrop || movie.poster)}
              alt={movie.name}
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
            onClick={() => navigate('/movies')}
            className="flex items-center gap-2 text-white hover:text-red-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Geri</span>
          </button>
        </div>
        
        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 pt-20 pb-10">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Poster */}
            <div className="flex-shrink-0">
              <div className="w-64 mx-auto md:mx-0 rounded-xl overflow-hidden shadow-2xl">
                {movie.poster ? (
                  <img
                    src={getProxiedImageUrl(movie.poster)}
                    alt={movie.name}
                    className="w-full aspect-[2/3] object-cover"
                  />
                ) : (
                  <div className="w-full aspect-[2/3] bg-gray-800 flex items-center justify-center">
                    <Film className="w-16 h-16 text-gray-600" />
                  </div>
                )}
              </div>
            </div>
            
            {/* Info */}
            <div className="flex-1 text-white">
              <h1 className="text-3xl md:text-4xl font-bold mb-3">{movie.name}</h1>
              
              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300 mb-4">
                {movie.year && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {movie.year}
                  </span>
                )}
                {(movie.duration || movie.runtime) && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {movie.duration || movie.runtime}
                  </span>
                )}
                {(movie.rating || movie.imdb_rating) && (
                  <span className="flex items-center gap-1 text-yellow-400">
                    <Star className="w-4 h-4" fill="currentColor" />
                    {movie.imdb_rating || movie.rating}
                  </span>
                )}
                {movie.rated && (
                  <span className="px-2 py-0.5 bg-gray-700 rounded text-xs">
                    {movie.rated}
                  </span>
                )}
              </div>
              
              {/* Genres */}
              {movie.genre && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {movie.genre.split(',').map((genre, i) => (
                    <span 
                      key={i}
                      className="px-3 py-1 bg-red-600/20 text-red-400 rounded-full text-sm"
                    >
                      {genre.trim()}
                    </span>
                  ))}
                </div>
              )}
              
              {/* Progress Bar (if watched) */}
              {watchProgress > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-400 mb-1">
                    <span>Kaldığınız yer</span>
                    <span>{Math.round(watchProgress)}% izlendi</span>
                  </div>
                  <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-600 transition-all"
                      style={{ width: `${watchProgress}%` }}
                    />
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mb-6">
                <button
                  onClick={handlePlay}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 
                    text-white font-semibold rounded-lg transition-colors"
                >
                  <Play className="w-5 h-5" fill="white" />
                  {watchProgress > 0 ? 'Devam Et' : 'İzle'}
                </button>
                
                {(movie.youtube_trailer || movie.trailer_search_url) && (
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
                      ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30' 
                      : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                >
                  <Bookmark className="w-5 h-5" fill={inWatchlist ? 'currentColor' : 'none'} />
                  {inWatchlist ? 'Listede' : 'Listeye Ekle'}
                </button>
              </div>
              
              {/* Plot */}
              {movie.plot && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Özet</h3>
                  <p className="text-gray-300 leading-relaxed">{movie.plot}</p>
                </div>
              )}
              
              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {movie.director && (
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-gray-400 block">Yönetmen</span>
                      <span className="text-white">{movie.director}</span>
                    </div>
                  </div>
                )}
                
                {movie.cast && (
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-gray-400 block">Oyuncular</span>
                      <span className="text-white">{movie.cast}</span>
                    </div>
                  </div>
                )}
                
                {movie.country && (
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-gray-400 block">Ülke</span>
                      <span className="text-white">{movie.country}</span>
                    </div>
                  </div>
                )}
                
                {movie.language && (
                  <div className="flex items-start gap-3">
                    <Languages className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-gray-400 block">Dil</span>
                      <span className="text-white">{movie.language}</span>
                    </div>
                  </div>
                )}
                
                {movie.awards && (
                  <div className="flex items-start gap-3 sm:col-span-2">
                    <Award className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-gray-400 block">Ödüller</span>
                      <span className="text-white">{movie.awards}</span>
                    </div>
                  </div>
                )}
                
                {movie.imdb_id && (
                  <div className="flex items-start gap-3">
                    <ExternalLink className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-gray-400 block">IMDb</span>
                      <a 
                        href={`https://www.imdb.com/title/${movie.imdb_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-yellow-400 hover:underline"
                      >
                        {movie.imdb_id}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailPage;
