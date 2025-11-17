
# Derived Atoms Example

Compute derived state using Effect.gen for automatic recomputation.

## Complete Example - Todo Filtering

```tsx
import {
  Atom,
  useAtomValue,
  // useAtomSet,
  // RegistryProvider,
  Result,
  useAtom,
  // useAtomInitialValues,
  // useAtomMount,
  // useAtomRef,
  // useAtomRefProp,
  // useAtomRefPropValue,
  // useAtomRefresh,
  // useAtomSubscribe,
  // useAtomSuspense,
  // Hydration,
  // scheduleTask,
  // AtomHttpApi,
  // AtomRef,
  // AtomRpc,
} from "@effect-atom/atom-react";
import {Effect} from "effect";
import React from "react";
import Checkbox from "@mui/material/Checkbox";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Typography from "@mui/material/Typography";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Match from "effect/Match";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
interface Todo {
  readonly id: number;
  readonly text: string;
  readonly completed: boolean;
}

// Base atoms
const todosAtom = Atom.make<Array<Todo>>(A.make(
  {id: 1, text: "Learn Effect", completed: true},
  {id: 2, text: "Learn atom-react", completed: false},
  {id: 3, text: "Build app", completed: false},
));

const filterAtom = Atom.make<"all" | "active" | "completed">("all" as const);

// Derived atom using Effect
const filteredTodosAtom = Atom.fn(
  Effect.fnUntraced(function* () {
    const todos = yield* Atom.get(todosAtom);
    const filter = yield* Atom.get(filterAtom);

    return Match.value(filter).pipe(
      Match.when("active", () => A.filter(todos, (t) => !t.completed)),
      Match.when("completed", () => A.filter(todos, (t) => t.completed)),
      Match.orElse(() => todos)
    );
  })
);

// Another derived atom - count stats
const statsAtom = Atom.fn(
  Effect.fnUntraced(function* () {
    const todos = yield* Atom.get(todosAtom);

    return {
      total: todos.length,
      active: todos.filter((t) => !t.completed).length,
      completed: todos.filter((t) => t.completed).length,
    };
  })
);

function TodoList() {
  const todos = useAtomValue(filteredTodosAtom);

  return (
    <>
      {Result.match(todos, {
        onInitial: () => <Typography>Initial State</Typography>,
        onFailure: () => <Typography>Failure State</Typography>,
        onSuccess: (result) => (
          <List>
            {
              A.map(result.value, (todo, index) => (
                <TodoItem key={`${todo.id}-${index}`} todo={todo}/>
              ))
            }
          </List>
        )
      })}
    </>
  );
}

function TodoItem({todo}: { todo: Todo }) {
  const [todos, setTodos] = useAtom(todosAtom);

  const toggleComplete = () => {
    setTodos(
      A.map(todos, (t) => t.id === todo.id ? {...t, completed: !t.completed} : t)
    );
  };

  return (
    <ListItem>
      <Checkbox checked={todo.completed} onChange={() => toggleComplete()}/>
      <Typography variant={"body1"} sx={{textDecoration: todo.completed ? "line-through" : "none"}}>
        {todo.text}
      </Typography>
    </ListItem>
  );
}

function FilterControls() {
  const [filter, setFilter] = useAtom(filterAtom);

  return (
   <CardActions>
      <Button
        onClick={() => setFilter("all")}
        sx={{fontWeight: filter === "all" ? "bold" : "normal"}}
      >
        All
      </Button>
      <Button
        onClick={() => setFilter("active")}
        sx={{fontWeight: filter === "active" ? "bold" : "normal"}}
      >
        Active
      </Button>
      <Button
        onClick={() => setFilter("completed")}
        sx={{fontWeight: filter === "completed" ? "bold" : "normal"}}
      >
        Completed
      </Button>
    </CardActions>
  );
}

function Stats() {
  const stats = useAtomValue(statsAtom);

  return (
    <>
      {Result.match(stats, {
        onInitial: () => <Typography>Initial State.</Typography>,
        onFailure: () => <Typography>Failure State.</Typography>,
        onSuccess: (result) => {
          const value = result.value;
          return (
            <Box>
              <Typography>
                <Typography>Total: {value.total}</Typography>
                <Typography>Active: {value.active}</Typography>
                <Typography>Completed: {value.completed}</Typography>
              </Typography>
            </Box>
          );
        }
      })}
    </>
  );
}

function App() {
  return (
    <Box sx={{width: "100%", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center"}}>
      <Card>
        <CardHeader title="Todo App with Derived Atoms"/>
        <CardContent>
          <Stats/>
          <TodoList/>
        </CardContent>
        <FilterControls/>
      </Card>
    </Box>
  );
}

export default App;
```

## Key Concepts Demonstrated

### 1. Derived Atoms with Atom.fn

```tsx
import { Atom } from "@effect-atom/atom-react";
const filteredTodosAtom = Atom.fn(
  Effect.gen(function* () {
    const todos = yield* Atom.get(todosAtom)
    const filter = yield* Atom.get(filterAtom)
    
    // Compute derived value
    return todos.filter(/* ... */)
  })
)
```

- **Atom.fn** creates a derived atom from an Effect
- **Atom.get** reads other atoms inside the Effect
- **Automatic recomputation** when dependencies change
- **Pure computation** - no side effects

### 2. Multiple Dependencies

```tsx
import { Atom } from "@effect-atom/atom-react";
const filteredTodosAtom = Atom.fn(
  Effect.gen(function* () {
    const todos = yield* Atom.get(todosAtom)     // Dependency 1
    const filter = yield* Atom.get(filterAtom)   // Dependency 2
    
    // Recomputes when EITHER dependency changes
    return computeFiltered(todos, filter)
  })
)
```

The derived atom automatically tracks all dependencies and recomputes only when needed.

### 3. Computed Statistics

```tsx
import { Atom } from "@effect-atom/atom-react";
const statsAtom = Atom.fn(
  Effect.gen(function* () {
    const todos = yield* Atom.get(todosAtom)
    
    return {
      total: todos.length,
      active: todos.filter((t) => !t.completed).length,
      completed: todos.filter((t) => t.completed).length,
    }
  })
)
```

- **Single source of truth**: `todosAtom`
- **Multiple derived values**: stats computed from base atom
- **Efficient**: Only recomputes when `todosAtom` changes

### 4. No Manual Subscriptions Needed

```tsx
import { Atom, useAtomValue } from "@effect-atom/atom-react";
// ❌ Manual subscription approach (don't do this)
const [filteredTodos, setFilteredTodos] = React.useState([])

React.useEffect(() => {
  const todos = getTodos()
  const filter = getFilter()
  setFilteredTodos(todos.filter(/* ... */))
}, [todos, filter])

// ✅ Derived atom approach (automatic)
const filteredTodosAtom = Atom.fn(/* Effect.gen */)
const filtered = useAtomValue(filteredTodosAtom)
```

## More Examples

### Shopping Cart Total

```tsx
import { Atom, useAtomValue } from "@effect-atom/atom-react";
interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
}

const cartAtom = Atom.make<Array<CartItem>>([])

const cartTotalAtom = Atom.fn(
  Effect.fnUntraced(function* () {
    const items = yield* Atom.get(cartAtom)
    
    return items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    )
  })
)

function CartTotal() {
  const total = useAtomValue(cartTotalAtom)
  
  return (
    <div>
      <h3>Total: ${total.toFixed(2)}</h3>
    </div>
  )
}
```

### Form Validation

```tsx
import { Atom, useAtomValue } from "@effect-atom/atom-react";
const emailAtom = Atom.make("")
const passwordAtom = Atom.make("")

const isValidAtom = Atom.fn(
  Effect.fnUntracted(function* () {
    const email = yield* Atom.get(emailAtom)
    const password = yield* Atom.get(passwordAtom)
    
    const emailValid = email.includes("@")
    const passwordValid = password.length >= 8
    
    return {
      isValid: emailValid && passwordValid,
      errors: {
        email: emailValid ? null : "Invalid email",
        password: passwordValid ? null : "Password too short",
      },
    }
  })
)

function SubmitButton() {
  const validation = useAtomValue(isValidAtom)
  
  return (
    <button disabled={!validation.isValid}>
      Submit
    </button>
  )
}
```

### Search Results

```tsx
import { Atom, useAtomValue } from "@effect-atom/atom-react";
import * as A from "effect/Array";
import * as Str from "effect/String";
const itemsAtom = Atom.make<Array<Item>>([/* items */])
const searchQueryAtom = Atom.make("")

const searchResultsAtom = Atom.fn(
  Effect.fnUntraced(function* () {
    const items = yield* Atom.get(itemsAtom)
    const query = yield* Atom.get(searchQueryAtom)
    
    if (!query) return items
    
    const lowerQuery = Str.toLowerCase(query)
    return A.filter(items, (item) =>
      Str.toLowerCase(item.name).includes(lowerQuery) ||
      Str.toLowerCase(item.description).includes(lowerQuery)
    )
  })
)

function SearchResults() {
  const results = useAtomValue(searchResultsAtom)
  
  return (
    <div>
      <p>Found {results.length} results</p>
      {A.map(results, (item) => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  )
}
```

### Chained Derived Atoms

```tsx
import { Atom, useAtomValue } from "@effect-atom/atom-react";
import * as A from "effect/Array";
const numbersAtom = Atom.make([1, 2, 3, 4, 5])

// First level: squared values
const squaredAtom = Atom.fn(
  Effect.gen(function* () {
    const numbers = yield* Atom.get(numbersAtom)
    return A.map(numbers, (n) => n * n)
  })
)

// Second level: sum of squared values
const sumOfSquaresAtom = Atom.fn(
  Effect.gen(function* () {
    const squared = yield* Atom.get(squaredAtom)
    return A.reduce(squared, 0, (sum, n) => sum + n)
  })
)

function Results() {
  const numbers = useAtomValue(numbersAtom)
  const squared = useAtomValue(squaredAtom)
  const sum = useAtomValue(sumOfSquaresAtom)
  
  return (
    <div>
      <p>Numbers: {A.join(", ")(numbers)}</p>
      <p>Squared: {A.join(", ")(squared)}</p>
      <p>Sum of squares: {sum}</p>
    </div>
  )
}
```

## Performance Characteristics

### Automatic Memoization

```tsx
import { Atom, useAtomValue } from "@effect-atom/atom-react";
const expensiveAtom = Atom.fn(
  Effect.gen(function* () {
    const data = yield* Atom.get(dataAtom)
    
    // This expensive computation only runs when dataAtom changes
    return expensiveComputation(data)
  })
)
```

- Derived atoms **cache** their computed value
- Recomputation only happens when **dependencies change**
- Multiple components can subscribe without redundant computation

### Dependency Tracking

```tsx
import { Atom, useAtomValue } from "@effect-atom/atom-react";
const derivedAtom = Atom.fn(
  Effect.gen(function* () {
    const a = yield* Atom.get(atomA)
    const b = yield* Atom.get(atomB)
    
    // Automatically recomputes when atomA OR atomB changes
    // Does NOT recompute when atomC changes (not a dependency)
    return a + b
  })
)
```

## Best Practices

### 1. Keep Derived Atoms Pure

```tsx
// ✅ Good: Pure computation
const doubleAtom = Atom.fn(
  Effect.gen(function* () {
    const count = yield* Atom.get(countAtom)
    return count * 2
  })
)

// ❌ Bad: Side effects in derived atom
const badAtom = Atom.fn(
  Effect.gen(function* () {
    const count = yield* Atom.get(countAtom)
    console.log("Count:", count) // Side effect!
    return count * 2
  })
)
```

### 2. Use Appropriate Granularity

```tsx
// ✅ Good: One derived atom per concept
const activeCountAtom = Atom.fn(/* compute active count */)
const completedCountAtom = Atom.fn(/* compute completed count */)

// ❌ Less ideal: One giant derived atom
const allStatsAtom = Atom.fn(/* compute everything at once */)
```

### 3. Avoid Circular Dependencies

```tsx
import { Atom, useAtomValue } from "@effect-atom/atom-react";
// ❌ Circular dependency (will cause issues)
const atomA = Atom.fn(
  Effect.gen(function* () {
    const b = yield* Atom.get(atomB) // Depends on B
    return b + 1
  })
)

const atomB = Atom.fn(
  Effect.gen(function* () {
    const a = yield* Atom.get(atomA) // Depends on A - CIRCULAR!
    return a + 1
  })
)
```

## When to Use Derived Atoms

**Use when**:
- Computing values from other atoms
- Filtering, mapping, or reducing data
- Validation or form state computation
- Complex calculations that should be memoized

**Don't use when**:
- Fetching data from APIs (use effectful atoms instead)
- Performing side effects (use `useAtomSubscribe`)
- Value doesn't depend on other atoms (use regular state)

## See Also

- `Atom.fn` - Creating derived atoms
- `Atom.get` - Reading atoms inside Effects
- `useAtomValue` - Subscribing to derived atoms
- `effect://example/atom-react/effectful` - Async atoms with services
    