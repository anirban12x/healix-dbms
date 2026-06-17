import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''
  const sort = searchParams.get('sort') || 'medicine_name'
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')

  const where: Record<string, unknown> = {}
  if (search) where.medicine_name = { contains: search, mode: 'insensitive' }
  if (category) where.category_id = parseInt(category)

  const orderBy: Record<string, string> = {}
  if (sort === 'price_asc') orderBy.price = 'asc'
  else if (sort === 'price_desc') orderBy.price = 'desc'
  else orderBy.medicine_name = 'asc'

  const [medicines, total] = await Promise.all([
    prisma.medicine.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit, include: { category: true, inventory: true } }),
    prisma.medicine.count({ where })
  ])

  return NextResponse.json({
    medicines, total, page, pages: Math.ceil(total / limit),
    query: `SELECT m.*, c.category_name, i.stock_quantity FROM medicine m LEFT JOIN category c ON m.category_id = c.category_id LEFT JOIN inventory i ON m.medicine_id = i.medicine_id ${search ? `WHERE m.medicine_name ILIKE '%${search}%'` : ''} ORDER BY ${sort === 'price_asc' ? 'm.price ASC' : sort === 'price_desc' ? 'm.price DESC' : 'm.medicine_name ASC'} LIMIT ${limit} OFFSET ${(page - 1) * limit}`
  })
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  const medicine = await prisma.medicine.create({
    data: { ...data, price: parseFloat(data.price), category_id: data.category_id ? parseInt(data.category_id) : null, manufacturing_date: data.manufacturing_date ? new Date(data.manufacturing_date) : null, expiry_date: data.expiry_date ? new Date(data.expiry_date) : null }
  })
  if (data.stock_quantity !== undefined) {
    await prisma.inventory.create({ data: { medicine_id: medicine.medicine_id, stock_quantity: parseInt(data.stock_quantity), reorder_level: parseInt(data.reorder_level || '10') } })
  }
  return NextResponse.json({ medicine, query: `INSERT INTO medicine (medicine_name, price, ...) VALUES ('${data.medicine_name}', ${data.price}, ...)` })
}
