'use client'

import { useState } from 'react'
import styles from '../styles/profile.module.css'

type ProfileEditProps = {
  currentName: string;
  currentBio: string | null;
}

export default function ProfileEdit({ currentName, currentBio }: ProfileEditProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(currentName || '')
  const [bio, setBio] = useState(currentBio || '')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const res = await fetch('/api/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, bio }),
      })

      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update profile')
      }

      setMessage('Profile updated successfully!')
      setIsEditing(false)
      
      // Profil güncellendiğinde sayfayı yenile
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (err: any) {
      setMessage(`Error: ${err.message}`)
      console.error('Update error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!isEditing) {
    return (
      <div className={styles.editButtonContainer}>
        <button
          onClick={() => setIsEditing(true)}
          className={styles.editButton}
        >
          ✏️ Edit Profile
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={styles.editForm}>
      <h3 className={styles.editTitle}>Edit Profile</h3>
      
      <div className={styles.inputGroup}>
        <label htmlFor="name">Name:</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className={styles.input}
          placeholder="Your name"
        />
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor="bio">Bio:</label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className={styles.textarea}
          placeholder="Tell us about yourself"
          rows={3}
        />
      </div>

      <div className={styles.editFormActions}>
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          className={styles.cancelButton}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={styles.saveButton}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {message && (
        <p className={message.includes('Error') ? styles.error : styles.success}>
          {message}
        </p>
      )}
    </form>
  )
}