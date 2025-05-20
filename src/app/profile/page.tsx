// app/profile/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import styles from '../styles/profile.module.css'
import CVUploadForm from '../components/cvupload'
import DeleteCVButton from '../components/cvdelete'
import ProfileEdit from '../components/profileedit'

const prisma = new PrismaClient()

export default async function ProfilePage() {
  const token = (await cookies()).get('token')?.value

  if (!token) {
    return redirect('/login')
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        cvUrl: true,
        createdAt: true,
      },
    })

    if (!user) {
      return redirect('/login')
    }

    return (
      <div className={styles.profileWrapper}>
    <h1 className={styles.title}>Welcome, {user.name}!</h1>
    <div className={styles.infoBox}>
      <p><strong>Email:</strong> {user.email}</p>      <p><strong>Bio:</strong> {user.bio || 'No bio yet.'}</p>      <p><strong>CV:</strong> {user.cvUrl
        ? <>
            <a href={user.cvUrl} target="_blank">View CV</a>
            <DeleteCVButton />
          </>
        : 'No CV uploaded.'}</p>
      <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
    </div>    <CVUploadForm/>
    <ProfileEdit currentName={user.name} currentBio={user.bio} />
  </div>
    )
  } catch (error) {
    console.error('[PROFILE_PAGE]', error)
    return redirect('/login')
  }
}
