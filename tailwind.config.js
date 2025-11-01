/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
       colors: {
        navy: "#1B1A33", 
        gold: {
          DEFAULT: "#F5C518", 
          light: "#FFE57F", 
        },
      },
    },
  },
  plugins: [],
};
