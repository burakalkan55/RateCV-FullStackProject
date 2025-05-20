'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import styles from '../styles/publiccvs.module.css'

export default function Searchbar({ placeholder }: { placeholder: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(searchParams.get('q') || '')
  useEffect(() => {
    const timeout = setTimeout(() => {
      const encoded = encodeURIComponent(value)
      router.push(value ? `/CV?q=${encoded}` : `/CV`)
    }, 500)

    return () => clearTimeout(timeout)
  }, [value, router])

  return (
    <div className={styles.searchbarWrapper}>
      <input
        type="text"
        className={styles.searchInput}
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  )
}