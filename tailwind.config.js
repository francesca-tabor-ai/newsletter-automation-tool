/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary coral accent (HubSpot-inspired)
        coral: {
          50: '#FFF5F3',
          100: '#FFE8E3',
          200: '#FFD1C7',
          300: '#FFB3A3',
          400: '#FF8A70',
          500: '#FF6B4A', // Primary
          600: '#E85A3E',
          700: '#CC4A31',
          800: '#A33B26',
          900: '#7A2D1D',
        },
        // Deep slate (ink/headings)
        slate: {
          50: '#F7FAFC',
          100: '#E6ECF1',
          200: '#D4DCE5',
          300: '#A8B5C3',
          400: '#7C8FA1',
          500: '#4A5B6A', // Body text
          600: '#253645', // Headings
          700: '#1A2933',
          800: '#121B23',
          900: '#0A1116',
        },
        // Background colors
        background: '#F7FAFC',
        surface: '#FFFFFF',
      },
      fontFamily: {
        sans: [
          'Inter',
          'SF Pro Display',
          'DM Sans',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      fontSize: {
        // Type scale
        'h1': ['48px', { lineHeight: '1.2', fontWeight: '700' }],
        'h2': ['32px', { lineHeight: '1.25', fontWeight: '700' }],
        'h3': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        'h4': ['20px', { lineHeight: '1.4', fontWeight: '600' }],
        'body': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'small': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'xs': ['12px', { lineHeight: '1.5', fontWeight: '400' }],
      },
      spacing: {
        // 8px spacing system
        '0': '0px',
        '1': '8px',
        '2': '16px',
        '3': '24px',
        '4': '32px',
        '5': '40px',
        '6': '48px',
        '7': '56px',
        '8': '64px',
      },
      borderRadius: {
        'sm': '8px',
        'md': '10px',
        'lg': '12px',
        'xl': '14px',
        '2xl': '16px',
        'full': '9999px',
      },
      boxShadow: {
        // Subtle lift shadows (HubSpot style)
        'card': '0 2px 8px rgba(37, 54, 69, 0.08)',
        'card-hover': '0 4px 16px rgba(37, 54, 69, 0.12)',
        'button': '0 1px 3px rgba(37, 54, 69, 0.1)',
        'input': '0 1px 2px rgba(37, 54, 69, 0.05)',
        'input-focus': '0 0 0 3px rgba(255, 107, 74, 0.1)',
      },
      maxWidth: {
        'content': '1200px',
      },
    },
  },
  plugins: [],
}

