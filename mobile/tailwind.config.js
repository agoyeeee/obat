/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter_400Regular', 'sans-serif'],
        medium: ['Inter_500Medium', 'sans-serif'],
        semibold: ['Inter_600SemiBold', 'sans-serif'],
        bold: ['Inter_700Bold', 'sans-serif'],
        extrabold: ['Inter_800ExtraBold', 'sans-serif'],
        black: ['Inter_900Black', 'sans-serif'],
      },
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
