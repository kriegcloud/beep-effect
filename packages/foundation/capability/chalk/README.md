# @beep/chalk

🖍 Terminal string styling done right

## Installation

```bash
bun add @beep/chalk
```

## Usage

```ts
import chalk, { Chalk, type ChalkConstructorOptions, supportsColor } from "@beep/chalk"

const warning = chalk.hex("#FFA500").bold("warning")
const options: ChalkConstructorOptions = { level: 0 }
const plain = new Chalk(options)

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
