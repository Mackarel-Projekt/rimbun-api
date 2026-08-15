import { groqProvider } from './providers/groq'
import { openrouterProvider } from './providers/openrouter'
import type { ParsedReceipt } from './types'
import type { ParserProvider } from '../../types'

const providers: ParserProvider[] = [
  groqProvider,
  openrouterProvider,
]

function resolveOrder(env: Env): ParserProvider[] {
  const order = env.PARSER_PROVIDER_ORDER?.split(',').map(s => s.trim()) ?? []
  if (order.length === 0) return providers

  const map = new Map(providers.map(p => [p.name, p]))
  const ordered: ParserProvider[] = []
  for (const name of order) {
    const p = map.get(name)
    if (p) ordered.push(p)
  }
  for (const p of providers) {
    if (!ordered.includes(p)) ordered.push(p)
  }
  return ordered
}

export async function parseOcrText(rawText: string, env: Env): Promise<ParsedReceipt> {
  const ordered = resolveOrder(env)
  const errors: Array<{ provider: string; error: string }> = []

  for (const provider of ordered) {
    const result = await provider.parse(rawText, env)
    if (result) return result
    errors.push({ provider: provider.name, error: 'returned null or failed' })
  }

  throw new Error(`All providers failed: ${errors.map(e => `${e.provider}`).join(', ')}`)
}