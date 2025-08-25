import './globals.css'

export const metadata = {
  title: "payandcheck.in",
  description: "Pay any ₹ amount — see how many people paid that exact amount."
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="max-w-3xl mx-auto px-5 py-8">
          <header className="flex items-center justify-between mb-8">
            <h1 className="text-xl font-semibold">payandcheck.in</h1>
            <nav className="flex gap-4 text-sm text-[var(--muted)]">
              <a href="/privacy" className="hover:text-white">Privacy</a>
              <a href="/terms" className="hover:text-white">Terms</a>
              <a href="/refunds" className="hover:text-white">Refunds</a>
            </nav>
          </header>
          {children}
          <footer className="mt-16 text-xs text-[var(--muted)]">
            <p>© {new Date().getFullYear()} payandcheck.in — Voluntary tips only. No goods/services provided.</p>
            <p>Support: <a className="underline" href="mailto:support@payandcheck.in">support@payandcheck.in</a></p>
          </footer>
        </div>
      </body>
    </html>
  )
}
