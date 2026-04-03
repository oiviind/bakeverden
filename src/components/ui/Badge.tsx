import styles from './Badge.module.css'

type BadgeVariant = 'success' | 'warning' | 'error' | 'info'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

export function Badge({ variant = 'info', className, children, ...props }: BadgeProps) {
  const classes = [styles.badge, styles[variant], className ?? ''].filter(Boolean).join(' ')

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  )
}
