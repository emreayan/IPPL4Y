import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { mockChannels } from '../mockData';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { ArrowLeft, Search, Eye, EyeOff } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

const BouquetSettings = () => {
  const navigate = useNavigate();
  const { channelVisibility, toggleChannelVisibility, isChannelVisible } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('All');

  const groups = ['All', ...new Set(mockChannels.map(ch => ch.category))];

  const filteredChannels = mockChannels.filter(channel => {
    const matchesSearch = channel.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGroup = selectedGroup === 'All' || channel.category === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  const visibleCount = mockChannels.filter(ch => isChannelVisible(ch.id)).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/home')}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Bouquet Settings</h1>
                <p className="text-sm text-muted-foreground">
                  {visibleCount} of {mockChannels.length} channels visible
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-border"
            />
          </div>
        </div>

        {/* Group Filters */}
        <div className="mb-6">
          <Tabs value={selectedGroup} onValueChange={setSelectedGroup}>
            <TabsList className="bg-card border-border">
              {groups.map(group => (
                <TabsTrigger 
                  key={group} 
                  value={group}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {group}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Channel List */}
        <div className="space-y-2">
          {filteredChannels.map(channel => (
            <Card
              key={channel.id}
              className="p-4 bg-card border-border hover:border-primary transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <img
                    src={channel.logo}
                    alt={channel.name}
                    className="w-12 h-12 rounded object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{channel.name}</h3>
                    <p className="text-sm text-muted-foreground">{channel.category}</p>
                  </div>
                  <Badge 
                    variant={isChannelVisible(channel.id) ? "default" : "secondary"}
                    className={isChannelVisible(channel.id) ? "bg-primary" : ""}
                  >
                    {isChannelVisible(channel.id) ? (
                      <><Eye className="w-3 h-3 mr-1" /> Visible</>
                    ) : (
                      <><EyeOff className="w-3 h-3 mr-1" /> Hidden</>
                    )}
                  </Badge>
                </div>
                <Switch
                  checked={isChannelVisible(channel.id)}
                  onCheckedChange={() => toggleChannelVisibility(channel.id)}
                  className="ml-4"
                />
              </div>
            </Card>
          ))}
        </div>

        {filteredChannels.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No channels found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BouquetSettings;
