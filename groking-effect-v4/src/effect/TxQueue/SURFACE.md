# effect/TxQueue Surface

Total exports: 34

| Export | Kind | Overview |
|---|---|---|
| `awaitCompletion` | `const` | Waits for the queue to complete (either successfully or with failure). |
| `bounded` | `const` | Creates a new bounded `TxQueue` with the specified capacity. |
| `clear` | `const` | Clears all elements from the queue without affecting its state. Returns the cleared elements, or an empty array if the queue is done with Done or interrupt. |
| `dropping` | `const` | Creates a new dropping `TxQueue` with the specified capacity that drops new items when full. |
| `end` | `const` | Ends a queue by signaling completion with a Done error. |
| `fail` | `const` | Fails the queue with the specified error. |
| `failCause` | `const` | Completes the queue with the specified exit value. |
| `interrupt` | `const` | Interrupts the queue, transitioning it to a closing state. |
| `isClosing` | `const` | Checks if the queue is in the closing state. |
| `isDone` | `const` | Checks if the queue is done (completed or failed). |
| `isEmpty` | `const` | Checks if the queue is empty. |
| `isFull` | `const` | Checks if the queue is at capacity. |
| `isOpen` | `const` | Checks if the queue is in the open state. |
| `isShutdown` | `const` | Checks if the queue is shutdown (legacy compatibility). |
| `isTxDequeue` | `const` | Checks if the given value is a TxDequeue. |
| `isTxEnqueue` | `const` | Checks if the given value is a TxEnqueue. |
| `isTxQueue` | `const` | Checks if the given value is a TxQueue. |
| `offer` | `const` | Offers an item to the queue. |
| `offerAll` | `const` | Offers multiple items to the queue. |
| `peek` | `const` | Views the next item without removing it. If the queue is in a failed state, the error is propagated through the E-channel. |
| `poll` | `const` | Tries to take an item from the queue without blocking. |
| `shutdown` | `const` | Shuts down the queue immediately by clearing all items and interrupting it (legacy compatibility). |
| `size` | `const` | Gets the current size of the queue. |
| `sliding` | `const` | Creates a new sliding `TxQueue` with the specified capacity that evicts old items when full. |
| `State` | `type` | Represents the state of a transactional queue with sophisticated lifecycle management. |
| `take` | `const` | Takes an item from the queue. |
| `takeAll` | `const` | Takes all items from the queue. Blocks if the queue is empty. |
| `takeBetween` | `const` | Takes a variable number of items between a specified minimum and maximum from the queue. Waits for at least the minimum number of items to be available. |
| `takeN` | `const` | Takes exactly N items from the queue in a single atomic transaction. |
| `TxDequeue` | `namespace` | Namespace containing type definitions for TxDequeue variance annotations. |
| `TxEnqueue` | `namespace` | Namespace containing type definitions for TxEnqueue variance annotations. |
| `TxQueue` | `namespace` | Namespace containing type definitions for TxQueue variance annotations. |
| `TxQueueState` | `interface` | Represents the shared state of a transactional queue that can be inspected. This interface contains the core properties needed for queue state inspection operations like size, c... |
| `unbounded` | `const` | Creates a new unbounded `TxQueue` with unlimited capacity. |
