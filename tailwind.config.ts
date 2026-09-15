import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'imperial-navy': '#1B2D4F',
        'imperial-bronze': '#B5924C',
        'imperial-ivory': '#FAF8F3',
        'imperial-beige': '#F0EBE3',
        'imperial-greige': '#E5DDD4',
      },
      fontFamily: {
        sans: ['var(--font-sans)', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'Times New Roman', 'serif'],
      },
    },
  },
  plugins: [],
}
export default config
