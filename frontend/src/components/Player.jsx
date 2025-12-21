import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  ArrowLeft, 
  SkipBack, 
  SkipForward,
  Settings,
  Tv
} from 'lucide-react';
import { Card } from './ui/card';

const Player = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { content, type } = location.state || {};
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([70]);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState([0]);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    if (!content) {
      navigate('/home');
    }
  }, [content, navigate]);

  useEffect(() => {
    let timer;
    if (showControls) {
      timer = setTimeout(() => setShowControls(false), 3000);
    }
    return () => clearTimeout(timer);
  }, [showControls]);

  // Simulate progress
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev[0] + 0.5;
          return newProgress >= 100 ? [0] : [newProgress];
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  if (!content) return null;

  const getTitle = () => {
    if (type === 'channel') return content.name;
    if (type === 'series' && content.currentEpisode) {
      return `${content.title} - S${content.currentSeason}E${content.currentEpisode.episode}: ${content.currentEpisode.title}`;
    }
    return content.title;
  };

  return (
    <div 
      className="fixed inset-0 bg-black z-50"
      onMouseMove={() => setShowControls(true)}
    >
      {/* Mock Video Player */}
      <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
        {/* Video Placeholder */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Tv className="w-32 h-32 text-slate-700" />
          {type === 'channel' && content.logo && (
            <img 
              src={content.logo} 
              alt={content.name}
              className="absolute w-48 h-48 object-contain opacity-50"
            />
          )}
        </div>

        {/* Top Bar */}
        <div 
          className={`absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/home')}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div className="flex-1 mx-6">
              <h2 className="text-xl font-bold text-white">{getTitle()}</h2>
              {type === 'channel' && content.epg && (
                <p className="text-sm text-slate-300">
                  {content.epg.current.title} • {content.epg.current.time}
                </p>
              )}
              {type !== 'channel' && (
                <p className="text-sm text-slate-300">
                  {content.genre} • {content.year}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
            >
              <Settings className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Center Play/Pause Button */}
        {!isPlaying && (
          <button
            onClick={() => setIsPlaying(true)}
            className="absolute inset-0 flex items-center justify-center group"
          >
            <div className="w-24 h-24 rounded-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center transform group-hover:scale-110 transition-all duration-300">
              <Play className="w-12 h-12 text-white ml-2" fill="white" />
            </div>
          </button>
        )}

        {/* Bottom Controls */}
        <div 
          className={`absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Progress Bar */}
          <div className="mb-4">
            <Slider
              value={progress}
              onValueChange={setProgress}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-300 mt-1">
              <span>{Math.floor(progress[0])}%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsPlaying(!isPlaying)}
                className="text-white hover:bg-white/20 w-12 h-12"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </Button>
              
              {type !== 'channel' && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                  >
                    <SkipBack className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                  >
                    <SkipForward className="w-5 h-5" />
                  </Button>
                </>
              )}

              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-white hover:bg-white/20"
                >
                  {isMuted || volume[0] === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>
                <Slider
                  value={isMuted ? [0] : volume}
                  onValueChange={setVolume}
                  max={100}
                  step={1}
                  className="w-24"
                />
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
            >
              <Maximize className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Channel Info Card (for Live TV) */}
        {type === 'channel' && content.epg && showControls && (
          <Card className="absolute right-6 top-24 w-80 bg-slate-800/95 border-slate-700 p-4">
            <h3 className="font-semibold text-white mb-3">Program Guide</h3>
            <div className="space-y-3">
              <div className="pb-3 border-b border-slate-700">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-purple-400">NOW PLAYING</span>
                  <span className="text-xs text-slate-400">{content.epg.current.time}</span>
                </div>
                <p className="text-sm font-medium text-white">{content.epg.current.title}</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-400">UP NEXT</span>
                  <span className="text-xs text-slate-500">{content.epg.next.time}</span>
                </div>
                <p className="text-sm text-slate-300">{content.epg.next.title}</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Player;
