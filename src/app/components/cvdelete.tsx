'use client'

import { useState } from 'react'
import styles from '../styles/profile.module.css'

export default function DeleteCVButton() {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete your CV?')) {
      return
    }
    
    setLoading(true)
    
    try {
      const res = await fetch('/api/delete-cv', {
        method: 'POST',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Failed to delete CV')
      }

      // CV silindiğinde profil sayfasını yenile
      window.dispatchEvent(new Event('profileUpdated'))
      window.location.reload()
    } catch (err) {
      console.error('Delete error:', err)
      alert(`Error: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      className={styles.deleteButton}
      title="Delete CV"
      disabled={loading}
    >
      🗑️
    </button>
  )
}