
# useAtomSuspense Hook

Suspense-aware access to Result atoms with declarative loading and error handling.

## Signature

```tsx
function useAtomSuspense<A, E, IncludeFailure extends boolean = false>(
  atom: Atom<Result<A, E>>,
  options?: {
    readonly suspendOnWaiting?: boolean | undefined
    readonly includeFailure?: IncludeFailure | undefined
  }
): Result.Success<A, E> | (IncludeFailure extends true ? Result.Failure<A, E> : never)
```

## Behavior

- **Suspends** while atom is in `Result.Waiting` state (unless `suspendOnWaiting: false`)
- **Throws error** on `Result.Failure` (caught by Error Boundary, unless `includeFailure: true`)
- **Returns unwrapped value** directly (no Result wrapper)
- Works with **React Suspense boundaries** for loading UI
- Works with **Error Boundaries** for error UI

## Basic Example with Suspense

```tsx
import { Atom } from "@effect-atom/atom-react"
import { useAtomSuspense } from "@effect-atom/atom-react"
import { Effect } from "effect"
import React from "react"

// Create effectful atom that returns Result
const userAtom = Atom.fn(
  Effect.fnUntraced(function* () {
    yield* Effect.sleep("1 second")
    const response = yield* Effect.tryPromise(() => 
      fetch("/api/user").then(r => r.json())
    )
    return response
  })
)

function UserProfile() {
  // Suspends during loading, unwraps success value
  const user = useAtomSuspense(userAtom)
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  )
}

function App() {
  return (
    <React.Suspense fallback={<div>Loading user...</div>}>
      <UserProfile />
    </React.Suspense>
  )
}
```

## With Error Boundary

```tsx
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  state = { hasError: false, error: undefined }
  
  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, error }
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Try Again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

function App() {
  return (
    <ErrorBoundary>
      <React.Suspense fallback="Loading...">
        <UserProfile />
      </React.Suspense>
    </ErrorBoundary>
  )
}
```

## With Options - No Suspend

```tsx
function OptionalUserProfile() {
  // Don't suspend on waiting, return undefined if not loaded
  const user = useAtomSuspense(userAtom, {
    suspendOnWaiting: false,
  })
  
  if (!user) {
    return <div>Loading...</div>
  }
  
  return <div>{user.name}</div>
}
```

## With Options - Include Failure

```tsx
import { Result } from "effect"

function UserProfileWithErrorHandling() {
  // Return failure instead of throwing
  const result = useAtomSuspense(userAtom, {
    includeFailure: true,
  })
  
  if (Result.isFailure(result)) {
    return (
      <div>
        <p>Error: {Cause.pretty(result.cause)}</p>
        <button onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    )
  }
  
  // result is Result.Success<User>
  return <div>{result.value.name}</div>
}
```

## Multiple Atoms with Suspense

```tsx
const userAtom = Atom.fn(/* fetch user */)
const postsAtom = Atom.fn(/* fetch posts */)
const commentsAtom = Atom.fn(/* fetch comments */)

function Dashboard() {
  // All three atoms can suspend
  const user = useAtomSuspense(userAtom)
  const posts = useAtomSuspense(postsAtom)
  const comments = useAtomSuspense(commentsAtom)
  
  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <h2>Posts: {posts.length}</h2>
      <h3>Comments: {comments.length}</h3>
    </div>
  )
}

function App() {
  return (
    // Single Suspense boundary for all atoms
    <React.Suspense fallback="Loading dashboard...">
      <Dashboard />
    </React.Suspense>
  )
}
```

## Nested Suspense Boundaries

```tsx
function App() {
  return (
    <div>
      {/* Critical data - show loading immediately */}
      <React.Suspense fallback="Loading user...">
        <UserHeader />
      </React.Suspense>
      
      {/* Non-critical data - can load independently */}
      <React.Suspense fallback="Loading posts...">
        <PostsList />
      </React.Suspense>
      
      <React.Suspense fallback="Loading comments...">
        <CommentsList />
      </React.Suspense>
    </div>
  )
}

function UserHeader() {
  const user = useAtomSuspense(userAtom)
  return <h1>{user.name}</h1>
}

function PostsList() {
  const posts = useAtomSuspense(postsAtom)
  return <div>{/* render posts */}</div>
}
```

## With Refresh

```tsx
import { useAtomRefresh } from "@effect-atom/atom-react"

function UserProfile() {
  const user = useAtomSuspense(userAtom)
  const refresh = useAtomRefresh(userAtom)
  
  return (
    <div>
      <h1>{user.name}</h1>
      <button onClick={refresh}>Refresh User</button>
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <React.Suspense fallback="Loading...">
        <UserProfile />
      </React.Suspense>
    </ErrorBoundary>
  )
}
```

## Comparison: useAtomSuspense vs useAtomValue

```tsx
// With useAtomValue - Manual Result handling
function UserProfileManual() {
  const userResult = useAtomValue(userAtom)
  
  if (Result.isWaiting(userResult)) {
    return <div>Loading...</div>
  }
  
  if (Result.isFailure(userResult)) {
    return <div>Error: {Cause.pretty(userResult.cause)}</div>
  }
  
  const user = Result.getOrThrow(userResult)
  return <div>{user.name}</div>
}

// With useAtomSuspense - Declarative boundaries
function UserProfileSuspense() {
  const user = useAtomSuspense(userAtom)
  // No manual Result handling needed!
  return <div>{user.name}</div>
}

function App() {
  return (
    <ErrorBoundary>
      <React.Suspense fallback="Loading...">
        <UserProfileSuspense />
      </React.Suspense>
    </ErrorBoundary>
  )
}
```

## When to Use useAtomSuspense

**Use when**:
- Working with **Result atoms** (atoms that can be in Waiting/Failure/Success states)
- You want **declarative** loading and error UI (Suspense + Error Boundaries)
- You prefer React's built-in error handling mechanisms
- Building apps with multiple async data sources
- You want to avoid manual Result state checking

**Don't use when**:
- Atom doesn't return Result type (use `useAtomValue` instead)
- You need **custom** loading/error UI logic (use `useAtomValue` with manual Result handling)
- You want fine-grained control over error recovery
- Working with non-async atoms

## Important Notes

1. **Result atoms only**: This hook is specifically designed for atoms that return `Result<A, E>`. For other atoms, use `useAtomValue`.

2. **Error Boundary required**: Unless you use `includeFailure: true`, you **must** wrap with an Error Boundary to catch thrown errors.

3. **Suspense Boundary required**: Unless you use `suspendOnWaiting: false`, you **must** wrap with React.Suspense to catch the suspension.

4. **Automatic unwrapping**: The hook returns the unwrapped success value, not the Result wrapper.

5. **Type safety**: TypeScript correctly infers the return type based on options (e.g., with `includeFailure: true`, return type includes Failure).

## Registry Context

```tsx
import { RegistryProvider } from "@effect-atom/atom-react"

function App() {
  return (
    <RegistryProvider>
      <ErrorBoundary>
        <React.Suspense fallback="Loading...">
          <UserProfile />
        </React.Suspense>
      </ErrorBoundary>
    </RegistryProvider>
  )
}
```

## See Also

- `useAtomValue` - For non-Result atoms or manual Result handling
- `Atom.fn` - Creating effectful atoms that return Results
- `Result` - Effect's Result type for representing async states
- React Suspense - https://react.dev/reference/react/Suspense
- React Error Boundaries - https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
    