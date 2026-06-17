import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  const [totalCustomers, premiumCustomers, totalMedicines, totalOrders, revenue, lowStock, expired, pendingDeliveries, ordersByStatus, monthlyRevenue, paymentStats, topMedicines, dailyRevenue, inventoryValue] = await Promise.all([
    prisma.customer.count(),
    prisma.customer.count({ where: { membership_tier: 'Premium' } }),
    prisma.medicine.count(),
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { total_amount: true } }),
    prisma.inventory.count({ where: { stock_quantity: { lt: prisma.inventory.fields.reorder_level } } }).catch(() => 0),
    prisma.medicine.count({ where: { expiry_date: { lt: new Date() } } }),
    prisma.delivery.count({ where: { delivery_status: { not: 'Delivered' } } }),
    prisma.order.groupBy({ by: ['order_status'], _count: true }),
    prisma.$queryRaw`SELECT DATE_TRUNC('month', order_date) as month, SUM(total_amount) as revenue, COUNT(*) as orders FROM orders GROUP BY DATE_TRUNC('month', order_date) ORDER BY month DESC LIMIT 12` as Promise<{month:Date;revenue:number;orders:number}[]>,
    prisma.payment.groupBy({ by: ['payment_status'], _count: true }),
    prisma.$queryRaw`SELECT m.medicine_name, SUM(oi.quantity) as total_sold, SUM(oi.item_total) as total_revenue FROM order_items oi JOIN medicine m ON oi.medicine_id = m.medicine_id GROUP BY m.medicine_name ORDER BY total_sold DESC LIMIT 10` as Promise<{medicine_name:string;total_sold:number;total_revenue:number}[]>,
    prisma.$queryRaw`SELECT order_date::date as day, SUM(total_amount) as revenue FROM orders GROUP BY order_date::date ORDER BY day DESC LIMIT 30` as Promise<{day:Date;revenue:number}[]>,
    prisma.$queryRaw`SELECT SUM(m.price * i.stock_quantity) as total_value FROM inventory i JOIN medicine m ON i.medicine_id = m.medicine_id` as Promise<{total_value:number}[]>
  ])

  // Low stock via raw query as a fallback
  let lowStockCount = 0
  try {
    const ls = await prisma.$queryRaw`SELECT COUNT(*) as cnt FROM inventory WHERE stock_quantity < reorder_level` as {cnt:bigint}[]
    lowStockCount = Number(ls[0]?.cnt || 0)
  } catch { lowStockCount = typeof lowStock === 'number' ? lowStock : 0 }

  return NextResponse.json({
    stats: {
      totalCustomers,
      premiumCustomers,
      totalMedicines,
      totalOrders,
      totalRevenue: Number(revenue._sum.total_amount || 0),
      lowStockCount,
      expiredCount: expired,
      pendingDeliveries,
      inventoryValue: Number((inventoryValue as {total_value:number}[])[0]?.total_value || 0),
    },
    charts: {
      ordersByStatus: ordersByStatus.map((o: any) => ({ status: o.order_status, count: o._count })),
      monthlyRevenue: (monthlyRevenue || []).map((m: any) => ({ month: m.month, revenue: Number(m.revenue), orders: Number(m.orders) })),
      dailyRevenue: (dailyRevenue || []).map((d: any) => ({ day: d.day, revenue: Number(d.revenue) })),
      paymentStats: paymentStats.map((p: any) => ({ status: p.payment_status, count: p._count })),
      topMedicines: (topMedicines || []).map((t: any) => ({ name: t.medicine_name, sold: Number(t.total_sold), revenue: Number(t.total_revenue) })),
    },
    queries: {
      totalCustomers: 'SELECT COUNT(*) FROM customer',
      premiumCustomers: "SELECT * FROM customer WHERE membership_tier = 'Premium'",
      lowStock: 'SELECT * FROM inventory WHERE stock_quantity < reorder_level',
      expired: 'SELECT * FROM medicine WHERE expiry_date < CURRENT_DATE',
      revenue: 'SELECT SUM(total_amount) FROM orders',
      ordersByStatus: 'SELECT order_status, COUNT(*) FROM orders GROUP BY order_status',
      topMedicines: 'SELECT m.medicine_name, SUM(oi.quantity) FROM order_items oi JOIN medicine m ON oi.medicine_id = m.medicine_id GROUP BY m.medicine_name ORDER BY SUM(oi.quantity) DESC LIMIT 10',
      monthlyRevenue: "SELECT DATE_TRUNC('month', order_date) as month, SUM(total_amount) FROM orders GROUP BY month ORDER BY month",
      dailyRevenue: 'SELECT order_date::date, SUM(total_amount) FROM orders GROUP BY order_date::date ORDER BY day DESC LIMIT 30',
      paymentSuccess: "SELECT payment_status, COUNT(*) FROM payment GROUP BY payment_status",
      pendingDeliveries: "SELECT * FROM delivery WHERE delivery_status != 'Delivered'",
      inventoryValue: 'SELECT SUM(m.price * i.stock_quantity) FROM inventory i JOIN medicine m ON i.medicine_id = m.medicine_id',
    }
  })
}
