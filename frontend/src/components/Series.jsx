import React, { useState } from 'react';
import { mockSeries, categories } from '../mockData';
import { useApp } from '../context/AppContext';
import { Card } from './ui/card';
import { Heart, Play, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';

const Series = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSeries, setSelectedSeries] = useState(null);
  const { toggleFavorite, isFavorite } = useApp();
  const navigate = useNavigate();

  const filteredSeries = selectedCategory === 'All'
    ? mockSeries
    : mockSeries.filter(series => series.genre.includes(selectedCategory));

  const handleSeriesClick = (series) => {
    setSelectedSeries(series);
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

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        {categories.series.map((category) => (
          <Button
            key={category}
            onClick={() => setSelectedCategory(category)}
            variant={selectedCategory === category ? 'default' : 'outline'}
            className={`whitespace-nowrap transition-all duration-200 ${
              selectedCategory === category
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Series Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredSeries.map((series) => (
          <Card
            key={series.id}
            className="bg-slate-800/50 border-slate-700 hover:border-purple-500 transition-all duration-300 overflow-hidden group cursor-pointer"
            onClick={() => handleSeriesClick(series)}
          >
            <div className="relative aspect-[2/3] bg-slate-900">
              <img
                src={series.poster}
                alt={series.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                    <Play className="w-8 h-8 text-white" fill="white" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-xs text-slate-300 line-clamp-2">{series.description}</p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(series, 'series');
                }}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-slate-900/80 flex items-center justify-center hover:bg-slate-800 transition-all duration-200 z-10"
              >
                <Heart
                  className={`w-4 h-4 ${
                    isFavorite(series.id, 'series')
                      ? 'fill-pink-500 text-pink-500'
                      : 'text-white'
                  }`}
                />
              </button>
              <div className="absolute top-2 left-2 flex items-center space-x-1 bg-slate-900/80 px-2 py-1 rounded">
                <Star className="w-3 h-3 text-yellow-400" fill="#facc15" />
                <span className="text-xs text-white font-semibold">{series.rating}</span>
              </div>
            </div>
            <div className="p-3">
              <h3 className="font-semibold text-white text-sm mb-1 line-clamp-1">{series.title}</h3>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{series.year}</span>
                <span>{series.seasons} Seasons</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Series Episodes Dialog */}
      <Dialog open={!!selectedSeries} onOpenChange={() => setSelectedSeries(null)}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-3xl max-h-[80vh]">
          {selectedSeries && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedSeries.title}</DialogTitle>
                <DialogDescription className="text-slate-300">
                  {selectedSeries.description}
                </DialogDescription>
                <div className="flex items-center space-x-4 text-sm text-slate-400 pt-2">
                  <span>{selectedSeries.year}</span>
                  <span>•</span>
                  <span>{selectedSeries.seasons} Seasons</span>
                  <span>•</span>
                  <span>{selectedSeries.genre}</span>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400" fill="#facc15" />
                    <span>{selectedSeries.rating}</span>
                  </div>
                </div>
              </DialogHeader>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-6">
                  {selectedSeries.seasonData.map((season) => (
                    <div key={season.season}>
                      <h3 className="text-lg font-semibold mb-3">Season {season.season}</h3>
                      <div className="space-y-2">
                        {season.episodes.map((episode) => (
                          <div
                            key={episode.episode}
                            onClick={() => handleEpisodePlay(selectedSeries, season, episode)}
                            className="flex items-center justify-between p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg cursor-pointer transition-colors duration-200 group"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 rounded bg-slate-600 flex items-center justify-center group-hover:bg-purple-600 transition-colors duration-200">
                                <Play className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="font-medium">Episode {episode.episode}: {episode.title}</p>
                                <p className="text-sm text-slate-400">{episode.duration}</p>
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

export default Series;
