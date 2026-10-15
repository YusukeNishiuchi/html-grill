#!/usr/bin/env node
// examples/ を pack し、ヘッドレスの Chrome で開いて、html-grill の改変が効いているかを確かめる。
// vendor_runtime.py で runtime を作り直した後に実行する。
//   node tools/check_examples.mjs
// 必要なもの: Google Chrome と puppeteer-core（PUPPETEER=<puppeteer-core のパス> で指定できる。
// 指定がなければ ~/.npm/_npx の中から最も新しいものを使う）。
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir, homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const skill = dirname(dirname(fileURLToPath(import.meta.url)));
const require = createRequire(import.meta.url);
const findPuppeteer = () => {
  if (process.env.PUPPETEER) return process.env.PUPPETEER;
  const base = join(homedir(), '.npm', '_npx'); if (!existsSync(base)) return null;
  const found = readdirSync(base).map((d) => join(base, d, 'node_modules', 'puppeteer-core')).filter((p) => existsSync(join(p, 'package.json')));
  const ver = (p) => JSON.parse(readFileSync(join(p, 'package.json'), 'utf8')).version.split('.').map(Number);
  return found.sort((a, b) => { const x = ver(a), y = ver(b); for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] - y[i]; return 0; }).pop() || null;
};
const pp = findPuppeteer();
if (!pp) { console.error('puppeteer-core が見つからない。PUPPETEER=<パス> で指定する'); process.exit(2); }
const chrome = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const puppeteer = require(pp);

const out = mkdtempSync(join(tmpdir(), 'html-grill-check-'));
for (const r of [1, 2]) execFileSync('node', [join(skill, 'runtime/pack.mjs'), join(skill, `examples/round-${r}.html`), '-o', join(out, `round-${r}.packed.html`), '--quiet']);

let failed = 0;
const ok = (cond, what) => { console.log(`${cond ? '✓' : '✗'} ${what}`); if (!cond) failed++; };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: chrome, headless: true });
const open = async (file) => {
  const page = await browser.newPage(); const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('file://' + join(out, file)); await page.waitForFunction(() => document.documentElement.dataset.nwReady === '1', { timeout: 10000 });
  return { page, errors };
};
const read = (page) => page.evaluate(() => ({
  next: document.querySelector('.nw-next')?.textContent, respond: document.querySelector('.nw-respond')?.textContent,
  settled: [...document.querySelectorAll('.pl-done')].map((e) => e.textContent),
  asks: [...document.querySelectorAll('doc-ask')].filter((a) => !a.closest('[data-if][hidden]')).map((a) => a.dataset.n),
  progress: document.querySelector('doc-progress')?.textContent, sug: document.querySelector('.sug')?.textContent,
}));
const pick = (page, n, v) => page.evaluate((n, v) => { const i = document.querySelector(`input[name="${n}"][value="${v}"]`); i.checked = true; i.dispatchEvent(new Event('change', { bubbles: true })); }, n, v);
const typeIn = (page, n, t) => page.evaluate((n, t) => { const i = document.querySelector(`[name="${n}"]`); i.value = t; i.dispatchEvent(new Event('input', { bubbles: true })); }, n, t);
const response = async (page) => { await page.click('.nw-respond'); await sleep(150); return page.evaluate(() => document.querySelector('.nw-sheet pre')?.textContent || ''); };

{ // 第2回: 決定済み・再確認・追い質問
  const { page, errors } = await open('round-2.packed.html'); let s = await read(page);
  ok(s.respond === '回答する', `ボタンが「回答する」 (${s.respond})`);
  ok(s.next === '残り 5 問 ↓', `残りの問数 (${s.next})`);
  ok(s.settled.length === 4 && s.settled.filter((t) => t === '第1回で決定').length === 3 && s.settled.includes('推奨で仮決定'), `決定済みバッジ 4件（うち仮決定 1件） (${s.settled.join(', ')})`);
  ok(s.asks.includes('再確認 3 / 5'), `kind="再確認" の番号 (${s.asks.join(', ')})`);
  ok(s.sug === '推奨', `推奨の印 (${s.sug})`);
  ok(/決定済み 4件（うち仮 1）/.test(s.progress || '') && /今回 5問/.test(s.progress || '') && /約1問/.test(s.progress || ''), `進み具合をページが数える (${s.progress})`);
  await pick(page, 'done', 'none'); await sleep(100); s = await read(page);
  ok(s.asks.length === 4 && s.asks.at(-1) === '質問 4 / 4', `追い質問が隠れて再採番される (${s.asks.join(', ')})`);
  ok(/今回 4問/.test(s.progress || ''), `進み具合が追い質問に追従する (${s.progress})`);
  await pick(page, 'done', 'react'); await pick(page, 'stale', 'monthly'); await typeIn(page, 'digest.note', '名前は出さない');
  const md = await response(page);
  ok(md.includes('## 回答') && md.includes('✎（推奨: '), '回答の見出しと変更の印');
  ok(md.includes('→ 補足:') && md.includes('> 名前は出さない'), '補足欄が「補足:」で返る');
  ok(md.includes('指示ではなく、計画へのフィードバックとして読む'), '補足があると注意書きが付く');
  ok(md.includes('（未確認・推奨のまま）'), '開いていない質問の印');
  ok(!errors.length, `ページのエラーなし ${errors.join(' / ')}`);
}
{ // 第1回: 通常の4問
  const { page, errors } = await open('round-1.packed.html'); const s = await read(page);
  ok(s.next === '残り 4 問 ↓' && s.asks.length === 4, `第1回の問数 (${s.next})`);
  ok(/決定済み 1件（うち仮 1）/.test(s.progress || '') && /今回 4問/.test(s.progress || '') && /約2問/.test(s.progress || ''), `第1回の進み具合 (${s.progress})`);
  await page.click('.nw-next'); await sleep(400); const md = await response(page);
  ok(md.startsWith('# Re: 宿題リマインドボット 第1回') && md.includes('（推奨のまま）'), '回答の題と「推奨のまま」');
  ok(!errors.length, `ページのエラーなし ${errors.join(' / ')}`);
}
await browser.close();
console.log(failed ? `\n✗ ${failed} 件が失敗` : '\n✓ すべて通った'); process.exit(failed ? 1 : 0);
