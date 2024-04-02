import { nextui } from '@nextui-org/react';
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        danger: '#EA3F68',
        success: 'var(--color-primary)',
        warning: '#FFB800',
        info: '#7E8A93',
      },
    },
  },
  darkMode: 'class',
  plugins: [
    nextui({
      addCommonColors: true,
      defaultTheme: 'dark',
      layout:{
        radius:{
          small: '0.25rem',
          medium: '0.5rem',
          large: '1rem',
        }
      },
      themes: {
        dark: {
          colors: {
            primary: {
              DEFAULT: 'var(--color-primary)',
              foreground: '#FFF',
            },
          },
        },
      },
    }),
  ],
};
export default config;
