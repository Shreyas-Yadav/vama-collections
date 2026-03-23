import {
  LayoutDashboard, Package, Tag, Truck, ShoppingCart,
  Users, BarChart2, Settings, Receipt, ClipboardList, FileText,
} from 'lucide-react'

export interface NavItem {
  label: string
  href?: string
  icon: React.ElementType
  children?: NavItem[]
}

export const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
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

export function getPageTitle(pathname: string): string {
  if (ROUTE_LABELS[pathname]) return ROUTE_LABELS[pathname]
  if (pathname.includes('/inventory/') && pathname.endsWith('/edit')) return 'Edit Product'
  if (pathname.includes('/inventory/')) return 'Product Details'
  if (pathname.includes('/vendors/')) return 'Vendor Details'
  if (pathname.includes('/purchase-orders/')) return 'Purchase Order Details'
  if (pathname.includes('/sales/')) return 'Bill Details'
  if (pathname.includes('/customers/')) return 'Customer Details'
  return 'Vama'
}
