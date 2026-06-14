---
title: SqlTest.ts
nav_order: 4
parent: "@beep/test-utils"
---

## SqlTest.ts overview

SQL integration-test harness helpers.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [makePgliteSqlTestLayer](#makepglitesqltestlayer)
  - [makePgliteTestcontainerResource](#makepglitetestcontainerresource)
  - [makeSqlTestLayer](#makesqltestlayer)
- [error-handling](#error-handling)
  - [SqlTestHarnessError (class)](#sqltestharnesserror-class)
- [models](#models)
  - [PgExternalTestDriverConfig (class)](#pgexternaltestdriverconfig-class)
  - [PgExternalTestDriverConfigInput (type alias)](#pgexternaltestdriverconfiginput-type-alias)
  - [PgliteSqlTestLayerMode (type alias)](#pglitesqltestlayermode-type-alias)
  - [PgliteSqlTestLayerOptions (interface)](#pglitesqltestlayeroptions-interface)
  - [PgliteTestcontainerResource (interface)](#pglitetestcontainerresource-interface)
  - [PgliteTestcontainersTestDriverConfig (class)](#pglitetestcontainerstestdriverconfig-class)
  - [PgliteTestcontainersTestDriverConfigInput (type alias)](#pglitetestcontainerstestdriverconfiginput-type-alias)
  - [SqlTestDriver (interface)](#sqltestdriver-interface)
  - [SqlTestHooks (interface)](#sqltesthooks-interface)
  - [TestDatabaseInfoShape (class)](#testdatabaseinfoshape-class)
- [testing](#testing)
  - [BunSqliteTestDriver](#bunsqlitetestdriver)
  - [NodeSqliteTestDriver](#nodesqlitetestdriver)
  - [PgExternalTestDriver](#pgexternaltestdriver)
  - [PgliteTestcontainersTestDriver](#pglitetestcontainerstestdriver)
  - [TestDatabaseInfo (class)](#testdatabaseinfo-class)
---

# constructors

## makePgliteSqlTestLayer

Build the recommended PGLite SQL test layer for vertical-slice integration tests.

In `auto` mode, `BEEP_TEST_DATABASE_URL` selects the cheap shared external
PostgreSQL driver. Without that environment variable, the helper falls back
to the scoped PGLite Testcontainers driver.

**Example**

```ts
import { makePgliteSqlTestLayer } from "@beep/test-utils"
const layer = makePgliteSqlTestLayer()
console.log(layer)
```

**Signature**

```ts
declare const makePgliteSqlTestLayer: <MigrateError = never, SeedError = never>(options?: PgliteSqlTestLayerOptions<MigrateError, SeedError>) => Layer.Layer<PgClient.PgClient | SqlClient.SqlClient | TestDatabaseInfo, SqlTestHarnessError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/test-kit/test-utils/src/SqlTest.ts#L1131)

Since v0.0.0

## makePgliteTestcontainerResource

Start a scoped PGLite Testcontainers PostgreSQL wire-protocol resource.

**Example**

```ts
import { makePgliteTestcontainerResource } from "@beep/test-utils"
import { Effect } from "effect"
const program = Effect.scoped(makePgliteTestcontainerResource())
console.log(program)
```

**Signature**

```ts
declare const makePgliteTestcontainerResource: (configInput?: PgliteTestcontainersTestDriverConfigInput) => Effect.Effect<{ config: PgliteTestcontainersTestDriverConfig; connectionUri: string; container: StartedTestContainer; host: string; port: number; }, SqlTestHarnessError, Scope>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/test-kit/test-utils/src/SqlTest.ts#L704)

Since v0.0.0

## makeSqlTestLayer

Build a fresh, scoped SQL integration-test layer for a concrete driver.

**Example**

```ts
import { makeSqlTestLayer, NodeSqliteTestDriver } from "@beep/test-utils"
const layer = makeSqlTestLayer({
  config: undefined,
  driver: NodeSqliteTestDriver
})
console.log(layer)
```

**Signature**

```ts
declare const makeSqlTestLayer: <Config, Services, SqlService extends Services, MigrateError = never, SeedError = never>(options: { readonly config: Config; readonly driver: SqlTestDriver<Config, Services, SqlService>; readonly hooks?: SqlTestHooks<MigrateError, SeedError>; }) => Layer.Layer<Services, SqlTestHarnessError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/test-kit/test-utils/src/SqlTest.ts#L533)

Since v0.0.0

# error-handling

## SqlTestHarnessError (class)

Typed harness error surfaced while provisioning or preparing a test database.

**Example**

```ts
import { SqlTestHarnessError } from "@beep/test-utils"
import * as O from "effect/Option"
const error = SqlTestHarnessError.make({
  cause: O.none(),
  driver: "node-sqlite",
  message: "setup failed",
  phase: "provision"
})
console.log(error.message)
```

**Signature**

```ts
declare class SqlTestHarnessError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/test-kit/test-utils/src/SqlTest.ts#L325)

Since v0.0.0

# models

## PgExternalTestDriverConfig (class)

Runtime configuration for an externally managed PostgreSQL-compatible SQL test driver.

**Example**

```ts
import { PgExternalTestDriverConfig } from "@beep/test-utils"
const config = PgExternalTestDriverConfig.make({
  connectionUri: "postgres://postgres:postgres@127.0.0.1:5432/postgres"
})
console.log(config.isolation)
```

**Signature**

```ts
declare class PgExternalTestDriverConfig
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/test-kit/test-utils/src/SqlTest.ts#L213)

Since v0.0.0

## PgExternalTestDriverConfigInput (type alias)

Constructor input accepted by the external PostgreSQL SQL test driver.

**Example**

```ts
import type { PgExternalTestDriverConfigInput } from "@beep/test-utils/SqlTest"

const value = {} as PgExternalTestDriverConfigInput
console.log(value)
```

**Signature**

```ts
type PgExternalTestDriverConfigInput = Partial<PgExternalTestDriverConfig> | undefined
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/test-kit/test-utils/src/SqlTest.ts#L255)

Since v0.0.0

## PgliteSqlTestLayerMode (type alias)

Mode selector for the public PGLite SQL test layer helper.

**Example**

```ts
import type { PgliteSqlTestLayerMode } from "@beep/test-utils/SqlTest"

const value = {} as PgliteSqlTestLayerMode
console.log(value)
```

**Signature**

```ts
type PgliteSqlTestLayerMode = "auto" | "external" | "testcontainers"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/test-kit/test-utils/src/SqlTest.ts#L270)

Since v0.0.0

## PgliteSqlTestLayerOptions (interface)

Options for `makePgliteSqlTestLayer`.

**Example**

```ts
import type { PgliteSqlTestLayerOptions } from "@beep/test-utils/SqlTest"
const value = {} as PgliteSqlTestLayerOptions
console.log(value)
```

**Signature**

```ts
export interface PgliteSqlTestLayerOptions<MigrateError = never, SeedError = never> {
  readonly external?: PgExternalTestDriverConfigInput;
  readonly hooks?: SqlTestHooks<MigrateError, SeedError>;
  readonly mode?: PgliteSqlTestLayerMode;
  readonly testcontainers?: PgliteTestcontainersTestDriverConfigInput;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/test-kit/test-utils/src/SqlTest.ts#L284)

Since v0.0.0

## PgliteTestcontainerResource (interface)

Scoped PGLite Testcontainers resource metadata.

**Example**

```ts
import type { PgliteTestcontainerResource } from "@beep/test-utils"
declare const resource: PgliteTestcontainerResource
console.log(resource.connectionUri)
```

**Signature**

```ts
export interface PgliteTestcontainerResource {
  readonly config: PgliteTestcontainersTestDriverConfig;
  readonly connectionUri: string;
  readonly container: StartedTestContainer;
  readonly host: string;
  readonly port: number;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/test-kit/test-utils/src/SqlTest.ts#L465)

Since v0.0.0

## PgliteTestcontainersTestDriverConfig (class)

Runtime configuration for the PGLite Testcontainers SQL test driver.

**Example**

```ts
import { PgliteTestcontainersTestDriverConfig } from "@beep/test-utils"
const config = PgliteTestcontainersTestDriverConfig.make({})
console.log(config.maxConnections)
```

**Signature**

```ts
declare class PgliteTestcontainersTestDriverConfig
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/test-kit/test-utils/src/SqlTest.ts#L150)

Since v0.0.0

## PgliteTestcontainersTestDriverConfigInput (type alias)

Constructor input accepted by the PGLite Testcontainers SQL test driver.

**Example**

```ts
import type { PgliteTestcontainersTestDriverConfigInput } from "@beep/test-utils/SqlTest"

const value = {} as PgliteTestcontainersTestDriverConfigInput
console.log(value)
```

**Signature**

```ts
type PgliteTestcontainersTestDriverConfigInput = Partial<PgliteTestcontainersTestDriverConfig> | undefined
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/test-kit/test-utils/src/SqlTest.ts#L197)

Since v0.0.0

## SqlTestDriver (interface)

Driver contract for reusable SQL integration-test layers.

**Example**

```ts
import { NodeSqliteTestDriver } from "@beep/test-utils"
import type { SqlTestDriver } from "@beep/test-utils"
type DriverName = SqlTestDriver<unknown, unknown, unknown>["name"]
const driverName: DriverName = NodeSqliteTestDriver.name
console.log(driverName)
```

**Signature**

```ts
export interface SqlTestDriver<Config, Services, SqlService extends Services> {
  readonly makeLayer: (config: Config) => Layer.Layer<Services, SqlTestHarnessError>;
  readonly name: typeof TestDatabaseDriver.Type;
  readonly sqlClient: Context.Key<SqlService, SqlClient.SqlClient>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/test-kit/test-utils/src/SqlTest.ts#L369)

Since v0.0.0

## SqlTestHooks (interface)

Optional database setup hooks executed after the driver layer has been built.

**Example**

```ts
import type { SqlTestHooks } from "@beep/test-utils"
const hooks: SqlTestHooks = {}
console.log(hooks)
```

**Signature**

```ts
export interface SqlTestHooks<MigrateError = never, SeedError = never> {
  readonly migrate?: undefined | Effect.Effect<void, MigrateError, SqlClient.SqlClient>;
  readonly seed?: undefined | Effect.Effect<void, SeedError, SqlClient.SqlClient>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/test-kit/test-utils/src/SqlTest.ts#L350)

Since v0.0.0

## TestDatabaseInfoShape (class)

Runtime metadata for an ephemeral integration-test database instance.

**Example**

```ts
import { TestDatabaseInfoShape } from "@beep/test-utils"
import * as O from "effect/Option"
const info = TestDatabaseInfoShape.make({
  connectionUri: O.none(),
  containerId: O.none(),
  database: O.none(),
  databasePath: O.some("/tmp/test.db"),
  driver: "node-sqlite",
  host: O.none(),
  port: O.none(),
  schema: O.none(),
  tempDir: O.some("/tmp"),
  username: O.none()
})
console.log(info.databasePath)
```

**Signature**

```ts
declare class TestDatabaseInfoShape
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/test-kit/test-utils/src/SqlTest.ts#L120)

Since v0.0.0

# testing

## BunSqliteTestDriver

Fresh Bun SQLite integration-test driver backed by a scoped temp directory.

**Example**

```ts
import { BunSqliteTestDriver } from "@beep/test-utils"
const driverName = BunSqliteTestDriver.name
console.log(driverName)
```

**Signature**

```ts
declare const BunSqliteTestDriver: SqlTestDriver<void, SqlClient.SqlClient | TestDatabaseInfo | Path.Path | FileSystem.FileSystem, SqlClient.SqlClient>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/test-kit/test-utils/src/SqlTest.ts#L989)

Since v0.0.0

## NodeSqliteTestDriver

Fresh Node SQLite integration-test driver backed by a scoped temp directory.

**Example**

```ts
import { NodeSqliteTestDriver } from "@beep/test-utils"
const driverName = NodeSqliteTestDriver.name
console.log(driverName)
```

**Signature**

```ts
declare const NodeSqliteTestDriver: SqlTestDriver<void, SqlClient.SqlClient | TestDatabaseInfo | Path.Path | FileSystem.FileSystem | NodeSqliteClient.SqliteClient, SqlClient.SqlClient>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/test-kit/test-utils/src/SqlTest.ts#L1039)

Since v0.0.0

## PgExternalTestDriver

External PostgreSQL-compatible integration-test driver backed by a caller-managed server.

**Example**

```ts
import { PgExternalTestDriver } from "@beep/test-utils"
const driverName = PgExternalTestDriver.name
console.log(driverName)
```

**Signature**

```ts
declare const PgExternalTestDriver: SqlTestDriver<PgExternalTestDriverConfigInput, PgClient.PgClient | SqlClient.SqlClient | TestDatabaseInfo, SqlClient.SqlClient>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/test-kit/test-utils/src/SqlTest.ts#L1083)

Since v0.0.0

## PgliteTestcontainersTestDriver

Fresh PGLite integration-test driver backed by a scoped Testcontainers PostgreSQL wire-protocol server.

**Example**

```ts
import { PgliteTestcontainersTestDriver } from "@beep/test-utils"
const driverName = PgliteTestcontainersTestDriver.name
console.log(driverName)
```

**Signature**

```ts
declare const PgliteTestcontainersTestDriver: SqlTestDriver<PgliteTestcontainersTestDriverConfigInput, PgClient.PgClient | SqlClient.SqlClient | TestDatabaseInfo, SqlClient.SqlClient>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/test-kit/test-utils/src/SqlTest.ts#L1061)

Since v0.0.0

## TestDatabaseInfo (class)

Runtime metadata for an ephemeral integration-test database instance.

**Example**

```ts
import { TestDatabaseInfo } from "@beep/test-utils"
const key = TestDatabaseInfo
console.log(key)
```

**Signature**

```ts
declare class TestDatabaseInfo
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/test-kit/test-utils/src/SqlTest.ts#L303)

Since v0.0.0