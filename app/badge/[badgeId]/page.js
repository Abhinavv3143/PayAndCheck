'use client'
import { useEffect, useState } from 'react'

export default function BadgePage({ params }) {
  const { badgeId } = params
  const [badge, setBadge] = useState(null)

  useEffect(() => {
    (async () => {
      const r = await fetch(`/api/badge/${badgeId}`)
      if (r.ok) setBadge(await r.json())
    })()
  }, [badgeId])

  return (
    <main className="space-y-6">
      <h2 className="text-2xl font-semibold">First Payer Badge</h2>
      {!badge && <div>Loading…</div>}
      {badge && (
        <div className="bg-[var(--card)] rounded-2xl p-6 border border-white/5">
          <img
            src={`/api/badge/${badge.badgeId}/svg`}
            alt="Badge"
            className="w-full max-w-sm rounded-xl border border-white/10"
          />
          <div className="mt-4 text-sm text-[var(--muted)]">
            <div><b>Amount:</b> ₹{badge.amount.toLocaleString('en-IN')}</div>
            <div><b>Badge ID:</b> {badge.badgeId}</div>
            <div><b>Signature:</b> {badge.signature.slice(0, 24)}…</div>
            <div><b>Minted:</b> {new Date(badge.createdAt).toLocaleString()}</div>
          </div>
        </div>
      )}
    </main>
  )
}
