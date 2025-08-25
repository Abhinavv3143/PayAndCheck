import { prisma } from '../../../../lib/prisma'

export async function GET(_req, { params }) {
  const { badgeId } = params
  const badge = await prisma.badge.findUnique({ where: { badgeId } })
  if (!badge) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json({
    badgeId: badge.badgeId,
    amount: badge.amount,
    createdAt: badge.createdAt,
    signature: badge.signature
  })
}
