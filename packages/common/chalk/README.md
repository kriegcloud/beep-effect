# @beep/chalk

🖍 Terminal string styling done right

## Installation

```bash
bun add @beep/chalk
```

## Usage

```ts
import chalk, { Chalk, supportsColor } from "@beep/chalk"

const warning = chalk.hex("#FFA500").bold("warning")
const plain = new Chalk({ level: 0 })

console.log(warning)
console.log(plain.red("offline"))
console.log(supportsColor)
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
