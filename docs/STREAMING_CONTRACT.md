# IPPL4Y Streaming System Contract

**Version:** 1.0  
**Date:** 2025-01-27  
**Status:** ✅ PRODUCTION - DO NOT MODIFY WITHOUT APPROVAL

## 🚨 CRITICAL WARNING

Bu contract, IPPL4Y'nin canlı TV streaming sisteminin çalışan kod yapısını korumak için oluşturulmuştur. Bu contract'ta belirtilen kod blokları ve mantık **KESINLIKLE DEĞİŞTİRİLMEMELİDİR** çünkü sistem şu anda başarıyla çalışmaktadır.

## 📋 Contract Overview

Bu contract, frontend ve backend arasındaki streaming iş akışını ve kritik kod bloklarını tanımlar.

---

## 🔴 CRITICAL CODE BLOCKS - DO NOT MODIFY

### 1. Backend: Stream URL Endpoint (`/api/channels/stream/{channel_id}`)

**File:** `backend/server.py` (Lines ~1641-1689)

**CRITICAL REQUIREMENTS:**
- ✅ Stream URL'i **DOĞRUDAN** döndürmelidir (proxy kullanmamalı)
- ✅ Stream URL formatı: `{base_url}/live/{username}/{password}/{stream_id}.m3u8` (Xtream için)
- ✅ M3U playlist'lerinden gelen URL'ler olduğu gibi döndürülmelidir
- ❌ **ASLA** proxy URL oluşturulmamalı (`/api/stream/proxy` kullanılmamalı)
- ❌ **ASLA** stream URL'i normalize etmeye çalışılmamalı

**REQUIRED CODE STRUCTURE:**
```python
@api_router.get("/channels/stream/{channel_id}")
async def get_channel_stream(channel_id: str, device_id: str):
    # ... channel lookup code ...
    
    return {
        "success": True,
        "channel": channel,
        "stream_url": channel.get('stream_url')  # DIRECT URL - NO PROXY
    }
```

**WHY CRITICAL:** Proxy URL'ler frontend'de sorun yaratıyor ve stream yüklenemiyor.

---

### 2. Backend: Xtream Stream URL Format

**File:** `backend/server.py` (Multiple locations)

**CRITICAL REQUIREMENTS:**
- ✅ Xtream stream URL'leri **HER ZAMAN** `.m3u8` formatında oluşturulmalıdır
- ❌ `.ts` formatı kullanılmamalıdır
- ❌ `container_extension` field'ı kullanılmamalıdır

**REQUIRED CODE STRUCTURE:**
```python
# ✅ CORRECT - Always use .m3u8
stream_url = f"{base_url}/live/{username}/{password}/{stream_id}.m3u8"

# ❌ WRONG - Never use .ts or container_extension
# stream_url = f"{base_url}/live/{username}/{password}/{stream_id}.{extension}"
```

**Locations:**
- Line ~929: `parse_playlist` function
- Line ~1210: `parse_xtream_full_data` function  
- Line ~1419: `get_xtream_channels` function
- Line ~1476: `get_xtream_full_data` function

**WHY CRITICAL:** `.ts` formatı HLS.js tarafından doğrudan oynatılamaz, `.m3u8` manifest dosyası gereklidir.

---

### 3. Frontend: VideoPlayer Component

**File:** `frontend/src/components/VideoPlayer.jsx`

**CRITICAL REQUIREMENTS:**
- ✅ Sadece **HLS.js** kullanılmalıdır
- ❌ **MPEGTS.js** kullanılmamalıdır (package.json'dan kaldırılmıştır)
- ✅ Proxy URL'lerden gerçek URL'i çıkarma mantığı korunmalıdır
- ✅ `.ts` stream'lerini `.m3u8` formatına dönüştürme mantığı korunmalıdır
- ✅ HLS error recovery mekanizması korunmalıdır

**REQUIRED CODE STRUCTURE:**
```javascript
// 1. Proxy URL extraction (Lines 24-34)
if (streamUrl.includes('/api/stream/proxy?url=')) {
  const urlParams = new URLSearchParams(streamUrl.split('?')[1]);
  actualStreamUrl = decodeURIComponent(urlParams.get('url') || streamUrl);
}

// 2. TS to M3U8 conversion (Lines 36-41)
if (actualStreamUrl.endsWith('.ts') && actualStreamUrl.includes('/live/')) {
  actualStreamUrl = actualStreamUrl.replace('.ts', '.m3u8');
}

// 3. HLS.js initialization (Lines 44-54)
const hls = new Hls({
  enableWorker: true,
  lowLatencyMode: false,
  backBufferLength: 90,
  debug: false,
  xhrSetup: (xhr, url) => {
    xhr.withCredentials = false;
  }
});

// 4. Error recovery (Lines 68-88)
hls.on(Hls.Events.ERROR, (event, data) => {
  if (data.fatal) {
    switch (data.type) {
      case Hls.ErrorTypes.NETWORK_ERROR:
        hls.startLoad(); // Retry
        break;
      case Hls.ErrorTypes.MEDIA_ERROR:
        hls.recoverMediaError(); // Recover
        break;
      // ...
    }
  }
});
```

**WHY CRITICAL:** Bu mantık olmadan stream'ler yüklenemez veya hata durumlarında recover edilemez.

---

### 4. Frontend: Stream URL Fetching - LiveTVPage

**File:** `frontend/src/components/LiveTVPage.jsx` (Lines ~118-150)

**CRITICAL REQUIREMENTS:**
- ✅ Stream URL backend'den fetch edilmeli
- ✅ Stream URL **DOĞRUDAN** VideoPlayer'a verilmeli
- ❌ Stream URL normalize edilmemeli
- ❌ Proxy URL oluşturulmamalı

**REQUIRED CODE STRUCTURE:**
```javascript
const handleWatchClick = async (channel, e) => {
  e.stopPropagation();
  
  // Find channel index
  const index = channels.findIndex(ch => ch.id === channel.id);
  setCurrentChannelIndex(index);
  
  // Fetch stream URL from backend
  const response = await fetch(
    `${backendUrl}/api/channels/stream/${channel.id}?device_id=${deviceInfo.device_id}`
  );
  const data = await response.json();
  
  if (data.success && data.stream_url) {
    // ✅ DIRECT URL - NO NORMALIZATION
    setSelectedChannel({
      ...channel,
      stream_url: data.stream_url
    });
  }
};
```

**WHY CRITICAL:** URL normalizasyonu stream yüklemesini bozuyor.

---

### 5. Frontend: Stream URL Fetching - LiveTVContent

**File:** `frontend/src/components/LiveTVContent.jsx` (Lines ~119-150)

**CRITICAL REQUIREMENTS:**
- ✅ Stream URL backend'den fetch edilmeli
- ✅ Stream URL **DOĞRUDAN** VideoPlayer'a verilmeli
- ❌ Stream URL normalize edilmemeli
- ❌ Proxy URL oluşturulmamalı
- ✅ `handleChannelChange` fonksiyonu kanal değiştirme için kullanılmalı
- ✅ `currentChannelIndex` state'i korunmalı

**REQUIRED CODE STRUCTURE:**
```javascript
const handleChannelChange = async (channel, index) => {
  setCurrentChannelIndex(index);
  
  const response = await fetch(
    `${backendUrl}/api/channels/stream/${channel.id}?device_id=${deviceInfo.device_id}`
  );
  const data = await response.json();
  
  if (data.success && data.stream_url) {
    setSelectedChannel({
      ...channel,
      stream_url: data.stream_url
    });
  }
};

const handleWatchClick = async (channel, e) => {
  e.stopPropagation();
  
  // Find channel index
  const index = filteredChannels.findIndex(ch => ch.id === channel.id);
  setCurrentChannelIndex(index);
  
  // Fetch stream URL from backend
  const response = await fetch(
    `${backendUrl}/api/channels/stream/${channel.id}?device_id=${deviceInfo.device_id}`
  );
  const data = await response.json();
  
  if (data.success && data.stream_url) {
    // ✅ DIRECT URL - NO NORMALIZATION
    setSelectedChannel({
      ...channel,
      stream_url: data.stream_url
    });
  }
};
```

**VideoPlayer Props:**
```javascript
<VideoPlayer
  streamUrl={selectedChannel.stream_url}
  channel={selectedChannel}
  channels={filteredChannels}
  currentChannelIndex={currentChannelIndex}
  onClose={closePlayer}
  onChannelChange={handleChannelChange}
  onToggleFavorite={toggleFavorite}
  isFavorite={isFavorite}
/>
```

**WHY CRITICAL:** Her iki component de aynı streaming mantığını kullanmalı ve VideoPlayer'a tüm gerekli prop'lar geçirilmelidir.

---

## 📦 Dependencies Contract

### Frontend Dependencies

**REQUIRED:**
- ✅ `hls.js: ^1.6.15` - HLS stream playback için zorunlu

**FORBIDDEN:**
- ❌ `mpegts.js` - Kullanılmamalı, package.json'dan kaldırılmıştır

**File:** `frontend/package.json`

---

## 🔄 Data Flow Contract

### Stream URL Flow

```
1. User clicks "Watch" button (LiveTVPage or LiveTVContent)
   ↓
2. Frontend calls: GET /api/channels/stream/{channel_id}?device_id={device_id}
   ↓
3. Backend returns: { "success": true, "stream_url": "http://..." }
   ↓
4. Frontend sets currentChannelIndex and passes stream_url DIRECTLY to VideoPlayer
   ↓
5. VideoPlayer receives:
   - streamUrl: Direct stream URL
   - channel: Channel object with metadata
   - channels: Array of all channels for navigation
   - currentChannelIndex: Current channel index
   - onChannelChange: Handler for channel switching
   - onToggleFavorite: Handler for favorites
   - isFavorite: Function to check favorite status
   ↓
6. VideoPlayer processes URL:
   - Extracts from proxy if needed
   - Converts .ts to .m3u8 if Xtream stream
   - Loads with HLS.js
   ↓
7. Stream plays successfully ✅
```

**CRITICAL:** Bu flow'da hiçbir adımda proxy URL oluşturulmamalı veya stream URL normalize edilmemelidir.

**Components Using This Flow:**
- ✅ `LiveTVPage.jsx` - Full page component
- ✅ `LiveTVContent.jsx` - Content component for home page

---

## 🚫 FORBIDDEN PATTERNS

Aşağıdaki pattern'ler **KESINLIKLE KULLANILMAMALIDIR:**

### ❌ Proxy URL Pattern
```python
# BACKEND - FORBIDDEN
proxied_url = f"/api/stream/proxy?url={quote(original_stream_url)}"
return {"stream_url": proxied_url}
```

### ❌ URL Normalization Pattern
```javascript
// FRONTEND - FORBIDDEN
if (streamUrl.startsWith('/api/stream/proxy')) {
  normalizedUrl = `${backendUrl}${streamUrl}`;
}
```

### ❌ MPEGTS.js Pattern
```javascript
// FRONTEND - FORBIDDEN
import mpegts from 'mpegts.js';
if (isTS && mpegts.isSupported()) {
  // ...
}
```

### ❌ TS Extension Pattern
```python
# BACKEND - FORBIDDEN
extension = stream.get('container_extension', 'ts')
stream_url = f"{base_url}/live/{username}/{password}/{stream_id}.{extension}"
```

---

## ✅ ALLOWED PATTERNS

### ✅ Direct Stream URL
```python
# BACKEND - ALLOWED
stream_url = channel.get('stream_url')
return {"stream_url": stream_url}
```

### ✅ HLS.js Only
```javascript
// FRONTEND - ALLOWED
import Hls from 'hls.js';
const hls = new Hls({...});
hls.loadSource(streamUrl);
```

### ✅ M3U8 Format for Xtream
```python
# BACKEND - ALLOWED
stream_url = f"{base_url}/live/{username}/{password}/{stream_id}.m3u8"
```

---

## 🧪 Testing Requirements

Her değişiklikten sonra aşağıdaki testler yapılmalıdır:

1. ✅ Canlı TV kanalı açılabilmeli
2. ✅ Stream başarıyla yüklenmeli
3. ✅ Video oynatılabilmeli
4. ✅ Network hatası durumunda retry çalışmalı
5. ✅ Media hatası durumunda recovery çalışmalı

---

## 📝 Change Approval Process

Bu contract'ta belirtilen kod bloklarında değişiklik yapmak için:

1. **MUTLAKA** bu contract'ı güncelleyin
2. Değişiklik nedenini dokümante edin
3. Test sonuçlarını ekleyin
4. Production'a deploy etmeden önce staging'de test edin
5. Değişiklik onaylandıktan sonra contract versiyonunu artırın

---

## 📞 Support

Sorun yaşarsanız:
1. Bu contract'ı kontrol edin
2. Kod değişikliklerini contract ile karşılaştırın
3. Gerekirse eski çalışan versiyona geri dönün

---

## 📊 Implementation Status (2025-01-27)

### ✅ Verified Working Components

1. **Backend Stream Endpoint** (`/api/channels/stream/{channel_id}`)
   - ✅ Direct URL return
   - ✅ Xtream .m3u8 format
   - ✅ M3U playlist support

2. **LiveTVPage Component**
   - ✅ Stream URL fetching
   - ✅ Direct URL passing
   - ✅ Channel navigation
   - ✅ Favorites support

3. **LiveTVContent Component**
   - ✅ Stream URL fetching
   - ✅ Direct URL passing
   - ✅ Channel navigation
   - ✅ Favorites support

4. **VideoPlayer Component**
   - ✅ HLS.js integration
   - ✅ Error recovery
   - ✅ Network retry
   - ✅ Channel switching
   - ✅ Favorites integration

**Status:** ✅ ALL COMPONENTS WORKING - PRODUCTION READY

---

**Last Updated:** 2025-01-27  
**Maintained By:** IPPL4Y Development Team  
**Status:** ✅ ACTIVE - PRODUCTION

