/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Deep forest green — primary brand (circular economy, growth)
        forest: {
          50: '#EEF5F0',
          100: '#D4E8DA',
          200: '#A9D1B6',
          300: '#7AB78F',
          400: '#4F9C6C',
          500: '#357F52',
          600: '#2D6A4F', // primary
          700: '#234F3C',
          800: '#183527',
          900: '#0E2B22',
          950: '#081C16',
        },
        // Industrial blue — secondary, used for structure/navigation/data
        indigo: {
          50: '#EAEFF6',
          100: '#CBD8E8',
          200: '#9FB6D2',
          300: '#6E8FB6',
          400: '#456C97',
          500: '#2B5480',
          600: '#1D3557', // secondary
          700: '#172A45',
          800: '#111F33',
          900: '#0B1522',
        },
        // Brass/gold — the "wealth recovered from waste" accent
        brass: {
          50: '#FBF5E7',
          100: '#F5E6C1',
          200: '#EBCE8C',
          300: '#DFB35C',
          400: '#C89B3C', // accent
          500: '#AD832E',
          600: '#8C6923',
          700: '#6B501A',
        },
        paper: {
          DEFAULT: '#F4F6F2',
          dim: '#EAEEE7',
        },
        ink: {
          DEFAULT: '#131A17',
          soft: '#3B453F',
          faint: '#5B6B63',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"IBM Plex Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        soft: '0 2px 20px -4px rgba(19, 26, 23, 0.08)',
        card: '0 1px 3px rgba(19, 26, 23, 0.06), 0 1px 2px rgba(19, 26, 23, 0.04)',
      },
      backgroundImage: {
        'loop-gradient': 'conic-gradient(from 180deg, #2D6A4F, #1D3557, #C89B3C, #2D6A4F)',
      },
      keyframes: {
        'spin-slow': { to: { transform: 'rotate(360deg)' } },
        'rise': { '0%': { opacity: 0, transform: 'translateY(12px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
      },
      animation: {
        'spin-slow': 'spin-slow 14s linear infinite',
        rise: 'rise 0.6s ease-out both',
      },
    },
  },
  plugins: [],
};
