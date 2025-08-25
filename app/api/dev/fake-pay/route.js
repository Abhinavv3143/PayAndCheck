import { prisma } from '../../../../lib/prisma'
import { bus } from '../../../../lib/bus'
import { cookies } from 'next/headers'
import { makeAccessToken } from '../../../../lib/access'
import { generateBadgeId, signBadge, makeClaimToken } from '../../../../lib/badge'

export async function POST(request) {
  if (process.env.ENABLE_FAKE_PAY !== 'true') {
    return new Response('Not Found', { status: 404 })
  }
  if (process.env.NODE_ENV === 'production') {
    return new Response('Forbidden', { status: 403 })
  }

  const tokenHeader = process.env.FAKE_PAY_TOKEN
  if (tokenHeader) {
    const hdr = request.headers.get('x-dev-token') || ''
    if (hdr !== tokenHeader) return new Response('Unauthorized', { status: 401 })
  }

  try {
    const { amount: amt } = await request.json()
    const amount = parseInt(amt, 10)
    if (!amount || amount <= 0) return Response.json({ ok: false, error: 'Invalid amount' }, { status: 400 })

    const result = await prisma.$transaction(async (tx) => {
      const orderId = 'dev_' + Date.now().toString(36)
      const payment = await tx.payment.create({ data: { orderId, amount, status: 'paid', paymentId: 'devpay_' + Math.random().toString(36).slice(2) } })

      await tx.paymentCount.upsert({
        where: { amount },
        update: { count: { increment: 1 } },
        create: { amount, count: 1 }
      })

      let winner = false, badge = null
      try {
        const badgeId = generateBadgeId()
        const signature = signBadge(badgeId, amount)
        const claimToken = makeClaimToken()
        badge = await tx.badge.create({ data: { amount, badgeId, signature, orderId, claimToken } })
        winner = true
      } catch (e) {
        winner = false
      }

      return { amount, winner, badge }
    })

    const cookieName = `pac_a_${result.amount}`
    const tok = makeAccessToken(result.amount)
    cookies().set(cookieName, tok, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: `/a/${result.amount}`,
      maxAge: 30 * 60
    })

    bus.emit('stats_update', { amount: result.amount })

    return Response.json({ ok: true, amount: result.amount, winner: result.winner, badgeId: result.badge?.badgeId || null })
  } catch (e) {
    console.error('Fake pay error', e)
    return Response.json({ ok: false, error: 'Server error' }, { status: 500 })
  }
}
