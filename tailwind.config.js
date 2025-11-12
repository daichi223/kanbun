/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'mincho': ['"Yu Mincho"', '游明朝', '"Hiragino Mincho ProN"', 'serif'],
      },
    },
  },
  plugins: [],
}

