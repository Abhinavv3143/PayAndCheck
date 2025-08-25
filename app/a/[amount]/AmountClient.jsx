'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function AmountClient({ amount }) {
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let es
    async function init() {
      const r = await fetch(`/api/stats/one?amount=${amount}`, { cache: 'no-store' })
      const d = await r.json()
      if (d.count !== undefined) setCount(d.count)
      setLoading(false)

      es = new EventSource('/api/stats/stream')
      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data)
          if (data?.stats) {
            const row = data.stats.find(s => s.amount === amount)
            setCount(row?.count || 0)
          }
        } catch {}
      }
    }
    init()
    return () => es && es.close()
  }, [amount])

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Live Count</h2>
        <span className="inline-flex items-center gap-2 text-sm text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 live-dot"></span> LIVE
        </span>
      </div>

      <div className="bg-[var(--card)] rounded-2xl p-8 shadow-lg border border-white/5">
        <div className="text-sm text-[var(--muted)] mb-2">Amount</div>
        <div className="text-5xl font-extrabold tracking-tight">₹{amount.toLocaleString('en-IN')}</div>
        <div className="h-px my-6 bg-white/10" />
        <div className="text-sm text-[var(--muted)] mb-2">People who paid this</div>
        <div className="text-6xl font-black">{loading ? '…' : count.toLocaleString('en-IN')}</div>
        <div className="mt-8 flex gap-3">
          <Link href="/" className="px-4 py-2 rounded-lg bg-white text-black font-medium hover:opacity-90">Pay another amount</Link>
          <button onClick={()=>navigator.share?.({ title:'payandcheck.in', text:`I paid ₹${amount} — join in!`, url: typeof location!=='undefined' ? location.href : '/' })}
            className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/5">Share</button>
        </div>
      </div>
    </main>
  )
}
