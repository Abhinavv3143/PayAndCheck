import { prisma } from '../../../../lib/prisma'
import { bus } from '../../../../lib/bus'

export async function GET() {
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    start(controller) {
      const send = (obj) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`))
      prisma.paymentCount.findMany({ orderBy: [{ amount: 'asc' }] })
        .then(rows => send({ stats: rows }))
        .catch(() => send({ stats: [] }))
      const onUpdate = async () => {
        const rows = await prisma.paymentCount.findMany({ orderBy: [{ amount: 'asc' }] })
        send({ stats: rows })
      }
      bus.on('stats_update', onUpdate)
      const hb = setInterval(() => controller.enqueue(encoder.encode(`: ping\n\n`)), 20000)
      this._cleanup = () => { clearInterval(hb); bus.off('stats_update', onUpdate); try{controller.close()}catch{} }
    },
    cancel() { this._cleanup && this._cleanup() }
  })
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    }
  })
}
