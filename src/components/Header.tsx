'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/lib/contexts/CartContext'
import styles from './Header.module.css'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { getTotalItems } = useCart()
  const itemCount = getTotalItems()

  return (
    <>
      <header className={`${styles.header} sticky top-0 z-10`}>
        <div className={`container ${styles.headerContent}`}>
          <Link href="/" className={styles.logo}>
            Kjerstis Bakeverden
          </Link>

          {/* Desktop Navigation */}
          <nav className={styles.navDesktop}>
            <Link href="/" className={styles.navLink}>
              Hjem
            </Link>
            <Link href="/cart" className={`${styles.navLink} relative`}>
              🛒 Handlekurv
              {itemCount > 0 && (
                <span className={`${styles.cartBadge} ${styles.cartBadgeDesktop}`}>
                  {itemCount}
                </span>
              )}
            </Link>
            <Link href="/admin" className={`${styles.navLink} ${styles.navLinkAdmin}`}>
              Admin
            </Link>
          </nav>

          {/* Mobile: Hamburger with badge */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`${styles.hamburger} relative`}
            aria-label="Toggle menu"
          >
            {itemCount > 0 && (
              <span className={`${styles.cartBadge} ${styles.cartBadgeMobileHamburger}`}>
                {itemCount}
              </span>
            )}
            <span className={`${styles.hamburgerLine} ${isMenuOpen ? 'open' : ''}`} />
            <span className={`${styles.hamburgerLine} ${isMenuOpen ? 'open' : ''}`} />
            <span className={`${styles.hamburgerLine} ${isMenuOpen ? 'open' : ''}`} />
          </button>
        </div>
      </header>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <>
          <div
            className={styles.overlay}
            onClick={() => setIsMenuOpen(false)}
          />
          <nav className={`${styles.navMobile} ${isMenuOpen ? 'open' : ''}`}>
            <Link
              href="/"
              className={styles.mobileLink}
              onClick={() => setIsMenuOpen(false)}
            >
              🏠 Hjem
            </Link>
            <Link
              href="/cart"
              className={styles.mobileLink}
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="flex items-center">
                🛒 Handlekurv
                {itemCount > 0 && (
                  <span className={`${styles.cartBadge} ${styles.cartBadgeMobileMenu}`}>
                    {itemCount}
                  </span>
                )}
              </span>
            </Link>
            <div className={styles.mobileDivider} />
            <Link
              href="/admin"
              className={`${styles.mobileLink} ${styles.mobileLinkAdmin}`}
              onClick={() => setIsMenuOpen(false)}
            >
              ⚙️ Admin
            </Link>
          </nav>
        </>
      )}
    </>
  )
}
