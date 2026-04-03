import styles from './Card.module.css'

/* -------- Root -------- */

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Renders with reduced opacity and disables hover lift — use for sold-out items */
  muted?: boolean
  as?: 'div' | 'a' | 'article'
  href?: string
}

function CardRoot({ muted, as: Tag = 'div', href, className, children, ...props }: CardProps) {
  const classes = [styles.card, muted ? styles.muted : '', className ?? '']
    .filter(Boolean)
    .join(' ')

  if (Tag === 'a') {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    )
  }

  return (
    <Tag className={classes} {...props}>
      {children}
    </Tag>
  )
}

/* -------- Sub-components -------- */

function CardImage({ className, alt = '', ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      className={[styles.image, className ?? ''].filter(Boolean).join(' ')}
      alt={alt}
      {...props}
    />
  )
}

function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={[styles.content, className ?? ''].filter(Boolean).join(' ')} {...props}>
      {children}
    </div>
  )
}

function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={[styles.title, className ?? ''].filter(Boolean).join(' ')} {...props}>
      {children}
    </h2>
  )
}

function CardDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={[styles.description, className ?? ''].filter(Boolean).join(' ')} {...props}>
      {children}
    </p>
  )
}

function CardPrice({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={[styles.price, className ?? ''].filter(Boolean).join(' ')} {...props}>
      {children}
    </p>
  )
}

function CardMeta({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={[styles.meta, className ?? ''].filter(Boolean).join(' ')} {...props}>
      {children}
    </div>
  )
}

/* -------- Compound export -------- */

export const Card = Object.assign(CardRoot, {
  Image: CardImage,
  Content: CardContent,
  Title: CardTitle,
  Description: CardDescription,
  Price: CardPrice,
  Meta: CardMeta,
})
