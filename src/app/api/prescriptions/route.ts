import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  const where: Record<string, unknown> = {}
  if (session?.role === 'customer') where.customer_id = session.id
  const prescriptions = await prisma.prescription.findMany({ where, include: { customer: { select: { full_name: true, email: true } } }, orderBy: { prescription_id: 'desc' } })
  return NextResponse.json({ prescriptions, query: 'SELECT p.*, c.full_name FROM prescription p JOIN customer c ON p.customer_id = c.customer_id ORDER BY p.prescription_id DESC' })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const data = await req.json()
  const prescription = await prisma.prescription.create({
    data: { customer_id: session.role === 'customer' ? session.id : data.customer_id, doctor_name: data.doctor_name, doctor_registration_number: data.doctor_registration_number, issue_date: data.issue_date ? new Date(data.issue_date) : new Date(), file_url: data.file_url || null, verification_status: 'Pending' }
  })
  return NextResponse.json({ prescription })
}

export async function PUT(req: NextRequest) {
  const { prescription_id, verification_status } = await req.json()
  const prescription = await prisma.prescription.update({ where: { prescription_id }, data: { verification_status } })
  await prisma.auditLog.create({ data: { action_type: 'VERIFY', table_name: 'prescription', performed_by: 'admin', description: `Prescription ${prescription_id} status: ${verification_status}` } })
  return NextResponse.json({ prescription, query: `SELECT sp_verify_prescription(${prescription_id}, '${verification_status}')` })
}
