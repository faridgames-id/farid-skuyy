import fs from 'fs';
import sharp from 'sharp';
import path from 'path';

const svgBuffer = fs.readFileSync(path.resolve('./public/icon.svg'));

async function generate() {
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.resolve('./public/icon-192x192.png'));
    
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.resolve('./public/icon-512x512.png'));
    
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.resolve('./public/icon.png'));
    
  // apple-touch-icon should be 180x180 typically, but let's just make it 512x512 as it was before, or 180x180
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.resolve('./public/apple-touch-icon.png'));
    
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.resolve('./public/favicon.png'));
    
  console.log('Icons generated successfully.');
}

generate().catch(console.error);
