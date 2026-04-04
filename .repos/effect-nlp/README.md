# effect-nlp

Effect-based NLP toolkit combining [wink-nlp](https://winkjs.org/wink-nlp/) with the [Effect](https://effect.website) TypeScript library.

## Features

- Tokenization with offset tracking
- Pattern matching and pattern builders
- Sentence and document modeling
- Wink NLP engine integration (lemmatization, similarity, vectorization)
- Effect Layer-based dependency injection

## Getting Started

```sh
bun install
```

## Scripts

| Command              | Description                        |
| -------------------- | ---------------------------------- |
| `bun run start`      | Run the application                |
| `bun run dev`        | Start with watch mode (hot reload) |
| `bun run typecheck`  | TypeScript type checking           |
| `bun run lint`       | Run ESLint                         |
| `bun run lint:fix`   | ESLint with automatic fixes        |
| `bun run test`       | Run all tests                      |
| `bun run test:unit`  | Run unit tests only                |

## Project Structure

```
src/
  Program.ts              Entry point
  NLP/
    Core/                 Token, Sentence, Document, Pattern types
    Wink/                 Wink NLP engine integration
    Layers/               Effect Layer composition
test/
  unit/                   Unit tests
```

## License

MIT
