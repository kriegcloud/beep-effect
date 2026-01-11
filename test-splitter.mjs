#!/usr/bin/env bun
const { chromium } = require('playwright');

async function testSplitter() {
  const browser = await chromium.launch({
    headless: false,
    devtools: true
  });
  const page = await browser.newPage();

  // Capture console logs
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('[Splitter]') || text.includes('[Model]') || text.includes('[Layout]')) {
      console.log('CONSOLE:', text);
    }
  });

  console.log('Navigating to demo page...');
  await page.goto('http://localhost:3000/demo', { waitUntil: 'networkidle' });

  // Wait for FlexLayout to render
  await page.waitForSelector('.flexlayout__splitter', { timeout: 10000 });
  console.log('Found splitter elements');

  // Get the first horizontal splitter
  const splitter = await page.$('.flexlayout__splitter_horz');
  if (!splitter) {
    console.error('No horizontal splitter found');
    await browser.close();
    return;
  }

  const box = await splitter.boundingBox();
  console.log('Splitter bounding box:', box);

  // Simulate drag by dispatching pointer events
  console.log('Dispatching pointerdown...');
  await page.evaluate(({x, y}) => {
    const splitter = document.querySelector('.flexlayout__splitter_horz');
    if (!splitter) {
      console.error('Splitter not found in evaluate');
      return;
    }

    const down = new PointerEvent('pointerdown', {
      bubbles: true,
      cancelable: true,
      clientX: x,
      clientY: y,
      pointerId: 1,
      pointerType: 'mouse',
      button: 0,
      buttons: 1
    });
    splitter.dispatchEvent(down);
  }, { x: box.x + box.width / 2, y: box.y + box.height / 2 });

  await page.waitForTimeout(100);

  console.log('Dispatching pointermove...');
  await page.evaluate(({x, y}) => {
    const move = new PointerEvent('pointermove', {
      bubbles: true,
      cancelable: true,
      clientX: x,
      clientY: y,
      pointerId: 1,
      pointerType: 'mouse',
      button: 0,
      buttons: 1
    });
    document.dispatchEvent(move);
  }, { x: box.x + box.width / 2 + 100, y: box.y + box.height / 2 });

  await page.waitForTimeout(100);

  console.log('Dispatching pointerup...');
  await page.evaluate(({x, y}) => {
    const up = new PointerEvent('pointerup', {
      bubbles: true,
      cancelable: true,
      clientX: x,
      clientY: y,
      pointerId: 1,
      pointerType: 'mouse',
      button: 0,
      buttons: 0
    });
    document.dispatchEvent(up);
  }, { x: box.x + box.width / 2 + 100, y: box.y + box.height / 2 });

  console.log('Waiting for logs...');
  await page.waitForTimeout(2000);

  console.log('Test complete');
  // Keep browser open for manual inspection
  // await browser.close();
}

testSplitter().catch(console.error);
