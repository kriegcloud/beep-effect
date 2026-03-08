export function onlyUnique <T>(areEqual: (left: T, right: T) => boolean) {
  return function (value: T | T[], index: number, self: Array<T | T[]>): boolean {
    if (Array.isArray(value)) {
      return true
    }

    const found = self.findIndex(other => {
      if (Array.isArray(other)) {
        return true
      }

      return areEqual(value, other)
    })

    return found === index
  }
}
