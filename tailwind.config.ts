import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors from legacy CSS
        brand: {
          gold: '#ffcc00',
          'gold-dark': '#cc9900',
          'gold-bright': '#ffd700',
          orange: '#ff6600',
        },
        // Background colors
        bg: {
          dark: '#000',
          'dark-blue': '#1a1a3a',
          'dark-navy': '#1a2050',
          'dark-navy-alt': '#101535',
          'dark-gradient-start': '#1a1a2a',
          'dark-gradient-end': '#0a0a1a',
          'gray-light': '#d0d0d0',
          'gray-gradient-start': '#e8e8e8',
          'gray-gradient-end': '#c8c8c8',
        },
        // Auth section colors
        auth: {
          'bg-start': '#1a1a2e',
          'bg-end': '#16213e',
          'primary-start': '#667eea',
          'primary-end': '#764ba2',
          'avatar-start': '#6366f1',
          'avatar-end': '#8b5cf6',
        },
        // Navigation colors
        nav: {
          'bg-start': '#1a2050',
          'bg-end': '#101535',
          'hover-start': '#252a60',
          'hover-end': '#1a1f45',
        },
        // Text colors
        text: {
          'gray-light': '#ccc',
          'gray-medium': '#999',
          'gray-dark': '#666',
          'slate': '#94a3b8',
          'slate-light': '#cbd5e1',
          'blue-dark': '#20385f',
          'blue-medium': '#2c4a7c',
          'green-dark': '#2e7d32',
        },
        // Border colors
        border: {
          'gray-light': '#ddd',
          'gray-medium': '#999',
          'gray-dark': '#666',
          'dark': '#444',
          'gold-alpha': 'rgba(255, 215, 0, 0.3)',
        },
        // Exchange rate colors
        exchange: {
          highlight: '#fffacd',
          'hover-bg': '#f0f4ff',
        },
        // Clock colors
        clock: {
          'border-bronze': '#8b7355',
          'border-gold': '#c9a96e',
          'night-bg-start': '#1a1a2e',
          'night-bg-mid': '#16213e',
          'night-bg-end': '#0f3460',
          'night-border': '#4a4a6a',
          'hand-dark': '#222',
          'hand-red': '#e74c3c',
        },
        // Modal colors
        modal: {
          'header-start': '#1f3358',
          'header-mid': '#355c94',
          'header-end': '#4a6fa5',
          'card-bg': 'rgba(255, 255, 255, 0.92)',
          'note-border': 'rgba(44, 74, 124, 0.18)',
        },
        // Admin colors
        admin: {
          'bg': 'rgba(99, 102, 241, 0.15)',
          'text': '#a5b4fc',
          'border': 'rgba(99, 102, 241, 0.25)',
        },
        // Settings colors
        settings: {
          'bg': 'rgba(34, 197, 94, 0.15)',
          'text': '#86efac',
          'border': 'rgba(34, 197, 94, 0.25)',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      boxShadow: {
        'auth-primary': '0 4px 15px rgba(102, 126, 234, 0.4)',
        'auth-primary-hover': '0 6px 20px rgba(102, 126, 234, 0.5)',
        'clock': '0 0 0 2px #c9a96e, inset 0 2px 4px rgba(0,0,0,0.2), 0 4px 8px rgba(0,0,0,0.3)',
        'clock-night': '0 0 0 2px #5a5a8a, inset 0 2px 4px rgba(0,0,0,0.4), 0 4px 8px rgba(0,0,0,0.5), 0 0 15px rgba(100, 149, 237, 0.3)',
        'modal': '0 18px 70px rgba(0,0,0,0.45)',
      },
      backdropBlur: {
        'auth': '10px',
      },
    },
  },
  plugins: [],
};

export default config;
