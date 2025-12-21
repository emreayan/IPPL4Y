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
  const { toggleFavorite, isFavorite, isChannelVisible } = useApp();
  const navigate = useNavigate();

  // Filter channels by category and visibility
  const filteredChannels = mockChannels.filter(channel => {
    const matchesCategory = selectedCategory === 'All' || channel.category === selectedCategory;
    const isVisible = isChannelVisible(channel.id);
    return matchesCategory && isVisible;
  });

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
                ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/30'
                : 'bg-card border-border text-muted-foreground hover:bg-secondary hover:text-foreground'
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
            className="bg-card/50 border-border hover:border-primary transition-all duration-300 overflow-hidden group cursor-pointer hover:shadow-lg hover:shadow-primary/20"
            onClick={() => handlePlay(channel)}
          >
            <div className="relative aspect-video bg-secondary">
              <img
                src={channel.logo}
                alt={channel.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary/50">
                  <Play className="w-8 h-8 text-primary-foreground" fill="currentColor" />
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(channel, 'channel');
                }}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-all duration-200"
              >
                <Heart
                  className={`w-4 h-4 ${
                    isFavorite(channel.id, 'channel')
                      ? 'fill-accent text-accent'
                      : 'text-foreground'
                  }`}
                />
              </button>
              <Badge className="absolute bottom-2 left-2 bg-red-600 hover:bg-red-600 text-white border-none">
                LIVE
              </Badge>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-foreground mb-2">{channel.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">{channel.category}</p>
              {channel.epg && (
                <div className="space-y-1">
                  <div className="text-xs text-foreground">
                    <span className="text-primary">Now: </span>
                    {channel.epg.current.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span>Next: </span>
                    {channel.epg.next.title}
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {filteredChannels.length === 0 && (
        <div className="text-center py-20">
          <p className="text-muted-foreground">No visible channels in this category</p>
          <p className="text-sm text-muted-foreground mt-2">Check Bouquet Settings to manage channel visibility</p>
        </div>
      )}
    </div>
  );
};

export default LiveTV;
