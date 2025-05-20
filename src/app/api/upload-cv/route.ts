// app/api/upload-cv/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { existsSync } from 'fs'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file || file.type !== 'application/pdf') {
      return NextResponse.json({ message: 'Only PDF files allowed' }, { status: 400 })
    }

    // JWT'den kullanıcıyı al
    const token = (await cookies()).get('token')?.value
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    let userData
    try {
      userData = jwt.verify(token, process.env.JWT_SECRET!)
    } catch {
      return NextResponse.json({ message: 'Invalid token' }, { status: 403 })
    }

    // Dosyayı işle
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Uploads klasörünü oluştur (yoksa)
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    
    // Klasörün var olup olmadığını kontrol et
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
      console.log(`Created directory: ${uploadDir}`)
    }

    // Dosya adını oluştur ve çakışmaları önle
    const timestamp = Date.now()
    const safeFileName = file.name.replace(/\s/g, '_')
    const fileName = `${timestamp}-${safeFileName}`
    
    const filePath = path.join(uploadDir, fileName)
    await writeFile(filePath, buffer)

    const fileUrl = `/uploads/${fileName}`

    // Veritabanını güncelle
    await prisma.user.update({
      where: { email: (userData as any).email },
      data: { cvUrl: fileUrl },
    })

    return NextResponse.json({ message: 'CV uploaded successfully', url: fileUrl })
  } catch (error) {
    console.error('UPLOAD ERROR:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
