// Run after build with a local server: NODE_PATH=<playwright location> node scripts/check-bgm.cjs
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1112, height: 863 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => localStorage.setItem('mbs:welcomed', '1'));
    await page.goto(process.env.BGM_TEST_URL || 'http://127.0.0.1:5173');
    await page.getByRole('button', { name: '예시 프로젝트 열기', exact: true }).click();
    await page.getByRole('button', { name: 'BGM 설정', exact: true }).first().click();
    assert.equal(await page.locator('.bgm-settings').isVisible(), false);
    await page.locator('[data-act="bgmPreset"][data-arg="launch"]').click();
    const before = await page.evaluate(() => ({ selected: S.sel, notes: S.proj.bgm.notes }));
    const map = await page.locator('#moodpad').boundingBox();
    await page.mouse.move(map.x + map.width * .3, map.y + map.height * .7);
    await page.mouse.down();
    const initialBrief = await page.locator('[data-live="bgmPreview"]').innerText();
    const initialWords = await page.locator('[data-live="bgmWords"]').last().innerText();
    await page.mouse.move(map.x + map.width * .8, map.y + map.height * .25, { steps: 8 });
    // Assert while the pointer is still held: the brief must update during the drag.
    assert.match(await page.locator('#bgm-mood-values').innerText(), /에너지\s+80 \/ 100\s+밝기\s+75 \/ 100/);
    assert.notEqual(await page.locator('[data-live="bgmWords"]').last().innerText(), initialWords);
    assert.equal(await page.locator('[data-live="bgmPreview"]').innerText(), initialBrief);
    assert.deepEqual(await page.locator('#bgm-mood-values meter').evaluateAll(xs => xs.map(x => x.value)), [80, 75]);
    await page.mouse.up();
    await page.locator('#moodpad').press('ArrowRight');
    await page.locator('#moodpad').press('ArrowUp');
    assert.match(await page.locator('#bgm-mood-values').innerText(), /에너지\s+85 \/ 100\s+밝기\s+80 \/ 100/);
    assert.equal(await page.evaluate(() => S.sel), before.selected);
    assert.equal(await page.locator('#moodpad').evaluate(el => el === document.activeElement), true);
    // Pointer capture clamps values at the edges and commits on release.
    await page.mouse.move(map.x + map.width / 2, map.y + map.height / 2);
    await page.mouse.down();
    await page.mouse.move(map.x + map.width + 30, map.y - 20);
    await page.mouse.up();
    assert.deepEqual(await page.evaluate(() => [S.proj.bgm.energy, S.proj.bgm.valence]), [1, 1]);
    await page.getByRole('button', { name: '전문가 모드', exact: true }).click();
    assert.equal(await page.locator('.bgm-settings').isVisible(), true);
    assert.equal(await page.locator('#bgm-bpm').isVisible(), true);
    assert.equal(await page.locator('#arc').isVisible(), true);
    await page.locator('#bgm-refs').fill('Reference <test>');
    await page.locator('#bgm-notes').fill('메모 & 테스트');
    await page.locator('[data-toggle="p.bgm.instruments"][data-v="피아노"]').click();
    const settings = await page.evaluate(() => JSON.stringify(S.proj.bgm));
    await page.getByRole('button', { name: '심플 모드', exact: true }).click();
    await page.getByRole('button', { name: '전문가 모드', exact: true }).click();
    assert.equal(await page.evaluate(() => JSON.stringify(S.proj.bgm)), settings);
    assert.equal(await page.locator('#bgm-refs').inputValue(), 'Reference <test>');
    await page.locator('[data-bgm-lang="en"]').click();
    assert.match(await page.locator('[data-live="bgmEn"]').innerText(), /driving, powerful/);
    await page.locator('[data-bgm-lang="ko"]').click();
    // Keep the full sample memo for the desktop fit checks.
    await page.locator('#bgm-refs').fill('');
    await page.locator('#bgm-notes').fill(before.notes);
    for (const [width, height] of [[1112, 863], [1280, 720], [1440, 900]]) {
      await page.setViewportSize({ width, height });
      for (const mode of ['simple', 'expert']) {
        await page.locator(`[data-bgm-mode="${mode}"]`).click();
        const size = await page.locator('.bgm-modal .modal-b').evaluate(el => ({ h: el.clientHeight, sh: el.scrollHeight, w: el.clientWidth, sw: el.scrollWidth }));
        assert.ok(size.sh <= size.h + 1 && size.sw <= size.w + 1, `${width}×${height} ${mode}: ${JSON.stringify(size)}`);
      }
    }
    await page.setViewportSize({ width: 393, height: 852 });
    assert.ok(await page.locator('.bgm-modal').evaluate(el => el.scrollWidth <= el.clientWidth + 1));
    await page.locator('[data-x2]').click();
    await page.waitForTimeout(1600);
    await page.reload();
    await page.locator('.pcard').first().click();
    await page.getByRole('button', { name: 'BGM 설정', exact: true }).first().click();
    assert.deepEqual(await page.evaluate(() => [S.proj.bgm.energy, S.proj.bgm.valence]), [1, 1]);
    assert.deepEqual(errors, []);
    console.log('PASS: live drag, keyboard, clamping, mode preservation, brief languages, saved values, desktop fit and mobile width');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
