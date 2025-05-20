'use client'

import Link from 'next/link'
import styles from './styles/homepage.module.css'

import Image from 'next/image'

export default function Home() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Rate My CV</h1>
        <p className={styles.subtitle}>
          Show your skills to the world. Upload your CV, get rated, stand out.
          The easiest way to boost your professional visibility!
        </p>

        <div className={styles.actions}>
          <Link href="/register" className={styles.primaryButton}>Sign Up</Link>
          <Link href="/login" className={styles.secondaryButton}>Log In</Link>
        </div>

        {/* User Count */}
        <p className={styles.stats}>📈 2535+ people have already shared their skills</p>

        {/* Demo GIF or Video */}
       

        {/* Feedback Box */}
        <div className={styles.feedback}>
          “The turning point in my career started with this site. I uploaded my CV, and as the votes came in, so did the job offers.”
          <br />— <strong>Burak Alkan, Full-Stack Developer</strong>
        </div>
      </div>
    </div>
  )
}