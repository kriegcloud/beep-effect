# effect/unstable/cluster/ClusterError Surface

Total exports: 7

| Export | Kind | Overview |
|---|---|---|
| `AlreadyProcessingMessage` | `class` | Represents an error that occurs when the entity is already processing a request. |
| `EntityNotAssignedToRunner` | `class` | Represents an error that occurs when a Runner receives a message for an entity that it is not assigned to it. |
| `MailboxFull` | `class` | Represents an error that occurs when the entities mailbox is full. |
| `MalformedMessage` | `class` | Represents an error that occurs when a message fails to be properly deserialized by an entity. |
| `PersistenceError` | `class` | Represents an error that occurs when a message fails to be persisted into cluster's mailbox storage. |
| `RunnerNotRegistered` | `class` | Represents an error that occurs when a Runner is not registered with the shard manager. |
| `RunnerUnavailable` | `class` | Represents an error that occurs when a Runner is unresponsive. |
