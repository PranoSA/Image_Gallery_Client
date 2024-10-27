import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        'neon-green': '#39FF14',
        'neon-blue': '#14FFEC',
        'neon-pink': '#FF1493',
        'neon-orange': '#FFA500',
        'neon-yellow': '#FFFF00',
        'neon-red': '#FF0000',
        'neon-purple': '#9D00FF',
      },
    },
  },
  plugins: [],
};
export default config;
