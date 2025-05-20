// app/profile/[id]/page.tsx
import { PrismaClient } from '@prisma/client'
import { notFound } from 'next/navigation'
import styles from '../../styles/profile.module.css'
import Link from 'next/link'

const prisma = new PrismaClient()

export default async function PublicProfile({ params }: { params: { id: string } }) {
  const awaitedParams = await params;
  const user = await prisma.user.findUnique({
    where: { id: Number(awaitedParams.id) },
    include: {
      receivedRatings: true,
    },
  })

  if (!user) return notFound()

  const total = user.receivedRatings.reduce((sum, r) => sum + r.value, 0)
  const avg = user.receivedRatings.length ? (total / user.receivedRatings.length).toFixed(1) : '0.0'

  return (
    <div className={styles.profileWrapper}>
      <h1 className={styles.title}>{user.name}'s Profile</h1>

      <div className={styles.infoBox}>
        <p className={styles.info}><span>Email:</span> {user.email}</p>
        <p className={styles.info}><span>About:</span> {user.bio || "This user hasn&apos;t added an about section yet."}</p>
        <p className={styles.info}><span>CV:</span> {user.cvUrl ? <Link href={user.cvUrl} target="_blank">View CV</Link> : 'No CV uploaded.'}</p>
        <p className={styles.info}><span>Average Rating:</span> {avg} / 5</p>
        <p className={styles.info}><span>Received Votes:</span> {user.receivedRatings.length}</p>
      </div>
    </div>
  )
}
