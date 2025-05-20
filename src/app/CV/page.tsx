// app/cvs/page.tsx
import { PrismaClient } from '@prisma/client'
import Link from 'next/link'
import styles from '../styles/publiccvs.module.css'
import RateButton from '../components/rateButton'
import Searchbar from '../components/searchBar'

const prisma = new PrismaClient()

export default async function CVListPage({ searchParams }: { searchParams: { q?: string } }) {
  const query = searchParams.q?.toLowerCase() || ''

  let usersWithCV = await prisma.user.findMany({
    where: {
      AND: [
        { NOT: { cvUrl: null } },
        {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ],
        },
      ],
    },
    select: {
      id: true,
      name: true,
      email: true,
      cvUrl: true,
      receivedRatings: true,
    },
  })

  usersWithCV = usersWithCV.sort((a, b) => {
    const avgA = a.receivedRatings.length
      ? a.receivedRatings.reduce((s, r) => s + r.value, 0) / a.receivedRatings.length
      : 0
    const avgB = b.receivedRatings.length
      ? b.receivedRatings.reduce((s, r) => s + r.value, 0) / b.receivedRatings.length
      : 0
    return avgB - avgA
  })

  return (
    <div className={styles.pageWrapper}>
      <h1 className={styles.pageTitle}>Explore CVs</h1>

      <Searchbar placeholder="Search by name or email..." />

      <div className={styles.cvList}>
        {usersWithCV.map((user) => {
          const total = user.receivedRatings.reduce((sum, r) => sum + r.value, 0)
          const avg = user.receivedRatings.length
            ? (total / user.receivedRatings.length).toFixed(1)
            : '0.0'

          return (
            <div key={user.id} className={styles.card}>
              <Link href={`/profile/${user.id}`} className={styles.nameLink}>
                <h2>{user.name}</h2>
              </Link>
              <p>{user.email}</p>

              <Link
                href={user.cvUrl || '#'}
                target="_blank"
                className={styles.viewLink}
              >
                View CV
              </Link>

              <div className={styles.stars}>
                <RateButton targetUserId={user.id} currentAvg={Number(avg)} />
              </div>
              <p className={styles.avgText}>{avg} / 5</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
