```ts
/**
 * @fileoverview Examples of using SQL DSL combinators.
 *
 * This file demonstrates the pipe-friendly combinator API for building
 * SQL column definitions with Effect Schemas.
 */

import { DSL, Model, toDrizzle } from "@beep/schema/integrations/sql/dsl";
import * as B from "effect/Brand";
import * as S from "effect/Schema";

// ============================================================================
// Example 1: Simple Model with Basic Columns
// ============================================================================

class User extends Model<User>("User")({
  // UUID primary key
  id: S.String.pipe(DSL.uuid, DSL.primaryKey),

  // Unique string columns
  email: S.String.pipe(DSL.string, DSL.unique),
  username: S.String.pipe(DSL.string, DSL.unique),

  // Regular columns
  age: S.Int.pipe(DSL.integer),
  isActive: S.Boolean.pipe(DSL.boolean),

  // Nullable column
  bio: S.NullOr(S.String).pipe(DSL.string, DSL.nullable),

  // Column with default value
  createdAt: S.String.pipe(DSL.datetime, DSL.defaultValue("now()")),
}) {}

console.log("User table columns:");
console.log(User.columns);

// ============================================================================
// Example 2: Auto-Increment Integer Primary Key
// ============================================================================

class Post extends Model<Post>("Post")({
  // Auto-incrementing ID
  id: S.Int.pipe(DSL.integer, DSL.primaryKey, DSL.autoIncrement),

  // Foreign key reference
  userId: S.String.pipe(DSL.uuid),

  // Content columns
  title: S.String.pipe(DSL.string),
  content: S.String.pipe(DSL.string),

  // Timestamps
  createdAt: S.String.pipe(DSL.datetime, DSL.defaultValue("now()")),
  updatedAt: S.String.pipe(DSL.datetime, DSL.defaultValue("now()")),
}) {}

console.log("\nPost table columns:");
console.log(Post.columns);

// ============================================================================
// Example 3: Model with JSON Columns
// ============================================================================

const MetadataSchema = S.Struct({
  tags: S.Array(S.String),
  category: S.String,
  score: S.Number,
  featured: S.Boolean,
});

const SettingsSchema = S.Struct({
  theme: S.String,
  language: S.String,
  notifications: S.Boolean,
  privacy: S.Record({ key: S.String, value: S.Unknown }),
});

class Article extends Model<Article>("Article")({
  id: S.String.pipe(DSL.uuid, DSL.primaryKey),
  title: S.String.pipe(DSL.string),

  // JSON columns for structured data
  metadata: MetadataSchema.pipe(DSL.json),
  settings: SettingsSchema.pipe(DSL.json),

  // Optional JSON with nullable
  customFields: S.NullOr(S.Record({ key: S.String, value: S.Unknown })).pipe(DSL.json, DSL.nullable),
}) {}

console.log("\nArticle table columns:");
console.log(Article.columns);

// ============================================================================
// Example 4: Branded Types with Combinators
// ============================================================================

// Define branded types
type UserId = string & B.Brand<"UserId">;
const UserId = B.nominal<UserId>();
const UserIdSchema = S.String.pipe(S.fromBrand(UserId));

type Email = string & B.Brand<"Email">;
const Email = B.refined<Email>(
  (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s),
  (s) => B.error(`Invalid email: ${s}`)
);
const EmailSchema = S.String.pipe(S.fromBrand(Email));

class UserProfile extends Model<UserProfile>("UserProfile")({
  // Branded UUID as primary key
  id: UserIdSchema.pipe(DSL.uuid, DSL.primaryKey),

  // Branded email with validation
  email: EmailSchema.pipe(DSL.string, DSL.unique),

  // Regular columns
  displayName: S.String.pipe(DSL.string),
  avatarUrl: S.NullOr(S.String).pipe(DSL.string, DSL.nullable),
}) {}

console.log("\nUserProfile table columns:");
console.log(UserProfile.columns);

// ============================================================================
// Example 5: Complex Composition
// ============================================================================

// Compose Effect Schema filters with DSL combinators
const PasswordSchema = S.String.pipe(S.minLength(8), S.maxLength(128), S.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/));

class Account extends Model<Account>("Account")({
  id: S.Int.pipe(DSL.integer, DSL.primaryKey, DSL.autoIncrement),

  // Email with validation
  email: S.String.pipe(S.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/), S.maxLength(255), DSL.string, DSL.unique),

  // Password with complex validation
  passwordHash: PasswordSchema.pipe(DSL.string),

  // Account status with default
  status: S.String.pipe(DSL.string, DSL.defaultValue("'pending'")),

  // Verification
  isVerified: S.Boolean.pipe(DSL.boolean, DSL.defaultValue("false")),
  verifiedAt: S.NullOr(S.String).pipe(DSL.datetime, DSL.nullable),

  // Timestamps
  createdAt: S.String.pipe(DSL.datetime, DSL.defaultValue("now()")),
  lastLoginAt: S.NullOr(S.String).pipe(DSL.datetime, DSL.nullable),
}) {}

console.log("\nAccount table columns:");
console.log(Account.columns);

// ============================================================================
// Example 6: Generate Drizzle Tables
// ============================================================================

// Generate Drizzle table definitions
const userTable = toDrizzle(User);
const postTable = toDrizzle(Post);
const articleTable = toDrizzle(Article);
const userProfileTable = toDrizzle(UserProfile);
const accountTable = toDrizzle(Account);

console.log("\nGenerated Drizzle tables:");
console.log("- user:", Object.keys(userTable));
console.log("- post:", Object.keys(postTable));
console.log("- article:", Object.keys(articleTable));
console.log("- userProfile:", Object.keys(userProfileTable));
console.log("- account:", Object.keys(accountTable));

// ============================================================================
// Example 7: Comparison with Old API
// ============================================================================

// Old API (still supported)
import { Field } from "@beep/schema/integrations/sql/dsl";

class OldStyleUser extends Model<OldStyleUser>("OldStyleUser")({
  id: Field(S.String)({ column: { type: "uuid", primaryKey: true } }),
  email: Field(S.String)({ column: { type: "string", unique: true } }),
  age: Field(S.Int)({ column: { type: "integer" } }),
}) {}

// New API (preferred)
class NewStyleUser extends Model<NewStyleUser>("NewStyleUser")({
  id: S.String.pipe(DSL.uuid, DSL.primaryKey),
  email: S.String.pipe(DSL.string, DSL.unique),
  age: S.Int.pipe(DSL.integer),
}) {}

console.log("\nOld vs New API - both produce the same columns:");
console.log("Old:", OldStyleUser.columns);
console.log("New:", NewStyleUser.columns);

// ============================================================================
// Example 8: Incremental Building
// ============================================================================

// You can build up column definitions incrementally
const baseIdField = S.String.pipe(DSL.uuid);
const primaryIdField = baseIdField.pipe(DSL.primaryKey);

const baseStringField = S.String.pipe(DSL.string);
const uniqueStringField = baseStringField.pipe(DSL.unique);

class IncrementalModel extends Model<IncrementalModel>("IncrementalModel")({
  id: primaryIdField, // Reuse pre-configured field
  code: uniqueStringField, // Reuse pre-configured field
  name: baseStringField, // Or use base field
}) {}

console.log("\nIncremental building example:");
console.log(IncrementalModel.columns);

```