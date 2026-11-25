import { createServer } from 'vite';
import React from 'react';
import { renderToString } from 'react-dom/server';

const vite = await createServer({
  configFile: 'tools/admin-preview/vite.preview.config.ts',
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
});

const routes = [
  '/admin', '/admin/students', '/admin/teachers', '/admin/classes',
  '/admin/attendance', '/admin/grades', '/admin/homework',
  '/admin/announcements', '/admin/payments', '/admin/settings',
  '/admin/parents', '/admin/payroll', '/admin/reports', '/admin/schedule', '/admin/messages',
];

let failures = 0;
try {
  const { MemoryRouter, Routes, Route } = await vite.ssrLoadModule('react-router-dom');
  const { Providers } = await vite.ssrLoadModule('/src/app/providers.tsx');
  const { AdminApp } = await vite.ssrLoadModule('/src/features/admin/AdminApp.tsx');

  for (const path of routes) {
    const originalError = console.error;
    const captured = [];
    console.error = (...args) => { captured.push(args.map(String).join(' ')); };
    try {
      const html = renderToString(
        React.createElement(Providers, null,
          React.createElement(MemoryRouter, { initialEntries: [path] },
            React.createElement(Routes, null,
              React.createElement(Route, { path: '/admin/*', element: React.createElement(AdminApp) })
            )
          )
        ),
      );
      const length = html.length;
      const serious = captured.filter((line) => !/useLayoutEffect|ResponsiveContainer|defaultProps|Warning:/.test(line));
      if (serious.length) {
        failures += 1;
        console.log(`✗ ${path} (${length} chars) errors:`);
        serious.slice(0, 3).forEach((line) => console.log('   ', line.slice(0, 300)));
      } else {
        console.log(`✓ ${path} — rendered ${length} chars`);
      }
    } catch (error) {
      failures += 1;
      console.log(`✗ ${path} threw: ${error.message}`);
    } finally {
      console.error = originalError;
    }
  }
} finally {
  await vite.close();
}
console.log(failures === 0 ? 'ALL ROUTES OK' : `${failures} ROUTE(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
