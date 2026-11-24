/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          dark: '#1D4ED8',
          navy: '#1E3A8A',
          50: '#EFF6FF',
          100: '#DBEAFE',
        },
        background: '#F8FAFC',
        surface: '#FFFFFF',
        text: {
          DEFAULT: '#0F172A',
          muted: '#64748B',
        },
        border: '#E2E8F0',
        success: '#16A34A',
        warning: '#F59E0B',
        danger: '#DC2626',
        info: '#0EA5E9',
      },
      fontFamily: {
        sans: ['Vazirmatn', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        card: '14px',
        btn: '10px',
        input: '10px',
        modal: '16px',
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(15, 23, 42, 0.05)',
        cardHover: '0 8px 24px -8px rgba(15, 23, 42, 0.12)',
        modal: '0 24px 64px -16px rgba(2, 6, 23, 0.35)',
        sidebar: '0 0 0 1px rgba(15, 23, 42, 0.03)',
      },
      spacing: {
        sidebar: '250px',
        'sidebar-collapsed': '76px',
        header: '72px',
      },
      height: {
        header: '72px',
      },
      width: {
        sidebar: '250px',
        'sidebar-collapsed': '76px',
      },
      maxWidth: {
        'content-max': '1600px',
      },
    },
  },
  plugins: [],
};
