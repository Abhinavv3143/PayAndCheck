import Razorpay from 'razorpay'
import { prisma } from '../../../../lib/prisma'

export async function POST(request) {
  try {
    const body = await request.json()
    const amount = parseInt(body.amount, 10)
    if (!amount || amount <= 0) {
      return Response.json({ error: 'Invalid amount' }, { status: 400 })
    }

    const key_id = process.env.RAZORPAY_KEY_ID
    const key_secret = process.env.RAZORPAY_KEY_SECRET
    if (!key_id || !key_secret) {
      return Response.json({ error: 'Gateway keys not configured' }, { status: 500 })
    }

    const razorpay = new Razorpay({ key_id, key_secret })
    const receipt = 'PAC-' + Date.now().toString(36)

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: 'INR',
      receipt,
      notes: { purpose: 'voluntary_tip', amount_rupees: String(amount) }
    })

    await prisma.payment.create({ data: { orderId: order.id, amount, status: 'created' } })
    return Response.json({ orderId: order.id, keyId: key_id })
  } catch (e) {
    console.error('Create order error', e)
    return Response.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
