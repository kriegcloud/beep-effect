# Number: A Real-World Guide

## Table of Contents
1. [Introduction & Core Concepts](#introduction--core-concepts)
2. [Basic Usage Patterns](#basic-usage-patterns)
3. [Real-World Examples](#real-world-examples)
4. [Advanced Features Deep Dive](#advanced-features-deep-dive)
5. [Practical Patterns & Best Practices](#practical-patterns--best-practices)
6. [Integration Examples](#integration-examples)

## Introduction & Core Concepts

### The Problem Number Solves

JavaScript's native number operations can be error-prone and lack type safety, especially when dealing with edge cases like division by zero, floating-point precision, and validation.

```typescript
// Traditional approach - problematic patterns
function calculatePercentage(value: any, total: any): number {
  // No type safety - accepts any input
  if (typeof value !== 'number' || typeof total !== 'number') {
    throw new Error('Invalid input')
  }
  
  // Division by zero crashes the application
  const result = (value / total) * 100
  
  // No handling of edge cases like NaN, Infinity
  return result
}

// Floating-point precision issues
const price = 19.99
const tax = 0.08
const total = price + (price * tax) // 21.5892 instead of expected 21.59

// Range validation boilerplate
function validateScore(score: number): boolean {
  return score >= 0 && score <= 100
}
```

This approach leads to:
- **Runtime Errors** - Division by zero and type coercion issues
- **Precision Problems** - Floating-point arithmetic inconsistencies  
- **Boilerplate Code** - Repetitive validation and range checking
- **Type Unsafe** - No compile-time guarantees about numeric operations

### The Number Solution

Effect Number provides a complete toolkit for safe, functional numeric operations with built-in error handling and type safety.

```typescript
import { Number, Option, Effect } from "effect"

// Type-safe operations with automatic error handling
const calculatePercentage = (value: number, total: number): Option.Option<number> =>
  Option.map(
    Number.divide(value, total),
    ratio => Number.multiply(ratio, 100)
  )

// Composable range validation
const validateScore = Number.between({ minimum: 0, maximum: 100 })

// Safe arithmetic with built-in precision handling
const calculateTotalWithTax = (price: number, taxRate: number): Effect.Effect<number> =>
  Effect.succeed(price).pipe(
    Effect.map(p => Number.multiply(p, Number.sum(1, taxRate))),
    Effect.map(Number.round)
  )
```

### Key Concepts

**Type Guards**: `Number.isNumber(value)` provides runtime type checking with TypeScript type narrowing

**Safe Division**: `Number.divide(a, b)` returns `Option<number>` to handle division by zero gracefully

**Range Operations**: `Number.between({ minimum: 0, maximum: 100 })` and `Number.clamp({ minimum: 0, maximum: 100 })` for boundary checking

**Functional Composition**: All operations are pipeable and composable for building complex calculations

## Basic Usage Patterns

### Pattern 1: Type Validation and Guards

```typescript
import { Number } from "effect"

// Basic type checking with automatic type narrowing
function processNumericInput(input: unknown): string {
  if (Number.isNumber(input)) {
    // TypeScript now knows 'input' is a number
    return `Processing: ${input.toFixed(2)}`
  }
  return "Invalid input: not a number"
}

// Filtering numeric values from mixed arrays
const mixedData = [1, "hello", 3.14, true, 42, null]
const numericValues = mixedData.filter(Number.isNumber)
// Result: [1, 3.14, 42]
```

### Pattern 2: Safe Mathematical Operations

```typescript
import { Number, Option, Effect } from "effect"

// Basic arithmetic with error handling
const safeCalculation = (a: number, b: number) =>
  Number.divide(a, b).pipe(
    Option.map(result => Number.multiply(result, 2)),
    Option.getOrElse(() => 0)
  )

// Chaining operations safely
const complexCalculation = (x: number, y: number, z: number) =>
  Effect.gen(function* () {
    const divisionResult = yield* Effect.fromOption(Number.divide(x, y), () => new Error("Division by zero"))
    const step2 = Number.sum(divisionResult, z)
    const step3 = Number.multiply(step2, 2)
    return Number.round(step3)
  }).pipe(
    Effect.catchAll(() => Effect.succeed(0))
  )
```

### Pattern 3: Range and Boundary Operations

```typescript
import { Number } from "effect"

// Clamping values to valid ranges
const normalizePercentage = Number.clamp({ minimum: 0, maximum: 100 })

// Range validation for business rules
const isValidAge = Number.between({ minimum: 0, maximum: 150 })
const isValidTemperature = Number.between({ minimum: -273.15, maximum: 5778 }) // Absolute zero to Sun's surface

// Finding extremes in datasets
const temperatures = [23.5, 18.2, 31.7, 15.9, 28.3]
const maxTemp = temperatures.reduce(Number.max)
const minTemp = temperatures.reduce(Number.min)
```

## Real-World Examples

### Example 1: E-commerce Price Calculator

Building a robust pricing system with tax calculation, discounts, and currency formatting.

```typescript
import { Number, Option, Effect } from "effect"

interface PriceCalculationError extends Error {
  readonly _tag: "PriceCalculationError"
}

const PriceCalculationError = (message: string): PriceCalculationError => ({
  _tag: "PriceCalculationError",
  name: "PriceCalculationError",
  message
})

interface Product {
  readonly id: string
  readonly basePrice: number
  readonly taxRate: number
  readonly discountPercentage: number
}

interface PriceBreakdown {
  readonly basePrice: number
  readonly discount: number
  readonly subtotal: number
  readonly tax: number
  readonly total: number
}

// Helper for safe percentage calculations
const calculatePercentage = (value: number, percentage: number): Option.Option<number> =>
  Option.map(
    Number.divide(percentage, 100),
    rate => Number.multiply(value, rate)
  )

// Calculate discount amount
const calculateDiscount = (basePrice: number, discountPercentage: number): number =>
  Option.getOrElse(calculatePercentage(basePrice, discountPercentage), () => 0)

// Calculate tax on a given amount
const calculateTax = (amount: number, taxRate: number): number =>
  Option.getOrElse(calculatePercentage(amount, taxRate), () => 0)

// Main price calculation function
export const calculatePrice = (product: Product): Effect.Effect<PriceBreakdown, PriceCalculationError> =>
  Effect.gen(function* () {
    // Validate input values
    if (!Number.isNumber(product.basePrice) || product.basePrice < 0) {
      return yield* Effect.fail(PriceCalculationError("Invalid base price"))
    }
    
    if (!Number.between({ minimum: 0, maximum: 100 })(product.discountPercentage)) {
      return yield* Effect.fail(PriceCalculationError("Invalid discount percentage"))
    }
    
    if (!Number.between({ minimum: 0, maximum: 50 })(product.taxRate)) {
      return yield* Effect.fail(PriceCalculationError("Invalid tax rate"))
    }

    // Calculate price breakdown
    const basePrice = product.basePrice
    const discount = calculateDiscount(basePrice, product.discountPercentage)
    const subtotal = Number.subtract(basePrice, discount)
    const tax = calculateTax(subtotal, product.taxRate)
    const total = Number.sum(subtotal, tax)

    return {
      basePrice: Number.round(basePrice * 100) / 100, // Round to 2 decimal places
      discount: Number.round(discount * 100) / 100,
      subtotal: Number.round(subtotal * 100) / 100,
      tax: Number.round(tax * 100) / 100,
      total: Number.round(total * 100) / 100
    }
  })

// Usage example
const product: Product = {
  id: "laptop-001",
  basePrice: 999.99,
  taxRate: 8.25,
  discountPercentage: 15
}

// In practice, you would run this effect:
// const priceBreakdown = yield* calculatePrice(product)
// Result: {
//   basePrice: 999.99,
//   discount: 150.00,
//   subtotal: 849.99,
//   tax: 70.12,
//   total: 920.11
// }
```

### Example 2: Statistical Data Analysis

Processing sensor data with outlier detection and statistical calculations.

```typescript
import { Number, Array as Arr, Option, Effect } from "effect"

interface StatisticalSummary {
  readonly count: number
  readonly sum: number
  readonly mean: number
  readonly min: number
  readonly max: number
  readonly range: number
  readonly median: number
}

interface SensorReading {
  readonly timestamp: Date
  readonly value: number
  readonly sensorId: string
}

// Calculate median value from sorted array
const calculateMedian = (sortedValues: ReadonlyArray<number>): number => {
  const length = sortedValues.length
  const middle = Math.floor(length / 2)
  
  if (length % 2 === 0) {
    const sum = Number.sum(sortedValues[middle - 1], sortedValues[middle])
    return Option.getOrElse(Number.divide(sum, 2), () => 0)
  }
  
  return sortedValues[middle]
}

// Detect outliers using IQR method
const detectOutliers = (values: ReadonlyArray<number>): ReadonlyArray<number> => {
  const sorted = Arr.sort(values, Number.Order)
  const q1Index = Math.floor(sorted.length * 0.25)
  const q3Index = Math.floor(sorted.length * 0.75)
  
  const q1 = sorted[q1Index]
  const q3 = sorted[q3Index]
  const iqr = Number.subtract(q3, q1)
  const lowerBound = Number.subtract(q1, Number.multiply(iqr, 1.5))
  const upperBound = Number.sum(q3, Number.multiply(iqr, 1.5))
  
  return sorted.filter(value => 
    Number.lessThan(value, lowerBound) || Number.greaterThan(value, upperBound)
  )
}

// Process sensor readings and generate statistical summary
export const analyzeSensorData = (readings: ReadonlyArray<SensorReading>): Effect.Effect<StatisticalSummary, Error> =>
  Effect.gen(function* () {
    if (readings.length === 0) {
      return yield* Effect.fail(new Error("No sensor readings provided"))
    }

    // Extract and validate numeric values
    const values = readings
      .map(reading => reading.value)
      .filter(Number.isNumber)
    
    if (values.length === 0) {
      return yield* Effect.fail(new Error("No valid numeric readings found"))
    }

    // Calculate basic statistics
    const count = values.length
    const sum = Number.sumAll(values)
    const mean = Option.getOrElse(Number.divide(sum, count), () => 0)

    // Find min and max
    const min = values.reduce(Number.min)
    const max = values.reduce(Number.max)
    const range = Number.subtract(max, min)

    // Calculate median
    const sortedValues = Arr.sort(values, Number.Order)
    const median = calculateMedian(sortedValues)

    return {
      count,
      sum: Number.round(sum * 100) / 100,
      mean: Number.round(mean * 100) / 100,
      min,
      max,
      range,
      median
    }
  })

// Filter readings within acceptable range
export const filterValidReadings = (
  readings: ReadonlyArray<SensorReading>,
  minValue: number,
  maxValue: number
): ReadonlyArray<SensorReading> => {
  const isInRange = Number.between({ minimum: minValue, maximum: maxValue })
  
  return readings.filter(reading => 
    Number.isNumber(reading.value) && isInRange(reading.value)
  )
}

// Usage example
const sensorReadings: ReadonlyArray<SensorReading> = [
  { timestamp: new Date(), value: 23.5, sensorId: "temp-01" },
  { timestamp: new Date(), value: 24.1, sensorId: "temp-01" },
  { timestamp: new Date(), value: 22.8, sensorId: "temp-01" },
  { timestamp: new Date(), value: 45.2, sensorId: "temp-01" }, // Outlier
  { timestamp: new Date(), value: 23.9, sensorId: "temp-01" }
]

const validReadings = filterValidReadings(sensorReadings, 0, 40)
// In practice, you would run this effect:
// const statistics = yield* analyzeSensorData(validReadings)
```

### Example 3: Financial Portfolio Calculator

Building a portfolio management system with risk calculations and rebalancing.

```typescript
import { Number, Option, Effect, Array as Arr } from "effect"

interface Asset {
  readonly symbol: string
  readonly currentValue: number
  readonly targetAllocation: number // Percentage (0-100)
}

interface Portfolio {
  readonly assets: ReadonlyArray<Asset>
  readonly totalValue: number
}

interface RebalanceRecommendation {
  readonly symbol: string
  readonly currentAllocation: number
  readonly targetAllocation: number
  readonly difference: number
  readonly action: "BUY" | "SELL" | "HOLD"
  readonly amount: number
}

// Calculate current allocation percentage for an asset
const calculateCurrentAllocation = (assetValue: number, totalValue: number): number =>
  Number.divide(assetValue, totalValue).pipe(
    Option.map(ratio => Number.multiply(ratio, 100)),
    Option.getOrElse(() => 0)
  )

// Calculate target value for an asset based on allocation
const calculateTargetValue = (targetAllocation: number, totalValue: number): number =>
  Number.divide(targetAllocation, 100).pipe(
    Option.map(ratio => Number.multiply(ratio, totalValue)),
    Option.getOrElse(() => 0)
  )

// Validate portfolio allocations sum to 100%
const validateAllocations = (assets: ReadonlyArray<Asset>): Effect.Effect<void, Error> =>
  Effect.gen(function* () {
    const totalAllocation = Number.sumAll(assets.map(asset => asset.targetAllocation))
    const tolerance = 0.01 // Allow 1% tolerance for rounding
    
    if (!Number.between({ minimum: 100 - tolerance, maximum: 100 + tolerance })(totalAllocation)) {
      return yield* Effect.fail(new Error(`Target allocations sum to ${totalAllocation}%, must equal 100%`))
    }
  })

// Generate rebalancing recommendations
export const generateRebalanceRecommendations = (
  portfolio: Portfolio
): Effect.Effect<ReadonlyArray<RebalanceRecommendation>, Error> =>
  Effect.gen(function* () {
    yield* validateAllocations(portfolio.assets)
    
    const recommendations = portfolio.assets.map(asset => {
      const currentAllocation = calculateCurrentAllocation(asset.currentValue, portfolio.totalValue)
      const targetValue = calculateTargetValue(asset.targetAllocation, portfolio.totalValue)
      const difference = Number.subtract(currentAllocation, asset.targetAllocation)
      const amount = Math.abs(Number.subtract(targetValue, asset.currentValue))
      
      let action: "BUY" | "SELL" | "HOLD" = "HOLD"
      if (Number.greaterThan(Math.abs(difference), 1)) { // Only recommend if >1% difference
        action = Number.greaterThan(difference, 0) ? "SELL" : "BUY"
      }
      
      return {
        symbol: asset.symbol,
        currentAllocation: Number.round(currentAllocation * 100) / 100,
        targetAllocation: asset.targetAllocation,
        difference: Number.round(difference * 100) / 100,
        action,
        amount: Number.round(amount * 100) / 100
      }
    })
    
    return recommendations
  })

// Calculate portfolio risk score based on allocation deviation
export const calculatePortfolioRisk = (
  recommendations: ReadonlyArray<RebalanceRecommendation>
): number => {
  const deviations = recommendations.map(rec => Math.abs(rec.difference))
  const totalDeviation = Number.sumAll(deviations)
  
  // Risk score: 0-100 based on total allocation deviation
  return Number.clamp({ minimum: 0, maximum: 100 })(totalDeviation * 2)
}

// Usage example
const portfolio: Portfolio = {
  totalValue: 100000,
  assets: [
    { symbol: "STOCKS", currentValue: 65000, targetAllocation: 60 },
    { symbol: "BONDS", currentValue: 25000, targetAllocation: 30 },
    { symbol: "CASH", currentValue: 10000, targetAllocation: 10 }
  ]
}

// In practice, you would run this effect:
// const recommendations = yield* generateRebalanceRecommendations(portfolio)
// const riskScore = calculatePortfolioRisk(recommendations)

// Example output:
// [
//   { symbol: "STOCKS", currentAllocation: 65, targetAllocation: 60, difference: 5, action: "SELL", amount: 5000 },
//   { symbol: "BONDS", currentAllocation: 25, targetAllocation: 30, difference: -5, action: "BUY", amount: 5000 },
//   { symbol: "CASH", currentAllocation: 10, targetAllocation: 10, difference: 0, action: "HOLD", amount: 0 }
// ]
```

## Advanced Features Deep Dive

### Feature 1: Monoid and Semigroup Operations

Effect Number provides mathematical structures for combining values in predictable ways.

#### Basic Monoid Usage

```typescript
import { Number } from "effect"

// Sum monoid for aggregating values
const totalSales = Number.sumAll([1200, 850, 2100, 950]) // 5100

// Product monoid for compound calculations
const compoundGrowth = Number.multiplyAll([1.05, 1.03, 1.07, 1.02]) // ~1.177

// Min/Max operations for finding extremes
const temperatures = [23.5, 18.2, 31.7, 15.9, 28.3]
const highestTemp = temperatures.reduce(Number.max) // 31.7
const lowestTemp = temperatures.reduce(Number.min) // 15.9
```

#### Real-World Monoid Example

```typescript
// Financial aggregation using monoids
interface TransactionSummary {
  readonly totalRevenue: number
  readonly totalExpenses: number
  readonly transactionCount: number
  readonly averageAmount: number
}

const aggregateTransactions = (transactions: ReadonlyArray<{ amount: number, type: 'revenue' | 'expense' }>): TransactionSummary => {
  const revenues = transactions
    .filter(t => t.type === 'revenue')
    .map(t => t.amount)
  
  const expenses = transactions
    .filter(t => t.type === 'expense')
    .map(t => t.amount)
  
  const totalRevenue = Number.sumAll(revenues)
  const totalExpenses = Number.sumAll(expenses)
  const transactionCount = transactions.length
  
  const averageAmount = Option.getOrElse(
    Number.divide(Number.sum(totalRevenue, totalExpenses), transactionCount),
    () => 0
  )
  
  return {
    totalRevenue,
    totalExpenses,
    transactionCount,
    averageAmount: Number.round(averageAmount * 100) / 100
  }
}
```

#### Advanced Monoid: Custom Aggregations

```typescript
// Custom aggregation for statistical analysis
interface NumericStats {
  readonly count: number
  readonly sum: number
  readonly sumOfSquares: number
  readonly min: number
  readonly max: number
}

const createStatsAggregator = () => {
  const empty: NumericStats = {
    count: 0,
    sum: 0,
    sumOfSquares: 0,
    min: Infinity,
    max: -Infinity
  }
  
  const combine = (a: NumericStats, b: NumericStats): NumericStats => ({
    count: Number.sum(a.count, b.count),
    sum: Number.sum(a.sum, b.sum),
    sumOfSquares: Number.sum(a.sumOfSquares, b.sumOfSquares),
    min: Number.min(a.min, b.min),
    max: Number.max(a.max, b.max)
  })
  
  const fromNumber = (n: number): NumericStats => ({
    count: 1,
    sum: n,
    sumOfSquares: Number.multiply(n, n),
    min: n,
    max: n
  })
  
  return { empty, combine, fromNumber }
}

// Usage for parallel statistical computation
const statsAggregator = createStatsAggregator()
const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const finalStats = values
  .map(statsAggregator.fromNumber)
  .reduce(statsAggregator.combine, statsAggregator.empty)
```

### Feature 2: Safe Division and Error Handling

Division operations that handle edge cases gracefully.

#### Basic Safe Division

```typescript
import { Number, Option, Effect } from "effect"

// Division returns Option to handle division by zero
const safeDivision = (dividend: number, divisor: number): Option.Option<number> =>
  Number.divide(dividend, divisor)

// Unsafe division for performance-critical paths (use with caution)
const fastDivision = (dividend: number, divisor: number): number =>
  Number.unsafeDivide(dividend, divisor) // May return Infinity or NaN
```

#### Real-World Safe Division Example

```typescript
// Rate calculation with error handling
interface RateCalculationResult {
  readonly rate: number
  readonly isValid: boolean
  readonly error?: string
}

const calculateConversionRate = (
  conversions: number,
  totalViews: number
): RateCalculationResult =>
  Option.match(Number.divide(conversions, totalViews), {
    onNone: () => ({
      rate: 0,
      isValid: false,
      error: "Cannot calculate rate: division by zero"
    }),
    onSome: (rate) => ({
      rate: Number.round(rate * 10000) / 100, // Convert to percentage with 2 decimals
      isValid: true
    })
  })

// Batch rate calculations with error recovery
const calculateBatchRates = (
  data: ReadonlyArray<{ conversions: number, views: number, campaign: string }>
): ReadonlyArray<{ campaign: string, result: RateCalculationResult }> => {
  return data.map(item => ({
    campaign: item.campaign,
    result: calculateConversionRate(item.conversions, item.views)
  }))
}
```

#### Advanced Division: Financial Calculations

```typescript
// Compound interest calculator with safe division
interface CompoundInterestParams {
  readonly principal: number
  readonly annualRate: number
  readonly compoundingFrequency: number
  readonly years: number
}

const calculateCompoundInterest = (
  params: CompoundInterestParams
): Effect.Effect<number, Error> =>
  Effect.gen(function* () {
    const { principal, annualRate, compoundingFrequency, years } = params
    
    // Validate inputs
    if (principal <= 0) {
      return yield* Effect.fail(new Error("Principal must be positive"))
    }
    
    if (compoundingFrequency <= 0) {
      return yield* Effect.fail(new Error("Compounding frequency must be positive"))
    }
    
    // Calculate rate per period
    const ratePerPeriod = yield* Option.match(
      Number.divide(annualRate, compoundingFrequency),
      {
        onNone: () => Effect.fail(new Error("Invalid compounding frequency")),
        onSome: Effect.succeed
      }
    )
    
    // Calculate number of periods
    const totalPeriods = Number.multiply(years, compoundingFrequency)
    
    // A = P(1 + r/n)^(nt)
    const growthFactor = Number.sum(1, ratePerPeriod)
    const compoundedAmount = Number.multiply(
      principal,
      Math.pow(growthFactor, totalPeriods)
    )
    
    return Number.round(compoundedAmount * 100) / 100
  })
```

### Feature 3: Ordering and Comparison Operations

Comprehensive comparison operations for sorting and ranking.

#### Basic Comparison Operations

```typescript
import { Number } from "effect"

// Individual comparisons
const isEligible = Number.greaterThanOrEqualTo(18) // Age check
const isPassing = Number.greaterThanOrEqualTo(60) // Grade check
const isDiscounted = Number.lessThan(100) // Price check

// Range checks
const isNormalTemperature = Number.between({ minimum: 36.1, maximum: 37.2 })
const isValidPercentage = Number.between({ minimum: 0, maximum: 100 })
```

#### Real-World Comparison Example

```typescript
// Product ranking and filtering system
interface Product {
  readonly id: string
  readonly name: string
  readonly price: number
  readonly rating: number
  readonly stock: number
}

// Filtering predicates using Number operations
const isAffordable = (maxPrice: number) => (product: Product) =>
  Number.lessThanOrEqualTo(maxPrice)(product.price)

const isHighlyRated = (product: Product) =>
  Number.greaterThanOrEqualTo(4.0)(product.rating)

const isInStock = (product: Product) =>
  Number.greaterThan(0)(product.stock)

const isPremium = (product: Product) =>
  Number.greaterThan(1000)(product.price)

// Complex filtering with multiple criteria
const findRecommendedProducts = (
  products: ReadonlyArray<Product>,
  maxPrice: number,
  minRating: number
): ReadonlyArray<Product> => {
  const isAffordableProduct = isAffordable(maxPrice)
  const isQualityProduct = (product: Product) =>
    Number.greaterThanOrEqualTo(minRating)(product.rating)
  
  return products.filter(product =>
    isAffordableProduct(product) &&
    isQualityProduct(product) &&
    isInStock(product)
  )
}

// Sorting with custom comparators
const sortProductsByValue = (products: ReadonlyArray<Product>): ReadonlyArray<Product> =>
  Arr.sort(products, (a, b) => {
    // Calculate value score: rating / log(price)
    const valueA = Number.divide(a.rating, Math.log(a.price + 1))
    const valueB = Number.divide(b.rating, Math.log(b.price + 1))
    
    return Option.match(Option.all([valueA, valueB]), {
      onNone: () => 0,
      onSome: ([vA, vB]) => Number.sign(Number.subtract(vB, vA))
    })
  })
```

#### Advanced Comparison: Multi-Criteria Scoring

```typescript
// Employee performance scoring system
interface Employee {
  readonly id: string
  readonly salesPerformance: number // 0-100
  readonly customerSatisfaction: number // 0-100
  readonly teamworkScore: number // 0-100
  readonly yearsExperience: number
}

interface PerformanceWeights {
  readonly sales: number
  readonly satisfaction: number
  readonly teamwork: number
  readonly experience: number
}

const calculatePerformanceScore = (
  employee: Employee,
  weights: PerformanceWeights
): number => {
  // Normalize experience (cap at 10 years for scoring)
  const normalizedExperience = Number.clamp({ minimum: 0, maximum: 10 })(employee.yearsExperience) * 10
  
  // Calculate weighted score
  const salesScore = Number.multiply(employee.salesPerformance, weights.sales)
  const satisfactionScore = Number.multiply(employee.customerSatisfaction, weights.satisfaction)
  const teamworkScore = Number.multiply(employee.teamworkScore, weights.teamwork)
  const experienceScore = Number.multiply(normalizedExperience, weights.experience)
  
  const totalScore = Number.sumAll([salesScore, satisfactionScore, teamworkScore, experienceScore])
  const totalWeight = Number.sumAll([weights.sales, weights.satisfaction, weights.teamwork, weights.experience])
  
  return Number.clamp({ minimum: 0, maximum: 100 })(
    Option.getOrElse(Number.divide(totalScore, totalWeight), () => 0)
  )
}

// Performance tier classification
const classifyPerformance = (score: number): "Excellent" | "Good" | "Satisfactory" | "Needs Improvement" => {
  if (Number.greaterThanOrEqualTo(90)(score)) return "Excellent"
  if (Number.greaterThanOrEqualTo(75)(score)) return "Good"
  if (Number.greaterThanOrEqualTo(60)(score)) return "Satisfactory"
  return "Needs Improvement"
}

// Rank employees by performance
const rankEmployees = (
  employees: ReadonlyArray<Employee>,
  weights: PerformanceWeights
): ReadonlyArray<{ employee: Employee, score: number, tier: string, rank: number }> => {
  const scoredEmployees = employees.map(employee => ({
    employee,
    score: calculatePerformanceScore(employee, weights)
  }))
  
  const sortedEmployees = Arr.sort(
    scoredEmployees,
    (a, b) => Number.sign(Number.subtract(b.score, a.score))
  )
  
  return sortedEmployees.map((item, index) => ({
    ...item,
    tier: classifyPerformance(item.score),
    rank: Number.increment(index)
  }))
}
```

## Practical Patterns & Best Practices

### Pattern 1: Validation and Sanitization Pipeline

Create reusable validation chains for numeric input processing.

```typescript
import { Number, Option, Effect, pipe } from "effect"

// Validation result types
interface ValidationResult<T> {
  readonly value: T
  readonly isValid: boolean
  readonly errors: ReadonlyArray<string>
}

// Create a validation pipeline builder
const createNumberValidator = () => {
  const validators: Array<(value: number) => Option.Option<string>> = []
  
  const addValidator = (validator: (value: number) => Option.Option<string>) => {
    validators.push(validator)
    return api
  }
  
  const isNumber = addValidator((value: unknown) =>
    Number.isNumber(value) ? Option.none() : Option.some("Value must be a number")
  )
  
  const min = (minimum: number) => addValidator((value: number) =>
    Number.greaterThanOrEqualTo(minimum)(value) ? Option.none() : Option.some(`Value must be >= ${minimum}`)
  )
  
  const max = (maximum: number) => addValidator((value: number) =>
    Number.lessThanOrEqualTo(maximum)(value) ? Option.none() : Option.some(`Value must be <= ${maximum}`)
  )
  
  const between = (minimum: number, maximum: number) => addValidator((value: number) =>
    Number.between({ minimum, maximum })(value) ? Option.none() : Option.some(`Value must be between ${minimum} and ${maximum}`)
  )
  
  const positive = addValidator((value: number) =>
    Number.greaterThan(0)(value) ? Option.none() : Option.some("Value must be positive")
  )
  
  const integer = addValidator((value: number) =>
    Number.remainder(value, 1) === 0 ? Option.none() : Option.some("Value must be an integer")
  )
  
  const validate = (value: unknown): ValidationResult<number> => {
    if (!Number.isNumber(value)) {
      return {
        value: 0,
        isValid: false,
        errors: ["Value must be a number"]
      }
    }
    
    const errors = validators
      .map(validator => validator(value))
      .filter(Option.isSome)
      .map(Option.getOrThrow)
    
    return {
      value,
      isValid: errors.length === 0,
      errors
    }
  }
  
  const api = {
    min,
    max,
    between,
    positive,
    integer,
    validate,
    addValidator
  }
  
  return api
}

// Usage examples
const ageValidator = createNumberValidator()
  .min(0)
  .max(150)
  .integer()

const priceValidator = createNumberValidator()
  .positive()
  .max(999999.99)

const percentageValidator = createNumberValidator()
  .between(0, 100)

// Validation in action
const validateUserInput = (input: unknown) => {
  const ageResult = ageValidator.validate(input)
  
  if (!ageResult.isValid) {
    console.log("Validation errors:", ageResult.errors)
    return null
  }
  
  return ageResult.value
}
```

### Pattern 2: Precision-Safe Financial Calculations

Handle floating-point precision issues in financial calculations.

```typescript
import { Number, pipe } from "effect"

// Precision-safe number operations
class FinancialNumber {
  constructor(private readonly value: number, private readonly precision: number = 2) {}
  
  static from(value: number, precision: number = 2): FinancialNumber {
    const multiplier = Math.pow(10, precision)
    const rounded = Math.round(Number.multiply(value, multiplier))
    return new FinancialNumber(
      Option.getOrElse(Number.divide(rounded, multiplier), () => 0), 
      precision
    )
  }
  
  add(other: FinancialNumber | number): FinancialNumber {
    const otherValue = other instanceof FinancialNumber ? other.value : other
    return FinancialNumber.from(Number.sum(this.value, otherValue), this.precision)
  }
  
  subtract(other: FinancialNumber | number): FinancialNumber {
    const otherValue = other instanceof FinancialNumber ? other.value : other
    return FinancialNumber.from(Number.subtract(this.value, otherValue), this.precision)
  }
  
  multiply(other: FinancialNumber | number): FinancialNumber {
    const otherValue = other instanceof FinancialNumber ? other.value : other
    return FinancialNumber.from(Number.multiply(this.value, otherValue), this.precision)
  }
  
  divide(other: FinancialNumber | number): Option.Option<FinancialNumber> {
    const otherValue = other instanceof FinancialNumber ? other.value : other
    return Option.map(
      Number.divide(this.value, otherValue),
      result => FinancialNumber.from(result, this.precision)
    )
  }
  
  percentage(percent: number): FinancialNumber {
    return Option.getOrElse(
      Option.map(Number.divide(percent, 100), rate => this.multiply(rate)),
      () => FinancialNumber.from(0, this.precision)
    )
  }
  
  toNumber(): number {
    return this.value
  }
  
  toString(): string {
    return this.value.toFixed(this.precision)
  }
  
  toCurrency(symbol: string = "$"): string {
    return `${symbol}${this.toString()}`
  }
}

// Usage in financial calculations
const calculateOrderTotal = (subtotal: number, taxRate: number, discountPercent: number) => {
  const subtotalAmount = FinancialNumber.from(subtotal)
  const discount = subtotalAmount.percentage(discountPercent)
  const discountedSubtotal = subtotalAmount.subtract(discount)
  const tax = discountedSubtotal.percentage(taxRate)
  const total = discountedSubtotal.add(tax)
  
  return {
    subtotal: subtotalAmount.toCurrency(),
    discount: discount.toCurrency(),
    discountedSubtotal: discountedSubtotal.toCurrency(),
    tax: tax.toCurrency(),
    total: total.toCurrency()
  }
}

// Example usage
const orderSummary = calculateOrderTotal(99.99, 8.25, 10)
// Result: {
//   subtotal: "$99.99",
//   discount: "$10.00",
//   discountedSubtotal: "$89.99",
//   tax: "$7.42",
//   total: "$97.41"
// }
```

### Pattern 3: Statistical Functions and Data Analysis

Build comprehensive statistical analysis tools.

```typescript
import { Number, Option, Array as Arr, pipe } from "effect"

// Statistical analysis utilities
const Statistics = {
  // Central tendency measures
  mean: (values: ReadonlyArray<number>): Option.Option<number> =>
    values.length > 0
      ? Number.divide(Number.sumAll(values), values.length)
      : Option.none(),
  
  median: (values: ReadonlyArray<number>): Option.Option<number> => {
    if (values.length === 0) return Option.none()
    
    const sorted = Arr.sort(values, Number.Order)
    const middle = Math.floor(sorted.length / 2)
    
    if (sorted.length % 2 === 0) {
      const sum = Number.sum(sorted[middle - 1], sorted[middle])
      return Number.divide(sum, 2)
    }
    
    return Option.some(sorted[middle])
  },
  
  mode: (values: ReadonlyArray<number>): ReadonlyArray<number> => {
    if (values.length === 0) return []
    
    const frequency = new Map<number, number>()
    values.forEach(value => {
      frequency.set(value, Number.increment(frequency.get(value) || 0))
    })
    
    const maxFrequency = Math.max(...frequency.values())
    return Array.from(frequency.entries())
      .filter(([_, freq]) => freq === maxFrequency)
      .map(([value, _]) => value)
  },
  
  // Variability measures
  range: (values: ReadonlyArray<number>): Option.Option<number> => {
    if (values.length === 0) return Option.none()
    
    const min = values.reduce(Number.min)
    const max = values.reduce(Number.max)
    return Option.some(Number.subtract(max, min))
  },
  
  variance: (values: ReadonlyArray<number>): Option.Option<number> =>
    Option.flatMap(Statistics.mean(values), mean => {
      const squaredDifferences = values.map(value => 
        Number.multiply(Number.subtract(value, mean), Number.subtract(value, mean))
      )
      return Statistics.mean(squaredDifferences)
    }),
  
  standardDeviation: (values: ReadonlyArray<number>): Option.Option<number> =>
    Option.map(Statistics.variance(values), Math.sqrt),
  
  // Percentiles
  percentile: (values: ReadonlyArray<number>, p: number): Option.Option<number> => {
    if (values.length === 0 || !Number.between({ minimum: 0, maximum: 100 })(p)) {
      return Option.none()
    }
    
    const sorted = Arr.sort(values, Number.Order)
    const index = Math.floor(
      Number.multiply(
        Option.getOrElse(Number.divide(p, 100), () => 0),
        Number.subtract(sorted.length, 1)
      )
    )
    
    return Option.some(sorted[Number.clamp({ minimum: 0, maximum: sorted.length - 1 })(index)])
  },
  
  quartiles: (values: ReadonlyArray<number>) => ({
    q1: Statistics.percentile(values, 25),
    q2: Statistics.percentile(values, 50), // Same as median
    q3: Statistics.percentile(values, 75)
  }),
  
  // Distribution analysis
  skewness: (values: ReadonlyArray<number>): Option.Option<number> =>
    Effect.gen(function* () {
      const mean = yield* Statistics.mean(values)
      const stdDev = yield* Statistics.standardDeviation(values)
      
      if (Number.lessThanOrEqualTo(0)(stdDev)) {
        return yield* Option.none()
      }
      
      const cubedDeviations = values.map(value => {
        const deviation = Option.getOrElse(
          Number.divide(Number.subtract(value, mean), stdDev),
          () => 0
        )
        return Math.pow(deviation, 3)
      })
      
      const n = values.length
      const skew = Option.getOrElse(
        Number.divide(Number.sumAll(cubedDeviations), n),
        () => 0
      )
      
      return yield* Option.some(skew)
    }).pipe(Effect.runSync),
  
  // Summary statistics
  summary: (values: ReadonlyArray<number>) => ({
    count: values.length,
    mean: Statistics.mean(values),
    median: Statistics.median(values),
    mode: Statistics.mode(values),
    range: Statistics.range(values),
    variance: Statistics.variance(values),
    standardDeviation: Statistics.standardDeviation(values),
    quartiles: Statistics.quartiles(values),
    min: values.length > 0 ? Option.some(values.reduce(Number.min)) : Option.none(),
    max: values.length > 0 ? Option.some(values.reduce(Number.max)) : Option.none()
  })
}

// Usage example with sales data
const monthlySales = [12500, 13200, 11800, 14500, 13900, 12200, 15100, 14800, 13600, 12900, 14200, 13500]

const salesAnalysis = Statistics.summary(monthlySales)
console.log("Sales Analysis:", {
  averageSales: Option.getOrElse(salesAnalysis.mean, () => 0),
  medianSales: Option.getOrElse(salesAnalysis.median, () => 0),
  salesRange: Option.getOrElse(salesAnalysis.range, () => 0),
  standardDeviation: Option.getOrElse(salesAnalysis.standardDeviation, () => 0)
})
```

## Integration Examples

### Integration with Effect Schema

Combine Number operations with Schema validation for robust data processing.

```typescript
import { Schema, Number, Effect } from "effect"

// Define schemas with Number validation
const PositiveNumber = Schema.Number.pipe(
  Schema.filter(Number.greaterThan(0), {
    message: () => "Number must be positive"
  })
)

const Percentage = Schema.Number.pipe(
  Schema.filter(Number.between({ minimum: 0, maximum: 100 }), {
    message: () => "Percentage must be between 0 and 100"
  })
)

const Currency = Schema.Number.pipe(
  Schema.filter(Number.greaterThanOrEqualTo(0), {
    message: () => "Currency amount cannot be negative"
  }),
  Schema.transform(
    Schema.Number,
    {
      decode: (value) => Number.round(value * 100) / 100, // Round to 2 decimals
      encode: (value) => value
    }
  )
)

// Product schema using Number validations
const ProductSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  price: Currency,
  discountPercentage: Percentage,
  stock: Schema.Number.pipe(
    Schema.filter(Number.greaterThanOrEqualTo(0), {
      message: () => "Stock cannot be negative"
    }),
    Schema.filter((n) => Number.remainder(n, 1) === 0, {
      message: () => "Stock must be a whole number"
    })
  ),
  rating: Schema.Number.pipe(
    Schema.filter(Number.between({ minimum: 0, maximum: 5 }), {
      message: () => "Rating must be between 0 and 5"
    })
  )
})

// Order calculation with schema validation
const OrderItemSchema = Schema.Struct({
  productId: Schema.String,
  quantity: Schema.Number.pipe(
    Schema.filter(Number.greaterThan(0), {
      message: () => "Quantity must be positive"
    }),
    Schema.filter((n) => Number.remainder(n, 1) === 0, {
      message: () => "Quantity must be a whole number"
    })
  ),
  unitPrice: Currency
})

const calculateOrderTotal = (orderItems: ReadonlyArray<Schema.Schema.Type<typeof OrderItemSchema>>): number => {
  const itemTotals = orderItems.map(item => 
    Number.multiply(item.quantity, item.unitPrice)
  )
  
  return Number.sumAll(itemTotals)
}

// Usage with schema validation
const processOrder = (rawOrderData: unknown) =>
  Effect.gen(function* () {
    const orderItems = yield* Schema.decodeUnknown(Schema.Array(OrderItemSchema))(rawOrderData)
    const total = calculateOrderTotal(orderItems)
    
    return {
      items: orderItems,
      subtotal: total,
      tax: Number.multiply(total, 0.08),
      total: Number.multiply(total, 1.08)
    }
  })
```

### Integration with Effect Stream

Process numeric data streams with Number operations.

```typescript
import { Stream, Number, Effect, Schedule, Option } from "effect"

// Real-time data processing with Number operations
const processTemperatureStream = (temperatureStream: Stream.Stream<number>) =>
  temperatureStream.pipe(
    Stream.filter(Number.isNumber), // Ensure valid numbers
    Stream.filter(Number.between({ minimum: -50, maximum: 100 })), // Filter realistic temperatures
    Stream.map(temp => ({
      celsius: temp,
      fahrenheit: Option.getOrElse(
        Option.map(
          Number.divide(Number.multiply(temp, 9), 5),
          result => Number.sum(result, 32)
        ),
        () => 0
      ),
      kelvin: Number.sum(temp, 273.15)
    })),
    Stream.sliding(5), // Moving window of 5 readings
    Stream.map(window => ({
      readings: window,
      average: Option.getOrElse(
        Number.divide(Number.sumAll(window.map(r => r.celsius)), window.length),
        () => 0
      ),
      max: window.reduce((max, reading) => Number.max(max.celsius, reading.celsius)),
      min: window.reduce((min, reading) => Number.min(min.celsius, reading.celsius))
    }))
  )

// Financial data aggregation stream
const processStockPriceStream = (priceStream: Stream.Stream<{ symbol: string, price: number }>) =>
  priceStream.pipe(
    Stream.groupByKey(data => data.symbol),
    Stream.map(([symbol, symbolStream]) =>
      symbolStream.pipe(
        Stream.map(data => data.price),
        Stream.filter(Number.greaterThan(0)), // Filter invalid prices
        Stream.sliding(20), // 20-period moving average
        Stream.map(prices => ({
          symbol,
          currentPrice: prices[prices.length - 1],
          movingAverage: Option.getOrElse(
            Number.divide(Number.sumAll(prices), prices.length),
            () => 0
          ),
          volatility: calculateVolatility(prices),
          trend: calculateTrend(prices)
        }))
      )
    ),
    Stream.merge()
  )

// Helper functions for financial calculations
const calculateVolatility = (prices: ReadonlyArray<number>): number => {
  if (prices.length < 2) return 0
  
  const returns = prices.slice(1).map((price, index) =>
    Option.getOrElse(
      Option.map(Number.divide(price, prices[index]), ratio => Number.subtract(ratio, 1)),
      () => 0
    )
  )
  
  const meanReturn = Option.getOrElse(
    Number.divide(Number.sumAll(returns), returns.length),
    () => 0
  )
  
  const variance = Option.getOrElse(
    Number.divide(
      Number.sumAll(returns.map(ret => Math.pow(Number.subtract(ret, meanReturn), 2))),
      returns.length
    ),
    () => 0
  )
  
  return Math.sqrt(variance)
}

const calculateTrend = (prices: ReadonlyArray<number>): "UP" | "DOWN" | "FLAT" => {
  if (prices.length < 2) return "FLAT"
  
  const firstPrice = prices[0]
  const lastPrice = prices[prices.length - 1]
  const change = Number.subtract(lastPrice, firstPrice)
  
  if (Number.greaterThan(0.01)(Math.abs(change / firstPrice))) {
    return Number.greaterThan(0)(change) ? "UP" : "DOWN"
  }
  
  return "FLAT"
}
```

### Testing Strategies

Comprehensive testing approaches for Number-based calculations.

```typescript
import { Number, Effect, Gen } from "effect"
import { describe, it, expect } from "vitest"

// Property-based testing with generators
const PositiveNumberGen = Gen.number({ min: 0.01, max: 10000 })
const PercentageGen = Gen.number({ min: 0, max: 100 })
const IntegerGen = Gen.int({ min: 1, max: 1000 })

describe("Number Operations", () => {
  it("should maintain mathematical properties", () => {
    Effect.gen(function* () {
      const a = yield* PositiveNumberGen
      const b = yield* PositiveNumberGen
      
      // Commutative property: a + b = b + a
      expect(Number.sum(a, b)).toBe(Number.sum(b, a))
      
      // Associative property: (a + b) + c = a + (b + c)
      const c = yield* PositiveNumberGen
      const left = Number.sum(Number.sum(a, b), c)
      const right = Number.sum(a, Number.sum(b, c))
      expect(Math.abs(left - right)).toBeLessThan(1e-10)
      
      // Identity property: a + 0 = a
      expect(Number.sum(a, 0)).toBe(a)
    }).pipe(
      Effect.runSync
    )
  })
  
  it("should handle division by zero safely", () => {
    const result = Number.divide(10, 0)
    expect(Option.isNone(result)).toBe(true)
  })
  
  it("should clamp values correctly", () => {
    Effect.gen(function* () {
      const value = yield* Gen.number({ min: -1000, max: 1000 })
      const min = 0
      const max = 100
      
      const clamped = Number.clamp({ minimum: min, maximum: max })(value)
      
      expect(Number.greaterThanOrEqualTo(min)(clamped)).toBe(true)
      expect(Number.lessThanOrEqualTo(max)(clamped)).toBe(true)
      
      if (Number.between({ minimum: min, maximum: max })(value)) {
        expect(clamped).toBe(value)
      }
    }).pipe(
      Effect.runSync
    )
  })
  
  it("should calculate percentages accurately", () => {
    Effect.gen(function* () {
      const base = yield* PositiveNumberGen
      const percentage = yield* PercentageGen
      
      const result = Option.getOrElse(
        Option.map(Number.divide(percentage, 100), rate => Number.multiply(base, rate)),
        () => 0
      )
      
      // Verify the percentage calculation
      const expected = base * (percentage / 100)
      expect(Math.abs(result - expected)).toBeLessThan(1e-10)
    }).pipe(
      Effect.runSync
    )
  })
})

// Mock testing for external dependencies
const createMockCalculator = () => ({
  add: vi.fn((a: number, b: number) => Number.sum(a, b)),
  divide: vi.fn((a: number, b: number) => Number.divide(a, b)),
  percentage: vi.fn((base: number, percent: number) =>
    Number.divide(percent, 100).pipe(
      Option.map(rate => Number.multiply(base, rate))
    )
  )
})

// Integration testing with realistic scenarios
describe("Financial Calculations", () => {
  it("should calculate compound interest correctly", () => {
    const principal = 1000
    const rate = 5 // 5% annual
    const periods = 12 // Monthly compounding
    const years = 1
    
    const result = Effect.runSync(calculateCompoundInterest({
      principal,
      annualRate: rate,
      compoundingFrequency: periods,
      years
    }))
    
    // Expected: 1000 * (1 + 0.05/12)^(12*1) ≈ 1051.16
    expect(result).toBeCloseTo(1051.16, 2)
  })
  
  it("should handle edge cases in price calculations", () => {
    const edgeCases = [
      { price: 0, tax: 10, discount: 0 },
      { price: 0.01, tax: 0, discount: 100 },
      { price: 999999.99, tax: 50, discount: 50 }
    ]
    
    edgeCases.forEach(testCase => {
      const result = Effect.runSync(calculatePrice({
        id: "test",
        basePrice: testCase.price,
        taxRate: testCase.tax,
        discountPercentage: testCase.discount
      }))
      
      expect(result.total).toBeGreaterThanOrEqual(0)
      expect(Number.isFinite(result.total)).toBe(true)
    })
  })
})
```

## Conclusion

Number provides comprehensive, type-safe numerical operations for building robust applications. It eliminates common pitfalls in JavaScript numeric programming while maintaining functional programming principles and excellent composability.

Key benefits:
- **Type Safety** - Compile-time guarantees and runtime type guards prevent numeric errors
- **Error Handling** - Safe operations like division return Option types to handle edge cases gracefully
- **Functional Composition** - All operations are pipeable and work seamlessly with other Effect modules
- **Mathematical Rigor** - Built-in support for monoids, ordering, and statistical operations
- **Production Ready** - Handles floating-point precision, validation, and real-world edge cases

Use Number when you need reliable numeric operations, financial calculations, statistical analysis, or any application where numeric precision and safety are critical requirements.