# effect/Queue Surface

Total exports: 39

| Export | Kind | Overview |
|---|---|---|
| `asDequeue` | `const` | Convert a Queue to a Dequeue, allowing only read operations. |
| `asEnqueue` | `const` | Converts a Queue to an Enqueue (write-only interface). |
| `await` | `const` | No summary found in JSDoc. |
| `bounded` | `const` | Creates a bounded queue with the specified capacity that uses backpressure strategy. |
| `clear` | `const` | Take all messages from the queue, returning an empty array if the queue is empty or done. |
| `collect` | `const` | Take all messages from the queue, until the queue has errored or is done. |
| `Dequeue` | `interface` | A `Dequeue` is a queue that can be taken from. |
| `dropping` | `const` | Creates a bounded queue with dropping strategy. When the queue reaches capacity, new elements are dropped and the offer operation returns false. |
| `end` | `const` | Signal that the queue is complete. If the queue is already done, `false` is returned. |
| `endUnsafe` | `const` | Signal that the queue is complete synchronously. If the queue is already done, `false` is returned. |
| `Enqueue` | `interface` | An `Enqueue` is a queue that can be offered to. |
| `fail` | `const` | Fail the queue with an error. If the queue is already done, `false` is returned. |
| `failCause` | `const` | Fail the queue with a cause. If the queue is already done, `false` is returned. |
| `failCauseUnsafe` | `const` | Fail the queue with a cause synchronously. If the queue is already done, `false` is returned. |
| `interrupt` | `const` | Interrupts the queue gracefully, transitioning it to a closing state. |
| `into` | `const` | Run an `Effect` into a `Queue`, where success ends the queue and failure fails the queue. |
| `isDequeue` | `const` | Type guard to check if a value is a Dequeue. |
| `isEnqueue` | `const` | Type guard to check if a value is an Enqueue. |
| `isFull` | `const` | Check if the queue is full. |
| `isFullUnsafe` | `const` | Check if the queue is full synchronously. |
| `isQueue` | `const` | Type guard to check if a value is a Queue. |
| `make` | `const` | A `Queue` is an asynchronous queue that can be offered to and taken from. |
| `offer` | `const` | Add a message to the queue. Returns `false` if the queue is done. |
| `offerAll` | `const` | Add multiple messages to the queue. Returns the remaining messages that were not added. |
| `offerAllUnsafe` | `const` | Add multiple messages to the queue synchronously. Returns the remaining messages that were not added. |
| `offerUnsafe` | `const` | Add a message to the queue synchronously. Returns `false` if the queue is done. |
| `peek` | `const` | Views the next item without removing it. |
| `poll` | `const` | Tries to take an item from the queue without blocking. |
| `Queue` | `interface` | A `Queue` is an asynchronous queue that can be offered to and taken from. |
| `shutdown` | `const` | Shutdown the queue, canceling any pending operations. If the queue is already done, `false` is returned. |
| `size` | `const` | Check the size of the queue. |
| `sizeUnsafe` | `const` | Check the size of the queue synchronously. |
| `sliding` | `const` | Creates a bounded queue with sliding strategy. When the queue reaches capacity, new elements are added and the oldest elements are dropped. |
| `take` | `const` | Take a single message from the queue, or wait for a message to be available. |
| `takeAll` | `const` | Take all messages from the queue, or wait for messages to be available. |
| `takeBetween` | `const` | Take a variable number of messages from the queue, between specified min and max. It will only take up to the capacity of the queue. |
| `takeN` | `const` | Take a specified number of messages from the queue. It will only take up to the capacity of the queue. |
| `takeUnsafe` | `const` | Take a single message from the queue synchronously, or wait for a message to be available. |
| `unbounded` | `const` | Creates an unbounded queue that can grow to any size without blocking producers. |
