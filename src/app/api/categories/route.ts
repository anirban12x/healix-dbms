import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { category_name: 'asc' } })
  return NextResponse.json({ categories, query: 'SELECT * FROM category ORDER BY category_name ASC' })
}
