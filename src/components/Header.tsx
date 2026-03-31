'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  function toggleMenu() {
    setMenuOpen(!menuOpen)
  }

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <header className="header sticky top-0 z-50">
      <div className="container">
        <div className="header-content">
          {/* Logo */}
          <Link href="/" className="header-logo">
            🧁 Kjerstis Bakeverden
          </Link>

          {/* Desktop Navigation */}
          <nav className="header-nav-desktop">
            <Link href="/" className="header-link">
              Hjem
            </Link>
            <Link href="/om" className="header-link">
              Om meg
            </Link>
            <Link href="/kontakt" className="header-link">
              Kontakt
            </Link>
            <Link href="/admin" className="header-link header-link-admin">
              👨‍🍳 Admin
            </Link>
          </nav>

          {/* Hamburger Button */}
          <button
            onClick={toggleMenu}
            className="header-hamburger"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span className={`hamburger-line ${menuOpen ? 'open' : ''}`}></span>
            <span className={`hamburger-line ${menuOpen ? 'open' : ''}`}></span>
            <span className={`hamburger-line ${menuOpen ? 'open' : ''}`}></span>
          </button>
        </div>

        {/* Mobile Menu */}
        <nav className={`header-nav-mobile ${menuOpen ? 'open' : ''}`}>
          <Link href="/" className="header-mobile-link" onClick={closeMenu}>
            🏠 Hjem
          </Link>
          <Link href="/om" className="header-mobile-link" onClick={closeMenu}>
            👋 Om meg
          </Link>
          <Link href="/kontakt" className="header-mobile-link" onClick={closeMenu}>
            📧 Kontakt
          </Link>
          <div className="header-mobile-divider"></div>
          <Link href="/admin" className="header-mobile-link header-mobile-admin" onClick={closeMenu}>
            👨‍🍳 Admin
          </Link>
          <Link href="/admin/batches" className="header-mobile-link" onClick={closeMenu}>
            🎂 Administrer kaker
          </Link>
        </nav>

        {/* Overlay */}
        {menuOpen && (
          <div className="header-overlay" onClick={closeMenu}></div>
        )}
      </div>
    </header>
  )
}