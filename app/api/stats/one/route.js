import { prisma } from '../../../../lib/prisma'
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const amount = parseInt(searchParams.get('amount') || '0', 10)
  if (!amount || amount <= 0) return Response.json({ error: 'Invalid amount' }, { status: 400 })
  const row = await prisma.paymentCount.findUnique({ where: { amount } })
  return Response.json({ amount, count: row?.count || 0 })
}
