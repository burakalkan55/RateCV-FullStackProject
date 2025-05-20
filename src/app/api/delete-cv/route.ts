// app/api/delete-cv/route.ts
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import fs from 'fs/promises'
import path from 'path'

const prisma = new PrismaClient()

export async function POST() {
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

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email: (userData as any).email },
      select: { id: true, cvUrl: true },
    })

    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 })
    if (!user.cvUrl) return NextResponse.json({ message: 'No CV to delete' }, { status: 400 })

    // Dosyayı sil
    try {
      const filePath = path.join(process.cwd(), 'public', user.cvUrl)
      await fs.unlink(filePath)
    } catch (err) {
      console.error('Failed to delete file:', err)
      // Dosya silinmese bile veritabanından kaldır
    }

    // Veritabanını güncelle
    await prisma.user.update({
      where: { id: user.id },
      data: { cvUrl: null },
    })

    return NextResponse.json({ message: 'CV deleted successfully' })
  } catch (error) {
    console.error('DELETE CV ERROR:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}