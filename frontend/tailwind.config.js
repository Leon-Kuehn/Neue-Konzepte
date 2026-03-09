/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        dhbw: {
          red: '#c6001f',
          dark: '#9a0018',
          gray: '#f3f4f6',
          slate: '#1f2937',
        },
      },
      boxShadow: {
        card: '0 10px 30px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
}
