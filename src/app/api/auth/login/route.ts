import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { verifyPassword, generateToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  let email: string | undefined
  let password: string | undefined
  let role: string | undefined

  try {
    const body = await req.json()
    email = body.email
    password = body.password
    role = body.role

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    if (role === 'admin') {
      const admin = await prisma.admin.findFirst({ where: { email } })
      if (!admin) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
      const valid = await verifyPassword(password, admin.password_hash)
      if (!valid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
      const token = generateToken({ id: admin.admin_id, email: admin.email, role: 'admin', name: admin.name })
      const res = NextResponse.json({ user: { id: admin.admin_id, name: admin.name, email: admin.email, role: 'admin' }, token })
      res.cookies.set('healix-token', token, { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60, path: '/' })
      return res
    } else {
      const customer = await prisma.customer.findFirst({ where: { email } })
      if (!customer) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
      const valid = await verifyPassword(password, customer.password_hash)
      if (!valid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
      const token = generateToken({ id: customer.customer_id, email: customer.email, role: 'customer', name: customer.full_name })
      const res = NextResponse.json({ user: { id: customer.customer_id, name: customer.full_name, email: customer.email, role: 'customer' }, token })
      res.cookies.set('healix-token', token, { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60, path: '/' })
      return res
    }
  } catch (error: any) {
    console.error('Login error:', error)
    console.error('Login context:', { email, role, message: error?.message, stack: error?.stack })
    // Prisma error when DB is not reachable
    const isDbDown = error?.code === 'P1001' || (error?.meta && error.meta?.cause && String(error.meta.cause).includes('DatabaseNotReachable'))
    if (isDbDown) {
      // Allow demo fallback credentials when DB is down so UI/auth flows can be tested locally
      if (role === 'admin' && email === 'admin@healix.com' && password === 'admin123') {
        const token = generateToken({ id: 0, email, role: 'admin', name: 'Admin Demo' })
        const res = NextResponse.json({ user: { id: 0, name: 'Admin Demo', email, role: 'admin' }, token })
        res.cookies.set('healix-token', token, { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60, path: '/' })
        return res
      }
      if (role === 'customer' && email === 'customer@healix.com' && password === 'customer123') {
        const token = generateToken({ id: 0, email, role: 'customer', name: 'Customer Demo' })
        const res = NextResponse.json({ user: { id: 0, name: 'Customer Demo', email, role: 'customer' }, token })
        res.cookies.set('healix-token', token, { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60, path: '/' })
        return res
      }
      return NextResponse.json({ error: 'Database unreachable. Check DATABASE_URL and that the database server is running.' }, { status: 503 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
