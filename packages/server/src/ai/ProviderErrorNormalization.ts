const PROVIDER_CREDIT_EXHAUSTED_PREFIX = "provider_credit_exhausted:"

export const looksLikeProviderCreditExhausted = (reason: string): boolean => {
  const normalized = reason.toLowerCase()
  return normalized.includes("credit balance is too low")
    || normalized.includes("insufficient credits")
    || normalized.includes("insufficient_quota")
    || normalized.includes("billing")
}

export const isProviderCreditExhaustedReason = (reason: string): boolean =>
  reason.startsWith(PROVIDER_CREDIT_EXHAUSTED_PREFIX)

export const normalizeProviderModelFailureReason = (reason: string): string => {
  const trimmed = reason.trim()
  if (trimmed.length === 0) {
    return "model_error"
  }
  if (isProviderCreditExhaustedReason(trimmed)) {
    return trimmed
  }
  return looksLikeProviderCreditExhausted(trimmed)
    ? `${PROVIDER_CREDIT_EXHAUSTED_PREFIX} ${trimmed}`
    : trimmed
}
