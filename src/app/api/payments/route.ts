import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  const payments = await prisma.payment.findMany({ include: { order: { include: { customer: { select: { full_name: true, email: true } } } } }, orderBy: { payment_date: 'desc' } })
  return NextResponse.json({ payments, query: 'SELECT p.*, o.total_amount, c.full_name FROM payment p JOIN orders o ON p.order_id = o.order_id JOIN customer c ON o.customer_id = c.customer_id ORDER BY p.payment_date DESC' })
}

export async function POST(req: NextRequest) {
  const { order_id, payment_mode } = await req.json()
  const order = await prisma.order.findUnique({ where: { order_id } })
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  const payment = await prisma.payment.upsert({
    where: { order_id },
    create: { order_id, payment_mode: payment_mode || 'Online', payment_amount: order.total_amount, payment_status: 'Successful' },
    update: { payment_status: 'Successful', payment_mode: payment_mode || 'Online', payment_date: new Date() }
  })

  await prisma.order.update({ where: { order_id }, data: { order_status: 'Confirmed' } })

  // Create delivery record
  const customer = await prisma.customer.findUnique({ where: { customer_id: order.customer_id } })
  await prisma.delivery.upsert({
    where: { order_id },
    create: { order_id, delivery_address: customer?.address || 'N/A', delivery_fee: 49, delivery_status: 'Processing' },
    update: {}
  })

  // Add reward points
  const points = Math.floor(Number(order.total_amount) / 10)
  await prisma.customer.update({ where: { customer_id: order.customer_id }, data: { reward_points: { increment: points } } })
  await prisma.rewardTransaction.create({ data: { customer_id: order.customer_id, points_earned: points, points_used: 0 } })

  return NextResponse.json({ payment, query: `SELECT sp_process_payment(${order_id}, '${payment_mode || 'Online'}', 'Successful')` })
}

export async function PUT(req: NextRequest) {
  const { payment_id, payment_status } = await req.json()
  const payment = await prisma.payment.update({ where: { payment_id }, data: { payment_status } })
  return NextResponse.json({ payment })
}
