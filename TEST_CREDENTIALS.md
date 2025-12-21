# IPPL4Y Test Credentials

## İki Aşamalı Kimlik Doğrulama Sistemi

IPPL4Y uygulaması artık gerçekçi bir iş modeline sahip:

### 📋 Kullanıcı Tipleri ve Giriş Yapısı

---

## 1️⃣ SUPERADMIN (Platform Sahibi)

**Görev:** IPPL4Y uygulamasının genel yöneticisi

**Giriş Bilgileri:**
```
Kullanıcı Adı: ippl4y_admin
Şifre: ippl4y2025!
```

**Özellikler:**
- ✅ Tek adımlı giriş (sadece IPPL4Y bilgileri)
- ✅ Tüm Admin ve User'ları görebilir
- ✅ Platform genelinde raporlama ve yönetim
- ❌ M3U URL girişi yok

---

## 2️⃣ ADMIN (IPTV Provider)

**Görev:** IPTV servisi sağlayıcısı (IPPL4Y'ye ödeme yaparak platformu kullanır)

### Provider 1: Türk Telekom IPTV
```
Kullanıcı Adı: provider_turktelekom
Şifre: ttv123!
Firma: Türk Telekom IPTV
```

### Provider 2: Digiturk
```
Kullanıcı Adı: provider_digiturk
Şifre: dgtk456!
Firma: Digiturk IPTV Service
```

**Özellikler:**
- ✅ Tek adımlı giriş (sadece IPPL4Y bilgileri)
- ✅ Kendi müşterilerini yönetir
- ✅ Playlist yükler ve yönetir
- ✅ Müşterilere abonelik satar (6 ay, 1 yıl, 2 yıl)
- ❌ M3U URL girişi yok

---

## 3️⃣ USER (Müşteri) - İKİ AŞAMALI GİRİŞ

**Görev:** IPTV izleyici (Hem IPPL4Y'ye hem de IPTV provider'a ödeme yapar)

### Müşteri 1: Ahmet (Türk Telekom IPTV Abonesi)

**1. Adım - IPPL4Y Uygulamasına Giriş:**
```
Kullanıcı Adı: customer_ahmet
Şifre: ahmet123
```

**2. Adım - IPTV Servisi Bağlantısı:**
```
M3U URL: http://turktelekom-iptv.com/playlist.m3u
IPTV Kullanıcı Adı: ahmet_ttv
IPTV Şifre: ttv_ahmet123
Provider: Türk Telekom IPTV
Abonelik: 1 yıl
```

### Müşteri 2: Ayşe (Digiturk IPTV Abonesi)

**1. Adım - IPPL4Y Uygulamasına Giriş:**
```
Kullanıcı Adı: customer_ayse
Şifre: ayse456
```

**2. Adım - IPTV Servisi Bağlantısı:**
```
M3U URL: http://digiturk.com/streams/playlist.m3u
IPTV Kullanıcı Adı: ayse_dgtk
IPTV Şifre: dgtk_ayse456
Provider: Digiturk
Abonelik: 6 ay
```

### Müşteri 3: Mehmet (IPTV Servisi Yok)

**1. Adım - IPPL4Y Uygulamasına Giriş:**
```
Kullanıcı Adı: customer_mehmet
Şifre: mehmet789
```

**2. Adım:** ❌ IPTV provider aboneliği yok - kanal izleyemez

---

## 🔄 İş Akışı

### User (Müşteri) İçin:
1. **IPPL4Y'ye Kaydolma:** Ödeme yaparak IPPL4Y hesabı alır
2. **Uygulamaya Giriş:** IPPL4Y kullanıcı adı + şifre ile giriş
3. **IPTV Provider Seçimi:** Bir IPTV provider'dan abonelik satın alır
4. **IPTV Bağlantısı:** Provider'dan aldığı M3U URL + credentials girer
5. **Yayın İzleme:** Artık TV kanallarını izleyebilir

### Admin (Provider) İçin:
1. **IPPL4Y'ye Ödeme:** Platform kullanım hakkı satın alır
2. **Uygulamaya Giriş:** IPPL4Y admin hesabı ile giriş
3. **Müşteri Yönetimi:** Kendi müşterilerini ekler, abonelik verir
4. **Playlist Yönetimi:** M3U dosyalarını yükler ve yönetir

### Superadmin İçin:
1. **Platform Yönetimi:** Tüm admin ve user'ları görebilir
2. **Raporlama:** Ödeme durumları, abonelik süreleri
3. **Onay Sistemi:** Yeni admin ve user kayıtlarını onaylar

---

## 🎯 Önemli Notlar

- ✅ **Superadmin ve Admin:** Tek adımlı giriş (URL yok)
- ✅ **User:** İki adımlı giriş (IPPL4Y + IPTV servisi)
- ✅ **IPTV bağlantısı olmayan user:** Uygulamayı açabilir ama kanal izleyemez
- ✅ **Navigation'da durum:** "IPTV Bağlı" veya "IPTV Yok" gösterilir
- ✅ **Provider badge:** Bağlı provider'ın adı görünür

---

## 📱 Ekran Görüntüleri

1. **Login Sayfası:** 3 tab (Müşteri, Provider, Admin)
2. **IPTV Setup:** M3U URL + credentials giriş ekranı
3. **Home Page:** IPTV bağlantı durumu badge'leri
4. **Navigation:** Rol ve IPTV durumu gösterimi

---

## 🔐 Güvenlik

- Her kullanıcı tipi kendi yetkilerine göre filtrelenmiş veri görür
- IPTV credentials provider tarafından kontrol edilir
- Abonelik süreleri ve ödeme durumları takip edilir
- Süreleri dolan kullanıcılar giriş yapamaz
