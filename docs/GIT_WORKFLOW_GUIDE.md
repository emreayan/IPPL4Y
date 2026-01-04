# IPPL4Y - GitHub Branch Stratejisi ve Commit Rehberi

## 📚 İçindekiler
1. [Main ve Branch Nedir?](#1-main-ve-branch-nedir)
2. [Bu Proje İçin Önerilen Branch Yapısı](#2-bu-proje-için-önerilen-branch-yapısı)
3. [İlerlemiş Projede Değişiklik Yapmak](#3-ilerlemiş-projede-değişiklik-yapmak)
4. [Commit Ne Zaman Yapılır?](#4-commit-ne-zaman-yapılır)
5. [Cursor Üzerinden Nasıl Yapılır?](#5-cursor-üzerinden-nasıl-yapılır)

---

## 1. Main ve Branch Nedir?

### 🎯 Main Branch (Ana Dal) Nedir?

**Main branch**, projenizin **çalışan ve stabil** versiyonunun bulunduğu ana dalıdır. Düşünün ki bu bir ağacın gövdesi gibi - her şey buradan çıkar.

**IPPL4Y Projesi Örneği:**
- Main branch'te şu anda çalışan versiyon var:
  - ✅ Backend server.py çalışıyor
  - ✅ Frontend LiveTVPage ve LiveTVContent çalışıyor
  - ✅ VideoPlayer HLS.js ile stream oynatıyor
  - ✅ Kullanıcılar giriş yapabiliyor

**Main'e ne zaman kaydedilir?**
- ✅ Bir özellik tamamen test edildi ve çalışıyor
- ✅ Hata düzeltmeleri yapıldı ve doğrulandı
- ✅ Kod temiz ve production'a hazır

### 🌿 Branch (Dal) Nedir?

**Branch**, main'den ayrılan bir kopya gibidir. Burada yeni özellikler veya değişiklikler yaparsınız, main'i bozmadan.

**IPPL4Y Projesi Örneği:**

**Senaryo 1: Yeni Özellik Ekleme**
```
Main branch: Çalışan IPTV player
    ↓
feature/favorites → Favoriler özelliği ekleniyor (test aşamasında)
    ↓
Test edildi, çalışıyor → Main'e birleştiriliyor
```

**Senaryo 2: Hata Düzeltme**
```
Main branch: VideoPlayer'da bir hata var
    ↓
fix/video-player-error → Hatayı düzeltiyoruz
    ↓
Düzeltme test edildi → Main'e birleştiriliyor
```

**Senaryo 3: Deneysel Özellik**
```
Main branch: Stabil versiyon
    ↓
experiment/new-ui → Yeni arayüz denemesi (belki çalışmaz)
    ↓
Çalışmazsa → Branch silinir, main etkilenmez
Çalışırsa → Main'e birleştirilir
```

### 🔄 Branch Oluşturma ve Birleştirme Süreci

**Adım Adım:**

1. **Main'den Branch Oluşturma:**
   ```
   Main branch (stabil)
       ↓
   Yeni branch oluştur: feature/yeni-ozellik
       ↓
   Bu branch'te çalış (main etkilenmez)
   ```

2. **Değişiklikleri Yapma:**
   ```
   feature/yeni-ozellik branch'inde:
   - Yeni kod yaz
   - Test et
   - Commit yap
   ```

3. **Main'e Birleştirme (Merge):**
   ```
   feature/yeni-ozellik → Main'e birleştir
       ↓
   Main artık yeni özelliği içeriyor
   ```

4. **Branch'i Silme:**
   ```
   Birleştirme tamamlandıktan sonra
   feature/yeni-ozellik branch'i silinebilir
   ```

---

## 2. Bu Proje İçin Önerilen Branch Yapısı

### 🌳 Önerilen Branch Stratejisi: **Git Flow**

IPPL4Y projesi için şu branch yapısını öneriyoruz:

```
main (production - her zaman çalışan versiyon)
  │
  ├── develop (geliştirme - tüm özellikler burada birleşir)
  │     │
  │     ├── feature/yeni-ozellik (yeni özellikler)
  │     ├── feature/favorites (favoriler özelliği)
  │     ├── feature/user-profile (kullanıcı profili)
  │     │
  │     ├── fix/video-player-bug (hata düzeltmeleri)
  │     ├── fix/stream-error (stream hataları)
  │     │
  │     └── hotfix/critical-bug (acil düzeltmeler - main'den çıkar)
```

### 📋 Branch Türleri ve Kullanım Senaryoları

#### **1. main Branch**
- **Amaç:** Production'da çalışan, stabil versiyon
- **Kural:** Sadece test edilmiş ve doğrulanmış kodlar buraya gelir
- **IPPL4Y Örneği:**
  ```
  Main'de şu anda:
  - Çalışan backend server.py
  - Çalışan frontend LiveTVPage
  - Çalışan VideoPlayer
  ```

#### **2. develop Branch**
- **Amaç:** Geliştirme ortamı, tüm özellikler burada birleşir
- **Kural:** Feature branch'ler buraya merge edilir
- **IPPL4Y Örneği:**
  ```
  Develop'da:
  - Yeni eklenen favoriler özelliği (test aşamasında)
  - Yeni UI değişiklikleri
  - Henüz main'e geçmemiş tüm özellikler
  ```

#### **3. feature/ Branches**
- **Amaç:** Yeni özellikler geliştirmek
- **İsimlendirme:** `feature/ozellik-adi`
- **IPPL4Y Örnekleri:**
  ```
  feature/favorites
  → Favoriler özelliği ekleniyor
  → LiveTVContent.jsx'e favori ekleme butonu
  → Backend'e favori kaydetme endpoint'i
  
  feature/user-profile
  → Kullanıcı profili sayfası
  → Profil düzenleme özelliği
  
  feature/epg-guide
  → Program rehberi (EPG) özelliği
  → Kanal programlarını gösterme
  ```

#### **4. fix/ Branches**
- **Amaç:** Hata düzeltmeleri
- **İsimlendirme:** `fix/hata-aciklamasi`
- **IPPL4Y Örnekleri:**
  ```
  fix/video-player-stream-error
  → VideoPlayer.jsx'te stream hatası düzeltiliyor
  → HLS.js hata yönetimi iyileştiriliyor
  
  fix/login-authentication
  → Login.jsx'te authentication hatası
  → Backend server.py'de token kontrolü düzeltiliyor
  
  fix/channel-list-loading
  → LiveTVPage.jsx'te kanal listesi yüklenmiyor
  → API çağrısı düzeltiliyor
  ```

#### **5. hotfix/ Branches**
- **Amaç:** Production'da kritik hatalar (main'den çıkar)
- **İsimlendirme:** `hotfix/kritik-hata`
- **IPPL4Y Örnekleri:**
  ```
  hotfix/stream-down
  → Production'da stream çalışmıyor (acil!)
  → Main'den direkt hotfix branch açılır
  → Düzeltilir ve hem main hem develop'a merge edilir
  ```

### 🎯 IPPL4Y İçin Örnek Branch Senaryosu

**Mevcut Durum:**
```
main: Çalışan IPTV player
  - Backend: server.py çalışıyor
  - Frontend: LiveTVPage, LiveTVContent çalışıyor
  - VideoPlayer: HLS.js ile stream oynatıyor
```

**Yeni Özellik: Favoriler**
```
1. develop branch'inden feature/favorites oluştur
   git checkout develop
   git checkout -b feature/favorites

2. Favoriler özelliğini geliştir
   - LiveTVContent.jsx'e favori butonu ekle
   - Backend'e favori kaydetme endpoint'i ekle
   - Commit yap: "feat: favoriler butonu eklendi"

3. Test et, çalışıyor mu kontrol et

4. develop'a merge et
   git checkout develop
   git merge feature/favorites

5. develop'da tüm özellikler birleşti, test et

6. main'e merge et (production'a hazır olduğunda)
   git checkout main
   git merge develop

7. feature/favorites branch'ini sil
   git branch -d feature/favorites
```

---

## 3. İlerlemiş Projede Değişiklik Yapmak

### ✅ Evet, Değiştirebilirsiniz!

**İyi Haber:** Projeniz ne kadar ilerlemiş olursa olsun, branch yapısını değiştirebilirsiniz. Git çok esnektir!

### 🔄 Mevcut Projeyi Branch Yapısına Geçirme

**IPPL4Y Projeniz İçin Adımlar:**

#### **Adım 1: Mevcut Durumu Kaydet**
```bash
# Şu anki değişiklikleri commit et
git add .
git commit -m "chore: mevcut durum kaydedildi"
```

#### **Adım 2: develop Branch Oluştur**
```bash
# main'den develop branch'i oluştur
git checkout -b develop

# develop'ı GitHub'a gönder
git push -u origin develop
```

#### **Adım 3: Main'i Koruma Altına Al**
```bash
# main'e geri dön
git checkout main

# Main artık production versiyonu
# Bundan sonra sadece test edilmiş kodlar buraya gelir
```

#### **Adım 4: Yeni Özellikler İçin Branch Oluştur**
```bash
# develop'dan yeni özellik branch'i
git checkout develop
git checkout -b feature/yeni-ozellik

# Bu branch'te çalış, commit yap
# Test et, çalışıyorsa develop'a merge et
```

### 🛡️ Güvenli Değişiklik Stratejisi

**IPPL4Y Örneği:**

**Durum:** Şu anda main'de çalışan kodlar var, ama branch yapısı yok.

**Çözüm:**

1. **Mevcut main'i koruyun:**
   ```
   main (mevcut çalışan kodlar)
   ```

2. **develop oluşturun:**
   ```
   main → develop (geliştirme ortamı)
   ```

3. **Yeni özellikler için branch:**
   ```
   develop → feature/favorites
   develop → feature/epg-guide
   ```

4. **Hata düzeltmeleri için:**
   ```
   develop → fix/video-player-error
   ```

### ⚠️ Dikkat Edilmesi Gerekenler

1. **Main'i Koruyun:**
   - Main'e direkt commit yapmayın
   - Her zaman branch oluşturun

2. **Commit Mesajları:**
   - Açıklayıcı commit mesajları yazın
   - Örnek: "feat: favoriler özelliği eklendi" ✅
   - Örnek: "fix: video player stream hatası düzeltildi" ✅
   - Örnek: "değişiklik" ❌ (çok genel)

3. **Düzenli Merge:**
   - Feature branch'leri düzenli olarak develop'a merge edin
   - Develop'ı test edin
   - Hazır olduğunda main'e merge edin

---

## 4. Commit Ne Zaman Yapılır?

### 📝 Commit Nedir?

**Commit**, yaptığınız değişikliklerin bir "anlık görüntüsü"dür. Bir nevi "kaydet" butonu gibi düşünebilirsiniz.

### ⏰ Commit Yapma Zamanları

#### **1. Mantıklı Bir İş Bittiğinde**

**IPPL4Y Örnekleri:**

✅ **İyi Commit Zamanları:**
```
"feat: LiveTVContent.jsx'e favori ekleme butonu eklendi"
→ Tek bir özellik tamamlandı, commit yap

"fix: VideoPlayer.jsx'te stream hatası düzeltildi"
→ Bir hata düzeltildi, commit yap

"refactor: Backend server.py kodları temizlendi"
→ Kod iyileştirmesi yapıldı, commit yap
```

❌ **Kötü Commit Zamanları:**
```
"değişiklikler" (ne değiştiği belli değil)
→ Çok genel, commit yapma

"test" (test kodu yazıldı ama çalışmıyor)
→ Çalışmayan kod commit edilmez
```

#### **2. Çalışan Bir Özellik Tamamlandığında**

**IPPL4Y Senaryosu:**

```
1. Favoriler butonu eklediniz
   → Çalışıyor mu? Test ettiniz mi?
   → Evet → Commit yapın ✅
   → Hayır → Commit yapmayın ❌

2. Backend'e favori endpoint'i eklediniz
   → API çalışıyor mu? Test ettiniz mi?
   → Evet → Commit yapın ✅
```

#### **3. Hata Düzeltildiğinde**

**IPPL4Y Senaryosu:**

```
VideoPlayer'da stream hatası vardı
→ Hatayı buldunuz
→ Düzelttiniz
→ Test ettiniz, çalışıyor
→ Commit yapın ✅
```

#### **4. Kod Temizliği Yapıldığında**

**IPPL4Y Senaryosu:**

```
server.py'de gereksiz kodlar vardı
→ Temizlediniz
→ Kod daha okunabilir oldu
→ Commit yapın ✅
```

### 🎯 Commit Mesajı Formatı

**Önerilen Format:** Conventional Commits

```
<tip>: <açıklama>

Örnekler:
feat: favoriler özelliği eklendi
fix: video player stream hatası düzeltildi
refactor: backend kodları temizlendi
docs: README güncellendi
test: video player için test eklendi
chore: dependencies güncellendi
```

**Commit Tipleri:**
- `feat`: Yeni özellik
- `fix`: Hata düzeltme
- `refactor`: Kod iyileştirme
- `docs`: Dokümantasyon
- `test`: Test ekleme
- `chore`: Genel bakım işleri

### 📊 IPPL4Y İçin Commit Örnekleri

**Örnek 1: Yeni Özellik**
```bash
git add frontend/src/components/LiveTVContent.jsx
git commit -m "feat: favoriler butonu LiveTVContent'e eklendi"
```

**Örnek 2: Hata Düzeltme**
```bash
git add frontend/src/components/VideoPlayer.jsx
git commit -m "fix: HLS.js stream hatası düzeltildi"
```

**Örnek 3: Backend Değişikliği**
```bash
git add backend/server.py
git commit -m "feat: favori kaydetme endpoint'i eklendi"
```

**Örnek 4: Birden Fazla Dosya**
```bash
git add frontend/src/components/LiveTVContent.jsx backend/server.py
git commit -m "feat: favoriler özelliği tamamlandı (frontend + backend)"
```

### ⚠️ Commit Yapmadan Önce Kontrol Listesi

- [ ] Kod çalışıyor mu? (Test ettiniz mi?)
- [ ] Hata var mı? (Linter hataları kontrol edildi mi?)
- [ ] Commit mesajı açıklayıcı mı?
- [ ] İlgili dosyalar eklendi mi? (`git add`)
- [ ] Gereksiz dosyalar commit edilmedi mi? (node_modules, .env gibi)

---

## 5. Cursor Üzerinden Nasıl Yapılır?

### 🖥️ Cursor IDE'de Git İşlemleri

Cursor, Git işlemlerini kolaylaştıran bir arayüz sunar. İşte adım adım nasıl yapılacağı:

### 📋 1. Branch Oluşturma (Cursor'da)

#### **Yöntem 1: Source Control Panel'den**

1. **Sol taraftaki Source Control ikonuna tıklayın** (Ctrl+Shift+G)
2. **Sağ üstteki "..." menüsüne tıklayın**
3. **"Branch" → "Create Branch" seçin**
4. **Branch adını girin:** `feature/favorites`
5. **Enter'a basın**

#### **Yöntem 2: Terminal'den**

1. **Terminal açın** (Ctrl+`)
2. **Komutları çalıştırın:**
   ```bash
   git checkout -b feature/favorites
   ```

#### **Yöntem 3: Status Bar'dan**

1. **Alt kısımdaki status bar'da branch adına tıklayın**
2. **"Create new branch" seçin**
3. **Branch adını girin**

### 📝 2. Commit Yapma (Cursor'da)

#### **Adım Adım:**

1. **Değişiklikleri Yapın:**
   - Dosyaları düzenleyin
   - Kaydedin (Ctrl+S)

2. **Source Control Panel'i Açın:**
   - Sol taraftaki Source Control ikonuna tıklayın
   - Veya `Ctrl+Shift+G`

3. **Değişiklikleri Görün:**
   - Değişen dosyalar "Changes" altında görünür
   - Her dosyanın yanında "+" işareti var

4. **Dosyaları Stage'e Alın:**
   - Her dosyanın yanındaki "+" işaretine tıklayın
   - Veya "Stage All Changes" butonuna tıklayın

5. **Commit Mesajı Yazın:**
   - Üstteki kutucuğa commit mesajını yazın
   - Örnek: `feat: favoriler özelliği eklendi`

6. **Commit Yapın:**
   - "Commit" butonuna tıklayın
   - Veya `Ctrl+Enter`

### 🔄 3. Branch Değiştirme (Cursor'da)

#### **Yöntem 1: Status Bar'dan**

1. **Alt kısımdaki status bar'da branch adına tıklayın**
2. **Açılan listeden istediğiniz branch'i seçin**
3. **Örnek: `main` → `develop` → `feature/favorites`**

#### **Yöntem 2: Command Palette'den**

1. **Command Palette'i açın** (Ctrl+Shift+P)
2. **"Git: Checkout to" yazın**
3. **Branch'i seçin**

#### **Yöntem 3: Terminal'den**

```bash
git checkout develop
git checkout feature/favorites
```

### 🔀 4. Merge İşlemi (Cursor'da)

#### **Adım Adım:**

1. **Main veya develop branch'ine geçin:**
   ```bash
   git checkout develop
   ```

2. **Merge yapmak istediğiniz branch'i birleştirin:**
   ```bash
   git merge feature/favorites
   ```

3. **Çakışma (Conflict) Varsa:**
   - Cursor otomatik olarak gösterir
   - "Accept Current Change" veya "Accept Incoming Change" seçin
   - Veya manuel olarak düzenleyin

4. **Merge'i tamamlayın:**
   - Değişiklikleri commit edin
   - `git commit` (merge commit mesajı otomatik gelir)

### 📤 5. GitHub'a Gönderme (Push) (Cursor'da)

#### **Adım Adım:**

1. **Source Control Panel'i açın**
2. **"Sync Changes" veya "Push" butonuna tıklayın**
3. **Veya Terminal'den:**
   ```bash
   git push origin feature/favorites
   ```

### 📥 6. GitHub'dan Çekme (Pull) (Cursor'da)

#### **Adım Adım:**

1. **Source Control Panel'i açın**
2. **"..." menüsünden "Pull" seçin**
3. **Veya Terminal'den:**
   ```bash
   git pull origin develop
   ```

### 🗑️ 7. Branch Silme (Cursor'da)

#### **Terminal'den:**

```bash
# Yerel branch'i sil
git branch -d feature/favorites

# GitHub'daki branch'i sil
git push origin --delete feature/favorites
```

### 🎯 IPPL4Y İçin Pratik Örnek (Cursor'da)

**Senaryo: Favoriler özelliği ekleniyor**

1. **develop branch'ine geç:**
   - Status bar'dan `develop` seç

2. **Yeni branch oluştur:**
   - `feature/favorites`
   - Terminal: `git checkout -b feature/favorites`

3. **Kodları düzenle:**
   - `LiveTVContent.jsx` dosyasını aç
   - Favori butonu ekle
   - Kaydet (Ctrl+S)

4. **Commit yap:**
   - Source Control Panel'i aç (Ctrl+Shift+G)
   - Değişiklikleri stage'e al (+)
   - Commit mesajı: `feat: favoriler butonu eklendi`
   - Commit butonuna tıkla

5. **GitHub'a gönder:**
   - "Sync Changes" veya "Push" butonuna tıkla

6. **develop'a merge et:**
   - `develop` branch'ine geç
   - Terminal: `git merge feature/favorites`
   - Push yap

7. **main'e merge et (hazır olduğunda):**
   - `main` branch'ine geç
   - Terminal: `git merge develop`
   - Push yap

### 💡 Cursor İpuçları

1. **Git Graph Extension:**
   - Cursor'da Git Graph extension'ı yükleyin
   - Branch'leri görsel olarak görebilirsiniz

2. **Keyboard Shortcuts:**
   - `Ctrl+Shift+G`: Source Control
   - `Ctrl+Shift+P`: Command Palette
   - `Ctrl+` `: Terminal

3. **Status Bar:**
   - Alt kısımda branch adı ve commit durumu görünür
   - Tıklayarak hızlı işlem yapabilirsiniz

---

## 📚 Özet ve Best Practices

### ✅ Yapılması Gerekenler

1. **Main'i koruyun:** Sadece test edilmiş kodlar main'e gelir
2. **Branch kullanın:** Her özellik için ayrı branch
3. **Açıklayıcı commit mesajları:** Ne yapıldığı belli olsun
4. **Düzenli commit:** Mantıklı işler bittiğinde commit yapın
5. **Test edin:** Commit'ten önce kodun çalıştığından emin olun

### ❌ Yapılmaması Gerekenler

1. **Main'e direkt commit:** Her zaman branch kullanın
2. **Genel commit mesajları:** "değişiklik" gibi mesajlar yazmayın
3. **Çalışmayan kod commit:** Test etmeden commit yapmayın
4. **Büyük commit'ler:** Küçük, mantıklı commit'ler yapın
5. **Branch'i unutmak:** İş bitince branch'i silin veya merge edin

### 🎯 IPPL4Y İçin Önerilen Workflow

```
1. develop branch'inden feature branch oluştur
2. Özelliği geliştir, test et
3. Commit yap (açıklayıcı mesajla)
4. develop'a merge et
5. develop'da test et
6. Hazır olduğunda main'e merge et
7. Feature branch'i sil
```

---

## 🆘 Yardım ve Kaynaklar

### Git Komutları Referansı

```bash
# Branch oluştur
git checkout -b feature/yeni-ozellik

# Branch değiştir
git checkout develop

# Değişiklikleri göster
git status

# Commit yap
git add .
git commit -m "feat: yeni özellik"

# Push yap
git push origin feature/yeni-ozellik

# Pull yap
git pull origin develop

# Merge yap
git merge feature/yeni-ozellik

# Branch sil
git branch -d feature/yeni-ozellik
```

### İletişim

Sorularınız için GitHub Issues kullanabilirsiniz.

---

**Son Güncelleme:** 2025-01-27
**Proje:** IPPL4Y - IPTV Streaming Platform



