import { createOpenAICompatibleProvider } from './openai-compatible'

export const openrouterProvider = createOpenAICompatibleProvider({
  name: 'openrouter',
  baseUrl: 'https://openrouter.ai/api/v1',
  model: 'google/gemma-4-26b-a4b-it:free',
  apiKeyHeader: 'Authorization',
  getApiKey: (env: Env) => env.OPENROUTER_API_KEY ? `Bearer ${env.OPENROUTER_API_KEY}` : undefined,
})