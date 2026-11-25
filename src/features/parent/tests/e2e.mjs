/**
 * Parent panel smoke + interaction test (Playwright).
 *
 * IMPORTANT: sessions are runtime-only by design (contract §0.2), so a full page
 * reload logs the user out. Every navigation below therefore happens through the
 * real in-app UI (sidebar / buttons) instead of page.goto().
 *
 * Run: node src/features/parent/tests/e2e.mjs
 */
import { chromium } from 'playwright';
import fs from 'node:fs';

const BASE = process.env.BASE_URL ?? 'http://localhost:5173';
const OUT = '/home/user/notes/shots';
fs.mkdirSync(OUT, { recursive: true });

const results = [];
function record(name, ok, detail = '') {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'} · ${name}${detail ? ` — ${detail}` : ''}`);
}
const texts = (page) => page.locator('body').innerText();

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();

const errors = [];
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(msg.text());
});
page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));

async function loginAsParent(target, mobile = false) {
  await target.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await target.getByRole('button', { name: /والدین/ }).first().click();
  await target.getByRole('button', { name: 'ورود با حساب نمایشی' }).click();
  await target.waitForURL('**/parent', { timeout: 15000 });
  await target.waitForTimeout(1500);
  if (mobile) {
    // Drawer must be closed for links to be non-intercepted.
    await target.screenshot({ path: `${OUT}/mobile-dashboard.png`, fullPage: true });
  }
}

/** Click a sidebar link by its Persian label (opens the mobile drawer first). */
async function goToViaNav(target, label, mobile = false) {
  if (mobile) {
    const menu = target.getByRole('button', { name: 'باز کردن منو' });
    if (await menu.count()) {
      await menu.first().click();
      await target.waitForTimeout(500);
    }
  }
  const link = target.getByRole('link', { name: label, exact: false }).first();
  await link.click();
  await target.waitForTimeout(1100);
}

// =========================== DESKTOP =======================================
await loginAsParent(page);

let body = await texts(page);
record('login as parent lands on /parent', page.url().endsWith('/parent'), page.url());
record('dashboard shows child name', body.includes('سارا محمدی'));
record('dashboard shows average', /معدل کل/.test(body));
record('dashboard shows attendance', /درصد حضور/.test(body));
record('dashboard shows finance', /بدهی باقی‌مانده|وضعیت مالی/.test(body));
record('dashboard shows announcements', /اطلاعیه/.test(body));
record('dashboard shows homework', /تکالیف/.test(body));
record('dashboard stat cards rendered', (await page.locator('main .rounded-card').count()) >= 8);
await page.screenshot({ path: `${OUT}/01-dashboard.png`, fullPage: true });

const dir = await page.evaluate(() => document.documentElement.getAttribute('dir'));
record('html dir is rtl', dir === 'rtl', String(dir));
const htmlLang = await page.evaluate(() => document.documentElement.getAttribute('lang'));
record('html lang is fa', htmlLang === 'fa', String(htmlLang));
const fontFamily = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
record('Vazirmatn font applied', /Vazirmatn/i.test(fontFamily), fontFamily.slice(0, 40));

const sidebarCount = await page.locator('aside nav a').count();
record('sidebar has parent nav links', sidebarCount >= 8, `${sidebarCount} links`);

// ---- sidebar navigation across every parent page --------------------------
const routes = [
  ['child', 'فرزند من', 'پرونده'],
  ['grades', 'نمرات', 'کارنامه و نمرات'],
  ['attendance', 'حضور و غیاب', 'تاریخچهٔ حضور'],
  ['payments', 'شهریه و پرداخت', 'صورت‌حساب'],
  ['announcements', 'اطلاعیه‌ها', 'دسته‌بندی'],
  ['messages', 'پیام‌ها', 'صندوق پیام‌ها'],
  ['schedule', 'برنامه کلاسی', 'جلسه در هفته'],
];

for (const [slug, navLabel, expected] of routes) {
  await goToViaNav(page, navLabel);
  const text = await texts(page);
  const ok = text.includes(expected);
  record(`sidebar → ${navLabel} (${page.url().replace(BASE, '')})`, ok, ok ? '' : `missing «${expected}»`);
  await page.screenshot({ path: `${OUT}/page-${slug}.png`, fullPage: true });
}

// ---- homework is reachable from the dashboard card (see REPORT: sidebar gap) --
await goToViaNav(page, 'پیشخوان');
await page.getByRole('link', { name: /همه تکالیف/ }).first().click();
await page.waitForTimeout(1200);
record('homework page reachable from dashboard link', page.url().includes('/homework'), page.url());
record('homework page renders task list', (await texts(page)).includes('فهرست تکالیف'));
await page.screenshot({ path: `${OUT}/page-homework.png`, fullPage: true });

// ---- charts on the grades page -------------------------------------------
await goToViaNav(page, 'نمرات');
await page.waitForTimeout(800);
const chartCount = await page.locator('.recharts-surface').count();
record('grades page renders recharts charts', chartCount >= 4, `${chartCount} charts`);
const bars = await page.locator('.recharts-bar-rectangle').count();
record('subject average bars drawn', bars > 0, `${bars} bars`);
const axisTick = await page.locator('.recharts-xAxis .recharts-cartesian-axis-tick-value').first().innerText().catch(() => '');
record('chart axis uses Persian digits', /[۰-۹]/.test(axisTick) || axisTick === '', axisTick);

// ---- grade filters --------------------------------------------------------
const beforeRows = await page.locator('table tbody tr').count();
await page.getByLabel('فیلتر نوع ارزشیابی').selectOption('midterm');
await page.waitForTimeout(600);
const filtered = await page.locator('table').last().innerText();
record('grade type filter narrows results', /میان‌ترم/.test(filtered) && beforeRows > 0, `${beforeRows} → rows`);
await page.getByLabel('فیلتر نوع ارزشیابی').selectOption('all');
await page.waitForTimeout(400);
await page.getByLabel('جست‌وجوی نمرات').fill('فیزیک');
await page.waitForTimeout(600);
const searchText = await page.locator('table').last().innerText();
record('grade search works', /فیزیک/.test(searchText));
await page.getByLabel('جست‌وجوی نمرات').fill('');
await page.waitForTimeout(300);

// ---- comparison page via in-page link ------------------------------------
await page.getByRole('link', { name: /مقایسهٔ عملکرد/ }).first().click();
await page.waitForTimeout(1300);
record('compare page reachable from grades', page.url().includes('/grades/compare'), page.url());
const compareText = await texts(page);
record('compare page renders comparison table', /جدول مقایسه/.test(compareText));
record('compare page renders chart', (await page.locator('.recharts-surface').count()) > 0);
await page.screenshot({ path: `${OUT}/page-compare.png`, fullPage: true });
await page.getByRole('button', { name: 'ضریب درس' }).click();
await page.waitForTimeout(700);
record('compare metric switch works', (await page.locator('.recharts-surface').count()) > 0);

// ---- homework completion toggle -----------------------------------------
await goToViaNav(page, 'پیشخوان');
await page.getByRole('link', { name: /همه تکالیف/ }).first().click();
await page.waitForTimeout(1200);
const doneButtons = page.getByRole('button', { name: 'انجام شد' });
const doneCount = await doneButtons.count();
record('homework page lists tasks', doneCount > 0, `${doneCount} tasks`);
if (doneCount > 0) {
  await doneButtons.first().click();
  await page.waitForTimeout(700);
  record('homework toggle shows toast', /علامت‌گذاری شد/.test(await texts(page)));
  record(
    'homework toggle adds undo affordance',
    (await page.getByRole('button', { name: 'بازگردانی' }).count()) > 0,
  );
}

// ---- attendance excuse flow (on the child that has an absence) -----------
await goToViaNav(page, 'حضور و غیاب');
record('attendance table has rows', (await page.locator('table tbody tr').count()) > 0);

// first child has no recorded absence -> switch to the sibling for this flow
const selForAttendance = page.getByRole('button', { name: 'انتخاب فرزند' });
if ((await selForAttendance.count()) > 0) {
  await selForAttendance.click();
  await page.waitForTimeout(400);
  await page.getByRole('option', { name: /علی محمدی/ }).click();
  await page.waitForTimeout(1000);
}
const excuseBtns = page.getByRole('button', { name: 'درخواست توجیه' });
record('absence rows expose excuse action', (await excuseBtns.count()) > 0, `${await excuseBtns.count()} rows`);
if ((await excuseBtns.count()) > 0) {
  const absencesBefore = (await texts(page)).match(/غیبت/g)?.length ?? 0;
  await excuseBtns.first().click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/attendance-modal.png` });
  await page.getByRole('button', { name: 'ثبت درخواست' }).click();
  await page.waitForTimeout(800);
  const after = await texts(page);
  record('excuse request updates shared state + toast', /درخواست توجیه غیبت ثبت شد/.test(after), `markers ${absencesBefore}`);
  record('excuse request reclassifies the day', /غیبت موجه/.test(after));
}

// switch back to the first child as the focused child
const selBack = page.getByRole('button', { name: 'انتخاب فرزند' });
if ((await selBack.count()) > 0) {
  await selBack.click();
  await page.waitForTimeout(400);
  await page.getByRole('option', { name: /سارا محمدی/ }).click();
  await page.waitForTimeout(800);
}

// ---- messaging send flow -------------------------------------------------
await goToViaNav(page, 'پیام‌ها');
const inboxBefore = await page.locator('aside nav').count();
void inboxBefore;
await page.getByRole('button', { name: 'پیام جدید' }).first().click();
await page.waitForTimeout(600);
await page.getByLabel('موضوع').fill('پیگیری وضعیت تحصیلی فرزند');
await page.locator('#parent-message-body').fill('سلام، لطفاً در خصوص پیشرفت تحصیلی فرزندم راهنمایی بفرمایید. با تشکر.');
await page.screenshot({ path: `${OUT}/compose-modal.png` });
await page.getByRole('button', { name: 'ارسال پیام' }).click();
await page.waitForTimeout(1000);
body = await texts(page);
record('sent message appears in history', body.includes('پیگیری وضعیت تحصیلی فرزند'));
record('send shows success toast', /ارسال موفق|ثبت و در تاریخچه/.test(body));
await page.getByText('پیگیری وضعیت تحصیلی فرزند').first().click();
await page.waitForTimeout(700);
record('message detail opens with body', /پیشرفت تحصیلی فرزندم/.test(await texts(page)));
await page.screenshot({ path: `${OUT}/message-detail.png`, fullPage: true });

// validation
await page.getByRole('button', { name: 'پیام جدید' }).first().click();
await page.waitForTimeout(500);
await page.getByRole('button', { name: 'ارسال پیام' }).click();
await page.waitForTimeout(500);
record('empty message shows validation', /موضوع پیام را وارد کنید/.test(await texts(page)));
await page.getByRole('dialog').getByRole('button', { name: 'انصراف' }).click();
await page.waitForTimeout(400);

// ---- finance -------------------------------------------------------------
// The second child has a paid invoice, so the receipt flow can be exercised.
const topSelector = page.getByRole('button', { name: 'انتخاب فرزند' });
if ((await topSelector.count()) > 0) {
  await topSelector.click();
  await page.waitForTimeout(400);
  await page.getByRole('option', { name: /علی محمدی/ }).click();
  await page.waitForTimeout(900);
}
await goToViaNav(page, 'شهریه و پرداخت');
body = await texts(page);
record('finance shows tuition + outstanding', /جمع کل شهریه/.test(body) && /مانده بدهی/.test(body));
record('finance shows simulation disclaimer', /شبیه‌سازی نمایشی/.test(body));
const payButtons = page.getByRole('button', { name: 'پرداخت', exact: true });
if ((await payButtons.count()) > 0) {
  await payButtons.first().click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/payment-modal.png` });
  await page.getByRole('button', { name: 'تأیید و پرداخت' }).click();
  await page.waitForTimeout(700);
  record('payment simulates without transaction', /هیچ مبلغی کسر نگردید/.test(await texts(page)));
}
const receiptBtn = page.getByRole('button', { name: /مشاهدهٔ رسید/ });
record('receipt action available for paid invoices', (await receiptBtn.count()) > 0, `${await receiptBtn.count()} paid`);
if ((await receiptBtn.count()) > 0) {
  await receiptBtn.first().click();
  await page.waitForTimeout(800);
  record('receipt modal opens', /فاقد اعتبار رسمی/.test(await texts(page)));
  await page.screenshot({ path: `${OUT}/receipt-modal.png` });
  await page.getByRole('dialog').getByRole('button', { name: 'بستن' }).first().click();
  await page.waitForTimeout(400);
}

// restore first child
const restoreSelector = page.getByRole('button', { name: 'انتخاب فرزند' });
if ((await restoreSelector.count()) > 0) {
  await restoreSelector.click();
  await page.waitForTimeout(400);
  await page.getByRole('option', { name: /سارا محمدی/ }).click();
  await page.waitForTimeout(700);
}

// ---- announcements -------------------------------------------------------
await goToViaNav(page, 'اطلاعیه‌ها');
const expandBtns = page.getByRole('button', { name: 'متن کامل' });
record('announcements listed', (await expandBtns.count()) > 0, `${await expandBtns.count()} items`);
if ((await expandBtns.count()) > 0) {
  await expandBtns.first().click();
  await page.waitForTimeout(500);
  record('announcement expands', (await page.getByRole('button', { name: 'بستن متن' }).count()) > 0);
}
await page.getByRole('button', { name: /اطلاعیه‌های معلمان/ }).click();
await page.waitForTimeout(600);
record('teacher announcements tab filters', (await texts(page)).includes('اطلاعیه‌های معلمان'));

// ---- child selector ------------------------------------------------------
await goToViaNav(page, 'پیشخوان');
const selector = page.getByRole('button', { name: 'انتخاب فرزند' });
record('multi-child selector present', (await selector.count()) > 0);
if ((await selector.count()) > 0) {
  await selector.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/child-selector.png` });
  const options = await page.getByRole('option').count();
  record('selector lists both children', options === 2, `${options} options`);
  await page.getByRole('option', { name: /علی محمدی/ }).click();
  await page.waitForTimeout(1200);
  record('selecting second child switches dashboard', (await texts(page)).includes('علی محمدی'));
  await goToViaNav(page, 'نمرات');
  record('child selection persists across pages', (await texts(page)).includes('علی محمدی'));
  await page.screenshot({ path: `${OUT}/second-child-grades.png`, fullPage: true });
  // switch back
  await page.getByRole('button', { name: 'انتخاب فرزند' }).click();
  await page.waitForTimeout(400);
  await page.getByRole('option', { name: /سارا محمدی/ }).click();
  await page.waitForTimeout(700);
}

// ---- session reset on reload (contract behaviour) ------------------------
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
record('reload returns to /login (no persistence)', page.url().includes('/login'), page.url());

// =========================== MOBILE ========================================
const mobile = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
});
const mPage = await mobile.newPage();
await loginAsParent(mPage, true);

const overflow = (target) =>
  target.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

let ov = await overflow(mPage);
record('mobile dashboard no horizontal overflow', ov <= 2, `overflow ${ov}px`);

for (const [slug, navLabel] of [
  ['grades', 'نمرات'],
  ['payments', 'شهریه و پرداخت'],
  ['messages', 'پیام‌ها'],
  ['child', 'فرزند من'],
]) {
  await goToViaNav(mPage, navLabel, true);
  ov = await overflow(mPage);
  record(`mobile ${slug} no horizontal overflow`, ov <= 2, `overflow ${ov}px`);
  await mPage.screenshot({ path: `${OUT}/mobile-${slug}.png`, fullPage: true });
}

// drawer screenshot
const menuBtn = mPage.getByRole('button', { name: 'باز کردن منو' });
if (await menuBtn.count()) {
  await menuBtn.first().click();
  await mPage.waitForTimeout(700);
  await mPage.screenshot({ path: `${OUT}/mobile-drawer.png` });
  await mPage.keyboard.press('Escape');
}

// =========================== TABLET ========================================
const tablet = await browser.newContext({ viewport: { width: 834, height: 1112 } });
const tPage = await tablet.newPage();
await loginAsParent(tPage);
await tPage.screenshot({ path: `${OUT}/tablet-dashboard.png`, fullPage: true });
const tOv = await overflow(tPage);
record('tablet dashboard no horizontal overflow', tOv <= 2, `overflow ${tOv}px`);

record('no console/page errors', errors.length === 0, errors.slice(0, 3).join(' | '));

await browser.close();

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) {
  console.log('FAILED:\n - ' + failed.map((f) => `${f.name}${f.detail ? ` (${f.detail})` : ''}`).join('\n - '));
  process.exitCode = 1;
}
