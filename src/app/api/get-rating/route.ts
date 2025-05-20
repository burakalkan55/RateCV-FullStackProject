// app/api/get-rating/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    const token = (await cookies()).get('token')?.value
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    let userData: jwt.JwtPayload | string
    try {
      userData = jwt.verify(token, process.env.JWT_SECRET!)
    } catch {
      return NextResponse.json({ message: 'Invalid token' }, { status: 403 })
    }

    const targetUserId = req.nextUrl.searchParams.get('targetUserId')
    if (!targetUserId) {
      return NextResponse.json({ message: 'Missing targetUserId parameter' }, { status: 400 })
    }    // Kullanıcının önceden verdiği oyu bul
    const rating = await prisma.rating.findFirst({
      where: {
        voterId: Number((userData as jwt.JwtPayload).id),
        userId: Number(targetUserId)
      }
    })

    return NextResponse.json({ rating })
  } catch (error) {
    console.error('GET RATING ERROR:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}