'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import styles from '../styles/navbar.module.css'
import { FiMenu, FiX } from 'react-icons/fi'

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    // Token kontrolü için sunucuya istek gönder
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/profile', { method: 'GET' })
        setIsLoggedIn(res.ok)
      } catch (error) {
        setIsLoggedIn(false)
      }
    }
    checkAuth()

    // authChanged event listener
    const handleAuthChanged = () => checkAuth()
    window.addEventListener('authChanged', handleAuthChanged)
    return () => window.removeEventListener('authChanged', handleAuthChanged)
  }, [])

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' })
    window.dispatchEvent(new Event('authChanged'))
    window.location.href = '/login'
  }

  return (
    <header className={styles.navbar}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <span>RateMyCV</span>
        </Link>

        <nav className={`${styles.nav} ${menuOpen ? styles.show : ''}`}>
          {isLoggedIn ? (
            <>
              <Link href="/profile" className={styles.link}>Profile</Link>
              <Link href="/CV" className={styles.link}>Rate CV</Link>
              <button onClick={handleLogout} className={styles.button}>Logout</button>
            </>
          ) : (
            <>
              <Link href="/register" className={styles.link}>Sign Up</Link>
              <Link href="/login" className={styles.link}>Log In</Link>
            </>
          )}
        </nav>

        <button className={styles.burger} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>
    </header>
  )
}
