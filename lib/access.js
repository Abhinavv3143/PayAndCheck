import crypto from 'crypto'

function b64url(input) {
  return Buffer.from(input).toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')
}
function b64urlDecode(input) {
  input = input.replace(/-/g,'+').replace(/_/g,'/')
  while (input.length % 4) input += '='
  return Buffer.from(input, 'base64').toString()
}

export function makeAccessToken(amount) {
  const secret = process.env.VIEW_TOKEN_SECRET || 'dev-view-secret'
  const ts = Date.now()
  const base = `${amount}.${ts}`
  const sig = crypto.createHmac('sha256', secret).update(base).digest('hex')
  const json = JSON.stringify({ a: amount, ts, s: sig })
  return b64url(json)
}

export function verifyAccessToken(token, amount, maxAgeMs = 30 * 60 * 1000) {
  if (!token) return false
  try {
    const obj = JSON.parse(b64urlDecode(token))
    if (obj.a !== amount) return false
    const now = Date.now()
    if (now - obj.ts > maxAgeMs) return false
    const secret = process.env.VIEW_TOKEN_SECRET || 'dev-view-secret'
    const base = `${obj.a}.${obj.ts}`
    const sig = crypto.createHmac('sha256', secret).update(base).digest('hex')
    return sig === obj.s
  } catch {
    return false
  }
}
