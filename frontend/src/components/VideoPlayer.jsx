import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  ArrowLeft, Heart, List, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { usePlatform } from '../utils/platformDetection';

const VideoPlayer = ({ 
  streamUrl, 
  channel, 
  channels = [],
  currentChannelIndex = -1,
  onClose,
  onChannelChange,
  onToggleFavorite,
  isFavorite: checkIsFavorite
}) => {
  const platform = usePlatform();
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [showChannelList, setShowChannelList] = useState(false);
  const [focusedButton, setFocusedButton] = useState(null);
  
  const channelName = channel?.name || '';
  const channelLogo = channel?.logo || '';
  const isFavorite = checkIsFavorite ? checkIsFavorite(channel?.id, 'channel') : false;

  // Navigate to previous channel
  const handlePreviousChannel = useCallback(() => {
    if (currentChannelIndex > 0 && onChannelChange) {
      const prevChannel = channels[currentChannelIndex - 1];
      onChannelChange(prevChannel, currentChannelIndex - 1);
    }
  }, [currentChannelIndex, channels, onChannelChange]);

  // Navigate to next channel
  const handleNextChannel = useCallback(() => {
    if (currentChannelIndex >= 0 && currentChannelIndex < channels.length - 1 && onChannelChange) {
      const nextChannel = channels[currentChannelIndex + 1];
      onChannelChange(nextChannel, currentChannelIndex + 1);
    }
  }, [currentChannelIndex, channels, onChannelChange]);

  // Toggle favorite
  const handleToggleFavorite = useCallback(() => {
    if (onToggleFavorite && channel) {
      onToggleFavorite(channel, 'channel');
    }
  }, [onToggleFavorite, channel]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
    setShowControls(true);
  };

  // Platform-specific control visibility timing - MUCH LONGER
  const CONTROL_HIDE_DELAY = platform.isTV ? 15000 : 10000; // 10-15 seconds instead of disappearing quickly

  // Auto-hide controls - ONLY hide when video is playing, keep visible when paused
  useEffect(() => {
    // Don't auto-hide if video is paused or on TV
    if (!showControls || platform.isTV || !isPlaying) return;
    
    controlsTimeoutRef.current = setTimeout(() => {
      // Only hide if video is still playing
      if (isPlaying) {
        setShowControls(false);
      }
    }, CONTROL_HIDE_DELAY);

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls, isPlaying, platform.isTV]);

  // Keep controls visible when video is paused
  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    }
  }, [isPlaying]);

  // Stream loading logic (CRITICAL - DO NOT MODIFY per contract)
  useEffect(() => {
    if (!streamUrl || !videoRef.current) return;

    const video = videoRef.current;
    setIsLoading(true);
    setError(null);

    console.log('🎬 Loading stream URL:', streamUrl);

    // Clean up proxy URL if it exists - extract the actual URL
    let actualStreamUrl = streamUrl;
    if (streamUrl.includes('/api/stream/proxy?url=')) {
      try {
        const urlParams = new URLSearchParams(streamUrl.split('?')[1]);
        actualStreamUrl = decodeURIComponent(urlParams.get('url') || streamUrl);
        console.log('🔗 Extracted actual URL from proxy:', actualStreamUrl);
      } catch (e) {
        console.warn('Failed to extract URL from proxy:', e);
      }
    }

    // Check if it's a .ts file - try to convert to .m3u8 if it's an Xtream stream
    if (actualStreamUrl.endsWith('.ts') && actualStreamUrl.includes('/live/')) {
      // This looks like an Xtream stream - try converting to .m3u8
      actualStreamUrl = actualStreamUrl.replace('.ts', '.m3u8');
      console.log('🔄 Converted TS to M3U8:', actualStreamUrl);
    }

    // Check if HLS is supported
    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90,
        debug: false,
        xhrSetup: (xhr, url) => {
          // Allow CORS
          xhr.withCredentials = false;
        }
      });

      hls.loadSource(actualStreamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('✅ Manifest parsed successfully');
        setIsLoading(false);
        video.play().catch((err) => {
          console.error('Auto-play failed:', err);
          setIsPlaying(false);
        });
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS Error:', data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log('🔄 Network error, retrying...');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log('🔄 Media error, recovering...');
              hls.recoverMediaError();
              break;
            default:
              console.error('❌ Fatal error, destroying HLS');
              setError(`Video yüklenirken hata: ${data.details || 'Bilinmeyen hata'}`);
              setIsLoading(false);
              hls.destroy();
              break;
          }
        }
      });

      hlsRef.current = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = actualStreamUrl;
      video.addEventListener('loadedmetadata', () => {
        console.log('✅ Native HLS loaded');
        setIsLoading(false);
        video.play().catch((err) => {
          console.error('Auto-play failed:', err);
          setIsPlaying(false);
        });
      });
      video.addEventListener('error', (e) => {
        console.error('Video error:', e);
        setError('Video yüklenirken hata oluştu');
        setIsLoading(false);
      });
    } else {
      setError('Tarayıcınız HLS video formatını desteklemiyor');
      setIsLoading(false);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [streamUrl]);

  // TV Remote Control - Keyboard Navigation - IMPROVED for all platforms
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Always show controls on key press
      if (!platform.isTV || showControls) {
      setShowControls(true);
      }
      
      switch(e.key) {
        case 'ArrowLeft':
          if (platform.isTV) {
          e.preventDefault();
          handlePreviousChannel();
          }
          break;
        case 'ArrowRight':
          if (platform.isTV) {
          e.preventDefault();
          handleNextChannel();
          }
          break;
        case 'Enter':
        case ' ':
          if (platform.isTV) {
          e.preventDefault();
          togglePlay();
          }
          break;
        case 'Backspace':
        case 'Escape':
          e.preventDefault();
          if (showChannelList) {
            setShowChannelList(false);
          } else if (onClose) {
            onClose();
          }
          break;
        case 'MediaPlayPause':
          if (platform.isTV) {
          e.preventDefault();
          togglePlay();
          }
          break;
        case 'MediaTrackPrevious':
          if (platform.isTV) {
          e.preventDefault();
          handlePreviousChannel();
          }
          break;
        case 'MediaTrackNext':
          if (platform.isTV) {
          e.preventDefault();
          handleNextChannel();
          }
          break;
        case 'KeyF': // Favorite
          if (platform.isTV) {
          e.preventDefault();
          handleToggleFavorite();
          }
          break;
        case 'KeyL': // List
          if (platform.isTV) {
          e.preventDefault();
          setShowChannelList(!showChannelList);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [platform.isTV, showChannelList, currentChannelIndex, channels, onClose, handlePreviousChannel, handleNextChannel, handleToggleFavorite, togglePlay, showControls]);

  // Touch Gestures for Mobile/Tablet
  useEffect(() => {
    if (!platform.isTouch) return;

    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    const handleTouchStart = (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
      setShowControls(true);
    };

    const handleTouchEnd = (e) => {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      handleSwipe();
    };

    const handleSwipe = () => {
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;
      const minSwipeDistance = 50;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > minSwipeDistance) {
          if (deltaX > 0) {
            // Swipe right - previous channel
            handlePreviousChannel();
          } else {
            // Swipe left - next channel
            handleNextChannel();
          }
        }
      } else {
        // Vertical swipe
        if (Math.abs(deltaY) > minSwipeDistance) {
          if (deltaY > 0) {
            // Swipe down - show controls
            setShowControls(true);
          } else {
            // Swipe up - hide controls (if not TV)
            if (!platform.isTV) {
              setShowControls(false);
            }
          }
        }
      }
    };

    const video = videoRef.current;
    if (video) {
      video.addEventListener('touchstart', handleTouchStart, { passive: true });
      video.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    return () => {
      if (video) {
        video.removeEventListener('touchstart', handleTouchStart);
        video.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [platform.isTouch, currentChannelIndex, channels]);

  // Show controls on interaction - IMPROVED with better detection
  const handleInteraction = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
  }, []);

  // Toggle controls visibility when clicking on video (not play/pause)
  const handleVideoClick = useCallback((e) => {
    // Don't toggle if clicking on controls
    if (e.target.closest('.video-controls')) {
      return;
    }
    // Toggle controls visibility
    setShowControls(prev => !prev);
    // Clear any existing timeout
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
  }, []);

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (!document.fullscreenElement) {
      videoRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  const getProxiedImageUrl = (url) => {
    if (!url) return null;
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    if (url.startsWith('https://')) return url;
    if (url.startsWith('http://')) {
      return `${backendUrl}/api/image/proxy?url=${encodeURIComponent(url)}`;
    }
    return url;
  };

  // Optimized sizes for better visibility and premium look
  const buttonSize = 'lg';
  const iconSize = platform.isTV ? 'w-7 h-7' : platform.isMobile ? 'w-5 h-5' : 'w-6 h-6'; // Optimized icon sizes
  const controlBarPadding = platform.isTV ? 'py-4 px-12' : platform.isMobile ? 'py-3 px-8' : 'py-3 px-10'; // Minimal padding for better visibility
  const buttonSizeClass = platform.isTV ? 'w-16 h-16' : platform.isMobile ? 'w-12 h-12' : 'w-14 h-14'; // Optimized button sizes
  const topBarPadding = platform.isTV ? 'py-8 px-12' : platform.isMobile ? 'py-6 px-8' : 'py-7 px-10';
  const bottomBarOffset = platform.isTV ? 'bottom-32' : platform.isMobile ? 'bottom-24' : 'bottom-28'; // Much higher for better visibility and independence from screen bottom

  return (
    <div 
      className="flex flex-col h-full bg-black relative"
      onMouseMove={handleInteraction}
      onMouseEnter={handleInteraction}
    >
      {/* Video Container */}
      <div 
        className="relative flex-1 flex items-center justify-center bg-black"
        onClick={handleVideoClick}
      >
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          playsInline
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4 mx-auto"></div>
              <p className="text-white">Yükleniyor...</p>
            </div>
          </div>
        )}

        {/* Error Overlay */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
            <div className="text-center text-white p-6">
              <p className="text-red-500 mb-2">❌ Hata</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Top Bar - Channel Info - MUCH LARGER */}
        <div 
          className={`absolute top-0 left-0 right-0 z-10 transition-all duration-300 ease-in-out video-controls ${
            showControls 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 -translate-y-full pointer-events-none'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={`bg-gradient-to-b from-[hsl(214,32%,8%)]/80 via-[hsl(214,28%,12%)]/75 to-transparent backdrop-blur-xl ${topBarPadding}`}>
            <div className="flex items-center gap-6">
              {onClose && (
                <Button
                  variant="ghost"
                  size={buttonSize}
                  onClick={onClose}
                  className={`text-white hover:bg-primary/30 hover:border-primary/60 focus:bg-primary/40 bg-card/60 backdrop-blur-md transition-all duration-200 shadow-lg hover:shadow-primary/20 hover:scale-105 active:scale-95 ${buttonSizeClass} rounded-xl border-2 border-primary/30`}
                  onFocus={() => setFocusedButton('back')}
                  onBlur={() => setFocusedButton(null)}
                >
                  <ArrowLeft className={iconSize} />
                </Button>
              )}
              
              {channelLogo && (
                <img
                  src={getProxiedImageUrl(channelLogo)}
                  alt={channelName}
                  className={`${platform.isTV ? 'w-20 h-20' : 'w-16 h-16'} object-contain rounded-xl border-2 border-white/30 shadow-lg`}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
              
              <div className="flex-1">
                <h2 className={`text-white font-bold ${platform.isTV ? 'text-4xl' : 'text-2xl'} drop-shadow-2xl`}>
                  {channelName}
                </h2>
                <p className="text-white/90 text-base font-semibold">Canlı Yayın</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Controls Bar - PREMIUM MODERN DESIGN */}
        <div 
          className={`absolute ${bottomBarOffset} left-0 right-0 z-10 transition-all duration-300 ease-in-out video-controls ${
            showControls 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-full pointer-events-none'
          }`}
          onMouseEnter={handleInteraction}
          onMouseMove={handleInteraction}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Premium Dark Navy Blue Background with app theme colors - Transparent */}
          <div className="bg-gradient-to-t from-[hsl(214,32%,8%)]/80 via-[hsl(214,28%,12%)]/75 to-[hsl(214,32%,10%)]/70 backdrop-blur-xl border-t-2 border-primary/40 shadow-[0_-4px_24px_rgba(0,0,0,0.5)] rounded-t-xl">
            <div className={controlBarPadding}>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                {/* Left Controls */}
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size={buttonSize}
                    onClick={togglePlay}
                    className={`text-white hover:bg-primary/30 hover:border-primary/60 focus:bg-primary/40 bg-card/60 backdrop-blur-md transition-all duration-200 shadow-lg hover:shadow-primary/20 hover:scale-105 active:scale-95 ${buttonSizeClass} rounded-xl border-2 border-primary/30`}
                    onFocus={() => setFocusedButton('play')}
                    onBlur={() => setFocusedButton(null)}
                  >
                    {isPlaying ? <Pause className={iconSize} /> : <Play className={iconSize} />}
                  </Button>

                  <Button
                    variant="ghost"
                    size={buttonSize}
                    onClick={toggleMute}
                    className={`text-white hover:bg-primary/30 hover:border-primary/60 focus:bg-primary/40 bg-card/60 backdrop-blur-md transition-all duration-200 shadow-lg hover:shadow-primary/20 hover:scale-105 active:scale-95 ${buttonSizeClass} rounded-xl border-2 border-primary/30`}
                    onFocus={() => setFocusedButton('mute')}
                    onBlur={() => setFocusedButton(null)}
                  >
                    {isMuted ? <VolumeX className={iconSize} /> : <Volume2 className={iconSize} />}
                  </Button>

                  {/* Previous Channel */}
                  {currentChannelIndex > 0 && (
                    <Button
                      variant="ghost"
                      size={buttonSize}
                      onClick={handlePreviousChannel}
                      className={`text-white hover:bg-primary/30 hover:border-primary/60 focus:bg-primary/40 bg-card/60 backdrop-blur-md transition-all duration-200 shadow-lg hover:shadow-primary/20 hover:scale-105 active:scale-95 ${buttonSizeClass} rounded-xl border-2 border-primary/30`}
                      title="Önceki Kanal"
                      onFocus={() => setFocusedButton('prev')}
                      onBlur={() => setFocusedButton(null)}
                    >
                      <ChevronLeft className={iconSize} />
                      {platform.isTV && <span className="ml-2 text-lg font-semibold">Önceki</span>}
                    </Button>
                  )}

                  {/* Next Channel */}
                  {currentChannelIndex >= 0 && currentChannelIndex < channels.length - 1 && (
                    <Button
                      variant="ghost"
                      size={buttonSize}
                      onClick={handleNextChannel}
                      className={`text-white hover:bg-primary/30 hover:border-primary/60 focus:bg-primary/40 bg-card/60 backdrop-blur-md transition-all duration-200 shadow-lg hover:shadow-primary/20 hover:scale-105 active:scale-95 ${buttonSizeClass} rounded-xl border-2 border-primary/30`}
                      title="Sonraki Kanal"
                      onFocus={() => setFocusedButton('next')}
                      onBlur={() => setFocusedButton(null)}
                    >
                      <ChevronRight className={iconSize} />
                      {platform.isTV && <span className="ml-2 text-lg font-semibold">Sonraki</span>}
                    </Button>
                  )}
                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-3">
                  {/* Favorite Button */}
                  {onToggleFavorite && (
                    <Button
                      variant="ghost"
                      size={buttonSize}
                      onClick={handleToggleFavorite}
                      className={`backdrop-blur-md transition-all duration-200 shadow-lg hover:scale-105 active:scale-95 ${buttonSizeClass} rounded-xl border-2 ${
                        isFavorite 
                          ? 'text-red-400 bg-red-500/30 border-red-500/60 hover:bg-red-500/40 hover:shadow-red-500/30' 
                          : 'text-white bg-card/60 border-primary/30 hover:bg-primary/30 hover:border-primary/60 hover:shadow-primary/20'
                      }`}
                      title={isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                      onFocus={() => setFocusedButton('favorite')}
                      onBlur={() => setFocusedButton(null)}
                    >
                      <Heart className={`${iconSize} ${isFavorite ? 'fill-current' : ''}`} />
                      {platform.isTV && <span className="ml-2 text-lg font-semibold">Favori</span>}
                    </Button>
                  )}

                  {/* Channel List Button */}
                  {channels.length > 0 && (
                    <Button
                      variant="ghost"
                      size={buttonSize}
                      onClick={() => setShowChannelList(!showChannelList)}
                      className={`text-white hover:bg-primary/30 hover:border-primary/60 focus:bg-primary/40 bg-card/60 backdrop-blur-md transition-all duration-200 shadow-lg hover:shadow-primary/20 hover:scale-105 active:scale-95 ${buttonSizeClass} rounded-xl border-2 border-primary/30`}
                      title="Kanal Listesi"
                      onFocus={() => setFocusedButton('list')}
                      onBlur={() => setFocusedButton(null)}
                    >
                      <List className={iconSize} />
                      {platform.isTV && <span className="ml-2 text-lg font-semibold">Liste</span>}
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size={buttonSize}
                    onClick={toggleFullscreen}
                    className={`text-white hover:bg-primary/30 hover:border-primary/60 focus:bg-primary/40 bg-card/60 backdrop-blur-md transition-all duration-200 shadow-lg hover:shadow-primary/20 hover:scale-105 active:scale-95 ${buttonSizeClass} rounded-xl border-2 border-primary/30`}
                    onFocus={() => setFocusedButton('fullscreen')}
                    onBlur={() => setFocusedButton(null)}
                  >
                    {isFullscreen ? <Minimize className={iconSize} /> : <Maximize className={iconSize} />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Channel List Sidebar - WITH CLOSE BUTTON AT BOTTOM */}
        {showChannelList && channels.length > 0 && (
          <div className={`absolute right-0 top-0 ${bottomBarOffset} bg-[hsl(214,32%,8%)]/98 backdrop-blur-xl border-l-2 border-primary/40 z-20 overflow-hidden flex flex-col transition-all duration-300 ease-in-out shadow-2xl ${
            platform.isMobile ? 'w-full' : platform.isTablet ? 'w-96' : 'w-96'
          }`}>
            <div className={`p-5 border-b border-primary/20 ${platform.isTV ? 'p-7' : ''}`}>
              <div className="flex items-center mb-3">
                <h3 className={`text-white font-bold ${platform.isTV ? 'text-2xl' : 'text-lg'}`}>
                  Kanallar
                </h3>
              </div>
              <p className="text-white/80 text-sm font-medium">
                {channels.length} kanal
              </p>
            </div>

            <ScrollArea className="flex-1">
              <div className={`space-y-2 ${platform.isMobile ? 'p-3' : 'p-5'}`}>
                {channels.map((ch, index) => (
                  <button
                    key={ch.id}
                    onClick={() => {
                      if (onChannelChange) {
                        onChannelChange(ch, index);
                        // Don't close the list - keep it open for easy channel switching
                      }
                    }}
                    className={`w-full flex items-center gap-4 p-4 rounded-lg transition-all ${
                      index === currentChannelIndex
                        ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105 border-2 border-primary'
                        : 'hover:bg-card/60 text-white/90 hover:scale-102 border-2 border-transparent hover:border-primary/30'
                    } ${platform.isTV ? 'focus:bg-primary/20 focus:border-primary/50' : ''}`}
                    onFocus={() => platform.isTV && setFocusedButton(`channel-${index}`)}
                  >
                    {ch.logo && (
                      <img
                        src={getProxiedImageUrl(ch.logo)}
                        alt={ch.name}
                        className={`${platform.isTV ? 'w-14 h-14' : 'w-12 h-12'} object-contain rounded flex-shrink-0 border border-primary/20`}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    )}
                    <div className="flex-1 text-left">
                      <p className={`font-semibold truncate ${platform.isTV ? 'text-lg' : 'text-base'}`}>
                        {ch.name}
                      </p>
                    </div>
                    {index === currentChannelIndex && (
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>

            {/* Close Button at Bottom */}
            <div className={`p-5 border-t border-primary/20 ${platform.isTV ? 'p-7' : ''}`}>
              <Button
                variant="ghost"
                size={buttonSize}
                onClick={() => setShowChannelList(false)}
                className="w-full text-white hover:bg-primary/30 focus:bg-primary/40 bg-card/60 backdrop-blur-md border-2 border-primary/30 rounded-xl transition-all duration-200 shadow-lg hover:shadow-primary/20 hover:scale-105 active:scale-95 py-4"
                onFocus={() => setFocusedButton('close-list')}
                onBlur={() => setFocusedButton(null)}
              >
                <span className={`font-semibold ${platform.isTV ? 'text-xl' : 'text-base'}`}>
                  Kapat
                </span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
