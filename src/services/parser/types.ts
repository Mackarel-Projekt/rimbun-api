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

export const PARSE_SYSTEM_PROMPT = `Extract receipt data from OCR text into JSON.

Required fields (use null if not found):
- merchant: store/business name
- merchantLocation: store location/address
- datetime: ISO 8601 format (e.g. "2026-08-14T14:48:00")
- total: numeric amount in IDR (strip Rp, dots, commas)
- currency: "IDR"
- paymentMethod: "QRIS" | "E-Wallet" | "Bank Transfer" | "Debit Card" | "Credit Card" | "Cash" | "Other"
- paymentApp: app name like "GoPay", "OVO", "DANA", "ShopeePay", etc.
- transactionId: any transaction/invoice/order ID found
- merchantPan: merchant PAN/account number if visible

Return ONLY valid JSON. No markdown, no explanation.`