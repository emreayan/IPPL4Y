import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Tv, 
  Monitor, 
  Smartphone, 
  Plus, 
  Trash2, 
  Check, 
  Copy, 
  AlertCircle, 
  Loader2,
  ArrowLeft,
  List,
  Globe,
  Key,
  User,
  Lock
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

const DeviceSetup = () => {
  const navigate = useNavigate();
  const { 
    user,
    deviceInfo,
    playlists,
    activePlaylist,
    getDeviceCredentials,
    registerDevice,
    addPlaylist,
    deletePlaylist,
    switchPlaylist,
    fetchPlaylists,
    playlistsLoading
  } = useApp();

  const [credentials, setCredentials] = useState({ device_id: '', device_key: '' });
  const [isRegistering, setIsRegistering] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState('');
  const [activeTab, setActiveTab] = useState('device');

  // New playlist form state
  const [newPlaylist, setNewPlaylist] = useState({
    playlist_name: '',
    playlist_url: '',
    playlist_type: 'm3u',
    xtream_username: '',
    xtream_password: ''
  });

  useEffect(() => {
    // Get device credentials on load
    const creds = getDeviceCredentials();
    setCredentials(creds);
  }, [getDeviceCredentials]);

  useEffect(() => {
    // Auto-register device if not registered
    if (credentials.device_id && credentials.device_key && !deviceInfo) {
      handleRegisterDevice();
    }
  }, [credentials]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRegisterDevice = async () => {
    setIsRegistering(true);
    setError('');
    
    const result = await registerDevice(
      credentials.device_id, 
      credentials.device_key, 
      'web'
    );
    
    if (result.success) {
      // Fetch playlists after registration
      await fetchPlaylists(credentials.device_id);
      setSuccess('Cihaz başarıyla kaydedildi!');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(result.error);
    }
    
    setIsRegistering(false);
  };

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(''), 2000);
  };

  const handleAddPlaylist = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newPlaylist.playlist_name.trim()) {
      setError('Playlist adı gerekli');
      return;
    }

    if (!newPlaylist.playlist_url.trim()) {
      setError('Playlist URL gerekli');
      return;
    }

    if (newPlaylist.playlist_type === 'xtream') {
      if (!newPlaylist.xtream_username.trim() || !newPlaylist.xtream_password.trim()) {
        setError('Xtream türü için kullanıcı adı ve şifre gerekli');
        return;
      }
    }

    setIsAdding(true);

    const result = await addPlaylist(credentials.device_id, {
      playlist_name: newPlaylist.playlist_name,
      playlist_url: newPlaylist.playlist_url,
      playlist_type: newPlaylist.playlist_type,
      xtream_username: newPlaylist.playlist_type === 'xtream' ? newPlaylist.xtream_username : null,
      xtream_password: newPlaylist.playlist_type === 'xtream' ? newPlaylist.xtream_password : null
    });

    if (result.success) {
      setSuccess('Playlist başarıyla eklendi!');
      setNewPlaylist({
        playlist_name: '',
        playlist_url: '',
        playlist_type: 'm3u',
        xtream_username: '',
        xtream_password: ''
      });
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(result.error);
    }

    setIsAdding(false);
  };

  const handleDeletePlaylist = async (playlistId) => {
    if (!window.confirm('Bu playlisti silmek istediğinizden emin misiniz?')) {
      return;
    }

    const result = await deletePlaylist(credentials.device_id, playlistId);
    
    if (result.success) {
      setSuccess('Playlist silindi');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(result.error);
    }
  };

  const handleSetActive = async (playlistId) => {
    const result = await switchPlaylist(credentials.device_id, playlistId);
    
    if (result.success) {
      setSuccess('Aktif playlist değiştirildi');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(result.error);
    }
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'android_tv':
      case 'webos':
      case 'tizen':
        return <Tv className="w-5 h-5" />;
      case 'android':
      case 'ios':
        return <Smartphone className="w-5 h-5" />;
      default:
        return <Monitor className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(214,32%,8%)] via-[hsl(214,28%,12%)] to-[hsl(214,32%,8%)] p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-muted-foreground hover:text-foreground mr-4"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Playlist Yönetimi</h1>
            <p className="text-sm text-muted-foreground">
              Provider'ınızdan aldığınız playlist bilgilerini buradan ekleyin
            </p>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <Alert className="mb-4 bg-red-500/10 border-red-500/20">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-500">{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-4 bg-green-500/10 border-green-500/20">
            <Check className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-500">{success}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="device" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Monitor className="w-4 h-4 mr-2" />
              Cihaz Bilgisi
            </TabsTrigger>
            <TabsTrigger value="playlists" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <List className="w-4 h-4 mr-2" />
              Playlistler ({playlists.length}/10)
            </TabsTrigger>
            <TabsTrigger value="add" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Playlist Ekle
            </TabsTrigger>
          </TabsList>

          {/* Device Info Tab */}
          <TabsContent value="device">
            <Card className="bg-card/50 border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getPlatformIcon(deviceInfo?.platform)}
                    <div>
                      <CardTitle className="text-foreground">Cihaz Kimliği</CardTitle>
                      <CardDescription>
                        Bu bilgiler cihazınıza özeldir ve değiştirilemez
                      </CardDescription>
                    </div>
                  </div>
                  {deviceInfo && (
                    <Badge className="bg-green-500/10 text-green-500 border-green-500">
                      Kayıtlı
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Device ID */}
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Device ID (MAC Adresi)</Label>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-secondary/50 p-4 rounded-lg border border-border font-mono text-lg text-foreground">
                      {credentials.device_id || 'Yükleniyor...'}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleCopy(credentials.device_id, 'device_id')}
                      className="border-border"
                    >
                      {copied === 'device_id' ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Device Key */}
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Device Key</Label>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-secondary/50 p-4 rounded-lg border border-border font-mono text-lg text-foreground">
                      {credentials.device_key || 'Yükleniyor...'}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleCopy(credentials.device_key, 'device_key')}
                      className="border-border"
                    >
                      {copied === 'device_key' ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Device Status Info */}
                {deviceInfo && (
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div>
                      <p className="text-xs text-muted-foreground">Platform</p>
                      <p className="text-foreground capitalize">{deviceInfo.platform || 'Web'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Durum</p>
                      <p className="text-foreground capitalize">{deviceInfo.status}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Kayıt Tarihi</p>
                      <p className="text-foreground">
                        {new Date(deviceInfo.created_at).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Son Görülme</p>
                      <p className="text-foreground">
                        {new Date(deviceInfo.last_seen_at).toLocaleString('tr-TR')}
                      </p>
                    </div>
                  </div>
                )}

                {!deviceInfo && (
                  <Button 
                    onClick={handleRegisterDevice}
                    disabled={isRegistering}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    {isRegistering ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Kaydediliyor...
                      </>
                    ) : (
                      'Cihazı Kaydet'
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Playlists Tab */}
          <TabsContent value="playlists">
            <Card className="bg-card/50 border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-foreground">Kayıtlı Playlistler</CardTitle>
                    <CardDescription>
                      Bu cihaza bağlı IPTV playlistleri ({playlists.length}/10)
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => setActiveTab('add')}
                    disabled={playlists.length >= 10}
                    size="sm"
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Playlist Ekle
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {playlistsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : playlists.length === 0 ? (
                  <div className="text-center py-8">
                    <List className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Henüz playlist eklenmemiş</p>
                    <Button
                      onClick={() => setActiveTab('add')}
                      variant="outline"
                      className="mt-4"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      İlk Playlistini Ekle
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {playlists.map((playlist) => (
                      <div
                        key={playlist.id}
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          playlist.is_active 
                            ? 'bg-primary/10 border-primary/50' 
                            : 'bg-secondary/30 border-border'
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            playlist.is_active ? 'bg-primary' : 'bg-secondary'
                          }`}>
                            {playlist.playlist_type === 'xtream' ? (
                              <Globe className="w-5 h-5 text-primary-foreground" />
                            ) : (
                              <List className="w-5 h-5 text-primary-foreground" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className="font-medium text-foreground">{playlist.playlist_name}</p>
                              {playlist.is_active && (
                                <Badge className="bg-green-500/10 text-green-500 border-green-500 text-xs">
                                  Aktif
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate max-w-[300px]">
                              {playlist.playlist_url}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {playlist.playlist_type === 'xtream' ? 'Xtream Codes' : 'M3U'}
                              </Badge>
                              {playlist.xtream_username && (
                                <span className="text-xs text-muted-foreground">
                                  @{playlist.xtream_username}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {!playlist.is_active && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSetActive(playlist.id)}
                              className="border-primary/50 text-primary hover:bg-primary/10"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Aktif Yap
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeletePlaylist(playlist.id)}
                            className="text-red-500 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Add Playlist Tab */}
          <TabsContent value="add">
            <Card className="bg-card/50 border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Yeni Playlist Ekle</CardTitle>
                <CardDescription>
                  M3U URL veya Xtream Codes bilgilerinizi girin
                </CardDescription>
              </CardHeader>
              <CardContent>
                {playlists.length >= 10 ? (
                  <Alert className="bg-amber-500/10 border-amber-500/20">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <AlertDescription className="text-amber-500">
                      Maksimum playlist sayısına (10) ulaştınız. Yeni eklemek için mevcut bir playlisti silin.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <form onSubmit={handleAddPlaylist} className="space-y-6">
                    {/* Playlist Type Selection */}
                    <div className="space-y-2">
                      <Label className="text-foreground">Playlist Türü</Label>
                      <Select
                        value={newPlaylist.playlist_type}
                        onValueChange={(value) => setNewPlaylist(prev => ({ ...prev, playlist_type: value }))}
                      >
                        <SelectTrigger className="bg-secondary/50 border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          <SelectItem value="m3u">
                            <div className="flex items-center space-x-2">
                              <List className="w-4 h-4" />
                              <span>M3U / M3U8 URL</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="xtream">
                            <div className="flex items-center space-x-2">
                              <Globe className="w-4 h-4" />
                              <span>Xtream Codes (DNS)</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Playlist Name */}
                    <div className="space-y-2">
                      <Label className="text-foreground">Playlist Adı</Label>
                      <Input
                        value={newPlaylist.playlist_name}
                        onChange={(e) => setNewPlaylist(prev => ({ ...prev, playlist_name: e.target.value }))}
                        placeholder="Örn: Türk Telekom IPTV"
                        className="bg-secondary/50 border-border"
                      />
                    </div>

                    {/* Playlist URL */}
                    <div className="space-y-2">
                      <Label className="text-foreground">
                        {newPlaylist.playlist_type === 'xtream' ? 'Server URL' : 'M3U URL'}
                      </Label>
                      <Input
                        value={newPlaylist.playlist_url}
                        onChange={(e) => setNewPlaylist(prev => ({ ...prev, playlist_url: e.target.value }))}
                        placeholder={
                          newPlaylist.playlist_type === 'xtream' 
                            ? 'Örn: http://tr88tr.com:8080' 
                            : 'Örn: http://example.com/playlist.m3u'
                        }
                        className="bg-secondary/50 border-border"
                      />
                      <p className="text-xs text-muted-foreground">
                        {newPlaylist.playlist_type === 'xtream' 
                          ? 'Xtream Codes server adresi (port dahil)'
                          : 'M3U veya M3U8 formatında playlist URL'}
                      </p>
                    </div>

                    {/* Xtream Credentials */}
                    {newPlaylist.playlist_type === 'xtream' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-foreground flex items-center space-x-2">
                            <User className="w-4 h-4" />
                            <span>Kullanıcı Adı</span>
                          </Label>
                          <Input
                            value={newPlaylist.xtream_username}
                            onChange={(e) => setNewPlaylist(prev => ({ ...prev, xtream_username: e.target.value }))}
                            placeholder="username"
                            className="bg-secondary/50 border-border"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-foreground flex items-center space-x-2">
                            <Lock className="w-4 h-4" />
                            <span>Şifre</span>
                          </Label>
                          <Input
                            type="password"
                            value={newPlaylist.xtream_password}
                            onChange={(e) => setNewPlaylist(prev => ({ ...prev, xtream_password: e.target.value }))}
                            placeholder="••••••••"
                            className="bg-secondary/50 border-border"
                          />
                        </div>
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={isAdding}
                      className="w-full bg-primary hover:bg-primary/90"
                    >
                      {isAdding ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Ekleniyor...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Playlist Ekle
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DeviceSetup;
