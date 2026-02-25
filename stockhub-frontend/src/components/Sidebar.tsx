import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Tag,
  Ruler,
  Truck,
  Users,
  BarChart3,
  ShoppingCart,
  ShoppingBag,
  FileDown,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../store/auth.store'
import { reportsApi } from '../api/reports.api'
import { getErrorMessage } from '../api/client'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/categories', label: 'Categories', icon: Tag },
  { to: '/units', label: 'Units', icon: Ruler },
  { to: '/suppliers', label: 'Suppliers', icon: Truck },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/stock', label: 'Stock', icon: BarChart3 },
  { to: '/purchase-orders', label: 'Purchase Orders', icon: ShoppingCart },
  { to: '/sale-orders', label: 'Sale Orders', icon: ShoppingBag },
]

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [downloadingStock, setDownloadingStock] = useState(false)
  const [downloadingSales, setDownloadingSales] = useState(false)

  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleDownloadStockReport = async () => {
    setDownloadingStock(true)
    try {
      await reportsApi.downloadStockSummary()
      toast.success('Stock report downloaded!')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setDownloadingStock(false)
    }
  }

  const handleDownloadSalesReport = async () => {
    setDownloadingSales(true)
    try {
      await reportsApi.downloadSalesReport()
      toast.success('Sales report downloaded!')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setDownloadingSales(false)
    }
  }

  const sidebarContent = (
    <aside className="flex flex-col h-full bg-[var(--color-bg)] border-r border-[var(--color-border)] w-64">
      {/* Brand */}
      <div className="px-6 py-5 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-blue)] flex items-center justify-center">
            <span className="text-white text-xs font-bold tracking-tight">SH</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--color-text)] leading-none">StockHub</p>
            <p className="text-[10px] text-[var(--color-text-dim)] mt-0.5 font-mono">DvNET Systems</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-3">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-sm transition-all duration-150 ${isActive
                ? 'bg-[var(--color-blue-dim)] text-[var(--color-blue)] font-semibold'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)]'
              }`
            }
          >
            <Icon size={17} strokeWidth={isActiveIcon(to) ? 2.5 : 2} />
            {label}
          </NavLink>
        ))}

        {/* PDF Report */}
        <div className="mt-2 pt-2 border-t border-[var(--color-border)]">
          <button
            onClick={handleDownloadStockReport}
            disabled={downloadingStock}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-all duration-150 cursor-pointer disabled:opacity-50"
          >
            <FileDown size={17} />
            {downloadingStock ? 'Downloading...' : 'Stock Report (PDF)'}
          </button>
        </div>
        <button
          onClick={handleDownloadSalesReport}
          disabled={downloadingSales}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-all duration-150 cursor-pointer disabled:opacity-50"
        >
          <FileDown size={17} />
          {downloadingSales ? 'Downloading...' : 'Sales Report (PDF)'}
        </button>
      </nav>

      {/* User + Logout */}
      <div className="px-4 py-4 border-t border-[var(--color-border)]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center">
            <span className="text-[var(--color-blue)] text-xs font-semibold">
              {user?.username?.[0]?.toUpperCase() ?? 'A'}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-[var(--color-text)] truncate">{user?.username ?? 'Admin'}</p>
            <p className="text-xs text-[var(--color-text-dim)] truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-[var(--color-text-muted)] hover:text-[var(--color-red)] hover:bg-[var(--color-red-dim)] transition-all duration-150 cursor-pointer"
        >
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </aside>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:flex h-screen sticky top-0 shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile hamburger */}
      <div className="md:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed top-4 left-4 z-30 p-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)]"
        >
          <Menu size={20} />
        </button>

        {mobileOpen && (
          <div className="fixed inset-0 z-40 flex">
            <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
            <div className="relative z-50 flex h-full">
              {sidebarContent}
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 z-50 p-1 text-[var(--color-text-muted)]"
            >
              <X size={20} />
            </button>
          </div>
        )}
      </div>
    </>
  )
}

// Helper used in className callbacks
function isActiveIcon(_to: string) {
  return location.pathname === _to || (location.pathname.startsWith(_to) && _to !== '/')
}
