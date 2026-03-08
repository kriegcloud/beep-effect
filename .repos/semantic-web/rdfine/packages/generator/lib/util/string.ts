export function toUpperInitial(str: string) {
  return str.replace(/^\w/, initial => initial.toUpperCase())
}
