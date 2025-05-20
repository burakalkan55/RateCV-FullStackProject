'use client'

import { useState } from 'react'
import styles from '../styles/profile.module.css'

export default function CVUploadForm() {
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const [cvUrl, setCvUrl] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    setLoading(true)

    if (!file) {
      setMessage('Please select a file.')
      setLoading(false)
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload-cv', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || 'Upload failed')
      }

      setMessage('✅ CV uploaded successfully!')
      setCvUrl(data.url)
      // Event'i tetikleyerek profil sayfasını yenile
      window.dispatchEvent(new Event('profileUpdated'))
    } catch (err: any) {
      setMessage(`❌ ${err.message}`)
      console.error('Upload error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.uploadForm}>
      <h3 className={styles.uploadTitle}>Upload your CV</h3>
      <div className={styles.fileInputWrapper}>
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          required
          className={styles.fileInput}
        />
        <label className={styles.fileLabel}>
          {file ? file.name : 'Select PDF file...'}
        </label>
      </div>
      <button type="submit" className={styles.uploadButton} disabled={loading}>
        {loading ? 'Uploading...' : 'Upload CV'}
      </button>
      {message && <p className={message.includes('✅') ? styles.success : styles.error}>{message}</p>}
      {cvUrl && (
        <p className={styles.viewLink}>
          View: <a href={cvUrl} target="_blank" rel="noopener noreferrer">Your CV</a>
        </p>
      )}
    </form>
  )
}
