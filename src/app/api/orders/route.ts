import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await getSession()
  const { searchParams } = new URL(req.url)
  const customerId = searchParams.get('customer_id')
  const status = searchParams.get('status')

  const where: Record<string, unknown> = {}
  if (customerId) where.customer_id = parseInt(customerId)
  else if (session?.role === 'customer') where.customer_id = session.id
  if (status) where.order_status = status

  const orders = await prisma.order.findMany({ where, orderBy: { order_date: 'desc' }, include: { customer: { select: { full_name: true, email: true } }, order_items: { include: { medicine: true } }, payment: true, delivery: true } })
  return NextResponse.json({ orders, query: `SELECT o.*, c.full_name, p.payment_status, d.delivery_status FROM orders o JOIN customer c ON o.customer_id = c.customer_id LEFT JOIN payment p ON o.order_id = p.order_id LEFT JOIN delivery d ON o.order_id = d.order_id ${where.customer_id ? `WHERE o.customer_id = ${where.customer_id}` : ''} ORDER BY o.order_date DESC` })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'customer') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { items, prescription_id } = await req.json()
  
  let subtotal = 0
  const orderItems = []
  for (const item of items) {
    const med = await prisma.medicine.findUnique({ where: { medicine_id: item.medicine_id } })
    if (!med) continue
    const itemTotal = Number(med.price) * item.quantity
    subtotal += itemTotal
    orderItems.push({ medicine_id: item.medicine_id, quantity: item.quantity, unit_price: Number(med.price), item_total: itemTotal })
  }

  const customer = await prisma.customer.findUnique({ where: { customer_id: session.id } })
  const discount = customer?.membership_tier === 'Premium' ? subtotal * 0.1 : customer?.membership_tier === 'Gold' ? subtotal * 0.05 : 0
  const total = subtotal - discount

  const order = await prisma.order.create({
    data: { customer_id: session.id, prescription_id: prescription_id || null, order_status: 'Pending', subtotal, discount, total_amount: total, order_items: { create: orderItems } },
    include: { order_items: true }
  })

  return NextResponse.json({ order, query: `SELECT sp_place_order(${session.id}, ${prescription_id || 'NULL'}, '${JSON.stringify(items)}')` })
}

export async function PUT(req: NextRequest) {
  const { order_id, order_status } = await req.json()
  const order = await prisma.order.update({ where: { order_id }, data: { order_status } })
  return NextResponse.json({ order, query: `UPDATE orders SET order_status = '${order_status}' WHERE order_id = ${order_id}` })
}
