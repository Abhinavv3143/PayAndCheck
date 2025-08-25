'use client'

import Script from 'next/script'
import { useState, useEffect } from 'react'

export default function HomePage() {
  const [amount, setAmount] = useState('1')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    const url = new URL(window.location.href)
    if (url.searchParams.get('needPayment')) {
      const a = url.searchParams.get('amount') || ''
      setMsg(a ? `Please pay ₹${a} to open the live page.` : 'Please pay to open the live page.')
    }
  }, [])

  async function pay() {
    setError(''); setMsg('')
    const rupees = parseInt(amount, 10)
    if (!rupees || rupees <= 0) { setError('Enter a positive amount in rupees'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/pay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: rupees })
      })
      const data = await res.json()
      if (!data.orderId) throw new Error(data.error || 'Order creation failed')

      const options = {
        key: data.keyId,
        amount: rupees * 100,
        currency: "INR",
        name: process.env.NEXT_PUBLIC_SITE_NAME || "payandcheck.in",
        description: "Voluntary tip",
        order_id: data.orderId,
        handler: async function (response) {
          const v = await fetch('/api/pay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              order_id: response.razorpay_order_id,
              payment_id: response.razorpay_payment_id,
              signature: response.razorpay_signature
            })
          })
          const vv = await v.json()
          if (vv.ok) {
            if (vv.winner && vv.badgeId) {
              window.location.href = `/badge/${vv.badgeId}`
            } else {
              window.location.href = `/a/${rupees}`
            }
          } else {
            setError('Payment verification failed. Contact support.')
          }
        },
        theme: { color: "#00e09d" }
      }
      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="space-y-8">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />

      <section className="bg-[var(--card)] rounded-2xl p-8 shadow-lg border border-white/5">
        <h2 className="text-2xl font-semibold mb-2">Pay any amount (₹)</h2>
        <p className="text-sm text-[var(--muted)] mb-6">After you pay, you’ll unlock a LIVE page that shows how many people have paid that <b>exact</b> amount.</p>

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/30 border border-white/10">
            <span className="text-[var(--muted)]">₹</span>
            <input
              value={amount}
              onChange={e=>setAmount(e.target.value.replace(/[^0-9]/g,''))}
              placeholder="e.g. 1, 10, 21"
              inputMode="numeric"
              className="bg-transparent outline-none w-40 font-medium tracking-wide"
            />
          </div>

          <button
            onClick={pay}
            disabled={loading}
            className="px-5 py-2 rounded-lg bg-white text-black font-semibold hover:opacity-90 disabled:opacity-60"
          >
            {loading ? 'Creating order…' : 'Pay with Razorpay'}
          </button>
        </div>

        {error && <div className="mt-3 text-sm text-red-400">{error}</div>}
        {msg && <div className="mt-3 text-sm text-amber-300">{msg}</div>}

        <div className="mt-6 text-xs text-[var(--muted)]">
          This is a voluntary tip to support this project. No refunds. No goods/services provided.
        </div>

      {process.env.NEXT_PUBLIC_ENABLE_FAKE_PAY_UI === 'true' && (
        <div className="mt-6 border border-amber-400/40 bg-amber-400/10 rounded-lg p-4 text-amber-200">
          <div className="text-sm mb-2 font-medium">Dev tools</div>
          <button
            onClick={async ()=>{
              const rupees = parseInt(amount, 10); if(!rupees||rupees<=0) return;
              const res = await fetch('/api/dev/fake-pay', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: rupees })
              })
              const data = await res.json()
              if(data.ok){
                if(data.winner && data.badgeId){ window.location.href = `/badge/${data.badgeId}` }
                else { window.location.href = `/a/${rupees}` }
              } else { alert('Fake pay failed: ' + (data.error||'unknown')) }
            }}
            className="px-4 py-2 rounded-md bg-amber-400 text-black font-semibold hover:opacity-90"
          >
            Dev: Fake Pay
          </button>
        </div>
      )}

      </section>

      <section className="rounded-xl border border-white/5 p-4 bg-black/20">
        <div className="text-sm text-[var(--muted)]">
          Try ₹1 for fun — the counter page will auto-update in real time when anyone else pays ₹1.
        </div>
      </section>
    </main>
  )
}
