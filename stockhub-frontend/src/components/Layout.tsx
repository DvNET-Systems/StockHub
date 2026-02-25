import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

export function Layout() {
  return (
    <div className="flex min-h-screen bg-[var(--color-bg)]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto min-w-0">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
