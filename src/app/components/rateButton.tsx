'use client'

import { useState, useEffect } from 'react'
import { Star } from 'lucide-react'
import styles from '../styles/publiccvs.module.css'

export default function RateButton({ targetUserId }: { targetUserId: number; currentAvg: number }) {
  const [selected, setSelected] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [userId, setUserId] = useState<number | null>(null)
  const [isRated, setIsRated] = useState(false)
  const [userRating, setUserRating] = useState(0)
  
  // Kullanıcının kendi ID'sini ve önceki oyunu kontrol et
  useEffect(() => {
    const checkUserAndRating = async () => {
      try {
        // Kullanıcı kontrolü
        const profileRes = await fetch('/api/profile', { method: 'GET' })
        if (profileRes.ok) {
          const profileData = await profileRes.json()
          setUserId(profileData.id)
          
          // Eğer kendi profiline bakıyorsa, oy verme engelle
          if (profileData.id === targetUserId) {
            setError("You cannot rate your own CV")
          }

          // Kullanıcının önceden verdiği oyu kontrol et
          const ratingRes = await fetch(`/api/get-rating?targetUserId=${targetUserId}`)
          if (ratingRes.ok) {
            const ratingData = await ratingRes.json()
            if (ratingData.rating) {
              setUserRating(ratingData.rating.value)
              setSelected(ratingData.rating.value)
              setIsRated(true)
              setSubmitted(true)
            }
          }
        }
      } catch (err) {
        console.error("Error checking user rating:", err)
      }
    }

    checkUserAndRating()
  }, [targetUserId])

  const handleRate = async (value: number) => {
    // Kullanıcı kendisine oy vermeye çalışıyorsa engelle
    if (userId === targetUserId) {
      setError("You cannot rate your own CV")
      return
    }
    
    try {
      const res = await fetch('/api/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId, value }),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      
      setSubmitted(true)
      setSelected(value)
      setIsRated(true)
      setUserRating(value)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }
  
  return (
    <div>
      {isRated || submitted ? (
        <div>
          <div className={styles.stars}>
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                className={i < userRating ? styles.locked : styles.empty}
                style={{ cursor: 'default' }}
              />
            ))}
          </div>
          <p style={{ color: '#2563eb', fontWeight: 500, fontSize: '0.9rem', marginTop: '5px' }}>
            Your rating: {userRating}/5
          </p>
        </div>
      ) : (
        <div className={styles.stars}>
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              onClick={() => userId === targetUserId ? setError("You cannot rate your own CV") : handleRate(i + 1)}
              onMouseEnter={() => userId !== targetUserId && setSelected(i + 1)}
              onMouseLeave={() => userId !== targetUserId && setSelected(0)}
              className={i < selected ? styles.filled : styles.empty}
              style={{ 
                cursor: userId === targetUserId ? 'not-allowed' : 'pointer',
                transition: 'transform 0.2s, color 0.2s' 
              }}
            />
          ))}
        </div>
      )}
      {error && <p style={{ color: 'red', fontSize: '0.9rem', marginTop: '5px' }}>{error}</p>}
    </div>
  )
}
