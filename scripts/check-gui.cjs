// Build and serve web/ first. Run with NODE_PATH pointing to an installed playwright package.
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const url = process.env.GUI_TEST_URL || 'http://127.0.0.1:5173';

async function checkSegments(page) {
  const failures = await page.locator('.seg:visible').evaluateAll(groups => groups.flatMap(group => {
    const buttons = [...group.querySelectorAll('button')];
    const rect = group.getBoundingClientRect();
    const boxes = buttons.map(button => button.getBoundingClientRect());
    if (!boxes.length) return [];
    const widths = boxes.map(box => box.width);
    const cs = getComputedStyle(group);
    const left = boxes[0].left - rect.left;
    const right = rect.right - boxes.at(-1).right;
    return Math.max(...widths) - Math.min(...widths) > 1 || Math.abs(left - parseFloat(cs.paddingLeft)) > 1 || Math.abs(right - parseFloat(cs.paddingRight)) > 1
      ? [{ text: group.innerText, left, right, widths }] : [];
  }));
  assert.deepEqual(failures, [], 'Segment widths and insets must be even');
}

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const errors = [];
  try {
    const page = await browser.newPage({ viewport: { width: 1112, height: 863 } });
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => localStorage.setItem('mbs:welcomed', '1'));
    await page.goto(url);
    const create = page.getByRole('button', { name: '새 프로젝트', exact: true }).first();
    await create.click();
    await page.locator('#np-t').waitFor();
    await page.waitForTimeout(60);
    assert.equal(await page.locator('#np-t').evaluate(el => el === document.activeElement), true);
    const modal = page.locator('.modal');
    const modalButtons = modal.locator('button');
    await modalButtons.last().focus();
    await page.keyboard.press('Tab');
    assert.equal(await modalButtons.first().evaluate(el => el === document.activeElement), true);
    await page.keyboard.press('Shift+Tab');
    assert.equal(await modalButtons.last().evaluate(el => el === document.activeElement), true);
    await page.keyboard.press('Escape');
    assert.equal(await create.evaluate(el => el === document.activeElement), true);
    await page.getByRole('button', { name: '예시 프로젝트 열기', exact: true }).click();
    for (const width of [1112, 768, 393, 320]) {
      await page.setViewportSize({ width, height: 900 });
      for (const step of ['brief', 'script', 'narr', 'edit', 'export']) {
        await page.locator(`[data-act="go"][data-arg="${step}"]`).first().click();
        await checkSegments(page);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${width} ${step} page overflow`);
        const unnamed = await page.locator('input[type="range"]:visible').evaluateAll(inputs => inputs.filter(input => !input.getAttribute('aria-label') && !input.labels?.length).map(input => input.id));
        assert.deepEqual(unnamed, []);
      }
    }
    await page.setViewportSize({ width: 1112, height: 863 });
    await page.getByRole('button', { name: 'BGM 설정', exact: true }).first().click();
    await page.locator('[data-bgm-mode="expert"]').click();
    await page.locator('.modal').evaluate(el => Promise.all(el.getAnimations().map(animation => animation.finished)));
    await checkSegments(page);
    await page.evaluate(() => toast('설정을 확인했습니다.', { ms: 1000 }));
    const overlaps = await page.evaluate(() => {
      const done = document.querySelector('[data-x2]').getBoundingClientRect();
      return [...document.querySelectorAll('.toast')].some(el => {
        const r = el.getBoundingClientRect();
        return r.left < done.right && r.right > done.left && r.top < done.bottom && r.bottom > done.top;
      });
    });
    assert.equal(overlaps, false, 'Notifications must not cover the Done button');
    await page.locator('[data-x2]').focus();
    await page.keyboard.press('Tab');
    assert.equal(await page.locator('.modal [data-x]').evaluate(el => el === document.activeElement), true);
    await page.keyboard.press('Escape');
    assert.equal(await page.evaluate(() => document.activeElement.dataset.act), 'bgm');
    await page.locator('[data-act="go"][data-arg="export"]').first().click();
    const downloaded = page.waitForEvent('download');
    await page.locator('[data-act="dlBrief"]').first().click();
    const file = await downloaded;
    assert.match(file.suggestedFilename(), /\.md$/);
    const stream = await file.createReadStream();
    let brief = '';
    for await (const chunk of stream) brief += chunk.toString();
    assert.match(brief, /motion-brief\/1/);
    assert.match(brief, /메모: 씬 전환마다/);
    await file.delete();
    const projectId = await page.evaluate(() => S.proj.id);
    await page.locator('[data-act="import"]').first().click();
    await page.locator('#imp-txt').fill('잘못된 형식의 안내서');
    assert.equal(await page.locator('.modal [data-ok]').isDisabled(), true);
    assert.match(await page.locator('#imp-st').innerText(), /데이터를 찾지 못했습니다/);
    await page.keyboard.press('Escape');
    assert.equal(await page.evaluate(() => S.proj.id), projectId);

    const mobile = await browser.newPage({ viewport: { width: 393, height: 852 }, isMobile: true, hasTouch: true });
    mobile.on('pageerror', error => errors.push(error.message));
    await mobile.addInitScript(() => localStorage.setItem('mbs:welcomed', '1'));
    await mobile.goto(url);
    await mobile.getByRole('button', { name: '예시 프로젝트 열기', exact: true }).click();
    await mobile.getByRole('button', { name: 'BGM 설정', exact: true }).first().click();
    await mobile.locator('[data-bgm-mode="expert"]').click();
    await mobile.locator('.modal').evaluate(el => Promise.all(el.getAnimations().map(animation => animation.finished)));
    await checkSegments(mobile);
    const small = await mobile.locator('.bgm-modal .seg button:visible,.bgm-modal .chip:visible,.bgm-modal .preset:visible,.bgm-modal .hitb:visible,.bgm-modal .ibtn:visible,.bgm-modal .btn:visible').evaluateAll(buttons => buttons.filter(button => button.getBoundingClientRect().height < 44).map(button => button.innerText || button.getAttribute('aria-label')));
    assert.deepEqual(small, [], 'Mobile primary controls need 44px height');
    assert.ok(await mobile.locator('#bgm-refs').evaluate(el => parseFloat(getComputedStyle(el).fontSize) >= 16));
    await mobile.locator('#bgm-refs').scrollIntoViewIfNeeded();
    await mobile.locator('#bgm-refs').fill('참고곡 메모');
    await mobile.locator('[data-x2]').click();
    assert.deepEqual(errors, []);
    console.log('PASS: equal segment widths/insets, five stages at 320/393/768/1112px, named ranges, modal focus loop/restore, unobstructed Done, complete brief download, invalid import feedback, mobile tap/input sizes');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
