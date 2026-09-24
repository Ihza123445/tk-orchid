import type { Metadata } from 'next'
import { Caveat, Plus_Jakarta_Sans, Inter } from 'next/font/google'
import './globals.css'
import './public-school.css'

const jakarta = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin'],
})

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

const playful = Caveat({
  variable: '--font-playful',
  subsets: ['latin'],
  weight: ['500', '600', '700'],
})

export const metadata: Metadata = {
  title: {
    default: 'TK Orchid — Sistem Informasi Administrasi Siswa',
    template: '%s — TK Orchid',
  },
  description:
    'Sistem informasi administrasi siswa dan portal keluarga TK Orchid, Bekasi.',
}

// Anti-flash: halaman publik ramah keluarga memakai light mode sebagai default.
// Preferensi dark yang pernah dipilih tetap dihormati sebelum paint pertama.
const themeScript = `(function(){try{var t=localStorage.getItem('orchid-theme');if(t==='dark'){document.documentElement.classList.add('dark');}}catch(e){}})();`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${jakarta.variable} ${inter.variable} ${playful.variable} antialiased`}>{children}</body>
    </html>
  )
}
