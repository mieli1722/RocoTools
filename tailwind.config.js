/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'rock-primary': '#3b82f6',
        'rock-secondary': '#10b981',
        'rock-bg': '#f8fafc',
        'rock-card': '#ffffff',
      }
    },
  },
  plugins: [],
}
