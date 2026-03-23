import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-[var(--color-surface-raised)] text-[var(--color-muted-fg)] border-transparent',
  success: 'bg-[var(--color-success-bg)] text-[var(--color-success-fg)] border-transparent',
  warning: 'bg-[var(--color-warning-bg)] text-[var(--color-warning-fg)] border-transparent',
  danger: 'bg-[var(--color-danger-bg)] text-[var(--color-danger-fg)] border-transparent',
  info: 'bg-[var(--color-info-bg)] text-[var(--color-info-fg)] border-transparent',
  outline: 'bg-transparent border-[var(--color-border-strong)] text-[var(--color-muted-fg)]',
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
