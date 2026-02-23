# SchemaAST: A Real-World Guide

## Table of Contents
1. [Introduction & Core Concepts](#introduction--core-concepts)
2. [Basic Usage Patterns](#basic-usage-patterns)
3. [Real-World Examples](#real-world-examples)
4. [Advanced Features Deep Dive](#advanced-features-deep-dive)
5. [Practical Patterns & Best Practices](#practical-patterns--best-practices)
6. [Integration Examples](#integration-examples)

## Introduction & Core Concepts

### The Problem SchemaAST Solves

When working with complex schema validation, transformation, and analysis scenarios, developers often face these limitations with traditional approaches:

```typescript
// Traditional schema inspection - limited and fragile
import { z } from "zod"

const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  age: z.number().min(18)
})

// ❌ How do you programmatically analyze this schema?
// ❌ How do you extract field types at runtime?
// ❌ How do you build dynamic validators from schema structure?
// ❌ How do you generate documentation or forms from schemas?

// You're stuck with string parsing or complex reflection
const getFieldNames = (schema: any) => {
  // Fragile string manipulation or private API access
  return Object.keys(schema.shape || {})
}
```

This approach leads to:
- **No Runtime Introspection** - Can't analyze schema structure programmatically
- **Fragile Transformations** - Manual schema modifications are error-prone
- **Limited Composability** - Hard to build tools that work with any schema
- **No Type Safety** - Schema transformations lose type information

### The SchemaAST Solution

SchemaAST provides a complete Abstract Syntax Tree representation of Effect schemas, enabling powerful runtime schema manipulation and analysis:

```typescript
import { Schema, SchemaAST } from "effect"

// Every Effect schema has a rich AST representation
const UserSchema = Schema.Struct({
  id: Schema.String,
  email: Schema.String.pipe(Schema.nonEmptyString()),
  age: Schema.Number.pipe(Schema.greaterThanOrEqualTo(18))
})

// ✅ Full programmatic access to schema structure
const ast = UserSchema.ast
console.log(ast._tag) // "TypeLiteral"

// ✅ Type-safe schema analysis and transformation
const fieldNames = SchemaAST.getPropertySignatures(ast).map(prop => prop.name)
// ["id", "email", "age"]

// ✅ Build powerful tools that work with any schema
const generateValidator = (schema: Schema.Schema<any>) => {
  return analyzeAST(schema.ast) // Full access to structure
}
```

### Key Concepts

**AST (Abstract Syntax Tree)**: The complete structural representation of a schema, including all type information, transformations, and annotations

**AST Nodes**: Different types representing schema components like `Literal`, `Struct`, `Union`, `Transformation`, etc.

**Annotations**: Metadata attached to AST nodes for documentation, validation messages, examples, and custom behaviors

## Basic Usage Patterns

### Pattern 1: Schema Introspection

```typescript
import { Schema, SchemaAST } from "effect"

// Analyze any schema structure
const analyzeSchema = (schema: Schema.Schema<any>) => {
  const ast = schema.ast
  
  switch (ast._tag) {
    case "TypeLiteral":
      return {
        type: "struct",
        fields: SchemaAST.getPropertySignatures(ast).map(prop => ({
          name: prop.name,
          optional: prop.isOptional,
          type: prop.type._tag
        }))
      }
    case "Union":
      return {
        type: "union",
        members: ast.types.map(type => type._tag)
      }
    case "TupleType":
      return {
        type: "tuple",
        elements: ast.elements.map(el => el.type._tag)
      }
    default:
      return { type: ast._tag }
  }
}

// Usage with different schema types
const UserSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.optional(Schema.String)
})

const StatusSchema = Schema.Union(
  Schema.Literal("active"),
  Schema.Literal("inactive")
)

console.log(analyzeSchema(UserSchema))
// { type: "struct", fields: [{ name: "id", optional: false, type: "StringKeyword" }, ...] }

console.log(analyzeSchema(StatusSchema))
// { type: "union", members: ["Literal", "Literal"] }
```

### Pattern 2: Annotation Extraction

```typescript
import { Schema, SchemaAST } from "effect"

// Extract metadata from schemas
const extractMetadata = (schema: Schema.Schema<any>) => {
  const ast = schema.ast
  
  return {
    title: SchemaAST.getTitleAnnotation(ast),
    description: SchemaAST.getDescriptionAnnotation(ast),
    examples: SchemaAST.getExamplesAnnotation(ast),
    identifier: SchemaAST.getIdentifierAnnotation(ast)
  }
}

// Schema with rich annotations
const ProductSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  price: Schema.Number
}).annotations({
  title: "Product",
  description: "A product in our catalog",
  examples: [{ id: "1", name: "Widget", price: 9.99 }],
  identifier: "Product"
})

const metadata = extractMetadata(ProductSchema)
// Access all annotations programmatically
```

### Pattern 3: AST Node Type Guards

```typescript
import { Schema, SchemaAST } from "effect"

// Type-safe AST node checking
const analyzeASTNode = (ast: SchemaAST.AST) => {
  if (SchemaAST.isLiteral(ast)) {
    return `Literal value: ${ast.literal}`
  }
  
  if (SchemaAST.isTypeLiteral(ast)) {
    const props = SchemaAST.getPropertySignatures(ast)
    return `Struct with ${props.length} properties`
  }
  
  if (SchemaAST.isUnion(ast)) {
    return `Union of ${ast.types.length} types`
  }
  
  if (SchemaAST.isRefinement(ast)) {
    return `Refined ${analyzeASTNode(ast.from)}`
  }
  
  return `AST node: ${ast._tag}`
}

// Test with various schemas
const examples = [
  Schema.Literal("hello"),
  Schema.Struct({ x: Schema.Number }),
  Schema.Union(Schema.String, Schema.Number),
  Schema.String.pipe(Schema.minLength(1))
]

examples.forEach(schema => {
  console.log(analyzeASTNode(schema.ast))
})
```

## Real-World Examples

### Example 1: Dynamic Form Generator

```typescript
import { Schema, SchemaAST, Option } from "effect"

interface FormField {
  name: string
  type: string
  required: boolean
  constraints?: Record<string, any>
  label?: string
  description?: string
}

const generateFormConfig = (schema: Schema.Schema<any>): FormField[] => {
  const ast = schema.ast
  
  if (!SchemaAST.isTypeLiteral(ast)) {
    throw new Error("Only struct schemas supported for form generation")
  }
  
  return SchemaAST.getPropertySignatures(ast).map(prop => {
    const field: FormField = {
      name: String(prop.name),
      type: mapASTToFormType(prop.type),
      required: !prop.isOptional,
      label: Option.getOrElse(
        SchemaAST.getTitleAnnotation(prop.type),
        () => String(prop.name)
      ),
      description: Option.getOrUndefined(
        SchemaAST.getDescriptionAnnotation(prop.type)
      )
    }
    
    // Extract validation constraints
    if (SchemaAST.isRefinement(prop.type)) {
      field.constraints = extractConstraints(prop.type)
    }
    
    return field
  })
}

const mapASTToFormType = (ast: SchemaAST.AST): string => {
  switch (ast._tag) {
    case "StringKeyword":
      return "text"
    case "NumberKeyword":
      return "number"
    case "BooleanKeyword":
      return "checkbox"
    case "Literal":
      return SchemaAST.isLiteral(ast) && typeof ast.literal === "string" 
        ? "select" 
        : "text"
    case "Union":
      return "select"
    case "Refinement":
      return mapASTToFormType(ast.from)
    default:
      return "text"
  }
}

const extractConstraints = (ast: SchemaAST.Refinement<any>): Record<string, any> => {
  // In a real implementation, you'd analyze the filter function
  // to extract constraints like min/max length, patterns, etc.
  return {
    // This would be extracted from the refinement filters
    minLength: Option.getOrUndefined(SchemaAST.getAnnotation(ast, Symbol.for("minLength"))),
    maxLength: Option.getOrUndefined(SchemaAST.getAnnotation(ast, Symbol.for("maxLength")))
  }
}

// Usage
const RegistrationSchema = Schema.Struct({
  email: Schema.String.pipe(
    Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
    Schema.annotations({ title: "Email Address", description: "Your email address" })
  ),
  password: Schema.String.pipe(
    Schema.minLength(8),
    Schema.annotations({ title: "Password", description: "Must be at least 8 characters" })
  ),
  age: Schema.Number.pipe(
    Schema.greaterThanOrEqualTo(18),
    Schema.annotations({ title: "Age", description: "Must be 18 or older" })
  ),
  newsletter: Schema.optional(Schema.Boolean).annotations({
    title: "Subscribe to Newsletter",
    description: "Receive updates about our products"
  })
})

const formConfig = generateFormConfig(RegistrationSchema)
// Generate complete form configuration from schema
```

### Example 2: API Documentation Generator

```typescript
import { Schema, SchemaAST, Option, Array as Arr } from "effect"

interface APIEndpointDoc {
  name: string
  description?: string
  requestSchema?: SchemaDoc
  responseSchema?: SchemaDoc
}

interface SchemaDoc {
  type: string
  properties?: Record<string, PropertyDoc>
  required?: string[]
  examples?: any[]
  description?: string
}

interface PropertyDoc {
  type: string
  description?: string
  constraints?: string[]
  examples?: any[]
}

const generateSchemaDoc = (schema: Schema.Schema<any>): SchemaDoc => {
  const ast = schema.ast
  
  const doc: SchemaDoc = {
    type: getSchemaType(ast),
    description: Option.getOrUndefined(SchemaAST.getDescriptionAnnotation(ast)),
    examples: Option.getOrUndefined(SchemaAST.getExamplesAnnotation(ast))
  }
  
  if (SchemaAST.isTypeLiteral(ast)) {
    const props = SchemaAST.getPropertySignatures(ast)
    doc.properties = {}
    doc.required = []
    
    props.forEach(prop => {
      const propName = String(prop.name)
      doc.properties![propName] = {
        type: getSchemaType(prop.type),
        description: Option.getOrUndefined(SchemaAST.getDescriptionAnnotation(prop.type)),
        examples: Option.getOrUndefined(SchemaAST.getExamplesAnnotation(prop.type)),
        constraints: extractConstraintDescriptions(prop.type)
      }
      
      if (!prop.isOptional) {
        doc.required!.push(propName)
      }
    })
  }
  
  return doc
}

const getSchemaType = (ast: SchemaAST.AST): string => {
  switch (ast._tag) {
    case "StringKeyword":
      return "string"
    case "NumberKeyword":
      return "number"
    case "BooleanKeyword":
      return "boolean"
    case "TypeLiteral":
      return "object"
    case "TupleType":
      return "array"
    case "Union":
      return "union"
    case "Literal":
      return `literal(${ast.literal})`
    case "Refinement":
      return getSchemaType(ast.from)
    default:
      return ast._tag.toLowerCase()
  }
}

const extractConstraintDescriptions = (ast: SchemaAST.AST): string[] => {
  const constraints: string[] = []
  
  if (SchemaAST.isRefinement(ast)) {
    // In practice, you'd analyze the refinement to extract constraint descriptions
    // This is a simplified version
    const message = Option.getOrUndefined(SchemaAST.getMessageAnnotation(ast))
    if (message) {
      constraints.push("Custom validation applied")
    }
  }
  
  return constraints
}

// Usage for API documentation
const CreateUserRequest = Schema.Struct({
  name: Schema.String.pipe(
    Schema.minLength(1),
    Schema.maxLength(100),
    Schema.annotations({ description: "User's full name" })
  ),
  email: Schema.String.pipe(
    Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
    Schema.annotations({ description: "Valid email address" })
  ),
  role: Schema.Union(
    Schema.Literal("admin"),
    Schema.Literal("user"),
    Schema.Literal("guest")
  ).annotations({ description: "User role in the system" })
}).annotations({
  description: "Request payload for creating a new user",
  examples: [{
    name: "John Doe",
    email: "john@example.com", 
    role: "user"
  }]
})

const CreateUserResponse = Schema.Struct({
  id: Schema.String.annotations({ description: "Unique user identifier" }),
  createdAt: Schema.String.annotations({ description: "ISO timestamp of creation" })
}).annotations({
  description: "Successful user creation response"
})

const apiDoc: APIEndpointDoc = {
  name: "Create User",
  description: "Creates a new user in the system",
  requestSchema: generateSchemaDoc(CreateUserRequest),
  responseSchema: generateSchemaDoc(CreateUserResponse)
}

// Generates complete OpenAPI-style documentation
```

### Example 3: Schema Transformation Pipeline

```typescript
import { Schema, SchemaAST, Effect, Option, Array as Arr } from "effect"

// Transform schemas by modifying their AST
const schemaTransformations = {
  // Make all fields optional
  makeAllOptional: (schema: Schema.Schema<any>) => {
    const transformAST = (ast: SchemaAST.AST): SchemaAST.AST => {
      if (SchemaAST.isTypeLiteral(ast)) {
        const newSignatures = SchemaAST.getPropertySignatures(ast).map(prop => ({
          ...prop,
          isOptional: true
        }))
        
        // In practice, you'd use SchemaAST constructors to build new AST
        // This is simplified for demonstration
        return {
          ...ast,
          propertySignatures: newSignatures
        } as any
      }
      return ast
    }
    
    return Schema.make(transformAST(schema.ast))
  },
  
  // Add prefix to all field names
  prefixFields: (prefix: string) => (schema: Schema.Schema<any>) => {
    const transformAST = (ast: SchemaAST.AST): SchemaAST.AST => {
      if (SchemaAST.isTypeLiteral(ast)) {
        const newSignatures = SchemaAST.getPropertySignatures(ast).map(prop => ({
          ...prop,
          name: `${prefix}${String(prop.name)}`
        }))
        
        return {
          ...ast,
          propertySignatures: newSignatures
        } as any
      }
      return ast
    }
    
    return Schema.make(transformAST(schema.ast))
  },
  
  // Extract field subset based on type
  extractFieldsByType: (targetType: string) => (schema: Schema.Schema<any>) => {
    if (!SchemaAST.isTypeLiteral(schema.ast)) {
      return schema
    }
    
    const matchingProps = SchemaAST.getPropertySignatures(schema.ast)
      .filter(prop => getSchemaType(prop.type) === targetType)
    
    // Build new schema with only matching fields
    const newStruct: Record<string, Schema.Schema<any>> = {}
    matchingProps.forEach(prop => {
      newStruct[String(prop.name)] = Schema.make(prop.type)
    })
    
    return Schema.Struct(newStruct)
  }
}

// Create a transformation pipeline
const createTransformationPipeline = <A, I, R>(
  schema: Schema.Schema<A, I, R>
) => ({
  pipe: <B>(transform: (schema: Schema.Schema<A, I, R>) => Schema.Schema<B>) => 
    createTransformationPipeline(transform(schema)),
  
  schema: () => schema,
  
  makeOptional: () => 
    createTransformationPipeline(schemaTransformations.makeAllOptional(schema)),
  
  prefixFields: (prefix: string) =>
    createTransformationPipeline(schemaTransformations.prefixFields(prefix)(schema)),
  
  extractByType: (type: string) =>
    createTransformationPipeline(schemaTransformations.extractFieldsByType(type)(schema))
})

// Usage
const OriginalSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  age: Schema.Number,
  active: Schema.Boolean
})

const transformedSchema = createTransformationPipeline(OriginalSchema)
  .prefixFields("user_")
  .makeOptional()
  .schema()

// Results in schema with optional fields: user_id?, user_name?, user_age?, user_active?
```

## Advanced Features Deep Dive

### Feature 1: Custom AST Node Creation

Building custom AST nodes for specialized validation or transformation scenarios.

```typescript
import { Schema, SchemaAST, Effect, ParseResult } from "effect"

// Create a custom declaration for domain-specific validation
const createCustomEmailValidation = () => {
  const decodeUnknown = () => (input: unknown, options: SchemaAST.ParseOptions) => 
    Effect.gen(function* () {
      if (typeof input !== "string") {
        return yield* ParseResult.fail(new ParseResult.Type(SchemaAST.stringKeyword, input))
      }
      
      // Custom email validation logic
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
      if (!emailRegex.test(input)) {
        return yield* ParseResult.fail(new ParseResult.Type(SchemaAST.stringKeyword, input, "Invalid email format"))
      }
      
      // Additional business logic validation
      const domain = input.split('@')[1]
      const blockedDomains = ['tempmail.com', 'throwaway.email']
      if (blockedDomains.includes(domain)) {
        return yield* ParseResult.fail(new ParseResult.Type(SchemaAST.stringKeyword, input, "Domain not allowed"))
      }
      
      return input
    })
  
  const encodeUnknown = () => (input: unknown, options: SchemaAST.ParseOptions) =>
    Effect.succeed(input)
  
  const ast = new SchemaAST.Declaration(
    [], // no type parameters
    decodeUnknown,
    encodeUnknown,
    {
      [SchemaAST.IdentifierAnnotationId]: "BusinessEmail",
      [SchemaAST.TitleAnnotationId]: "Business Email",
      [SchemaAST.DescriptionAnnotationId]: "Valid business email address"
    }
  )
  
  return Schema.make(ast)
}

const BusinessEmailSchema = createCustomEmailValidation()

// Use the custom schema
const validateBusinessEmail = Schema.decodeUnknown(BusinessEmailSchema)
```

### Feature 2: AST Annotation System

Advanced annotation patterns for metadata-driven development.

```typescript
import { Schema, SchemaAST, Option } from "effect"

// Custom annotation system for database mapping
const DatabaseAnnotationId = Symbol.for("app/annotation/Database")

interface DatabaseAnnotation {
  tableName: string
  columnName?: string
  indexed?: boolean
  nullable?: boolean
}

const withDatabaseAnnotation = (annotation: DatabaseAnnotation) => 
  <A, I, R>(schema: Schema.Schema<A, I, R>): Schema.Schema<A, I, R> =>
    schema.annotations({ [DatabaseAnnotationId]: annotation })

const getDatabaseAnnotation = (ast: SchemaAST.AST): Option.Option<DatabaseAnnotation> =>
  SchemaAST.getAnnotation<DatabaseAnnotation>(ast, DatabaseAnnotationId)

// Schema with database annotations
const UserSchema = Schema.Struct({
  id: Schema.String.pipe(
    withDatabaseAnnotation({ 
      tableName: "users", 
      columnName: "user_id", 
      indexed: true 
    })
  ),
  email: Schema.String.pipe(
    withDatabaseAnnotation({ 
      tableName: "users", 
      columnName: "email_address", 
      indexed: true 
    })
  ),
  profile: Schema.optional(Schema.Struct({
    firstName: Schema.String.pipe(
      withDatabaseAnnotation({ 
        tableName: "user_profiles", 
        columnName: "first_name" 
      })
    ),
    lastName: Schema.String.pipe(
      withDatabaseAnnotation({ 
        tableName: "user_profiles", 
        columnName: "last_name" 
      })
    )
  }))
}).pipe(
  withDatabaseAnnotation({ tableName: "users" })
)

// Generate SQL DDL from schema
const generateCreateTableSQL = (schema: Schema.Schema<any>): string[] => {
  const statements: string[] = []
  const tables: Map<string, Array<{ column: string; type: string; indexed: boolean; nullable: boolean }>> = new Map()
  
  const processAST = (ast: SchemaAST.AST, parentTable?: string) => {
    const dbAnnotation = getDatabaseAnnotation(ast)
    
    if (SchemaAST.isTypeLiteral(ast)) {
      const tableName = Option.map(dbAnnotation, ann => ann.tableName)
      
      SchemaAST.getPropertySignatures(ast).forEach(prop => {
        const propDbAnnotation = getDatabaseAnnotation(prop.type)
        const currentTable = Option.getOrElse(
          Option.map(propDbAnnotation, ann => ann.tableName),
          () => Option.getOrElse(tableName, () => parentTable || "default_table")
        )
        
        if (!tables.has(currentTable)) {
          tables.set(currentTable, [])
        }
        
        const columnName = Option.getOrElse(
          Option.map(propDbAnnotation, ann => ann.columnName),
          () => String(prop.name)
        )
        
        const sqlType = mapSchemaTypeToSQL(prop.type)
        const indexed = Option.getOrElse(
          Option.map(propDbAnnotation, ann => ann.indexed),
          () => false
        )
        const nullable = prop.isOptional || Option.getOrElse(
          Option.map(propDbAnnotation, ann => ann.nullable),
          () => false
        )
        
        tables.get(currentTable)!.push({
          column: columnName,
          type: sqlType,
          indexed,
          nullable
        })
        
        // Recursively process nested structures
        processAST(prop.type, currentTable)
      })
    }
  }
  
  processAST(schema.ast)
  
  // Generate CREATE TABLE statements
  for (const [tableName, columns] of tables) {
    const columnDefs = columns.map(col => 
      `${col.column} ${col.type}${col.nullable ? "" : " NOT NULL"}`
    ).join(",\n  ")
    
    statements.push(`CREATE TABLE ${tableName} (\n  ${columnDefs}\n);`)
    
    // Generate indexes
    const indexedColumns = columns.filter(col => col.indexed)
    indexedColumns.forEach(col => {
      statements.push(`CREATE INDEX idx_${tableName}_${col.column} ON ${tableName}(${col.column});`)
    })
  }
  
  return statements
}

const mapSchemaTypeToSQL = (ast: SchemaAST.AST): string => {
  switch (ast._tag) {
    case "StringKeyword":
      return "VARCHAR(255)"
    case "NumberKeyword":
      return "DECIMAL(10,2)"
    case "BooleanKeyword":
      return "BOOLEAN"
    case "Literal":
      return typeof ast.literal === "string" ? "VARCHAR(255)" : "INTEGER"
    default:
      return "TEXT"
  }
}

// Generate database schema
const sqlStatements = generateCreateTableSQL(UserSchema)
console.log(sqlStatements.join("\n\n"))
```

### Feature 3: AST Transformation Combinators

Powerful combinators for AST manipulation and schema composition.

```typescript
import { Schema, SchemaAST, Array as Arr, Option } from "effect"

// AST transformation utilities
const ASTTransformers = {
  // Deep transform all nodes of a specific type
  transformAll: <T extends SchemaAST.AST["_tag"]>(
    nodeType: T,
    transformer: (node: Extract<SchemaAST.AST, { _tag: T }>) => SchemaAST.AST
  ) => (ast: SchemaAST.AST): SchemaAST.AST => {
    const transform = (node: SchemaAST.AST): SchemaAST.AST => {
      // Transform current node if it matches type
      if (node._tag === nodeType) {
        const transformed = transformer(node as Extract<SchemaAST.AST, { _tag: T }>)
        return ASTTransformers.transformAll(nodeType, transformer)(transformed)
      }
      
      // Recursively transform child nodes
      switch (node._tag) {
        case "TypeLiteral":
          const newProps = SchemaAST.getPropertySignatures(node).map(prop => ({
            ...prop,
            type: transform(prop.type)
          }))
          return { ...node, propertySignatures: newProps } as any
          
        case "Union":
          return { ...node, types: node.types.map(transform) } as any
          
        case "TupleType":
          return { 
            ...node, 
            elements: node.elements.map(el => ({ ...el, type: transform(el.type) }))
          } as any
          
        case "Refinement":
          return { ...node, from: transform(node.from) } as any
          
        case "Transformation":
          return { 
            ...node, 
            from: transform(node.from),
            to: transform(node.to)
          } as any
          
        default:
          return node
      }
    }
    
    return transform(ast)
  },
  
  // Collect all nodes of a specific type
  collectAll: <T extends SchemaAST.AST["_tag"]>(
    nodeType: T
  ) => (ast: SchemaAST.AST): Array<Extract<SchemaAST.AST, { _tag: T }>> => {
    const collected: Array<Extract<SchemaAST.AST, { _tag: T }>> = []
    
    const collect = (node: SchemaAST.AST): void => {
      if (node._tag === nodeType) {
        collected.push(node as Extract<SchemaAST.AST, { _tag: T }>)
      }
      
      // Recursively collect from child nodes
      switch (node._tag) {
        case "TypeLiteral":
          SchemaAST.getPropertySignatures(node).forEach(prop => collect(prop.type))
          break
        case "Union":
          node.types.forEach(collect)
          break
        case "TupleType":
          node.elements.forEach(el => collect(el.type))
          break
        case "Refinement":
          collect(node.from)
          break
        case "Transformation":
          collect(node.from)
          collect(node.to)
          break
      }
    }
    
    collect(ast)
    return collected
  },
  
  // Apply multiple transformations in sequence
  compose: (...transformers: Array<(ast: SchemaAST.AST) => SchemaAST.AST>) =>
    (ast: SchemaAST.AST) => transformers.reduce((acc, transformer) => transformer(acc), ast)
}

// Usage examples
const exampleSchema = Schema.Struct({
  user: Schema.Struct({
    id: Schema.String,
    name: Schema.String.pipe(Schema.minLength(1))
  }),
  posts: Schema.Array(Schema.Struct({
    title: Schema.String,
    content: Schema.String.pipe(Schema.maxLength(1000))
  }))
})

// Transform all string refinements to add custom annotations
const addStringConstraintAnnotations = ASTTransformers.transformAll(
  "Refinement",
  (refinement) => {
    if (SchemaAST.isStringKeyword(refinement.from)) {
      return {
        ...refinement,
        annotations: {
          ...refinement.annotations,
          [SchemaAST.DescriptionAnnotationId]: "String with validation constraints"
        }
      }
    }
    return refinement
  }
)

// Collect all literal values
const collectLiterals = ASTTransformers.collectAll("Literal")

// Composed transformation pipeline
const transformSchema = ASTTransformers.compose(
  addStringConstraintAnnotations,
  ASTTransformers.transformAll("StringKeyword", (str) => ({
    ...str,
    annotations: {
      ...str.annotations,
      [SchemaAST.TitleAnnotationId]: "Text Field"
    }
  }))
)

const transformedAST = transformSchema(exampleSchema.ast)
const literals = collectLiterals(exampleSchema.ast)
```

## Practical Patterns & Best Practices

### Pattern 1: Schema Validation Analyzer

```typescript
import { Schema, SchemaAST, Option, Array as Arr } from "effect"

// Analyze schema complexity and validation rules
const createSchemaAnalyzer = () => {
  interface ValidationRule {
    field: string
    rule: string
    description: string
    severity: "error" | "warning" | "info"
  }
  
  interface SchemaAnalysis {
    complexity: number
    depth: number
    fieldCount: number
    validationRules: ValidationRule[]
    recommendations: string[]
  }
  
  const analyzeSchema = (schema: Schema.Schema<any>): SchemaAnalysis => {
    let complexity = 0
    let maxDepth = 0
    let fieldCount = 0
    const validationRules: ValidationRule[] = []
    const recommendations: string[] = []
    
    const analyzeAST = (ast: SchemaAST.AST, path: string = "", depth: number = 0): void => {
      maxDepth = Math.max(maxDepth, depth)
      complexity += 1
      
      switch (ast._tag) {
        case "TypeLiteral":
          const props = SchemaAST.getPropertySignatures(ast)
          fieldCount += props.length
          
          if (props.length > 10) {
            recommendations.push(`Consider breaking down large struct at ${path || "root"} (${props.length} fields)`)
          }
          
          props.forEach(prop => {
            const propPath = path ? `${path}.${String(prop.name)}` : String(prop.name)
            analyzeAST(prop.type, propPath, depth + 1)
            
            if (!prop.isOptional && depth > 3) {
              recommendations.push(`Deep required field at ${propPath} - consider making optional`)
            }
          })
          break
          
        case "Union":
          complexity += ast.types.length
          if (ast.types.length > 5) {
            validationRules.push({
              field: path,
              rule: "Large Union",
              description: `Union with ${ast.types.length} variants`,
              severity: "warning"
            })
          }
          ast.types.forEach(type => analyzeAST(type, path, depth))
          break
          
        case "Refinement":
          validationRules.push({
            field: path,
            rule: "Custom Validation",
            description: "Has custom validation logic",
            severity: "info"
          })
          analyzeAST(ast.from, path, depth)
          break
          
        case "TupleType":
          if (ast.elements.length > 7) {
            recommendations.push(`Large tuple at ${path} (${ast.elements.length} elements) - consider using struct`)
          }
          ast.elements.forEach((el, i) => 
            analyzeAST(el.type, `${path}[${i}]`, depth + 1)
          )
          break
      }
    }
    
    analyzeAST(schema.ast)
    
    return {
      complexity,
      depth: maxDepth,
      fieldCount,
      validationRules,
      recommendations
    }
  }
  
  return { analyzeSchema }
}

// Usage
const analyzer = createSchemaAnalyzer()

const ComplexUserSchema = Schema.Struct({
  personalInfo: Schema.Struct({
    basicInfo: Schema.Struct({
      firstName: Schema.String.pipe(Schema.minLength(1)),
      lastName: Schema.String.pipe(Schema.minLength(1)),
      middleName: Schema.optional(Schema.String)
    }),
    contactInfo: Schema.Struct({
      email: Schema.String.pipe(Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)),
      phone: Schema.String.pipe(Schema.pattern(/^\+?[1-9]\d{1,14}$/)),
      address: Schema.Struct({
        street: Schema.String,
        city: Schema.String,
        state: Schema.String,
        zipCode: Schema.String.pipe(Schema.pattern(/^\d{5}(-\d{4})?$/)),
        country: Schema.String
      })
    })
  }),
  preferences: Schema.Struct({
    notifications: Schema.Union(
      Schema.Literal("all"),
      Schema.Literal("important"),
      Schema.Literal("none")
    ),
    theme: Schema.Union(
      Schema.Literal("light"),
      Schema.Literal("dark"),
      Schema.Literal("auto")
    )
  })
})

const analysis = analyzer.analyzeSchema(ComplexUserSchema)
console.log("Schema Analysis:", analysis)
```

### Pattern 2: Type-Safe Schema Builder

```typescript
import { Schema, SchemaAST, Effect } from "effect"

// Fluent API for building schemas with validation
class SchemaBuilder<A = unknown> {
  constructor(private schema: Schema.Schema<A>) {}
  
  static create<T>() {
    return new SchemaBuilder<T>(Schema.Unknown as any)
  }
  
  static string() {
    return new SchemaBuilder(Schema.String)
  }
  
  static number() {
    return new SchemaBuilder(Schema.Number)
  }
  
  static boolean() {
    return new SchemaBuilder(Schema.Boolean)
  }
  
  static struct<T extends Record<string, Schema.Schema<any>>>(fields: T) {
    return new SchemaBuilder(Schema.Struct(fields))
  }
  
  // Add validation constraints
  min(value: A extends number ? number : never) {
    if (this.isNumberSchema()) {
      return new SchemaBuilder(this.schema.pipe(Schema.greaterThanOrEqualTo(value as number)))
    }
    throw new Error("min() can only be applied to number schemas")
  }
  
  max(value: A extends number ? number : never) {
    if (this.isNumberSchema()) {
      return new SchemaBuilder(this.schema.pipe(Schema.lessThanOrEqualTo(value as number)))
    }
    throw new Error("max() can only be applied to number schemas")
  }
  
  minLength(length: A extends string ? number : never) {
    if (this.isStringSchema()) {
      return new SchemaBuilder(this.schema.pipe(Schema.minLength(length as number)))
    }
    throw new Error("minLength() can only be applied to string schemas")
  }
  
  pattern(regex: A extends string ? RegExp : never) {
    if (this.isStringSchema()) {
      return new SchemaBuilder(this.schema.pipe(Schema.pattern(regex as RegExp)))
    }
    throw new Error("pattern() can only be applied to string schemas")
  }
  
  optional() {
    return new SchemaBuilder(Schema.optional(this.schema))
  }
  
  // Add annotations
  title(title: string) {
    return new SchemaBuilder(this.schema.annotations({ title }))
  }
  
  description(description: string) {
    return new SchemaBuilder(this.schema.annotations({ description }))
  }
  
  example(example: A) {
    return new SchemaBuilder(this.schema.annotations({ examples: [example] }))
  }
  
  // Build final schema
  build(): Schema.Schema<A> {
    return this.schema
  }
  
  // Type guards for validation
  private isStringSchema(): boolean {
    return SchemaAST.isStringKeyword(this.schema.ast) || 
           (SchemaAST.isRefinement(this.schema.ast) && SchemaAST.isStringKeyword(this.schema.ast.from))
  }
  
  private isNumberSchema(): boolean {
    return SchemaAST.isNumberKeyword(this.schema.ast) ||
           (SchemaAST.isRefinement(this.schema.ast) && SchemaAST.isNumberKeyword(this.schema.ast.from))
  }
}

// Usage with full type safety
const UserProfileSchema = SchemaBuilder.struct({
  email: SchemaBuilder
    .string()
    .pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    .title("Email Address")
    .description("User's email address")
    .build(),
    
  age: SchemaBuilder
    .number()
    .min(13)
    .max(120)
    .title("Age")
    .description("User's age in years")
    .build(),
    
  name: SchemaBuilder
    .string()
    .minLength(1)
    .title("Full Name")
    .example("John Doe")
    .build(),
    
  bio: SchemaBuilder
    .string()
    .optional()
    .title("Biography")
    .description("Optional user biography")
    .build()
}).build()

// The resulting schema has full type information and validation
```

### Pattern 3: Schema Migration System

```typescript
import { Schema, SchemaAST, Effect, Array as Arr } from "effect"

// Schema versioning and migration system
interface SchemaVersion {
  version: number
  schema: Schema.Schema<any>
  migrations?: Array<SchemaMigration>
}

interface SchemaMigration {
  fromVersion: number
  toVersion: number
  migrate: (data: any) => Effect.Effect<any, MigrationError>
}

class MigrationError {
  constructor(
    public readonly message: string,
    public readonly fromVersion: number,
    public readonly toVersion: number
  ) {}
}

const createSchemaRegistry = () => {
  const versions = new Map<string, SchemaVersion[]>()
  
  const registerSchema = (
    name: string, 
    version: number, 
    schema: Schema.Schema<any>,
    migrations: SchemaMigration[] = []
  ) => {
    if (!versions.has(name)) {
      versions.set(name, [])
    }
    
    const schemaVersions = versions.get(name)!
    schemaVersions.push({ version, schema, migrations })
    schemaVersions.sort((a, b) => a.version - b.version)
  }
  
  const getLatestSchema = (name: string): Schema.Schema<any> | undefined => {
    const schemaVersions = versions.get(name)
    if (!schemaVersions || schemaVersions.length === 0) return undefined
    
    return schemaVersions[schemaVersions.length - 1].schema
  }
  
  const migrateData = (
    name: string,
    data: any,
    fromVersion: number,
    toVersion?: number
  ) => Effect.gen(function* () {
    const schemaVersions = versions.get(name)
    if (!schemaVersions) {
      return yield* Effect.fail(new MigrationError(`Schema ${name} not found`, fromVersion, toVersion || -1))
    }
    
    const targetVersion = toVersion || Math.max(...schemaVersions.map(v => v.version))
    let currentData = data
    let currentVersion = fromVersion
    
    while (currentVersion < targetVersion) {
      const nextVersion = currentVersion + 1
      const migration = schemaVersions
        .flatMap(v => v.migrations || [])
        .find(m => m.fromVersion === currentVersion && m.toVersion === nextVersion)
      
      if (!migration) {
        return yield* Effect.fail(new MigrationError(
          `No migration found from version ${currentVersion} to ${nextVersion}`,
          currentVersion,
          nextVersion
        ))
      }
      
      currentData = yield* migration.migrate(currentData)
      currentVersion = nextVersion
    }
    
    return currentData
  })
  
  const analyzeSchemaChanges = (
    name: string,
    fromVersion: number,
    toVersion: number
  ): Array<SchemaChange> => {
    const schemaVersions = versions.get(name)
    if (!schemaVersions) return []
    
    const fromSchema = schemaVersions.find(v => v.version === fromVersion)?.schema
    const toSchema = schemaVersions.find(v => v.version === toVersion)?.schema
    
    if (!fromSchema || !toSchema) return []
    
    return compareSchemas(fromSchema.ast, toSchema.ast)
  }
  
  return {
    registerSchema,
    getLatestSchema,
    migrateData,
    analyzeSchemaChanges
  }
}

interface SchemaChange {
  type: "field_added" | "field_removed" | "field_type_changed" | "field_made_optional" | "field_made_required"
  field: string
  description: string
}

const compareSchemas = (ast1: SchemaAST.AST, ast2: SchemaAST.AST): Array<SchemaChange> => {
  const changes: SchemaChange[] = []
  
  if (SchemaAST.isTypeLiteral(ast1) && SchemaAST.isTypeLiteral(ast2)) {
    const props1 = SchemaAST.getPropertySignatures(ast1)
    const props2 = SchemaAST.getPropertySignatures(ast2)
    
    const fields1 = new Map(props1.map(p => [String(p.name), p]))
    const fields2 = new Map(props2.map(p => [String(p.name), p]))
    
    // Find added fields
    for (const [name, prop] of fields2) {
      if (!fields1.has(name)) {
        changes.push({
          type: "field_added",
          field: name,
          description: `Field '${name}' was added`
        })
      }
    }
    
    // Find removed and changed fields
    for (const [name, prop1] of fields1) {
      const prop2 = fields2.get(name)
      if (!prop2) {
        changes.push({
          type: "field_removed",
          field: name,
          description: `Field '${name}' was removed`
        })
      } else {
        // Check for type changes
        if (prop1.type._tag !== prop2.type._tag) {
          changes.push({
            type: "field_type_changed",
            field: name,
            description: `Field '${name}' type changed from ${prop1.type._tag} to ${prop2.type._tag}`
          })
        }
        
        // Check for optional/required changes
        if (prop1.isOptional && !prop2.isOptional) {
          changes.push({
            type: "field_made_required",
            field: name,
            description: `Field '${name}' is now required`
          })
        } else if (!prop1.isOptional && prop2.isOptional) {
          changes.push({
            type: "field_made_optional",
            field: name,
            description: `Field '${name}' is now optional`
          })
        }
      }
    }
  }
  
  return changes
}

// Usage example
const registry = createSchemaRegistry()

// Version 1 - Initial user schema
const UserV1 = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  email: Schema.String
})

// Version 2 - Added age field
const UserV2 = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  email: Schema.String,
  age: Schema.optional(Schema.Number)
})

// Version 3 - Made age required, added created date
const UserV3 = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  email: Schema.String,
  age: Schema.Number,
  createdAt: Schema.String
})

// Register schemas with migrations
registry.registerSchema("User", 1, UserV1)

registry.registerSchema("User", 2, UserV2, [{
  fromVersion: 1,
  toVersion: 2,
  migrate: (data) => Effect.succeed({ ...data, age: undefined })
}])

registry.registerSchema("User", 3, UserV3, [{
  fromVersion: 2,
  toVersion: 3,
  migrate: (data) => Effect.succeed({ 
    ...data, 
    age: data.age || 25,
    createdAt: new Date().toISOString()
  })
}])

// Analyze schema evolution
const changes = registry.analyzeSchemaChanges("User", 1, 3)
console.log("Schema changes:", changes)
```

## Integration Examples

### Integration with Fastify HTTP Server

```typescript
import { Schema, SchemaAST, Effect, Array as Arr } from "effect"
import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify"

// Generate Fastify route handlers from schemas
const createSchemaRoute = <TRequest, TResponse>(config: {
  method: "GET" | "POST" | "PUT" | "DELETE"
  url: string
  requestSchema?: Schema.Schema<TRequest>
  responseSchema: Schema.Schema<TResponse>
  handler: (request: TRequest) => Effect.Effect<TResponse, Error>
}) => {
  return (fastify: FastifyInstance) => {
    // Generate JSON Schema for Fastify validation
    const jsonSchema = config.requestSchema 
      ? generateJSONSchema(config.requestSchema.ast)
      : undefined
    
    const routeOptions = {
      method: config.method,
      url: config.url,
      schema: {
        ...(jsonSchema && config.method !== "GET" ? { body: jsonSchema } : {}),
        ...(jsonSchema && config.method === "GET" ? { querystring: jsonSchema } : {}),
        response: {
          200: generateJSONSchema(config.responseSchema.ast)
        }
      },
      handler: async (request: FastifyRequest, reply: FastifyReply) => {
        const program = Effect.gen(function* () {
          // Parse and validate request data
          let requestData: TRequest = undefined as any
          if (config.requestSchema) {
            const inputData = config.method === "GET" ? request.query : request.body
            requestData = yield* Schema.decodeUnknown(config.requestSchema)(inputData)
          }
          
          // Execute business logic
          const result = yield* config.handler(requestData)
          
          // Validate response
          const validatedResponse = yield* Schema.encodeUnknown(config.responseSchema)(result)
          
          return validatedResponse
        }).pipe(
          Effect.catchAll(error => Effect.sync(() => {
            reply.code(400).send({ error: String(error) })
            return null
          }))
        )
        
        const result = await Effect.runPromise(program)
        if (result !== null) {
          reply.send(result)
        }
      }
    }
    
    fastify.route(routeOptions as any)
  }
}

// Convert SchemaAST to JSON Schema
const generateJSONSchema = (ast: SchemaAST.AST): any => {
  switch (ast._tag) {
    case "StringKeyword":
      return { type: "string" }
    case "NumberKeyword":
      return { type: "number" }
    case "BooleanKeyword":
      return { type: "boolean" }
    case "TypeLiteral":
      const props = SchemaAST.getPropertySignatures(ast)
      return {
        type: "object",
        properties: Object.fromEntries(
          props.map(prop => [
            String(prop.name),
            generateJSONSchema(prop.type)
          ])
        ),
        required: props.filter(p => !p.isOptional).map(p => String(p.name))
      }
    case "Union":
      return { anyOf: ast.types.map(generateJSONSchema) }
    case "Literal":
      return { const: ast.literal }
    case "Refinement":
      return generateJSONSchema(ast.from)
    default:
      return {}
  }
}

// Usage with Fastify
const CreateUserRequest = Schema.Struct({
  name: Schema.String.pipe(Schema.minLength(1)),
  email: Schema.String.pipe(Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)),
  age: Schema.Number.pipe(Schema.greaterThanOrEqualTo(18))
})

const CreateUserResponse = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  email: Schema.String,
  age: Schema.Number,
  createdAt: Schema.String
})

const createUserRoute = createSchemaRoute({
  method: "POST",
  url: "/users",
  requestSchema: CreateUserRequest,
  responseSchema: CreateUserResponse,
  handler: (request) => Effect.gen(function* () {
    // Business logic here
    return {
      id: crypto.randomUUID(),
      ...request,
      createdAt: new Date().toISOString()
    }
  })
})

// Register with Fastify instance
// fastify.register(createUserRoute)
```

### Integration with React Hook Form

```typescript
import { Schema, SchemaAST, Option, Array as Arr } from "effect"
import type { UseFormReturn, FieldValues, RegisterOptions } from "react-hook-form"

// Generate React Hook Form configuration from Schema
const generateFormConfig = <T extends Record<string, any>>(
  schema: Schema.Schema<T>
) => {
  interface FormFieldConfig {
    name: keyof T
    registerOptions: RegisterOptions
    type: string
    label: string
    placeholder?: string
    options?: Array<{ value: any; label: string }>
  }
  
  const fields: FormFieldConfig[] = []
  
  if (!SchemaAST.isTypeLiteral(schema.ast)) {
    throw new Error("Schema must be a struct for form generation")
  }
  
  const props = SchemaAST.getPropertySignatures(schema.ast)
  
  props.forEach(prop => {
    const fieldName = String(prop.name) as keyof T
    const fieldConfig: FormFieldConfig = {
      name: fieldName,
      registerOptions: generateValidationRules(prop.type, !prop.isOptional),
      type: getInputType(prop.type),
      label: Option.getOrElse(
        SchemaAST.getTitleAnnotation(prop.type),
        () => formatFieldName(String(prop.name))
      ),
      placeholder: Option.getOrUndefined(
        SchemaAST.getDescriptionAnnotation(prop.type)
      )
    }
    
    // Generate options for select fields
    if (SchemaAST.isUnion(prop.type)) {
      fieldConfig.options = extractUnionOptions(prop.type)
    }
    
    fields.push(fieldConfig)
  })
  
  return fields
}

const generateValidationRules = (ast: SchemaAST.AST, required: boolean): RegisterOptions => {
  const rules: RegisterOptions = {}
  
  if (required) {
    rules.required = "This field is required"
  }
  
  const processRefinement = (refinement: SchemaAST.AST): void => {
    if (SchemaAST.isRefinement(refinement)) {
      // Extract validation rules from refinements
      // This is simplified - in practice you'd analyze the filter function
      const message = Option.getOrUndefined(SchemaAST.getMessageAnnotation(refinement))
      
      if (SchemaAST.isStringKeyword(refinement.from)) {
        // Check for common string validations
        rules.validate = (value: string) => {
          if (!value && !required) return true
          // Add specific validations based on refinement analysis
          return message || true
        }
      }
      
      if (SchemaAST.isNumberKeyword(refinement.from)) {
        // Check for number range validations
        rules.validate = (value: number) => {
          if (!value && !required) return true
          // Add specific validations based on refinement analysis
          return message || true
        }
      }
      
      processRefinement(refinement.from)
    }
  }
  
  processRefinement(ast)
  
  return rules
}

const getInputType = (ast: SchemaAST.AST): string => {
  switch (ast._tag) {
    case "StringKeyword":
      return "text"
    case "NumberKeyword":
      return "number"
    case "BooleanKeyword":
      return "checkbox"
    case "Union":
      return "select"
    case "Refinement":
      // Check if it's an email pattern
      const emailPattern = /email/i
      const message = Option.getOrUndefined(SchemaAST.getMessageAnnotation(ast))
      if (message && emailPattern.test(message)) {
        return "email"
      }
      return getInputType(ast.from)
    default:
      return "text"
  }
}

const extractUnionOptions = (union: SchemaAST.Union): Array<{ value: any; label: string }> => {
  return union.types
    .filter(SchemaAST.isLiteral)
    .map(literal => ({
      value: literal.literal,
      label: String(literal.literal)
    }))
}

const formatFieldName = (name: string): string => {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
}

// React Hook Form integration hook
const useSchemaForm = <T extends Record<string, any>>(
  schema: Schema.Schema<T>,
  useFormReturn: UseFormReturn<T>
) => {
  const formConfig = generateFormConfig(schema)
  
  const validateForm = async (data: T) => {
    try {
      await Schema.decodeUnknown(schema)(data)
      return { isValid: true, errors: [] }
    } catch (error) {
      return { 
        isValid: false, 
        errors: [{ message: String(error) }]
      }
    }
  }
  
  return {
    fields: formConfig,
    validateForm,
    register: useFormReturn.register,
    formState: useFormReturn.formState,
    handleSubmit: useFormReturn.handleSubmit
  }
}

// Usage in React component
const UserRegistrationSchema = Schema.Struct({
  firstName: Schema.String.pipe(
    Schema.minLength(1),
    Schema.annotations({ title: "First Name", description: "Enter your first name" })
  ),
  lastName: Schema.String.pipe(
    Schema.minLength(1),
    Schema.annotations({ title: "Last Name", description: "Enter your last name" })
  ),
  email: Schema.String.pipe(
    Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
    Schema.annotations({ title: "Email Address", description: "Enter a valid email address" })
  ),
  age: Schema.Number.pipe(
    Schema.greaterThanOrEqualTo(18),
    Schema.annotations({ title: "Age", description: "Must be 18 or older" })
  ),
  role: Schema.Union(
    Schema.Literal("user"),
    Schema.Literal("admin"),
    Schema.Literal("moderator")
  ).annotations({ title: "Role", description: "Select your role" })
})

// In React component:
/*
const RegistrationForm = () => {
  const form = useForm<typeof UserRegistrationSchema.Type>()
  const schemaForm = useSchemaForm(UserRegistrationSchema, form)
  
  return (
    <form onSubmit={form.handleSubmit(async (data) => {
      const validation = await schemaForm.validateForm(data)
      if (validation.isValid) {
        // Submit data
      }
    })}>
      {schemaForm.fields.map(field => (
        <FormField
          key={String(field.name)}
          {...field}
          register={schemaForm.register}
        />
      ))}
    </form>
  )
}
*/
```

## Conclusion

SchemaAST provides comprehensive runtime introspection and manipulation capabilities for Effect schemas, enabling powerful metadata-driven development patterns.

Key benefits:
- **Full Runtime Access**: Complete programmatic access to schema structure and metadata
- **Type-Safe Transformations**: Transform schemas while maintaining type safety
- **Rich Annotation System**: Attach and extract custom metadata for any use case
- **Powerful Analysis Tools**: Build sophisticated schema analysis and validation tools
- **Framework Integration**: Generate configurations for forms, APIs, databases, and more

SchemaAST is essential when you need to build tools that work with schemas dynamically, analyze schema structure at runtime, or create metadata-driven applications that adapt based on schema definitions.