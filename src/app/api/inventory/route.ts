import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  const inventory = await prisma.inventory.findMany({ include: { medicine: { include: { category: true } } }, orderBy: { stock_quantity: 'asc' } })
  return NextResponse.json({ inventory, query: 'SELECT i.*, m.medicine_name, m.price, c.category_name FROM inventory i JOIN medicine m ON i.medicine_id = m.medicine_id LEFT JOIN category c ON m.category_id = c.category_id ORDER BY i.stock_quantity ASC' })
}

export async function PUT(req: NextRequest) {
  const { inventory_id, stock_quantity, reorder_level } = await req.json()
  const inv = await prisma.inventory.update({ where: { inventory_id }, data: { stock_quantity: parseInt(stock_quantity), reorder_level: reorder_level ? parseInt(reorder_level) : undefined, last_updated: new Date() } })
  await prisma.auditLog.create({ data: { action_type: 'INVENTORY_UPDATE', table_name: 'inventory', performed_by: 'admin', description: `Inventory ${inventory_id} updated: stock=${stock_quantity}` } })
  return NextResponse.json({ inventory: inv, query: `UPDATE inventory SET stock_quantity = ${stock_quantity}, last_updated = NOW() WHERE inventory_id = ${inventory_id}` })
}
