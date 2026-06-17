import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  const suppliers = await prisma.supplier.findMany({ include: { supplier_medicines: { include: { medicine: true } } }, orderBy: { supplier_name: 'asc' } })
  return NextResponse.json({ suppliers, query: 'SELECT s.*, COUNT(sm.medicine_id) as medicine_count FROM supplier s LEFT JOIN supplier_medicine sm ON s.supplier_id = sm.supplier_id GROUP BY s.supplier_id ORDER BY s.supplier_name' })
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  const supplier = await prisma.supplier.create({ data: { supplier_name: data.supplier_name, email: data.email, phone: data.phone, address: data.address } })
  return NextResponse.json({ supplier, query: `INSERT INTO supplier (supplier_name, email, phone, address) VALUES ('${data.supplier_name}', '${data.email}', '${data.phone}', '${data.address}')` })
}

export async function PUT(req: NextRequest) {
  const data = await req.json()
  const supplier = await prisma.supplier.update({ where: { supplier_id: data.supplier_id }, data: { supplier_name: data.supplier_name, email: data.email, phone: data.phone, address: data.address } })
  return NextResponse.json({ supplier })
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  await prisma.supplierMedicine.deleteMany({ where: { supplier_id: parseInt(id) } })
  await prisma.supplier.delete({ where: { supplier_id: parseInt(id) } })
  return NextResponse.json({ success: true, query: `DELETE FROM supplier WHERE supplier_id = ${id}` })
}
