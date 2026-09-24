import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth/session'

// Catatan: /kegiatan, /pengumuman, /pendaftaran (public group) TIDAK dilindungi — versi publik.
// Admin area: keuangan pakai prefix /tagihan /pembayaran /pengeluaran di bawah /keuangan.
const ADMIN_STAFF_PREFIXES = [
  '/dashboard', '/siswa', '/wali', '/tahun-ajaran', '/kelas',
  '/presensi', '/penilaian', '/perkembangan',
  '/keuangan/tagihan', '/keuangan/pembayaran', '/keuangan/pengeluaran', '/keuangan/jenis-biaya',
  '/dokumen', '/laporan', '/pengguna', '/audit-log', '/pengaturan',
]

const TEACHER_PREFIXES = ['/guru']
const PARENT_PREFIXES = ['/portal']

function roleDashboard(role: string): string {
  if (role === 'TEACHER') return '/guru/dashboard'
  if (role === 'PARENT') return '/portal'
  return '/dashboard'
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value)

  // Sudah login -> /login dialihkan ke dashboard role
  if (pathname === '/login' && session) {
    return NextResponse.redirect(new URL(roleDashboard(session.role), request.url))
  }

  const needsAdminStaff = ADMIN_STAFF_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))
  const needsTeacher = TEACHER_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))
  const needsParent = PARENT_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))

  if ((needsAdminStaff || needsTeacher || needsParent) && !session) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Matcher sudah membatasi ke area protected; /login ditangani blok atas.
  // Tanpa catch-all agar /login tanpa sesi tidak redirect ke dirinya sendiri (loop).
  if (!session) return NextResponse.next()

  if (needsAdminStaff && !(session.role === 'ADMIN' || session.role === 'STAFF')) {
    return NextResponse.redirect(new URL(roleDashboard(session.role), request.url))
  }
  if (needsTeacher && session.role !== 'TEACHER') {
    return NextResponse.redirect(new URL(roleDashboard(session.role), request.url))
  }
  if (needsParent && session.role !== 'PARENT') {
    return NextResponse.redirect(new URL(roleDashboard(session.role), request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Protected areas saja — public & API statis dilewati
    '/login',
    '/dashboard/:path*', '/siswa/:path*', '/wali/:path*',
    '/tahun-ajaran/:path*', '/kelas/:path*', '/presensi/:path*', '/penilaian/:path*',
    '/perkembangan/:path*',
    '/keuangan/:path*',
    '/dokumen/:path*', '/laporan/:path*', '/pengguna/:path*', '/audit-log/:path*', '/pengaturan/:path*',
    '/guru/:path*', '/portal/:path*',
  ],
}
