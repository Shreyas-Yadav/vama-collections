'use client'

import { useRouter } from 'next/navigation'
import { TrendingUp, Package, AlertTriangle, ShoppingCart, IndianRupee, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useDashboardStats } from '@/hooks/use-sales'
import { useProducts } from '@/hooks/use-products'
import { useSales } from '@/hooks/use-sales'
import { useCustomers } from '@/hooks/use-customers'
import { formatINR, formatINRCompact, formatDateTime } from '@/lib/format'
import { BILL_STATUS_LABELS } from '@/lib/constants'
import type { Bill } from '@/types'

interface MetricCardProps {
  title: string
  value: string
  subtext?: string
  icon: React.ElementType
  trend?: 'up' | 'down' | 'neutral'
  loading?: boolean
  onClick?: () => void
  accent?: string
}

function MetricCard({ title, value, subtext, icon: Icon, loading, onClick, accent }: MetricCardProps) {
  return (
    <Card
      className={`transition-shadow ${onClick ? 'cursor-pointer hover:shadow-md' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-[var(--color-muted)] font-medium">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-24 mt-2" />
            ) : (
              <p className="text-2xl font-bold mt-1" style={{ color: accent }}>{value}</p>
            )}
            {subtext && !loading && (
              <p className="text-xs text-[var(--color-muted)] mt-1">{subtext}</p>
            )}
          </div>
          <div
            className="h-10 w-10 rounded-[var(--radius)] flex items-center justify-center shrink-0"
            style={{ backgroundColor: accent ? `${accent}18` : 'var(--color-surface-raised)' }}
          >
            <Icon className="h-5 w-5" style={{ color: accent ?? 'var(--color-muted)' }} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const billStatusBadge: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
  DRAFT: 'default', PAID: 'success', PARTIALLY_PAID: 'warning', CANCELLED: 'danger',
}

export default function DashboardPage() {
  const router = useRouter()
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: lowStockData } = useProducts({ page: 1, pageSize: 5, stockStatus: 'LOW_STOCK' })
  const { data: outOfStockData } = useProducts({ page: 1, pageSize: 1, stockStatus: 'OUT_OF_STOCK' })
  const { data: recentSales, isLoading: salesLoading } = useSales({ page: 1, pageSize: 5 })
  const { data: customersData } = useCustomers({ page: 1, pageSize: 1 })

  const lowStockCount = (lowStockData?.total ?? 0) + (outOfStockData?.total ?? 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Welcome back</h1>
        <p className="text-sm text-[var(--color-muted)] mt-0.5">Here&apos;s what&apos;s happening at your store today</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Today's Sales"
          value={statsLoading ? '...' : formatINRCompact(stats?.todaySales ?? 0)}
          subtext={`${stats?.todayBills ?? 0} bills today`}
          icon={IndianRupee}
          loading={statsLoading}
          accent="#C45E2A"
          onClick={() => router.push('/sales')}
        />
        <MetricCard
          title="This Month"
          value={statsLoading ? '...' : formatINRCompact(stats?.monthSales ?? 0)}
          subtext={`${stats?.monthBills ?? 0} bills this month`}
          icon={TrendingUp}
          loading={statsLoading}
          accent="#16A34A"
          onClick={() => router.push('/reports/sales')}
        />
        <MetricCard
          title="Low Stock Items"
          value={String(lowStockCount)}
          subtext="items need attention"
          icon={AlertTriangle}
          accent={lowStockCount > 0 ? '#D97706' : undefined}
          onClick={() => router.push('/inventory?filter=low_stock')}
        />
        <MetricCard
          title="Total Customers"
          value={String(customersData?.total ?? '—')}
          subtext="registered customers"
          icon={Users}
          accent="#2563EB"
          onClick={() => router.push('/customers')}
        />
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 flex-wrap">
        <Button onClick={() => router.push('/sales/new')}>
          <ShoppingCart className="h-4 w-4" /> New Bill
        </Button>
        <Button variant="outline" onClick={() => router.push('/inventory/new')}>
          <Package className="h-4 w-4" /> Add Product
        </Button>
        <Button variant="outline" onClick={() => router.push('/purchase-orders/new')}>
          New Purchase Order
        </Button>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-3">
            <CardTitle>Recent Sales</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => router.push('/sales')} className="text-[var(--color-primary)]">
              View all
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {salesLoading ? (
              <div className="p-5 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            ) : recentSales?.data.length === 0 ? (
              <div className="p-8 text-center text-sm text-[var(--color-muted)]">
                No sales yet. <Button variant="link" onClick={() => router.push('/sales/new')}>Create first bill</Button>
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {recentSales?.data.map((bill: Bill) => (
                  <div
                    key={bill.id}
                    className="flex items-center justify-between px-5 py-3 hover:bg-[var(--color-surface-raised)] cursor-pointer transition-colors"
                    onClick={() => router.push(`/sales/${bill.id}`)}
                  >
                    <div>
                      <p className="text-sm font-medium">{bill.customerName}</p>
                      <p className="text-xs text-[var(--color-muted)]">{bill.billNumber} · {formatDateTime(bill.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold">{formatINR(bill.grandTotal)}</span>
                      <Badge variant={billStatusBadge[bill.status] ?? 'default'} className="text-xs">
                        {BILL_STATUS_LABELS[bill.status]}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-3">
            <CardTitle>Low Stock Alert</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => router.push('/inventory')} className="text-[var(--color-primary)]">
              View all
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {lowStockCount === 0 ? (
              <div className="p-8 text-center">
                <Package className="h-8 w-8 text-[var(--color-success)] mx-auto mb-2" />
                <p className="text-sm text-[var(--color-muted)]">All stock levels are healthy</p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {lowStockData?.data.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between px-5 py-3 hover:bg-[var(--color-surface-raised)] cursor-pointer transition-colors"
                    onClick={() => router.push(`/inventory/${p.id}`)}
                  >
                    <div>
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-[var(--color-muted)]">{p.sku}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm">Qty: <span className="font-semibold text-[var(--color-warning)]">{p.quantityInStock}</span></span>
                      <Badge variant={p.stockStatus === 'OUT_OF_STOCK' ? 'danger' : 'warning'}>
                        {p.stockStatus === 'OUT_OF_STOCK' ? 'Out of Stock' : 'Low Stock'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
