import { SearchX } from 'lucide-react'
import { EmptyState, HeaderButton } from '@/components/dashboard/primitives'

export default function NotFound() {
  return (
    <div className="flex min-h-[55vh] items-center justify-center">
      <div className="w-full max-w-lg">
        <EmptyState
          icon={SearchX}
          title="Data tidak ditemukan"
          description="Data yang Anda cari tidak ada atau sudah dihapus."
          action={<HeaderButton href="/dashboard" primary>Kembali ke Dashboard</HeaderButton>}
        />
      </div>
    </div>
  )
}
