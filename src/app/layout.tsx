import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Imperial Card Builder',
  description: 'Конструктор маркетинговых карточек квартир ЖК Империал',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body style={{ margin: 0, padding: 0, height: '100vh', overflow: 'hidden' }}>
        {children}
      </body>
    </html>
  )
}
