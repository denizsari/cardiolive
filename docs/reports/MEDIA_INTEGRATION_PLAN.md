# 📁 Kardiyolive Medya Klasörü Entegrasyon Planı

## 🎯 Mevcut İçerik Analizi

### 📋 Katalog Dosyaları (2 adet)
- `Kardiyolive Katalog TR.pdf` - Ana ürün kataloğu
- `kardiyolive 2.pdf` - Ek katalog

### 🫒 Ürün Görselleri (15+ adet)
#### Zeytin Çeşitleri:
- Bodrum zeytinyağlı zeytin
- Dilimli siyah zeytin  
- Doğal salamura gemlik yağlı zeytin
- Doğal salamura hatay halhalı zeytin
- Gemlik yeşil çizik zeytin
- Kalamata siyah zeytin
- Kalamata yeşil zeytin
- Yeşil kırma zeytin
- Yeşil çizik zeytin
- Zeytin siyah
- Izgara yeşil zeytin

#### Diğer Ürünler:
- Pekmez
- Turşu çeşitleri
- Pul biber
- Mevsimlik domates

### 🏺 Mockup Görselleri (3 adet)
- 18L zeytinyağı ambalajı
- 5L zeytinyağı ambalajı  
- Pekmez ambalajı

### 📸 Profesyonel Fotoğraflar (13+ adet)
- Ürün fotoğrafları (771A series)
- Çekim fotoğrafları (CEF series)
- Video içerik (DJI_0885.MOV)

## 📂 Önerilen Organizasyon

### 1. Frontend Public Klasör Yapısı
```
frontend/public/
├── images/
│   ├── products/
│   │   ├── olives/          # Zeytin görselleri
│   │   ├── oils/            # Zeytinyağı görselleri
│   │   ├── preserves/       # Turşu, pekmez vb.
│   │   └── spices/          # Baharat görselleri
│   ├── mockups/             # Ambalaj mockupları
│   ├── gallery/             # Profesyonel fotoğraflar
│   └── hero/                # Ana sayfa görselleri
├── catalogs/                # PDF kataloglar
└── videos/                  # Video içerikler
```

### 2. Veritabanı Ürün Güncellemeleri
Bu görseller mevcut ürünlerle eşleştirilmeli:
- Product model'ine image path'leri eklenmeli
- Ürün kategorileri bu görsellere göre güncellenebilir
- SEO için alt text'ler eklenebilir

### 3. Entegrasyon Adımları

#### Adım 1: Görselleri Taşıma
```bash
# Zeytin görselleri
cp Kardiyolive/*zeytin*.png frontend/public/images/products/olives/

# Zeytinyağı mockupları
cp Kardiyolive/olive*.png frontend/public/images/mockups/

# Diğer ürünler
cp Kardiyolive/pekmez*.png frontend/public/images/products/preserves/
cp Kardiyolive/turşu*.png frontend/public/images/products/preserves/
cp Kardiyolive/pulbiber*.png frontend/public/images/products/spices/

# Kataloglar
cp Kardiyolive/*.pdf frontend/public/catalogs/

# Profesyonel fotoğraflar
cp Kardiyolive/*.JPG frontend/public/images/gallery/
```

#### Adım 2: Ürün Verilerini Güncelleme
- Backend'de mevcut ürünlere image path'leri ekle
- Yeni ürün kategorileri oluştur
- Ürün açıklamalarını güncelle

#### Adım 3: Frontend Bileşenleri
- ProductCard bileşeninde yeni görselleri kullan
- Gallery bileşeni oluştur
- Katalog indirme bileşeni ekle

## 🚀 Hemen Yapılabilecekler

### 1. Hızlı Entegrasyon
En popüler ürün görsellerini hemen ekleyebiliriz:
- Ana sayfa hero görsellerine uygun olanları seç
- Ürün kartlarında kullanılacak temel görselleri taşı

### 2. SEO Optimizasyonu
- Dosya isimlerini SEO-friendly hale getir
- Alt text'ler ekle
- WebP formatına dönüştürmeyi düşün

### 3. Performans Optimizasyonu
- Görsel boyutlarını optimize et
- Lazy loading ekle
- Progressive loading uygula

## ⚡ Önerilen İlk Adım

1. En önemli ürün görsellerini frontend/public/images/'a taşıyalım
2. Mevcut ürün verilerini bu görsellerle eşleştirerek güncelleyelim
3. Ana sayfada yeni görselleri test edelim

Bu entegrasyonu şimdi başlatmak ister misiniz?
