import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tv, Lock, User, Server, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

const IptvSetup = () => {
  const [m3uUrl, setM3uUrl] = useState('');
  const [iptvUsername, setIptvUsername] = useState('');
  const [iptvPassword, setIptvPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, connectToIptvService } = useApp();
  const navigate = useNavigate();

  const handleConnect = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!m3uUrl || !iptvUsername || !iptvPassword) {
      setError('Tüm alanları doldurun');
      setLoading(false);
      return;
    }

    setTimeout(() => {
      const result = connectToIptvService(m3uUrl, iptvUsername, iptvPassword);
      
      if (result.success) {
        navigate('/home');
      } else {
        setError(result.error);
      }
      setLoading(false);
    }, 1500);
  };

  const handleSkip = () => {
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(214,32%,8%)] via-[hsl(214,28%,12%)] to-[hsl(214,32%,8%)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card/50 border-border backdrop-blur-xl">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Tv className="w-8 h-8 text-primary-foreground" />
          </div>
          <div className="text-center">
            <CardTitle className="text-2xl font-bold text-foreground">IPTV Servis Bağlantısı</CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Hoş geldiniz, <span className="font-semibold text-foreground">{user?.username}</span>
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6 bg-primary/10 border-primary/20">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <AlertDescription className="text-foreground">
              IPPL4Y uygulamna giriş başarılı! Şimdi IPTV provider'ınızdan aldığınız M3U playlist bilgilerini girin.
            </AlertDescription>
          </Alert>

          {error && (
            <Alert variant="destructive" className="mb-4 bg-destructive/10 border-destructive/50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleConnect} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="m3uUrl" className="text-foreground">M3U Playlist URL</Label>
              <div className="relative">
                <Server className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="m3uUrl"
                  type="text"
                  placeholder="http://provider.com/playlist.m3u"
                  value={m3uUrl}
                  onChange={(e) => setM3uUrl(e.target.value)}
                  className="pl-10 bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <p className="text-xs text-muted-foreground">Provider'ınızdan aldığınız M3U URL</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="iptvUsername" className="text-foreground">IPTV Kullanıcı Adı</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="iptvUsername"
                  type="text"
                  placeholder="IPTV kullanıcı adı"
                  value={iptvUsername}
                  onChange={(e) => setIptvUsername(e.target.value)}
                  className="pl-10 bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="iptvPassword" className="text-foreground">IPTV Şifre</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="iptvPassword"
                  type="password"
                  placeholder="IPTV şifre"
                  value={iptvPassword}
                  onChange={(e) => setIptvPassword(e.target.value)}
                  className="pl-10 bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold py-6 text-lg transition-all duration-300 shadow-lg shadow-primary/30"
              >
                {loading ? 'Bağlanıyor...' : 'IPTV Servisine Bağlan'}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={handleSkip}
                className="w-full border-border text-muted-foreground hover:bg-secondary"
              >
                Daha Sonra Ekle
              </Button>
            </div>
          </form>

          <div className="mt-6 p-4 bg-accent/10 border border-accent/20 rounded-lg">
            <p className="text-sm text-foreground mb-2"><strong>Test Bilgileri:</strong></p>
            <div className="text-xs text-muted-foreground space-y-1 font-mono">
              <p>URL: http://turktelekom-iptv.com/playlist.m3u</p>
              <p>Kullanıcı: ahmet_ttv</p>
              <p>Şifre: ttv_ahmet123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IptvSetup;
