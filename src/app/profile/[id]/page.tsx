'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import RateButton from '../../components/rateButton' // Adjusted path
import styles from '../../styles/profilepage.module.css' // Assuming you have or will create this CSS module

interface UserProfile {
  id: number
  name: string
  email: string
  bio?: string
  cvUrl?: string
  avgRating?: number
}

function ProfilePage() {
  const params = useParams()
  const { id } = params
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUserVoted, setCurrentUserVoted] = useState(false);


  useEffect(() => {
    if (id) {
      const fetchUserProfile = async () => {
        setLoading(true)
        setError(null)
        try {
          const res = await fetch(`/api/profile/${id}`)
          if (!res.ok) {
            const errorData = await res.json()
            throw new Error(errorData.message || 'Failed to fetch profile')
          }
          const data = await res.json()
          setUser(data)
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred')
        } finally {
          setLoading(false)
        }
      }
      fetchUserProfile()
    }
  }, [id])

  if (loading) {
    return <div className={styles.container}><p className={styles.loading}>Loading profile...</p></div>
  }

  if (error) {
    return <div className={styles.container}><p className={styles.error}>Error: {error}</p></div>
  }

  if (!user) {
    return <div className={styles.container}><p>User not found.</p></div>
  }

  return (
    <div className={styles.container}>
      <div className={styles.profileHeader}>
        <h1 className={styles.name}>{user.name}</h1>
        <p className={styles.email}>{user.email}</p>
      </div>

      {user.bio && (
        <div className={styles.bioSection}>
          <h2>Bio</h2>
          <p>{user.bio}</p>
        </div>
      )}

      <div className={styles.cvSection}>
        <h2>CV</h2>
        {user.cvUrl ? (
          <>
            <iframe
              src={user.cvUrl}
              width="100%"
              height="500px"
              className={styles.cvViewer}
              title={`${user.name}'s CV`}
            />
            <a href={user.cvUrl} target="_blank" rel="noopener noreferrer" className={styles.downloadLink}>
              Download CV
            </a>
          </>
        ) : (
          <p>No CV uploaded.</p>
        )}
      </div>

      <div className={styles.ratingSection}>
        <h2>Rating</h2>
        <p className={styles.avgRating}>
          Average Rating: {user.avgRating ? user.avgRating.toFixed(1) : 'Not rated yet'} / 5
        </p>
        <RateButton targetUserId={user.id} />
      </div>
    </div>
  )
}

export default ProfilePage