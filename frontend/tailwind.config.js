/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'nest-primary': '#0f1a16',
        'nest-dark': '#0a100e',
        'nest-secondary': '#1e3329',
        'nest-warm': '#2f4f40',
        'nest-gold': '#c9a962',
        'nest-bg': '#0c1411',
        'nest-surface': '#f0ebe0',
        'nest-border': '#c9a96238',
        'nest-text': '#1a2822',
        'nest-muted': '#5c6b63',
        'nest-olive': '#4a6b58',
        'nest-danger': '#9e4a4a',
        'nest-beige': '#b8a078',
        'nest-orange': '#a67c52',
        mist: {
          DEFAULT: '#c8d9cf',
          dim: '#8fa894',
          faint: '#5a6f64',
        },
        folio: {
          ink: '#1a2822',
          muted: '#5c6b63',
          line: '#1a28221f',
        },
      },
      fontFamily: {
        sans: ['"Albert Sans"', 'system-ui', 'sans-serif'],
        display: ['"Fraunces"', 'Georgia', 'serif'],
        serif: ['"Fraunces"', 'Georgia', 'serif'],
      },
      boxShadow: {
        folio: '0 28px 60px #00000073, inset 0 1px 0 #ffffff73',
        glow: '0 0 40px #4a6b5826',
      },
    },
  },
  plugins: [],
};
