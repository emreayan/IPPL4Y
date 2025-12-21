import React, { useState } from 'react';
import { mockChannels, categories } from '../mockData';
import { useApp } from '../context/AppContext';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Heart, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';

const LiveTV = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const { toggleFavorite, isFavorite } = useApp();
  const navigate = useNavigate();

  const filteredChannels = selectedCategory === 'All'
    ? mockChannels
    : mockChannels.filter(channel => channel.category === selectedCategory);

  const handlePlay = (channel) => {
    navigate('/player', { state: { content: channel, type: 'channel' } });
  };

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        {categories.liveTV.map((category) => (
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

      {/* Channel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredChannels.map((channel) => (
          <Card
            key={channel.id}
            className="bg-slate-800/50 border-slate-700 hover:border-purple-500 transition-all duration-300 overflow-hidden group cursor-pointer"
            onClick={() => handlePlay(channel)}
          >
            <div className="relative aspect-video bg-slate-900">
              <img
                src={channel.logo}
                alt={channel.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
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
                <Heart
                  className={`w-4 h-4 ${
                    isFavorite(channel.id, 'channel')
                      ? 'fill-pink-500 text-pink-500'
                      : 'text-white'
                  }`}
                />
              </button>
              <Badge className="absolute bottom-2 left-2 bg-red-600 hover:bg-red-600 text-white border-none">
                LIVE
              </Badge>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-white mb-2">{channel.name}</h3>
              <p className="text-sm text-slate-400 mb-2">{channel.category}</p>
              {channel.epg && (
                <div className="space-y-1">
                  <div className="text-xs text-slate-300">
                    <span className="text-purple-400">Now: </span>
                    {channel.epg.current.title}
                  </div>
                  <div className="text-xs text-slate-500">
                    <span className="text-slate-400">Next: </span>
                    {channel.epg.next.title}
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LiveTV;
