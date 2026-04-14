import sharp from 'sharp';
import { writeFileSync, mkdirSync } from 'node:fs';

mkdirSync('public', { recursive: true });

const svg = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="#120B06"/>
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central"
        font-family="Georgia, serif" font-weight="700"
        font-size="${size * 0.55}" fill="#C8974A">B</text>
</svg>
`;

for (const size of [192, 512]) {
  const buf = await sharp(Buffer.from(svg(size))).png().toBuffer();
  writeFileSync(`public/icon-${size}.png`, buf);
  console.log(`wrote public/icon-${size}.png (${buf.length} bytes)`);
}
