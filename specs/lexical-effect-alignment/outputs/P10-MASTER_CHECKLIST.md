# P10 Master Checklist: Native Date Migration

## Summary

| Metric | Count |
|--------|-------|
| Total files with violations | 7 |
| Total violations | ~45 |
| Files needing migration | 6 |

## Files Requiring Migration

### 1. nodes/DateTimeNode/DateTimeNode.tsx (CRITICAL - 12 violations)

| Line | Pattern | Migration |
|------|---------|-----------|
| 41 | `dateTime: Date` type | `DateTime.Utc` |
| 45 | `dateTime?.getHours()` | `DateTime.getPartUtc(dateTime, "hours")` |
| 46 | `dateTime?.getMinutes()` | `DateTime.getPartUtc(dateTime, "minutes")` |
| 48 | `dateTime.toDateString()` | `DateTime.formatDateOnly(dateTime)` or custom |
| 65 | `new Date(Date.parse(dateTimeValue))` | `DateTime.make(dateTimeValue)` |
| 72-73 | `Date.parse(...)` + `new Date(...)` | `DateTime.make(parsed.dat_df.dfie_dt)` |
| 80 | `new Date(v as string)` | `DateTime.make(v)` |
| 81 | `v.toISOString()` | `DateTime.formatIso(v)` |
| 125, 131 | `.toString()` | `DateTime.formatIso(dateTime)` |
| 149 | `$createDateTimeNode(dateTime: Date)` | `DateTime.Utc` type |

### 2. nodes/DateTimeNode/DateTimeComponent.tsx (CRITICAL - 10 violations)

| Line | Pattern | Migration |
|------|---------|-----------|
| 29 | `dateTime: Date \| undefined` type | `DateTime.Utc \| undefined` |
| 39, 47 | `dateTime?.getHours()` | `DateTime.getPartUtc(dateTime, "hours")` |
| 40, 48 | `dateTime?.getMinutes()` | `DateTime.getPartUtc(dateTime, "minutes")` |
| 99 | `date: Date \| undefined` | `DateTime.Utc \| undefined` |
| 106 | `new Date(date.getFullYear(), ...)` | Build with DateTime arithmetic |
| 143 | `new Date(1925, 0)` | `DateTime.make({ year: 1925, month: 1 })` |
| 144 | `new Date(2042, 7)` | `DateTime.make({ year: 2042, month: 8 })` |

### 3. nodes/DateTimeNode/datetime-utils.ts (1 violation)

| Line | Pattern | Migration |
|------|---------|-----------|
| 8 | `setDateTime(date: Date)` | `DateTime.Utc` type |

### 4. plugins/ComponentPickerPlugin/index.tsx (12 violations)

| Line | Pattern | Migration |
|------|---------|-----------|
| 296 | `new Date()` | `DateTime.unsafeNow()` |
| 297 | `dateTime.setHours(0, 0, 0, 0)` | `pipe(DateTime.startOfDay)` |
| 305 | `new Date()` | `DateTime.unsafeNow()` |
| 306 | `dateTime.setHours(0, 0, 0, 0)` | `pipe(DateTime.startOfDay)` |
| 314 | `new Date()` | `DateTime.unsafeNow()` |
| 315 | `dateTime.setDate(dateTime.getDate() + 1)` | `DateTime.add({ days: 1 })` |
| 316 | `dateTime.setHours(0, 0, 0, 0)` | `pipe(DateTime.startOfDay)` |
| 324 | `new Date()` | `DateTime.unsafeNow()` |
| 325 | `dateTime.setDate(dateTime.getDate() - 1)` | `DateTime.subtract({ days: 1 })` |
| 326 | `dateTime.setHours(0, 0, 0, 0)` | `pipe(DateTime.startOfDay)` |

### 5. plugins/ToolbarPlugin/index.tsx (2 violations)

| Line | Pattern | Migration |
|------|---------|-----------|
| 1027 | `new Date()` | `DateTime.unsafeNow()` |
| 1028 | `dateTime.setHours(0, 0, 0, 0)` | `pipe(DateTime.startOfDay)` |

### 6. plugins/VersionsPlugin/index.tsx (5 violations)

| Line | Pattern | Migration |
|------|---------|-----------|
| 165 | `Date.now()` | `DateTime.unsafeNow()` then `DateTime.toEpochMillis()` |
| 169 | `new Date(now).toLocaleString()` | Format DateTime directly |
| 253 | `new Date(version.timestamp).toLocaleString()` | `DateTime.make(timestamp)` then format |

### 7. plugins/DateTimePlugin/index.tsx (1 type annotation)

| Line | Pattern | Migration |
|------|---------|-----------|
| 19 | `readonly dateTime: Date` | `DateTime.Utc` |

## Files Clean (No Migration Needed)

- commenting/ - Already uses `DateTime.unsafeNow()` in models.ts
- context/ - No Date usage
- hooks/ - No Date usage
- ui/ - No Date usage
- utils/ - No Date usage
- plugins/G*-M* (ImagesPlugin, KeywordsPlugin, LayoutPlugin, etc.) - No Date usage

## Migration Order (Dependency-Based)

1. **Batch 1**: Type foundations
   - `datetime-utils.ts` - Interface type
   - `DateTimePlugin/index.tsx` - Command payload type

2. **Batch 2**: Core node implementation
   - `DateTimeNode.tsx` - Node class + factory
   - `DateTimeComponent.tsx` - React component

3. **Batch 3**: Plugin consumers
   - `ComponentPickerPlugin/index.tsx`
   - `ToolbarPlugin/index.tsx`
   - `VersionsPlugin/index.tsx`

## Critical Notes

### DateTime API Quick Reference

```typescript
import * as DateTime from "effect/DateTime";
import * as O from "effect/Option";

// Current time (sync)
const now = DateTime.unsafeNow();

// Current time (Effect)
const now = yield* DateTime.now;

// Parse string (returns Option)
const parsed = DateTime.make("2024-01-15T10:30:00Z");

// Get parts
DateTime.getPartUtc(dt, "hours")    // 0-23
DateTime.getPartUtc(dt, "minutes")  // 0-59
DateTime.getPartUtc(dt, "day")      // 1-31 (day of month)
DateTime.getPartUtc(dt, "year")     // e.g., 2024

// Arithmetic
pipe(dt, DateTime.add({ days: 1 }))
pipe(dt, DateTime.subtract({ days: 1 }))
pipe(dt, DateTime.startOfDay)

// Formatting
DateTime.formatIso(dt)              // ISO 8601 string
DateTime.toEpochMillis(dt)          // number

// From epoch millis
DateTime.make(timestampMillis)      // Option<DateTime.Utc>
```

### Special Considerations

1. **react-day-picker Integration**: DateTimeComponent uses react-day-picker which expects JavaScript `Date` objects. May need conversion at boundary:
   ```typescript
   // Convert DateTime.Utc to JS Date for react-day-picker
   const jsDate = new Date(DateTime.toEpochMillis(dt));

   // Convert JS Date from react-day-picker to DateTime.Utc
   const effectDt = DateTime.make(jsDate.toISOString());
   ```

2. **Lexical State Serialization**: DateTimeNode stores dates as strings. Migration should preserve:
   ```typescript
   // Serialize
   unparse: (v: DateTime.Utc) => DateTime.formatIso(v)

   // Deserialize
   parse: (v: string) => DateTime.make(v).pipe(O.getOrThrow)
   ```

3. **Timestamp Storage**: VersionsPlugin stores `timestamp` as number (epoch millis). Keep format:
   ```typescript
   const now = DateTime.toEpochMillis(DateTime.unsafeNow());
   ```
