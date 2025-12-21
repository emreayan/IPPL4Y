import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ippl4yUsers } from '../authData';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ArrowLeft, Users, Building2, Search, Calendar, Mail, Shield, TrendingUp, DollarSign } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

const SuperadminDashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // All users (providers + customers)
  const allProviders = ippl4yUsers.admins || [];
  const allCustomers = ippl4yUsers.users || [];

  const filteredProviders = allProviders.filter(provider => 
    provider.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    provider.companyName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCustomers = allCustomers.filter(customer => 
    customer.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateDaysRemaining = (expiryDate) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} gün` : 'Süresi dolmuş';
  };

  const totalRevenue = allProviders.length * 500 + allCustomers.length * 50; // Mock calculation
  const activeSubscriptions = allProviders.filter(p => p.paymentStatus === 'active').length + 
                               allCustomers.filter(c => c.paymentStatus === 'active').length;

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
                <h1 className="text-2xl font-bold text-foreground">IPPL4Y Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">Platform Yönetimi ve İzleme</p>
              </div>
            </div>
            <Badge className="bg-destructive text-destructive-foreground">Superadmin</Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-card border-border mb-6">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Genel Bakış
            </TabsTrigger>
            <TabsTrigger 
              value="providers" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Building2 className="w-4 h-4 mr-2" />
              Providerlar ({allProviders.length})
            </TabsTrigger>
            <TabsTrigger 
              value="customers" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Users className="w-4 h-4 mr-2" />
              Müşteriler ({allCustomers.length})
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <Card className="p-6 bg-card border-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Toplam Provider</h3>
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <p className="text-3xl font-bold text-foreground">{allProviders.length}</p>
                <p className="text-xs text-green-500 mt-2">Aktif: {allProviders.filter(p => p.paymentStatus === 'active').length}</p>
              </Card>

              <Card className="p-6 bg-card border-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Toplam Müşteri</h3>
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <p className="text-3xl font-bold text-foreground">{allCustomers.length}</p>
                <p className="text-xs text-green-500 mt-2">Aktif: {allCustomers.filter(c => c.paymentStatus === 'active').length}</p>
              </Card>

              <Card className="p-6 bg-card border-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Aktif Abonelikler</h3>
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <p className="text-3xl font-bold text-foreground">{activeSubscriptions}</p>
                <p className="text-xs text-muted-foreground mt-2">Toplam abonelik</p>
              </Card>

              <Card className="p-6 bg-card border-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Toplam Gelir</h3>
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <p className="text-3xl font-bold text-foreground">₺{totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-2">Bu ay</p>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">Son Aktiviteler</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Yeni Provider Kaydı</p>
                      <p className="text-xs text-muted-foreground">provider_turktelekom - 1 yıllık plan</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">2 saat önce</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Yeni Müşteri</p>
                      <p className="text-xs text-muted-foreground">customer_ayse - 6 aylık plan</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">5 saat önce</span>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Providers Tab */}
          <TabsContent value="providers">
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Provider ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-card border-border"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredProviders.map((provider, index) => (
                <Card key={index} className="p-4 bg-card border-border hover:border-primary transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{provider.companyName}</h3>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Mail className="w-3 h-3" />
                          <span>{provider.email}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Username: {provider.username}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground mb-1">IPPL4Y Abonelik</p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3 mr-1" />
                          {provider.subscriptionExpiry}
                        </div>
                        <p className="text-xs text-accent mt-1">
                          {calculateDaysRemaining(provider.subscriptionExpiry)}
                        </p>
                      </div>
                      <Badge className={provider.paymentStatus === 'active' ? 'bg-green-500/10 text-green-500 border-green-500' : 'bg-red-500/10 text-red-500 border-red-500'}>
                        {provider.paymentStatus === 'active' ? 'Aktif' : 'Pasif'}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers">
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Müşteri ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-card border-border"
                />
              </div>
            </div>

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
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground mb-1">IPPL4Y Abonelik</p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3 mr-1" />
                          {customer.subscriptionExpiry}
                        </div>
                        <p className="text-xs text-accent mt-1">
                          {calculateDaysRemaining(customer.subscriptionExpiry)}
                        </p>
                      </div>
                      <Badge className={customer.paymentStatus === 'active' ? 'bg-green-500/10 text-green-500 border-green-500' : 'bg-red-500/10 text-red-500 border-red-500'}>
                        {customer.paymentStatus === 'active' ? 'Aktif' : 'Pasif'}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Supabase Integration Info */}
        <Card className="p-6 bg-accent/10 border-accent/20 mt-6">
          <h3 className="text-lg font-semibold text-foreground mb-3">Supabase Entegrasyon Bilgisi</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>✅ Kullanıcı verileri için Supabase tabloları:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><code className="text-primary">providers</code> - IPTV provider bilgileri</li>
              <li><code className="text-primary">customers</code> - Müşteri bilgileri</li>
              <li><code className="text-primary">subscriptions</code> - Abonelik takibi</li>
              <li><code className="text-primary">payments</code> - Ödeme geçmişi</li>
            </ul>
            <p className="mt-3">⚠️ Backend API endpoints hazır - Supabase bağlantısı için gerekli:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>SUPABASE_URL</li>
              <li>SUPABASE_ANON_KEY</li>
              <li>Backend endpoints: /api/admin/users, /api/admin/subscriptions</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SuperadminDashboard;
