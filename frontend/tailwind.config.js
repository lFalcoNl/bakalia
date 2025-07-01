// tailwind.config.js
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Deep, vibrant green for your primary backgrounds/navbars
        primary: '#1E4D2B',
        // Warm, golden-yellow for accents (links, badges, underlines)
        secondary: {
          DEFAULT: '#F2A900',
          10: '#F2A9001A', // 10% opacity for hover backgrounds
        },
        // Soft, creamy off-white for text/surfaces
        accent: '#FEF9E7',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-slow': {
          '0%,100%': { opacity: '0.1' },
          '50%': { opacity: '0.2' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.2s linear infinite',
        'pulse-slow': 'pulse-slow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
