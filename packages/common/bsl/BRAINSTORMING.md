
I have a desire to create a schema system called "BSL" (Beep Specific Langauge) which allows users to define opaque schema
classes using `effect/Schema` with custom static properties for defining domain specific metadata which can be used to derive
various constructs like database tables, mappings to other datatypes, etc. The idea is to create a single source of truth for
any domain creating an idiomatic and ergonomic way to map domain model schemas to arbitrary datatypes. 

I envision the interface for this system to be something like this:

```typescript
import {BSL} from "@beep/bsl";
import {v4 as uuid} from "uuid";
import * as S from "effect/Schema";
import * as DateTime from "effect/DateTime";
// Model factory with default fields, (e.g `defaultFields` automatically applied to all models). Reduces boilerplate
export const {Class, Field, Index, UniqueIndex} = BSL.ModelFactory({
  defaultFields: {
    _rowId: BSL.Field(S.NonNegativeInteger, {
      column: {
        type: "serial",
        primaryKey: true,
        autoIncrement: true,
      }
    }),
    id: BSL.Field(S.UUID, {
      column: {
        type: "uuid",
        unique: true,
        defaultFn: () => uuid()
      }
    }),
    createdAt: BSL.Field(
      S.DateFromSelf,
      {
        column: {
          type: "timestamp",
          defaultFn: () => DateTime.toDateUtc(DateTime.unsafeNow()).toISOString(),
          mode: "string",
          withTimezone: true
        }
      }
    ),
    updatedAt: BSL.Field(
      S.DateFromSelf,  // We will have to think carefully about how different date schemas are handled (e.g S.DateFromSelf, S.Date, S.DateTimeUtc, etc)
      {
        column: {
          type: "timestamp",
          defaultFn: () => DateTime.toDateUtc(DateTime.unsafeNow()).toISOString(),
          mode: "date",
          withTimezone: true
        }
      }
    ),
    deletedAt: BSL.Field(
      S.NullOr(S.DateFromSelf), // nullability inferred automatically from schema.  
      {
        column: {
          type: "timestamp",
          mode: "string",
          withTimezone: true
        }
      }
    )
  },
  customColumns: {
    bytea: {
      allowPrimary: false, // boolean
      allowUnique: false, // boolean
      allowAutoIncrement: false, // boolean
      allowedEncodedTypes: ["string", "Uint8Array"]
    }
  }
});

export class UserModel extends modelFactory.Class<UserModel>(
  "UserModel" // Model identifier
)(
  "user",                    // Table name
  {                         // Model field schemas with additional metadata
    email: Field(S.NonEmptyTrimmedString.pipe(S.brand("email")), {
      column: {
        type: "varchar(255)",
      }
    }),
    username: Field(S.NonEmptyTrimmedString.pipe(S.brand("username")), {
      column: {
        type: "varchar(255)",
        unique: true,
      },
    }),
    name: Field(S.NonEmptyTrimmedString, {
      column: {
        type: "text"
      }
    }),
    role: Field(S.Literal("user", "admin"), {
      column: {
        type: "enum"
      }
    }),
    yjsSnapshot: Field(S.NullOr(S.Uint8Array), {
      column: {
        type: "bytea"
      }
    })
  },
  (m) => [                   // Model level metadata config (foreign keys, indexes, etc)
    UniqueIndex(
      "user_email_uidx",
    ).on(m.email),
  ],
  {                           // Schema annotations
    description: "User model"
  }
) {
}

export class OrganizationModel extends modelFactory<OrganizationModel>(
  "OrganizationModel" // Model identifier
)(
  "organization",                    // Table name
  {                         // Model field schemas with additional metadata
    ownerId: Field(S.NonNegativeInteger, {
      column: {
        type: "serial",
        references: {  // throws type error if reference is not the same type as the field
          target: () => UserModel,
          field: "_rowId",
          foreignKey: {
            onDelete: "cascade", // enum: "cascade", "set null", "set default", "no action"
            onUpdate: "cascade" // enum: "cascade", "set null", "set default", "no action"
          }
        }
      }
    })
  },
  (m) => [                   // Model level metadata config (foreign keys, indexes, etc)
    Index(
      "user_email_uidx",
    ).on(m.email),
  ],
  {                           // Schema annotations
    description: "User model"
  }
) {
}
```

## Core Requirements

1. The Model class is opaque meaning it can be used as a type directly for example:

```typescript
interface Payload {
  readonly user: UserModel;
}
```
2. The Model class is an `effect/Schema` meaning it can be used as a schema for validation and encoding/decoding. for example

```typescript
import * as S from "effect/Schema";

const validateUser = S.decode(UserModel);
const validateUserInput = S.encode(UserModel);
```

3. The model class has static metadata properties
```typescript
const columns = UserModel.columns // Literal types for each field are preserved 
const indexes = UserModel.indexes // Literal types for each index are preserved
const primaryKey = UserModel.primaryKey // Literal types for each primary key are preserved
const tableName = UserModel.tableName // Literal type for table name is preserved
```

4. The model has variants just like `@effect/sql/Model` for `select`, `insert`, `update`, `json`, `jsonCreate` & `jsonUpdate` (see `tmp/effect/packages/sql/src/Model.ts`)
```ts
const selectSchema = UserModel.select // default schema 
const insertSchema = UserModel.insert 
const updateSchema = UserModel.update 
const jsonSchema = UserModel.json 
const jsonCreateSchema = UserModel.jsonCreate 
const jsonUpdateSchema = UserModel.jsonUpdate 
```

5. The `column.type` property is validated against the schema ensuring the schema's encoded type matches the column type
```typescript
age: Field(S.NonNegativeInteger, {  // VALID
  column: {
    type: "integer"
  }
})
age: Field(S.NonNegativeInteger, {  // INVALID
  column: {
    type: "varchar(255)"
  }
})
```

6. Runtime validation that enforce documented invariants at Field/Model creation time.
All validators return Effect.Effect<void, SpecificError> for composability.

Validated invariants:
- INV-SQL-AI-001: AutoIncrement requires integer/bigint type
- INV-SQL-ID-001: Identifier length <= 63 characters
- INV-SQL-ID-002: Valid SQL identifier characters
- INV-MODEL-ID-001: Non-empty model identifier
- INV-MODEL-AI-001: Single autoIncrement per model
- INV-SQL-PK-001: Primary key non-nullability


7. adapter for drizzle-orm:
```typescript
const table = toDrizzle(UserModel);
```



