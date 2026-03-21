# Client AGENTS.md

> See root `/AGENTS.md` for monorepo conventions.

## Commands

| Command                    | Purpose                      |
| -------------------------- | ---------------------------- |
| `bun dev --filter=client`  | Start dev server (port 3000) |
| `bun test --filter=client` | Run client tests             |

## State Management: Effect Atom

**Not standard Jotai** - Uses `@effect-atom/atom-react` (Effect-based atoms).

```typescript
// Define atoms in lib/, not components
export const myAtom = runtime.fn(() =>
  Effect.gen(function* () {
    const client = yield* MyService;
    return yield* client.getData();
  })
);

// Component usage
const [result, trigger] = useAtom(myAtom);
const data = Result.getOrElse(result, () => defaultValue);

// Result pattern matching
Result.match(result, {
  onInitial: () => <Loading />,
  onSuccess: (data) => <Data data={data} />,
  onFailure: (error) => <Error error={error} />,
});

// Mutations via WebSocket
const setStatus = useAtomSet(WebSocketClient.mutation("setStatus"));
setStatus({ payload: { clientId, status } });
```

## Data Flow

| Pattern       | Client Setup                          | Usage                        |
| ------------- | ------------------------------------- | ---------------------------- |
| **REST API**  | `HttpApiClient.make(Api)`             | `useAtom(helloAtom)`         |
| **HTTP RPC**  | `RpcClient.make(EventRpc)`            | `useAtom(tickAtom)` (stream) |
| **WebSocket** | `AtomRpc.Tag` + `layerProtocolSocket` | `useAtom` + `useAtomSet`     |

## Component Patterns

```
src/
├── lib/           # Atoms, RPC clients (no UI here)
│   ├── atom.ts            # HTTP atoms
│   ├── rpc-client.ts      # HTTP RPC setup
│   └── web-socket-client.ts  # WebSocket atoms
├── components/ui/ # UI components (import atoms from lib/)
└── app.tsx        # Root component
```

**Conventions**:

- Define atoms in `lib/`, consume in components
- Use `useEffect` to start subscriptions on mount
- Derive state with `useMemo` from event streams
- Use `cn()` from `lib/utils` for Tailwind class merging

## Styling: Tailwind CSS 4

- **Config**: CSS-based (`src/index.css`), not JS config
- **Variants**: Use CVA (`class-variance-authority`) for component variants
- **Merging**: Always use `cn()` for dynamic classes
- **Tokens**: Use semantic colors (`bg-primary`, `text-foreground`)

## Design Context

### Users
Internal developers and demo audiences evaluating or showcasing the stack. Primary jobs: explore the client UX, validate API/RPC/WebSocket flows, and understand how the monorepo pieces fit together.

### Brand Personality
Technical, precise, modern. Emotional goal: calm and focused; confidence through clarity and low-friction interactions.

### Aesthetic Direction
Use the existing OKLCH token palette and current component styling. Support both light and dark modes. Avoid visual noise or gimmicks.

### Design Principles
- Prioritize clarity and legibility over decoration.
- Keep interactions calm, predictable, and low-friction.
- Stay consistent with existing tokens, spacing, and component patterns.
- Maintain strong information hierarchy for scanning.
- Meet WCAG AAA where feasible.

## Environment

```bash
VITE_SERVER_URL=http://localhost:9000   # REST/RPC endpoint
VITE_WS_URL=ws://localhost:9000/ws      # WebSocket endpoint
```

---

_This document is a living guide. Update it as the project evolves and new
patterns emerge._
