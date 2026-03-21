'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Package, Tag, Truck, ShoppingCart,
  Users, BarChart2, Settings, ChevronLeft, ChevronRight,
  Receipt, ClipboardList, FileText, ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface NavItem {
  label: string
  href?: string
  icon: React.ElementType
  children?: NavItem[]
}

const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Inventory',
    items: [
      { label: 'Products', href: '/inventory', icon: Package },
      { label: 'Categories', href: '/categories', icon: Tag },
    ],
  },
  {
    title: 'Procurement',
    items: [
      { label: 'Vendors', href: '/vendors', icon: Truck },
      { label: 'Purchase Orders', href: '/purchase-orders', icon: ClipboardList },
    ],
  },
  {
    title: 'Sales',
    items: [
      { label: 'New Bill', href: '/sales/new', icon: Receipt },
      { label: 'Bills / Invoices', href: '/sales', icon: ShoppingCart },
      { label: 'Customers', href: '/customers', icon: Users },
    ],
  },
  {
    title: 'Reports',
    items: [
      {
        label: 'Reports',
        icon: BarChart2,
        children: [
          { label: 'Sales Report', href: '/reports/sales', icon: BarChart2 },
          { label: 'Stock Report', href: '/reports/stock', icon: Package },
          { label: 'GST Report', href: '/reports/gst', icon: FileText },
        ],
      },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'Settings', href: '/settings', icon: Settings },
    ],
  },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['Reports']))

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    if (href === '/sales') return pathname === '/sales' || pathname.startsWith('/sales/')
    return pathname.startsWith(href)
  }

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-[var(--color-sidebar)] text-[var(--color-sidebar-fg)]',
        'transition-all duration-300 shrink-0',
        collapsed ? 'w-16' : 'w-[var(--sidebar-width)]',
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center h-14 border-b border-[var(--color-sidebar-border)] px-4',
        collapsed ? 'justify-center' : 'gap-3',
      )}>
        <div className="h-8 w-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-sm">V</span>
        </div>
        {!collapsed && (
          <div>
            <p className="text-sm font-bold text-[var(--color-sidebar-fg)] leading-tight">Vama</p>
            <p className="text-[10px] text-[var(--color-sidebar-muted)] leading-tight">Inventory</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.title}>
            {!collapsed && (
              <p className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-sidebar-muted)]">
                {group.title}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                if (item.children) {
                  const isExpanded = expandedItems.has(item.label)
                  const hasActiveChild = item.children.some((c) => c.href && isActive(c.href))
                  return (
                    <li key={item.label}>
                      <button
                        onClick={() => toggleExpand(item.label)}
                        className={cn(
                          'w-full flex items-center gap-2.5 rounded-[var(--radius-sm)] px-2 py-2 text-sm',
                          'text-[var(--color-sidebar-fg)] hover:bg-[var(--color-sidebar-hover)] transition-colors',
                          hasActiveChild && 'text-white',
                          collapsed && 'justify-center',
                        )}
                      >
                        <item.icon className="h-4.5 w-4.5 shrink-0 h-[18px] w-[18px]" />
                        {!collapsed && (
                          <>
                            <span className="flex-1 text-left">{item.label}</span>
                            <ChevronDown className={cn('h-3.5 w-3.5 transition-transform duration-200', isExpanded && 'rotate-180')} />
                          </>
                        )}
                      </button>
                      {!collapsed && isExpanded && (
                        <ul className="ml-4 mt-0.5 space-y-0.5 border-l border-[var(--color-sidebar-border)] pl-3">
                          {item.children.map((child) => (
                            <li key={child.href}>
                              <Link
                                href={child.href!}
                                className={cn(
                                  'flex items-center gap-2 rounded-[var(--radius-sm)] px-2 py-1.5 text-sm',
                                  'text-[var(--color-sidebar-muted)] hover:text-[var(--color-sidebar-fg)] hover:bg-[var(--color-sidebar-hover)] transition-colors',
                                  child.href && isActive(child.href) && 'bg-[var(--color-sidebar-active)]/20 text-white',
                                )}
                              >
                                <child.icon className="h-[16px] w-[16px]" />
                                {child.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  )
                }

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href!}
                      className={cn(
                        'flex items-center gap-2.5 rounded-[var(--radius-sm)] px-2 py-2 text-sm',
                        'text-[var(--color-sidebar-muted)] hover:text-[var(--color-sidebar-fg)] hover:bg-[var(--color-sidebar-hover)] transition-colors',
                        item.href && isActive(item.href) && 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]',
                        collapsed && 'justify-center',
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <item.icon className="h-[18px] w-[18px] shrink-0" />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-[var(--color-sidebar-border)] p-2">
        <button
          onClick={onToggle}
          className={cn(
            'w-full flex items-center gap-2 rounded-[var(--radius-sm)] px-2 py-2 text-sm',
            'text-[var(--color-sidebar-muted)] hover:text-[var(--color-sidebar-fg)] hover:bg-[var(--color-sidebar-hover)] transition-colors',
            collapsed && 'justify-center',
          )}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4" /><span>Collapse</span></>}
        </button>
      </div>
    </aside>
  )
}
