import puppeteer from 'puppeteer';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SIZE = 1024;

const iconHtml = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    width:${SIZE}px; height:${SIZE}px;
    background: linear-gradient(145deg, #FF7A95 0%, #ea546c 35%, #d5294d 70%, #C01E42 100%);
    display:flex; align-items:center; justify-content:center;
    overflow:hidden;
    position:relative;
  }
  /* Subtle radial highlight */
  body::before {
    content:'';
    position:absolute;
    top:-20%; left:-20%;
    width:80%; height:80%;
    background: radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 65%);
  }
  .icon-wrap {
    position:relative;
    width:620px; height:480px;
    display:flex; align-items:center; justify-content:center;
  }
  /* Shared heart style */
  .heart {
    position:absolute;
    width:380px; height:380px;
  }
  .heart svg.shape {
    width:100%; height:100%;
    filter: drop-shadow(0 16px 40px rgba(120,10,30,0.35));
  }
  /* Left heart */
  .heart-left {
    left:0; top:50%;
    transform: translateY(-50%) rotate(-8deg);
    z-index:1;
  }
  /* Right heart */
  .heart-right {
    right:0; top:50%;
    transform: translateY(-50%) rotate(8deg);
    z-index:2;
  }
  /* Checkmark centered inside each heart */
  .check {
    position:absolute;
    top:44%; left:50%;
    transform:translate(-50%, -50%);
  }
  .check svg {
    width:160px; height:160px;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.08));
  }
</style></head>
<body>
  <div class="icon-wrap">
    <div class="heart heart-left">
      <svg class="shape" viewBox="0 0 24 24">
        <defs>
          <linearGradient id="h1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="rgba(255,255,255,0.95)"/>
            <stop offset="100%" stop-color="rgba(255,255,255,0.80)"/>
          </linearGradient>
        </defs>
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="url(#h1)"/>
      </svg>
      <div class="check">
        <svg viewBox="0 0 24 24" fill="none" stroke="#d5294d" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="4 12 9.5 17.5 20 6"/>
        </svg>
      </div>
    </div>
    <div class="heart heart-right">
      <svg class="shape" viewBox="0 0 24 24">
        <defs>
          <linearGradient id="h2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="100%" stop-color="rgba(255,255,255,0.88)"/>
          </linearGradient>
        </defs>
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="url(#h2)"/>
      </svg>
      <div class="check">
        <svg viewBox="0 0 24 24" fill="none" stroke="#d5294d" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="4 12 9.5 17.5 20 6"/>
        </svg>
      </div>
    </div>
  </div>
</body></html>`;

const splashHtml = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    width:${SIZE}px; height:${SIZE}px;
    background: #FAF8FC;
    display:flex; align-items:center; justify-content:center;
    overflow:hidden;
  }
  .icon-wrap {
    position:relative;
    width:480px; height:380px;
    display:flex; align-items:center; justify-content:center;
  }
  .heart {
    position:absolute;
    width:300px; height:300px;
  }
  .heart svg.shape {
    width:100%; height:100%;
    filter: drop-shadow(0 10px 25px rgba(213,41,77,0.2));
  }
  .heart-left {
    left:0; top:50%;
    transform: translateY(-50%) rotate(-8deg);
    z-index:1;
  }
  .heart-right {
    right:0; top:50%;
    transform: translateY(-50%) rotate(8deg);
    z-index:2;
  }
  .check {
    position:absolute;
    top:44%; left:50%;
    transform:translate(-50%, -50%);
  }
  .check svg {
    width:120px; height:120px;
  }
</style></head>
<body>
  <div class="icon-wrap">
    <div class="heart heart-left">
      <svg class="shape" viewBox="0 0 24 24">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#F0598A"/>
      </svg>
      <div class="check">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="4 12 9.5 17.5 20 6"/>
        </svg>
      </div>
    </div>
    <div class="heart heart-right">
      <svg class="shape" viewBox="0 0 24 24">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#ea546c"/>
      </svg>
      <div class="check">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="4 12 9.5 17.5 20 6"/>
        </svg>
      </div>
    </div>
  </div>
</body></html>`;

async function main() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: SIZE, height: SIZE, deviceScaleFactor: 1 });

  // App icon (pink gradient bg, white hearts, pink checkmarks)
  await page.setContent(iconHtml, { waitUntil: 'domcontentloaded' });

  const iconPath = join(__dirname, '..', 'assets', 'icon.png');
  await page.screenshot({ path: iconPath, type: 'png', clip: { x: 0, y: 0, width: SIZE, height: SIZE } });
  console.log('Saved icon.png');

  const adaptivePath = join(__dirname, '..', 'assets', 'adaptive-icon.png');
  await page.screenshot({ path: adaptivePath, type: 'png', clip: { x: 0, y: 0, width: SIZE, height: SIZE } });
  console.log('Saved adaptive-icon.png');

  // Splash icon (light bg, pink hearts, white checkmarks)
  await page.setContent(splashHtml, { waitUntil: 'domcontentloaded' });

  const splashPath = join(__dirname, '..', 'assets', 'splash-icon.png');
  await page.screenshot({ path: splashPath, type: 'png', clip: { x: 0, y: 0, width: SIZE, height: SIZE } });
  console.log('Saved splash-icon.png');

  await browser.close();
  console.log('\nDone!');
}

main().catch(console.error);
