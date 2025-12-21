// Mock users database for IPPL4Y

// IPPL4Y Application Users (can access the app)
export const ippl4yUsers = {
  // Superadmin - Application Owner
  superadmin: {
    username: 'ippl4y_admin',
    password: 'ippl4y2025!',
    role: 'superadmin',
    email: 'admin@ippl4y.com'
  },
  
  // Admins - IPTV Service Providers (paid for IPPL4Y access)
  admins: [
    {
      username: 'provider_turktelekom',
      password: 'ttv123!',
      role: 'admin',
      email: 'admin@turktelekom-iptv.com',
      companyName: 'Türk Telekom IPTV',
      subscriptionExpiry: '2026-12-31',
      paymentStatus: 'active'
    },
    {
      username: 'provider_digiturk',
      password: 'dgtk456!',
      role: 'admin',
      email: 'admin@digiturk.com',
      companyName: 'Digiturk IPTV Service',
      subscriptionExpiry: '2025-06-30',
      paymentStatus: 'active'
    }
  ],
  
  // Users/Customers (paid for IPPL4Y access)
  users: [
    {
      username: 'customer_ahmet',
      password: 'ahmet123',
      role: 'user',
      email: 'ahmet@example.com',
      subscriptionExpiry: '2026-01-15',
      paymentStatus: 'active',
      hasIptvService: false // Will become true after adding IPTV credentials
    },
    {
      username: 'customer_ayse',
      password: 'ayse456',
      role: 'user',
      email: 'ayse@example.com',
      subscriptionExpiry: '2025-08-20',
      paymentStatus: 'active',
      hasIptvService: false
    },
    {
      username: 'customer_mehmet',
      password: 'mehmet789',
      role: 'user',
      email: 'mehmet@example.com',
      subscriptionExpiry: '2025-12-31',
      paymentStatus: 'active',
      hasIptvService: false
    }
  ]
};

// IPTV Service Credentials (provided by Admins to their customers)
export const iptvServiceCredentials = {
  // Türk Telekom IPTV customers
  'customer_ahmet': {
    provider: 'provider_turktelekom',
    m3uUrl: 'http://turktelekom-iptv.com/playlist.m3u',
    username: 'ahmet_ttv',
    password: 'ttv_ahmet123',
    subscriptionType: '1 year',
    expiryDate: '2025-12-31'
  },
  
  // Digiturk IPTV customers
  'customer_ayse': {
    provider: 'provider_digiturk',
    m3uUrl: 'http://digiturk.com/streams/playlist.m3u',
    username: 'ayse_dgtk',
    password: 'dgtk_ayse456',
    subscriptionType: '6 months',
    expiryDate: '2025-08-31'
  }
};

// Test credentials summary
export const testCredentials = {
  superadmin: {
    app: { username: 'ippl4y_admin', password: 'ippl4y2025!' }
  },
  admin: {
    app: { username: 'provider_turktelekom', password: 'ttv123!' }
  },
  user: {
    app: { username: 'customer_ahmet', password: 'ahmet123' },
    iptv: { 
      m3uUrl: 'http://turktelekom-iptv.com/playlist.m3u',
      username: 'ahmet_ttv', 
      password: 'ttv_ahmet123' 
    }
  }
};
