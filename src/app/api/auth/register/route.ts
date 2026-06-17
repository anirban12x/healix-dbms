import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { hashPassword, generateToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { full_name, email, password, phone, gender, address, dob } = await req.json()
    const exists = await prisma.customer.findFirst({ where: { email } })
    if (exists) return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    const password_hash = await hashPassword(password)
    const customer = await prisma.customer.create({
      data: { full_name, email, password_hash, phone, gender, address, dob: dob ? new Date(dob) : null, membership_tier: 'Standard', reward_points: 0 }
    })
    const token = generateToken({ id: customer.customer_id, email: customer.email, role: 'customer', name: customer.full_name })
    const res = NextResponse.json({ user: { id: customer.customer_id, name: customer.full_name, email, role: 'customer' } })
    res.cookies.set('healix-token', token, { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60, path: '/' })
    return res
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
