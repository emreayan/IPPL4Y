import React from 'react';
import { useApp } from '../context/AppContext';
import { Card } from './ui/card';
import { Heart, Play, Tv, Film, TvMinimal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

const Favorites = () => {
  const { favorites, toggleFavorite } = useApp();
  const navigate = useNavigate();

  const handlePlay = (item, type) => {
    navigate('/player', { state: { content: item, type } });
  };

  const EmptyState = ({ type }) => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Heart className="w-16 h-16 text-slate-600 mb-4" />
      <h3 className="text-xl font-semibold text-slate-300 mb-2">No {type} favorites yet</h3>
      <p className="text-slate-500">Start adding your favorite {type} to see them here</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">My Favorites</h2>
      
      <Tabs defaultValue="channels" className="w-full">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="channels" className="data-[state=active]:bg-purple-600">
            <Tv className="w-4 h-4 mr-2" />
            Channels ({favorites.channels.length})
          </TabsTrigger>
          <TabsTrigger value="movies" className="data-[state=active]:bg-purple-600">
            <Film className="w-4 h-4 mr-2" />
            Movies ({favorites.movies.length})
          </TabsTrigger>
          <TabsTrigger value="series" className="data-[state=active]:bg-purple-600">
            <TvMinimal className="w-4 h-4 mr-2" />
            Series ({favorites.series.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="channels" className="mt-6">
          {favorites.channels.length === 0 ? (
            <EmptyState type="channel" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {favorites.channels.map((channel) => (
                <Card
                  key={channel.id}
                  className="bg-slate-800/50 border-slate-700 hover:border-purple-500 transition-all duration-300 overflow-hidden group cursor-pointer"
                  onClick={() => handlePlay(channel, 'channel')}
                >
                  <div className="relative aspect-video bg-slate-900">
                    <img src={channel.logo} alt={channel.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center">
                        <Play className="w-8 h-8 text-white" fill="white" />
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(channel, 'channel');
                      }}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-slate-900/80 flex items-center justify-center hover:bg-slate-800 transition-all duration-200"
                    >
                      <Heart className="w-4 h-4 fill-pink-500 text-pink-500" />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-white mb-2">{channel.name}</h3>
                    <p className="text-sm text-slate-400">{channel.category}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="movies" className="mt-6">
          {favorites.movies.length === 0 ? (
            <EmptyState type="movie" />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {favorites.movies.map((movie) => (
                <Card
                  key={movie.id}
                  className="bg-slate-800/50 border-slate-700 hover:border-purple-500 transition-all duration-300 overflow-hidden group cursor-pointer"
                  onClick={() => handlePlay(movie, 'movie')}
                >
                  <div className="relative aspect-[2/3] bg-slate-900">
                    <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center">
                        <Play className="w-8 h-8 text-white" fill="white" />
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(movie, 'movie');
                      }}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-slate-900/80 flex items-center justify-center hover:bg-slate-800 transition-all duration-200 z-10"
                    >
                      <Heart className="w-4 h-4 fill-pink-500 text-pink-500" />
                    </button>
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-white text-sm mb-1 line-clamp-1">{movie.title}</h3>
                    <p className="text-xs text-slate-400">{movie.year}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="series" className="mt-6">
          {favorites.series.length === 0 ? (
            <EmptyState type="series" />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {favorites.series.map((series) => (
                <Card
                  key={series.id}
                  className="bg-slate-800/50 border-slate-700 hover:border-purple-500 transition-all duration-300 overflow-hidden group cursor-pointer"
                  onClick={() => handlePlay(series, 'series')}
                >
                  <div className="relative aspect-[2/3] bg-slate-900">
                    <img src={series.poster} alt={series.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center">
                        <Play className="w-8 h-8 text-white" fill="white" />
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(series, 'series');
                      }}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-slate-900/80 flex items-center justify-center hover:bg-slate-800 transition-all duration-200 z-10"
                    >
                      <Heart className="w-4 h-4 fill-pink-500 text-pink-500" />
                    </button>
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-white text-sm mb-1 line-clamp-1">{series.title}</h3>
                    <p className="text-xs text-slate-400">{series.seasons} Seasons</p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Favorites;
