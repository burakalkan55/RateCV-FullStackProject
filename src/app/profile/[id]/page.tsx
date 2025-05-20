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
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Bio:</strong> {user.bio || 'No bio yet.'}</p>
        <p><strong>CV:</strong> {user.cvUrl ? <Link href={user.cvUrl} target="_blank">View CV</Link> : 'No CV uploaded.'}</p>
        <p><strong>Average Rating:</strong> {avg} / 5</p>
        <p><strong>Received Votes:</strong> {user.receivedRatings.length}</p>
      </div>
    </div>
  )
}
