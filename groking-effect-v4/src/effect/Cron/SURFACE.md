# effect/Cron Surface

Total exports: 12

| Export | Kind | Overview |
|---|---|---|
| `Cron` | `interface` | Represents a cron schedule with time constraints and timezone information. |
| `CronParseError` | `class` | No summary found in JSDoc. |
| `equals` | `const` | Checks if two Cron instances are equal. |
| `Equivalence` | `const` | An Equivalence instance for comparing Cron schedules. |
| `isCron` | `const` | Checks if a given value is a Cron instance. |
| `isCronParseError` | `const` | Checks if a given value is a CronParseError instance. |
| `make` | `const` | Creates a Cron instance from time constraints. |
| `match` | `const` | Checks if a given date/time falls within an active Cron time window. |
| `next` | `const` | Returns the next scheduled date/time for the given Cron instance. |
| `parse` | `const` | Parses a cron expression into a `Cron` instance. |
| `parseUnsafe` | `const` | Parses a cron expression into a Cron instance, throwing on failure. |
| `sequence` | `const` | Returns an infinite iterator that yields dates matching the Cron schedule. |
