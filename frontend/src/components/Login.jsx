import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tv, Lock, User, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

const Login = () => {
  const [activeTab, setActiveTab] = useState('user');
  const [appUsername, setAppUsername] = useState('');
  const [appPassword, setAppPassword] = useState('');
  const [error, setError] = useState('');
  const { loginToApp, customLogo, logoLoading } = useApp();
  const navigate = useNavigate();

  const handleLogin = (e, role) => {
    e.preventDefault();
    setError('');

    if (!appUsername || !appPassword) {
      setError('Tüm alanları doldurun');
      return;
    }

    const result = await loginToApp(appUsername, appPassword);
    
    if (result.success) {
      // All users go directly to home - IPTV setup is now device-based
      navigate('/home');
    } else {
      setError(result.error);
    }
  };

  const renderLoginForm = (role, title, description) => (
    <form onSubmit={(e) => handleLogin(e, role)} className="space-y-4">
      {error && (
        <Alert variant="destructive" className="bg-destructive/10 border-destructive/50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="username" className="text-foreground">IPPL4Y Kullanıcı Adı</Label>
        <div className="relative">
          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="username"
            type="text"
            placeholder="Kullanıcı adınızı girin"
            value={appUsername}
            onChange={(e) => setAppUsername(e.target.value)}
            className="pl-10 bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground"
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password" className="text-foreground">IPPL4Y Şifre</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type="password"
            placeholder="Şifrenizi girin"
            value={appPassword}
            onChange={(e) => setAppPassword(e.target.value)}
            className="pl-10 bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground"
            required
          />
        </div>
      </div>
      
      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold py-6 text-lg transition-all duration-300 shadow-lg shadow-primary/30"
      >
        Giriş Yap
      </Button>
    </form>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(214,32%,8%)] via-[hsl(214,28%,12%)] to-[hsl(214,32%,8%)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card/50 border-border backdrop-blur-xl">
        <CardHeader className="space-y-4 text-center">
          {/* Dynamic Logo */}
          {customLogo ? (
            <div className="mx-auto w-16 h-16 rounded-2xl overflow-hidden shadow-lg shadow-primary/20">
              <img 
                src={customLogo} 
                alt="IPPL4Y Logo" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden w-full h-full bg-gradient-to-br from-primary to-accent items-center justify-center">
                <Tv className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>
          ) : (
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Tv className="w-8 h-8 text-primary-foreground" />
            </div>
          )}
          <CardTitle className="text-3xl font-bold text-foreground">IPPL4Y</CardTitle>
          <CardDescription className="text-muted-foreground">
            Hesap tipinizi seçin ve giriş yapın
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-secondary">
              <TabsTrigger value="user" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Müşteri
              </TabsTrigger>
              <TabsTrigger value="admin" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Provider
              </TabsTrigger>
              <TabsTrigger value="superadmin" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Admin
              </TabsTrigger>
            </TabsList>

            <TabsContent value="user" className="mt-6">
              <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                <p className="text-sm text-foreground">
                  <strong>Müşteri Girişi:</strong> IPPL4Y hesabınızla giriş yapın. IPTV servisi için provider'ınızdan aldığınız bilgileri sonraki adımda gireceksiniz.
                </p>
              </div>
              {renderLoginForm('user', 'Müşteri Girişi', 'IPPL4Y müşteri hesabı bilgileriniz')}
            </TabsContent>

            <TabsContent value="admin" className="mt-6">
              <div className="mb-4 p-3 bg-accent/10 border border-accent/20 rounded-lg">
                <p className="text-sm text-foreground">
                  <strong>IPTV Provider Girişi:</strong> IPPL4Y platform aboneliğinizle giriş yapın. Müşterilerinizi ve playlist'lerinizi yönetebilirsiniz.
                </p>
              </div>
              {renderLoginForm('admin', 'Provider Girişi', 'IPTV provider hesabı bilgileriniz')}
            </TabsContent>

            <TabsContent value="superadmin" className="mt-6">
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-foreground">
                  <strong>Platform Yöneticisi:</strong> IPPL4Y platform yönetim paneline giriş.
                </p>
              </div>
              {renderLoginForm('superadmin', 'Admin Girişi', 'Platform yönetici hesabı')}
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center space-y-2">
            <p className="text-xs text-muted-foreground">Test Kimlik Bilgileri:</p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Müşteri: customer_ahmet / ahmet123</p>
              <p>Provider: provider_turktelekom / ttv123!</p>
              <p>Admin: ippl4y_admin / ippl4y2025!</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
