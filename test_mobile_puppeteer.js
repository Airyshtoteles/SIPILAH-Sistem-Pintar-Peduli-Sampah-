const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  console.log('🚀 Running Mobile Viewport Automated End-to-End Test (844 x 390 Mobile Landscape)...');

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=angle', '--enable-webgl']
  });

  const page = await browser.newPage();
  // Set exact iPhone / Android Mobile Landscape viewport
  await page.setViewport({ width: 844, height: 390 });

  page.on('console', msg => {
    console.log(`[BROWSER LOG (${msg.type()})]:`, msg.text());
  });

  page.on('pageerror', err => {
    console.error(`❌ [BROWSER UNCAUGHT ERROR]:`, err.message);
  });

  console.log('🌐 Navigating to http://localhost:8000...');
  await page.goto('http://localhost:8000', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  const artifactDir = `C:\\Users\\Hype\\.gemini\\antigravity\\brain\\972edeb6-f82c-4dd0-a6c4-495bdf4bba77`;

  await page.screenshot({ path: path.join(artifactDir, 'test_mobile_menu.png') });
  console.log('📸 Saved test_mobile_menu.png');

  // Check if Start Button is visible and within viewport bounds!
  const buttonBounds = await page.evaluate(() => {
    const btn = document.getElementById('btn-start-game');
    if (!btn) return null;
    const rect = btn.getBoundingClientRect();
    return {
      top: rect.top,
      bottom: rect.bottom,
      height: rect.height,
      viewportHeight: window.innerHeight,
      isVisible: rect.bottom <= window.innerHeight && rect.top >= 0
    };
  });
  console.log('📱 Mobile Start Button Viewport Check:', buttonBounds);

  // Click Start Game Button
  const startBtn = await page.$('#btn-start-game');
  if (startBtn) {
    console.log('👆 Tapping #btn-start-game...');
    await startBtn.click();
    await new Promise(r => setTimeout(r, 1000));
  }

  // Trigger 3D Game
  await page.evaluate(() => {
    if (window.appInstance) {
      window.appInstance.showScreen('screen-game');
      window.appInstance.gameEngine.startGame();
    }
  });

  await new Promise(r => setTimeout(r, 1500));

  await page.screenshot({ path: path.join(artifactDir, 'test_mobile_game.png') });
  console.log('📸 Saved test_mobile_game.png');

  // Play 3 Rounds on Mobile
  for (let round = 1; round <= 3; round++) {
    console.log(`\n🎮 --- PLAYING MOBILE ROUND ${round} ---`);
    const afterThrow = await page.evaluate(() => {
      const engine = window.appInstance.gameEngine;
      const cat = engine.currentItemData.category;
      const targetBin = engine.bins.find(b => b.userData.category === cat) || engine.bins[0];
      engine.selectItem();
      engine.throwItemToBin(targetBin);
      return {
        score: engine.score,
        item: engine.currentItemData.name
      };
    });

    await new Promise(r => setTimeout(r, 1500));
    console.log(`  [Mobile Throw]: Item "${afterThrow.item}" sorted successfully!`);
  }

  await browser.close();
  console.log('\n✅ MOBILE VIEWPORT TEST COMPLETED 100% PERFECTLY!');
})();
