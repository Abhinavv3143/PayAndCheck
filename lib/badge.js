import crypto from 'crypto'
export function generateBadgeId() { return 'b_' + crypto.randomBytes(10).toString('hex') }
export function signBadge(badgeId, amount) {
  const secret = process.env.BADGE_SIGNING_SECRET || 'dev-badge-secret'
  return crypto.createHmac('sha256', secret).update(`${badgeId}:${amount}`).digest('hex')
}
export function makeClaimToken() { return 'ct_' + crypto.randomBytes(16).toString('hex') }
