/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        catan: {
          wood: '#8B4513',
          brick: '#B22222',
          sheep: '#98FB98',
          wheat: '#F5DEB3',
          ore: '#708090',
          water: '#1E90FF',
          sand: '#F4A460',
        }
      }
    },
  },
  plugins: [],
}
