import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  const deliveries = await prisma.delivery.findMany({ include: { order: { include: { customer: { select: { full_name: true, email: true, address: true } } } } }, orderBy: { delivery_id: 'desc' } })
  return NextResponse.json({ deliveries, query: 'SELECT d.*, o.order_status, c.full_name, c.address FROM delivery d JOIN orders o ON d.order_id = o.order_id JOIN customer c ON o.customer_id = c.customer_id ORDER BY d.delivery_id DESC' })
}

export async function PUT(req: NextRequest) {
  const { delivery_id, delivery_status } = await req.json()
  const delivery = await prisma.delivery.update({ where: { delivery_id }, data: { delivery_status, delivery_date: delivery_status === 'Delivered' ? new Date() : undefined } })
  if (delivery_status === 'Delivered') {
    await prisma.order.update({ where: { order_id: delivery.order_id }, data: { order_status: 'Delivered' } })
  } else if (delivery_status === 'Shipped') {
    await prisma.order.update({ where: { order_id: delivery.order_id }, data: { order_status: 'Shipped' } })
  }
  return NextResponse.json({ delivery, query: `UPDATE delivery SET delivery_status = '${delivery_status}' WHERE delivery_id = ${delivery_id}` })
}
