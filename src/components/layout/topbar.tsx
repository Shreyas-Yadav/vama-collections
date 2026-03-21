'use client'

import { usePathname } from 'next/navigation'
import { Bell, Search } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const ROUTE_LABELS: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/inventory': 'Products',
  '/inventory/new': 'Add Product',
  '/categories': 'Categories',
  '/vendors': 'Vendors',
  '/vendors/new': 'Add Vendor',
  '/purchase-orders': 'Purchase Orders',
  '/purchase-orders/new': 'New Purchase Order',
  '/sales': 'Bills & Invoices',
  '/sales/new': 'New Bill',
  '/customers': 'Customers',
  '/reports': 'Reports',
  '/reports/sales': 'Sales Report',
  '/reports/stock': 'Stock Report',
  '/reports/gst': 'GST Report',
  '/settings': 'Settings',
  '/settings/tax': 'Tax & GST Settings',
  '/settings/users': 'Users',
}

function getPageTitle(pathname: string): string {
  if (ROUTE_LABELS[pathname]) return ROUTE_LABELS[pathname]
  // Handle dynamic segments
  if (pathname.includes('/inventory/') && pathname.endsWith('/edit')) return 'Edit Product'
  if (pathname.includes('/inventory/')) return 'Product Details'
  if (pathname.includes('/vendors/')) return 'Vendor Details'
  if (pathname.includes('/purchase-orders/')) return 'Purchase Order Details'
  if (pathname.includes('/sales/')) return 'Bill Details'
  if (pathname.includes('/customers/')) return 'Customer Details'
  return 'Vama'
}

export function Topbar() {
  const pathname = usePathname()
  const title = getPageTitle(pathname)

  return (
    <header className="h-14 border-b border-[var(--color-border)] bg-white flex items-center gap-4 px-6 shrink-0">
      <h2 className="text-sm font-semibold text-[var(--color-foreground)] flex-1">{title}</h2>

      <div className="flex items-center gap-2">
        {/* Search hint */}
        <button className="hidden sm:flex items-center gap-2 h-8 px-3 rounded-[var(--radius)] border border-[var(--color-border)] text-[var(--color-muted)] text-sm hover:border-[var(--color-primary)] transition-colors">
          <Search className="h-3.5 w-3.5" />
          <span className="text-xs">Search...</span>
          <kbd className="ml-2 text-[10px] bg-[var(--color-surface-raised)] px-1.5 py-0.5 rounded border border-[var(--color-border)]">⌘K</kbd>
        </button>

        {/* Notifications */}
        <button className="relative h-8 w-8 flex items-center justify-center rounded-[var(--radius)] text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-raised)] transition-colors">
          <Bell className="h-4 w-4" />
        </button>

        {/* User avatar */}
        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarFallback className="text-xs">SC</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
