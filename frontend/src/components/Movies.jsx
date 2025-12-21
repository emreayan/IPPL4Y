import React, { useState } from 'react';
import { mockMovies, categories } from '../mockData';
import { useApp } from '../context/AppContext';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Heart, Play, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';

const Movies = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { toggleFavorite, isFavorite } = useApp();
  const navigate = useNavigate();

  const filteredMovies = selectedCategory === 'All'
    ? mockMovies
    : mockMovies.filter(movie => movie.genre.includes(selectedCategory));

  const handlePlay = (movie) => {
    navigate('/player', { state: { content: movie, type: 'movie' } });
  };

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        {categories.movies.map((category) => (
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

      {/* Movies Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredMovies.map((movie) => (
          <Card
            key={movie.id}
            className="bg-slate-800/50 border-slate-700 hover:border-purple-500 transition-all duration-300 overflow-hidden group cursor-pointer"
            onClick={() => handlePlay(movie)}
          >
            <div className="relative aspect-[2/3] bg-slate-900">
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                    <Play className="w-8 h-8 text-white" fill="white" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-xs text-slate-300 line-clamp-2">{movie.description}</p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(movie, 'movie');
                }}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-slate-900/80 flex items-center justify-center hover:bg-slate-800 transition-all duration-200 z-10"
              >
                <Heart
                  className={`w-4 h-4 ${
                    isFavorite(movie.id, 'movie')
                      ? 'fill-pink-500 text-pink-500'
                      : 'text-white'
                  }`}
                />
              </button>
              <div className="absolute top-2 left-2 flex items-center space-x-1 bg-slate-900/80 px-2 py-1 rounded">
                <Star className="w-3 h-3 text-yellow-400" fill="#facc15" />
                <span className="text-xs text-white font-semibold">{movie.rating}</span>
              </div>
            </div>
            <div className="p-3">
              <h3 className="font-semibold text-white text-sm mb-1 line-clamp-1">{movie.title}</h3>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{movie.year}</span>
                <span>{movie.duration}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Movies;
