import { createOpenAICompatibleProvider } from './openai-compatible'

export const groqProvider = createOpenAICompatibleProvider({
  name: 'groq',
  baseUrl: 'https://api.groq.com/openai/v1',
  model: 'llama-3.1-8b-instant',
  apiKeyHeader: 'Authorization',
  getApiKey: (env: Env) => env.GROQ_API_KEY ? `Bearer ${env.GROQ_API_KEY}` : undefined,
})