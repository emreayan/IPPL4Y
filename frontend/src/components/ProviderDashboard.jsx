import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ippl4yUsers, iptvServiceCredentials } from '../authData';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { ArrowLeft, Users, Upload, Search, Plus, Calendar, Mail, Clock, PlaySquare, FolderOpen } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle2 } from 'lucide-react';

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const { user } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [isPlaylistDialogOpen, setIsPlaylistDialogOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ 
    username: '', 
    password: '', 
    email: '',
    subscription: '12',
    m3uUrl: '',
    iptvUsername: '',
    iptvPassword: ''
  });
  const [playlistFile, setPlaylistFile] = useState(null);
  const [playlistUrl, setPlaylistUrl] = useState('');

  // Mock customers for this provider
  const providerCustomers = Object.entries(iptvServiceCredentials)
    .filter(([username, data]) => data.provider === user?.username)
    .map(([username, iptvData]) => {
      const appUser = ippl4yUsers.users.find(u => u.username === username);
      return {
        username,
        email: appUser?.email || `${username}@example.com`,
        appSubscription: appUser?.subscriptionExpiry || 'N/A',
        iptvSubscription: iptvData.subscriptionType,
        iptvExpiry: iptvData.expiryDate,
        status: 'active',
        iptvUsername: iptvData.username,
        m3uUrl: iptvData.m3uUrl
      };
    });

  const filteredCustomers = providerCustomers.filter(customer => 
    customer.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateCustomer = () => {
    // In real app, this would call API to create customer
    console.log('Creating customer:', newCustomer);
    setIsCustomerDialogOpen(false);
    // Reset form
    setNewCustomer({ 
      username: '', 
      password: '', 
      email: '',
      subscription: '12',
      m3uUrl: '',
      iptvUsername: '',
      iptvPassword: ''
    });
  };

  const handlePlaylistUpload = () => {
    if (playlistFile || playlistUrl) {
      console.log('Uploading playlist:', { file: playlistFile, url: playlistUrl });
      setIsPlaylistDialogOpen(false);
      setPlaylistFile(null);
      setPlaylistUrl('');
    }
  };

  const calculateDaysRemaining = (expiryDate) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} gün` : 'Süresi dolmuş';
  };

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
                <h1 className="text-2xl font-bold text-foreground">Provider Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  {user?.companyName || 'IPTV Service Provider'}
                </p>
              </div>
            </div>
            <Badge className="bg-accent text-accent-foreground">Provider</Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="customers" className="w-full">
          <TabsList className="bg-card border-border mb-6">
            <TabsTrigger 
              value="customers" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Users className="w-4 h-4 mr-2" />
              Müşteriler ({providerCustomers.length})
            </TabsTrigger>
            <TabsTrigger 
              value="playlists" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <PlaySquare className="w-4 h-4 mr-2" />
              Playlist Yönetimi
            </TabsTrigger>
            <TabsTrigger 
              value="stats" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <FolderOpen className="w-4 h-4 mr-2" />
              İstatistikler
            </TabsTrigger>
          </TabsList>

          {/* Customers Tab */}
          <TabsContent value="customers">
            {/* Actions Bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Müşteri ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-card border-border"
                />
              </div>
              <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Yeni Müşteri Ekle
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-foreground">Yeni Müşteri Oluştur</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      Müşteri için IPPL4Y hesabı ve IPTV servisi bilgilerini girin
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    {/* IPPL4Y App Credentials */}
                    <div className="col-span-2">
                      <h3 className="text-sm font-semibold text-foreground mb-3">IPPL4Y Uygulama Bilgileri</h3>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-foreground">Kullanıcı Adı</Label>
                      <Input
                        id="username"
                        placeholder="customer_name"
                        value={newCustomer.username}
                        onChange={(e) => setNewCustomer({...newCustomer, username: e.target.value})}
                        className="bg-secondary border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-foreground">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="customer@example.com"
                        value={newCustomer.email}
                        onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                        className="bg-secondary border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-foreground">Şifre</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Şifre"
                        value={newCustomer.password}
                        onChange={(e) => setNewCustomer({...newCustomer, password: e.target.value})}
                        className="bg-secondary border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subscription" className="text-foreground">Abonelik Süresi</Label>
                      <Select value={newCustomer.subscription} onValueChange={(value) => setNewCustomer({...newCustomer, subscription: value})}>
                        <SelectTrigger className="bg-secondary border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="6">6 Ay</SelectItem>
                          <SelectItem value="12">1 Yıl</SelectItem>
                          <SelectItem value="24">2 Yıl</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* IPTV Service Credentials */}
                    <div className="col-span-2 mt-4">
                      <h3 className="text-sm font-semibold text-foreground mb-3">IPTV Servis Bilgileri</h3>
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="m3uUrl" className="text-foreground">M3U Playlist URL</Label>
                      <Input
                        id="m3uUrl"
                        placeholder="http://yourserver.com/playlist.m3u"
                        value={newCustomer.m3uUrl}
                        onChange={(e) => setNewCustomer({...newCustomer, m3uUrl: e.target.value})}
                        className="bg-secondary border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="iptvUsername" className="text-foreground">IPTV Kullanıcı Adı</Label>
                      <Input
                        id="iptvUsername"
                        placeholder="iptv_username"
                        value={newCustomer.iptvUsername}
                        onChange={(e) => setNewCustomer({...newCustomer, iptvUsername: e.target.value})}
                        className="bg-secondary border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="iptvPassword" className="text-foreground">IPTV Şifre</Label>
                      <Input
                        id="iptvPassword"
                        type="password"
                        placeholder="IPTV şifre"
                        value={newCustomer.iptvPassword}
                        onChange={(e) => setNewCustomer({...newCustomer, iptvPassword: e.target.value})}
                        className="bg-secondary border-border"
                      />
                    </div>

                    <div className="col-span-2">
                      <Button onClick={handleCreateCustomer} className="w-full bg-primary hover:bg-primary/90">
                        Müşteri Oluştur
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Customers List */}
            <div className="space-y-3">
              {filteredCustomers.map((customer, index) => (
                <Card key={index} className="p-4 bg-card border-border hover:border-primary transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{customer.username}</h3>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Mail className="w-3 h-3" />
                          <span>{customer.email}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                          <span>IPTV User: {customer.iptvUsername}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground mb-1">IPPL4Y Abonelik</p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3 mr-1" />
                          {customer.appSubscription}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground mb-1">{customer.iptvSubscription}</p>
                        <div className="flex items-center text-xs text-accent">
                          <Clock className="w-3 h-3 mr-1" />
                          {calculateDaysRemaining(customer.iptvExpiry)}
                        </div>
                      </div>
                      <Badge className="bg-green-500/10 text-green-500 border-green-500">Aktif</Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {filteredCustomers.length === 0 && (
              <div className="text-center py-20">
                <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Henüz müşteri eklenmemiş</p>
              </div>
            )}
          </TabsContent>

          {/* Playlists Tab */}
          <TabsContent value="playlists">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Upload New Playlist */}
              <Card className="p-6 bg-card border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Yeni Playlist Yükle</h3>
                <Dialog open={isPlaylistDialogOpen} onOpenChange={setIsPlaylistDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-primary hover:bg-primary/90">
                      <Upload className="w-4 h-4 mr-2" />
                      M3U/M3U8 Dosyası Yükle
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card border-border">
                    <DialogHeader>
                      <DialogTitle className="text-foreground">Playlist Yükle</DialogTitle>
                      <DialogDescription className="text-muted-foreground">
                        M3U/M3U8 dosyası yükleyin veya URL girin
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="file" className="text-foreground">Dosya Seç</Label>
                        <Input
                          id="file"
                          type="file"
                          accept=".m3u,.m3u8"
                          onChange={(e) => setPlaylistFile(e.target.files[0])}
                          className="bg-secondary border-border"
                        />
                      </div>
                      <div className="text-center text-muted-foreground">veya</div>
                      <div className="space-y-2">
                        <Label htmlFor="url" className="text-foreground">Playlist URL</Label>
                        <Input
                          id="url"
                          placeholder="http://server.com/playlist.m3u8"
                          value={playlistUrl}
                          onChange={(e) => setPlaylistUrl(e.target.value)}
                          className="bg-secondary border-border"
                        />
                      </div>
                      <Button onClick={handlePlaylistUpload} className="w-full bg-primary hover:bg-primary/90">
                        Yükle ve Parse Et
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <p className="text-sm text-muted-foreground mt-4">
                  M3U formatı desteklenir. Yüklenen playlist otomatik olarak parse edilip kategorilere ayrılacaktır.
                </p>
              </Card>

              {/* Current Playlists */}
              <Card className="p-6 bg-card border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Mevcut Playlistler</h3>
                <div className="space-y-3">
                  <Alert className="bg-primary/10 border-primary/20">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <AlertDescription className="text-foreground">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Ana Playlist</p>
                          <p className="text-xs text-muted-foreground">250 kanal • 15 kategori</p>
                        </div>
                        <Button size="sm" variant="outline" className="border-border">
                          Düzenle
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                </div>
              </Card>
            </div>

            {/* M3U Parser Info */}
            <Card className="p-6 bg-accent/10 border-accent/20 mt-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">M3U Parser Bilgisi</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>✅ Desteklenen format: M3U, M3U8, JSON</p>
                <p>✅ Otomatik kategori tanıma (group-title)</p>
                <p>✅ Logo URL'leri otomatik parse edilir (tvg-logo)</p>
                <p>✅ EPG ID desteği (tvg-id)</p>
                <p>⚠️ Backend entegrasyonu için hazır - API endpoint: /api/playlist/upload</p>
              </div>
            </Card>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 bg-card border-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Toplam Müşteri</h3>
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <p className="text-3xl font-bold text-foreground">{providerCustomers.length}</p>
                <p className="text-xs text-muted-foreground mt-2">Aktif abonelikler</p>
              </Card>

              <Card className="p-6 bg-card border-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Aktif Kanallar</h3>
                  <PlaySquare className="w-5 h-5 text-primary" />
                </div>
                <p className="text-3xl font-bold text-foreground">250</p>
                <p className="text-xs text-muted-foreground mt-2">15 kategoride</p>
              </Card>

              <Card className="p-6 bg-card border-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Aylık Gelir</h3>
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <p className="text-3xl font-bold text-foreground">₺2,500</p>
                <p className="text-xs text-muted-foreground mt-2">Bu ay</p>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProviderDashboard;
