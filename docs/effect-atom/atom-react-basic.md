
# Basic atom-react Example

A simple counter application demonstrating fundamental atom-react concepts.

## Complete Example

```tsx
import { Atom } from "@effect-atom/atom-react"
import { 
  useAtomValue, 
  useAtom, 
  RegistryProvider 
} from "@effect-atom/atom-react"
import React from "react"

// 1. Define atom
const countAtom = Atom.make(0)

// 2. Read-only component
function DisplayCount() {
  const count = useAtomValue(countAtom)
  return (
    <div className="display">
      <h2>Current Count: {count}</h2>
      <p>This component only reads the value</p>
    </div>
  )
}

// 3. Read-write component
function Controls() {
  const [count, setCount] = useAtom(countAtom)
  
  return (
    <div className="controls">
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
      <button onClick={() => setCount(count - 1)}>
        Decrement
      </button>
      <button onClick={() => setCount(count * 2)}>
        Double
      </button>
      <button onClick={() => setCount(0)}>
        Reset
      </button>
      <p>Current: {count}</p>
    </div>
  )
}

// 4. Multiple displays (stay synchronized)
function SecondaryDisplay() {
  const count = useAtomValue(countAtom)
  return <small>Also displaying: {count}</small>
}

// 5. App with registry provider
function App() {
  return (
    <RegistryProvider>
      <div className="app">
        <h1>atom-react Counter</h1>
        <DisplayCount />
        <Controls />
        <SecondaryDisplay />
      </div>
    </RegistryProvider>
  )
}

export default App
```

## Key Concepts Demonstrated

### 1. Atom Definition

```tsx
const countAtom = Atom.make(0)
```

- **Atom.make** creates a writable atom
- Initial value: `0`
- Type is inferred: `Atom<number>`

### 2. Read-Only Access (useAtomValue)

```tsx
const count = useAtomValue(countAtom)
```

- **Subscribes** to atom changes
- **No ability to update** (read-only)
- **Re-renders** when atom value changes
- More efficient than `useAtom` if you don't need to update

### 3. Read-Write Access (useAtom)

```tsx
const [count, setCount] = useAtom(countAtom)
```

- **Returns tuple**: `[value, setValue]`
- Similar to React's `useState`
- Can **read and write** the atom
- **Re-renders** when atom value changes

### 4. Component Synchronization

All components subscribing to the same atom stay synchronized automatically:
- `DisplayCount` shows the value
- `Controls` shows and updates the value
- `SecondaryDisplay` shows the value

All update instantly when `setCount` is called.

### 5. Registry Provider

```tsx
import { RegistryProvider } from "@effect-atom/atom-react";


<RegistryProvider>
  <App />
</RegistryProvider>
```

- **Required** wrapper for atom-react components
- Provides **atom registry** to component tree
- Stores and manages atom state

## Running This Example

### Installation

```bash
npm install @effect-atom/atom @effect-atom/atom-react effect
```

### File Structure

```
src/
  App.tsx        # This example
  index.tsx      # Entry point
```

### index.tsx

```tsx
import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

## Variations

### With TypeScript Types

```tsx
import { Atom } from "@effect-atom/atom-react";
type Count = number

const countAtom: Atom<Count> = Atom.make<Count>(0)
```

### With Multiple Atoms

```tsx
import { Atom, useAtom } from "@effect-atom/atom-react";
const countAtom = Atom.make(0)
const stepAtom = Atom.make(1)

function Controls() {
  const [count, setCount] = useAtom(countAtom)
  const [step, setStep] = useAtom(stepAtom)
  
  return (
    <>
      <button onClick={() => setCount(count + step)}>
        Increment by {step}
      </button>
      <input 
        type="number" 
        value={step} 
        onChange={(e) => setStep(Number(e.target.value))}
      />
    </>
  )
}
```

### With Derived State

```tsx
import { Effect } from "effect"
import { Atom, useAtomValue } from "@effect-atom/atom-react";
const countAtom = Atom.make(0)

// Derived atom using Effect
const doubleAtom = Atom.fn(
  Effect.gen(function* () {
    const count = yield* Atom.get(countAtom)
    return count * 2
  })
)

function DisplayDouble() {
  const doubled = useAtomValue(doubleAtom)
  return <div>Doubled: {doubled}</div>
}
```

### With Functional Updates

```tsx
import { useAtom } from "@effect-atom/atom-react";
function Controls() {
  const [count, setCount] = useAtom(countAtom)
  
  return (
    <>
      {/* Functional update - safer for closures */}
      <button onClick={() => setCount((prev) => prev + 1)}>
        Increment
      </button>
      
      {/* Direct value update */}
      <button onClick={() => setCount(0)}>
        Reset
      </button>
    </>
  )
}
```

## Architecture Patterns

### Separation of Concerns

```tsx
import { useAtom } from "@effect-atom/atom-react";
// ✅ Good: Separate display from controls
function App() {
  return (
    <>
      <CountDisplay />  {/* Read-only */}
      <CountControls /> {/* Write-only or read-write */}
    </>
  )
}

// ❌ Less ideal: Everything in one component
function App() {
  const [count, setCount] = useAtom(countAtom)
  return (
    <div>
      <div>{count}</div>
      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  )
}
```

### Performance Optimization

```tsx
// If a component only updates, use useAtomSet (no re-renders)
import { useAtomSet } from "@effect-atom/atom-react"

function IncrementButton() {
  const setCount = useAtomSet(countAtom)
  
  return (
    <button onClick={() => setCount((n) => n + 1)}>
      Increment
    </button>
  )
}
```

## Common Patterns

### Multiple Atoms for Complex State

```tsx
import { Atom, useAtom } from "@effect-atom/atom-react";
const nameAtom = Atom.make("")
const emailAtom = Atom.make("")
const ageAtom = Atom.make(0)

function UserForm() {
  const [name, setName] = useAtom(nameAtom)
  const [email, setEmail] = useAtom(emailAtom)
  const [age, setAge] = useAtom(ageAtom)
  
  const handleSubmit = () => {
    console.log({ name, email, age })
  }
  
  return <form>{/* inputs */}</form>
}
```

### Shared State Across Components

```tsx
// Component tree:
// App
//   ├─ Header (displays count)
//   ├─ Sidebar (displays count)
//   └─ Main (updates count)
//
// All three components stay synchronized automatically
import { Atom, useAtomValue, useAtom, RegistryProvider } from "@effect-atom/atom-react";
const countAtom = Atom.make(0)

function Header() {
  const count = useAtomValue(countAtom)
  return <header>Count: {count}</header>
}

function Sidebar() {
  const count = useAtomValue(countAtom)
  return <aside>Total: {count}</aside>
}

function Main() {
  const [count, setCount] = useAtom(countAtom)
  return (
    <main>
      <button onClick={() => setCount(count + 1)}>+</button>
    </main>
  )
}

function App() {
  return (
    <RegistryProvider>
      <Header />
      <Sidebar />
      <Main />
    </RegistryProvider>
  )
}
```

## Next Steps

After mastering this basic example:
1. See `effect://example/atom-react/derived` - Derived atoms with computed values
2. See `effect://example/atom-react/effectful` - Async atoms with Effect services
3. See `effect://example/atom-react/optimistic` - Optimistic updates pattern
4. See `effect://guide/atom-react/testing` - Testing atom-react components

## See Also

- `useAtomValue` - Hook reference
- `useAtom` - Hook reference
- `Atom.make` - Creating atoms
- `RegistryProvider` - Registry context
    