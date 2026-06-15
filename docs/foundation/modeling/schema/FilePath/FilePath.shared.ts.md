---
title: FilePath.shared.ts
nav_order: 89
parent: "@beep/schema"
---

## FilePath.shared.ts overview

Internal schema module support.

Since v0.0.0

---
## Exports Grouped by Category
- [schemas](#schemas)
  - [usesUnsupportedWindowsNamespacePrefix](#usesunsupportedwindowsnamespaceprefix)
- [symbols](#symbols)
  - [isWindowsDrivePrefix](#iswindowsdriveprefix)
  - [splitNonEmpty](#splitnonempty)
  - [windowsDrivePrefixRegExp](#windowsdriveprefixregexp)
  - [windowsDriveRootRegExp](#windowsdriverootregexp)
  - [windowsInvalidSegmentCharacterRegExp](#windowsinvalidsegmentcharacterregexp)
  - [windowsInvalidTrailingSegmentRegExp](#windowsinvalidtrailingsegmentregexp)
  - [windowsSegmentWithoutSeparatorsRegExp](#windowssegmentwithoutseparatorsregexp)
  - [windowsUncPrefixRegExp](#windowsuncprefixregexp)
  - [windowsUncRootRegExp](#windowsuncrootregexp)
---

# schemas

## usesUnsupportedWindowsNamespacePrefix

Public schema module export.

**Signature**

```ts
declare const usesUnsupportedWindowsNamespacePrefix: (input: string) => boolean
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FilePath/FilePath.shared.ts#L107)

Since v0.0.0

# symbols

## isWindowsDrivePrefix

Public schema module export.

**Signature**

```ts
declare const isWindowsDrivePrefix: (value: string) => boolean
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FilePath/FilePath.shared.ts#L119)

Since v0.0.0

## splitNonEmpty

Public schema module export.

**Signature**

```ts
declare const splitNonEmpty: (separator: string | RegExp) => (self: string) => Array<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FilePath/FilePath.shared.ts#L98)

Since v0.0.0

## windowsDrivePrefixRegExp

Public schema module export.

**Signature**

```ts
declare const windowsDrivePrefixRegExp: RegExp
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FilePath/FilePath.shared.ts#L29)

Since v0.0.0

## windowsDriveRootRegExp

Public schema module export.

**Signature**

```ts
declare const windowsDriveRootRegExp: RegExp
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FilePath/FilePath.shared.ts#L37)

Since v0.0.0

## windowsInvalidSegmentCharacterRegExp

Public schema module export.

**Signature**

```ts
declare const windowsInvalidSegmentCharacterRegExp: RegExp
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FilePath/FilePath.shared.ts#L69)

Since v0.0.0

## windowsInvalidTrailingSegmentRegExp

Public schema module export.

**Signature**

```ts
declare const windowsInvalidTrailingSegmentRegExp: RegExp
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FilePath/FilePath.shared.ts#L77)

Since v0.0.0

## windowsSegmentWithoutSeparatorsRegExp

Public schema module export.

**Signature**

```ts
declare const windowsSegmentWithoutSeparatorsRegExp: RegExp
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FilePath/FilePath.shared.ts#L61)

Since v0.0.0

## windowsUncPrefixRegExp

Public schema module export.

**Signature**

```ts
declare const windowsUncPrefixRegExp: RegExp
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FilePath/FilePath.shared.ts#L45)

Since v0.0.0

## windowsUncRootRegExp

Public schema module export.

**Signature**

```ts
declare const windowsUncRootRegExp: RegExp
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FilePath/FilePath.shared.ts#L53)

Since v0.0.0