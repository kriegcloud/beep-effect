export const add = (a: number, b: number): number => {
  const sum = a + b
  return sum
}

export const addMany = (values: ReadonlyArray<number>): number => {
  let total = 0
  for (const value of values) {
    total += value
  }
  return total
}
