import type { MiddlewareHandler } from 'hono'

const FIVE_MINUTES_MS = 5 * 60 * 1000

export const hmac: MiddlewareHandler<{ Bindings: Env }> = async (c, next) => {
  const signature = c.req.header('x-signature')
  const timestamp = c.req.header('x-timestamp')

  if (!signature || !timestamp) {
    return c.json({ error: 'Missing signature or timestamp' }, 401)
  }

  const now = Date.now()
  const ts = parseInt(timestamp, 10)
  if (isNaN(ts) || Math.abs(now - ts) > FIVE_MINUTES_MS) {
    return c.json({ error: 'Invalid or expired timestamp' }, 401)
  }

  const secret = c.env.HMAC_SECRET
  if (!secret) {
    return c.json({ error: 'HMAC not configured' }, 500)
  }

  const body = await c.req.raw.clone().text()
  const method = c.req.method
  const path = c.req.path
  const payload = `${method}${path}${body}${timestamp}`

  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )

  const mac = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(payload))
  const expected = Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  if (signature !== expected) {
    return c.json({ error: 'Invalid signature' }, 401)
  }

  await next()
}