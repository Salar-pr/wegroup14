/**
 * DEV-ONLY vite config used to preview the admin feature in isolation.
 *
 * It reuses the project's real vite config and only adds a tiny middleware
 * that serves `preview.html` at `/`, so the sandbox preview shows the admin
 * dashboard instead of the app entry (which still renders the role
 * placeholder until the router swap is approved by the team leader).
 *
 * Usage: npx vite --config tools/admin-preview/vite.preview.config.ts
 */
import { defineConfig, mergeConfig, type Plugin } from 'vite';
import baseConfig from '../../vite.config';

const servePreviewEntry = (): Plugin => ({
  name: 'admin-preview-entry',
  apply: 'serve',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      if (req.url === '/' || req.url === '/index.html') {
        req.url = '/preview.html';
      }
      next();
    });
  },
});

export default mergeConfig(baseConfig, defineConfig({ plugins: [servePreviewEntry()] }));
