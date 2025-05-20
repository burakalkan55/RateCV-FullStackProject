// src/app/api/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Eksik alanlar var' }, { status: 400 })
    }

    // Kullanıcı var mı?
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ message: 'Bu email zaten kullanılıyor' }, { status: 400 })
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10)

    // Yeni kullanıcı oluştur
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    })

    return NextResponse.json({ message: 'Kayıt başarılı', user: newUser }, { status: 201 })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ message: 'Sunucu hatası' }, { status: 500 })
  }
}
