# effect/SchemaAST Surface

Total exports: 126

| Export | Kind | Overview |
|---|---|---|
| `annotate` | `function` | No summary found in JSDoc. |
| `annotateKey` | `function` | No summary found in JSDoc. |
| `any` | `const` | Singleton {@link Any} AST instance. |
| `Any` | `class` | AST node representing the `any` type — every value matches. |
| `appendChecks` | `function` | No summary found in JSDoc. |
| `applyToLastLink` | `function` | No summary found in JSDoc. |
| `Arrays` | `class` | AST node for array-like types — both tuples and arrays. |
| `AST` | `type` | Discriminated union of all AST node types. |
| `Base` | `class` | Abstract base class for all {@link AST} node variants. |
| `bigInt` | `const` | Singleton {@link BigInt} AST instance. |
| `BigInt` | `class` | AST node matching any `bigint` value. |
| `bigIntString` | `const` | No summary found in JSDoc. |
| `boolean` | `const` | Singleton {@link Boolean} AST instance. |
| `Boolean` | `class` | AST node matching any `boolean` value (`true` or `false`). |
| `brand` | `function` | No summary found in JSDoc. |
| `Check` | `type` | A validation check — either a single {@link Filter} or a composite {@link FilterGroup}. |
| `Checks` | `type` | Non-empty array of validation {@link Check} values attached to an AST node via {@link Base.checks}. |
| `ClassTypeId` | `const` | No summary found in JSDoc. |
| `collectIssues` | `function` | No summary found in JSDoc. |
| `collectSentinels` | `function` | No summary found in JSDoc. |
| `containsUndefined` | `function` | No summary found in JSDoc. |
| `Context` | `class` | Per-property metadata attached to AST nodes via {@link Base.context}. |
| `Declaration` | `class` | AST node for user-defined opaque types with custom parsing logic. |
| `decodeTo` | `function` | Attaches a `Transformation` to the `to` AST, making it decode from the `from` AST and encode back to it. |
| `defaultParseOptions` | `const` | No summary found in JSDoc. |
| `Encoding` | `type` | A non-empty chain of {@link Link} values representing the transformation steps between a schema's decoded (type) form and its encoded (wire) form. |
| `Enum` | `class` | AST node representing a TypeScript `enum`. |
| `enumsToLiterals` | `const` | No summary found in JSDoc. |
| `Filter` | `class` | A single validation check attached to an AST node. |
| `FilterGroup` | `class` | A composite validation check grouping multiple {@link Check} values. |
| `FINITE_PATTERN` | `const` | floating point or integer, with optional exponent |
| `flip` | `const` | Swaps the decode and encode directions of an AST's {@link Encoding} chain. |
| `getAST` | `function` | No summary found in JSDoc. |
| `getCandidates` | `function` | The goal is to reduce the number of a union members that will be checked. This is useful to reduce the number of issues that will be returned. |
| `getIndexSignatureKeys` | `function` | Returns the object keys that match the index signature parameter schema. |
| `getTemplateLiteralRegExp` | `const` | No summary found in JSDoc. |
| `IndexSignature` | `class` | An index signature entry within an {@link Objects} node. |
| `isAny` | `const` | Narrows an {@link AST} to {@link Any}. |
| `isArrays` | `const` | Narrows an {@link AST} to {@link Arrays}. |
| `isAST` | `function` | Returns `true` if the value is an {@link AST} node (any variant). |
| `isBigInt` | `const` | Narrows an {@link AST} to {@link BigInt}. |
| `isBoolean` | `const` | Narrows an {@link AST} to {@link Boolean}. |
| `isDeclaration` | `const` | Narrows an {@link AST} to {@link Declaration}. |
| `isEnum` | `const` | Narrows an {@link AST} to {@link Enum}. |
| `isLiteral` | `const` | Narrows an {@link AST} to {@link Literal}. |
| `isMutable` | `function` | No summary found in JSDoc. |
| `isNever` | `const` | Narrows an {@link AST} to {@link Never}. |
| `isNull` | `const` | Narrows an {@link AST} to {@link Null}. |
| `isNumber` | `const` | Narrows an {@link AST} to {@link Number}. |
| `isObjectKeyword` | `const` | Narrows an {@link AST} to {@link ObjectKeyword}. |
| `isObjects` | `const` | Narrows an {@link AST} to {@link Objects}. |
| `isOptional` | `function` | Returns `true` if the AST node represents an optional property. |
| `isPattern` | `function` | Creates a {@link Filter} that validates strings against a regular expression. |
| `isString` | `const` | Narrows an {@link AST} to {@link String}. |
| `isStringBigInt` | `function` | No summary found in JSDoc. |
| `isStringFinite` | `function` | No summary found in JSDoc. |
| `isStringSymbol` | `function` | No summary found in JSDoc. |
| `isSuspend` | `const` | Narrows an {@link AST} to {@link Suspend}. |
| `isSymbol` | `const` | Narrows an {@link AST} to {@link Symbol}. |
| `isTemplateLiteral` | `const` | Narrows an {@link AST} to {@link TemplateLiteral}. |
| `isUndefined` | `const` | Narrows an {@link AST} to {@link Undefined}. |
| `isUnion` | `const` | Narrows an {@link AST} to {@link Union}. |
| `isUniqueSymbol` | `const` | Narrows an {@link AST} to {@link UniqueSymbol}. |
| `isUnknown` | `const` | Narrows an {@link AST} to {@link Unknown}. |
| `isVoid` | `const` | Narrows an {@link AST} to {@link Void}. |
| `KeyValueCombiner` | `class` | Bidirectional merge strategy for index signature key-value pairs. |
| `Link` | `class` | A single step in an {@link Encoding} chain, pairing a target {@link AST} with a `Transformation` or `Middleware` that converts values between the current node and the target. |
| `Literal` | `class` | AST node matching an exact primitive value (string, number, boolean, or bigint). |
| `LiteralValue` | `type` | The set of primitive types that can appear as a {@link Literal} value. |
| `makeFilter` | `function` | No summary found in JSDoc. |
| `makeFilterByGuard` | `function` | No summary found in JSDoc. |
| `mapOrSame` | `function` | Maps over the array but will return the original array if no changes occur. |
| `memoizeThunk` | `function` | No summary found in JSDoc. |
| `middlewareDecoding` | `function` | No summary found in JSDoc. |
| `middlewareEncoding` | `function` | No summary found in JSDoc. |
| `mutableKey` | `function` | No summary found in JSDoc. |
| `never` | `const` | Singleton {@link Never} AST instance. |
| `Never` | `class` | AST node representing the `never` type — no value matches. |
| `null` | `const` | No summary found in JSDoc. |
| `Null` | `class` | AST node matching the `null` literal value. |
| `number` | `const` | Singleton {@link Number} AST instance. |
| `Number` | `class` | AST node matching any `number` value (including `NaN`, `Infinity`, `-Infinity`). |
| `objectKeyword` | `const` | Singleton {@link ObjectKeyword} AST instance. |
| `ObjectKeyword` | `class` | AST node matching the TypeScript `object` type — accepts objects, arrays, and functions (anything non-primitive and non-null). |
| `Objects` | `class` | AST node for object-like types — both structs and records. |
| `optionalKey` | `function` | Marks an AST node's property key as optional by setting {@link Context.isOptional} to `true`. |
| `optionalKeyLastLink` | `const` | No summary found in JSDoc. |
| `ParseOptions` | `interface` | Options that control parsing/validation behavior. |
| `PropertySignature` | `class` | A named property within an {@link Objects} node. |
| `record` | `function` | No summary found in JSDoc. |
| `replaceChecks` | `function` | No summary found in JSDoc. |
| `replaceContext` | `function` | No summary found in JSDoc. |
| `replaceEncoding` | `function` | No summary found in JSDoc. |
| `resolve` | `const` | Returns all annotations from the AST node. |
| `resolveAt` | `const` | Returns a single annotation value by key from the AST node. |
| `resolveDescription` | `const` | Returns the `description` annotation from the AST node, if set. |
| `resolveIdentifier` | `const` | Returns the `identifier` annotation from the AST node, if set. |
| `resolveTitle` | `const` | Returns the `title` annotation from the AST node, if set. |
| `runChecks` | `function` | No summary found in JSDoc. |
| `Sentinel` | `type` | No summary found in JSDoc. |
| `string` | `const` | Singleton {@link String} AST instance. |
| `String` | `class` | AST node matching any `string` value. |
| `STRING_PATTERN` | `const` | any string, including newlines |
| `struct` | `function` | No summary found in JSDoc. |
| `STRUCTURAL_ANNOTATION_KEY` | `const` | No summary found in JSDoc. |
| `structWithRest` | `function` | No summary found in JSDoc. |
| `Suspend` | `class` | AST node for lazy/recursive schemas. |
| `symbol` | `const` | Singleton {@link Symbol} AST instance. |
| `Symbol` | `class` | AST node matching any `symbol` value. |
| `symbolString` | `const` | No summary found in JSDoc. |
| `TemplateLiteral` | `class` | AST node representing a TypeScript template literal type (e.g. `` `user_${string}` ``). |
| `toCodec` | `function` | No summary found in JSDoc. |
| `toEncoded` | `const` | Returns the encoded (wire-format) AST by flipping and then stripping encodings. |
| `toType` | `const` | Strips all encoding transformations from an AST, returning the decoded (type-level) representation. |
| `tuple` | `function` | No summary found in JSDoc. |
| `tupleWithRest` | `function` | No summary found in JSDoc. |
| `undefined` | `const` | No summary found in JSDoc. |
| `Undefined` | `class` | AST node matching the `undefined` value. |
| `union` | `function` | No summary found in JSDoc. |
| `Union` | `class` | AST node representing a union of schemas. |
| `UniqueSymbol` | `class` | AST node matching a specific `unique symbol` value. |
| `unknown` | `const` | Singleton {@link Unknown} AST instance. |
| `Unknown` | `class` | AST node representing the `unknown` type — every value matches. |
| `void` | `const` | No summary found in JSDoc. |
| `Void` | `class` | AST node matching the `void` type (accepts `undefined` at runtime). |
| `withConstructorDefault` | `function` | No summary found in JSDoc. |
