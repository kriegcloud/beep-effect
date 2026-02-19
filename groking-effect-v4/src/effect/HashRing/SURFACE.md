# effect/HashRing Surface

Total exports: 9

| Export | Kind | Overview |
|---|---|---|
| `add` | `const` | Add a new node to the ring. If the node already exists in the ring, it will be updated. For example, you can use this to update the node's weight. |
| `addMany` | `const` | Add new nodes to the ring. If a node already exists in the ring, it will be updated. For example, you can use this to update the node's weight. |
| `get` | `const` | Gets the node which should handle the given input. Returns undefined if the hashring has no elements with weight. |
| `getShards` | `const` | Distributes `count` shards across the nodes in the ring, attempting to balance the number of shards allocated to each node. Returns undefined if the hashring has no elements wit... |
| `has` | `const` | No summary found in JSDoc. |
| `HashRing` | `interface` | No summary found in JSDoc. |
| `isHashRing` | `const` | No summary found in JSDoc. |
| `make` | `const` | No summary found in JSDoc. |
| `remove` | `const` | Removes the node from the ring. No-op's if the node does not exist. |
