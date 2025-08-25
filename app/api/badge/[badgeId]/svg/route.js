import { prisma } from '../../../../../lib/prisma'
import crypto from 'crypto'

export async function GET(_req, { params }) {
  const { badgeId } = params
  const badge = await prisma.badge.findUnique({ where: { badgeId } })
  if (!badge) return new Response('Not found', { status: 404 })

  const hash = crypto.createHash('sha256').update(badgeId).digest('hex')
  const hue = parseInt(hash.slice(0, 2), 16) % 360
  const s = 60, l = 50
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="hsl(${hue},${s}%,${l+10}%)"/>
      <stop offset="100%" stop-color="hsl(${(hue+60)%360},${s}%,${l-10}%)"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <circle cx="256" cy="256" r="180" fill="rgba(255,255,255,0.1)"/>
  <text x="50%" y="46%" text-anchor="middle" font-size="28" fill="#fff" opacity=".9">FIRST OF ₹${badge.amount}</text>
  <text x="50%" y="55%" text-anchor="middle" font-size="18" fill="#fff" opacity=".85">${badge.badgeId}</text>
  <text x="50%" y="64%" text-anchor="middle" font-size="12" fill="#fff" opacity=".7">sig:${badge.signature.slice(0,12)}…</text>
</svg>`
  return new Response(svg.trim(), { headers: { 'Content-Type': 'image/svg+xml' } })
}
