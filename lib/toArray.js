export default function toArray(value, defaultValue) {
  if (typeof value === 'undefined' || value === null) {
    return defaultValue
  }

  if (Array.isArray(value)) {
    return value
  }

  if (typeof value !== 'string' && value[Symbol.iterator]) {
    return [...value]
  }

  return [value]
}
