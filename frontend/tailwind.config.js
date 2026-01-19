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
        'uniblox-teal': '#41D6CD',
        'uniblox-purple': '#5D4FEA',
      },
      backgroundImage: {
        'gradient-uniblox': 'linear-gradient(to right, #5D4FEA, #41D6CD)',
        'gradient-uniblox-vertical': 'linear-gradient(to bottom, #5D4FEA, #41D6CD)',
        'gradient-dark': 'linear-gradient(to bottom, #1a1a2e, #16213e, #0f3460)',
      },
    },
  },
  plugins: [],
}
