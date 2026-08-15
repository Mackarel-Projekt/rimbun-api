import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { cors, hmac } from './middleware'
import { parseOcrText } from './services/parser'

const app = new Hono<{ Bindings: Env }>()

app.use('*', cors)

const parseSchema = z.object({
  rawText: z.string().min(1, 'rawText is required'),
})

app.post('/api/parse', hmac, zValidator('json', parseSchema), async (c) => {
  const { rawText } = c.req.valid('json')

  const result = await parseOcrText(rawText, c.env)

  return c.json(result)
})

app.get('/api/health', (c) => c.json({ status: 'ok' }))

export default app