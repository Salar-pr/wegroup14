import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const vite = await createServer({
  server: { host: '127.0.0.1', port: 5181, strictPort: false },
  logLevel: 'error',
});
let browser;
let passed = 0;

async function check(name, run) {
  try {
    await run();
    passed += 1;
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}: ${error.message}`);
    throw error;
  }
}

try {
  const { createMockDatabase } = await vite.ssrLoadModule('/src/data/database.ts');
  const { demoAccounts } = await vite.ssrLoadModule('/src/data/users.ts');
  const db = createMockDatabase();
  const students = new Map(db.students.map((s) => [s.id, s]));
  const classes = new Map(db.classes.map((c) => [c.id, c]));
  const teachers = new Map(db.teachers.map((t) => [t.id, t]));
  const subjects = new Map(db.subjects.map((s) => [s.id, s]));

  await check('seed IDs and class totals', () => {
    for (const [key, rows] of Object.entries(db)) {
      assert.equal(new Set(rows.map((row) => row.id)).size, rows.length, `${key}: duplicate ID`);
    }
    for (const cls of db.classes) {
      assert.equal(cls.enrolled, db.students.filter((s) => s.classId === cls.id).length, cls.name);
      assert.ok(teachers.has(cls.homeroomTeacherId), `${cls.name}: missing teacher`);
    }
  });

  await check('seed relationships and score ranges', () => {
    for (const s of db.students) assert.ok(classes.has(s.classId), `${s.id}: missing class`);
    for (const p of db.parents) {
      for (const id of p.studentIds) assert.ok(students.has(id), `${p.id}: missing child ${id}`);
    }
    for (const row of [...db.grades, ...db.attendance, ...db.payments]) {
      assert.ok(students.has(row.studentId), `${row.id}: missing student`);
      if ('classId' in row) assert.equal(row.classId, students.get(row.studentId).classId, row.id);
      if ('subjectId' in row) assert.ok(subjects.has(row.subjectId), `${row.id}: missing subject`);
      if ('teacherId' in row) assert.ok(teachers.has(row.teacherId), `${row.id}: missing teacher`);
      if ('score' in row) assert.ok(row.score >= 0 && row.score <= row.maxScore, row.id);
    }
    for (const item of [...db.homework, ...db.schedule]) {
      assert.ok(
        classes.has(item.classId) && subjects.has(item.subjectId) && teachers.has(item.teacherId),
        item.id,
      );
    }
  });

  await check('every demo account points to a record', () => {
    assert.equal(new Set(demoAccounts.map((a) => a.user.email)).size, demoAccounts.length);
    for (const { user } of demoAccounts) {
      if (user.role === 'student') {
        const student = db.students.find((s) => s.phone === user.phone);
        assert.equal(student?.name, user.name, user.email);
        assert.equal(student.classId, user.classId, user.email);
      }
      if (user.role === 'parent') {
        const parent = db.parents.find((p) => p.phone === user.phone);
        assert.deepEqual(user.studentIds, parent?.studentIds, user.email);
      }
    }
    assert.equal(db.students.filter((s) => s.id === 's-25').length, 1);
  });

  await vite.listen();
  const base = `http://127.0.0.1:${vite.httpServer.address().port}`;
  browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (err) => errors.push(err.message));

  async function login(role, label, name) {
    await page
      .locator('fieldset')
      .first()
      .getByRole('button', { name: new RegExp(label) })
      .click();
    if (name)
      await page
        .getByRole('button', { name: new RegExp(name) })
        .first()
        .click();
    await page.getByRole('button', { name: 'ورود با حساب نمایشی' }).click();
    await page.waitForURL(`**/${role}`);
    await page.locator('main h1').first().waitFor();
  }

  async function logout() {
    await page.getByRole('button', { name: 'منوی حساب کاربری' }).click();
    await page.getByRole('button', { name: 'خروج از حساب' }).last().click();
    await page.waitForURL('**/login');
  }

  async function visit(path, expected) {
    await page.locator(`aside nav a[href="${path}"]`).click();
    await page.waitForURL(`**${path}`);
    await page.getByText(expected, { exact: false }).first().waitFor();
    assert.ok(!(await page.locator('main').innerText()).includes('این صفحه هنوز آماده نیست'), path);
  }

  await page.goto(`${base}/admin/grades`);
  await check('role guard redirects anonymous visitors', async () => {
    await page.waitForURL('**/login');
  });

  await login('admin', 'مدیر');
  await check('admin dashboard is mounted', async () => {
    assert.match(await page.locator('main').innerText(), /دانش‌آموزان فعال/);
  });
  await check('a signed-in admin cannot open the parent panel', async () => {
    await page.evaluate(() => {
      window.history.pushState({}, '', '/parent');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    await page.getByRole('heading', { name: 'دسترسی غیرمجاز' }).waitFor();
    await page.getByRole('link', { name: /بازگشت به پیشخوان/ }).click();
    await page.waitForURL('**/admin');
  });
  await visit('/admin/students', 'کل دانش‌آموزان');
  await page.getByLabel('جست‌وجوی دانش‌آموز').fill('علی محمدی');
  await check('second child exists before visiting the parent panel', async () => {
    assert.match(await page.locator('table').innerText(), /علی محمدی/);
  });
  await visit('/admin/parents', 'خانواده‌ها');
  await visit('/admin/grades', 'مدیریت نمرات');
  await visit('/admin/messages', 'پیام‌های مدرسه');
  await logout();

  await login('student', 'دانش‌آموز', 'بردیا هاشمی');
  await check('at-risk student has their own dashboard', async () => {
    assert.match(await page.locator('main').innerText(), /بردیا هاشمی/);
    assert.match(await page.locator('main').innerText(), /معدل وزنی نیم‌سال/);
  });
  await visit('/student/grades', 'نمرات');
  await visit('/student/attendance', 'حضور و غیاب');
  await visit('/student/messages', 'قرار ملاقات برای مرور نمرات');
  await logout();

  await login('parent', 'والدین', 'فاطمه حسینی');
  await check('overdue parent sees their own child and inbox badge', async () => {
    assert.match(await page.locator('main').innerText(), /رعنا حسینی/);
    assert.match(
      await page.locator('nav[aria-label="دسترسی سریع"] a[href="/parent/messages"]').innerText(),
      /[۱-۹]/,
    );
  });
  await visit('/parent/payments', 'معوقه');
  await visit('/parent/messages', 'پیگیری شهریه رعنا حسینی');
  await logout();

  await login('parent', 'والدین', 'زهرا کریمی');
  await check('family with two children has a selector', async () => {
    await page.getByRole('button', { name: 'انتخاب فرزند' }).click();
    assert.equal(await page.getByRole('option').count(), 2);
    await page.getByRole('option', { name: /علی محمدی/ }).click();
    assert.match(await page.locator('main').innerText(), /علی محمدی/);
  });
  await visit('/parent/homework', 'تکالیف');
  await visit('/parent/messages', 'پیام‌ها');
  await page.getByRole('button', { name: 'پیام جدید' }).first().click();
  await page.getByLabel('موضوع').fill('هماهنگی جلسه اولیا');
  await page
    .locator('#parent-message-body')
    .fill('سلام. برای بررسی برنامه فرزندان وقت ملاقات می‌خواهم.');
  await page.getByRole('button', { name: 'ارسال پیام' }).click();
  await check('parent can send a demo message', async () => {
    assert.match(await page.locator('main').innerText(), /هماهنگی جلسه اولیا/);
  });
  await logout();

  await login('admin', 'مدیر');
  await visit('/admin/messages', 'پیام‌های مدرسه');
  await check('admin sees the parent message in the same session', async () => {
    await page.getByLabel('جست‌وجوی پیام‌ها').fill('هماهنگی جلسه اولیا');
    assert.match(await page.locator('main').innerText(), /هماهنگی جلسه اولیا/);
  });
  await page.locator('section[aria-label="فهرست مکاتبات"] button').first().click();
  await page.getByLabel('پاسخ به زهرا کریمی').fill('سلام. برای جلسه فردا با شما هماهنگ می‌کنیم.');
  await page.getByRole('button', { name: 'ارسال پاسخ نمایشی' }).click();
  await logout();
  await login('parent', 'والدین', 'زهرا کریمی');
  await visit('/parent/messages', 'پیام‌ها');
  await check('parent receives the admin reply', async () => {
    assert.match(await page.locator('main').innerText(), /پاسخ: هماهنگی جلسه اولیا/);
  });
  await page.reload();
  await check('refresh clears both session and demo changes', async () => {
    await page.waitForURL('**/login');
    await login('parent', 'والدین', 'زهرا کریمی');
    await visit('/parent/messages', 'پیام‌ها');
    assert.ok(!(await page.locator('main').innerText()).includes('هماهنگی جلسه اولیا'));
  });

  await check('desktop has no uncaught browser errors', () => {
    assert.deepEqual(errors, []);
  });

  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const mobilePage = await mobile.newPage();
  await mobilePage.goto(`${base}/login`);
  await mobilePage
    .locator('fieldset')
    .first()
    .getByRole('button', { name: /والدین/ })
    .click();
  await mobilePage.getByRole('button', { name: 'ورود با حساب نمایشی' }).click();
  await mobilePage.waitForURL('**/parent');
  await check('parent dashboard fits a mobile viewport', async () => {
    await mobilePage.getByRole('button', { name: 'انتخاب فرزند' }).waitFor();
    const overflow = await mobilePage.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    assert.ok(overflow <= 2, `${overflow}px horizontal overflow`);
  });
  for (const [role, label] of [
    ['student', 'دانش‌آموز'],
    ['admin', 'مدیر'],
  ]) {
    await mobilePage.getByRole('button', { name: 'منوی حساب کاربری' }).click();
    await mobilePage.getByRole('button', { name: 'خروج از حساب' }).last().click();
    await mobilePage.waitForURL('**/login');
    await mobilePage
      .locator('fieldset')
      .first()
      .getByRole('button', { name: new RegExp(label) })
      .click();
    await mobilePage.getByRole('button', { name: 'ورود با حساب نمایشی' }).click();
    await mobilePage.waitForURL(`**/${role}`);
    await check(`${role} dashboard fits a mobile viewport`, async () => {
      await mobilePage.locator('main h1').first().waitFor();
      const overflow = await mobilePage.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      assert.ok(overflow <= 2, `${overflow}px horizontal overflow`);
    });
  }
  await mobile.close();
  console.log(`${passed} checks passed`);
} finally {
  await browser?.close();
  await vite.close();
}
