# effect/PubSub Surface

Total exports: 31

| Export | Kind | Overview |
|---|---|---|
| `awaitShutdown` | `const` | Waits until the queue is shutdown. The `Effect` returned by this method will not resume until the queue has been shutdown. If the queue is already shutdown, the `Effect` will re... |
| `BackPressureStrategy` | `class` | A strategy that applies back pressure to publishers when the `PubSub` is at capacity. This guarantees that all subscribers will receive all messages published to the `PubSub` wh... |
| `bounded` | `const` | Creates a bounded PubSub with backpressure strategy. |
| `capacity` | `const` | Returns the number of elements the queue can hold. |
| `dropping` | `const` | Creates a bounded `PubSub` with the dropping strategy. The `PubSub` will drop new messages if the `PubSub` is at capacity. |
| `DroppingStrategy` | `class` | A strategy that drops new messages when the `PubSub` is at capacity. This guarantees that a slow subscriber will not slow down the rate at which messages are published. However,... |
| `isEmpty` | `const` | Returns `true` if the `Pubsub` contains zero elements, `false` otherwise. |
| `isFull` | `const` | Returns `true` if the `PubSub` contains at least one element, `false` otherwise. |
| `isShutdown` | `const` | Returns `true` if `shutdown` has been called, otherwise returns `false`. |
| `isShutdownUnsafe` | `const` | Returns `true` if `shutdown` has been called, otherwise returns `false`. |
| `make` | `const` | Creates a PubSub with a custom atomic implementation and strategy. |
| `makeAtomicBounded` | `const` | Creates a bounded atomic PubSub implementation with optional replay buffer. |
| `makeAtomicUnbounded` | `const` | Creates an unbounded atomic PubSub implementation with optional replay buffer. |
| `publish` | `const` | Publishes a message to the `PubSub`, returning whether the message was published to the `PubSub`. |
| `publishAll` | `const` | Publishes all of the specified messages to the `PubSub`, returning whether they were published to the `PubSub`. |
| `publishUnsafe` | `const` | Publishes a message to the `PubSub`, returning whether the message was published to the `PubSub`. |
| `PubSub` | `interface` | A `PubSub<A>` is an asynchronous message hub into which publishers can publish messages of type `A` and subscribers can subscribe to take messages of type `A`. |
| `remaining` | `const` | Returns the number of messages currently available in the subscription. |
| `remainingUnsafe` | `const` | Returns the number of messages currently available in the subscription. |
| `shutdown` | `const` | Interrupts any fibers that are suspended on `offer` or `take`. Future calls to `offer*` and `take*` will be interrupted immediately. |
| `size` | `const` | Retrieves the size of the queue, which is equal to the number of elements in the queue. This may be negative if fibers are suspended waiting for elements to be added to the queue. |
| `sizeUnsafe` | `const` | Retrieves the size of the queue, which is equal to the number of elements in the queue. This may be negative if fibers are suspended waiting for elements to be added to the queue. |
| `sliding` | `const` | Creates a bounded `PubSub` with the sliding strategy. The `PubSub` will add new messages and drop old messages if the `PubSub` is at capacity. |
| `SlidingStrategy` | `class` | A strategy that adds new messages and drops old messages when the `PubSub` is at capacity. This guarantees that a slow subscriber will not slow down the rate at which messages a... |
| `subscribe` | `const` | Subscribes to receive messages from the `PubSub`. The resulting subscription can be evaluated multiple times within the scope to take a message from the `PubSub` each time. |
| `Subscription` | `interface` | A subscription represents a consumer's connection to a PubSub, allowing them to take messages. |
| `take` | `const` | Takes a single message from the subscription. If no messages are available, this will suspend until a message becomes available. |
| `takeAll` | `const` | Takes all available messages from the subscription, suspending if no items are available. |
| `takeBetween` | `const` | Takes between the specified minimum and maximum number of messages from the subscription. Will suspend if the minimum number is not immediately available. |
| `takeUpTo` | `const` | Takes up to the specified number of messages from the subscription without suspending. |
| `unbounded` | `const` | Creates an unbounded `PubSub`. |
