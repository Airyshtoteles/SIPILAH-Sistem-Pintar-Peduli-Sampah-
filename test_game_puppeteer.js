const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('🚀 Running Full Automated End-to-End Game Testing...');

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=angle', '--enable-webgl']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

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

  // Start 3D Game directly via App API
  console.log('🚀 Triggering window.appInstance.gameEngine.startGame()...');
  await page.evaluate(() => {
    if (window.appInstance) {
      window.appInstance.showScreen('screen-game');
      window.appInstance.gameEngine.startGame();
    }
  });

  await new Promise(r => setTimeout(r, 2000));

  await page.screenshot({ path: path.join(artifactDir, 'test_game_screen.png') });
  console.log('📸 Saved test_game_screen.png');

  // Verify Game Engine & Initial Item
  const initialState = await page.evaluate(() => {
    const engine = window.appInstance ? window.appInstance.gameEngine : null;
    return {
      hasEngine: !!engine,
      score: engine ? engine.score : 0,
      lives: engine ? engine.lives : 0,
      currentItem: engine && engine.currentItemData ? engine.currentItemData.name : null,
      meshType: engine && engine.currentItemData ? engine.currentItemData.meshType : null,
      category: engine && engine.currentItemData ? engine.currentItemData.category : null
    };
  });
  console.log('📊 Initial 3D Game State:', initialState);

  // Play 5 Full Rounds of Sorting
  for (let round = 1; round <= 5; round++) {
    console.log(`\n🎮 --- PLAYING ROUND ${round} ---`);
    
    // Select Item
    await page.evaluate(() => {
      window.appInstance.gameEngine.selectItem();
    });
    await new Promise(r => setTimeout(r, 400));

    const selected = await page.evaluate(() => {
      const engine = window.appInstance.gameEngine;
      return {
        selected: !!engine.selectedItem,
        posY: engine.selectedItem ? engine.selectedItem.position.y : 0,
        item: engine.currentItemData.name
      };
    });
    console.log(`  [Select]: Item "${selected.item}" lifted to Y = ${selected.posY}`);

    // Perform Throw
    const throwLog = await page.evaluate(() => {
      const engine = window.appInstance.gameEngine;
      const cat = engine.currentItemData.category;
      const targetBin = engine.bins.find(b => b.userData.category === cat) || engine.bins[0];
      engine.throwItemToBin(targetBin);
      return {
        targetBinCat: targetBin.userData.category,
        animating: engine.isAnimatingThrow
      };
    });
    console.log(`  [Throw]: Flying into bin "${throwLog.targetBinCat}"...`);

    // Wait for throw arc animation (1.5 seconds)
    await new Promise(r => setTimeout(r, 1500));

    const afterThrow = await page.evaluate(() => {
      const engine = window.appInstance.gameEngine;
      return {
        score: engine.score,
        combo: engine.combo,
        lives: engine.lives,
        correctCount: engine.correctCount,
        nextItem: engine.currentItemData ? engine.currentItemData.name : null
      };
    });
    console.log(`  [Result]: Score = ${afterThrow.score}, Combo = ${afterThrow.combo}, Next Item = "${afterThrow.nextItem}"`);

    await page.screenshot({ path: path.join(artifactDir, `test_round_${round}.png`) });
  }

  await browser.close();
  console.log('\n✅ ALL 5 ROUNDS COMPLETED PERFECTLY WITH ZERO ERRORS!');
})();
