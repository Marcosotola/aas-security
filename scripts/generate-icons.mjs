import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logoPath = path.join(__dirname, '../public/logo/logo.png');
const iconsDir = path.join(__dirname, '../public/icons');

const sizes = [192, 512];

for (const size of sizes) {
    const padding = Math.round(size * 0.12); // 12% padding on each side
    const logoSize = size - padding * 2;

    await sharp({
        create: {
            width: size,
            height: size,
            channels: 4,
            background: { r: 255, g: 255, b: 255, alpha: 1 },
        },
    })
        .composite([
            {
                input: await sharp(logoPath)
                    .resize(logoSize, logoSize, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
                    .toBuffer(),
                gravity: 'centre',
            },
        ])
        .png()
        .toFile(path.join(iconsDir, `icon-${size}.png`));

    console.log(`✅ icon-${size}.png generado`);
}

console.log('🎉 Íconos listos en /public/icons/');
