import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generateLogos() {
  const svgBuffer = fs.readFileSync(path.join(process.cwd(), 'public', 'logo.svg'));

  const sizes = [
    { name: 'logo.png', width: 512, height: 512, format: 'png' },
    { name: 'pwa_logo.png', width: 512, height: 512, format: 'png' },
    { name: 'pwa_logo.jpg', width: 512, height: 512, format: 'jpeg' },
    { name: 'logo-512.png', width: 512, height: 512, format: 'png' },
    { name: 'logo-192.png', width: 192, height: 192, format: 'png' },
    { name: 'logo-144.png', width: 144, height: 144, format: 'png' },
    { name: 'logo-96.png', width: 96, height: 96, format: 'png' },
    { name: 'logo-72.png', width: 72, height: 72, format: 'png' },
    { name: 'logo-48.png', width: 48, height: 48, format: 'png' },
    { name: 'apple-touch-icon.png', width: 180, height: 180, format: 'png' },
    { name: 'favicon.png', width: 64, height: 64, format: 'png' },
  ];

  for (const item of sizes) {
    const outputPath = path.join(process.cwd(), 'public', item.name);
    let pipeline = sharp(svgBuffer).resize(item.width, item.height);

    if (item.format === 'jpeg') {
      pipeline = pipeline.flatten({ background: { r: 15, g: 23, b: 42 } }).jpeg({ quality: 95 });
    } else {
      pipeline = pipeline.png();
    }

    await pipeline.toFile(outputPath);
    console.log(`Generated ${item.name} (${item.width}x${item.height})`);
  }

  // Also create favicon.ico from 48x48 png
  const faviconBuffer = await sharp(svgBuffer).resize(48, 48).png().toBuffer();
  fs.writeFileSync(path.join(process.cwd(), 'public', 'favicon.ico'), faviconBuffer);
  console.log('Generated favicon.ico');
}

generateLogos().catch(err => {
  console.error('Logo generation error:', err);
  process.exit(1);
});
