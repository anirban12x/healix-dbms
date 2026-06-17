export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return "Rs. " + new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getStatusColor(status: string): string {
  const s = status.toLowerCase()
  if (s.includes('success') || s.includes('delivered') || s.includes('verified') || s.includes('confirmed') || s.includes('active'))
    return 'bg-green-100 text-green-800'
  if (s.includes('pending') || s.includes('processing'))
    return 'bg-yellow-100 text-yellow-800'
  if (s.includes('failed') || s.includes('expired') || s.includes('cancelled') || s.includes('rejected'))
    return 'bg-red-100 text-red-800'
  if (s.includes('shipped') || s.includes('packed'))
    return 'bg-blue-100 text-blue-800'
  return 'bg-gray-100 text-gray-800'
}

export function truncate(str: string, n: number): string {
  return str.length > n ? str.substring(0, n) + '...' : str
}
