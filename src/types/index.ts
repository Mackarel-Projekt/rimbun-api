export interface ParseRequest {
  rawText: string
}

export interface ParsedReceipt {
  merchant: string | null
  merchantLocation: string | null
  datetime: string | null
  total: number | null
  currency: string | null
  paymentMethod: string | null
  paymentApp: string | null
  transactionId: string | null
  merchantPan: string | null
}

export interface ParserProvider {
  name: string
  parse(rawText: string, env: Env): Promise<ParsedReceipt | null>
}

export type ProviderFactory = {
  name: string
  extractEnvKey: string
  baseUrl: string
  model: string
}