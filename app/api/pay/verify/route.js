import crypto from 'crypto'
import { prisma } from '../../../../lib/prisma'
import { bus } from '../../../../lib/bus'
import { cookies } from 'next/headers'
import { makeAccessToken } from '../../../../lib/access'
import { generateBadgeId, signBadge, makeClaimToken } from '../../../../lib/badge'

export async function POST(request) {
  try {
    const { order_id, payment_id, signature } = await request.json()
    if (!order_id || !payment_id || !signature) {
      return Response.json({ ok: false, error: 'Missing fields' }, { status: 400 })
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET
    const expected = crypto.createHmac('sha256', key_secret)
      .update(order_id + '|' + payment_id)
      .digest('hex')

    if (expected !== signature) {
      return Response.json({ ok: false, error: 'Invalid signature' }, { status: 400 })
    }

    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({ where: { orderId: order_id } })
      if (!payment) throw new Error('Order not found')

      const updated = await tx.payment.update({
        where: { orderId: order_id },
        data: { status: 'paid', paymentId: payment_id }
      })

      await tx.paymentCount.upsert({
        where: { amount: updated.amount },
        update: { count: { increment: 1 } },
        create: { amount: updated.amount, count: 1 }
      })

      // try to mint FIRST badge for this amount
      let winner = false, badge = null
      try {
        const badgeId = generateBadgeId()
        const signature = signBadge(badgeId, updated.amount)
        const claimToken = makeClaimToken()
        badge = await tx.badge.create({ data: { amount: updated.amount, badgeId, signature, orderId: order_id, claimToken } })
        winner = true
      } catch (e) {
        winner = false
      }

      return { updated, winner, badge }
    })

    // set access cookie scoped to /a/{amount}
    const cookieName = `pac_a_${result.updated.amount}`
    const token = makeAccessToken(result.updated.amount)
    cookies().set(cookieName, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: `/a/${result.updated.amount}`,
      maxAge: 30 * 60 // 30 minutes
    })

    bus.emit('stats_update', { amount: result.updated.amount })

    return Response.json({
      ok: true,
      winner: result.winner,
      badgeId: result.badge?.badgeId || null,
      claimToken: result.badge?.claimToken || null
    })
  } catch (e) {
    console.error('Verify error', e)
    return Response.json({ ok: false, error: 'Server error' }, { status: 500 })
  }
}
