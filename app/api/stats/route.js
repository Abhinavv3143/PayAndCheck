import { prisma } from '../../../lib/prisma'
export async function GET() {
  const rows = await prisma.paymentCount.findMany({ orderBy: [{ amount: 'asc' }] })
  return Response.json({ stats: rows })
}
