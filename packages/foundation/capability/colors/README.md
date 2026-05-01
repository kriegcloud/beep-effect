# @beep/colors

terminal output formatting with ANSI colors.

## Installation

```bash
bun add @beep/colors
```

## Usage

```ts
import colors, { createColors, isColorSupported } from "@beep/colors"

const forcedPlain = createColors(false)
const status = isColorSupported ? colors.green("ok") : forcedPlain.green("ok")

console.log(status)
```

## Development

```bash
# Build
bun run build

# Type check
bun run check

# Test
bun run test

# Lint
bun run lint:fix
```

## License

MIT
