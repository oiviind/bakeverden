import styles from './Alert.module.css'

type AlertVariant = 'success' | 'error' | 'warning' | 'info'

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant
}

export function Alert({ variant = 'info', className, children, ...props }: AlertProps) {
  const classes = [styles.alert, styles[variant], className ?? ''].filter(Boolean).join(' ')

  return (
    <div role="alert" className={classes} {...props}>
      {children}
    </div>
  )
}
