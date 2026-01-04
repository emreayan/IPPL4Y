# 🌳 IPPL4Y Branch Stratejisi ve Geliştirme Yol Haritası

> **Not:** Bu döküman, SMARTERS IPTV Analysis.md'den çıkarılan tüm modül, optimizasyon, işlem, yönetim ve performans geliştirmelerini içeren kapsamlı bir branch stratejisidir.
> 
> **✅ Branch'ler Oluşturuldu:** Toplam 193 branch başarıyla oluşturuldu (4 Ocak 2026)

---

## 📋 İçindekiler
1. [Branch Yapısı ve Naming Convention](#branch-yapısı-ve-naming-convention)
2. [Ana Branch'ler](#ana-branchler)
3. [Modül Branch'leri](#modül-branchleri)
4. [Feature Branch'leri](#feature-branchleri)
5. [Branch Açıklama ve Öncelikleri](#branch-açıklama-ve-öncelikleri)

---

## 🏗 Branch Yapısı ve Naming Convention

```
main                           ← Production-ready kod
├── develop                    ← Geliştirme ana dalı
│   ├── feature/...           ← Yeni özellikler
│   ├── module/...            ← Modül geliştirmeleri
│   ├── optimization/...      ← Performans optimizasyonları
│   ├── fix/...               ← Bug düzeltmeleri
│   ├── refactor/...          ← Kod yeniden yapılandırma
│   ├── ui/...                ← Arayüz geliştirmeleri
│   ├── integration/...       ← Entegrasyonlar
│   └── security/...          ← Güvenlik iyileştirmeleri
├── staging                    ← Test ortamı
└── release/v*.*.*            ← Release branch'leri
```

---

## 🎯 Ana Branch'ler

| Branch | Açıklama | Koruma |
|--------|----------|--------|
| `main` | Production kodu, her zaman stabil | ✅ Protected |
| `develop` | Geliştirme ana dalı | ✅ Protected |
| `staging` | Test ve QA ortamı | ✅ Protected |

---

## 📦 MODÜL BRANCH'LERİ

### 1. MİMARİ VE MOTOR STRATEJİSİ
```
module/architecture
├── module/architecture/service-first-design
├── module/architecture/memory-management
├── module/architecture/weak-reference-implementation
├── module/architecture/background-playback-service
├── module/architecture/state-persistence
└── module/architecture/cloud-sync-engine
```

### 2. OYUNATICI (PLAYER) MODÜLÜ
```
module/player
├── module/player/hybrid-engine                    ← ExoPlayer + HLS.js fallback
├── module/player/player-wrapper-abstraction
├── module/player/codec-support
│   ├── module/player/codec-support/h264
│   ├── module/player/codec-support/h265-hevc
│   └── module/player/codec-support/vp9
├── module/player/stream-protocols
│   ├── module/player/stream-protocols/hls
│   ├── module/player/stream-protocols/rtmp
│   └── module/player/stream-protocols/dash
├── module/player/buffer-management
├── module/player/error-recovery
├── module/player/pip-support                      ← Picture-in-Picture
├── module/player/external-player-support          ← VLC, MX Player
└── module/player/subtitle-audio-track
```

### 3. YAPILANDIRMA VE OPTİMİZASYON
```
module/configuration
├── module/configuration/mediacodec-hardware-acceleration
├── module/configuration/framedrop-sync
├── module/configuration/start-on-prepared
├── module/configuration/dynamic-buffer-size
├── module/configuration/user-agent-management
├── module/configuration/network-identity
└── module/configuration/opensles-audio
```

### 4. TV ARAYÜZÜ VE KUMANDA YÖNETİMİ
```
module/tv-interface
├── module/tv-interface/dpad-navigation
├── module/tv-interface/focus-management
│   ├── module/tv-interface/focus-management/highlight-animation
│   ├── module/tv-interface/focus-management/spatial-navigation
│   └── module/tv-interface/focus-management/focus-trap
├── module/tv-interface/leanback-ui
├── module/tv-interface/remote-keys
│   ├── module/tv-interface/remote-keys/colored-buttons       ← Kırmızı, Yeşil, Sarı, Mavi
│   ├── module/tv-interface/remote-keys/info-button
│   ├── module/tv-interface/remote-keys/back-button
│   └── module/tv-interface/remote-keys/custom-mappings
├── module/tv-interface/zapping-engine                         ← Hızlı kanal değiştirme
│   ├── module/tv-interface/zapping-engine/pre-fetching
│   ├── module/tv-interface/zapping-engine/channel-preview
│   └── module/tv-interface/zapping-engine/warm-cache
├── module/tv-interface/aspect-ratio-control
├── module/tv-interface/info-bar
└── module/tv-interface/speedy-grid-layout                     ← Hızlı liste kaydırma
```

### 5. EPG (YAYIN REHBERİ) MODÜLÜ
```
module/epg
├── module/epg/xmltv-parser
├── module/epg/pre-caching
├── module/epg/timezone-sync
├── module/epg/progress-indicator
├── module/epg/catch-up-archive                                ← Geriye dönük izleme
├── module/epg/epg-grid-view
├── module/epg/epg-timeline-view
├── module/epg/epg-search
└── module/epg/epg-notifications
```

### 6. CHROMECAST MODÜLÜ
```
module/chromecast
├── module/chromecast/cast-server-service
├── module/chromecast/receiver-id-setup
├── module/chromecast/queue-management
├── module/chromecast/expanded-controls
├── module/chromecast/cast-options-provider
└── module/chromecast/cast-button-ui
```

### 7. API WORKERS VE ARKA PLAN İŞLEMLERİ
```
module/api-workers
├── module/api-workers/data-sync-worker
├── module/api-workers/announcement-worker
├── module/api-workers/app-version-worker
├── module/api-workers/db-storage-worker
├── module/api-workers/maintenance-mode-worker
├── module/api-workers/combined-request-optimizer
└── module/api-workers/security-signature
    ├── module/api-workers/security-signature/salt-hash
    ├── module/api-workers/security-signature/random-nonce
    └── module/api-workers/security-signature/device-uuid
```

### 8. SERVİSLER VE ARKA PLAN İŞLEMLERİ
```
module/services
├── module/services/stop-processing-service
├── module/services/data-recovery-service
├── module/services/pip-mode-protection
├── module/services/foreground-service
├── module/services/notification-service
└── module/services/file-provider-service                      ← Güvenli dosya paylaşımı
```

### 9. FATURALANDIRMA VE ÖDEME MODELLERİ
```
module/billing
├── module/billing/subscription-management
├── module/billing/order-system
├── module/billing/device-management
│   ├── module/billing/device-management/max-connections
│   ├── module/billing/device-management/device-registration
│   └── module/billing/device-management/clear-devices
├── module/billing/google-play-integration
├── module/billing/trial-management
├── module/billing/client-registration
└── module/billing/purchase-verification
```

### 10. STALKER MIDDLEWARE MODELLERİ
```
module/stalker
├── module/stalker/portal-authentication
├── module/stalker/player-link-create
├── module/stalker/player-link-delete
├── module/stalker/session-management
├── module/stalker/favorites-sync
├── module/stalker/epg-integration
├── module/stalker/ad-system
└── module/stalker/profile-management
```

### 11. DİZİ (SERIES) MODELLERİ
```
module/series
├── module/series/season-episode-hierarchy
├── module/series/episode-details
├── module/series/episode-comparator                           ← Akıllı sıralama
├── module/series/watch-progress-tracking
├── module/series/continue-watching
├── module/series/lazy-loading-seasons
└── module/series/series-categories
```

### 12. CANLI YAYIN MODELLERİ
```
module/live-tv
├── module/live-tv/channel-model
├── module/live-tv/category-management
├── module/live-tv/stream-icon-management
├── module/live-tv/favorites-system
├── module/live-tv/recent-channels
├── module/live-tv/channel-search
├── module/live-tv/channel-sorting
└── module/live-tv/multi-audio-track
```

### 13. TMDB ENTEGRASYON MODELLERİ
```
module/tmdb
├── module/tmdb/movie-search
├── module/tmdb/tv-search
├── module/tmdb/cast-crew
├── module/tmdb/trailers
├── module/tmdb/poster-backdrop
├── module/tmdb/metadata-enrichment
├── module/tmdb/pagination
└── module/tmdb/localization-tr
```

### 14. VERİTABANI VE VERİ YÖNETİMİ
```
module/database
├── module/database/sqlite-handler
├── module/database/favorites-db
├── module/database/recent-watch-db
├── module/database/downloaded-content-db
├── module/database/external-player-db
├── module/database/sync-status-tracker
├── module/database/schema-migration
├── module/database/sharedpreferences-cache
└── module/database/mongodb-integration                        ← Mevcut backend
```

### 15. VERİ MODELLERİ VE CALLBACK'LER
```
module/models
├── module/models/api-response-wrapper
├── module/models/login-callback
├── module/models/server-info-model
├── module/models/user-info-model
├── module/models/stream-models
├── module/models/vod-models
└── module/models/generic-callback-handler
```

---

## 🚀 FEATURE BRANCH'LERİ

### Performans Optimizasyonları
```
optimization/performance
├── optimization/performance/lazy-loading
├── optimization/performance/image-caching                     ← Glide/Picasso
├── optimization/performance/lru-cache
├── optimization/performance/virtual-scrolling
├── optimization/performance/code-splitting
├── optimization/performance/bundle-optimization
├── optimization/performance/memory-leak-prevention
└── optimization/performance/render-optimization
```

### Hata Yönetimi
```
feature/error-handling
├── feature/error-handling/5-retry-mechanism
├── feature/error-handling/fallback-url
├── feature/error-handling/error-analytics
├── feature/error-handling/silent-reconnection
├── feature/error-handling/user-notification
└── feature/error-handling/error-logging-firebase
```

### Güvenlik İyileştirmeleri
```
security/enhancements
├── security/enhancements/url-signing
├── security/enhancements/user-agent-protection
├── security/enhancements/api-signature-validation
├── security/enhancements/ssl-pinning
├── security/enhancements/secure-storage
└── security/enhancements/obfuscation
```

### UI/UX Geliştirmeleri
```
ui/improvements
├── ui/improvements/modern-player-controls
├── ui/improvements/channel-list-redesign
├── ui/improvements/movie-grid-layout
├── ui/improvements/series-detail-page
├── ui/improvements/loading-skeletons
├── ui/improvements/smooth-animations
├── ui/improvements/dark-theme-refinement
├── ui/improvements/responsive-design
└── ui/improvements/accessibility-a11y
```

### Platform Entegrasyonları
```
integration/platforms
├── integration/platforms/android-tv-native
├── integration/platforms/webos-lg
├── integration/platforms/tizen-samsung
├── integration/platforms/firestick
├── integration/platforms/apple-tv
├── integration/platforms/roku
└── integration/platforms/pwa
```

### Yeni Özellikler
```
feature/new
├── feature/new/offline-download
├── feature/new/parental-controls
├── feature/new/multi-profile
├── feature/new/watch-party
├── feature/new/smart-recommendations
├── feature/new/voice-search
├── feature/new/multi-language-ui
├── feature/new/custom-themes
├── feature/new/vpn-integration
├── feature/new/ota-updates
├── feature/new/rate-us-flow
└── feature/new/maintenance-mode-screen
```

### Backend Geliştirmeleri
```
backend/enhancements
├── backend/enhancements/api-caching
├── backend/enhancements/rate-limiting
├── backend/enhancements/graphql-api
├── backend/enhancements/websocket-realtime
├── backend/enhancements/redis-cache
├── backend/enhancements/cdn-integration
└── backend/enhancements/analytics-pipeline
```

### Test ve DevOps
```
devops/infrastructure
├── devops/infrastructure/ci-cd-pipeline
├── devops/infrastructure/docker-setup
├── devops/infrastructure/kubernetes
├── devops/infrastructure/monitoring
└── devops/infrastructure/logging

test/coverage
├── test/coverage/unit-tests
├── test/coverage/integration-tests
├── test/coverage/e2e-tests
└── test/coverage/performance-tests
```

---

## 📊 Branch Açıklama ve Öncelikleri

### 🔴 Kritik Öncelik (P0) - Hemen Başlanmalı
| Branch | Açıklama | Mevcut Durum |
|--------|----------|--------------|
| `module/player/hybrid-engine` | ExoPlayer + HLS.js fallback mekanizması | VideoPlayer.jsx mevcut, HLS.js kullanıyor |
| `module/player/error-recovery` | 5 katlı retry mekanizması | Eksik |
| `module/tv-interface/dpad-navigation` | Kumanda navigasyonu | Kısmi mevcut |
| `module/tv-interface/focus-management/highlight-animation` | Focus animasyonları | Eksik |
| `optimization/performance/lazy-loading` | Lazy loading implementasyonu | Eksik |

### 🟠 Yüksek Öncelik (P1) - 1. Sprint
| Branch | Açıklama | Mevcut Durum |
|--------|----------|--------------|
| `module/epg/xmltv-parser` | EPG veri parse etme | Eksik |
| `module/epg/timezone-sync` | Saat dilimi senkronizasyonu | Eksik |
| `module/tv-interface/zapping-engine/pre-fetching` | Kanal ön yükleme | Eksik |
| `module/live-tv/favorites-system` | Favoriler sistemi | AppContext.js'de mevcut |
| `module/series/watch-progress-tracking` | İzleme takibi | Eksik |
| `feature/error-handling/5-retry-mechanism` | Yeniden deneme mekanizması | Eksik |

### 🟡 Orta Öncelik (P2) - 2. Sprint
| Branch | Açıklama | Mevcut Durum |
|--------|----------|--------------|
| `module/tmdb/movie-search` | TMDB film arama | Eksik |
| `module/tmdb/cast-crew` | Oyuncu kadrosu | Eksik |
| `module/chromecast/cast-server-service` | Chromecast desteği | Eksik |
| `module/database/favorites-db` | Favoriler veritabanı | MongoDB mevcut |
| `module/player/pip-support` | Picture-in-Picture | Eksik |
| `ui/improvements/loading-skeletons` | Loading animasyonları | Kısmi mevcut |

### 🟢 Normal Öncelik (P3) - 3. Sprint
| Branch | Açıklama | Mevcut Durum |
|--------|----------|--------------|
| `module/billing/subscription-management` | Abonelik yönetimi | Eksik |
| `module/stalker/portal-authentication` | Stalker desteği | Eksik |
| `feature/new/offline-download` | Çevrimdışı indirme | Eksik |
| `feature/new/parental-controls` | Ebeveyn kontrolü | Eksik |
| `integration/platforms/android-tv-native` | Android TV native | Eksik |

### 🔵 Düşük Öncelik (P4) - Gelecek Sprintler
| Branch | Açıklama | Mevcut Durum |
|--------|----------|--------------|
| `feature/new/watch-party` | Birlikte izleme | Eksik |
| `feature/new/voice-search` | Sesli arama | Eksik |
| `module/vpn/integration` | VPN entegrasyonu | Eksik |
| `feature/new/multi-profile` | Çoklu profil | Eksik |

---

## 🔄 Branch Workflow

### Yeni Feature Başlatma
```bash
# develop'dan yeni branch oluştur
git checkout develop
git pull origin develop
git checkout -b feature/new/feature-name

# Geliştirme yap
git add .
git commit -m "feat: feature description"

# develop'a merge için PR aç
git push origin feature/new/feature-name
```

### Module Geliştirme
```bash
# Module branch'i oluştur
git checkout develop
git checkout -b module/player/hybrid-engine

# Alt branch gerekirse
git checkout -b module/player/hybrid-engine/exoplayer-fallback
```

### Hotfix
```bash
# main'den hotfix branch'i
git checkout main
git checkout -b hotfix/critical-bug-fix

# Fix yap ve main'e merge et
git checkout main
git merge hotfix/critical-bug-fix

# develop'a da merge et
git checkout develop
git merge hotfix/critical-bug-fix
```

---

## 📁 Mevcut Proje Yapısı ile Eşleştirme

| Mevcut Dosya | İlgili Branch'ler |
|--------------|-------------------|
| `VideoPlayer.jsx` | `module/player/*`, `optimization/performance/*` |
| `LiveTVPage.jsx` | `module/live-tv/*`, `module/tv-interface/*` |
| `LiveTVContent.jsx` | `module/live-tv/*`, `module/epg/*` |
| `SeriesPage.jsx` | `module/series/*` |
| `MoviesPage.jsx` | `module/tmdb/*` |
| `AppContext.js` | `module/database/*`, `module/models/*` |
| `server.py` | `backend/enhancements/*` |
| `platformDetection.js` | `integration/platforms/*` |

---

## 📈 Sprint Planlaması Önerisi

### Sprint 1 (2 Hafta) - Temel İyileştirmeler
- [ ] `module/player/hybrid-engine`
- [ ] `module/player/error-recovery`
- [ ] `module/tv-interface/focus-management/highlight-animation`
- [ ] `optimization/performance/lazy-loading`

### Sprint 2 (2 Hafta) - EPG ve Zapping
- [ ] `module/epg/xmltv-parser`
- [ ] `module/epg/timezone-sync`
- [ ] `module/tv-interface/zapping-engine/pre-fetching`
- [ ] `module/tv-interface/zapping-engine/channel-preview`

### Sprint 3 (2 Hafta) - TMDB ve Detaylar
- [ ] `module/tmdb/movie-search`
- [ ] `module/tmdb/cast-crew`
- [ ] `module/tmdb/trailers`
- [ ] `module/series/watch-progress-tracking`

### Sprint 4 (2 Hafta) - Platform ve Casting
- [ ] `module/chromecast/cast-server-service`
- [ ] `integration/platforms/android-tv-native`
- [ ] `module/player/pip-support`

---

## 🏷 Commit Message Convention

```
feat: yeni özellik ekleme
fix: bug düzeltme
refactor: kod yeniden yapılandırma
perf: performans iyileştirme
style: stil değişiklikleri
docs: döküman güncelleme
test: test ekleme/güncelleme
chore: yapılandırma değişiklikleri
```

**Örnek:**
```
feat(player): implement hybrid engine with HLS.js fallback
fix(tv-interface): resolve focus trap issue on channel list
perf(epg): add LRU cache for EPG data
```

---

## 📝 Sonuç

Bu branch stratejisi, SMARTERS IPTV Analysis.md'den çıkarılan tüm modül ve özellikleri kapsayacak şekilde tasarlanmıştır. Her branch, bağımsız olarak geliştirilebilir ve test edilebilir şekilde organize edilmiştir.

**Toplam Branch Sayısı:**
- Ana Branch'ler: 3
- Modül Branch'leri: 150+
- Feature Branch'leri: 50+
- Toplam: ~200+ potansiyel branch

**Not:** Tüm branch'lerin aynı anda açılması gerekmez. Öncelik sırasına göre sprint planlaması yapılarak kademeli olarak geliştirme yapılmalıdır.

