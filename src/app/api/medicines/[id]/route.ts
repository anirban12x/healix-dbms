import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const medicine = await prisma.medicine.findUnique({ where: { medicine_id: parseInt(id) }, include: { category: true, inventory: true, supplier_medicines: { include: { supplier: true } } } })
  if (!medicine) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ medicine, query: `SELECT * FROM medicine WHERE medicine_id = ${id}` })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await req.json()
  const medicine = await prisma.medicine.update({ where: { medicine_id: parseInt(id) }, data: { ...data, price: data.price ? parseFloat(data.price) : undefined, category_id: data.category_id ? parseInt(data.category_id) : undefined } })
  return NextResponse.json({ medicine, query: `UPDATE medicine SET ... WHERE medicine_id = ${id}` })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.inventory.deleteMany({ where: { medicine_id: parseInt(id) } })
  await prisma.medicine.delete({ where: { medicine_id: parseInt(id) } })
  return NextResponse.json({ success: true, query: `DELETE FROM medicine WHERE medicine_id = ${id}` })
}
