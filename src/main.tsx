import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import { Providers } from './app/providers';
// Vazirmatn — self-hosted via @fontsource (no external requests at runtime)
import '@fontsource/vazirmatn/400.css';
import '@fontsource/vazirmatn/500.css';
import '@fontsource/vazirmatn/700.css';
import '@fontsource/vazirmatn/800.css';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Providers>
      <App />
    </Providers>
  </React.StrictMode>,
);
