// app/api/update-profile/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    // JWT'den kullanıcıyı al
    const token = (await cookies()).get('token')?.value
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    let userData
    try {
      userData = jwt.verify(token, process.env.JWT_SECRET!)
    } catch {
      return NextResponse.json({ message: 'Invalid token' }, { status: 403 })
    }

    // Request body'sinden verileri al
    const data = await req.json()
    const { name, bio } = data

    // Kullanıcıyı bul ve güncelle
    const updatedUser = await prisma.user.update({
      where: { email: (userData as any).email },
      data: {
        ...(name && { name }),
        ...(bio !== undefined && { bio })
      },
      select: {
        id: true,
        name: true,
        bio: true
      }
    })

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser
    })
  } catch (error) {
    console.error('UPDATE PROFILE ERROR:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}