This readme contains references to resources that will assist and guide our effort to migrate the beep-effect repository to 
effect v4. 

The beep-effect repository is cloned as a git subtree in .repos/beep-effect

The effect v4 source code exists in .repos/effect-smol. the effect-smol repo contains a MIGRATION.md file which includes
instructions for migrating effect v3 to v4 .repos/effect-smol/MIGRATION.md.

Our migration journey will begin by creating a few packages in `./tooling`. These packages will contain scripts, utilities and modules which will 
assist us in the migration process. The first package we will create is `@beep/repo-utils`. Each of these packages will use effect v4.
Our goal is to both learn effect v4 and create tools which will assist us in the migration process.

Before we begin. We need to compile as many effect v4 resources as we can. This will include the following:
- Full youtube transcript of [Introducing Effect v4 beta 🚀 (Office Hours 17)](https://www.youtube.com/watch?v=P04R7lUR4Cc&t=90s)
- An inventory of all effect v4 packages
- An inventory of all effect v4 modules in all effect v4 packages
- An invenotry of every exported, function, class, type, interface etc in every effect v4 module of every effect v4 package.
- A copy of the effect v4 migration guides

The resources will be stored in `./specs/effect-v4-migration/resources/`. This is how the folder structure will look.

```
.
└── specs/effect-v4-migration/resources/
    ├── README.md // will contain a surface map of the resources we've compiled
    ├── migration-guides
    ├── transcripts
    └── packages/
        └── effect/
            ├── Array/
            │   ├── export/  // contains a .md file for every export in the module with a `.<export-kind>.md` postfix.
            │   │   ├── ReadonlyArrayTypeLambda.interface.md
            │   │   ├── NonEmptyReadonlyArray.type.md
            │   │   ├── make.const.md
            │   │   └── allocate.const.md
            │   ├── README.md  // A description of the module
            │   └── SURFACE.md // A list of all exports in the module
            ├── BigDecimal
            ├── BigInt
            ├── Boolean
            ├── Brand
            ├── Cache
            ├── Cause
            ├── Channel
            ├── ChannelSchema
            ├── Chunk
            ├── Clock
            ├── Combiner
            ├── Config
            ├── ConfigProvider
            ├── Console
            ├── Cron
            ├── Data
            ├── DateTime
            ├── Deferred
            ├── Differ
            ├── Duration
            ├── Effect
            ├── Equal
            ├── Equivalence
            ├── ExecutionPlan
            ├── Exit
            ├── Fiber
            ├── FiberHandle
            ├── FiberMap
            ├── FiberSet
            ├── FileSystem
            ├── Filter
            ├── Formatter
            ├── Function
            ├── Graph
            ├── Hash
            ├── HashMap
            ├── HashSet
            ├── HKT
            ├── Inspectable
            ├── Iterable
            ├── JsonPatch
            ├── JsonPointer
            ├── JsonSchema
            ├── Layer
            ├── LayerMap
            ├── Logger
            ├── LogLevel
            ├── ManagedRuntime
            ├── Match
            ├── Metric
            ├── MutableHashMap
            ├── MutableHashSet
            ├── MutableList
            ├── MutableRef
            ├── NonEmptyIterable
            ├── NullOr
            ├── Number
            ├── Optic
            ├── Option
            ├── Order
            ├── Ordering
            ├── PartitionedSemaphore
            ├── Path
            ├── Pipeable
            ├── PlatformError
            ├── Pool
            ├── Predicate
            ├── PrimaryKey
            ├── PubSub
            ├── Pull
            ├── Queue
            ├── Random
            ├── RcMap
            ├── RcRef
            ├── Record
            ├── Redactable
            ├── Redacted
            ├── Reducer
            ├── Ref
            ├── Reference
            ├── RegExp
            ├── Request
            ├── RequestResolver
            ├── Resource
            ├── Result
            ├── Runtime
            ├── Schedule
            ├── Scheduler
            ├── Schema
            ├── SchemaAST
            ├── SchemaGetter
            ├── SchemaIssue
            ├── SchemaParser
            ├── SchemaRepresentation
            ├── SchemaTransformation
            ├── SchemaUtils
            ├── Scope
            ├── ScopedCache
            ├── ScopedRef
            ├── ServiceMap
            ├── Sink
            ├── Stdio
            ├── Stream
            ├── String
            ├── Struct
            ├── SubscriptionRef
            ├── Symbol
            ├── SynchronizedRef
            ├── Take
            ├── Terminal
            ├── Tracer
            ├── Trie
            ├── Tuple
            ├── TxChunk
            ├── TxHashMap
            ├── TxHashSet
            ├── TxQueue
            ├── TxRef
            ├── TxSemaphore
            ├── Types
            ├── UndefinedOr
            ├── Unify
            └── Utils
```

Requirements:
 - A folder for every effect v4 package.
 - Each package folder contains a README.md & a SURFACE.md file
 - Each package folder contains a folder for each module in the package where the name of the folder is the same as that of the module in `./repos/effect-smol`
 - Each module folder contains a README.md & as SURFACE.md file and a `exports` folder.
 - Each module folder's exports folder has an `<export-name>.<export-kind>.md` file


