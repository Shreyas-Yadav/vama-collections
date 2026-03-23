import { cn } from '@/lib/utils'
import { type TextareaHTMLAttributes, forwardRef } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'flex min-h-[80px] w-full rounded-[var(--radius)] border bg-white px-3 py-2 text-sm',
          'placeholder:text-[var(--color-muted)] text-[var(--color-foreground)]',
          'border-[var(--color-border)] focus:border-[var(--color-primary)]',
          'outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20',
          'transition-colors duration-150 resize-y',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[var(--color-surface-raised)]',
          error && 'border-[var(--color-danger)] focus:ring-[var(--color-danger)]/20',
          className,
        )}
        {...props}
      />
    )
  }
)

Textarea.displayName = 'Textarea'
