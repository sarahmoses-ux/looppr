/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        linen: {
          DEFAULT: '#F8F7FF',
          soft: '#F0EFFF',
        },
        ink: {
          DEFAULT: '#1E1B4B',
          light: '#332AB8',
          footer: '#171433',
        },
        periwinkle: {
          DEFAULT: '#7C73E6',
          text: '#5A52C5',
          soft: '#EEEDFE',
          muted: '#AFA9EC',
        },
        line: {
          DEFAULT: '#E8E6F4',
          soft: '#DDDCF0',
        },
        success: {
          DEFAULT: '#1D9E75',
          soft: '#E1F5EE',
          dark: '#085041',
        },
      },
      fontFamily: {
        display: ['Bricolage Grotesque', 'sans-serif'],
        sans: ['Hanken Grotesk', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
