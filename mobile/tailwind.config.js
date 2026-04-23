/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#0D9488',
        primaryLight: '#CCFBF1',
        primaryDark: '#115E59',
        surface: '#FFFFFF',
        textPrimary: '#0F172A',
        textMuted: '#64748B',
      }
    },
  },
  plugins: [],
}
