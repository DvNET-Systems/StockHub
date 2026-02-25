import { useQuery } from '@tanstack/react-query'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Package, AlertTriangle, TrendingUp, ShoppingCart } from 'lucide-react'
import { productsApi } from '../api/products.api'
import { stockApi } from '../api/stock.api'
import { purchaseOrdersApi } from '../api/purchaseOrders.api'
import { saleOrdersApi } from '../api/saleOrders.api'
import { Card, StatusBadge, Spinner } from '../components/ui'
import { normalizeStatus, normalizeMovementType } from '../utils'
import { format, parseISO } from 'date-fns'

export function DashboardPage() {
  const { data: products = [], isLoading: pLoading } = useQuery({
    queryKey: ['products'],
    queryFn: productsApi.getAll,
  })
  const { data: lowStock = [] } = useQuery({
    queryKey: ['products', 'low-stock'],
    queryFn: productsApi.getLowStock,
  })
  const { data: movements = [] } = useQuery({
    queryKey: ['stock', 'movements'],
    queryFn: stockApi.getMovements,
  })
  const { data: purchaseOrders = [] } = useQuery({
    queryKey: ['purchase-orders'],
    queryFn: purchaseOrdersApi.getAll,
  })
  const { data: saleOrders = [] } = useQuery({
    queryKey: ['sale-orders'],
    queryFn: saleOrdersApi.getAll,
  })

  // ── Compute stats ───────────────────────────────────────────────────────
  const totalStockValue = products.reduce(
    (sum, p) => sum + p.currentStock * p.costPrice,
    0
  )
  const activeOrders = [
    ...purchaseOrders.filter((o) => { const s = normalizeStatus(o.status as never); return s === 'Draft' || s === 'Confirmed' }),
    ...saleOrders.filter((o) => { const s = normalizeStatus(o.status as never); return s === 'Draft' || s === 'Confirmed' }),
  ].length

  // ── Chart data: last 14 days of movements ───────────────────────────────
  const chartData = buildChartData(movements)

  const stats = [
    {
      label: 'Total Products',
      value: products.length,
      icon: Package,
      color: 'text-[var(--color-blue)]',
      bg: 'bg-[var(--color-blue-dim)]',
    },
    {
      label: 'Low Stock Alerts',
      value: lowStock.length,
      icon: AlertTriangle,
      color: 'text-[var(--color-yellow)]',
      bg: 'bg-[var(--color-yellow-dim)]',
      alert: lowStock.length > 0,
    },
    {
      label: 'Stock Value',
      value: `$${totalStockValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: 'text-[var(--color-green)]',
      bg: 'bg-[var(--color-green-dim)]',
    },
    {
      label: 'Active Orders',
      value: activeOrders,
      icon: ShoppingCart,
      color: 'text-[var(--color-orange)]',
      bg: 'bg-orange-500/10',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-[var(--color-text)]">Dashboard</h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
          Overview of your inventory operations
        </p>
      </div>

      {/* Stats */}
      {pLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-[var(--color-text-muted)] font-medium">{stat.label}</p>
                  <p className={`text-2xl font-bold mt-1 font-mono ${stat.alert ? 'text-[var(--color-yellow)]' : 'text-[var(--color-text)]'}`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`p-2 rounded-xl ${stat.bg}`}>
                  <stat.icon size={18} className={stat.color} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <Card className="lg:col-span-2" padding={false}>
          <div className="px-5 pt-5 pb-2">
            <h2 className="text-sm font-semibold text-[var(--color-text)]">Stock Movements (Last 14 Days)</h2>
            <p className="text-xs text-[var(--color-text-muted)]">Units In vs Out</p>
          </div>
          <div className="h-56 px-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1d9bf0" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#1d9bf0" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f4212e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f4212e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#536471" tick={{ fontSize: 11 }} tickLine={false} />
                <YAxis stroke="#536471" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: '#16181c',
                    border: '1px solid #2f3336',
                    borderRadius: '12px',
                    fontSize: 12,
                  }}
                  labelStyle={{ color: '#e7e9ea' }}
                />
                <Area type="monotone" dataKey="in" stroke="#1d9bf0" fill="url(#colorIn)" strokeWidth={2} name="Stock In" />
                <Area type="monotone" dataKey="out" stroke="#f4212e" fill="url(#colorOut)" strokeWidth={2} name="Stock Out" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Low Stock */}
        <Card padding={false}>
          <div className="px-5 pt-5 pb-2 border-b border-[var(--color-border)]">
            <h2 className="text-sm font-semibold text-[var(--color-text)]">⚠ Low Stock</h2>
          </div>
          <div className="divide-y divide-[var(--color-border)] max-h-64 overflow-y-auto">
            {lowStock.length === 0 ? (
              <p className="text-xs text-[var(--color-text-muted)] p-5">All products are stocked well 🎉</p>
            ) : (
              lowStock.map((p) => (
                <div key={p.id} className="px-5 py-3 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text)]">{p.name}</p>
                    <p className="text-xs text-[var(--color-text-dim)] font-mono">{p.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono text-[var(--color-red)]">{p.currentStock}</p>
                    <p className="text-xs text-[var(--color-text-dim)]">min {p.reorderLevel}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOrdersCard title="Recent Purchase Orders" orders={purchaseOrders.slice(0, 5)} />
        <RecentOrdersCard title="Recent Sale Orders" orders={saleOrders.slice(0, 5)} />
      </div>
    </div>
  )
}

function RecentOrdersCard({
  title,
  orders,
}: {
  title: string
  orders: { id: number; orderNumber: string; status: string; totalAmount: number; orderDate: string }[]
}) {
  return (
    <Card padding={false}>
      <div className="px-5 pt-5 pb-3 border-b border-[var(--color-border)]">
        <h2 className="text-sm font-semibold text-[var(--color-text)]">{title}</h2>
      </div>
      <div className="divide-y divide-[var(--color-border)]">
        {orders.length === 0 && (
          <p className="text-xs text-[var(--color-text-muted)] px-5 py-4">No orders yet.</p>
        )}
        {orders.map((o) => (
          <div key={o.id} className="px-5 py-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-mono text-[var(--color-text)]">{o.orderNumber}</p>
              <p className="text-xs text-[var(--color-text-dim)] mt-0.5">
                {format(parseISO(o.orderDate), 'MMM d, yyyy')}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={o.status as import('../types').OrderStatus | number} />
              <span className="text-sm font-mono font-medium text-[var(--color-text)]">
                ${o.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

// Build chart data from movements
function buildChartData(movements: import('../types').StockMovementResponse[]) {
  const today = new Date()
  const days: Record<string, { in: number; out: number }> = {}

  for (let i = 13; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = format(d, 'MMM d')
    days[key] = { in: 0, out: 0 }
  }

  for (const m of movements) {
    const key = format(parseISO(m.movementDate), 'MMM d')
    if (key in days) {
      const type = normalizeMovementType(m.type as string | number)
      if (type === 'In') days[key].in += Number(m.quantity)
      else if (type === 'Out') days[key].out += Number(m.quantity)
    }
  }

  return Object.entries(days).map(([date, vals]) => ({ date, ...vals }))
}
