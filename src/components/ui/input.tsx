import { cn } from '@/lib/utils'
import { type InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'flex h-9 w-full rounded-[var(--radius)] border bg-white px-3 py-2 text-sm',
          'placeholder:text-[var(--color-muted)] text-[var(--color-foreground)]',
          'border-[var(--color-border)] focus:border-[var(--color-primary)]',
          'outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20',
          'transition-colors duration-150',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[var(--color-surface-raised)]',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          error && 'border-[var(--color-danger)] focus:ring-[var(--color-danger)]/20',
          className,
        )}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'
