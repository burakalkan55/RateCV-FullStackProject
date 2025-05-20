// app/api/profile/route.ts
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const token = (await cookies()).get('token')?.value
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    let userData
    try {
      userData = jwt.verify(token, process.env.JWT_SECRET!) as { id: number; email: string }
    } catch {
      return NextResponse.json({ message: 'Invalid token' }, { status: 403 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userData.id },
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
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('PROFILE ERROR:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
