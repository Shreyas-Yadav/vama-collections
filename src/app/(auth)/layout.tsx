export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full flex items-center justify-center bg-[var(--color-surface-raised)]">
      {children}
    </div>
  )
}
