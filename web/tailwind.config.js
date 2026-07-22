/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#f97316',
        'primary-dark': '#9d4300',
        'on-primary': '#ffffff',
        'primary-container': '#ffe3cc',
        'on-primary-container': '#7a3000',
        secondary: '#0f172a',
        'on-secondary': '#ffffff',
        'secondary-container': '#dae2fd',
        'on-secondary-container': '#5c647a',
        surface: '#f8fafc',
        'surface-dim': '#d8dadc',
        'surface-bright': '#f8fafc',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f2f4f6',
        'surface-container': '#eceef0',
        'surface-container-high': '#e6e8ea',
        'surface-container-highest': '#e0e3e5',
        'on-surface': '#0f172a',
        'on-surface-variant': '#64748b',
        outline: '#94a3b8',
        'outline-variant': '#e2e8f0',
        success: '#16a34a',
        warning: '#f59e0b',
        error: '#dc2626',
        'error-container': '#ffdad6',
      },
      fontFamily: {
        headline: ['"Hanken Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        ambient: '0 4px 20px rgba(15, 23, 42, 0.06)',
        modal: '0 12px 32px rgba(15, 23, 42, 0.12)',
      },
      spacing: {
        sidebar: '280px',
      },
    },
  },
  plugins: [],
};
