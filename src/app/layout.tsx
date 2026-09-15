import type { Metadata } from 'next'
import { Playfair_Display, Manrope } from 'next/font/google'
import './globals.css'

// Self-hosted at build time — works on GitHub Pages and embeds correctly
// into PNG/PDF exports (html-to-image fetches same-origin font files).
const displayFont = Playfair_Display({
  subsets: ['cyrillic', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
})

const sansFont = Manrope({
  subsets: ['cyrillic', 'latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'iWEL Card Builder 2.0',
  description: 'Конструктор коммерческих предложений iWEL — карточки квартир, расчёт рассрочки, генплан с видами из окон',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${displayFont.variable} ${sansFont.variable}`}>
      <body style={{ margin: 0, padding: 0, height: '100vh', overflow: 'hidden' }}>
        {children}
      </body>
    </html>
  )
}
