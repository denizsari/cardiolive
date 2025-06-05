const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function optimizeImages() {
  console.log('🖼️  Kardiyolive Görsel Optimizasyonu');
  console.log('====================================\n');

  const baseDir = path.join(__dirname, '..', 'frontend', 'public', 'images');
  const dirs = ['products', 'mockups', 'gallery'];

  for (const dir of dirs) {
    const sourceDir = path.join(baseDir, dir);
    const optimizedDir = path.join(baseDir, dir, 'optimized');

    try {
      // Create optimized directory
      await fs.mkdir(optimizedDir, { recursive: true });
      console.log(`📁 ${dir} optimized klasörü oluşturuldu`);

      // Get all image files
      const files = await fs.readdir(sourceDir);
      const imageFiles = files.filter(file => 
        /\.(jpg|jpeg|png|webp)$/i.test(file) && !path.dirname(file).includes('optimized')
      );

      console.log(`🔍 ${dir} klasöründe ${imageFiles.length} görsel bulundu`);

      for (const file of imageFiles) {
        const inputPath = path.join(sourceDir, file);
        const outputPath = path.join(optimizedDir, file.replace(/\.(jpg|jpeg|png)$/i, '.webp'));

        try {
          const stats = await fs.stat(inputPath);
          const originalSize = stats.size;

          // Optimize image
          await sharp(inputPath)
            .resize(800, 600, { 
              fit: 'inside', 
              withoutEnlargement: true 
            })
            .webp({ 
              quality: 85,
              effort: 6
            })
            .toFile(outputPath);

          const optimizedStats = await fs.stat(outputPath);
          const optimizedSize = optimizedStats.size;
          const compressionRatio = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);

          console.log(`✅ ${file} -> ${path.basename(outputPath)} (${compressionRatio}% küçültüldü)`);

        } catch (error) {
          console.error(`❌ ${file} optimizasyonu başarısız: ${error.message}`);
        }
      }

      console.log(`🎉 ${dir} klasörü optimizasyonu tamamlandı\n`);

    } catch (error) {
      console.error(`❌ ${dir} klasörü işlenirken hata: ${error.message}\n`);
    }
  }

  console.log('✨ Tüm görseller başarıyla optimize edildi!');
  console.log('📊 WebP formatında, %85 kalite ile sıkıştırıldı');
  console.log('📐 Maksimum boyut: 800x600 px');
}

// Create thumbnails for product grid
async function createThumbnails() {
  console.log('\n🖼️  Ürün Küçük Resimleri Oluşturuluyor');
  console.log('======================================\n');

  const productsDir = path.join(__dirname, '..', 'frontend', 'public', 'images', 'products');
  const thumbsDir = path.join(productsDir, 'thumbs');

  try {
    await fs.mkdir(thumbsDir, { recursive: true });
    console.log('📁 thumbs klasörü oluşturuldu');

    const files = await fs.readdir(productsDir);
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|webp)$/i.test(file) && !path.dirname(file).includes('thumbs')
    );

    console.log(`🔍 ${imageFiles.length} ürün görseli bulundu`);

    for (const file of imageFiles) {
      const inputPath = path.join(productsDir, file);
      const outputPath = path.join(thumbsDir, file.replace(/\.(jpg|jpeg|png)$/i, '.webp'));

      try {
        await sharp(inputPath)
          .resize(300, 300, { 
            fit: 'cover',
            position: 'center'
          })
          .webp({ 
            quality: 80,
            effort: 6
          })
          .toFile(outputPath);

        console.log(`✅ ${file} küçük resmi oluşturuldu`);

      } catch (error) {
        console.error(`❌ ${file} küçük resmi oluşturulamadı: ${error.message}`);
      }
    }

    console.log('\n🎉 Tüm küçük resimler oluşturuldu!');
    console.log('📐 Boyut: 300x300 px, kare format');

  } catch (error) {
    console.error(`❌ Küçük resim oluşturma hatası: ${error.message}`);
  }
}

async function main() {
  try {
    await optimizeImages();
    await createThumbnails();
    
    console.log('\n🚀 Görsel optimizasyonu tamamlandı!');
    console.log('💡 Frontend\'de optimized ve thumbs klasörlerindeki görselleri kullanabilirsiniz.');
    
  } catch (error) {
    console.error('❌ Ana işlem hatası:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { optimizeImages, createThumbnails };
