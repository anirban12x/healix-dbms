import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const where: Record<string, unknown> = {}
  if (session.role === 'customer') where.customer_id = session.id
  const rewards = await prisma.rewardTransaction.findMany({ where, include: { customer: { select: { full_name: true, reward_points: true } } }, orderBy: { transaction_date: 'desc' } })
  const customer = session.role === 'customer' ? await prisma.customer.findUnique({ where: { customer_id: session.id }, select: { reward_points: true, membership_tier: true } }) : null
  return NextResponse.json({ rewards, customer, query: `SELECT * FROM reward_transaction ${session.role === 'customer' ? `WHERE customer_id = ${session.id}` : ''} ORDER BY transaction_date DESC` })
}
