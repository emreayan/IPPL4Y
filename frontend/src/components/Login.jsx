import React, { useState, useRef } from 'react';
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
  const [isLoading, setIsLoading] = useState(false);
  const { loginToApp, customLogo, logoLoading } = useApp();
  const navigate = useNavigate();
  
  // Refs for form inputs as fallback
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);

  const handleLogin = async (e, role) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Get values from state, fallback to ref values if state is empty
    const username = appUsername || usernameRef.current?.value || '';
    const password = appPassword || passwordRef.current?.value || '';

    console.log('🔐 Login attempt:', { username, role });

    if (!username || !password) {
      setError('Tüm alanları doldurun');
      setIsLoading(false);
      return;
    }

    try {
      const result = await loginToApp(username, password);
      console.log('📋 Login result:', result);
      
      if (result.success) {
        console.log('✅ Login successful, navigating to /home');
        navigate('/home');
      } else {
        console.error('❌ Login failed:', result.error);
        setError(result.error || 'Giriş başarısız');
      }
    } catch (err) {
      console.error('💥 Login error:', err);
      setError('Giriş sırasında bir hata oluştu: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderLoginForm = (role, title, description) => (
    <form onSubmit={(e) => handleLogin(e, role)} className="space-y-4" autoComplete="off">
      {error && (
        <Alert variant="destructive" className="bg-destructive/10 border-destructive/50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <Label htmlFor={`username-${role}`} className="text-foreground">Platform Kullanıcı Adı</Label>
        <div className="relative">
          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            ref={role === activeTab ? usernameRef : undefined}
            id={`username-${role}`}
            name={`username-${role}`}
            type="text"
            placeholder="IPPL4Y üyelik kullanıcı adınız"
            value={appUsername}
            onChange={(e) => setAppUsername(e.target.value)}
            className="pl-10 bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground"
            autoComplete="username"
            disabled={isLoading}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor={`password-${role}`} className="text-foreground">Platform Şifre</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            ref={role === activeTab ? passwordRef : undefined}
            id={`password-${role}`}
            name={`password-${role}`}
            type="password"
            placeholder="IPPL4Y üyelik şifreniz"
            value={appPassword}
            onChange={(e) => setAppPassword(e.target.value)}
            className="pl-10 bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground"
            autoComplete="current-password"
            disabled={isLoading}
          />
        </div>
      </div>
      
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[#75a55d] hover:bg-[#6a9552] text-[#0a0a0a] font-semibold py-6 text-lg transition-all duration-300 shadow-lg shadow-[#75a55d]/30 disabled:opacity-50"
      >
        {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
      </Button>
    </form>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(214,32%,8%)] via-[hsl(214,28%,12%)] to-[hsl(214,32%,8%)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card/50 border-border backdrop-blur-xl">
        <CardHeader className="space-y-4 text-center px-6">
          {/* Transparent Logo - Centered */}
          {customLogo ? (
            <div className="w-full flex justify-center items-center">
              <div className="w-[432px] h-36 flex items-center justify-center">
                <img 
                  src={customLogo} 
                  alt="IPPL4Y Logo" 
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="w-full flex justify-center items-center">
              <div className="w-[432px] h-36 flex items-center justify-center">
                <img 
                  src="/ippl4y-logo.png" 
                  alt="IPPL4Y Logo" 
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}
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
