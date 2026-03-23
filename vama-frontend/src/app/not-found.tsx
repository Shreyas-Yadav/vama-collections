import Link from 'next/link'
import { Home } from 'lucide-react'
import { AppShell } from '@/components/layout/app-shell'

export default function NotFound() {
  return (
    <AppShell>
      <div className="flex min-h-full items-center justify-center">
        <div className="max-w-md text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--color-muted)]">404</p>
          <h1 className="mt-3 text-3xl font-semibold text-[var(--color-foreground)]">Page Not Found</h1>
          <p className="mt-3 text-sm text-[var(--color-muted)]">
            The page you are looking for does not exist or may have been moved.
          </p>
          <div className="mt-6 flex justify-center">
            <Link
              href="/dashboard"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-[var(--radius)] bg-[var(--color-primary)] px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[var(--color-primary-hover)]"
            >
              <Home className="h-4 w-4" /> Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
