export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

export function calculatePortfolioValue(
  holdings: Array<{ quantity: number; costBasis: number }>
): number {
  return holdings.reduce((sum, h) => sum + h.quantity * h.costBasis, 0);
}
