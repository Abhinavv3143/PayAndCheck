import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyAccessToken } from '../../../lib/access'
import AmountClient from './AmountClient'

export default function AmountPage({ params }) {
  const amount = parseInt(params.amount, 10)
  const cookieName = `pac_a_${amount}`
  const c = cookies().get(cookieName)?.value || ''
  const ok = verifyAccessToken(c, amount)
  if (!ok) redirect(`/?needPayment=1&amount=${amount}`)
  return <AmountClient amount={amount} />
}
