import { Resvg } from '@resvg/resvg-js';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const publicDir = path.resolve('public');

// Master signature SVG glyph from public/favicon.svg
const rawSvg = fs.readFileSync(path.join(publicDir, 'favicon.svg'), 'utf8');
const pathDataMatch = rawSvg.match(/d="([^"]+)"/);
if (!pathDataMatch) {
  throw new Error('Could not find path data in public/favicon.svg');
}
const pathData = pathDataMatch[1];

// 1. Updated Universal favicon.svg with theme color tokens
const faviconSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <style>
    :root {
      --sig-color: #111111;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --sig-color: #f0e6d3;
      }
    }
    .sig-glyph {
      fill: var(--sig-color);
      stroke: var(--sig-color);
      stroke-width: 35;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  </style>
  <g transform="translate(57.47, 518.83) scale(0.091469, -0.091469)">
    <path class="sig-glyph" d="${pathData}" />
  </g>
</svg>
`;
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), faviconSvg, 'utf8');
console.log('✅ Updated public/favicon.svg (with theme tokens)');

// 2. Safari Pinned Tab SVG (pure monochrome black path, no embedded style/background)
const safariPinnedTabSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <g transform="translate(57.47, 518.83) scale(0.091469, -0.091469)">
    <path fill="#000000" stroke="#000000" stroke-width="35" stroke-linecap="round" stroke-linejoin="round" d="${pathData}" />
  </g>
</svg>
`;
fs.writeFileSync(path.join(publicDir, 'safari-pinned-tab.svg'), safariPinnedTabSvg, 'utf8');
console.log('✅ Generated public/safari-pinned-tab.svg');

// Render transparent dark ink (light mode) SVG to PNG buffer
function renderSvgToPng(svgString, size) {
  const resvg = new Resvg(svgString, {
    fitTo: { mode: 'width', value: size }
  });
  return resvg.render().asPng();
}

// Transparent light-mode glyph SVG (dark ink)
const lightGlyphSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <g transform="translate(57.47, 518.83) scale(0.091469, -0.091469)">
    <path fill="#111111" stroke="#111111" stroke-width="35" stroke-linecap="round" stroke-linejoin="round" d="${pathData}" />
  </g>
</svg>`;

// Solid dark background with cream signature (for Apple Touch & PWA icons)
function createSolidAppIconSvg(bg = '#000000', fg = '#f0e6d3', padding = 0.18) {
  // Scaling down glyph inside center
  const scale = 1 - (padding * 2);
  const offset = 256 * (1 - scale);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${bg}" />
  <g transform="translate(${offset}, ${offset}) scale(${scale})">
    <g transform="translate(57.47, 518.83) scale(0.091469, -0.091469)">
      <path fill="${fg}" stroke="${fg}" stroke-width="35" stroke-linecap="round" stroke-linejoin="round" d="${pathData}" />
    </g>
  </g>
</svg>`;
}

// 3. Render raster PNGs
const png32 = renderSvgToPng(lightGlyphSvg, 32);
fs.writeFileSync(path.join(publicDir, 'favicon-32x32.png'), png32);
console.log('✅ Generated public/favicon-32x32.png (32x32)');

const png16 = renderSvgToPng(lightGlyphSvg, 16);
fs.writeFileSync(path.join(publicDir, 'favicon-16x16.png'), png16);
console.log('✅ Generated public/favicon-16x16.png (16x16)');

const appleTouchPng = renderSvgToPng(createSolidAppIconSvg('#000000', '#f0e6d3', 0.18), 180);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleTouchPng);
console.log('✅ Generated public/apple-touch-icon.png (180x180, iOS squircle safe)');

const icon192 = renderSvgToPng(createSolidAppIconSvg('#000000', '#f0e6d3', 0.15), 192);
fs.writeFileSync(path.join(publicDir, 'icon-192.png'), icon192);
console.log('✅ Generated public/icon-192.png (192x192, Android/PWA)');

const icon512 = renderSvgToPng(createSolidAppIconSvg('#000000', '#f0e6d3', 0.15), 512);
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), icon512);
console.log('✅ Generated public/icon-512.png (512x512, PWA splash/maskable)');

// 4. Generate multi-resolution favicon.ico using Python PIL
const pyScript = `
from PIL import Image
import os

img16 = Image.open('public/favicon-16x16.png')
img32 = Image.open('public/favicon-32x32.png')

# Create 48x48 from 512 for the largest ICO layer
img512 = Image.open('public/icon-512.png')
img48_transparent = Image.open('/tmp/test-resvg.png').resize((48, 48), Image.Resampling.LANCZOS)

# Save multi-size favicon.ico containing 16x16, 32x32, 48x48
img32.save('public/favicon.ico', format='ICO', sizes=[(16, 16), (32, 32), (48, 48)], append_images=[img16, img48_transparent])
print('✅ Generated public/favicon.ico (multi-layer 16/32/48 ICO)')
`;
fs.writeFileSync('/tmp/make_ico.py', pyScript, 'utf8');
execSync('python3 /tmp/make_ico.py', { stdio: 'inherit' });

console.log('🎉 All favicon and icon assets generated successfully!');
