export function normalizeDocSlug(value: string): string {
  return value.replace(/^[0-9]+-/, "")
}
