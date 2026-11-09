/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          deep: '#101513',      // Deep canopy shadow
          bark: '#161B18',      // Damp bark charcoal
          moss: '#1C2826',      // Deep moss green
          lichen: '#243431',    // Elevated card surface
          emerald: '#2D443E',   // Frosted emerald glass
          sage: '#8FA294',      // Misty sage
          dew: '#BAC7BE',       // Muted text
          mist: '#E5EAE5',      // High-contrast primary text
          amber: '#D4A373',     // Bioluminescent amber accent
          glow: '#E9C46A',      // Lantern filament highlight
        },
      },
      fontFamily: {
        serif: ['"Fraunces"', '"Cormorant Garamond"', 'Georgia', 'serif'],
        ancient: ['"Cinzel"', 'serif'],
        sans: ['"Alegreya Sans"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        debossed: 'inset 0 1px 2px rgba(0, 0, 0, 0.4), 0 1px 0 rgba(255, 255, 255, 0.05)',
        bookspine: '4px 0 10px rgba(0, 0, 0, 0.5), inset -2px 0 4px rgba(0, 0, 0, 0.4)',
        bioglow: '0 0 20px rgba(212, 163, 115, 0.15)',
        forestcard: '0 12px 32px rgba(8, 12, 10, 0.5), inset 0 1px 0 rgba(143, 162, 148, 0.12)',
      },
      transitionTimingFunction: {
        'page-curl': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        biopulse: {
          '0%, 100%': { opacity: '0.9', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(0.96)' },
        },
        drift: {
          '0%': { transform: 'translateY(0px) rotate(0deg)', opacity: '0' },
          '50%': { opacity: '0.6' },
          '100%': { transform: 'translateY(-16px) rotate(12deg)', opacity: '0' },
        },
      },
      animation: {
        'bio-pulse': 'biopulse 3s ease-in-out infinite',
        'spore-drift': 'drift 4s ease-out infinite',
      },
    },
  },
  plugins: [],
};
