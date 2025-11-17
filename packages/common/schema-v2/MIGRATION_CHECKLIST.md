# Schema v2 Migration Checklist

Use this checklist to coordinate the incremental migration from `@beep/schema` into the schema-v2 layout.
Modules are grouped into milestone-sized chunks so multiple agents can work in parallel without overlapping context.

## Migration Reminders

- **Effect utilities only:** all string/array/object manipulation must use Effect modules (`effect/String`,
  `effect/Array`, `effect/Struct`, etc.). Avoid native `map`, `split`, `includes`, etc.
- **Docs workflow:** after every migration, run `bun run docs:lint` (or `bun run docs:lint:file -- <path>`) plus
  `bun run docgen`; follow with `bun run docgen` when repo docs need to sync. Internal-only files currently log
  “No matching TypeScript files found” — this is expected and still updates `jsdoc-analysis-results.json`.
- **Checklist discipline:** every symbol listed below must be checked off before declaring the section complete.
- **Regex pairing:** migrating `@beep/schema/regexes` requires moving `@beep/schema/custom/Regex.schema` at the same
  time so the schemas and raw regex catalog stay aligned.
- **Annotation identities:** every schema-v2 folder exposes a local `_id.ts` that wraps `@beep/identity`. Import its
  `Id` helper (for instance `import { Id } from "./_id";`) and call `Id.annotations(...)` / `Id.compose(...)` when
  generating annotations so schema identifiers stay consistent across the package.

## Milestone Overview

- [Milestone 1 – Level 0A: Core Scalars & Seeds](#milestone-1-level-0a-core-scalars-seeds)
- [Milestone 2 – Level 0B: Locale & Regex Inputs](#milestone-2-level-0b-locale-regex-inputs)
- [Milestone 3 – Level 0C: Utility Infrastructure](#milestone-3-level-0c-utility-infrastructure)
- [Milestone 4 – Level 1A: Regex & Annotation Consumers](#milestone-4-level-1a-regex-annotation-consumers)
- [Milestone 5 – Level 1B: Utility Consumers](#milestone-5-level-1b-utility-consumers)
- [Milestone 6 – Level 2: Generics & Kit Clients](#milestone-6-level-2-generics-kit-clients)
- [Milestone 7 – Level 3: Heavy Builders & Config](#milestone-7-level-3-heavy-builders-config)
- [Milestone 8 – Level 4: Aggregated Surfaces & Namespace](#milestone-8-level-4-aggregated-surfaces-namespace)

## Milestone 1 – Level 0A: Core Scalars & Seeds
First tranche of zero-dependency modules covering annotations, base collection schemas, and temporal/fn scaffolding.

### `@beep/schema/annotations/default` → `packages/common/schema-v2/src/core/annotations/default.ts`
- [x] `BSCustomField`
- [x] `BSEdge`
- [x] `BSEdgeAnnotation`
- [x] `BSEntity`
- [x] `BSFieldName`
- [x] `BSFilterFn`
- [x] `BSFolder`
- [x] `BSFolderAnnotation`
- [x] `BSFolderType`
- [x] `BSForeignKey`
- [x] `BSRelations`
- [x] `BSSkipEntity`
- [x] `BSSkipField`
- [x] `BSTable`
- [x] `BSTransformer`
- [x] `BSUIConfig`
- [x] `DefaultAnnotations`
- [x] `FieldConfig`
- [x] `LabelAnnotationId`
- [x] `RelationConfig`
- [x] `RelationDirection`
- [x] `RelationUiForm`
- [x] `RelationUiTable`
- [x] `getUnderlyingType`

### `@beep/schema/annotations/example-annotations` → `packages/common/schema-v2/src/core/annotations/example-annotations.ts`
- [x] `makeBrandedExamples`

### `@beep/schema/custom/Array.schema` → `packages/common/schema-v2/src/derived/collections/array.ts`
- [ ] `ArrayOfNumbers`
- [ ] `Encoded`
- [ ] `Type`
- [ ] `arrayToCommaSeparatedString`

### `@beep/schema/custom/ArrayBuffer.schema` → `packages/common/schema-v2/src/primitives/binary/array-buffer.ts`
- [ ] `ArrBuffer`
- [ ] `Encoded`
- [ ] `Type`

### `@beep/schema/custom/dates/DateTime.schema` → `packages/common/schema-v2/src/primitives/temporal/dates/date-time.ts`
- [ ] `AllAcceptableDateInputs`
- [ ] `AllAcceptableDateInputsSchemaId`
- [ ] `DateFromAllAcceptable`
- [ ] `DateTimeUtcByInstantSchemaId`
- [ ] `DateTimeUtcFromAllAcceptable`
- [ ] `Encoded`
- [ ] `IsoStringToTimestamp`
- [ ] `Type`
- [ ] `normalizeIsoString`

### `@beep/schema/custom/dates/Year.schema` → `packages/common/schema-v2/src/primitives/temporal/dates/year.ts`
- [ ] `Encoded`
- [ ] `Type`
- [ ] `YearEncoded`

### `@beep/schema/custom/Duration.schema` → `packages/common/schema-v2/src/primitives/temporal/duration.ts`
- [ ] `DurationFromSeconds`
- [ ] `DurationFromSelfInput`
- [ ] `Encoded`
- [ ] `TaggedDurationInputUnion`
- [ ] `Type`

### `@beep/schema/custom/Fn/Fn.schema` → `packages/common/schema-v2/src/primitives/misc/fn/fn.ts`
- [ ] `Fn`

### `@beep/schema/custom/Fn/NoInputVoidFn/index` → `packages/common/schema-v2/src/primitives/misc/fn/no-input-void-fn/index.ts`
- [ ] `NoInputVoidFn`

### `@beep/schema/custom/Graph.schema` → `packages/common/schema-v2/src/derived/collections/graph.ts`
- [ ] `EdgeDirectionSchema`

### `@beep/schema/custom/locales/ALL_LOCALES.generated` → `packages/common/schema-v2/src/primitives/misc/locales/all-locales-generated.ts`
- [ ] `ALL_LOCALES`

### `@beep/schema/custom/location/CountryCode` → `packages/common/schema-v2/src/primitives/network/location/country-code.ts`
- [ ] `CountryCode`
- [ ] `CountryCodeKit`
- [ ] `Encoded`
- [ ] `Type`

## Milestone 2 – Level 0B: Locale & Regex Inputs
Complete the remaining zero-dependency primitives (locale + address helpers, semantic strings, raw regex helpers).
### `@beep/schema/kits/stringLiteralKit` → `packages/common/schema-v2/src/derived/kits/string-literal-kit.ts`
- [x] `LiteralKit`
- [x] `stringLiteralKit`

### `@beep/schema/custom/location/CountryFromCode` → `packages/common/schema-v2/src/primitives/network/location/country-from-code.ts`
- [x] `CountryFromCode`
- [x] `CountryName`
- [x] `CountryNameKit`
- [x] `Encoded`
- [x] `Type`

### `@beep/schema/custom/location/Locality` → `packages/common/schema-v2/src/primitives/network/location/locality.ts`
- [x] `Encoded`
- [x] `Locality`
- [x] `Type`

### `@beep/schema/custom/location/StreetLine` → `packages/common/schema-v2/src/primitives/network/location/street-line.ts`
- [x] `Encoded`
- [x] `StreetLine`
- [x] `Type`

### `@beep/schema/custom/location/SubdivisionCode` → `packages/common/schema-v2/src/primitives/network/location/subdivision-code.ts`
- [x] `Encoded`
- [x] `SubdivisionCode`
- [x] `Type`

### `@beep/schema/custom/Number.schemas` → `packages/common/schema-v2/src/primitives/number/number.ts`
- [x] `StringOrNumberToNumber`

### `@beep/schema/custom/Password.schema` → `packages/common/schema-v2/src/primitives/string/password.ts`
- [x] `Encoded`
- [x] `EncodedPassword`
- [x] `Password`
- [x] `PasswordBase`
- [x] `Type`

### `@beep/schema/custom/PgSerial.schema` → `packages/common/schema-v2/src/integrations/sql/pg-serial.ts`
- [x] `Encoded`
- [x] `PgSerialSchema`
- [x] `Type`

### `@beep/schema/custom/Regex.schema` → `packages/common/schema-v2/src/internal/regex/regex.ts`
> Migrate this module together with `@beep/schema/regexes` so the helper schemas and raw regex constants remain in sync.
- [x] `Encoded`
- [x] `Regex`
- [x] `RegexFromString`
- [x] `Type`

### `@beep/schema/custom/SemanticVersion.schema` → `packages/common/schema-v2/src/primitives/string/semantic-version.ts`
- [x] `Encoded`
- [x] `SemanticVersion`
- [x] `Type`

### `@beep/schema/custom/Transformations.schema` → `packages/common/schema-v2/src/derived/kits/transformations.ts`
- [x] `Encoded`
- [x] `IntFromStr`
- [x] `Type`

### `@beep/schema/custom/Uint8Array.schema` → `packages/common/schema-v2/src/primitives/binary/uint8-array.ts`
- [x] `Encoded`
- [x] `Type`
- [x] `Uint8Arr`

### `@beep/schema/custom/Url.schema` → `packages/common/schema-v2/src/primitives/network/url.ts`
- [x] `CustomURL`
- [x] `Encoded`
- [x] `HttpUrl`
- [x] `HttpsUrl`
- [x] `Type`
- [x] `URLFromString`
- [x] `URLString`
- [x] `Url`

## Milestone 3 – Level 0C: Utility Infrastructure
Zero-dependency identity hooks, extended schema helpers, HTTP headers, and utility shims needed by every later milestone.

### `@beep/schema/custom/UUID.schema` → `packages/common/schema-v2/src/identity/entity-id/uuid.ts`
- [ ] `BrandedUUID`
- [ ] `Encoded`
- [ ] `Type`
- [ ] `UUIDLiteral`
- [ ] `UUIDLiteralEncoded`

### `@beep/schema/EntityId/index` → `packages/common/schema-v2/src/identity/entity-id/index.ts`
- [ ] `EntityId`

### `@beep/schema/extended-schemas` → `packages/common/schema-v2/src/core/extended/extended-schemas.ts`
- [x] `Array`
- [x] `ArrayFromFallible`
- [x] `Constructor`
- [x] `Context`
- [x] `Encoded`
- [x] `Fields`
- [x] `HashSetFromFallibleArray`
- [x] `HashSetFromIterable`
- [x] `NonEmptyArray`
- [x] `NullOr`
- [x] `NullOrFromFallible`
- [x] `NullOrFromOptional`
- [x] `ReadonlyMap`
- [x] `ReadonlySet`
- [x] `SetFromFallibleArray`
- [x] `Struct`
- [x] `TrimNonEmpty`
- [x] `Tuple`
- [x] `Type`
- [x] `WithDefaults`
- [x] `WithEquality`
- [x] `defaultArray`
- [x] `defaultBool`
- [x] `defaultDate`
- [x] `defaultMap`
- [x] `defaultNullable`
- [x] `defaultSet`
- [x] `deriveAndAttachProperty`
- [x] `destructiveTransform`
- [x] `formatParseIssueMessages`
- [x] `fromKey`
- [x] `makeExactOptional`
- [x] `makeOptional`
- [x] `noHashKey`
- [x] `reverseSchema`
- [x] `withDefaultConstructor`
- [x] `withDefaultMake`

### `@beep/schema/http/HttpHeaders` → `packages/common/schema-v2/src/integrations/http/http-headers.ts`
- [ ] `Encoded`
- [ ] `HttpHeaders`
- [ ] `Type`

### `@beep/schema/JsonSchema` → `packages/common/schema-v2/src/builders/json-schema/index.ts`
- [ ] `$JsonType`
- [ ] `ArraySchema`
- [ ] `BooleanSchema`
- [ ] `Encoded`
- [ ] `IntegerSchema`
- [ ] `JsonSchema`
- [ ] `NullSchema`
- [ ] `NumberSchema`
- [ ] `ObjectSchema`
- [ ] `StringSchema`
- [ ] `Type`
- [ ] `_JsonSchema`

### `@beep/schema/schema-system/CustomFieldSchema` → `packages/common/schema-v2/src/builders/introspection/custom-field-schema.ts`
- [ ] `BooleanFieldSchema`
- [ ] `CustomFieldSchema`
- [ ] `DateFieldSchema`
- [ ] `NumberFieldSchema`
- [ ] `StringFieldSchema`
- [ ] `getCustomFieldValue`
- [ ] `makeCustomField`

### `@beep/schema/schema-system/relationship-utils` → `packages/common/schema-v2/src/builders/introspection/relationship-utils.ts`
- [ ] `GroupedRelationships`
- [ ] `RelationshipInput`
- [ ] `RelationshipPair`
- [ ] `compressPairs`
- [ ] `compressRelationshipInputs`
- [ ] `expandBidirectionalPairs`
- [ ] `groupPairsBySource`

### `@beep/schema/types` → `packages/common/schema-v2/src/core/types.ts`
- [x] `OptionalWithDefault`

### `@beep/schema/utils/arbitrary` → `packages/common/schema-v2/src/core/utils/arbitrary.ts`
- [x] `makeArb`
- [x] `makeArbs`
- [x] `makeFlat`

### `@beep/schema/utils/brands` → `packages/common/schema-v2/src/core/utils/brands.ts`
- [x] `brand`
- [x] `makeBranded`

### `@beep/schema/utils/mergeFields` → `packages/common/schema-v2/src/core/utils/merge-fields.ts`
- [x] `mergeFields`

### `@beep/schema/utils/WithDefaultsThunk/index` → `packages/common/schema-v2/src/core/utils/with-defaults-thunk/index.ts`
- [x] `WithDefaultsThunk`

### `@beep/schema/utils/WithDefaultsThunk/WithDefaultsThunk` → `packages/common/schema-v2/src/core/utils/with-defaults-thunk/with-defaults-thunk.ts`
- [x] `Maker`
- [x] `Type`
- [x] `make`

### `@beep/schema/variance` → `packages/common/schema-v2/src/core/variance.ts`
- [x] `variance`

## Milestone 4 – Level 1A: Regex & Annotation Consumers
Modules that depend on Level 0 surfaces exactly once (regex validation, literal branding, timestamp transforms).

### `@beep/schema/custom/dates/Timestamp.schema` → `packages/common/schema-v2/src/primitives/temporal/dates/timestamp.ts`
- [ ] `TimestampToIsoString`

### `@beep/schema/custom/Fn/NoInputVoidFn/NoInputVoidFn` → `packages/common/schema-v2/src/primitives/misc/fn/no-input-void-fn/no-input-void-fn.ts`
- [ ] `Encoded`
- [ ] `Type`

### `@beep/schema/custom/Literal.schema` → `packages/common/schema-v2/src/derived/kits/literal.ts`
- [ ] `Encoded`
- [ ] `LiteralDefaults`
- [ ] `LiteralWithDefault`
- [ ] `Schema`
- [ ] `Type`

### `@beep/schema/regexes` → `packages/common/schema-v2/src/internal/regex/regexes.ts`
- [x] `AUSTRALIA_POSTAL_CODE_REGEX`
- [x] `BRAZIL_POSTAL_CODE_REGEX`
- [x] `CANADA_POSTAL_CODE_REGEX`
- [x] `FRANCE_POSTAL_CODE_REGEX`
- [x] `GERMANY_POSTAL_CODE_REGEX`
- [x] `GREAT_BRITAIN_POSTAL_CODE_REGEX`
- [x] `IRELAND_POSTAL_CODE_REGEX`
- [x] `NETHERLANDS_POSTAL_CODE_REGEX`
- [x] `NO_ASCII_CTRL`
- [x] `POSTAL_CODE_REGEX`
- [x] `US_POSTAL_CODE_REGEX`
- [x] `base64`
- [x] `base64url`
- [x] `bigint`
- [x] `boolean`
- [x] `browserEmail`
- [x] `cidrv4`
- [x] `cidrv6`
- [x] `css_hex_color_regex`
- [x] `cuid`
- [x] `cuid2`
- [x] `date`
- [x] `datetime`
- [x] `domain`
- [x] `domain_label`
- [x] `duration`
- [x] `e164`
- [x] `email`
- [x] `emoji`
- [x] `extendedDuration`
- [x] `guid`
- [x] `hex`
- [x] `hostname`
- [x] `html5Email`
- [x] `idnEmail`
- [x] `integer`
- [x] `ipv4`
- [x] `ipv6`
- [x] `ksuid`
- [x] `lowercase`
- [x] `md5_base64`
- [x] `md5_base64url`
- [x] `md5_hex`
- [x] `nanoid`
- [x] `number`
- [x] `path_regex`
- [x] `prop_regex`
- [x] `rfc3339DateTime`
- [x] `rfc5322Email`
- [x] `rfc_3987_url_regex`
- [x] `rgb_number_part_regex`
- [x] `sha1_base64`
- [x] `sha1_base64url`
- [x] `sha1_hex`
- [x] `sha256_base64`
- [x] `sha256_base64url`
- [x] `sha256_hex`
- [x] `sha384_base64`
- [x] `sha384_base64url`
- [x] `sha384_hex`
- [x] `sha512_base64`
- [x] `sha512_base64url`
- [x] `sha512_hex`
- [x] `slug`
- [x] `snakeCaseTagRegex`
- [x] `string`
- [x] `time`
- [x] `top_level_domain`
- [x] `ulid`
- [x] `unicodeEmail`
- [x] `uppercase`
- [x] `uuid`
- [x] `uuid4`
- [x] `uuid6`
- [x] `uuid7`
- [x] `xid`

### `@beep/schema/custom/Domain.schema` → `packages/common/schema-v2/src/primitives/network/domain.ts`
- [ ] `DomainLabel`
- [ ] `DomainName`
- [ ] `Encoded`
- [ ] `TopLevelDomain`
- [ ] `Type`

### `@beep/schema/custom/Email.schema` → `packages/common/schema-v2/src/primitives/string/email.ts`
- [ ] `Email`
- [ ] `EmailBase`
- [ ] `EmailEncoded`
- [ ] `Encoded`
- [ ] `Type`

### `@beep/schema/custom/Hex.schema` → `packages/common/schema-v2/src/primitives/string/hex.ts`
- [ ] `Decoded`
- [ ] `Encoded`
- [ ] `HexColor`
- [ ] `HexColorDecoded`
- [ ] `HexColorEncoded`
- [ ] `Type`

### `@beep/schema/custom/IP.schema` → `packages/common/schema-v2/src/primitives/network/ip.ts`
- [ ] `Encoded`
- [ ] `IP`
- [ ] `IPv4`
- [ ] `IPv6`
- [ ] `Type`

### `@beep/schema/custom/Json.schema` → `packages/common/schema-v2/src/primitives/misc/json.ts`
- [ ] `Encoded`
- [ ] `Json`
- [ ] `JsonArray`
- [ ] `JsonLiteral`
- [ ] `JsonPath`
- [ ] `JsonProp`
- [ ] `JsonStringToArray`
- [ ] `JsonStringToStringArray`
- [ ] `NonEmptyJsonArray`
- [ ] `Type`
- [ ] `equalsJson`
- [ ] `jsonEq`

### `@beep/schema/custom/location/PostalCode` → `packages/common/schema-v2/src/primitives/network/location/postal-code.ts`
- [ ] `Encoded`
- [ ] `PostalCode`
- [ ] `PostalCodeRaw`
- [ ] `PostalCodeRawDecoded`
- [ ] `PostalCodeRawEncoded`
- [ ] `Type`

## Milestone 5 – Level 1B: Utility Consumers
Single-dependency modules relying on utils or SQL helpers (name/person assets, nullable kits, bool/url path helpers).

### `@beep/schema/custom/NameAttribute.schema` → `packages/common/schema-v2/src/primitives/string/name-attribute.ts`
- [ ] `Encoded`
- [ ] `NameAttribute`
- [ ] `Type`

### `@beep/schema/custom/person/PersonAttributes` → `packages/common/schema-v2/src/primitives/misc/person/person-attributes.ts`
- [ ] `BirthDate`
- [ ] `Encoded`
- [ ] `FirstName`
- [ ] `FullName`
- [ ] `LastName`
- [ ] `MiddleName`
- [ ] `Type`

### `@beep/schema/custom/Phone.schema` → `packages/common/schema-v2/src/primitives/string/phone.ts`
- [ ] `Encoded`
- [ ] `Phone`
- [ ] `Type`
- [ ] `UnsafePhone`

### `@beep/schema/custom/Slug.schema` → `packages/common/schema-v2/src/primitives/string/slug.ts`
- [ ] `Encoded`
- [ ] `Slug`
- [ ] `SlugBase`
- [ ] `Type`

### `@beep/schema/custom/String.schema` → `packages/common/schema-v2/src/primitives/string/string.ts`
- [ ] `Encoded`
- [ ] `Literal`
- [ ] `SnakeTag`
- [ ] `StringPropertyOmittable`
- [ ] `StringWithDefault`
- [ ] `Type`

### `@beep/schema/sql/common` → `packages/common/schema-v2/src/integrations/sql/common.ts`
- [ ] `DateTimeFromDate`
- [ ] `DateTimeInsertFromDateOmittable`
- [ ] `DateTimeUpdateFromDateOmittable`
- [ ] `FieldOmittableWithDefault`
- [ ] `FieldOptionOmittable`
- [ ] `FieldSensitiveOptionOmittable`
- [ ] `JsonFromStringOption`

### `@beep/schema/custom/Nullables.schema` → `packages/common/schema-v2/src/derived/kits/nullables.ts`
- [ ] `Encoded`
- [ ] `NullableDate`
- [ ] `NullableNum`
- [ ] `NullableStr`
- [ ] `NullableUnknown`
- [ ] `Type`

### `@beep/schema/utils/toOptionalWith` → `packages/common/schema-v2/src/core/utils/to-optional-with.ts`
- [x] `toOptionalWithDefault`

### `@beep/schema/custom/Bool.schema` → `packages/common/schema-v2/src/primitives/bool/bool.ts`
- [ ] `BoolFalse`
- [ ] `BoolSchema`
- [ ] `BoolTrue`
- [ ] `BoolWithDefault`
- [ ] `Encoded`
- [ ] `FalseLiteral`
- [ ] `TrueLiteral`
- [ ] `Type`

### `@beep/schema/custom/URLPath.schema` → `packages/common/schema-v2/src/primitives/misc/urlpath.ts`
- [ ] `Branded`
- [ ] `Encoded`
- [ ] `Type`
- [ ] `URLPath`

## Milestone 6 – Level 2: Generics & Kit Clients
Generics, the string literal kit, and all primitives that rely on those derived factories (currency codes, MIME types, forms, enums).

### `@beep/schema/generics/TaggedStruct` → `packages/common/schema-v2/src/core/generics/tagged-struct.ts`
- [x] `Schema`
- [x] `TaggedStruct`
- [x] `Type`

### `@beep/schema/generics/TaggedUnion` → `packages/common/schema-v2/src/core/generics/tagged-union.ts`
- [x] `Schema`
- [x] `TaggedUnion`
- [x] `Type`

### `@beep/schema/custom/CurrencyCode.schema` → `packages/common/schema-v2/src/primitives/string/currency-code.ts`
- [ ] `CurrencyCode`
- [ ] `CurrencyCodeKit`
- [ ] `Encoded`
- [ ] `Type`

### `@beep/schema/custom/dates/Month.schema` → `packages/common/schema-v2/src/primitives/temporal/dates/month.ts`
- [ ] `Encoded`
- [ ] `MonthInt`
- [ ] `MonthInts`
- [ ] `MonthNumber`
- [ ] `MonthNumberFromMonthInt`
- [ ] `MonthNumberKit`
- [ ] `MonthString`
- [ ] `MonthStringKit`
- [ ] `Type`
- [ ] `monthIntToNumber`
- [ ] `monthNumberToInt`

### `@beep/schema/custom/FileExtension.schema` → `packages/common/schema-v2/src/primitives/string/file-extension.ts`
- [ ] `ApplicationExtension`
- [ ] `ApplicationExtensionKit`
- [ ] `AudioExtension`
- [ ] `AudioExtensionKit`
- [ ] `Encoded`
- [ ] `FileExtension`
- [ ] `FileExtensionKit`
- [ ] `FontExtension`
- [ ] `FontExtensionKit`
- [ ] `ImageExtension`
- [ ] `ImageExtensionKit`
- [ ] `TextExtension`
- [ ] `TextExtensionKit`
- [ ] `Type`
- [ ] `VideoExtension`
- [ ] `VideoExtensionKit`

### `@beep/schema/custom/locales/Locale` → `packages/common/schema-v2/src/primitives/misc/locales/locale.ts`
- [ ] `Encoded`
- [ ] `Locale`
- [ ] `LocaleKit`
- [ ] `Type`

### `@beep/schema/custom/location/USState` → `packages/common/schema-v2/src/primitives/network/location/usstate.ts`
- [ ] `Encoded`
- [ ] `Type`
- [ ] `USStateCode`
- [ ] `USStateCodeKit`
- [ ] `USStateName`
- [ ] `USStateNameFromCode`
- [ ] `USStateNameKit`

### `@beep/schema/custom/MimeType.schema` → `packages/common/schema-v2/src/primitives/network/mime-type.ts`
- [ ] `ApplicationExtensionMimeTypeMap`
- [ ] `ApplicationMimeType`
- [ ] `ApplicationMimeTypeKit`
- [ ] `AudioExtensionMimeTypeMap`
- [ ] `AudioMimeType`
- [ ] `AudioMimeTypeKit`
- [ ] `Encoded`
- [ ] `FileExtensionMimeTypeMap`
- [ ] `FontExtensionMimeTypeMap`
- [ ] `FontMimeType`
- [ ] `FontMimeTypeKit`
- [ ] `ImageExtensionMimeTypeMap`
- [ ] `ImageMimeType`
- [ ] `ImageMimeTypeKit`
- [ ] `MimeType`
- [ ] `MimeTypeKit`
- [ ] `TextExtensionMimeTypeMap`
- [ ] `TextMimeType`
- [ ] `TextMimeTypeKit`
- [ ] `Type`
- [ ] `VideoExtensionMimeTypeMap`
- [ ] `VideoMimeType`
- [ ] `VideoMimeTypeKit`

### `@beep/schema/form/field.schema` → `packages/common/schema-v2/src/builders/form/field.ts`
- [ ] `Encoded`
- [ ] `FormFieldFormat`
- [ ] `FormFieldFormatKit`
- [ ] `FormFieldSchema`
- [ ] `FormFieldType`
- [ ] `FormFieldTypeKit`
- [ ] `Type`

### `@beep/schema/form/form.schema` → `packages/common/schema-v2/src/builders/form/form.ts`
- [ ] `FormJsonSchema`

### `@beep/schema/http/HttpMethod` → `packages/common/schema-v2/src/integrations/http/http-method.ts`
- [ ] `Encoded`
- [ ] `HttpMethod`
- [ ] `HttpMethodKit`
- [ ] `Type`

### `@beep/schema/sql/pg-enum` → `packages/common/schema-v2/src/integrations/sql/pg-enum.ts`
- [ ] `toPgEnum`

## Milestone 7 – Level 3: Heavy Builders & Config
High-dependency surfaces (schema-system auto-detection/filtering/defaults) plus config/CSP and RGB helpers.

### `@beep/schema/schema-system/auto-detection` → `packages/common/schema-v2/src/builders/introspection/auto-detection.ts`
- [ ] `autoDetectCellConfig`
- [ ] `autoDetectFieldConfig`

### `@beep/schema/schema-system/filtering` → `packages/common/schema-v2/src/builders/introspection/filtering.ts`
- [ ] `ENTITY_TYPE_FIELDS`
- [ ] `IDENTIFICATION_FIELDS`
- [ ] `SYSTEM_FIELDS_TO_HIDE`
- [ ] `getContextConfig`
- [ ] `getVisibleFields`
- [ ] `isEntityTypeField`
- [ ] `isIdentificationField`
- [ ] `isSystemField`
- [ ] `shouldHideField`

### `@beep/schema/schema-system/defaultValues` → `packages/common/schema-v2/src/builders/introspection/default-values.ts`
- [ ] `generateDefaultValues`
- [ ] `generateDefaultValuesWithOverrides`

### `@beep/schema/config/Csp` → `packages/common/schema-v2/src/integrations/config/csp.ts`
- [ ] `CSPDirective`
- [ ] `CSPDirectiveKit`
- [ ] `CSPDirectivePart`
- [ ] `CSPDirectiveValue`
- [ ] `CSPDirectiveValues`
- [ ] `CSPFromString`
- [ ] `CSPString`
- [ ] `CSPStruct`
- [ ] `Csp`
- [ ] `DEFAULT_VALUES`
- [ ] `Encoded`
- [ ] `POLICY_DELIMITER`
- [ ] `StaticDirective`
- [ ] `StaticDirectiveKit`
- [ ] `Type`
- [ ] `toHeader`

### `@beep/schema/custom/RGB.schema` → `packages/common/schema-v2/src/primitives/string/rgb.ts`
- [ ] `DiscriminatedRGBPart`
- [ ] `Encoded`
- [ ] `RGBFromHex`
- [ ] `RGBLiteralValue`
- [ ] `RGBLiteralValueEncoded`
- [ ] `RGBLiteralValueFromString`
- [ ] `RGBLiteralValueFromTuple`
- [ ] `RGBNumberPart`
- [ ] `RGBPart`
- [ ] `RGBPercentPart`
- [ ] `RGBValuesTuple`
- [ ] `TaggedRGBNumberPart`
- [ ] `TaggedRGBPercentPart`
- [ ] `Type`
- [ ] `rgbChannelToHex`

### `@beep/schema/generics/TaggedUnion.factory` → `packages/common/schema-v2/src/core/generics/tagged-union-factory.ts`
- [x] `FilterUnion`
- [x] `TaggedUnionFactory`
- [x] `TaggedUnionFactoryBuilder`

## Milestone 8 – Level 4: Aggregated Surfaces & Namespace
Modules pulling in broad swaths of the package (SystemSchema, introspection, EntityId runtime, HTTP request details, and the final index barrel).

### `@beep/schema/schema-system/SystemSchema` → `packages/common/schema-v2/src/builders/introspection/system-schema.ts`
- [ ] `BaseIdentifiedEntity`
- [ ] `BaseSystemFields`

### `@beep/schema/schema-system/introspection` → `packages/common/schema-v2/src/builders/introspection/introspection.ts`
- [ ] `ExtractedField`
- [ ] `enrichMutationData`
- [ ] `extractAST`
- [ ] `extractEntityInfo`
- [ ] `extractEntityName`
- [ ] `extractEntityTagOpt`
- [ ] `extractLiteralOptions`
- [ ] `extractSchemaFields`
- [ ] `getAnnotationFromSchema`
- [ ] `getCreateSchema`
- [ ] `getDeleteSchema`
- [ ] `getUiConfig`
- [ ] `getUiConfigFromAST`
- [ ] `getUpdateSchema`
- [ ] `getZeroMutationSchema`
- [ ] `hasEmailPattern`
- [ ] `validateMutationData`

### `@beep/schema/EntityId/EntityId` → `packages/common/schema-v2/src/identity/entity-id/entity-id.ts`
- [ ] `Encoded`
- [ ] `EntityIdSchemaInstance`
- [ ] `Factory`
- [ ] `PrivateId`
- [ ] `PublicId`
- [ ] `SchemaType`
- [ ] `Type`
- [x] `make`

### `@beep/schema/http/HttpRequestDetails` → `packages/common/schema-v2/src/integrations/http/http-request-details.ts`
- [ ] `Encoded`
- [ ] `HttpRequestDetails`
- [ ] `Type`

### `@beep/schema/index` → `packages/common/schema-v2/src/index.ts`
- [ ] `BS`
## Review Backlog
Anything not auto-categorized lands here for manual triage before migration.

_No modules assigned yet._

## Agent Prompts
### Milestone 1 – Level 0A: Core Scalars & Seeds
```text
You are migrating Milestone 1 – Level 0A: Core Scalars & Seeds for @beep/schema → schema-v2.
Scope:
- `@beep/schema/annotations/default` → `packages/common/schema-v2/src/core/annotations/default.ts`
- `@beep/schema/annotations/example-annotations` → `packages/common/schema-v2/src/core/annotations/example-annotations.ts`
- `@beep/schema/custom/Array.schema` → `packages/common/schema-v2/src/derived/collections/array.ts`
- `@beep/schema/custom/ArrayBuffer.schema` → `packages/common/schema-v2/src/primitives/binary/array-buffer.ts`
- `@beep/schema/custom/dates/DateTime.schema` → `packages/common/schema-v2/src/primitives/temporal/dates/date-time.ts`
- `@beep/schema/custom/dates/Year.schema` → `packages/common/schema-v2/src/primitives/temporal/dates/year.ts`
- `@beep/schema/custom/Duration.schema` → `packages/common/schema-v2/src/primitives/temporal/duration.ts`
- `@beep/schema/custom/Fn/Fn.schema` → `packages/common/schema-v2/src/primitives/misc/fn/fn.ts`
- `@beep/schema/custom/Fn/NoInputVoidFn/index` → `packages/common/schema-v2/src/primitives/misc/fn/no-input-void-fn/index.ts`
- `@beep/schema/custom/Graph.schema` → `packages/common/schema-v2/src/derived/collections/graph.ts`
- `@beep/schema/custom/locales/ALL_LOCALES.generated` → `packages/common/schema-v2/src/primitives/misc/locales/all-locales-generated.ts`
- `@beep/schema/custom/location/CountryCode` → `packages/common/schema-v2/src/primitives/network/location/country-code.ts`

Instructions:
1. Migrate modules in-order so upstream dependencies stay satisfied.
2. Enforce Effect guardrails (Array/String/Object utilities).
3. Follow DOCUMENTATION_STRATEGY for JSDoc and run `bun run docs:lint:file -- <path>` or `bun run docs:lint` plus `bun run docgen` (then `bun run docs:site` if docs need syncing).
4. Update `packages/common/schema-v2/MIGRATION_CHECKLIST.md` checkboxes as you go.
5. Keep changes scoped to this milestone.

```

### Milestone 2 – Level 0B: Locale & Regex Inputs
```text
You are migrating Milestone 2 – Level 0B: Locale & Regex Inputs for @beep/schema → schema-v2.
Scope:
- `@beep/schema/custom/location/CountryFromCode` → `packages/common/schema-v2/src/primitives/network/location/country-from-code.ts`
- `@beep/schema/custom/location/Locality` → `packages/common/schema-v2/src/primitives/network/location/locality.ts`
- `@beep/schema/custom/location/StreetLine` → `packages/common/schema-v2/src/primitives/network/location/street-line.ts`
- `@beep/schema/custom/location/SubdivisionCode` → `packages/common/schema-v2/src/primitives/network/location/subdivision-code.ts`
- `@beep/schema/custom/Number.schemas` → `packages/common/schema-v2/src/primitives/number/number.ts`
- `@beep/schema/custom/Password.schema` → `packages/common/schema-v2/src/primitives/string/password.ts`
- `@beep/schema/custom/PgSerial.schema` → `packages/common/schema-v2/src/integrations/sql/pg-serial.ts`
- `@beep/schema/custom/Regex.schema` → `packages/common/schema-v2/src/internal/regex/regex.ts`
- `@beep/schema/custom/SemanticVersion.schema` → `packages/common/schema-v2/src/primitives/string/semantic-version.ts`
- `@beep/schema/custom/Transformations.schema` → `packages/common/schema-v2/src/derived/kits/transformations.ts`
- `@beep/schema/custom/Uint8Array.schema` → `packages/common/schema-v2/src/primitives/binary/uint8-array.ts`
- `@beep/schema/custom/Url.schema` → `packages/common/schema-v2/src/primitives/network/url.ts`

Instructions:
1. Migrate modules in-order so upstream dependencies stay satisfied.
2. Enforce Effect guardrails (Array/String/Object utilities).
3. Follow DOCUMENTATION_STRATEGY for JSDoc and run `bun run docs:lint:file -- <path>` or `bun run docs:lint` plus `bun run docgen` (then `bun run docs:site` if docs need syncing).
4. Update `packages/common/schema-v2/MIGRATION_CHECKLIST.md` checkboxes as you go.
5. Keep changes scoped to this milestone.

```

### Milestone 3 – Level 0C: Utility Infrastructure
```text
You are migrating Milestone 3 – Level 0C: Utility Infrastructure for @beep/schema → schema-v2.
Scope:
- `@beep/schema/custom/UUID.schema` → `packages/common/schema-v2/src/identity/entity-id/uuid.ts`
- `@beep/schema/EntityId/index` → `packages/common/schema-v2/src/identity/entity-id/index.ts`
- `@beep/schema/extended-schemas` → `packages/common/schema-v2/src/core/extended/extended-schemas.ts`
- `@beep/schema/http/HttpHeaders` → `packages/common/schema-v2/src/integrations/http/http-headers.ts`
- `@beep/schema/JsonSchema` → `packages/common/schema-v2/src/builders/json-schema/index.ts`
- `@beep/schema/schema-system/CustomFieldSchema` → `packages/common/schema-v2/src/builders/introspection/custom-field-schema.ts`
- `@beep/schema/schema-system/relationship-utils` → `packages/common/schema-v2/src/builders/introspection/relationship-utils.ts`
- `@beep/schema/types` → `packages/common/schema-v2/src/core/types.ts`
- `@beep/schema/utils/arbitrary` → `packages/common/schema-v2/src/core/utils/arbitrary.ts`
- `@beep/schema/utils/brands` → `packages/common/schema-v2/src/core/utils/brands.ts`
- `@beep/schema/utils/mergeFields` → `packages/common/schema-v2/src/core/utils/merge-fields.ts`
- `@beep/schema/utils/WithDefaultsThunk/index` → `packages/common/schema-v2/src/core/utils/with-defaults-thunk/index.ts`
- `@beep/schema/utils/WithDefaultsThunk/WithDefaultsThunk` → `packages/common/schema-v2/src/core/utils/with-defaults-thunk/with-defaults-thunk.ts`
- `@beep/schema/variance` → `packages/common/schema-v2/src/core/variance.ts`

Instructions:
1. Migrate modules in-order so upstream dependencies stay satisfied.
2. Enforce Effect guardrails (Array/String/Object utilities).
3. Follow DOCUMENTATION_STRATEGY for JSDoc and run `bun run docs:lint:file -- <path>` or `bun run docs:lint` plus `bun run docgen` (then `bun run docs:site` if docs need syncing).
4. Update `packages/common/schema-v2/MIGRATION_CHECKLIST.md` checkboxes as you go.
5. Keep changes scoped to this milestone.

```

### Milestone 4 – Level 1A: Regex & Annotation Consumers
```text
You are migrating Milestone 4 – Level 1A: Regex & Annotation Consumers for @beep/schema → schema-v2.
Scope:
- `@beep/schema/custom/dates/Timestamp.schema` → `packages/common/schema-v2/src/primitives/temporal/dates/timestamp.ts`
- `@beep/schema/custom/Fn/NoInputVoidFn/NoInputVoidFn` → `packages/common/schema-v2/src/primitives/misc/fn/no-input-void-fn/no-input-void-fn.ts`
- `@beep/schema/custom/Literal.schema` → `packages/common/schema-v2/src/derived/kits/literal.ts`
- `@beep/schema/regexes` → `packages/common/schema-v2/src/internal/regex/regexes.ts`
- `@beep/schema/custom/Domain.schema` → `packages/common/schema-v2/src/primitives/network/domain.ts`
- `@beep/schema/custom/Email.schema` → `packages/common/schema-v2/src/primitives/string/email.ts`
- `@beep/schema/custom/Hex.schema` → `packages/common/schema-v2/src/primitives/string/hex.ts`
- `@beep/schema/custom/IP.schema` → `packages/common/schema-v2/src/primitives/network/ip.ts`
- `@beep/schema/custom/Json.schema` → `packages/common/schema-v2/src/primitives/misc/json.ts`
- `@beep/schema/custom/location/PostalCode` → `packages/common/schema-v2/src/primitives/network/location/postal-code.ts`

Instructions:
1. Migrate modules in-order so upstream dependencies stay satisfied.
2. Enforce Effect guardrails (Array/String/Object utilities).
3. Follow DOCUMENTATION_STRATEGY for JSDoc and run `bun run docs:lint:file -- <path>` or `bun run docs:lint` plus `bun run docgen` (then `bun run docs:site` if docs need syncing).
4. Update `packages/common/schema-v2/MIGRATION_CHECKLIST.md` checkboxes as you go.
5. Keep changes scoped to this milestone.

```

### Milestone 5 – Level 1B: Utility Consumers
```text
You are migrating Milestone 5 – Level 1B: Utility Consumers for @beep/schema → schema-v2.
Scope:
- `@beep/schema/custom/NameAttribute.schema` → `packages/common/schema-v2/src/primitives/string/name-attribute.ts`
- `@beep/schema/custom/person/PersonAttributes` → `packages/common/schema-v2/src/primitives/misc/person/person-attributes.ts`
- `@beep/schema/custom/Phone.schema` → `packages/common/schema-v2/src/primitives/string/phone.ts`
- `@beep/schema/custom/Slug.schema` → `packages/common/schema-v2/src/primitives/string/slug.ts`
- `@beep/schema/custom/String.schema` → `packages/common/schema-v2/src/primitives/string/string.ts`
- `@beep/schema/sql/common` → `packages/common/schema-v2/src/integrations/sql/common.ts`
- `@beep/schema/custom/Nullables.schema` → `packages/common/schema-v2/src/derived/kits/nullables.ts`
- `@beep/schema/utils/toOptionalWith` → `packages/common/schema-v2/src/core/utils/to-optional-with.ts`
- `@beep/schema/custom/Bool.schema` → `packages/common/schema-v2/src/primitives/misc/bool.ts`
- `@beep/schema/custom/URLPath.schema` → `packages/common/schema-v2/src/primitives/misc/urlpath.ts`

Instructions:
1. Migrate modules in-order so upstream dependencies stay satisfied.
2. Enforce Effect guardrails (Array/String/Object utilities).
3. Follow DOCUMENTATION_STRATEGY for JSDoc and run `bun run docs:lint:file -- <path>` or `bun run docs:lint` plus `bun run docgen` (then `bun run docs:site` if docs need syncing).
4. Update `packages/common/schema-v2/MIGRATION_CHECKLIST.md` checkboxes as you go.
5. Keep changes scoped to this milestone.

```

### Milestone 6 – Level 2: Generics & Kit Clients
```text
You are migrating Milestone 6 – Level 2: Generics & Kit Clients for @beep/schema → schema-v2.
Scope:
- `@beep/schema/generics/TaggedStruct` → `packages/common/schema-v2/src/core/generics/tagged-struct.ts`
- `@beep/schema/generics/TaggedUnion` → `packages/common/schema-v2/src/core/generics/tagged-union.ts`
- `@beep/schema/kits/stringLiteralKit` → `packages/common/schema-v2/src/derived/kits/string-literal-kit.ts`
- `@beep/schema/custom/CurrencyCode.schema` → `packages/common/schema-v2/src/primitives/string/currency-code.ts`
- `@beep/schema/custom/dates/Month.schema` → `packages/common/schema-v2/src/primitives/temporal/dates/month.ts`
- `@beep/schema/custom/FileExtension.schema` → `packages/common/schema-v2/src/primitives/string/file-extension.ts`
- `@beep/schema/custom/locales/Locale` → `packages/common/schema-v2/src/primitives/misc/locales/locale.ts`
- `@beep/schema/custom/location/USState` → `packages/common/schema-v2/src/primitives/network/location/usstate.ts`
- `@beep/schema/custom/MimeType.schema` → `packages/common/schema-v2/src/primitives/network/mime-type.ts`
- `@beep/schema/form/field.schema` → `packages/common/schema-v2/src/builders/form/field.ts`
- `@beep/schema/form/form.schema` → `packages/common/schema-v2/src/builders/form/form.ts`
- `@beep/schema/http/HttpMethod` → `packages/common/schema-v2/src/integrations/http/http-method.ts`
- `@beep/schema/sql/pg-enum` → `packages/common/schema-v2/src/integrations/sql/pg-enum.ts`

Instructions:
1. Migrate modules in-order so upstream dependencies stay satisfied.
2. Enforce Effect guardrails (Array/String/Object utilities).
3. Follow DOCUMENTATION_STRATEGY for JSDoc and run `bun run docs:lint:file -- <path>` or `bun run docs:lint` plus `bun run docgen` (then `bun run docs:site` if docs need syncing).
4. Update `packages/common/schema-v2/MIGRATION_CHECKLIST.md` checkboxes as you go.
5. Keep changes scoped to this milestone.

```

### Milestone 7 – Level 3: Heavy Builders & Config
```text
You are migrating Milestone 7 – Level 3: Heavy Builders & Config for @beep/schema → schema-v2.
Scope:
- `@beep/schema/schema-system/auto-detection` → `packages/common/schema-v2/src/builders/introspection/auto-detection.ts`
- `@beep/schema/schema-system/filtering` → `packages/common/schema-v2/src/builders/introspection/filtering.ts`
- `@beep/schema/schema-system/defaultValues` → `packages/common/schema-v2/src/builders/introspection/default-values.ts`
- `@beep/schema/config/Csp` → `packages/common/schema-v2/src/integrations/config/csp.ts`
- `@beep/schema/custom/RGB.schema` → `packages/common/schema-v2/src/primitives/string/rgb.ts`
- `@beep/schema/generics/TaggedUnion.factory` → `packages/common/schema-v2/src/core/generics/tagged-union-factory.ts`

Instructions:
1. Migrate modules in-order so upstream dependencies stay satisfied.
2. Enforce Effect guardrails (Array/String/Object utilities).
3. Follow DOCUMENTATION_STRATEGY for JSDoc and run `bun run docs:lint:file -- <path>` or `bun run docs:lint` plus `bun run docgen` (then `bun run docs:site` if docs need syncing).
4. Update `packages/common/schema-v2/MIGRATION_CHECKLIST.md` checkboxes as you go.
5. Keep changes scoped to this milestone.

```

### Milestone 8 – Level 4: Aggregated Surfaces & Namespace
```text
You are migrating Milestone 8 – Level 4: Aggregated Surfaces & Namespace for @beep/schema → schema-v2.
Scope:
- `@beep/schema/schema-system/SystemSchema` → `packages/common/schema-v2/src/builders/introspection/system-schema.ts`
- `@beep/schema/schema-system/introspection` → `packages/common/schema-v2/src/builders/introspection/introspection.ts`
- `@beep/schema/EntityId/EntityId` → `packages/common/schema-v2/src/identity/entity-id/entity-id.ts`
- `@beep/schema/http/HttpRequestDetails` → `packages/common/schema-v2/src/integrations/http/http-request-details.ts`
- `@beep/schema/index` → `packages/common/schema-v2/src/index.ts`

Instructions:
1. Migrate modules in-order so upstream dependencies stay satisfied.
2. Enforce Effect guardrails (Array/String/Object utilities).
3. Follow DOCUMENTATION_STRATEGY for JSDoc and run `bun run docs:lint:file -- <path>` or `bun run docs:lint` plus `bun run docgen` (then `bun run docs:site` if docs need syncing).
4. Update `packages/common/schema-v2/MIGRATION_CHECKLIST.md` checkboxes as you go.
5. Keep changes scoped to this milestone.

```
