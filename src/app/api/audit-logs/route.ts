import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  const logs = await prisma.auditLog.findMany({ orderBy: { action_time: 'desc' }, take: 200 })
  return NextResponse.json({ logs, query: 'SELECT * FROM audit_log ORDER BY action_time DESC LIMIT 200' })
}
