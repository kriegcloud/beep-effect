# DateTime: A Real-World Guide

## Table of Contents
1. [Introduction & Core Concepts](#introduction--core-concepts)
2. [Basic Usage Patterns](#basic-usage-patterns)
3. [Real-World Examples](#real-world-examples)
4. [Advanced Features Deep Dive](#advanced-features-deep-dive)
5. [Practical Patterns & Best Practices](#practical-patterns--best-practices)
6. [Integration Examples](#integration-examples)

## Introduction & Core Concepts

### The Problem DateTime Solves

JavaScript's Date object is notoriously problematic for handling dates and times in production applications. Common issues include timezone confusion, mutable dates, inconsistent APIs, and error-prone parsing:

```typescript
// Traditional approach - JavaScript Date pitfalls
const now = new Date()
const tomorrow = now
tomorrow.setDate(now.getDate() + 1) // Mutates the original date!

// Timezone confusion
const date1 = new Date("2024-03-15") // UTC midnight
const date2 = new Date(2024, 2, 15)  // Local midnight (month is 0-indexed!)
console.log(date1.getTime() === date2.getTime()) // false (usually)

// Parsing ambiguity
const parsed1 = new Date("03/15/2024") // MM/DD/YYYY or DD/MM/YYYY?
const parsed2 = new Date("2024-03-15") // ISO format
const parsed3 = new Date("March 15, 2024") // Natural language

// Date arithmetic is error-prone
function addDays(date: Date, days: number): Date {
  const result = new Date(date) // Must manually clone
  result.setDate(result.getDate() + days)
  return result
}

// Adding months doesn't handle edge cases
const jan31 = new Date(2024, 0, 31)
jan31.setMonth(jan31.getMonth() + 1) // February 31? Becomes March 2/3!

// Formatting requires manual work
function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Timezone operations are complex
function convertToTimezone(date: Date, timezone: string): Date {
  // No built-in support, need complex calculations or libraries
  const localTime = date.getTime()
  const localOffset = date.getTimezoneOffset() * 60000
  // ... complex logic ...
  return new Date(/* calculated time */)
}

// Comparing dates requires careful handling
function isDateInRange(date: Date, start: Date, end: Date): boolean {
  // Must ensure all dates are in same timezone
  // Must handle time components correctly
  return date >= start && date <= end
}
```

This approach leads to:
- **Mutability Issues** - Accidental date modifications causing bugs
- **Timezone Confusion** - Mixing UTC and local times without clarity
- **Parsing Ambiguity** - Inconsistent date string interpretation
- **Arithmetic Complexity** - Manual handling of edge cases (leap years, month boundaries)
- **Poor Type Safety** - No compile-time guarantees about date validity

### The DateTime Solution

Effect's DateTime module provides an immutable, timezone-aware, type-safe solution for date and time operations:

```typescript
import { DateTime, Effect, pipe } from "effect"

// Immutable date creation
const now = DateTime.now
const tomorrow = DateTime.addDays(now, 1) // Original unchanged

// Clear timezone handling
const utcDate = DateTime.makeUtc(2024, 3, 15)
const localDate = DateTime.makeZoned(2024, 3, 15, "America/New_York")

// Type-safe parsing
const parsed = DateTime.parse("2024-03-15", { format: "yyyy-MM-dd" })

// Intuitive arithmetic with edge case handling
const jan31 = DateTime.make(2024, 1, 31)
const feb29 = DateTime.addMonths(jan31, 1) // Correctly handles month end

// Built-in formatting
const formatted = DateTime.format(now, { format: "yyyy-MM-dd HH:mm:ss" })

// First-class timezone support
const converted = DateTime.setZone(utcDate, "Asia/Tokyo")

// Type-safe comparisons
const isInRange = DateTime.between(DateTime.now, startDate, endDate)
```

### Key Concepts

**DateTime**: An immutable representation of a date and time with timezone information. All operations return new instances.

```typescript
const dt: DateTime.DateTime = DateTime.now
```

**Time Zones**: First-class support for timezone-aware operations with IANA timezone database.

```typescript
const utc = DateTime.nowUtc
const tokyo = DateTime.setZone(utc, "Asia/Tokyo")
const newYork = DateTime.setZone(utc, "America/New_York")
```

**DateTime Parts**: Type-safe access to individual components with proper boundaries.

```typescript
const parts = DateTime.toParts(DateTime.now)
// { year: 2024, month: 3, day: 15, hours: 14, minutes: 30, ... }
```

## Basic Usage Patterns

### Creating DateTimes

```typescript
import { DateTime, Option } from "effect"

// Current time
const now = DateTime.now                    // Local timezone
const nowUtc = DateTime.nowUtc              // UTC timezone

// From components (local timezone)
const specificDate = DateTime.make(2024, 3, 15)
const specificTime = DateTime.make(2024, 3, 15, 14, 30, 0)
const withMillis = DateTime.make(2024, 3, 15, 14, 30, 0, 123)

// From components with timezone
const utcDate = DateTime.makeUtc(2024, 3, 15, 14, 30)
const nyDate = DateTime.makeZoned(2024, 3, 15, 14, 30, 0, "America/New_York")
const tokyoDate = DateTime.makeZoned(2024, 3, 15, 14, 30, 0, "Asia/Tokyo")

// From timestamps
const fromMillis = DateTime.fromMillis(1710516600000)
const fromSeconds = DateTime.fromSeconds(1710516600)

// From JavaScript Date
const fromJsDate = DateTime.fromDate(new Date())

// Safe construction with validation
const safeMake = (year: number, month: number, day: number) =>
  pipe(
    DateTime.makeOption(year, month, day),
    Option.getOrElse(() => DateTime.now)
  )

// From parts object
const fromParts = DateTime.fromParts({
  year: 2024,
  month: 3,
  day: 15,
  hours: 14,
  minutes: 30,
  seconds: 0,
  milliseconds: 0
})
```

### DateTime Arithmetic

```typescript
import { DateTime, Duration, pipe } from "effect"

const baseDate = DateTime.make(2024, 3, 15, 10, 0, 0)

// Adding/subtracting time units
const tomorrow = DateTime.addDays(baseDate, 1)
const yesterday = DateTime.addDays(baseDate, -1)
const nextWeek = DateTime.addWeeks(baseDate, 1)
const nextMonth = DateTime.addMonths(baseDate, 1)
const nextYear = DateTime.addYears(baseDate, 1)

// Adding hours/minutes/seconds
const later = pipe(
  DateTime.addHours(baseDate, 2),
  DateTime.addMinutes(30),
  DateTime.addSeconds(45)
)

// Using Duration for precise additions
const withDuration = DateTime.addDuration(baseDate, Duration.hours(2.5))

// Month-end handling
const jan31 = DateTime.make(2024, 1, 31)
const feb29 = DateTime.addMonths(jan31, 1)  // 2024-02-29 (leap year)
const mar31 = DateTime.addMonths(feb29, 1)  // 2024-03-31

const jan31_2023 = DateTime.make(2023, 1, 31)
const feb28_2023 = DateTime.addMonths(jan31_2023, 1)  // 2023-02-28 (non-leap)

// Complex date calculations
const endOfQuarter = pipe(
  DateTime.startOfQuarter(DateTime.now),
  DateTime.addMonths(3),
  DateTime.addDays(-1)
)

// Business day calculations
const addBusinessDays = (date: DateTime.DateTime, days: number): DateTime.DateTime => {
  let current = date
  let remaining = Math.abs(days)
  const direction = days > 0 ? 1 : -1
  
  while (remaining > 0) {
    current = DateTime.addDays(current, direction)
    const dayOfWeek = DateTime.dayOfWeek(current)
    
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not weekend
      remaining--
    }
  }
  
  return current
}
```

### DateTime Comparisons and Queries

```typescript
import { DateTime, pipe } from "effect"

const date1 = DateTime.make(2024, 3, 15, 10, 0)
const date2 = DateTime.make(2024, 3, 16, 10, 0)
const date3 = DateTime.make(2024, 3, 15, 10, 0)

// Equality checks (considers timezone)
const isEqual = DateTime.equals(date1, date3) // true
const isDifferent = DateTime.equals(date1, date2) // false

// Ordering comparisons
const isBefore = DateTime.lessThan(date1, date2) // true
const isAfter = DateTime.greaterThan(date2, date1) // true
const isBeforeOrEqual = DateTime.lessThanOrEqualTo(date1, date3) // true

// Range checks
const now = DateTime.now
const isInRange = DateTime.between(
  now,
  DateTime.make(2024, 1, 1),
  DateTime.make(2024, 12, 31)
)

// Finding min/max
const earliest = DateTime.min(date1, date2, date3) // date1
const latest = DateTime.max(date1, date2, date3) // date2

// Distance calculations
const daysBetween = DateTime.distanceInDays(date2, date1) // 1

const hoursBetween = DateTime.distanceInHours(date2, date1) // 24

// Getting date components
const year = DateTime.year(now)
const month = DateTime.month(now)
const day = DateTime.day(now)
const hour = DateTime.hours(now)
const dayOfWeek = DateTime.dayOfWeek(now) // 0 = Sunday, 6 = Saturday
const dayOfYear = DateTime.dayOfYear(now)
const weekOfYear = DateTime.weekOfYear(now)

// Checking date properties
const isWeekend = pipe(
  now,
  DateTime.dayOfWeek,
  (day) => day === 0 || day === 6
)

const isLeapYear = DateTime.isLeapYear(2024) // true
const daysInMonth = DateTime.daysInMonth(2024, 2) // 29
const daysInYear = DateTime.daysInYear(2024) // 366
```

## Real-World Examples

### Example 1: Event Scheduling System

Building a timezone-aware event scheduling system with recurring events:

```typescript
import { Effect, DateTime, Duration, Option, Array, pipe } from "effect"

interface Event {
  readonly id: string
  readonly title: string
  readonly startTime: DateTime.DateTime
  readonly duration: Duration.Duration
  readonly timezone: string
  readonly recurrence?: RecurrenceRule
}

interface RecurrenceRule {
  readonly frequency: "daily" | "weekly" | "monthly" | "yearly"
  readonly interval: number
  readonly count?: number
  readonly until?: DateTime.DateTime
  readonly byWeekDay?: readonly number[] // 0-6 for Sunday-Saturday
  readonly byMonthDay?: readonly number[] // 1-31
}

class EventScheduler {
  constructor(private events: Map<string, Event> = new Map()) {}

  // Add event with conflict detection
  addEvent = (event: Event): Effect.Effect<void, EventConflict> =>
    Effect.gen(function* () {
      const conflicts = yield* this.findConflicts(
        event.startTime,
        DateTime.addDuration(event.startTime, event.duration),
        event.timezone
      )
      
      if (conflicts.length > 0) {
        return yield* Effect.fail(new EventConflict(event, conflicts))
      }
      
      this.events.set(event.id, event)
    })

  // Find conflicts in a time range
  findConflicts = (
    start: DateTime.DateTime,
    end: DateTime.DateTime,
    timezone: string
  ): Effect.Effect<readonly Event[]> =>
    Effect.sync(() => {
      const conflicts: Event[] = []
      
      for (const event of this.events.values()) {
        const eventStart = pipe(
          event.startTime,
          DateTime.setZone(timezone)
        )
        const eventEnd = pipe(
          eventStart,
          DateTime.addDuration(event.duration)
        )
        
        // Check for overlap
        if (
          DateTime.lessThan(start, eventEnd) &&
          DateTime.greaterThan(end, eventStart)
        ) {
          conflicts.push(event)
        }
      }
      
      return conflicts
    })

  // Generate recurring event instances
  generateOccurrences = (
    event: Event,
    rangeStart: DateTime.DateTime,
    rangeEnd: DateTime.DateTime
  ): Effect.Effect<readonly DateTime.DateTime[]> =>
    Effect.gen(function* () {
      if (!event.recurrence) {
        return [event.startTime]
      }
      
      const occurrences: DateTime.DateTime[] = []
      let current = event.startTime
      let count = 0
      
      while (
        DateTime.lessThanOrEqualTo(current, rangeEnd) &&
        (!event.recurrence.count || count < event.recurrence.count) &&
        (!event.recurrence.until || DateTime.lessThanOrEqualTo(current, event.recurrence.until))
      ) {
        if (DateTime.greaterThanOrEqualTo(current, rangeStart)) {
          // Apply weekday/monthday filters
          const shouldInclude = yield* this.matchesRecurrenceRules(
            current,
            event.recurrence
          )
          
          if (shouldInclude) {
            occurrences.push(current)
            count++
          }
        }
        
        // Calculate next occurrence
        current = yield* this.nextOccurrence(current, event.recurrence)
      }
      
      return occurrences
    })

  private matchesRecurrenceRules = (
    date: DateTime.DateTime,
    rule: RecurrenceRule
  ): Effect.Effect<boolean> =>
    Effect.gen(function* () {
      if (rule.byWeekDay) {
        const dayOfWeek = DateTime.dayOfWeek(date)
        if (!rule.byWeekDay.includes(dayOfWeek)) {
          return false
        }
      }
      
      if (rule.byMonthDay) {
        const dayOfMonth = DateTime.day(date)
        if (!rule.byMonthDay.includes(dayOfMonth)) {
          return false
        }
      }
      
      return true
    })

  private nextOccurrence = (
    current: DateTime.DateTime,
    rule: RecurrenceRule
  ): Effect.Effect<DateTime.DateTime> =>
    Effect.sync(() => {
      switch (rule.frequency) {
        case "daily":
          return DateTime.addDays(current, rule.interval)
        case "weekly":
          return DateTime.addWeeks(current, rule.interval)
        case "monthly":
          return DateTime.addMonths(current, rule.interval)
        case "yearly":
          return DateTime.addYears(current, rule.interval)
      }
    })

  // Get agenda view for a date range
  getAgenda = (
    start: DateTime.DateTime,
    end: DateTime.DateTime,
    timezone: string
  ): Effect.Effect<readonly AgendaItem[]> =>
    Effect.gen(function* () {
      const items: AgendaItem[] = []
      
      for (const event of this.events.values()) {
        const occurrences = yield* this.generateOccurrences(event, start, end)
        
        for (const occurrence of occurrences) {
          items.push({
            event,
            startTime: DateTime.setZone(occurrence, timezone),
            endTime: pipe(
              occurrence,
              DateTime.addDuration(event.duration),
              DateTime.setZone(timezone)
            )
          })
        }
      }
      
      // Sort by start time
      return items.sort((a, b) =>
        DateTime.lessThan(a.startTime, b.startTime) ? -1 : 1
      )
    })
}

interface AgendaItem {
  readonly event: Event
  readonly startTime: DateTime.DateTime
  readonly endTime: DateTime.DateTime
}

class EventConflict {
  readonly _tag = "EventConflict"
  constructor(
    readonly event: Event,
    readonly conflicts: readonly Event[]
  ) {}
}

// Usage example
const schedulerExample = Effect.gen(function* () {
  const scheduler = new EventScheduler()
  
  // Add a recurring meeting
  yield* scheduler.addEvent({
    id: "weekly-standup",
    title: "Team Standup",
    startTime: DateTime.makeZoned(2024, 3, 18, 9, 0, 0, "America/New_York"),
    duration: Duration.minutes(30),
    timezone: "America/New_York",
    recurrence: {
      frequency: "weekly",
      interval: 1,
      byWeekDay: [1, 2, 3, 4, 5], // Monday-Friday
      count: 52 // One year
    }
  })
  
  // Add a monthly review
  yield* scheduler.addEvent({
    id: "monthly-review",
    title: "Monthly Review",
    startTime: DateTime.makeZoned(2024, 3, 1, 14, 0, 0, "America/New_York"),
    duration: Duration.hours(2),
    timezone: "America/New_York",
    recurrence: {
      frequency: "monthly",
      interval: 1,
      byMonthDay: [1] // First of each month
    }
  })
  
  // Get agenda for next week
  const agenda = yield* scheduler.getAgenda(
    DateTime.now,
    DateTime.addWeeks(DateTime.now, 1),
    "America/New_York"
  )
  
  // Format agenda items
  for (const item of agenda) {
    console.log(
      `${DateTime.format(item.startTime, { format: "yyyy-MM-dd HH:mm" })} - ` +
      `${DateTime.format(item.endTime, { format: "HH:mm" })}: ${item.event.title}`
    )
  }
})
```

### Example 2: Multi-Timezone Dashboard

Building a dashboard that displays times across multiple timezones with DST handling:

```typescript
import { Effect, DateTime, Duration, Chunk, pipe } from "effect"

interface TimezoneInfo {
  readonly zone: string
  readonly name: string
  readonly offset: string
  readonly isDST: boolean
  readonly currentTime: DateTime.DateTime
}

interface Meeting {
  readonly id: string
  readonly title: string
  readonly utcTime: DateTime.DateTime
  readonly duration: Duration.Duration
}

class MultiTimezoneDashboard {
  constructor(
    private readonly timezones: readonly string[],
    private readonly homeTimezone: string
  ) {}

  // Get current time info for all timezones
  getTimezoneInfo = (): Effect.Effect<readonly TimezoneInfo[]> =>
    Effect.gen(function* () {
      const now = DateTime.nowUtc
      
      return yield* Effect.all(
        this.timezones.map((zone) =>
          Effect.sync(() => {
            const zonedTime = DateTime.setZone(now, zone)
            const offset = DateTime.offsetFromUtc(zonedTime)
            
            return {
              zone,
              name: this.getTimezoneName(zone),
              offset: this.formatOffset(offset),
              isDST: DateTime.isDST(zonedTime),
              currentTime: zonedTime
            }
          })
        )
      )
    })

  // Schedule meeting with timezone conversions
  scheduleMeeting = (
    meeting: Meeting
  ): Effect.Effect<readonly MeetingView[]> =>
    Effect.gen(function* () {
      return yield* Effect.all(
        this.timezones.map((zone) =>
          Effect.sync(() => {
            const localTime = DateTime.setZone(meeting.utcTime, zone)
            const endTime = pipe(
              localTime,
              DateTime.addDuration(meeting.duration)
            )
            
            return {
              ...meeting,
              zone,
              localStartTime: localTime,
              localEndTime: endTime,
              dayOffset: this.calculateDayOffset(meeting.utcTime, zone),
              isBusinessHours: this.isBusinessHours(localTime)
            }
          })
        )
      )
    })

  // Find optimal meeting time across timezones
  findOptimalMeetingTime = (
    duration: Duration.Duration,
    constraints: MeetingConstraints
  ): Effect.Effect<readonly DateTime.DateTime[]> =>
    Effect.gen(function* () {
      const candidates: DateTime.DateTime[] = []
      let current = constraints.earliestStart
      
      while (DateTime.lessThan(current, constraints.latestStart)) {
        const isOptimal = yield* this.checkMeetingTime(
          current,
          duration,
          constraints
        )
        
        if (isOptimal) {
          candidates.push(current)
        }
        
        current = DateTime.addMinutes(current, 30))
      }
      
      // Sort by optimization score
      return candidates.sort((a, b) => {
        const scoreA = this.scoreMeetingTime(a, duration)
        const scoreB = this.scoreMeetingTime(b, duration)
        return scoreB - scoreA
      })
    })

  private checkMeetingTime = (
    utcTime: DateTime.DateTime,
    duration: Duration.Duration,
    constraints: MeetingConstraints
  ): Effect.Effect<boolean> =>
    Effect.gen(function* () {
      for (const zone of constraints.requiredTimezones) {
        const localStart = DateTime.setZone(utcTime, zone)
        const localEnd = DateTime.addDuration(localStart, duration)
        
        // Check business hours constraint
        if (
          constraints.businessHoursOnly &&
          (!this.isBusinessHours(localStart) || !this.isBusinessHours(localEnd))
        ) {
          return false
        }
        
        // Check working hours preference
        const startHour = DateTime.hours(localStart)
        if (startHour < 6 || startHour > 20) {
          return false
        }
      }
      
      return true
    })

  private scoreMeetingTime = (
    utcTime: DateTime.DateTime,
    duration: Duration.Duration
  ): number => {
    let score = 100
    
    for (const zone of this.timezones) {
      const localStart = DateTime.setZone(utcTime, zone)
      const hour = DateTime.hours(localStart)
      
      // Prefer morning meetings
      if (hour >= 9 && hour <= 11) {
        score += 10
      }
      // Penalize very early or very late
      else if (hour < 8 || hour > 18) {
        score -= 20
      }
      
      // Penalize lunch hours
      if (hour === 12) {
        score -= 15
      }
    }
    
    return score
  }

  private isBusinessHours = (time: DateTime.DateTime): boolean => {
    const hour = DateTime.hours(time)
    const dayOfWeek = DateTime.dayOfWeek(time)
    
    return dayOfWeek >= 1 && dayOfWeek <= 5 && hour >= 9 && hour < 17
  }

  private calculateDayOffset = (
    utcTime: DateTime.DateTime,
    zone: string
  ): number => {
    const utcDay = DateTime.day(utcTime)
    const localDay = DateTime.day(DateTime.setZone(utcTime, zone))
    return localDay - utcDay
  }

  private formatOffset = (offsetMinutes: number): string => {
    const hours = Math.floor(Math.abs(offsetMinutes) / 60)
    const minutes = Math.abs(offsetMinutes) % 60
    const sign = offsetMinutes >= 0 ? "+" : "-"
    
    return `UTC${sign}${hours}:${minutes.toString().padStart(2, "0")}`
  }

  private getTimezoneName = (zone: string): string => {
    const names: Record<string, string> = {
      "America/New_York": "Eastern Time",
      "America/Los_Angeles": "Pacific Time",
      "Europe/London": "London",
      "Asia/Tokyo": "Tokyo",
      "Australia/Sydney": "Sydney"
    }
    return names[zone] || zone
  }
}

interface MeetingView extends Meeting {
  readonly zone: string
  readonly localStartTime: DateTime.DateTime
  readonly localEndTime: DateTime.DateTime
  readonly dayOffset: number
  readonly isBusinessHours: boolean
}

interface MeetingConstraints {
  readonly earliestStart: DateTime.DateTime
  readonly latestStart: DateTime.DateTime
  readonly requiredTimezones: readonly string[]
  readonly businessHoursOnly: boolean
}

// Usage example
const dashboardExample = Effect.gen(function* () {
  const dashboard = new MultiTimezoneDashboard(
    ["America/New_York", "Europe/London", "Asia/Tokyo"],
    "America/New_York"
  )
  
  // Display current times
  const timezoneInfo = yield* dashboard.getTimezoneInfo()
  console.log("Current Times:")
  for (const info of timezoneInfo) {
    console.log(
      `${info.name}: ${DateTime.format(info.currentTime, { format: "HH:mm" })} ` +
      `(${info.offset}${info.isDST ? " DST" : ""})`
    )
  }
  
  // Find optimal meeting time
  const optimal = yield* dashboard.findOptimalMeetingTime(
    Duration.hours(1),
    {
      earliestStart: DateTime.addDays(DateTime.nowUtc, 1),
      latestStart: DateTime.addDays(DateTime.nowUtc, 2),
      requiredTimezones: ["America/New_York", "Europe/London", "Asia/Tokyo"],
      businessHoursOnly: false
    }
  )
  
  if (optimal.length > 0) {
    console.log("\nOptimal meeting times:")
    const views = yield* dashboard.scheduleMeeting({
      id: "global-sync",
      title: "Global Team Sync",
      utcTime: optimal[0],
      duration: Duration.hours(1)
    })
    
    for (const view of views) {
      const format = view.dayOffset !== 0
        ? "yyyy-MM-dd HH:mm"
        : "HH:mm"
      console.log(
        `${view.zone}: ${DateTime.format(view.localStartTime, { format })}` +
        (view.dayOffset !== 0 ? ` (${view.dayOffset > 0 ? "+" : ""}${view.dayOffset} day)` : "")
      )
    }
  }
})
```

### Example 3: Time-Series Data Processing

Processing financial data with proper date handling and business day calculations:

```typescript
import { Effect, DateTime, Option, Array, pipe } from "effect"

interface PriceData {
  readonly date: DateTime.DateTime
  readonly open: number
  readonly high: number
  readonly low: number
  readonly close: number
  readonly volume: number
}

interface TradingCalendar {
  readonly isMarketOpen: (date: DateTime.DateTime) => boolean
  readonly nextTradingDay: (date: DateTime.DateTime) => DateTime.DateTime
  readonly previousTradingDay: (date: DateTime.DateTime) => DateTime.DateTime
  readonly tradingDaysBetween: (start: DateTime.DateTime, end: DateTime.DateTime) => number
}

class USStockCalendar implements TradingCalendar {
  private holidays = new Set([
    "2024-01-01", // New Year's Day
    "2024-01-15", // MLK Day
    "2024-02-19", // Presidents Day
    "2024-03-29", // Good Friday
    "2024-05-27", // Memorial Day
    "2024-06-19", // Juneteenth
    "2024-07-04", // Independence Day
    "2024-09-02", // Labor Day
    "2024-11-28", // Thanksgiving
    "2024-12-25", // Christmas
  ])

  isMarketOpen = (date: DateTime.DateTime): boolean => {
    const dayOfWeek = DateTime.dayOfWeek(date)
    
    // Weekend check
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return false
    }
    
    // Holiday check
    const dateStr = DateTime.format(date, { format: "yyyy-MM-dd" })
    if (this.holidays.has(dateStr)) {
      return false
    }
    
    // Market hours check (9:30 AM - 4:00 PM ET)
    const et = DateTime.setZone(date, "America/New_York")
    const hour = DateTime.hours(et)
    const minute = DateTime.minutes(et)
    const timeInMinutes = hour * 60 + minute
    
    return timeInMinutes >= 570 && timeInMinutes < 960
  }

  nextTradingDay = (date: DateTime.DateTime): DateTime.DateTime => {
    let next = DateTime.addDays(date, 1))
    
    while (!this.isMarketOpen(next)) {
      next = DateTime.addDays(next, 1))
    }
    
    return DateTime.startOfDay(next)
  }

  previousTradingDay = (date: DateTime.DateTime): DateTime.DateTime => {
    let prev = DateTime.addDays(date, -1))
    
    while (!this.isMarketOpen(prev)) {
      prev = DateTime.addDays(prev, -1))
    }
    
    return DateTime.startOfDay(prev)
  }

  tradingDaysBetween = (start: DateTime.DateTime, end: DateTime.DateTime): number => {
    let count = 0
    let current = start
    
    while (DateTime.lessThanOrEqualTo(current, end)) {
      if (this.isMarketOpen(current)) {
        count++
      }
      current = DateTime.addDays(current, 1))
    }
    
    return count
  }
}

class TimeSeriesAnalyzer {
  constructor(
    private readonly data: readonly PriceData[],
    private readonly calendar: TradingCalendar
  ) {}

  // Get data for date range
  getDataRange = (
    start: DateTime.DateTime,
    end: DateTime.DateTime
  ): readonly PriceData[] =>
    this.data.filter((d) =>
      pipe(
        d.date,
        DateTime.between(start, end)
      )
    )

  // Calculate returns with proper day alignment
  calculateReturns = (
    period: "daily" | "weekly" | "monthly"
  ): Effect.Effect<readonly Return[]> =>
    Effect.gen(function* () {
      const returns: Return[] = []
      
      for (let i = 1; i < this.data.length; i++) {
        const current = this.data[i]
        const previous = this.data[i - 1]
        
        // Check if dates are consecutive trading days
        const expectedPrevious = this.calendar.previousTradingDay(current.date)
        if (!DateTime.equals(previous.date, expectedPrevious)) {
          continue // Skip if there's a gap
        }
        
        const returnPct = ((current.close - previous.close) / previous.close) * 100
        
        returns.push({
          date: current.date,
          return: returnPct,
          period
        })
      }
      
      return returns
    })

  // Moving average with calendar awareness
  movingAverage = (
    periods: number,
    useCalendarDays: boolean = false
  ): Effect.Effect<readonly MAPoint[]> =>
    Effect.gen(function* () {
      const maPoints: MAPoint[] = []
      
      for (let i = periods - 1; i < this.data.length; i++) {
        const endDate = this.data[i].date
        
        let startIndex: number
        if (useCalendarDays) {
          // Use calendar days
          const startDate = DateTime.addDays(endDate, -periods)
          startIndex = this.data.findIndex((d) =>
            DateTime.greaterThanOrEqualTo(d.date, startDate)
          )
        } else {
          // Use trading days
          startIndex = i - periods + 1
        }
        
        const subset = this.data.slice(startIndex, i + 1)
        const avg = subset.reduce((sum, d) => sum + d.close, 0) / subset.length
        
        maPoints.push({
          date: endDate,
          value: avg,
          periods
        })
      }
      
      return maPoints
    })

  // Volume-weighted average price (VWAP) for a day
  calculateVWAP = (date: DateTime.DateTime): Option.Option<number> => {
    const dayData = this.data.filter((d) =>
      DateTime.equals(
        DateTime.startOfDay(d.date),
        DateTime.startOfDay(date)
      )
    )
    
    if (dayData.length === 0) {
      return Option.none()
    }
    
    const totalValue = dayData.reduce(
      (sum, d) => sum + (d.close * d.volume),
      0
    )
    const totalVolume = dayData.reduce((sum, d) => sum + d.volume, 0)
    
    return Option.some(totalValue / totalVolume)
  }

  // Find gaps in data
  findDataGaps = (): readonly DataGap[] => {
    const gaps: DataGap[] = []
    
    for (let i = 1; i < this.data.length; i++) {
      const current = this.data[i].date
      const previous = this.data[i - 1].date
      
      const expectedDays = this.calendar.tradingDaysBetween(previous, current) - 1
      
      if (expectedDays > 1) {
        gaps.push({
          start: previous,
          end: current,
          missingDays: expectedDays - 1
        })
      }
    }
    
    return gaps
  }
}

interface Return {
  readonly date: DateTime.DateTime
  readonly return: number
  readonly period: string
}

interface MAPoint {
  readonly date: DateTime.DateTime
  readonly value: number
  readonly periods: number
}

interface DataGap {
  readonly start: DateTime.DateTime
  readonly end: DateTime.DateTime
  readonly missingDays: number
}

// Usage example
const timeSeriesExample = Effect.gen(function* () {
  const calendar = new USStockCalendar()
  
  // Generate sample data
  const generateSampleData = (): PriceData[] => {
    const data: PriceData[] = []
    let date = DateTime.make(2024, 1, 2)
    let price = 100
    
    for (let i = 0; i < 100; i++) {
      if (calendar.isMarketOpen(date)) {
        const change = (Math.random() - 0.5) * 4
        price = price * (1 + change / 100)
        
        data.push({
          date,
          open: price * (1 + (Math.random() - 0.5) * 0.01),
          high: price * (1 + Math.random() * 0.02),
          low: price * (1 - Math.random() * 0.02),
          close: price,
          volume: Math.floor(1000000 + Math.random() * 500000)
        })
      }
      
      date = DateTime.addDays(date, 1))
    }
    
    return data
  }
  
  const data = generateSampleData()
  const analyzer = new TimeSeriesAnalyzer(data, calendar)
  
  // Calculate returns
  const returns = yield* analyzer.calculateReturns("daily")
  console.log(`Daily returns calculated: ${returns.length} data points`)
  
  // Calculate moving averages
  const ma20 = yield* analyzer.movingAverage(20)
  const ma50 = yield* analyzer.movingAverage(50)
  
  // Find crossovers
  const crossovers = ma20.filter((point20, i) => {
    const point50 = ma50.find((p) => DateTime.equals(p.date, point20.date))
    if (!point50 || i === 0) return false
    
    const prev20 = ma20[i - 1]
    const prev50 = ma50.find((p) => DateTime.equals(p.date, prev20.date))
    if (!prev50) return false
    
    // Golden cross (20 crosses above 50)
    return prev20.value <= prev50.value && point20.value > point50.value
  })
  
  console.log(`Found ${crossovers.length} golden crosses`)
  
  // Check for data gaps
  const gaps = analyzer.findDataGaps()
  if (gaps.length > 0) {
    console.log("Data gaps found:")
    gaps.forEach((gap) => {
      console.log(
        `  ${DateTime.format(gap.start, { format: "yyyy-MM-dd" })} to ` +
        `${DateTime.format(gap.end, { format: "yyyy-MM-dd" })}: ` +
        `${gap.missingDays} missing days`
      )
    })
  }
})
```

## Advanced Features Deep Dive

### DateTime Parsing and Formatting

Effect provides flexible parsing and formatting with locale support:

#### Basic Parsing and Formatting

```typescript
import { DateTime, Either, pipe } from "effect"

// ISO format parsing (default)
const iso1 = DateTime.parse("2024-03-15")
const iso2 = DateTime.parse("2024-03-15T14:30:00Z")
const iso3 = DateTime.parse("2024-03-15T14:30:00+05:00")

// Custom format parsing
const custom1 = DateTime.parse("15/03/2024", { format: "dd/MM/yyyy" })
const custom2 = DateTime.parse("March 15, 2024", { format: "MMMM dd, yyyy" })
const custom3 = DateTime.parse("2024.03.15 14:30", { format: "yyyy.MM.dd HH:mm" })

// Safe parsing with validation
const safeParse = (input: string, format?: string) =>
  pipe(
    format
      ? DateTime.parseOption(input, { format })
      : DateTime.parseOption(input),
    Option.match({
      onNone: () => {
        console.error(`Invalid date: ${input}`)
        return DateTime.now
      },
      onSome: (date) => date
    })
  )

// Formatting with patterns
const now = DateTime.now

// Common formats
console.log(DateTime.format(now)) // Default ISO format
console.log(DateTime.format(now, { format: "yyyy-MM-dd" }))
console.log(DateTime.format(now, { format: "dd/MM/yyyy" }))
console.log(DateTime.format(now, { format: "MMM dd, yyyy" }))
console.log(DateTime.format(now, { format: "EEEE, MMMM dd, yyyy" }))
console.log(DateTime.format(now, { format: "HH:mm:ss" }))
console.log(DateTime.format(now, { format: "h:mm a" }))

// Locale-specific formatting
console.log(DateTime.format(now, { locale: "en-US" })) // 3/15/2024
console.log(DateTime.format(now, { locale: "en-GB" })) // 15/03/2024
console.log(DateTime.format(now, { locale: "de-DE" })) // 15.03.2024
console.log(DateTime.format(now, { locale: "ja-JP" })) // 2024/03/15
```

#### Real-World Parsing Scenarios

```typescript
import { Schema, Effect, DateTime, Option } from "effect"

// Parse various date formats from user input
const parseUserDate = (input: string): Effect.Effect<DateTime.DateTime, ParseError> =>
  Effect.gen(function* () {
    const formats = [
      "yyyy-MM-dd",
      "MM/dd/yyyy",
      "dd/MM/yyyy",
      "yyyy.MM.dd",
      "dd-MM-yyyy",
      "MMM dd, yyyy",
      "dd MMM yyyy",
      "MMMM dd, yyyy"
    ]
    
    for (const format of formats) {
      const result = DateTime.parseOption(input, { format })
      if (Option.isSome(result)) {
        return result.value
      }
    }
    
    // Try ISO parse as fallback
    const isoResult = DateTime.parseOption(input)
    if (Option.isSome(isoResult)) {
      return isoResult.value
    }
    
    return yield* Effect.fail(new ParseError(input, "No matching format found"))
  })

// Parse dates from CSV with timezone handling
const parseCSVDate = (
  dateStr: string,
  timeStr: string,
  timezone: string
): Effect.Effect<DateTime.DateTime> =>
  Effect.gen(function* () {
    const combined = `${dateStr} ${timeStr}`
    const parsed = yield* Effect.fromNullable(
      DateTime.parseOption(combined, { format: "yyyy-MM-dd HH:mm:ss" })
    )
    
    return pipe(
      Option.getOrThrow(parsed),
      DateTime.setZone(timezone)
    )
  })

// Schema for API date validation
const DateTimeSchema = Schema.transform(
  Schema.String,
  Schema.instanceOf(DateTime.DateTime),
  {
    decode: (s) =>
      pipe(
        DateTime.parseOption(s),
        Option.match({
          onNone: () => Effect.fail(new ParseError(s, "Invalid DateTime")),
          onSome: Effect.succeed
        })
      ),
    encode: (dt) => Effect.succeed(DateTime.toISO(dt))
  }
)

// Flexible date parser for forms
const FormDateParser = {
  parse: (input: string, hint?: "US" | "EU" | "ISO") => {
    const hints = {
      US: ["MM/dd/yyyy", "MM-dd-yyyy", "MMM dd, yyyy"],
      EU: ["dd/MM/yyyy", "dd.MM.yyyy", "dd-MM-yyyy"],
      ISO: ["yyyy-MM-dd", "yyyy/MM/dd", "yyyy.MM.dd"]
    }
    
    const formats = hint ? hints[hint] : [...hints.US, ...hints.EU, ...hints.ISO]
    
    for (const format of formats) {
      const result = DateTime.parseOption(input, { format })
      if (Option.isSome(result)) {
        return Effect.succeed({
          date: result.value,
          detectedFormat: format
        })
      }
    }
    
    return Effect.fail(new ParseError(input, "Unable to parse date"))
  }
}

class ParseError {
  readonly _tag = "ParseError"
  constructor(
    readonly input: string,
    readonly reason: string
  ) {}
}
```

#### Advanced Formatting Patterns

```typescript
import { DateTime, pipe } from "effect"

// Custom formatters for different contexts
const Formatters = {
  // Human-friendly relative time
  relative: (date: DateTime.DateTime): string => {
    const now = DateTime.now
    const diffMs = Number(DateTime.toMillis(now)) - Number(DateTime.toMillis(date))
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffSecs < 60) return "just now"
    if (diffMins === 1) return "1 minute ago"
    if (diffMins < 60) return `${diffMins} minutes ago`
    if (diffHours === 1) return "1 hour ago"
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays === 1) return "yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return `${Math.floor(diffDays / 365)} years ago`
  },
  
  // File system safe format
  fileSafe: (date: DateTime.DateTime): string =>
    DateTime.format(date, { format: "yyyy-MM-dd_HH-mm-ss" }),
  
  // Log format with milliseconds
  log: (date: DateTime.DateTime): string =>
    DateTime.format(date, { format: "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'" }),
  
  // Human-readable with timezone
  display: (date: DateTime.DateTime): string => {
    const zone = DateTime.zone(date)
    const offset = DateTime.offsetFromUtc(date)
    const offsetStr = offset >= 0 ? `+${offset / 60}` : `${offset / 60}`
    
    return `${DateTime.format(date, { format: "MMM dd, yyyy 'at' h:mm a" })} (UTC${offsetStr})`
  },
  
  // Compact format for tables
  compact: (date: DateTime.DateTime): string => {
    const now = DateTime.now
    const isToday = DateTime.equals(
      DateTime.startOfDay(date),
      DateTime.startOfDay(now)
    )
    
    if (isToday) {
      return DateTime.format(date, { format: "HH:mm" })
    }
    
    const isThisYear = DateTime.year(date) === DateTime.year(now)
    
    if (isThisYear) {
      return DateTime.format(date, { format: "MMM dd" })
    }
    
    return DateTime.format(date, { format: "MMM dd, yyyy" })
  }
}

// Usage examples
const exampleDate = pipe(
  DateTime.now,
  DateTime.addHours(-25),
  DateTime.addMinutes(-30)
)

console.log("Relative:", Formatters.relative(exampleDate))      // "yesterday"
console.log("File safe:", Formatters.fileSafe(exampleDate))     // "2024-03-14_09-30-00"
console.log("Log:", Formatters.log(exampleDate))                // "2024-03-14T09:30:00.000Z"
console.log("Display:", Formatters.display(exampleDate))        // "Mar 14, 2024 at 9:30 AM (UTC-5)"
console.log("Compact:", Formatters.compact(exampleDate))        // "Mar 14"
```

### Working with Time Zones

Advanced timezone operations and DST handling:

```typescript
import { DateTime, Effect, Array, pipe } from "effect"

// Timezone conversion utilities
const TimezoneUtils = {
  // Get all available timezones
  getAllTimezones: (): readonly string[] =>
    Intl.supportedValuesOf("timeZone"),
  
  // Get timezone offset for a date
  getOffset: (date: DateTime.DateTime, zone: string): number => {
    const zoned = DateTime.setZone(date, zone)
    return DateTime.offsetFromUtc(zoned)
  },
  
  // Check if DST is active
  isDST: (date: DateTime.DateTime, zone: string): boolean => {
    const zoned = DateTime.setZone(date, zone)
    return DateTime.isDST(zoned)
  },
  
  // Find DST transitions
  findDSTTransitions: (year: number, zone: string): readonly DSTTransition[] => {
    const transitions: DSTTransition[] = []
    let lastOffset = TimezoneUtils.getOffset(DateTime.make(year, 1, 1), zone)
    let lastDST = TimezoneUtils.isDST(DateTime.make(year, 1, 1), zone)
    
    // Check each day of the year
    for (let day = 2; day <= 365; day++) {
      const date = pipe(
        DateTime.make(year, 1, 1),
        DateTime.addDays(day - 1)
      )
      
      const offset = TimezoneUtils.getOffset(date, zone)
      const isDST = TimezoneUtils.isDST(date, zone)
      
      if (offset !== lastOffset || isDST !== lastDST) {
        transitions.push({
          date,
          type: isDST ? "spring-forward" : "fall-back",
          offsetChange: offset - lastOffset
        })
        
        lastOffset = offset
        lastDST = isDST
      }
    }
    
    return transitions
  },
  
  // Convert meeting time to multiple timezones
  convertToMultipleZones: (
    date: DateTime.DateTime,
    zones: readonly string[]
  ): readonly ZonedTime[] =>
    zones.map((zone) => ({
      zone,
      time: DateTime.setZone(date, zone),
      offset: TimezoneUtils.getOffset(date, zone),
      isDST: TimezoneUtils.isDST(date, zone)
    })),
  
  // Find equivalent local time across zones
  findEquivalentTimes: (
    localHour: number,
    localMinute: number,
    baseZone: string,
    targetZones: readonly string[]
  ): Effect.Effect<readonly EquivalentTime[]> =>
    Effect.gen(function* () {
      const baseDate = DateTime.makeZoned(
        DateTime.year(DateTime.now),
        DateTime.month(DateTime.now),
        DateTime.day(DateTime.now),
        localHour,
        localMinute,
        0,
        baseZone
      )
      
      return targetZones.map((zone) => {
        const converted = DateTime.setZone(baseDate, zone)
        return {
          zone,
          time: converted,
          isSameDay: DateTime.day(converted) === DateTime.day(baseDate),
          hoursDiff: DateTime.hours(converted) - localHour
        }
      })
    })
}

interface DSTTransition {
  readonly date: DateTime.DateTime
  readonly type: "spring-forward" | "fall-back"
  readonly offsetChange: number
}

interface ZonedTime {
  readonly zone: string
  readonly time: DateTime.DateTime
  readonly offset: number
  readonly isDST: boolean
}

interface EquivalentTime {
  readonly zone: string
  readonly time: DateTime.DateTime
  readonly isSameDay: boolean
  readonly hoursDiff: number
}

// DST-aware scheduling
class DSTAwareScheduler {
  constructor(private readonly timezone: string) {}
  
  // Schedule recurring task with DST handling
  scheduleDaily = (
    hour: number,
    minute: number,
    callback: () => Effect.Effect<void>
  ): Effect.Effect<void> =>
    Effect.gen(function* () {
      while (true) {
        const now = DateTime.now
        const nextRun = this.calculateNextRun(now, hour, minute)
        const delay = Number(DateTime.toMillis(nextRun)) - Number(DateTime.toMillis(now))
        
        if (delay > 0) {
          yield* Effect.sleep(Duration.millis(delay))
        }
        
        yield* callback()
        
        // Wait at least 1 minute before checking again to avoid duplicate runs
        yield* Effect.sleep(Duration.minutes(1))
      }
    })
  
  private calculateNextRun = (
    from: DateTime.DateTime,
    hour: number,
    minute: number
  ): DateTime.DateTime => {
    // Create target time in specified timezone
    let target = DateTime.makeZoned(
      DateTime.year(from),
      DateTime.month(from),
      DateTime.day(from),
      hour,
      minute,
      0,
      this.timezone
    )
    
    // If target is in the past, move to next day
    if (DateTime.lessThanOrEqualTo(target, from)) {
      target = DateTime.addDays(target, 1))
    }
    
    // Check for DST transitions
    const transitions = TimezoneUtils.findDSTTransitions(
      DateTime.year(target),
      this.timezone
    )
    
    for (const transition of transitions) {
      if (
        DateTime.equals(
          DateTime.startOfDay(transition.date),
          DateTime.startOfDay(target)
        )
      ) {
        // Adjust for DST transition
        if (transition.type === "spring-forward") {
          // Skip the non-existent hour
          const transitionHour = DateTime.hours(transition.date)
          if (hour === transitionHour) {
            target = DateTime.addHours(target, 1))
          }
        }
        // Fall-back is handled automatically
      }
    }
    
    return target
  }
}
```

### DateTime Boundaries and Ranges

Working with date boundaries and complex range operations:

```typescript
import { DateTime, Effect, Option, Array, pipe } from "effect"

// Date boundary utilities
const DateBoundaries = {
  // Start/end of period functions
  startOfWeek: (date: DateTime.DateTime, startDay = 1): DateTime.DateTime => {
    const dayOfWeek = DateTime.dayOfWeek(date)
    const daysToSubtract = (dayOfWeek - startDay + 7) % 7
    return pipe(
      date,
      DateTime.addDays(-daysToSubtract),
      DateTime.startOfDay
    )
  },
  
  endOfWeek: (date: DateTime.DateTime, startDay = 1): DateTime.DateTime =>
    pipe(
      DateBoundaries.startOfWeek(date, startDay),
      DateTime.addDays(6),
      DateTime.endOfDay
    ),
  
  startOfMonth: (date: DateTime.DateTime): DateTime.DateTime =>
    pipe(
      DateTime.make(DateTime.year(date), DateTime.month(date), 1),
      DateTime.startOfDay
    ),
  
  endOfMonth: (date: DateTime.DateTime): DateTime.DateTime => {
    const daysInMonth = DateTime.daysInMonth(
      DateTime.year(date),
      DateTime.month(date)
    )
    return pipe(
      DateTime.make(DateTime.year(date), DateTime.month(date), daysInMonth),
      DateTime.endOfDay
    )
  },
  
  startOfQuarter: (date: DateTime.DateTime): DateTime.DateTime => {
    const month = DateTime.month(date)
    const quarterStartMonth = Math.floor((month - 1) / 3) * 3 + 1
    return pipe(
      DateTime.make(DateTime.year(date), quarterStartMonth, 1),
      DateTime.startOfDay
    )
  },
  
  endOfQuarter: (date: DateTime.DateTime): DateTime.DateTime =>
    pipe(
      DateBoundaries.startOfQuarter(date),
      DateTime.addMonths(3),
      DateTime.addDays(-1),
      DateTime.endOfDay
    ),
  
  // Fiscal year handling (e.g., starts April 1)
  startOfFiscalYear: (date: DateTime.DateTime, fiscalYearStartMonth = 4): DateTime.DateTime => {
    const month = DateTime.month(date)
    const year = month >= fiscalYearStartMonth
      ? DateTime.year(date)
      : DateTime.year(date) - 1
    
    return pipe(
      DateTime.make(year, fiscalYearStartMonth, 1),
      DateTime.startOfDay
    )
  },
  
  // Get all dates in a range
  getDatesInRange: (
    start: DateTime.DateTime,
    end: DateTime.DateTime
  ): readonly DateTime.DateTime[] => {
    const dates: DateTime.DateTime[] = []
    let current = DateTime.startOfDay(start))
    const endDay = DateTime.startOfDay(end)
    
    while (DateTime.lessThanOrEqualTo(current, endDay)) {
      dates.push(current)
      current = DateTime.addDays(current, 1))
    }
    
    return dates
  },
  
  // Split range into intervals
  splitRange: (
    start: DateTime.DateTime,
    end: DateTime.DateTime,
    intervalType: "day" | "week" | "month" | "quarter" | "year"
  ): readonly DateRange[] => {
    const ranges: DateRange[] = []
    let current = start
    
    while (DateTime.lessThan(current, end)) {
      let intervalEnd: DateTime.DateTime
      
      switch (intervalType) {
        case "day":
          intervalEnd = DateTime.endOfDay(current))
          break
        case "week":
          intervalEnd = DateBoundaries.endOfWeek(current)
          break
        case "month":
          intervalEnd = DateBoundaries.endOfMonth(current)
          break
        case "quarter":
          intervalEnd = DateBoundaries.endOfQuarter(current)
          break
        case "year":
          intervalEnd = DateTime.endOfYear(current))
          break
      }
      
      // Don't exceed the end date
      if (DateTime.greaterThan(intervalEnd, end)) {
        intervalEnd = end
      }
      
      ranges.push({ start: current, end: intervalEnd })
      
      // Move to next interval
      current = DateTime.addMilliseconds(intervalEnd, 1))
    }
    
    return ranges
  }
}

interface DateRange {
  readonly start: DateTime.DateTime
  readonly end: DateTime.DateTime
}

// Advanced range operations
class DateRangeOperations {
  // Check if ranges overlap
  static overlaps = (range1: DateRange, range2: DateRange): boolean =>
    DateTime.lessThan(range1.start, range2.end) &&
    DateTime.lessThan(range2.start, range1.end)
  
  // Merge overlapping ranges
  static merge = (ranges: readonly DateRange[]): readonly DateRange[] => {
    if (ranges.length === 0) return []
    
    const sorted = [...ranges].sort((a, b) =>
      DateTime.lessThan(a.start, b.start) ? -1 : 1
    )
    
    const merged: DateRange[] = [sorted[0]]
    
    for (let i = 1; i < sorted.length; i++) {
      const current = sorted[i]
      const last = merged[merged.length - 1]
      
      if (DateRangeOperations.overlaps(last, current)) {
        // Extend the last range
        merged[merged.length - 1] = {
          start: last.start,
          end: DateTime.max(last.end, current.end)
        }
      } else {
        merged.push(current)
      }
    }
    
    return merged
  }
  
  // Find gaps between ranges
  static findGaps = (
    ranges: readonly DateRange[],
    boundary: DateRange
  ): readonly DateRange[] => {
    const sorted = [...ranges].sort((a, b) =>
      DateTime.lessThan(a.start, b.start) ? -1 : 1
    )
    
    const gaps: DateRange[] = []
    let currentStart = boundary.start
    
    for (const range of sorted) {
      if (DateTime.lessThan(currentStart, range.start)) {
        gaps.push({
          start: currentStart,
          end: DateTime.addMilliseconds(range.start, -1)
        })
      }
      
      currentStart = DateTime.addMilliseconds(range.end, 1))
    }
    
    if (DateTime.lessThan(currentStart, boundary.end)) {
      gaps.push({
        start: currentStart,
        end: boundary.end
      })
    }
    
    return gaps
  }
  
  // Calculate range duration
  static duration = (range: DateRange): Duration.Duration =>
    Duration.millis(
      Number(DateTime.toMillis(range.end)) -
      Number(DateTime.toMillis(range.start))
    )
}

// Usage example: Availability calendar
const availabilityExample = Effect.gen(function* () {
  // Define business hours
  const businessHours: DateRange[] = []
  const startDate = DateTime.make(2024, 3, 18)
  
  for (let i = 0; i < 5; i++) {
    const date = DateTime.addDays(startDate, i)
    if (DateTime.dayOfWeek(date) >= 1 && DateTime.dayOfWeek(date) <= 5) {
      businessHours.push({
        start: DateTime.setTime(date, 9, 0, 0),
        end: DateTime.setTime(date, 17, 0, 0)
      })
    }
  }
  
  // Define meetings
  const meetings: DateRange[] = [
    {
      start: DateTime.make(2024, 3, 18, 10, 0),
      end: DateTime.make(2024, 3, 18, 11, 0)
    },
    {
      start: DateTime.make(2024, 3, 18, 14, 0),
      end: DateTime.make(2024, 3, 18, 15, 30)
    },
    {
      start: DateTime.make(2024, 3, 19, 9, 30),
      end: DateTime.make(2024, 3, 19, 10, 30)
    }
  ]
  
  // Find available slots
  for (const day of businessHours) {
    const dayMeetings = meetings.filter((m) =>
      DateRangeOperations.overlaps(m, day)
    )
    
    const availableSlots = DateRangeOperations.findGaps(dayMeetings, day)
    
    console.log(`Available on ${DateTime.format(day.start, { format: "EEEE, MMM dd" })}:`)
    for (const slot of availableSlots) {
      const duration = DateRangeOperations.duration(slot)
      if (pipe(Duration.greaterThanOrEqualTo(duration, Duration.minutes(30)))) {
        console.log(
          `  ${DateTime.format(slot.start, { format: "HH:mm" })} - ` +
          `${DateTime.format(slot.end, { format: "HH:mm" })} ` +
          `(${Duration.format(duration)})`
        )
      }
    }
  }
})
```

## Practical Patterns & Best Practices

### Pattern 1: DateTime Service Layer

```typescript
import { Effect, Context, Layer, DateTime, Option, pipe } from "effect"

// DateTime service for testable time operations
interface DateTimeService {
  readonly now: Effect.Effect<DateTime.DateTime>
  readonly nowUtc: Effect.Effect<DateTime.DateTime>
  readonly today: Effect.Effect<DateTime.DateTime>
  readonly parse: (
    input: string,
    format?: string
  ) => Effect.Effect<DateTime.DateTime, ParseError>
  readonly format: (
    date: DateTime.DateTime,
    format?: string
  ) => Effect.Effect<string>
}

const DateTimeService = Context.GenericTag<DateTimeService>("DateTimeService")

// Live implementation
const DateTimeServiceLive = Layer.succeed(
  DateTimeService,
  {
    now: Effect.sync(() => DateTime.now),
    nowUtc: Effect.sync(() => DateTime.nowUtc),
    today: Effect.sync(() => DateTime.startOfDay(DateTime.now)),
    parse: (input, format) =>
      pipe(
        format
          ? DateTime.parseOption(input, { format })
          : DateTime.parseOption(input),
        Option.match({
          onNone: () => Effect.fail(new ParseError(input, "Invalid format")),
          onSome: Effect.succeed
        })
      ),
    format: (date, format) =>
      Effect.sync(() =>
        format
          ? DateTime.format(date, { format })
          : DateTime.toISO(date)
      )
  }
)

// Test implementation with fixed time
const makeTestDateTimeService = (
  fixedTime: DateTime.DateTime
): Layer.Layer<DateTimeService> =>
  Layer.succeed(
    DateTimeService,
    {
      now: Effect.succeed(fixedTime),
      nowUtc: Effect.succeed(DateTime.setZone(fixedTime, "UTC")),
      today: Effect.succeed(DateTime.startOfDay(fixedTime)),
      parse: (input, format) =>
        pipe(
          format
            ? DateTime.parseOption(input, { format })
            : DateTime.parseOption(input),
          Option.match({
            onNone: () => Effect.fail(new ParseError(input, "Invalid format")),
            onSome: Effect.succeed
          })
        ),
      format: (date, format) =>
        Effect.sync(() =>
          format
            ? DateTime.format(date, { format })
            : DateTime.toISO(date)
        )
    }
  )

// Usage in application
const calculateAge = (birthDate: DateTime.DateTime) =>
  Effect.gen(function* () {
    const service = yield* DateTimeService
    const now = yield* service.now
    
    let age = DateTime.year(now) - DateTime.year(birthDate)
    
    // Adjust if birthday hasn't occurred this year
    const birthMonth = DateTime.month(birthDate)
    const birthDay = DateTime.day(birthDate)
    const currentMonth = DateTime.month(now)
    const currentDay = DateTime.day(now)
    
    if (
      currentMonth < birthMonth ||
      (currentMonth === birthMonth && currentDay < birthDay)
    ) {
      age--
    }
    
    return age
  })

// Business logic using the service
const processExpiration = (expiryDate: DateTime.DateTime) =>
  Effect.gen(function* () {
    const service = yield* DateTimeService
    const now = yield* service.now
    
    if (DateTime.lessThan(expiryDate, now)) {
      return { status: "expired", expiredFor: DateTime.distance(expiryDate, now) }
    }
    
    const daysUntilExpiry = Math.floor(
      DateTime.distanceInDays(expiryDate, now)
    )
    
    if (daysUntilExpiry <= 30) {
      return { status: "expiring-soon", daysRemaining: daysUntilExpiry }
    }
    
    return { status: "valid", daysRemaining: daysUntilExpiry }
  })

class ParseError {
  readonly _tag = "ParseError"
  constructor(
    readonly input: string,
    readonly reason: string
  ) {}
}
```

### Pattern 2: Business Calendar Abstraction

```typescript
import { Effect, HashMap, Option, Array, pipe } from "effect"

// Flexible business calendar for different regions/rules
interface BusinessCalendar {
  readonly isBusinessDay: (date: DateTime.DateTime) => boolean
  readonly isHoliday: (date: DateTime.DateTime) => boolean
  readonly nextBusinessDay: (date: DateTime.DateTime) => DateTime.DateTime
  readonly previousBusinessDay: (date: DateTime.DateTime) => DateTime.DateTime
  readonly addBusinessDays: (date: DateTime.DateTime, days: number) => DateTime.DateTime
  readonly businessDaysBetween: (start: DateTime.DateTime, end: DateTime.DateTime) => number
}

// Holiday rule types
type HolidayRule =
  | { type: "fixed"; month: number; day: number }
  | { type: "nth-weekday"; month: number; weekday: number; nth: number }
  | { type: "last-weekday"; month: number; weekday: number }
  | { type: "easter-based"; daysFromEaster: number }

class ConfigurableBusinessCalendar implements BusinessCalendar {
  private holidayCache = new Map<string, boolean>()
  
  constructor(
    private readonly weekendDays: readonly number[],
    private readonly holidayRules: readonly HolidayRule[],
    private readonly customHolidays: readonly string[] = []
  ) {}
  
  isBusinessDay = (date: DateTime.DateTime): boolean => {
    const dayOfWeek = DateTime.dayOfWeek(date)
    
    // Check weekend
    if (this.weekendDays.includes(dayOfWeek)) {
      return false
    }
    
    // Check holiday
    if (this.isHoliday(date)) {
      return false
    }
    
    return true
  }
  
  isHoliday = (date: DateTime.DateTime): boolean => {
    const dateStr = DateTime.format(date, { format: "yyyy-MM-dd" })
    
    // Check cache
    if (this.holidayCache.has(dateStr)) {
      return this.holidayCache.get(dateStr)!
    }
    
    // Check custom holidays
    if (this.customHolidays.includes(dateStr)) {
      this.holidayCache.set(dateStr, true)
      return true
    }
    
    // Check holiday rules
    const year = DateTime.year(date)
    const isHoliday = this.holidayRules.some((rule) =>
      this.matchesHolidayRule(date, rule, year)
    )
    
    this.holidayCache.set(dateStr, isHoliday)
    return isHoliday
  }
  
  private matchesHolidayRule = (
    date: DateTime.DateTime,
    rule: HolidayRule,
    year: number
  ): boolean => {
    switch (rule.type) {
      case "fixed":
        return (
          DateTime.month(date) === rule.month &&
          DateTime.day(date) === rule.day
        )
      
      case "nth-weekday": {
        if (DateTime.month(date) !== rule.month) return false
        
        const dayOfWeek = DateTime.dayOfWeek(date)
        if (dayOfWeek !== rule.weekday) return false
        
        const dayOfMonth = DateTime.day(date)
        const weekNumber = Math.ceil(dayOfMonth / 7)
        
        return weekNumber === rule.nth
      }
      
      case "last-weekday": {
        if (DateTime.month(date) !== rule.month) return false
        
        const dayOfWeek = DateTime.dayOfWeek(date)
        if (dayOfWeek !== rule.weekday) return false
        
        // Check if it's the last occurrence
        const nextWeek = DateTime.addWeeks(date, 1)
        return DateTime.month(nextWeek) !== rule.month
      }
      
      case "easter-based": {
        const easter = this.calculateEaster(year)
        const targetDate = DateTime.addDays(easter, rule.daysFromEaster)
        return DateTime.equals(
          DateTime.startOfDay(date),
          DateTime.startOfDay(targetDate)
        )
      }
    }
  }
  
  private calculateEaster = (year: number): DateTime.DateTime => {
    // Computus algorithm for Easter
    const a = year % 19
    const b = Math.floor(year / 100)
    const c = year % 100
    const d = Math.floor(b / 4)
    const e = b % 4
    const f = Math.floor((b + 8) / 25)
    const g = Math.floor((b - f + 1) / 3)
    const h = (19 * a + b - d - g + 15) % 30
    const i = Math.floor(c / 4)
    const k = c % 4
    const l = (32 + 2 * e + 2 * i - h - k) % 7
    const m = Math.floor((a + 11 * h + 22 * l) / 451)
    const month = Math.floor((h + l - 7 * m + 114) / 31)
    const day = ((h + l - 7 * m + 114) % 31) + 1
    
    return DateTime.make(year, month, day)
  }
  
  nextBusinessDay = (date: DateTime.DateTime): DateTime.DateTime => {
    let next = DateTime.addDays(date, 1))
    
    while (!this.isBusinessDay(next)) {
      next = DateTime.addDays(next, 1))
    }
    
    return next
  }
  
  previousBusinessDay = (date: DateTime.DateTime): DateTime.DateTime => {
    let prev = DateTime.addDays(date, -1))
    
    while (!this.isBusinessDay(prev)) {
      prev = DateTime.addDays(prev, -1))
    }
    
    return prev
  }
  
  addBusinessDays = (date: DateTime.DateTime, days: number): DateTime.DateTime => {
    let current = date
    let remaining = Math.abs(days)
    const direction = days > 0 ? 1 : -1
    
    while (remaining > 0) {
      current = DateTime.addDays(current, direction)
      
      if (this.isBusinessDay(current)) {
        remaining--
      }
    }
    
    return current
  }
  
  businessDaysBetween = (start: DateTime.DateTime, end: DateTime.DateTime): number => {
    let count = 0
    let current = DateTime.startOfDay(start))
    const endDay = DateTime.startOfDay(end)
    
    while (DateTime.lessThanOrEqualTo(current, endDay)) {
      if (this.isBusinessDay(current)) {
        count++
      }
      current = DateTime.addDays(current, 1))
    }
    
    return count
  }
}

// Pre-configured calendars
const BusinessCalendars = {
  // US calendar with federal holidays
  US: new ConfigurableBusinessCalendar(
    [0, 6], // Saturday, Sunday
    [
      { type: "fixed", month: 1, day: 1 },           // New Year's Day
      { type: "nth-weekday", month: 1, weekday: 1, nth: 3 }, // MLK Day
      { type: "nth-weekday", month: 2, weekday: 1, nth: 3 }, // Presidents Day
      { type: "last-weekday", month: 5, weekday: 1 },        // Memorial Day
      { type: "fixed", month: 7, day: 4 },           // Independence Day
      { type: "nth-weekday", month: 9, weekday: 1, nth: 1 }, // Labor Day
      { type: "nth-weekday", month: 11, weekday: 4, nth: 4 }, // Thanksgiving
      { type: "fixed", month: 12, day: 25 },         // Christmas
    ]
  ),
  
  // UK calendar with bank holidays
  UK: new ConfigurableBusinessCalendar(
    [0, 6],
    [
      { type: "fixed", month: 1, day: 1 },
      { type: "easter-based", daysFromEaster: -2 },  // Good Friday
      { type: "easter-based", daysFromEaster: 1 },   // Easter Monday
      { type: "nth-weekday", month: 5, weekday: 1, nth: 1 }, // Early May
      { type: "last-weekday", month: 5, weekday: 1 }, // Spring bank holiday
      { type: "last-weekday", month: 8, weekday: 1 }, // Summer bank holiday
      { type: "fixed", month: 12, day: 25 },
      { type: "fixed", month: 12, day: 26 },         // Boxing Day
    ]
  )
}

// Usage
const calculateDeliveryDate = (
  orderDate: DateTime.DateTime,
  processingDays: number,
  calendar: BusinessCalendar
): DateTime.DateTime =>
  calendar.addBusinessDays(orderDate, processingDays)

const calculateSLA = (
  startDate: DateTime.DateTime,
  endDate: DateTime.DateTime,
  calendar: BusinessCalendar
): number =>
  calendar.businessDaysBetween(startDate, endDate)
```

### Pattern 3: DateTime Validation and Constraints

```typescript
import { Schema, Effect, DateTime, pipe } from "effect"

// DateTime validation schemas
const DateTimeValidations = {
  // Future date only
  futureDate: Schema.filter(
    Schema.instanceOf(DateTime.DateTime),
    (date) => DateTime.greaterThan(date, DateTime.now),
    { message: "Date must be in the future" }
  ),
  
  // Past date only
  pastDate: Schema.filter(
    Schema.instanceOf(DateTime.DateTime),
    (date) => DateTime.lessThan(date, DateTime.now),
    { message: "Date must be in the past" }
  ),
  
  // Within range
  dateInRange: (min: DateTime.DateTime, max: DateTime.DateTime) =>
    Schema.filter(
      Schema.instanceOf(DateTime.DateTime),
      (date) => DateTime.between(date, min, max),
      { message: `Date must be between ${DateTime.toISO(min)} and ${DateTime.toISO(max)}` }
    ),
  
  // Business hours only
  businessHours: Schema.filter(
    Schema.instanceOf(DateTime.DateTime),
    (date) => {
      const hour = DateTime.hours(date)
      const dayOfWeek = DateTime.dayOfWeek(date)
      return dayOfWeek >= 1 && dayOfWeek <= 5 && hour >= 9 && hour < 17
    },
    { message: "Date must be during business hours (Mon-Fri 9AM-5PM)" }
  ),
  
  // Age validation
  minimumAge: (years: number) =>
    Schema.filter(
      Schema.instanceOf(DateTime.DateTime),
      (birthDate) => {
        const age = pipe(
          DateTime.now,
          DateTime.year
        ) - DateTime.year(birthDate)
        return age >= years
      },
      { message: `Must be at least ${years} years old` }
    )
}

// Complex date constraints
const AppointmentSchema = Schema.Struct({
  patientId: Schema.String,
  doctorId: Schema.String,
  scheduledAt: pipe(
    Schema.instanceOf(DateTime.DateTime),
    Schema.filter(
      (date) => {
        // Must be in the future
        if (DateTime.lessThanOrEqualTo(date, DateTime.now)) {
          return false
        }
        
        // Must be on a weekday
        const dayOfWeek = DateTime.dayOfWeek(date)
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          return false
        }
        
        // Must be during office hours
        const hour = DateTime.hours(date)
        const minute = DateTime.minutes(date)
        const timeInMinutes = hour * 60 + minute
        
        // 8:00 AM - 5:00 PM
        return timeInMinutes >= 480 && timeInMinutes <= 1020
      },
      { message: "Appointment must be scheduled during office hours on weekdays" }
    )
  ),
  duration: Schema.Number.pipe(
    Schema.filter(
      (minutes) => minutes === 15 || minutes === 30 || minutes === 60,
      { message: "Appointment duration must be 15, 30, or 60 minutes" }
    )
  )
})

// Date range validation with business logic
const VacationRequestSchema = Schema.Struct({
  employeeId: Schema.String,
  startDate: Schema.instanceOf(DateTime.DateTime),
  endDate: Schema.instanceOf(DateTime.DateTime)
}).pipe(
  Schema.filter(
    ({ startDate, endDate }) => {
      // End must be after start
      if (DateTime.lessThanOrEqualTo(endDate, startDate)) {
        return false
      }
      
      // Maximum 14 consecutive days
      const days = DateTime.distanceInDays(endDate, startDate)
      if (days > 14) {
        return false
      }
      
      // Must be at least 2 weeks in advance
      const daysUntilStart = DateTime.distanceInDays(startDate, DateTime.now)
      if (daysUntilStart < 14) {
        return false
      }
      
      return true
    },
    { 
      message: "Vacation must be 1-14 days, requested at least 2 weeks in advance" 
    }
  )
)

// Recurring event validation
const RecurringEventSchema = Schema.Struct({
  title: Schema.String,
  startDate: Schema.instanceOf(DateTime.DateTime),
  recurrence: Schema.Union(
    Schema.Struct({
      type: Schema.Literal("daily"),
      interval: Schema.Number.pipe(Schema.between(1, 365))
    }),
    Schema.Struct({
      type: Schema.Literal("weekly"),
      interval: Schema.Number.pipe(Schema.between(1, 52)),
      daysOfWeek: Schema.Array(Schema.Number.pipe(Schema.between(0, 6)))
    }),
    Schema.Struct({
      type: Schema.Literal("monthly"),
      interval: Schema.Number.pipe(Schema.between(1, 12)),
      dayOfMonth: Schema.optional(Schema.Number.pipe(Schema.between(1, 31))),
      weekOfMonth: Schema.optional(Schema.Number.pipe(Schema.between(1, 5))),
      dayOfWeek: Schema.optional(Schema.Number.pipe(Schema.between(0, 6)))
    })
  ),
  endDate: Schema.optional(Schema.instanceOf(DateTime.DateTime))
}).pipe(
  Schema.filter(
    (event) => {
      // If endDate is provided, it must be after startDate
      if (event.endDate) {
        return DateTime.greaterThan(event.endDate, event.startDate)
      }
      return true
    },
    { message: "End date must be after start date" }
  )
)
```

## Integration Examples

### Integration with Effect Scheduling

```typescript
import { Effect, Schedule, DateTime, Duration, Fiber, pipe } from "effect"

// DateTime-aware scheduling patterns
const DateTimeScheduling = {
  // Run at specific time daily
  dailyAt: (hour: number, minute: number, timezone = "UTC") =>
    Schedule.fixed(Duration.minutes(1)).pipe(
      Schedule.whileOutput(() => {
        const now = DateTime.setZone(DateTime.now, timezone)
        const targetToday = DateTime.makeZoned(
          DateTime.year(now),
          DateTime.month(now),
          DateTime.day(now),
          hour,
          minute,
          0,
          timezone
        )
        
        // Check if we're within 1 minute of target time
        const diff = Math.abs(
          Number(DateTime.toMillis(now)) - Number(DateTime.toMillis(targetToday))
        )
        
        return diff < 60000 // Within 1 minute
      })
    ),
  
  // Run on specific days of week
  onDaysOfWeek: (days: readonly number[]) =>
    Schedule.fixed(Duration.hours(1)).pipe(
      Schedule.whileOutput(() => {
        const dayOfWeek = DateTime.dayOfWeek(DateTime.now)
        return days.includes(dayOfWeek)
      })
    ),
  
  // Run on specific day of month
  monthlyOn: (dayOfMonth: number) =>
    Schedule.fixed(Duration.hours(1)).pipe(
      Schedule.whileOutput(() => {
        const today = DateTime.day(DateTime.now)
        return today === dayOfMonth
      })
    ),
  
  // Cron-like scheduling
  cron: (pattern: CronPattern) =>
    Schedule.fixed(Duration.minutes(1)).pipe(
      Schedule.whileOutput(() => {
        const now = DateTime.now
        return matchesCronPattern(now, pattern)
      })
    )
}

interface CronPattern {
  readonly minute?: number | "*"
  readonly hour?: number | "*"
  readonly dayOfMonth?: number | "*"
  readonly month?: number | "*"
  readonly dayOfWeek?: number | "*"
}

const matchesCronPattern = (
  date: DateTime.DateTime,
  pattern: CronPattern
): boolean => {
  if (pattern.minute !== "*" && DateTime.minutes(date) !== pattern.minute) {
    return false
  }
  if (pattern.hour !== "*" && DateTime.hours(date) !== pattern.hour) {
    return false
  }
  if (pattern.dayOfMonth !== "*" && DateTime.day(date) !== pattern.dayOfMonth) {
    return false
  }
  if (pattern.month !== "*" && DateTime.month(date) !== pattern.month) {
    return false
  }
  if (pattern.dayOfWeek !== "*" && DateTime.dayOfWeek(date) !== pattern.dayOfWeek) {
    return false
  }
  return true
}

// Scheduled task manager
class ScheduledTaskManager {
  private tasks = new Map<string, Fiber.RuntimeFiber<any, any>>()
  
  scheduleDaily = (
    taskId: string,
    time: { hour: number; minute: number; timezone?: string },
    task: Effect.Effect<void>
  ): Effect.Effect<void> =>
    Effect.gen(function* () {
      // Cancel existing task if any
      yield* this.cancel(taskId)
      
      const scheduled = pipe(
        task,
        Effect.repeat(
          DateTimeScheduling.dailyAt(time.hour, time.minute, time.timezone)
        ),
        Effect.fork
      )
      
      const fiber = yield* scheduled
      this.tasks.set(taskId, fiber)
    })
  
  scheduleWeekly = (
    taskId: string,
    days: readonly number[],
    time: { hour: number; minute: number },
    task: Effect.Effect<void>
  ): Effect.Effect<void> =>
    Effect.gen(function* () {
      yield* this.cancel(taskId)
      
      const scheduled = pipe(
        task,
        Effect.repeat(
          Schedule.intersect(
            DateTimeScheduling.dailyAt(time.hour, time.minute),
            DateTimeScheduling.onDaysOfWeek(days)
          )
        ),
        Effect.fork
      )
      
      const fiber = yield* scheduled
      this.tasks.set(taskId, fiber)
    })
  
  cancel = (taskId: string): Effect.Effect<void> =>
    Effect.gen(function* () {
      const fiber = this.tasks.get(taskId)
      if (fiber) {
        yield* Fiber.interrupt(fiber)
        this.tasks.delete(taskId)
      }
    })
  
  cancelAll = (): Effect.Effect<void> =>
    Effect.gen(function* () {
      yield* Effect.all(
        Array.from(this.tasks.values()).map(Fiber.interrupt),
        { discard: true }
      )
      this.tasks.clear()
    })
}

// Usage example
const schedulingExample = Effect.gen(function* () {
  const manager = new ScheduledTaskManager()
  
  // Daily backup at 2 AM
  yield* manager.scheduleDaily(
    "daily-backup",
    { hour: 2, minute: 0, timezone: "America/New_York" },
    Effect.gen(function* () {
      console.log("Running daily backup...")
      // Backup logic here
    })
  )
  
  // Weekly report on Mondays at 9 AM
  yield* manager.scheduleWeekly(
    "weekly-report",
    [1], // Monday
    { hour: 9, minute: 0 },
    Effect.gen(function* () {
      const lastWeek = DateTime.addWeeks(DateTime.now, -1)
      console.log(`Generating report for week of ${DateTime.format(lastWeek)}`)
      // Report generation logic
    })
  )
  
  // Monthly billing on the 1st
  yield* Effect.fork(
    pipe(
      Effect.gen(function* () {
        console.log("Processing monthly billing...")
        // Billing logic
      }),
      Effect.repeat(
        DateTimeScheduling.monthlyOn(1)
      )
    )
  )
})
```

### Testing Strategies

```typescript
import { Effect, DateTime, TestClock, TestContext, Layer, pipe } from "effect"
import { describe, test, expect } from "@beep/testkit"

// Test utilities for DateTime
const DateTimeTestUtils = {
  // Advance to specific date/time
  advanceTo: (target: DateTime.DateTime) =>
    Effect.gen(function* () {
      const now = yield* Effect.sync(() => DateTime.now)
      const diff = Duration.millis(
        Number(DateTime.toMillis(target)) - Number(DateTime.toMillis(now))
      )
      yield* TestClock.adjust(diff)
    }),
  
  // Advance by specific duration
  advanceBy: (duration: Duration.Duration) =>
    TestClock.adjust(duration),
  
  // Set specific time and restore after
  withFixedTime: <A, E, R>(
    dateTime: DateTime.DateTime,
    effect: Effect.Effect<A, E, R>
  ) =>
    Effect.gen(function* () {
      const service = yield* DateTimeService
      const original = {
        now: service.now,
        nowUtc: service.nowUtc,
        today: service.today
      }
      
      // Override with fixed time
      const fixed = DateTime.setZone(dateTime, "UTC")
      Object.assign(service, {
        now: Effect.succeed(dateTime),
        nowUtc: Effect.succeed(fixed),
        today: Effect.succeed(DateTime.startOfDay(dateTime))
      })
      
      try {
        return yield* effect
      } finally {
        // Restore original
        Object.assign(service, original)
      }
    })
}

// Testing date-dependent logic
describe("DateTime Operations", () => {
  test("age calculation handles birthdays correctly", () =>
    Effect.gen(function* () {
      const birthDate = DateTime.make(1990, 3, 15)
      
      // Test before birthday
      yield* DateTimeTestUtils.withFixedTime(
        DateTime.make(2024, 3, 14),
        Effect.gen(function* () {
          const age = yield* calculateAge(birthDate)
          expect(age).toBe(33)
        })
      )
      
      // Test on birthday
      yield* DateTimeTestUtils.withFixedTime(
        DateTime.make(2024, 3, 15),
        Effect.gen(function* () {
          const age = yield* calculateAge(birthDate)
          expect(age).toBe(34)
        })
      )
      
      // Test after birthday
      yield* DateTimeTestUtils.withFixedTime(
        DateTime.make(2024, 3, 16),
        Effect.gen(function* () {
          const age = yield* calculateAge(birthDate)
          expect(age).toBe(34)
        })
      )
    }).pipe(
      Effect.provide(DateTimeServiceLive),
      Effect.provide(TestContext.TestContext)
    )
  )
  
  test("expiration handling across time", () =>
    Effect.gen(function* () {
      const expiryDate = DateTime.make(2024, 3, 15, 12, 0, 0)
      
      // Start before expiration
      yield* DateTimeTestUtils.advanceTo(
        DateTime.make(2024, 3, 10, 12, 0, 0)
      )
      
      let status = yield* processExpiration(expiryDate)
      expect(status.status).toBe("valid")
      expect(status.daysRemaining).toBe(5)
      
      // Advance to 30 days before
      yield* DateTimeTestUtils.advanceBy(Duration.days(35))
      
      status = yield* processExpiration(expiryDate)
      expect(status.status).toBe("expiring-soon")
      expect(status.daysRemaining).toBe(30)
      
      // Advance past expiration
      yield* DateTimeTestUtils.advanceBy(Duration.days(31))
      
      status = yield* processExpiration(expiryDate)
      expect(status.status).toBe("expired")
    }).pipe(
      Effect.provide(DateTimeServiceLive),
      Effect.provide(TestContext.TestContext)
    )
  )
  
  test("timezone conversions during DST transitions", () =>
    Effect.gen(function* () {
      // Test spring forward (2024-03-10 2:00 AM EST -> 3:00 AM EDT)
      const beforeDST = DateTime.makeZoned(2024, 3, 10, 1, 30, 0, "America/New_York")
      const duringDST = DateTime.makeZoned(2024, 3, 10, 3, 30, 0, "America/New_York")
      
      // Convert to UTC
      const beforeUTC = DateTime.setZone(beforeDST, "UTC")
      const duringUTC = DateTime.setZone(duringDST, "UTC")
      
      // Should be 2 hours apart despite appearing 2.5 hours apart
      const actualDiff = pipe(
        duringUTC,
        DateTime.distanceInHours(beforeUTC)
      )
      expect(Math.round(actualDiff)).toBe(2)
      
      // Test offset change
      expect(DateTime.offsetFromUtc(beforeDST)).toBe(-300) // EST is UTC-5
      expect(DateTime.offsetFromUtc(duringDST)).toBe(-240) // EDT is UTC-4
    })
  )
})

// Property-based testing
import * as fc from "fast-check"

test("DateTime arithmetic properties", () => {
  fc.assert(
    fc.property(
      fc.date({ min: new Date(2000, 0, 1), max: new Date(2050, 0, 1) }),
      fc.integer({ min: -365, max: 365 }),
      (jsDate, days) => {
        const date = DateTime.fromDate(jsDate)
        
        // Adding then subtracting should return to original
        const roundTrip = pipe(
          date,
          DateTime.addDays(days),
          DateTime.addDays(-days)
        )
        
        expect(
          DateTime.equals(
            DateTime.startOfDay(date),
            DateTime.startOfDay(roundTrip)
          )
        ).toBe(true)
        
        // Commutativity of different units
        const path1 = pipe(
          date,
          DateTime.addDays(1),
          DateTime.addHours(1)
        )
        
        const path2 = pipe(
          date,
          DateTime.addHours(1),
          DateTime.addDays(1)
        )
        
        expect(DateTime.equals(path1, path2)).toBe(true)
      }
    )
  )
})

// Snapshot testing for formatting
test("DateTime formatting snapshots", () => {
  const testDate = DateTime.makeZoned(2024, 3, 15, 14, 30, 45, "America/New_York")
  
  const formats = {
    iso: DateTime.toISO(testDate),
    short: DateTime.format(testDate, { format: "MM/dd/yyyy" }),
    long: DateTime.format(testDate, { format: "EEEE, MMMM dd, yyyy 'at' h:mm a zzz" }),
    custom: DateTime.format(testDate, { format: "yyyy-MM-dd'T'HH:mm:ssXXX" })
  }
  
  expect(formats).toMatchInlineSnapshot(`
    {
      "iso": "2024-03-15T14:30:45.000-04:00",
      "short": "03/15/2024",
      "long": "Friday, March 15, 2024 at 2:30 PM EDT",
      "custom": "2024-03-15T14:30:45-04:00"
    }
  `)
})
```

## Conclusion

DateTime provides comprehensive date and time handling with timezone awareness, immutable operations, and seamless integration with Effect's ecosystem for building reliable time-based applications.

Key benefits:
- **Type Safety**: Immutable DateTime instances with compile-time guarantees preventing common date manipulation errors
- **Timezone Awareness**: First-class timezone support with DST handling and conversion utilities
- **Rich Operations**: Extensive API for arithmetic, comparisons, formatting, and calendar calculations

DateTime excels in applications requiring precise time handling, multi-timezone support, and complex date calculations, making it essential for scheduling systems, financial applications, and global services.