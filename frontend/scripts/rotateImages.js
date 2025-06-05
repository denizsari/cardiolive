import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sliderDir = path.join(__dirname, '../public/slider');

async function rotateImages() {
  try {
    console.log('🔄 Starting image rotation process...');
    
    // image2.jpg'yi 90 derece saat yönünün tersine döndür (270 derece saat yönü)
    const image2Path = path.join(sliderDir, 'image2.jpg');
    const image2Output = path.join(sliderDir, 'image2-rotated.jpg');
    
    await sharp(image2Path)
      .rotate(270) // 90 derece saat yönünün tersine = 270 derece saat yönü
      .jpeg({ quality: 85, progressive: true })
      .toFile(image2Output);
    
    console.log('✅ image2.jpg rotated and saved as image2-rotated.jpg');
    
    // Orijinal dosyayı yedekle ve yenisiyle değiştir
    const backupPath = path.join(sliderDir, 'image2-original.jpg');
    fs.renameSync(image2Path, backupPath);
    fs.renameSync(image2Output, image2Path);
    
    console.log('✅ Original image2.jpg backed up and replaced with rotated version');
    console.log('🎉 Image rotation completed successfully!');
    
  } catch (error) {
    console.error('❌ Error rotating images:', error);
  }
}

rotateImages();
