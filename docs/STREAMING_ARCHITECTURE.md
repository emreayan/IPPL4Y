# IPPL4Y Streaming Architecture Documentation

## Overview

IPPL4Y streaming sistemi, HLS (HTTP Live Streaming) protokolünü kullanarak canlı TV yayınlarını oynatır. Sistem basit ve direkt bir yaklaşım kullanır - proxy veya karmaşık URL manipülasyonları kullanmaz.

## Architecture Principles

1. **Direct Stream URLs**: Stream URL'leri backend'den direkt olarak döndürülür
2. **HLS.js Only**: Sadece HLS.js kullanılır, MPEGTS.js kullanılmaz
3. **M3U8 Format**: Xtream stream'leri her zaman `.m3u8` formatında oluşturulur
4. **No Proxy**: Stream URL'leri proxy üzerinden geçirilmez
5. **Error Recovery**: Network ve media hatalarında otomatik recovery mekanizması vardır

## Component Overview

### Backend Components

#### 1. Stream URL Endpoint
- **Path:** `/api/channels/stream/{channel_id}`
- **Method:** GET
- **Purpose:** Kanal için stream URL'i döndürür
- **Response:** `{ "success": true, "stream_url": "http://..." }`

#### 2. Xtream Stream URL Generation
- **Format:** `{base_url}/live/{username}/{password}/{stream_id}.m3u8`
- **Critical:** Her zaman `.m3u8` uzantısı kullanılır

### Frontend Components

#### 1. VideoPlayer Component
- **Library:** HLS.js
- **Features:**
  - Proxy URL extraction
  - TS to M3U8 conversion
  - Error recovery
  - Auto-retry on network errors

#### 2. LiveTVPage Component
- **Purpose:** Kanal listesi ve stream başlatma
- **Flow:** Fetch stream URL → Pass to VideoPlayer
- **Features:**
  - Kategori bazlı kanal listesi
  - Kanal arama
  - Stream URL backend'den alınır
  - VideoPlayer'a direkt URL geçirilir

#### 3. LiveTVContent Component
- **Purpose:** Ana sayfa içinde canlı TV içeriği gösterimi
- **Flow:** Fetch stream URL → Pass to VideoPlayer
- **Features:**
  - Kategori bazlı kanal listesi
  - Kanal arama
  - Stream URL backend'den alınır
  - VideoPlayer'a direkt URL geçirilir
  - Kanal değiştirme desteği
  - Favoriler desteği

## Stream URL Processing Flow

```
Backend Database (MongoDB)
  ↓
Stream URL stored as: "http://server.com/live/user/pass/123.m3u8"
  ↓
GET /api/channels/stream/123
  ↓
Response: { "stream_url": "http://server.com/live/user/pass/123.m3u8" }
  ↓
Frontend receives URL
  ↓
VideoPlayer processes:
  1. Check if proxy URL → Extract actual URL
  2. Check if .ts → Convert to .m3u8
  3. Load with HLS.js
  ↓
Stream plays ✅
```

## Error Handling

### Network Errors
- **Action:** Automatic retry with `hls.startLoad()`
- **Max Retries:** Unlimited (handled by HLS.js)

### Media Errors
- **Action:** Automatic recovery with `hls.recoverMediaError()`
- **Fallback:** Show error message to user

### Fatal Errors
- **Action:** Destroy HLS instance, show error
- **User Action:** User can retry manually

## Security Considerations

- CORS headers are set appropriately
- `xhr.withCredentials = false` for security
- No sensitive data in stream URLs (handled by backend)

## Performance Considerations

- `backBufferLength: 90` - Optimal buffer size
- `lowLatencyMode: false` - Better compatibility
- `enableWorker: true` - Better performance

## Component Implementation Status

### ✅ Working Components (2025-01-27)

1. **LiveTVPage** (`frontend/src/components/LiveTVPage.jsx`)
   - ✅ Stream URL fetching from backend
   - ✅ Direct URL passing to VideoPlayer
   - ✅ Channel navigation support
   - ✅ Favorites support
   - ✅ Category filtering
   - ✅ Search functionality

2. **LiveTVContent** (`frontend/src/components/LiveTVContent.jsx`)
   - ✅ Stream URL fetching from backend
   - ✅ Direct URL passing to VideoPlayer
   - ✅ Channel navigation support
   - ✅ Favorites support
   - ✅ Category filtering
   - ✅ Search functionality

3. **VideoPlayer** (`frontend/src/components/VideoPlayer.jsx`)
   - ✅ HLS.js integration
   - ✅ Proxy URL extraction
   - ✅ TS to M3U8 conversion
   - ✅ Error recovery
   - ✅ Network retry mechanism

4. **Backend Stream Endpoint** (`backend/server.py`)
   - ✅ Direct stream URL return
   - ✅ Xtream .m3u8 format support
   - ✅ M3U playlist support

## Future Considerations

- Bu mimari değiştirilmeden önce mutlaka `STREAMING_CONTRACT.md` kontrol edilmelidir
- Yeni özellikler eklenirken mevcut çalışan yapı korunmalıdır
- Her iki component (LiveTVPage ve LiveTVContent) aynı streaming mantığını kullanır

