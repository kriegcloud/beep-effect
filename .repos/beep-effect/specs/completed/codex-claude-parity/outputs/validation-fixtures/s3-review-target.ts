import { Effect } from "effect"

export const processItems = async (items: Array<number>) => {
  const pause = await Promise.resolve(1)
  const unsafe: any = pause
  const mapped = items.map((item) => item + unsafe)

  switch (mapped.length) {
    case 0:
      return "empty"
    default:
      return "ok"
  }
}
