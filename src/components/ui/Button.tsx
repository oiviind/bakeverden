import styles from './Button.module.css'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'neutral'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  loading?: boolean
  /** Render as an anchor tag — useful for link-buttons */
  as?: 'button' | 'a'
  href?: string
}

/**
 * Use this when you need button styling on a Next.js <Link> or other element.
 * Example: <Link href="/" className={getButtonClassName('secondary', 'md', true)}>
 */
export function getButtonClassName(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  fullWidth = false
): string {
  return [styles.btn, styles[variant], styles[size], fullWidth ? styles.fullWidth : '']
    .filter(Boolean)
    .join(' ')
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  as: Tag = 'button',
  href,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const classes = [
    styles.btn,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  if (Tag === 'a') {
    return (
      <a href={href} className={classes}>
        {loading && <span className={styles.spinner} aria-hidden />}
        {children}
      </a>
    )
  }

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {loading && <span className={styles.spinner} aria-hidden />}
      {children}
    </button>
  )
}
