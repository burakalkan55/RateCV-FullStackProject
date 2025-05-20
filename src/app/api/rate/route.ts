// app/api/rate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    // JWT'den kullanıcıyı al
    const token = (await cookies()).get('token')?.value
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    let userData
    try {
      userData = jwt.verify(token, process.env.JWT_SECRET!) as { id: number }
    } catch {
      return NextResponse.json({ message: 'Invalid token' }, { status: 403 })
    }

    // Request body'sinden verileri al
    const { targetUserId, value } = await req.json()

    if (!targetUserId || !value || value < 1 || value > 5) {
      return NextResponse.json({ message: 'Invalid rating data' }, { status: 400 })
    }

    // Kullanıcı kendisine oy vermeye çalışıyorsa engelle
    if (userData.id === Number(targetUserId)) {
      return NextResponse.json({ message: 'You cannot rate your own CV' }, { status: 400 })
    }

    let updatedRatingEntity;

    // Kullanıcının önceden verdiği oyu kontrol et
    const existingRating = await prisma.rating.findFirst({
      where: {
        voterId: userData.id,
        userId: Number(targetUserId)
      }
    })

    if (existingRating) {
      // Varolan oyu güncelle
      const updatedRating = await prisma.rating.update({
        where: { id: existingRating.id },
        data: { value }
      })
      updatedRatingEntity = updatedRating;
      
    } else {
      // Yeni oy ekle
      const newRating = await prisma.rating.create({
        data: {
          value,
          userId: Number(targetUserId),
          voterId: userData.id
        }
      })
      updatedRatingEntity = newRating;
    }

    // Calculate and update average rating
    const ratings = await prisma.rating.findMany({
      where: { userId: Number(targetUserId) }
    });

    const totalRating = ratings.reduce((acc, rating) => acc + rating.value, 0);
    const avgRating = ratings.length > 0 ? totalRating / ratings.length : 0;

    await prisma.user.update({
      where: { id: Number(targetUserId) },
      data: { avgRating: avgRating } // Ensure correct field name and value assignment
    });

    if (updatedRatingEntity) {
      return NextResponse.json({ 
        message: existingRating ? 'Rating updated successfully' : 'Rating submitted successfully', 
        rating: updatedRatingEntity,
        avgRating: avgRating 
      });
    } else {
      // This case should ideally not be reached if logic is correct
      return NextResponse.json({ message: 'Error processing rating' }, { status: 500 });
    }

  } catch (error) {
    console.error('RATING ERROR:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}