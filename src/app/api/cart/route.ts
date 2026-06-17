import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'customer') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  let cart = await prisma.cart.findFirst({ where: { customer_id: session.id }, include: { cart_items: { include: { medicine: { include: { inventory: true } } } } } })
  if (!cart) cart = await prisma.cart.create({ data: { customer_id: session.id }, include: { cart_items: { include: { medicine: { include: { inventory: true } } } } } })
  return NextResponse.json({ cart, query: `SELECT ci.*, m.medicine_name, m.price, i.stock_quantity FROM cart_item ci JOIN cart c ON ci.cart_id = c.cart_id JOIN medicine m ON ci.medicine_id = m.medicine_id LEFT JOIN inventory i ON m.medicine_id = i.medicine_id WHERE c.customer_id = ${session.id}` })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'customer') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { medicine_id, quantity } = await req.json()
  let cart = await prisma.cart.findFirst({ where: { customer_id: session.id } })
  if (!cart) cart = await prisma.cart.create({ data: { customer_id: session.id } })
  const existing = await prisma.cartItem.findFirst({ where: { cart_id: cart.cart_id, medicine_id } })
  if (existing) {
    await prisma.cartItem.update({ where: { cart_item_id: existing.cart_item_id }, data: { quantity: existing.quantity + (quantity || 1) } })
  } else {
    await prisma.cartItem.create({ data: { cart_id: cart.cart_id, medicine_id, quantity: quantity || 1 } })
  }
  return NextResponse.json({ success: true })
}

export async function PUT(req: NextRequest) {
  const { cart_item_id, quantity } = await req.json()
  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { cart_item_id } })
  } else {
    await prisma.cartItem.update({ where: { cart_item_id }, data: { quantity } })
  }
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const itemId = searchParams.get('item_id')
  const clearAll = searchParams.get('clear')
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (clearAll) {
    const cart = await prisma.cart.findFirst({ where: { customer_id: session.id } })
    if (cart) await prisma.cartItem.deleteMany({ where: { cart_id: cart.cart_id } })
  } else if (itemId) {
    await prisma.cartItem.delete({ where: { cart_item_id: parseInt(itemId) } })
  }
  return NextResponse.json({ success: true })
}
