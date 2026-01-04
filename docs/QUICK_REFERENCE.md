# IPPL4Y Streaming Quick Reference

## 🚨 CRITICAL RULES

1. **Backend:** Stream URL'i direkt döndür, proxy kullanma
2. **Backend:** Xtream stream'leri her zaman `.m3u8` formatında oluştur
3. **Frontend:** Sadece HLS.js kullan, MPEGTS.js kullanma
4. **Frontend:** Stream URL'i direkt VideoPlayer'a ver, normalize etme

## ✅ DO's

- ✅ Backend'de stream URL'i direkt döndür
- ✅ Xtream için `.m3u8` formatı kullan
- ✅ HLS.js ile stream yükle
- ✅ Error recovery mekanizmasını koru

## ❌ DON'Ts

- ❌ Proxy URL oluşturma
- ❌ Stream URL'i normalize etme
- ❌ MPEGTS.js kullanma
- ❌ `.ts` formatı kullanma (Xtream için)

## 🔍 Debug Checklist

Stream çalışmıyorsa kontrol et:

- [ ] Backend stream URL'i direkt döndürüyor mu?
- [ ] Stream URL `.m3u8` formatında mı?
- [ ] Frontend'de proxy URL extraction çalışıyor mu?
- [ ] HLS.js doğru initialize ediliyor mu?
- [ ] Error recovery mekanizması aktif mi?

## 📞 Files to Check

- `backend/server.py` - Stream endpoint
- `frontend/src/components/VideoPlayer.jsx` - Player logic
- `frontend/src/components/LiveTVPage.jsx` - Stream fetching (full page)
- `frontend/src/components/LiveTVContent.jsx` - Stream fetching (content component)
- `frontend/package.json` - Dependencies

## 🔗 Related Documentation

- [STREAMING_CONTRACT.md](./STREAMING_CONTRACT.md) - Detailed contract
- [STREAMING_ARCHITECTURE.md](./STREAMING_ARCHITECTURE.md) - Architecture details

