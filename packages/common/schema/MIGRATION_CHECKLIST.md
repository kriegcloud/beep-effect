# Schema v2 Migration Checklist

Use this checklist to coordinate the incremental migration from `@beep/schema` into the schema layout.
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
- **Annotation identities:** every schema folder exposes a local `_id.ts` that wraps `@beep/identity`. Import its
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

### `@beep/schema/annotations/default` → `packages/common/schema/src/core/annotations/default.ts`
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

### `@beep/schema/annotations/example-annotations` → `packages/common/schema/src/core/annotations/example-annotations.ts`
- [x] `makeBrandedExamples`

### `@beep/schema/custom/Array.schema` → `packages/common/schema/src/derived/collections/array.ts`
- [ ] `ArrayOfNumbers`
- [x] `Encoded`
- [x] `Type`
- [ ] `arrayToCommaSeparatedString`

### `@beep/schema/custom/ArrayBuffer.schema` → `packages/common/schema/src/primitives/binary/array-buffer.ts`
- [ ] `ArrBuffer`
- [x] `Encoded`
- [x] `Type`

### `@beep/schema/custom/dates/DateTime.schema` → `packages/common/schema/src/primitives/temporal/dates/date-time.ts`
- [ ] `AllAcceptableDateInputs`
- [ ] `AllAcceptableDateInputsSchemaId`
- [ ] `DateFromAllAcceptable`
- [ ] `DateTimeUtcByInstantSchemaId`
- [ ] `DateTimeUtcFromAllAcceptable`
- [x] `Encoded`
- [ ] `IsoStringToTimestamp`
- [x] `Type`
- [ ] `normalizeIsoString`

### `@beep/schema/custom/dates/Year.schema` → `packages/common/schema/src/primitives/temporal/dates/year.ts`
- [x] `Encoded`
- [x] `Type`
- [ ] `YearEncoded`

### `@beep/schema/custom/Duration.schema` → `packages/common/schema/src/primitives/temporal/duration.ts`
- [ ] `DurationFromSeconds`
- [ ] `DurationFromSelfInput`
- [x] `Encoded`
- [ ] `TaggedDurationInputUnion`
- [x] `Type`

### `@beep/schema/custom/Fn/Fn.schema` → `packages/common/schema/src/primitives/misc/fn/fn.ts`
- [x] `Fn`

### `@beep/schema/custom/Fn/NoInputVoidFn/index` → `packages/common/schema/src/primitives/misc/fn/no-input-void-fn/index.ts`
- [x] `NoInputVoidFn`

### `@beep/schema/custom/Graph.schema` → `packages/common/schema/src/derived/collections/graph.ts`
- [ ] `EdgeDirectionSchema`

### `@beep/schema/custom/locales/ALL_LOCALES.generated` → `packages/common/schema/src/primitives/misc/locales/all-locales-generated.ts`
- [x] `ALL_LOCALES`

### `@beep/schema/custom/location/CountryCode` → `packages/common/schema/src/primitives/network/location/country-code.ts`
- [ ] `CountryCode`
- [ ] `CountryCodeKit`
- [x] `Encoded`
- [x] `Type`

## Milestone 2 – Level 0B: Locale & Regex Inputs
Complete the remaining zero-dependency primitives (locale + address helpers, semantic strings, raw regex helpers).
### `@beep/schema/kits/stringLiteralKit` → `packages/common/schema/src/derived/kits/string-literal-kit.ts`
- [x] `LiteralKit`
- [x] `stringLiteralKit`

### `@beep/schema/custom/location/CountryFromCode` → `packages/common/schema/src/primitives/network/location/country-from-code.ts`
- [x] `CountryFromCode`
- [x] `CountryName`
- [x] `CountryNameKit`
- [x] `Encoded`
- [x] `Type`

### `@beep/schema/custom/location/Locality` → `packages/common/schema/src/primitives/network/location/locality.ts`
- [x] `Encoded`
- [x] `Locality`
- [x] `Type`

### `@beep/schema/custom/location/StreetLine` → `packages/common/schema/src/primitives/network/location/street-line.ts`
- [x] `Encoded`
- [x] `StreetLine`
- [x] `Type`

### `@beep/schema/custom/location/SubdivisionCode` → `packages/common/schema/src/primitives/network/location/subdivision-code.ts`
- [x] `Encoded`
- [x] `SubdivisionCode`
- [x] `Type`

### `@beep/schema/custom/Number.schemas` → `packages/common/schema/src/primitives/number/number.ts`
- [x] `StringOrNumberToNumber`

### `@beep/schema/custom/Password.schema` → `packages/common/schema/src/primitives/string/password.ts`
- [x] `Encoded`
- [x] `EncodedPassword`
- [x] `Password`
- [x] `PasswordBase`
- [x] `Type`

### `@beep/schema/custom/PgSerial.schema` → `packages/common/schema/src/integrations/sql/pg-serial.ts`
- [x] `Encoded`
- [x] `PgSerialSchema`
- [x] `Type`

### `@beep/schema/custom/Regex.schema` → `packages/common/schema/src/internal/regex/regex.ts`
> Migrate this module together with `@beep/schema/regexes` so the helper schemas and raw regex constants remain in sync.
- [x] `Encoded`
- [x] `Regex`
- [x] `RegexFromString`
- [x] `Type`

### `@beep/schema/custom/SemanticVersion.schema` → `packages/common/schema/src/primitives/string/semantic-version.ts`
- [x] `Encoded`
- [x] `SemanticVersion`
- [x] `Type`

### `@beep/schema/custom/Transformations.schema` → `packages/common/schema/src/derived/kits/transformations.ts`
- [x] `Encoded`
- [x] `IntFromStr`
- [x] `Type`

### `@beep/schema/custom/Uint8Array.schema` → `packages/common/schema/src/primitives/binary/uint8-array.ts`
- [x] `Encoded`
- [x] `Type`
- [x] `Uint8Arr`

### `@beep/schema/custom/Url.schema` → `packages/common/schema/src/primitives/network/url.ts`
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

### `@beep/schema/custom/UUID.schema` → `packages/common/schema/src/identity/entity-id/uuid.ts`
- [x] `BrandedUUID`
- [x] `Encoded`
- [x] `Type`
- [x] `UUIDLiteral`
- [x] `UUIDLiteralEncoded`

### `@beep/schema/EntityId/index` → `packages/common/schema/src/identity/entity-id/index.ts`
- [x] `EntityId`

### `@beep/schema/extended-schemas` → `packages/common/schema/src/core/extended/extended-schemas.ts`
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

### `@beep/schema/http/HttpHeaders` → `packages/common/schema/src/integrations/http/http-headers.ts`
- [x] `Encoded`
- [x] `HttpHeaders`
- [x] `Type`

### `@beep/schema/JsonSchema` → `packages/common/schema/src/builders/json-schema/index.ts`
- [x] `$JsonType`
- [x] `ArraySchema`
- [x] `BooleanSchema`
- [x] `Encoded`
- [x] `IntegerSchema`
- [x] `JsonSchema`
- [x] `NullSchema`
- [x] `NumberSchema`
- [x] `ObjectSchema`
- [x] `StringSchema`
- [x] `Type`
- [x] `_JsonSchema`

### `@beep/schema/types` → `packages/common/schema/src/core/types.ts`
- [x] `OptionalWithDefault`

### `@beep/schema/utils/arbitrary` → `packages/common/schema/src/core/utils/arbitrary.ts`
- [x] `makeArb`
- [x] `makeArbs`
- [x] `makeFlat`

### `@beep/schema/utils/brands` → `packages/common/schema/src/core/utils/brands.ts`
- [x] `brand`
- [x] `makeBranded`

### `@beep/schema/utils/mergeFields` → `packages/common/schema/src/core/utils/merge-fields.ts`
- [x] `mergeFields`

### `@beep/schema/utils/WithDefaultsThunk/index` → `packages/common/schema/src/core/utils/with-defaults-thunk/index.ts`
- [x] `WithDefaultsThunk`

### `@beep/schema/utils/WithDefaultsThunk/WithDefaultsThunk` → `packages/common/schema/src/core/utils/with-defaults-thunk/with-defaults-thunk.ts`
- [x] `Maker`
- [x] `Type`
- [x] `make`

### `@beep/schema/variance` → `packages/common/schema/src/core/variance.ts`
- [x] `variance`

## Milestone 4 – Level 1A: Regex & Annotation Consumers
Modules that depend on Level 0 surfaces exactly once (regex validation, literal branding, timestamp transforms).

### `@beep/schema/custom/dates/Timestamp.schema` → `packages/common/schema/src/primitives/temporal/dates/timestamp.ts`
- [x] `TimestampToIsoString`

### `@beep/schema/custom/Fn/NoInputVoidFn/NoInputVoidFn` → `packages/common/schema/src/primitives/misc/fn/no-input-void-fn/no-input-void-fn.ts`
- [x] `Encoded`
- [x] `Type`

### `@beep/schema/custom/Literal.schema` → `packages/common/schema/src/derived/kits/literal.ts`
- [x] `Encoded`
- [x] `LiteralDefaults`
- [x] `LiteralWithDefault`
- [x] `Schema`
- [x] `Type`

### `@beep/schema/regexes` → `packages/common/schema/src/internal/regex/regexes.ts`
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

### `@beep/schema/custom/Domain.schema` → `packages/common/schema/src/primitives/network/domain.ts`
- [x] `DomainLabel`
- [x] `DomainName`
- [x] `Encoded`
- [x] `TopLevelDomain`
- [x] `Type`

### `@beep/schema/custom/Email.schema` → `packages/common/schema/src/primitives/string/email.ts`
- [x] `Email`
- [x] `EmailBase`
- [x] `EmailEncoded`
- [x] `Encoded`
- [x] `Type`

### `@beep/schema/custom/Hex.schema` → `packages/common/schema/src/primitives/string/hex.ts`
- [x] `Decoded`
- [x] `Encoded`
- [x] `HexColor`
- [x] `HexColorDecoded`
- [x] `HexColorEncoded`
- [x] `Type`

### `@beep/schema/custom/IP.schema` → `packages/common/schema/src/primitives/network/ip.ts`
- [x] `Encoded`
- [x] `IP`
- [x] `IPv4`
- [x] `IPv6`
- [x] `Type`

### `@beep/schema/custom/Json.schema` → `packages/common/schema/src/primitives/misc/json.ts`
- [x] `Encoded`
- [x] `Json`
- [x] `JsonArray`
- [x] `JsonLiteral`
- [x] `JsonPath`
- [x] `JsonProp`
- [x] `JsonStringToArray`
- [x] `JsonStringToStringArray`
- [x] `NonEmptyJsonArray`
- [x] `Type`
- [x] `equalsJson`
- [x] `jsonEq`

### `@beep/schema/custom/location/PostalCode` → `packages/common/schema/src/primitives/network/location/postal-code.ts`
- [x] `Encoded`
- [x] `PostalCode`
- [x] `PostalCodeRaw`
- [x] `PostalCodeRawDecoded`
- [x] `PostalCodeRawEncoded`
- [x] `Type`

## Milestone 5 – Level 1B: Utility Consumers
Single-dependency modules relying on utils or SQL helpers (name/person assets, nullable kits, bool/url path helpers).

### `@beep/schema/custom/NameAttribute.schema` → `packages/common/schema/src/primitives/string/name-attribute.ts`
- [x] `Encoded`
- [x] `NameAttribute`
- [x] `Type`

### `@beep/schema/custom/person/PersonAttributes` → `packages/common/schema/src/primitives/misc/person/person-attributes.ts`
- [x] `BirthDate`
- [x] `Encoded`
- [x] `FirstName`
- [x] `FullName`
- [x] `LastName`
- [x] `MiddleName`
- [x] `Type`

### `@beep/schema/custom/Phone.schema` → `packages/common/schema/src/primitives/string/phone.ts`
- [x] `Encoded`
- [x] `Phone`
- [x] `Type`
- [x] `UnsafePhone`

### `@beep/schema/custom/Slug.schema` → `packages/common/schema/src/primitives/string/slug.ts`
- [x] `Encoded`
- [x] `Slug`
- [x] `SlugBase`
- [x] `Type`

### `@beep/schema/custom/String.schema` → `packages/common/schema/src/primitives/string/string.ts`
- [x] `Encoded`
- [x] `Literal`
- [x] `SnakeTag`
- [x] `StringPropertyOmittable`
- [x] `StringWithDefault`
- [x] `Type`

### `@beep/schema/sql/common` → `packages/common/schema/src/integrations/sql/common.ts`
- [x] `DateTimeFromDate`
- [x] `DateTimeInsertFromDateOmittable`
- [x] `DateTimeUpdateFromDateOmittable`
- [x] `FieldOmittableWithDefault`
- [x] `FieldOptionOmittable`
- [x] `FieldSensitiveOptionOmittable`
- [x] `JsonFromStringOption`

### `@beep/schema/custom/Nullables.schema` → `packages/common/schema/src/derived/kits/nullables.ts`
- [x] `Encoded`
- [x] `NullableDate`
- [x] `NullableNum`
- [x] `NullableStr`
- [x] `NullableUnknown`
- [x] `Type`

### `@beep/schema/utils/toOptionalWith` → `packages/common/schema/src/core/utils/to-optional-with.ts`
- [x] `toOptionalWithDefault`

### `@beep/schema/custom/Bool.schema` → `packages/common/schema/src/primitives/bool/bool.ts`
- [x] `BoolFalse`
- [x] `BoolSchema`
- [x] `BoolTrue`
- [x] `BoolWithDefault`
- [x] `Encoded`
- [x] `FalseLiteral`
- [x] `TrueLiteral`
- [x] `Type`

### `@beep/schema/custom/URLPath.schema` → `packages/common/schema/src/primitives/misc/urlpath.ts`
- [x] `Branded`
- [x] `Encoded`
- [x] `Type`
- [x] `URLPath`

## Milestone 6 – Level 2: Generics & Kit Clients
Generics, the string literal kit, and all primitives that rely on those derived factories (currency codes, MIME types, forms, enums).

### `@beep/schema/generics/TaggedStruct` → `packages/common/schema/src/core/generics/tagged-struct.ts`
- [x] `Schema`
- [x] `TaggedStruct`
- [x] `Type`

### `@beep/schema/generics/TaggedUnion` → `packages/common/schema/src/core/generics/tagged-union.ts`
- [x] `Schema`
- [x] `TaggedUnion`
- [x] `Type`

### `@beep/schema/custom/CurrencyCode.schema` → `packages/common/schema/src/primitives/string/currency-code.ts`
- [x] `CurrencyCode`
- [x] `CurrencyCodeKit`
- [x] `Encoded`
- [x] `Type`

### `@beep/schema/custom/dates/Month.schema` → `packages/common/schema/src/primitives/temporal/dates/month.ts`
- [x] `Encoded`
- [x] `MonthInt`
- [x] `MonthInts`
- [x] `MonthNumber`
- [x] `MonthNumberFromMonthInt`
- [x] `MonthNumberKit`
- [x] `MonthString`
- [x] `MonthStringKit`
- [x] `Type`
- [x] `monthIntToNumber`
- [x] `monthNumberToInt`

### `@beep/schema/custom/FileExtension.schema` → `packages/common/schema/src/primitives/string/file-extension.ts`
- [x] `ApplicationExtension`
- [x] `ApplicationExtensionKit`
- [x] `AudioExtension`
- [x] `AudioExtensionKit`
- [x] `Encoded`
- [x] `FileExtension`
- [x] `FileExtensionKit`
- [x] `FontExtension`
- [x] `FontExtensionKit`
- [x] `ImageExtension`
- [x] `ImageExtensionKit`
- [x] `TextExtension`
- [x] `TextExtensionKit`
- [x] `Type`
- [x] `VideoExtension`
- [x] `VideoExtensionKit`

### `@beep/schema/custom/locales/Locale` → `packages/common/schema/src/primitives/misc/locales/locale.ts`
- [x] `Encoded`
- [x] `Locale`
- [x] `LocaleKit`
- [x] `Type`

### `@beep/schema/custom/location/USState` → `packages/common/schema/src/primitives/network/location/usstate.ts`
- [x] `Encoded`
- [x] `Type`
- [x] `USStateCode`
- [x] `USStateCodeKit`
- [x] `USStateName`
- [x] `USStateNameFromCode`
- [x] `USStateNameKit`

### `@beep/schema/custom/MimeType.schema` → `packages/common/schema/src/primitives/network/mime-type.ts`
- [x] `ApplicationExtensionMimeTypeMap`
- [x] `ApplicationMimeType`
- [x] `ApplicationMimeTypeKit`
- [x] `AudioExtensionMimeTypeMap`
- [x] `AudioMimeType`
- [x] `AudioMimeTypeKit`
- [x] `Encoded`
- [x] `FileExtensionMimeTypeMap`
- [x] `FontExtensionMimeTypeMap`
- [x] `FontMimeType`
- [x] `FontMimeTypeKit`
- [x] `ImageExtensionMimeTypeMap`
- [x] `ImageMimeType`
- [x] `ImageMimeTypeKit`
- [x] `MimeType`
- [x] `MimeTypeKit`
- [x] `TextExtensionMimeTypeMap`
- [x] `TextMimeType`
- [x] `TextMimeTypeKit`
- [x] `Type`
- [x] `VideoExtensionMimeTypeMap`
- [x] `VideoMimeType`
- [x] `VideoMimeTypeKit`

### `@beep/schema/form/field.schema` → `packages/common/schema/src/builders/form/field.ts`
- [x] `Encoded`
- [x] `FormFieldFormat`
- [x] `FormFieldFormatKit`
- [x] `FormFieldSchema`
- [x] `FormFieldType`
- [x] `FormFieldTypeKit`
- [x] `Type`

### `@beep/schema/form/form.schema` → `packages/common/schema/src/builders/form/form.ts`
- [x] `FormJsonSchema`

### `@beep/schema/http/HttpMethod` → `packages/common/schema/src/integrations/http/http-method.ts`
- [x] `Encoded`
- [x] `HttpMethod`
- [x] `HttpMethodKit`
- [x] `Type`

### `@beep/schema/sql/pg-enum` → `packages/common/schema/src/integrations/sql/pg-enum.ts`
- [x] `toPgEnum`

## Milestone 7 – Level 3: Heavy Builders & Config
High-dependency surfaces (schema-system auto-detection/filtering/defaults) plus config/CSP and RGB helpers.

### `@beep/schema/config/Csp` → `packages/common/schema/src/integrations/config/csp.ts`
- [x] `CSPDirective`
- [x] `CSPDirectiveKit`
- [x] `CSPDirectivePart`
- [x] `CSPDirectiveValue`
- [x] `CSPDirectiveValues`
- [x] `CSPFromString`
- [x] `CSPString`
- [x] `CSPStruct`
- [x] `Csp`
- [x] `DEFAULT_VALUES`
- [x] `Encoded`
- [x] `POLICY_DELIMITER`
- [x] `StaticDirective`
- [x] `StaticDirectiveKit`
- [x] `Type`
- [x] `toHeader`

### `@beep/schema/custom/RGB.schema` → `packages/common/schema/src/primitives/string/rgb.ts`
- [x] `DiscriminatedRGBPart`
- [x] `Encoded`
- [x] `RGBFromHex`
- [x] `RGBLiteralValue`
- [x] `RGBLiteralValueEncoded`
- [x] `RGBLiteralValueFromString`
- [x] `RGBLiteralValueFromTuple`
- [x] `RGBNumberPart`
- [x] `RGBPart`
- [x] `RGBPercentPart`
- [x] `RGBValuesTuple`
- [x] `TaggedRGBNumberPart`
- [x] `TaggedRGBPercentPart`
- [x] `Type`
- [x] `rgbChannelToHex`

### `@beep/schema/generics/TaggedUnion.factory` → `packages/common/schema/src/core/generics/tagged-union-factory.ts`
- [x] `FilterUnion`
- [x] `TaggedUnionFactory`
- [x] `TaggedUnionFactoryBuilder`

## Milestone 8 – Level 4: Aggregated Surfaces & Namespace
Modules pulling in broad swaths of the package (SystemSchema, EntityId runtime, HTTP request details, and the final index barrel).

### `@beep/schema/EntityId/EntityId` → `packages/common/schema/src/identity/entity-id/entity-id.ts`
- [x] `Encoded`
- [x] `EntityIdSchemaInstance`
- [x] `Factory`
- [x] `PrivateId`
- [x] `PublicId`
- [x] `SchemaType`
- [x] `Type`
- [x] `make`

### `@beep/schema/http/HttpRequestDetails` → `packages/common/schema/src/integrations/http/http-request-details.ts`
- [x] `Encoded`
- [x] `HttpRequestDetails`
- [x] `Type`

### `@beep/schema/index` → `packages/common/schema/src/index.ts`
- [x] `BS`
## Review Backlog
Anything not auto-categorized lands here for manual triage before migration.

_No modules assigned yet._

## Agent Prompts
### Milestone 1 – Level 0A: Core Scalars & Seeds
```text
You are migrating Milestone 1 – Level 0A: Core Scalars & Seeds for @beep/schema → schema.
Scope:
- `@beep/schema/annotations/default` → `packages/common/schema/src/core/annotations/default.ts`
- `@beep/schema/annotations/example-annotations` → `packages/common/schema/src/core/annotations/example-annotations.ts`
- `@beep/schema/custom/Array.schema` → `packages/common/schema/src/derived/collections/array.ts`
- `@beep/schema/custom/ArrayBuffer.schema` → `packages/common/schema/src/primitives/binary/array-buffer.ts`
- `@beep/schema/custom/dates/DateTime.schema` → `packages/common/schema/src/primitives/temporal/dates/date-time.ts`
- `@beep/schema/custom/dates/Year.schema` → `packages/common/schema/src/primitives/temporal/dates/year.ts`
- `@beep/schema/custom/Duration.schema` → `packages/common/schema/src/primitives/temporal/duration.ts`
- `@beep/schema/custom/Fn/Fn.schema` → `packages/common/schema/src/primitives/misc/fn/fn.ts`
- `@beep/schema/custom/Fn/NoInputVoidFn/index` → `packages/common/schema/src/primitives/misc/fn/no-input-void-fn/index.ts`
- `@beep/schema/custom/Graph.schema` → `packages/common/schema/src/derived/collections/graph.ts`
- `@beep/schema/custom/locales/ALL_LOCALES.generated` → `packages/common/schema/src/primitives/misc/locales/all-locales-generated.ts`
- `@beep/schema/custom/location/CountryCode` → `packages/common/schema/src/primitives/network/location/country-code.ts`

Instructions:
1. Migrate modules in-order so upstream dependencies stay satisfied.
2. Enforce Effect guardrails (Array/String/Object utilities).
3. Follow DOCUMENTATION_STRATEGY for JSDoc and run `bun run docs:lint:file -- <path>` or `bun run docs:lint` plus `bun run docgen` (then `bun run docs:site` if docs need syncing).
4. Update `packages/common/schema/MIGRATION_CHECKLIST.md` checkboxes as you go.
5. Keep changes scoped to this milestone.

```

### Milestone 2 – Level 0B: Locale & Regex Inputs
```text
You are migrating Milestone 2 – Level 0B: Locale & Regex Inputs for @beep/schema → schema.
Scope:
- `@beep/schema/custom/location/CountryFromCode` → `packages/common/schema/src/primitives/network/location/country-from-code.ts`
- `@beep/schema/custom/location/Locality` → `packages/common/schema/src/primitives/network/location/locality.ts`
- `@beep/schema/custom/location/StreetLine` → `packages/common/schema/src/primitives/network/location/street-line.ts`
- `@beep/schema/custom/location/SubdivisionCode` → `packages/common/schema/src/primitives/network/location/subdivision-code.ts`
- `@beep/schema/custom/Number.schemas` → `packages/common/schema/src/primitives/number/number.ts`
- `@beep/schema/custom/Password.schema` → `packages/common/schema/src/primitives/string/password.ts`
- `@beep/schema/custom/PgSerial.schema` → `packages/common/schema/src/integrations/sql/pg-serial.ts`
- `@beep/schema/custom/Regex.schema` → `packages/common/schema/src/internal/regex/regex.ts`
- `@beep/schema/custom/SemanticVersion.schema` → `packages/common/schema/src/primitives/string/semantic-version.ts`
- `@beep/schema/custom/Transformations.schema` → `packages/common/schema/src/derived/kits/transformations.ts`
- `@beep/schema/custom/Uint8Array.schema` → `packages/common/schema/src/primitives/binary/uint8-array.ts`
- `@beep/schema/custom/Url.schema` → `packages/common/schema/src/primitives/network/url.ts`

Instructions:
1. Migrate modules in-order so upstream dependencies stay satisfied.
2. Enforce Effect guardrails (Array/String/Object utilities).
3. Follow DOCUMENTATION_STRATEGY for JSDoc and run `bun run docs:lint:file -- <path>` or `bun run docs:lint` plus `bun run docgen` (then `bun run docs:site` if docs need syncing).
4. Update `packages/common/schema/MIGRATION_CHECKLIST.md` checkboxes as you go.
5. Keep changes scoped to this milestone.

```

### Milestone 3 – Level 0C: Utility Infrastructure
```text
You are migrating Milestone 3 – Level 0C: Utility Infrastructure for @beep/schema → schema.
Scope:
- `@beep/schema/custom/UUID.schema` → `packages/common/schema/src/identity/entity-id/uuid.ts`
- `@beep/schema/EntityId/index` → `packages/common/schema/src/identity/entity-id/index.ts`
- `@beep/schema/extended-schemas` → `packages/common/schema/src/core/extended/extended-schemas.ts`
- `@beep/schema/http/HttpHeaders` → `packages/common/schema/src/integrations/http/http-headers.ts`
- `@beep/schema/JsonSchema` → `packages/common/schema/src/builders/json-schema/index.ts`
- `@beep/schema/types` → `packages/common/schema/src/core/types.ts`
- `@beep/schema/utils/arbitrary` → `packages/common/schema/src/core/utils/arbitrary.ts`
- `@beep/schema/utils/brands` → `packages/common/schema/src/core/utils/brands.ts`
- `@beep/schema/utils/mergeFields` → `packages/common/schema/src/core/utils/merge-fields.ts`
- `@beep/schema/utils/WithDefaultsThunk/index` → `packages/common/schema/src/core/utils/with-defaults-thunk/index.ts`
- `@beep/schema/utils/WithDefaultsThunk/WithDefaultsThunk` → `packages/common/schema/src/core/utils/with-defaults-thunk/with-defaults-thunk.ts`
- `@beep/schema/variance` → `packages/common/schema/src/core/variance.ts`

Instructions:
1. Migrate modules in-order so upstream dependencies stay satisfied.
2. Enforce Effect guardrails (Array/String/Object utilities).
3. Follow DOCUMENTATION_STRATEGY for JSDoc and run `bun run docs:lint:file -- <path>` or `bun run docs:lint` plus `bun run docgen` (then `bun run docs:site` if docs need syncing).
4. Update `packages/common/schema/MIGRATION_CHECKLIST.md` checkboxes as you go.
5. Keep changes scoped to this milestone.

```

### Milestone 4 – Level 1A: Regex & Annotation Consumers
```text
You are migrating Milestone 4 – Level 1A: Regex & Annotation Consumers for @beep/schema → schema.
Scope:
- `@beep/schema/custom/dates/Timestamp.schema` → `packages/common/schema/src/primitives/temporal/dates/timestamp.ts`
- `@beep/schema/custom/Fn/NoInputVoidFn/NoInputVoidFn` → `packages/common/schema/src/primitives/misc/fn/no-input-void-fn/no-input-void-fn.ts`
- `@beep/schema/custom/Literal.schema` → `packages/common/schema/src/derived/kits/literal.ts`
- `@beep/schema/regexes` → `packages/common/schema/src/internal/regex/regexes.ts`
- `@beep/schema/custom/Domain.schema` → `packages/common/schema/src/primitives/network/domain.ts`
- `@beep/schema/custom/Email.schema` → `packages/common/schema/src/primitives/string/email.ts`
- `@beep/schema/custom/Hex.schema` → `packages/common/schema/src/primitives/string/hex.ts`
- `@beep/schema/custom/IP.schema` → `packages/common/schema/src/primitives/network/ip.ts`
- `@beep/schema/custom/Json.schema` → `packages/common/schema/src/primitives/misc/json.ts`
- `@beep/schema/custom/location/PostalCode` → `packages/common/schema/src/primitives/network/location/postal-code.ts`

Instructions:
1. Migrate modules in-order so upstream dependencies stay satisfied.
2. Enforce Effect guardrails (Array/String/Object utilities).
3. Follow DOCUMENTATION_STRATEGY for JSDoc and run `bun run docs:lint:file -- <path>` or `bun run docs:lint` plus `bun run docgen` (then `bun run docs:site` if docs need syncing).
4. Update `packages/common/schema/MIGRATION_CHECKLIST.md` checkboxes as you go.
5. Keep changes scoped to this milestone.

```

### Milestone 5 – Level 1B: Utility Consumers
```text
You are migrating Milestone 5 – Level 1B: Utility Consumers for @beep/schema → schema.
Scope:
- `@beep/schema/custom/NameAttribute.schema` → `packages/common/schema/src/primitives/string/name-attribute.ts`
- `@beep/schema/custom/person/PersonAttributes` → `packages/common/schema/src/primitives/misc/person/person-attributes.ts`
- `@beep/schema/custom/Phone.schema` → `packages/common/schema/src/primitives/string/phone.ts`
- `@beep/schema/custom/Slug.schema` → `packages/common/schema/src/primitives/string/slug.ts`
- `@beep/schema/custom/String.schema` → `packages/common/schema/src/primitives/string/string.ts`
- `@beep/schema/sql/common` → `packages/common/schema/src/integrations/sql/common.ts`
- `@beep/schema/custom/Nullables.schema` → `packages/common/schema/src/derived/kits/nullables.ts`
- `@beep/schema/utils/toOptionalWith` → `packages/common/schema/src/core/utils/to-optional-with.ts`
- `@beep/schema/custom/Bool.schema` → `packages/common/schema/src/primitives/misc/bool.ts`
- `@beep/schema/custom/URLPath.schema` → `packages/common/schema/src/primitives/misc/urlpath.ts`

Instructions:
1. Migrate modules in-order so upstream dependencies stay satisfied.
2. Enforce Effect guardrails (Array/String/Object utilities).
3. Follow DOCUMENTATION_STRATEGY for JSDoc and run `bun run docs:lint:file -- <path>` or `bun run docs:lint` plus `bun run docgen` (then `bun run docs:site` if docs need syncing).
4. Update `packages/common/schema/MIGRATION_CHECKLIST.md` checkboxes as you go.
5. Keep changes scoped to this milestone.

```

### Milestone 6 – Level 2: Generics & Kit Clients
```text
You are migrating Milestone 6 – Level 2: Generics & Kit Clients for @beep/schema → schema.
Scope:
- `@beep/schema/generics/TaggedStruct` → `packages/common/schema/src/core/generics/tagged-struct.ts`
- `@beep/schema/generics/TaggedUnion` → `packages/common/schema/src/core/generics/tagged-union.ts`
- `@beep/schema/kits/stringLiteralKit` → `packages/common/schema/src/derived/kits/string-literal-kit.ts`
- `@beep/schema/custom/CurrencyCode.schema` → `packages/common/schema/src/primitives/string/currency-code.ts`
- `@beep/schema/custom/dates/Month.schema` → `packages/common/schema/src/primitives/temporal/dates/month.ts`
- `@beep/schema/custom/FileExtension.schema` → `packages/common/schema/src/primitives/string/file-extension.ts`
- `@beep/schema/custom/locales/Locale` → `packages/common/schema/src/primitives/misc/locales/locale.ts`
- `@beep/schema/custom/location/USState` → `packages/common/schema/src/primitives/network/location/usstate.ts`
- `@beep/schema/custom/MimeType.schema` → `packages/common/schema/src/primitives/network/mime-type.ts`
- `@beep/schema/form/field.schema` → `packages/common/schema/src/builders/form/field.ts`
- `@beep/schema/form/form.schema` → `packages/common/schema/src/builders/form/form.ts`
- `@beep/schema/http/HttpMethod` → `packages/common/schema/src/integrations/http/http-method.ts`
- `@beep/schema/sql/pg-enum` → `packages/common/schema/src/integrations/sql/pg-enum.ts`

Instructions:
1. Migrate modules in-order so upstream dependencies stay satisfied.
2. Enforce Effect guardrails (Array/String/Object utilities).
3. Follow DOCUMENTATION_STRATEGY for JSDoc and run `bun run docs:lint:file -- <path>` or `bun run docs:lint` plus `bun run docgen` (then `bun run docs:site` if docs need syncing).
4. Update `packages/common/schema/MIGRATION_CHECKLIST.md` checkboxes as you go.
5. Keep changes scoped to this milestone.

```

### Milestone 7 – Level 3: Heavy Builders & Config
```text
You are migrating Milestone 7 – Level 3: Heavy Builders & Config for @beep/schema → schema.
Scope:
- `@beep/schema/config/Csp` → `packages/common/schema/src/integrations/config/csp.ts`
- `@beep/schema/custom/RGB.schema` → `packages/common/schema/src/primitives/string/rgb.ts`
- `@beep/schema/generics/TaggedUnion.factory` → `packages/common/schema/src/core/generics/tagged-union-factory.ts`

Instructions:
1. Migrate modules in-order so upstream dependencies stay satisfied.
2. Enforce Effect guardrails (Array/String/Object utilities).
3. Follow DOCUMENTATION_STRATEGY for JSDoc and run `bun run docs:lint:file -- <path>` or `bun run docs:lint` plus `bun run docgen` (then `bun run docs:site` if docs need syncing).
4. Update `packages/common/schema/MIGRATION_CHECKLIST.md` checkboxes as you go.
5. Keep changes scoped to this milestone.

```

### Milestone 8 – Level 4: Aggregated Surfaces & Namespace
```text
You are migrating Milestone 8 – Level 4: Aggregated Surfaces & Namespace for @beep/schema → schema.
Scope:
- `@beep/schema/EntityId/EntityId` → `packages/common/schema/src/identity/entity-id/entity-id.ts`
- `@beep/schema/http/HttpRequestDetails` → `packages/common/schema/src/integrations/http/http-request-details.ts`
- `@beep/schema/index` → `packages/common/schema/src/index.ts`

Instructions:
1. Migrate modules in-order so upstream dependencies stay satisfied.
2. Enforce Effect guardrails (Array/String/Object utilities).
3. Follow DOCUMENTATION_STRATEGY for JSDoc and run `bun run docs:lint:file -- <path>` or `bun run docs:lint` plus `bun run docgen` (then `bun run docs:site` if docs need syncing).
4. Update `packages/common/schema/MIGRATION_CHECKLIST.md` checkboxes as you go.
5. Keep changes scoped to this milestone.

```
