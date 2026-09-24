import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Inter } from 'next/font/google'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({
  variable: '--font-heading',
  subsets: ['latin'],
})

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'TK Orchid — Sistem Informasi Administrasi Siswa',
    template: '%s — TK Orchid',
  },
  description:
    'Sistem Informasi Administrasi Siswa Taman Kanak-Kanah Berbasis Web — Studi Kasus TK Orchid, Bekasi. Konten profil sekolah dapat diubah dari menu Pengaturan.',
}

// Anti-flash: default DARK (night) mode. Baca preferensi tersimpan sebelum paint pertama.
// 'light' tersimpan → tidak menambahkan .dark. Kosong/error → dark.
const themeScript = `(function(){try{var t=localStorage.getItem('orchid-theme');if(t!=='light'){document.documentElement.classList.add('dark');}}catch(e){document.documentElement.classList.add('dark');}})();`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${jakarta.variable} ${inter.variable} antialiased`}>{children}</body>
    </html>
  )
}
