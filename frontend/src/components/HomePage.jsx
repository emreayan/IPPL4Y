import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Tv, Film, Clapperboard, List, Grid3x3, History, Download } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const { user, currentPlaylist, playlists } = useApp();
  const [showSuccess, setShowSuccess] = useState(true);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowSuccess(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Only show warning if we have explicitly checked and no playlist exists
    if (playlists !== undefined && playlists.length === 0) {
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  }, [playlists]);

  const mainCategories = [
    {
      id: 'live-tv',
      title: 'CANLI TV',
      icon: Tv,
      path: '/live-tv',
      gradient: 'from-teal-500 to-blue-600',
      hasDownload: true
    },
    {
      id: 'movies',
      title: 'SEÇ İZLE',
      icon: Film,
      path: '/movies',
      gradient: 'from-orange-500 to-red-600',
      hasDownload: true
    },
    {
      id: 'series',
      title: 'SERİLER',
      icon: Clapperboard,
      path: '/series',
      gradient: 'from-purple-500 to-pink-600',
      hasDownload: true
    }
  ];

  const secondaryCategories = [
    {
      id: 'epg-live',
      title: 'EPG İLE CANLI',
      icon: List,
      path: '/epg-live'
    },
    {
      id: 'multi-screen',
      title: 'ÇOKLU EKRAN',
      icon: Grid3x3,
      path: '/multi-screen'
    },
    {
      id: 'recordings',
      title: 'KAYDEDİLENLER',
      icon: History,
      path: '/recordings'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0F171E] text-white">
      {/* Top Bar */}
      <div className="bg-[#1A242F] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src="/ippl4y-logo.png" alt="IPPL4Y" className="h-10" />
          <div className="text-sm text-gray-400">
            {new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-gray-400 hover:text-white transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button className="text-gray-400 hover:text-white transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <button className="text-gray-400 hover:text-white transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {showSuccess && (
        <div className="bg-[#1A242F] mx-6 mt-4 px-4 py-3 rounded-lg flex items-center gap-3 animate-fadeIn">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-sm">Başarıyla Giriş Yaptınız.</span>
        </div>
      )}

      {/* No Playlist Warning */}
      {showWarning && (
        <div className="bg-orange-500/20 border border-orange-500/50 mx-6 mt-4 px-4 py-4 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-1">IPTV Servisi Bulunamadı</h3>
              <p className="text-sm text-gray-300 mb-3">
                Kanal yayınlarını görebilmek için Provider'ınızdan aldığınız playlist bilgilerini eklemeniz gerekmektedir.
              </p>
              <button
                onClick={() => navigate('/device-setup')}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Playlist Ekle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="px-6 py-8">
        {/* Main Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {mainCategories.map((category) => {
            const Icon = category.icon;
            return (
              <div
                key={category.id}
                onClick={() => navigate(category.path)}
                className={`relative h-64 rounded-xl bg-gradient-to-br ${category.gradient} p-6 cursor-pointer transform transition-all hover:scale-105 hover:shadow-2xl group`}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <Icon className="w-20 h-20 mb-4 text-white" />
                  <h3 className="text-2xl font-bold text-white">{category.title}</h3>
                </div>
                {category.hasDownload && (
                  <div className="absolute bottom-4 right-4 flex items-center gap-2 text-white text-sm opacity-0 group-hover:opacity-100 transition">
                    <Download className="w-4 h-4" />
                    <span>İndir</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Secondary Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {secondaryCategories.map((category) => {
            const Icon = category.icon;
            return (
              <div
                key={category.id}
                onClick={() => navigate(category.path)}
                className="h-32 rounded-xl bg-[#1A242F] p-6 cursor-pointer transform transition-all hover:scale-105 hover:shadow-lg group"
              >
                <div className="flex items-center gap-4">
                  <Icon className="w-10 h-10 text-gray-400 group-hover:text-white transition" />
                  <h3 className="text-lg font-semibold text-white">{category.title}</h3>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="mt-8 flex items-center justify-between text-sm text-gray-400">
          <div>Bitiş Tarihi: Haziran 21, 2026</div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>My Smarters Account</span>
          </div>
          <div>Giriş: IPTV2026</div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
