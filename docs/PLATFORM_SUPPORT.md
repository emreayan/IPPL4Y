# Platform Support Documentation

## Desteklenen Platformlar

IPPL4Y aşağıdaki platformlarda çalışır:

- ✅ **Smart TV** (Android TV, Tizen, webOS, Apple TV, Roku)
- ✅ **Web Browser** (Desktop - Chrome, Firefox, Safari, Edge)
- ✅ **Mobile** (iOS, Android)
- ✅ **Tablet** (iPad, Android Tablet)

## Platform-Specific Features

### Smart TV

**Özellikler:**
- TV Remote kontrolü (Arrow keys, Enter, Back)
- Büyük butonlar ve metinler (okunabilirlik için)
- Sürekli görünür kontroller (auto-hide yok)
- Keyboard navigation desteği
- Media key desteği (MediaPlayPause, MediaTrackPrevious/Next)

**Kontroller:**
- `Arrow Left/Right` - Önceki/Sonraki kanal
- `Enter` veya `Space` - Oynat/Duraklat
- `Backspace` veya `Escape` - Geri dön veya kanal listesini kapat
- `F` - Favorilere ekle/çıkar
- `L` - Kanal listesini aç/kapat
- `MediaTrackPrevious/Next` - Kanal değiştir

**UI Adaptasyonları:**
- Butonlar: `lg` size
- İkonlar: `w-7 h-7`
- Padding: `p-8`
- Metin boyutu: `text-2xl` (başlıklar), `text-base` (kanal listesi)
- Logo boyutu: `w-14 h-14`

### Mobile (iOS/Android)

**Özellikler:**
- Touch gestures (swipe left/right for channel change)
- Küçük butonlar (ekran alanı tasarrufu)
- Auto-hide kontroller (3 saniye sonra)
- Touch-optimized UI
- Swipe up/down - Kontrolleri göster/gizle

**Kontroller:**
- Swipe Left - Sonraki kanal
- Swipe Right - Önceki kanal
- Swipe Up - Kontrolleri gizle
- Swipe Down - Kontrolleri göster
- Tap - Oynat/Duraklat

**UI Adaptasyonları:**
- Butonlar: `sm` size
- İkonlar: `w-4 h-4`
- Padding: `p-4`
- Kanal listesi: Full width (`w-full`)

### Tablet (iPad/Android Tablet)

**Özellikler:**
- Touch gestures (mobile ile aynı)
- Orta boy butonlar
- Auto-hide kontroller
- Tablet-optimized layout

**UI Adaptasyonları:**
- Butonlar: `default` size
- İkonlar: `w-5 h-5`
- Padding: `p-6`
- Kanal listesi: `w-96` (384px)

### Desktop (Web Browser)

**Özellikler:**
- Mouse hover interactions
- Keyboard shortcuts (TV ile aynı)
- Orta boy kontroller
- Mouse move ile kontrolleri göster

**UI Adaptasyonları:**
- Butonlar: `default` size
- İkonlar: `w-5 h-5`
- Padding: `p-6`
- Kanal listesi: `w-80` (320px)

## Platform Detection

Platform detection `frontend/src/utils/platformDetection.js` dosyasında yapılır:

```javascript
const platform = usePlatform();
// Returns: { isMobile, isTablet, isTV, isDesktop, isTouch, platform }
```

**Detection Methods:**
1. User Agent string analizi
2. Touch capability detection
3. Screen size ve pointer type matching
4. TV-specific user agent patterns

## Responsive Breakpoints

VideoPlayer otomatik olarak platform algılar ve UI'ı adapte eder:

- **Mobile**: < 768px, touch device
- **Tablet**: 768px - 1024px, touch device
- **Desktop**: > 1024px, mouse device
- **TV**: > 1280px, coarse pointer, no hover

## Accessibility Features

### Keyboard Navigation
- Tüm butonlar keyboard ile erişilebilir
- Focus states görsel olarak belirgin
- Tab navigation desteği

### Screen Reader Support
- Butonlar için `title` attribute'ları
- Semantic HTML kullanımı
- ARIA labels (gerekirse eklenebilir)

## Performance Considerations

### Platform-Specific Optimizations

**TV:**
- Kontroller sürekli görünür (re-render azaltır)
- Büyük touch target'lar (remote için)

**Mobile/Tablet:**
- Touch gestures native event'ler kullanır
- Passive event listeners (scroll performance)

**Desktop:**
- Mouse move throttling (performance için)

## Testing Checklist

Her platform için test edilmesi gerekenler:

### Smart TV
- [ ] Remote kontrolü çalışıyor mu?
- [ ] Butonlar yeterince büyük mü?
- [ ] Metinler okunabilir mi?
- [ ] Keyboard navigation çalışıyor mu?

### Mobile
- [ ] Touch gestures çalışıyor mu?
- [ ] Butonlar dokunulabilir mi?
- [ ] Auto-hide çalışıyor mu?
- [ ] Swipe gestures responsive mi?

### Tablet
- [ ] Layout tablet için optimize mi?
- [ ] Touch gestures çalışıyor mu?
- [ ] Kanal listesi görünür mü?

### Desktop
- [ ] Mouse hover çalışıyor mu?
- [ ] Keyboard shortcuts çalışıyor mu?
- [ ] Focus states görünür mü?

## Known Limitations

1. **TV Remote**: Bazı TV'lerde media key'ler desteklenmeyebilir
2. **Touch Gestures**: Çok hızlı swipe'larda algılama sorunları olabilir
3. **Fullscreen**: Bazı platformlarda fullscreen API farklılıkları olabilir

## Future Enhancements

- [ ] Voice control desteği (TV için)
- [ ] Gesture customization (kullanıcı ayarları)
- [ ] Platform-specific themes
- [ ] Advanced keyboard shortcuts

---

**Last Updated:** 2025-01-27  
**Maintained By:** IPPL4Y Development Team





