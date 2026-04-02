'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/lib/contexts/CartContext'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { getTotalItems } = useCart()
  const itemCount = getTotalItems()

  return (
    <>
      <header className="header sticky top-0 z-10">
        <div className="container header-content">
          <Link href="/" className="header-logo">
            Bakeverden
          </Link>

          {/* Desktop Navigation */}
          <nav className="header-nav-desktop">
            <Link href="/" className="header-link">
              Hjem
            </Link>
            <Link href="/cart" className="header-link relative">
              🛒 Handlekurv
              {itemCount > 0 && (
                <span className="cart-notification-badge cart-badge-desktop">
                  {itemCount}
                </span>
              )}
            </Link>
            <Link href="/admin" className="header-link header-link-admin">
              Admin
            </Link>
          </nav>

          {/* Mobile: Hamburger with badge */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="header-hamburger md:hidden relative"
            aria-label="Toggle menu"
          >
            {itemCount > 0 && (
              <span className="cart-notification-badge cart-badge-mobile-hamburger">
                {itemCount}
              </span>
            )}
            <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
            <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
            <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
          </button>
        </div>
      </header>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <>
          <div 
            className="header-overlay"
            onClick={() => setIsMenuOpen(false)}
          />
          <nav className={`header-nav-mobile ${isMenuOpen ? 'open' : ''}`}>
            <Link 
              href="/" 
              className="header-mobile-link"
              onClick={() => setIsMenuOpen(false)}
            >
              🏠 Hjem
            </Link>
            <Link 
              href="/cart" 
              className="header-mobile-link"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="flex items-center">
                🛒 Handlekurv
                {itemCount > 0 && (
                  <span className="cart-notification-badge cart-badge-mobile-menu">
                    {itemCount}
                  </span>
                )}
              </span>
            </Link>
            <div className="header-mobile-divider" />
            <Link 
              href="/admin" 
              className="header-mobile-link header-mobile-admin"
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