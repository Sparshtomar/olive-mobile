#!/usr/bin/env node
/**
 * Browser smoke test: drives the web build through the core flows the way a
 * user would, in dark and light, and screenshots each step.
 *
 * This is the "user-like testing" layer above the unit suite. It runs the real app
 * against the real API (point it at a local server with AI_PROVIDER=mock, or at the
 * deployed one), so it catches what unit tests cannot: a screen that renders blank, a
 * sheet that will not open, a theme token that went transparent.
 *
 * Needs: the API on http://localhost:4010 (or API_URL), and Google Chrome installed —
 * playwright-core drives the system browser, so there is no 300 MB browser download.
 *
 *   npm run e2e                 starts the web bundler itself, runs, stops it
 *   WEB_URL=http://localhost:8081 npm run e2e      reuse a bundler you already have running
 *
 * Screenshots land in e2e/screenshots/. Exit code is non-zero on any failed step or
 * uncaught page error.
 */
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const WEB_URL = process.env.WEB_URL ?? 'http://localhost:8081';
const API_URL = process.env.API_URL ?? 'http://localhost:4010';
const OUT = fileURLToPath(new URL('./screenshots/', import.meta.url));
mkdirSync(OUT, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const reachable = (url) =>
  fetch(url, { signal: AbortSignal.timeout(2000) }).then(
    (r) => r.ok,
    () => false,
  );

if (!(await reachable(`${API_URL}/health`))) {
  console.error(`x API not reachable at ${API_URL}. Start olive-server (AI_PROVIDER=mock is fine) or set API_URL.`);
  process.exit(1);
}

// Start Metro for web unless one is already serving.
let bundler;
if (!(await reachable(WEB_URL))) {
  const port = new URL(WEB_URL).port || '8081';
  bundler = spawn('npx', ['expo', 'start', '--web', '--port', port], {
    env: { ...process.env, CI: '1', EXPO_PUBLIC_API_URL: API_URL },
    stdio: 'ignore',
  });
  process.stdout.write('starting web bundler');
  for (let i = 0; i < 120 && !(await reachable(WEB_URL)); i++) {
    process.stdout.write('.');
    await sleep(1000);
  }
  console.log();
}

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const failures = [];

/** One pass through the app in a colour scheme. Each step screenshots; a thrown step is recorded, not fatal. */
async function run(scheme) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    colorScheme: scheme,
  });
  const page = await context.newPage();
  page.on('pageerror', (e) => failures.push(`[${scheme}] page error: ${e.message}`));

  const step = async (name, fn) => {
    try {
      await fn();
      await sleep(600);
      await page.screenshot({ path: `${OUT}${scheme}-${name}.png` });
      console.log(`  ✓ ${scheme} ${name}`);
    } catch (err) {
      failures.push(`[${scheme}] ${name}: ${String(err.message).split('\n')[0]}`);
      await page.screenshot({ path: `${OUT}${scheme}-${name}-FAILED.png` }).catch(() => {});
      console.log(`  x ${scheme} ${name}`);
    }
  };

  await step('1-onboarding', async () => {
    await page.goto(WEB_URL, { waitUntil: 'domcontentloaded' });
    await page.getByText("Hi, I'm Olive").waitFor({ timeout: 90_000 });
  });
  await step('2-today', async () => {
    await page.getByRole('button', { name: 'Explore with demo data' }).click();
    await page.getByText("Today's meals").waitFor({ timeout: 30_000 });
  });
  await step('3-log-sheet', async () => {
    await page.getByLabel('Log a meal').last().click();
    await page.getByText('Snap it').waitFor();
  });
  await step('4-type-a-meal', async () => {
    await page.getByRole('button', { name: /Type it/ }).click();
    await page.getByLabel('What did you eat?').fill('2 idli with sambar');
    await page.getByRole('button', { name: 'Analyse' }).click();
    await page.getByText('Review your meal').waitFor({ timeout: 30_000 });
  });
  await step('5-meal-saved', async () => {
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    // The toast title, e.g. "Lunch logged" — anchored so "Nothing logged yet" can't match.
    await page.getByText(/^(Breakfast|Lunch|Snack|Dinner) logged$/).waitFor({ timeout: 15_000 });
  });
  await step('6-goal-sheet', async () => {
    await page.getByLabel('Edit your goal').click();
    await page.getByText('Your daily target').waitFor();
    await page.getByLabel('Close').click();
  });
  await step('7-reports', async () => {
    await page.getByRole('tab', { name: 'Reports' }).click();
    await page.getByText('Your markers').waitFor({ timeout: 30_000 });
  });
  await step('8-marker', async () => {
    await page
      .getByRole('button', { name: /Fasting glucose/ })
      .first()
      .click();
    await page.getByText('Readings').waitFor({ timeout: 30_000 });
  });
  await step('9-ask-tab', async () => {
    await page.getByLabel('Back').click();
    await page.getByRole('tab', { name: 'Ask' }).click();
    await page.getByText('Try asking').waitFor({ timeout: 30_000 });
  });
  await step('10-chat-reply', async () => {
    await page
      .getByRole('button', { name: /What does/ })
      .first()
      .click();
    // The mock assistant always closes with its disclaimer; Gemini is told to include one per conversation.
    await page
      .getByText(/not a doctor/i)
      .first()
      .waitFor({ timeout: 60_000 });
    await page.getByLabel('Message Olive').fill('And what about ghee?');
    await page.getByRole('button', { name: 'Send', exact: true }).click();
    await page
      .getByText(/not a doctor/i)
      .nth(1)
      .waitFor({ timeout: 60_000 });
  });

  await context.close();
}

console.log('dark');
await run('dark');
console.log('light');
await run('light');

await browser.close();
bundler?.kill();

if (failures.length) {
  console.error(`\n${failures.length} failure(s):\n  ${failures.join('\n  ')}`);
  process.exit(1);
}
console.log(`\nall flows passed in both schemes. Screenshots: ${OUT}`);
