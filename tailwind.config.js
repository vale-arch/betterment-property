/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Defined from your new logo
        brand: {
          navy: '#1B1464',     // The deep tower color
          purple: '#4834D4',   // The secondary accent
          arctic: '#F8F9FA',   // The professional white
          slate: '#2D3436',    // Professional text
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Replacing Bebas for a corporate look
      },
    },
  },
  plugins: [],
}