# @beep/calendar-tables

Drizzle ORM table definitions for the calendar vertical slice.

## Overview

This package provides database schema definitions for calendar entities:
- Calendar event storage with temporal indexes
- Drizzle table definitions optimized for date range queries
- Relations for event-related data

## Installation

```bash
bun add @beep/calendar-tables
```

## Key Exports

| Export | Description |
|--------|-------------|
| `calendarEventTable` | Calendar event storage table |
| `schema` | Unified schema export for migrations |
| `relations` | Drizzle relation definitions |

## Dependencies

| Package | Purpose |
|---------|---------|
| `@beep/shared-tables` | Shared column helpers |
| `drizzle-orm` | ORM for type-safe database access |

## Usage

```typescript
import { schema, relations } from "@beep/calendar-tables";
import { drizzle } from "drizzle-orm/node-postgres";

const db = drizzle(pool, { schema: { ...schema }, relations });
```

## Table Structure

### calendar_event

| Column | Type | Description |
|--------|------|-------------|
| `id` | `text` | Primary key with `evt_` prefix |
| `organizationId` | `text` | Tenant isolation |
| `title` | `text` | Event title |
| `startTime` | `timestamp` | Event start (with timezone) |
| `endTime` | `timestamp` | Event end (with timezone) |

## Related Packages

| Package | Purpose |
|---------|---------|
| `@beep/calendar-domain` | Domain models |
| `@beep/calendar-server` | Repository implementations |
