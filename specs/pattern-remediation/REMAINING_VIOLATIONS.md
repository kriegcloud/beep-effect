# Pattern Remediation - Remaining Violations

> Generated: 2026-01-07
> Status: **ALL PHASES COMPLETE** ✅
> Total Remaining Violations: 0

## Executive Summary

The previous remediation session successfully fixed violations in:
- @beep/ui (13 files) - **COMPLETE**
- @beep/shared-server (1 file) - **COMPLETE**
- @beep/shared-domain (1 file) - **COMPLETE**
- @beep/contract (2 files) - **COMPLETE**

**Phase 1 (High Priority Business Logic) completed 2026-01-07:**
- @beep/utils (11 files, 38 violations) - **COMPLETE** ✅
- @beep/schema (8 files, 27 violations) - **COMPLETE** ✅
- @beep/errors (2 files, 14 violations) - **COMPLETE** ✅

**Phase 2 (UI/Server Packages) completed 2026-01-07:**
- @beep/ui-core (8 files, 14 violations) - **COMPLETE** ✅
- @beep/ui (5 files, 56 violations) - **COMPLETE** ✅
- @beep/iam-server (3 files, 5 violations) - **COMPLETE** ✅
- @beep/runtime-client (2 files, 4 violations) - **COMPLETE** ✅

**Phase 3 (Mock Data Package) completed 2026-01-07:**
- @beep/mock (10 files, 61 violations) - **COMPLETE** ✅
  - 47 `Array.from()` → `A.makeBy()` conversions
  - 14 `.slice()` → `A.take()`/`A.drop()` conversions

All pattern violations have been remediated across all priority phases.

---

## Summary by Package

| Package | Violations | Priority | Status |
|---------|------------|----------|--------|
| @beep/mock | 61 | P3 | **COMPLETE** ✅ |
| @beep/ui | 56 | P2 | **COMPLETE** ✅ |
| @beep/utils | 38 | P1 | **COMPLETE** ✅ |
| @beep/schema | 27 | P1 | **COMPLETE** ✅ |
| @beep/errors | 14 | P1 | **COMPLETE** ✅ |
| @beep/ui-core | 14 | P2 | **COMPLETE** ✅ |
| @beep/iam-server | 5 | P2 | **COMPLETE** ✅ |
| @beep/runtime-client | 4 | P2 | **COMPLETE** ✅ |

---

## @beep/mock (packages/common/mock)

**Total: 61 violations**
- 47 `Array.from()` → `A.makeBy()`
- 14 `.slice()` → `A.take()`/`A.drop()`

### _invoice.ts

- [ ] `_invoice.ts:20` - `Array.from()` → `A.makeBy()`
  - Current: `export const INVOICE_SERVICE_OPTIONS = Array.from({ length: 8 }, (_, index) => ({`
  - Fix: `export const INVOICE_SERVICE_OPTIONS = A.makeBy(8, (index) => ({`

- [ ] `_invoice.ts:26` - `Array.from()` → `A.makeBy()`
  - Current: `const ITEMS = Array.from({ length: 3 }, (__, index) => {`
  - Fix: `const ITEMS = A.makeBy(3, (index) => {`

- [ ] `_invoice.ts:40` - `Array.from()` → `A.makeBy()`
  - Current: `export const _invoices = Array.from({ length: 20 }, (_, index) => {`
  - Fix: `export const _invoices = A.makeBy(20, (index) => {`

### _tour.ts

- [ ] `_tour.ts:71` - `Array.from()` → `A.makeBy()`
  - Current: `const BOOKER = Array.from({ length: 12 }, (_, index) => ({`
  - Fix: `const BOOKER = A.makeBy(12, (index) => ({`

- [ ] `_tour.ts:78` - `Array.from()` → `A.makeBy()`
  - Current: `export const _tourGuides = Array.from({ length: 12 }, (_, index) => ({`
  - Fix: `export const _tourGuides = A.makeBy(12, (index) => ({`

- [ ] `_tour.ts:85` - `Array.from()` → `A.makeBy()`
  - Current: `export const TRAVEL_IMAGES = Array.from({ length: 16 }, (_, index) => _mock.image.travel(index));`
  - Fix: `export const TRAVEL_IMAGES = A.makeBy(16, (index) => _mock.image.travel(index));`

- [ ] `_tour.ts:87` - `Array.from()` → `A.makeBy()`
  - Current: `export const _tours = Array.from({ length: 12 }, (_, index) => {`
  - Fix: `export const _tours = A.makeBy(12, (index) => {`

- [ ] `_tour.ts:99-103` - `.slice()` → `A.take()`/`A.drop()`
  - Current: `_tourGuides.slice(0, 1)`, `_tourGuides.slice(1, 3)`, etc.
  - Fix: `F.pipe(_tourGuides, A.take(1))`, `F.pipe(_tourGuides, A.drop(1), A.take(2))`, etc.

- [ ] `_tour.ts:105` - `.slice()` → `A.take()`/`A.drop()`
  - Current: `const images = TRAVEL_IMAGES.slice(index, index + 5);`
  - Fix: `const images = F.pipe(TRAVEL_IMAGES, A.drop(index), A.take(5));`

- [ ] `_tour.ts:116` - `.slice()` → `A.take()`
  - Current: `tags: _tags.slice(0, 5),`
  - Fix: `tags: F.pipe(_tags, A.take(5)),`

### _user.ts

- [ ] `_user.ts:32` - `Array.from()` → `A.makeBy()`
  - Current: `export const _userFollowers = Array.from({ length: 18 }, (_, index) => ({`
  - Fix: `export const _userFollowers = A.makeBy(18, (index) => ({`

- [ ] `_user.ts:39` - `Array.from()` → `A.makeBy()`
  - Current: `export const _userFriends = Array.from({ length: 18 }, (_, index) => ({`
  - Fix: `export const _userFriends = A.makeBy(18, (index) => ({`

- [ ] `_user.ts:46` - `Array.from()` → `A.makeBy()`
  - Current: `export const _userGallery = Array.from({ length: 12 }, (_, index) => ({`
  - Fix: `export const _userGallery = A.makeBy(12, (index) => ({`

- [ ] `_user.ts:53` - `Array.from()` → `A.makeBy()`
  - Current: `export const _userFeeds = Array.from({ length: 3 }, (_, index) => ({`
  - Fix: `export const _userFeeds = A.makeBy(3, (index) => ({`

- [ ] `_user.ts:58` - `Array.from()` → `A.makeBy()`
  - Current: `personLikes: Array.from({ length: 20 }, (__, personIndex) => ({`
  - Fix: `personLikes: A.makeBy(20, (personIndex) => ({`

- [ ] `_user.ts:87` - `Array.from()` → `A.makeBy()`
  - Current: `export const _userCards = Array.from({ length: 21 }, (_, index) => ({`
  - Fix: `export const _userCards = A.makeBy(21, (index) => ({`

- [ ] `_user.ts:98` - `Array.from()` → `A.makeBy()`
  - Current: `export const _userPayment = Array.from({ length: 3 }, (_, index) => ({`
  - Fix: `export const _userPayment = A.makeBy(3, (index) => ({`

- [ ] `_user.ts:105` - `Array.from()` → `A.makeBy()`
  - Current: `export const _userAddressBook = Array.from({ length: 4 }, (_, index) => ({`
  - Fix: `export const _userAddressBook = A.makeBy(4, (index) => ({`

- [ ] `_user.ts:114` - `Array.from()` → `A.makeBy()`
  - Current: `export const _userInvoices = Array.from({ length: 10 }, (_, index) => ({`
  - Fix: `export const _userInvoices = A.makeBy(10, (index) => ({`

- [ ] `_user.ts:127` - `Array.from()` → `A.makeBy()`
  - Current: `export const _userList = Array.from({ length: 20 }, (_, index) => ({`
  - Fix: `export const _userList = A.makeBy(20, (index) => ({`

### _files.ts

- [ ] `_files.ts:43` - `Array.from()` → `A.makeBy()`
  - Current: `const SHARED_PERSONS = Array.from({ length: 20 }, (_, index) => ({`
  - Fix: `const SHARED_PERSONS = A.makeBy(20, (index) => ({`

- [ ] `_files.ts:69-72` - `.slice()` → `A.take()`/`A.drop()`
  - Current: `SHARED_PERSONS.slice(0, 5)`, `SHARED_PERSONS.slice(5, 9)`, etc.
  - Fix: `F.pipe(SHARED_PERSONS, A.take(5))`, `F.pipe(SHARED_PERSONS, A.drop(5), A.take(4))`, etc.

- [ ] `_files.ts:83,99` - `.slice()` → `A.take()`
  - Current: `tags: _tags.slice(0, 5),`
  - Fix: `tags: F.pipe(_tags, A.take(5)),`

### _job.ts

- [ ] `_job.ts:74` - `Array.from()` → `A.makeBy()`
  - Current: `const CANDIDATES = Array.from({ length: 12 }, (_, index) => ({`
  - Fix: `const CANDIDATES = A.makeBy(12, (index) => ({`

- [ ] `_job.ts:110` - `Array.from()` → `A.makeBy()`
  - Current: `export const _jobs = Array.from({ length: 12 }, (_, index) => {`
  - Fix: `export const _jobs = A.makeBy(12, (index) => {`

- [ ] `_job.ts:157,160` - `.slice()` → `A.take()`
  - Current: `skills: JOB_SKILL_OPTIONS.slice(0, 3),`
  - Fix: `skills: F.pipe(JOB_SKILL_OPTIONS, A.take(3)),`

### _order.ts

- [ ] `_order.ts:15` - `Array.from()` → `A.makeBy()`
  - Current: `const ITEMS = Array.from({ length: 3 }, (_, index) => ({`
  - Fix: `const ITEMS = A.makeBy(3, (index) => ({`

- [ ] `_order.ts:24` - `Array.from()` → `A.makeBy()`
  - Current: `export const _orders = Array.from({ length: 20 }, (_, index) => {`
  - Fix: `export const _orders = A.makeBy(20, (index) => {`

- [ ] `_order.ts:31` - `.slice()` → `A.take()`/`A.drop()`
  - Current: `const items = (index % 2 && ITEMS.slice(0, 1)) || (index % 3 && ITEMS.slice(1, 3)) || ITEMS;`
  - Fix: `const items = (index % 2 && F.pipe(ITEMS, A.take(1))) || (index % 3 && F.pipe(ITEMS, A.drop(1), A.take(2))) || ITEMS;`

### _overview.ts

- [ ] `_overview.ts:36` - `Array.from()` → `A.makeBy()`
- [ ] `_overview.ts:43` - `Array.from()` → `A.makeBy()`
- [ ] `_overview.ts:57` - `Array.from()` → `A.makeBy()`
- [ ] `_overview.ts:67` - `Array.from()` → `A.makeBy()`
- [ ] `_overview.ts:72` - `Array.from()` → `A.makeBy()`
- [ ] `_overview.ts:80` - `Array.from()` → `A.makeBy()`
- [ ] `_overview.ts:132` - `Array.from()` → `A.makeBy()`
- [ ] `_overview.ts:147` - `Array.from()` → `A.makeBy()`
- [ ] `_overview.ts:163` - `Array.from()` → `A.makeBy()`
- [ ] `_overview.ts:172` - `Array.from()` → `A.makeBy()`
- [ ] `_overview.ts:267` - `Array.from()` → `A.makeBy()`
- [ ] `_overview.ts:276` - `Array.from()` → `A.makeBy()`
- [ ] `_overview.ts:291` - `Array.from()` → `A.makeBy()`
- [ ] `_overview.ts:297` - `Array.from()` → `A.makeBy()`
- [ ] `_overview.ts:307` - `Array.from()` → `A.makeBy()`
- [ ] `_overview.ts:322` - `Array.from()` → `A.makeBy()`
- [ ] `_overview.ts:330` - `Array.from()` → `A.makeBy()`
- [ ] `_overview.ts:339` - `Array.from()` → `A.makeBy()`

### _others.ts

- [ ] `_others.ts:7` - `Array.from()` → `A.makeBy()`
- [ ] `_others.ts:16` - `Array.from()` → `A.makeBy()`
- [ ] `_others.ts:25` - `Array.from()` → `A.makeBy()`
- [ ] `_others.ts:38` - `Array.from()` → `A.makeBy()`

### assets.ts

- [ ] `assets.ts:3` - `Array.from()` → `A.makeBy()`
  - Current: `export const _id = Array.from({ length: 40 }, (_, index) => \`e99f09a7-dd88-49d5-b1c8-1daf80c2d7b${index + 1}\`);`
  - Fix: `export const _id = A.makeBy(40, (index) => \`e99f09a7-dd88-49d5-b1c8-1daf80c2d7b${index + 1}\`);`

---

## @beep/ui (packages/ui/ui/src/lexical/collab)

**Total: 56 violations**
- 26 `.forEach()` violations
- 9 `switch` statements
- 4 `.map()` violations
- 4 `Date.now()` violations
- 3 `.filter()` violations
- 3 `.includes()` violations
- 1 `Array.from()` violation

### CollabInstance.ts (21 violations)

- [ ] `CollabInstance.ts:144` - `.filter(` → `A.filter`
- [ ] `CollabInstance.ts:153` - `.map(` → `A.map`
- [ ] `CollabInstance.ts:189` - `.forEach(` → `A.forEach`
- [ ] `CollabInstance.ts:220` - `.forEach(` → `A.forEach`
- [ ] `CollabInstance.ts:222` - `switch` → `Match.value`
- [ ] `CollabInstance.ts:251` - `Array.from(` → `A.fromIterable`
- [ ] `CollabInstance.ts:253` - `.map(` → `A.map`
- [ ] `CollabInstance.ts:254` - `.filter(` → `A.filter`
- [ ] `CollabInstance.ts:259` - `.includes(` → `A.contains`
- [ ] `CollabInstance.ts:288` - `.forEach(` → `A.forEach`
- [ ] `CollabInstance.ts:289` - `switch` → `Match.value`
- [ ] `CollabInstance.ts:313` - `.forEach(` → `A.forEach`
- [ ] `CollabInstance.ts:315` - `switch` → `Match.value`
- [ ] `CollabInstance.ts:381` - `.forEach(` → `A.forEach`
- [ ] `CollabInstance.ts:409` - `switch` → `Match.value`
- [ ] `CollabInstance.ts:441` - `switch` → `Match.value`
- [ ] `CollabInstance.ts:469` - `.forEach(` → `A.forEach`
- [ ] `CollabInstance.ts:485` - `.forEach(` → `A.forEach`
- [ ] `CollabInstance.ts:520` - `Date.now()` → `DateTime.toEpochMillis(DateTime.unsafeNow())`
- [ ] `CollabInstance.ts:545` - `.forEach(` → `A.forEach`
- [ ] `CollabInstance.ts:546` - `Date.now()` → `DateTime.toEpochMillis(DateTime.unsafeNow())`

### CollabTrystero.ts (20 violations)

- [ ] `CollabTrystero.ts:70,80,97,108,109,149,150,153,154,165,195,197,209,213,220,249` - `.forEach(` → `A.forEach`
- [ ] `CollabTrystero.ts:170` - `switch` → `Match.value`
- [ ] `CollabTrystero.ts:175` - `.map(` → `A.map`
- [ ] `CollabTrystero.ts:177` - `Date.now()` → `DateTime.toEpochMillis(DateTime.unsafeNow())`
- [ ] `CollabTrystero.ts:203` - `switch` → `Match.value`

### CollabNetwork.ts (3 violations)

- [ ] `CollabNetwork.ts:35` - `switch` → `Match.value`
- [ ] `CollabNetwork.ts:43` - `.forEach(` → `A.forEach`
- [ ] `CollabNetwork.ts:45` - `switch` → `Match.value`

### cursor.ts (1 violation)

- [ ] `cursor.ts:28` - `Date.now()` → `DateTime.toEpochMillis(DateTime.unsafeNow())`

### Messages.ts (3 violations)

- [ ] `Messages.ts:75` - `.includes(` → `A.contains`
- [ ] `Messages.ts:101` - `.includes(` → `A.contains`
- [ ] `Messages.ts:106` - Array indexing on `Str.split()` → use `A.get`

---

## @beep/utils (packages/common/utils)

**Total: 38 violations**
- 21 native string methods (`.split`, `.startsWith`, `.endsWith`, `.includes`)
- 5 `instanceof` checks
- 4 `typeof` checks
- 4 `Object.keys/Object.entries`
- 1 `Date.now()`

### sqids.ts (4 violations)

- [ ] `sqids.ts:619` - `.split(` → `Str.split()`
- [ ] `sqids.ts:711` - `.startsWith(` → `Str.startsWith()`
- [ ] `sqids.ts:711` - `.endsWith(` → `Str.endsWith()`
- [ ] `sqids.ts:714` - `.includes(` → `Str.includes()`

### data/string.utils.ts (18 violations)

- [ ] `string.utils.ts:216` - `.startsWith(`, `.endsWith(` → `Str.startsWith()`, `Str.endsWith()`
- [ ] `string.utils.ts:223` - `typeof current === "object"` → `P.isObject(current)`
- [ ] `string.utils.ts:499,501,512,515,520,522,525,569,574,579,584,591,593,602` - Various `.endsWith(`, `.includes(` violations

### Other files (16 violations)

- [ ] `getters/getAt.ts:45` - `.split(` → `Str.split()`
- [ ] `object/path.ts:27` - `typeof value === "object"` → `P.isObject(value)`
- [ ] `equality/deepEqual.ts:30` - `typeof value === "object"` → `P.isObject(value)`
- [ ] `equality/deepEqual.ts:160` - `.startsWith(` → `Str.startsWith()`
- [ ] `data/array.utils/order-by.ts:172` - `instanceof Date` → `P.isDate()`
- [ ] `data/array.utils/order-by.ts:184` - `typeof left === "object"` → `P.isObject()`
- [ ] `data/object.utils/clone-deep.ts:51,55` - `instanceof Date/RegExp` → `P.isDate/P.isRegExp`
- [ ] `data/object.utils/clone-deep.ts:89` - `Object.keys(` → `Struct.keys()`
- [ ] `data/object.utils/merge-defined.ts:54` - `Object.keys(` → `Struct.keys()`
- [ ] `data/object.utils/omit.ts:35` - `Object.entries(` → `Struct.entries()`
- [ ] `data/object.utils/omit-by.ts:35` - `Object.entries(` → `Struct.entries()`
- [ ] `timing/debounce.ts:62` - `Date.now()` → DateTime utility

---

## @beep/schema (packages/common/schema)

**Total: 27 violations**
- 12 native array methods
- 8 `new Date()` / `Date.now()`
- 3 native string methods
- 2 `switch` statements
- 1 `Array.from()`

### integrations/files/file-types/FileTypes.ts (12 violations)

- [ ] `FileTypes.ts:975,986,1102` - `.toUpperCase()` → `Str.toUpperCase`
- [ ] `FileTypes.ts:1034` - `.map(` → `A.map`
- [ ] `FileTypes.ts:1036,1037,1044,1050` - `.some(`, `.includes(` → `A.some`, `A.contains`
- [ ] `FileTypes.ts:1007,1077` - `.includes(` on optional → `O.exists`
- [ ] `FileTypes.ts:2116,2123` - `.concat(` → `A.concat`
- [ ] `FileTypes.ts:2136` - `Array.from(` → `A.fromIterable`

### primitives/person/person-attributes.ts (4 violations)

- [ ] `person-attributes.ts:270,281` - `Date.now()` → DateTime utility
- [ ] `person-attributes.ts:273,283` - `new Date()` → DateTime utility

### primitives/temporal/dates/date-time.ts (4 violations)

- [ ] `date-time.ts:283,301,390` - `new Date()` → DateTime utilities

### primitives/temporal/dates/timestamp.ts (2 violations)

- [ ] `timestamp.ts:46,47` - `new Date()` → DateTime utilities

### core/annotations/default.ts (1 violation)

- [ ] `default.ts:572` - `switch` → `Match.value`

### core/extended/extended-schemas.ts (1 violation)

- [ ] `extended-schemas.ts:417` - `switch` → `Match.value`

### integrations/files/utils/compress-file-name.ts (2 violations)

- [ ] `compress-file-name.ts:12` - `.slice(` → `A.slice`
- [ ] `compress-file-name.ts:15` - `.split().pop()` → `Str.split`, `A.last`

---

## @beep/errors (packages/common/errors)

**Total: 14 violations**

### shared.ts (3 violations)

- [ ] `shared.ts:131` - `.map(` → `A.map()`
- [ ] `shared.ts:99` - `typeof message === "string"` → `P.isString()`
- [ ] `shared.ts:102` - `typeof message === "object"` → `P.isObject()`

### server.ts (11 violations)

- [ ] `server.ts:136,168,190,269` - `.split(` → `Str.split()`
- [ ] `server.ts:138` - `.trim()` → `Str.trim()`
- [ ] `server.ts:158` - `.startsWith()` → `Str.startsWith()`
- [ ] `server.ts:158,159` - `.includes()` → `Str.includes()`
- [ ] `server.ts:226` - `typeof options === "boolean"` → `P.isBoolean()`
- [ ] `server.ts:263` - `.filter(Boolean)` → `A.filter()`
- [ ] `server.ts:270` - `.map()` → `A.map()`
- [ ] `server.ts:274` - `.filter()` → `A.filter()`

---

## @beep/ui-core (packages/ui/core)

**Total: 14 violations**

### utils/cookies.ts (2 violations)

- [ ] `cookies.ts:21` - `switch` → `Match.value`
- [ ] `cookies.ts:108` - `Date.now()` → DateTime equivalent

### adapters/AdapterEffectDateTime.ts (4 violations)

- [ ] `AdapterEffectDateTime.ts:199` - `.split()[0]?.toLowerCase()` → `Str.split`, `A.head`, `Str.toLowerCase`
- [ ] `AdapterEffectDateTime.ts:200,440` - `.includes()` on array → `A.some()`
- [ ] `AdapterEffectDateTime.ts:333` - `new Date()` → DateTime utilities

### utils/right-to-left.ts (2 violations)

- [ ] `right-to-left.ts:17` - `.trim()` → `Str.trim()`
- [ ] `right-to-left.ts:24` - `.includes()` → `Str.includes()`

### utils/color.ts (2 violations)

- [ ] `color.ts:80,113` - `.trim()` → `Str.trim()`

### utils/css-variables.ts (1 violation)

- [ ] `css-variables.ts:13` - `.trim()` → `Str.trim()`

### Other files (3 violations)

- [ ] `theme/core/components/avatar.tsx:28,32` - `.trim()`, `.toLowerCase()` → `Str.trim()`, `Str.toLowerCase()`
- [ ] `utils/format-number.ts:71` - `.toLowerCase()` → `Str.toLowerCase()`
- [ ] `theme/core/components/badge.tsx:31`, `button-fab.tsx:52` - `.includes()` on array → `A.some()`

---

## @beep/iam-server (packages/iam/server)

**Total: 5 violations**

### api/v1/sso/saml2-sp-metadata.ts (1 violation)

- [ ] `saml2-sp-metadata.ts:58` - `typeof result === "string"` → `P.isString(result)`

### api/v1/organization/create.ts (2 violations)

- [ ] `create.ts:36` - `typeof v === "object"` → `P.isObject(v)`
- [ ] `create.ts:40` - `typeof value === "string"` → `P.isString(value)`

### api/v1/organization/update.ts (2 violations)

- [ ] `update.ts:36` - `typeof v === "object"` → `P.isObject(v)`
- [ ] `update.ts:40` - `typeof value === "string"` → `P.isString(value)`

---

## @beep/runtime-client (packages/runtime/client)

**Total: 4 violations**

- [ ] `services/unsafe-http-api-client.ts:28` - `.split()` → `Str.split()`
- [ ] `services/unsafe-http-api-client.ts:50` - `.map()` → `A.map()`
- [ ] `services/unsafe-http-api-client.ts:69` - `switch` → `Match.value()`
- [ ] `workers/worker.ts:36` - `.filter()` → `A.filter()`

---

## Remediation Priority

### Phase 1 - High Priority (Business Logic)
1. @beep/utils (38 violations) - Core utilities used everywhere
2. @beep/schema (27 violations) - Schema primitives
3. @beep/errors (14 violations) - Error handling

### Phase 2 - Medium Priority (UI/Server)
1. @beep/ui-core (14 violations) - Theme/styling utilities
2. @beep/ui (56 violations) - Collaborative editing
3. @beep/iam-server (5 violations) - Authentication
4. @beep/runtime-client (4 violations) - HTTP client

### Phase 3 - Low Priority (Mock Data)
1. @beep/mock (61 violations) - Test fixtures only

---

## Notes

### Acceptable Patterns (NOT Violations)

The following are acceptable and do NOT need remediation:

1. **Type guards at API boundaries**:
   - `typeof x === "string"` in type predicate functions
   - `instanceof Error` in catch blocks
   - `Array.isArray()` for type narrowing

2. **Third-party library interop**:
   - Faker.js date constructors
   - External library callbacks

3. **Test files**:
   - `@ts-expect-error` annotated lines
   - JSDoc examples

4. **Schema internals**:
   - `fc.map` from fast-check (not native array)
   - `S.filter` from Effect Schema
