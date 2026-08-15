import { PARSE_SYSTEM_PROMPT } from '../types'
import type { ParsedReceipt } from '../types'

interface ProviderConfig {
  name: string
  baseUrl: string
  model: string
  apiKeyHeader: string
  getApiKey: (env: Env) => string | undefined
}

export function createOpenAICompatibleProvider(config: ProviderConfig) {
  return {
    name: config.name,
    async parse(rawText: string, env: Env): Promise<ParsedReceipt | null> {
      const apiKey = config.getApiKey(env)
      if (!apiKey) return null

      try {
        const res = await fetch(`${config.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            [config.apiKeyHeader]: apiKey,
            ...(config.name === 'openrouter' ? { 'HTTP-Referer': 'https://finance-api.local', 'X-Title': 'Finance API' } : {}),
          },
          body: JSON.stringify({
            model: config.model,
            messages: [
              { role: 'system', content: PARSE_SYSTEM_PROMPT },
              { role: 'user', content: rawText },
            ],
            temperature: 0.1,
            max_tokens: 300,
            response_format: { type: 'json_object' },
          }),
        })

        if (!res.ok) {
          const body = await res.text()
          console.error(`[${config.name}] API error ${res.status}: ${body}`)
          return null
        }

        const data = await res.json() as { choices: Array<{ message: { content: string } }> }
        const content = data.choices?.[0]?.message?.content
        if (!content) return null

        const parsed = JSON.parse(content) as Partial<ParsedReceipt>
        if (typeof parsed !== 'object' || parsed === null) return null

        return {
          merchant: parsed.merchant ?? null,
          merchantLocation: parsed.merchantLocation ?? null,
          datetime: parsed.datetime ?? null,
          total: parsed.total != null ? Number(parsed.total) : null,
          currency: parsed.currency ?? null,
          paymentMethod: parsed.paymentMethod ?? null,
          paymentApp: parsed.paymentApp ?? null,
          transactionId: parsed.transactionId ?? null,
          merchantPan: parsed.merchantPan ?? null,
        }
      } catch (err) {
        console.error(`[${config.name}] fetch error:`, err)
        return null
      }
    },
  }
}