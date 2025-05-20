// app/CV/page.tsx

import Link from 'next/link'
import { PrismaClient } from '@prisma/client'
import styles from '../styles/publiccvs.module.css'

const prisma = new PrismaClient()

export default async function PublicCVsPage() {
  // Fetch users with CVs and avgRating
  const users = await prisma.user.findMany({
    where: { cvUrl: { not: null } },
    orderBy: { id: 'desc' },
    select: {
      id: true,
      name: true,
      cvUrl: true,
    },
  })

  return (
    <div className={styles.pageWrapper}>
      <h1 className={styles.pageTitle}>Public CVs</h1>
      <div className={styles.cvList}>
        {users.length === 0 ? (
          <p>No CVs have been uploaded yet.</p>
        ) : (
          users.map(user => (
            <div key={user.id} className={styles.card}>
              <Link href={`/profile/${user.id}`} className={styles.nameLink}>
                <h2>{user.name}</h2>
              </Link>
              <a
                href={user.cvUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.viewLink}
              >
                View CV
              </a>
             
            </div>
          ))
        )}
      </div>
    </div>
  )
}
