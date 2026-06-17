import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  const customers = await prisma.customer.findMany({ orderBy: { created_at: 'desc' }, select: { customer_id: true, full_name: true, email: true, phone: true, gender: true, membership_tier: true, reward_points: true, created_at: true, address: true, dob: true } })
  return NextResponse.json({ customers, total: customers.length, query: 'SELECT customer_id, full_name, email, phone, membership_tier, reward_points FROM customer ORDER BY created_at DESC' })
}

export async function PUT(req: NextRequest) {
  const data = await req.json()
  const customer = await prisma.customer.update({ where: { customer_id: data.customer_id }, data: { full_name: data.full_name, phone: data.phone, address: data.address, membership_tier: data.membership_tier, reward_points: data.reward_points } })
  return NextResponse.json({ customer })
}
