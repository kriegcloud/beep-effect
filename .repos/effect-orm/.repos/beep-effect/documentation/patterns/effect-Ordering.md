# Ordering: A Real-World Guide

## Table of Contents
1. [Introduction & Core Concepts](#introduction--core-concepts)
2. [Basic Usage Patterns](#basic-usage-patterns)
3. [Real-World Examples](#real-world-examples)
4. [Advanced Features Deep Dive](#advanced-features-deep-dive)
5. [Practical Patterns & Best Practices](#practical-patterns--best-practices)
6. [Integration Examples](#integration-examples)

## Introduction & Core Concepts

### The Problem Ordering Solves

When working with comparison results and building complex ordering logic, traditional approaches often lead to scattered conditional logic, inconsistent result handling, and non-composable comparison workflows:

```typescript
// Traditional approach - manual comparison result handling
function compareUsers(userA: User, userB: User): number {
  // Nested conditionals for complex comparisons
  const nameComparison = userA.name.localeCompare(userB.name)
  if (nameComparison !== 0) {
    return nameComparison
  }
  
  const ageComparison = userA.age - userB.age
  if (ageComparison !== 0) {
    return ageComparison
  }
  
  return userA.id.localeCompare(userB.id)
}

// Scattered comparison result handling
function processComparisonResult(result: number): string {
  if (result < 0) {
    return "first is smaller"
  } else if (result > 0) {
    return "first is larger"
  } else {
    return "they are equal"
  }
}

// Manual combination of multiple comparison results
function combineComparisons(results: number[]): number {
  for (const result of results) {
    if (result !== 0) {
      return result
    }
  }
  return 0
}

// Inconsistent ordering reversal
function reverseComparison(result: number): number {
  return result === 0 ? 0 : (result > 0 ? -1 : 1)
}
```

This approach leads to:
- **Scattered Logic** - Comparison result handling spread across the codebase
- **Error-Prone** - Manual handling of -1, 0, 1 values without type safety
- **Non-Composable** - Difficult to combine and transform ordering logic
- **Inconsistent Patterns** - Different developers handle ordering differently

### The Ordering Solution

Effect's Ordering module provides a functional, composable way to work with comparison results and build complex ordering logic:

```typescript
import { Ordering, Array as Arr } from "effect"

// Type-safe ordering result handling
const comparisonResult: Ordering.Ordering = -1 // Less than

// Composable pattern matching on ordering results
const resultMessage = Ordering.match(comparisonResult, {
  onLessThan: () => "first is smaller",
  onEqual: () => "they are equal", 
  onGreaterThan: () => "first is larger"
})

// Functional composition of ordering operations
const processOrderingChain = (initial: Ordering.Ordering, others: Ordering.Ordering[]) =>
  Ordering.combineMany(initial, others)

// Type-safe ordering reversal
const reversed = Ordering.reverse(comparisonResult)
```

### Key Concepts

**Ordering**: A type representing comparison results as `-1` (less than), `0` (equal), or `1` (greater than).

**Pattern Matching**: Use `match` to handle all three ordering cases in a type-safe way.

**Composition**: Combine multiple ordering results using `combine`, `combineMany`, and `combineAll` for complex comparison logic.

## Basic Usage Patterns

### Pattern 1: Basic Ordering Operations

```typescript
import { Ordering } from "effect"

// Create ordering values
const lessThan: Ordering.Ordering = -1
const equal: Ordering.Ordering = 0
const greaterThan: Ordering.Ordering = 1

// Reverse ordering
console.log(Ordering.reverse(lessThan))    // 1
console.log(Ordering.reverse(equal))       // 0
console.log(Ordering.reverse(greaterThan)) // -1
```

### Pattern 2: Pattern Matching on Results

```typescript
import { Ordering } from "effect"
import { constant } from "effect/Function"

// Create a matcher for ordering results
const toStatusMessage = Ordering.match({
  onLessThan: constant("Below threshold"),
  onEqual: constant("At threshold"), 
  onGreaterThan: constant("Above threshold")
})

// Usage with different ordering values
const result1 = toStatusMessage(-1) // "Below threshold"
const result2 = toStatusMessage(0)  // "At threshold"
const result3 = toStatusMessage(1)  // "Above threshold"
```

### Pattern 3: Combining Ordering Results

```typescript
import { Ordering } from "effect"

// Combine two ordering results - first non-zero wins
const primary: Ordering.Ordering = 0  // Equal
const secondary: Ordering.Ordering = -1 // Less than
const combined = Ordering.combine(primary, secondary) // -1

// Combine multiple results
const result = Ordering.combineMany(0, [-1, 1, 0]) // -1 (first non-zero)

// Combine all results in a collection
const allResults: Ordering.Ordering[] = [0, 0, 1, -1]
const finalResult = Ordering.combineAll(allResults) // 1 (first non-zero)
```

## Real-World Examples

### Example 1: Multi-Criteria Decision System

Building a candidate evaluation system that combines multiple scoring criteria:

```typescript
import { Ordering, Effect } from "effect"

interface Candidate {
  id: string
  name: string
  experience: number
  skills: string[]
  education: 'highschool' | 'bachelor' | 'master' | 'phd'
  interviewScore: number
  referenceScore: number
  availabilityDate: Date
}

interface EvaluationCriteria {
  experienceWeight: number
  skillsWeight: number  
  educationWeight: number
  interviewWeight: number
  referenceWeight: number
  availabilityWeight: number
}

// Convert scores to ordering results
const scoreToOrdering = (scoreA: number, scoreB: number): Ordering.Ordering => {
  if (scoreA < scoreB) return -1
  if (scoreA > scoreB) return 1
  return 0
}

// Education level ranking
const educationValue = (education: Candidate['education']): number => {
  switch (education) {
    case 'highschool': return 1
    case 'bachelor': return 2
    case 'master': return 3
    case 'phd': return 4
  }
}

// Create evaluation service
const makeCandidateEvaluationService = Effect.gen(function* () {
  const evaluateCandidates = (
    candidateA: Candidate,
    candidateB: Candidate,
    criteria: EvaluationCriteria
  ) => Effect.gen(function* () {
    // Calculate individual criterion comparisons
    const experienceComparison = scoreToOrdering(
      candidateA.experience * criteria.experienceWeight,
      candidateB.experience * criteria.experienceWeight
    )
    
    const skillsComparison = scoreToOrdering(
      candidateA.skills.length * criteria.skillsWeight,
      candidateB.skills.length * criteria.skillsWeight
    )
    
    const educationComparison = scoreToOrdering(
      educationValue(candidateA.education) * criteria.educationWeight,
      educationValue(candidateB.education) * criteria.educationWeight
    )
    
    const interviewComparison = scoreToOrdering(
      candidateA.interviewScore * criteria.interviewWeight,
      candidateB.interviewScore * criteria.interviewWeight
    )
    
    const referenceComparison = scoreToOrdering(
      candidateA.referenceScore * criteria.referenceWeight,
      candidateB.referenceScore * criteria.referenceWeight
    )
    
    // Earlier availability is better (reverse comparison)
    const availabilityComparison = Ordering.reverse(
      scoreToOrdering(
        candidateA.availabilityDate.getTime() * criteria.availabilityWeight,
        candidateB.availabilityDate.getTime() * criteria.availabilityWeight
      )
    )
    
    // Combine all criteria using weighted priority
    const finalEvaluation = Ordering.combineMany(interviewComparison, [
      referenceComparison,
      experienceComparison,
      educationComparison,
      skillsComparison,
      availabilityComparison
    ])
    
    return {
      result: finalEvaluation,
      breakdown: {
        experience: experienceComparison,
        skills: skillsComparison,
        education: educationComparison,
        interview: interviewComparison,
        reference: referenceComparison,
        availability: availabilityComparison
      }
    }
  })

  const rankCandidates = (
    candidates: Candidate[],
    criteria: EvaluationCriteria
  ) => Effect.gen(function* () {
    const evaluations = new Map<string, {
      candidate: Candidate
      comparisons: Map<string, Ordering.Ordering>
    }>()
    
    // Evaluate all pairs
    for (let i = 0; i < candidates.length; i++) {
      for (let j = i + 1; j < candidates.length; j++) {
        const evaluation = yield* evaluateCandidates(
          candidates[i], 
          candidates[j], 
          criteria
        )
        
        const candidateAId = candidates[i].id
        const candidateBId = candidates[j].id
        
        if (!evaluations.has(candidateAId)) {
          evaluations.set(candidateAId, {
            candidate: candidates[i],
            comparisons: new Map()
          })
        }
        
        if (!evaluations.has(candidateBId)) {
          evaluations.set(candidateBId, {
            candidate: candidates[j],
            comparisons: new Map()
          })
        }
        
        evaluations.get(candidateAId)!.comparisons.set(candidateBId, evaluation.result)
        evaluations.get(candidateBId)!.comparisons.set(
          candidateAId, 
          Ordering.reverse(evaluation.result)
        )
      }
    }
    
    // Create ranking based on win/loss record
    const rankings = Array.from(evaluations.entries()).map(([id, data]) => {
      const wins = Array.from(data.comparisons.values()).filter(result => result === 1).length
      const losses = Array.from(data.comparisons.values()).filter(result => result === -1).length
      const ties = Array.from(data.comparisons.values()).filter(result => result === 0).length
      
      return {
        candidate: data.candidate,
        wins,
        losses,
        ties,
        score: wins - losses
      }
    }).sort((a, b) => b.score - a.score)
    
    return rankings
  })

  const getRecommendation = (
    evaluation: Ordering.Ordering,
    candidateA: Candidate,
    candidateB: Candidate
  ) => {
    return Ordering.match(evaluation, {
      onLessThan: () => `Recommend ${candidateB.name} over ${candidateA.name}`,
      onEqual: () => `${candidateA.name} and ${candidateB.name} are equally qualified`,
      onGreaterThan: () => `Recommend ${candidateA.name} over ${candidateB.name}`
    })
  }

  return { evaluateCandidates, rankCandidates, getRecommendation } as const
})
```

### Example 2: Performance Monitoring with Threshold Comparisons

Building a system that monitors performance metrics and triggers alerts based on threshold comparisons:

```typescript
import { Ordering, Effect, Array as Arr } from "effect"

interface PerformanceMetric {
  name: string
  value: number
  timestamp: Date
  category: 'cpu' | 'memory' | 'disk' | 'network'
  severity: 'info' | 'warning' | 'error' | 'critical'
}

interface Threshold {
  name: string
  category: PerformanceMetric['category']
  warningLevel: number
  errorLevel: number
  criticalLevel: number
}

interface Alert {
  metricName: string
  level: 'warning' | 'error' | 'critical'
  message: string
  timestamp: Date
  recommendation: string
}

// Create performance monitoring service
const makePerformanceMonitoringService = Effect.gen(function* () {
  const compareWithThreshold = (
    value: number,
    threshold: number
  ): Ordering.Ordering => {
    if (value < threshold) return -1
    if (value > threshold) return 1
    return 0
  }

  const evaluateMetricSeverity = (
    metric: PerformanceMetric,
    threshold: Threshold
  ) => Effect.gen(function* () {
    const warningComparison = compareWithThreshold(metric.value, threshold.warningLevel)
    const errorComparison = compareWithThreshold(metric.value, threshold.errorLevel)
    const criticalComparison = compareWithThreshold(metric.value, threshold.criticalLevel)
    
    // Determine alert level based on threshold comparisons
    const alertLevel = Ordering.match(criticalComparison, {
      onLessThan: () => Ordering.match(errorComparison, {
        onLessThan: () => Ordering.match(warningComparison, {
          onLessThan: () => null, // No alert
          onEqual: () => 'warning' as const,
          onGreaterThan: () => 'warning' as const
        }),
        onEqual: () => 'error' as const,
        onGreaterThan: () => 'error' as const
      }),
      onEqual: () => 'critical' as const,
      onGreaterThan: () => 'critical' as const
    })
    
    return {
      metric,
      threshold,
      alertLevel,
      comparisons: {
        warning: warningComparison,
        error: errorComparison,
        critical: criticalComparison
      }
    }
  })

  const generateAlert = (
    metric: PerformanceMetric,
    threshold: Threshold,
    level: 'warning' | 'error' | 'critical'
  ): Alert => {
    const recommendations = {
      warning: `Monitor ${metric.name} closely. Consider scaling if trend continues.`,
      error: `Immediate attention required for ${metric.name}. Check system resources.`,
      critical: `URGENT: ${metric.name} has exceeded critical threshold. Take immediate action.`
    }
    
    const severityMessages = {
      warning: `Warning: ${metric.name} (${metric.value}) has exceeded warning threshold (${threshold.warningLevel})`,
      error: `Error: ${metric.name} (${metric.value}) has exceeded error threshold (${threshold.errorLevel})`,
      critical: `Critical: ${metric.name} (${metric.value}) has exceeded critical threshold (${threshold.criticalLevel})`
    }
    
    return {
      metricName: metric.name,
      level,
      message: severityMessages[level],
      timestamp: new Date(),
      recommendation: recommendations[level]
    }
  }

  const processMetrics = (
    metrics: PerformanceMetric[],
    thresholds: Threshold[]
  ) => Effect.gen(function* () {
    const alerts: Alert[] = []
    
    for (const metric of metrics) {
      const threshold = thresholds.find(t => 
        t.category === metric.category && t.name === metric.name
      )
      
      if (!threshold) continue
      
      const evaluation = yield* evaluateMetricSeverity(metric, threshold)
      
      if (evaluation.alertLevel) {
        const alert = generateAlert(metric, threshold, evaluation.alertLevel)
        alerts.push(alert)
      }
    }
    
    // Sort alerts by severity (critical first)
    const severityOrder = (level: Alert['level']): number => {
      switch (level) {
        case 'critical': return 3
        case 'error': return 2
        case 'warning': return 1
      }
    }
    
    return alerts.sort((a, b) => 
      scoreToOrdering(severityOrder(b.level), severityOrder(a.level))
    )
  })

  const analyzePerformanceTrends = (
    metrics: PerformanceMetric[],
    windowSize: number = 5
  ) => Effect.gen(function* () {
    const trends = new Map<string, {
      name: string
      trend: Ordering.Ordering
      changeRate: number
      confidence: number
    }>()
    
    // Group metrics by name
    const metricGroups = Arr.groupBy(metrics, m => m.name)
    
    for (const [name, groupMetrics] of Object.entries(metricGroups)) {
      if (groupMetrics.length < windowSize) continue
      
      // Sort by timestamp
      const sortedMetrics = groupMetrics.sort((a, b) => 
        a.timestamp.getTime() - b.timestamp.getTime()
      )
      
      const recent = sortedMetrics.slice(-windowSize)
      const early = recent.slice(0, Math.floor(windowSize / 2))
      const late = recent.slice(Math.ceil(windowSize / 2))
      
      const earlyAvg = early.reduce((sum, m) => sum + m.value, 0) / early.length
      const lateAvg = late.reduce((sum, m) => sum + m.value, 0) / late.length
      
      const changeRate = ((lateAvg - earlyAvg) / earlyAvg) * 100
      const trend = compareWithThreshold(lateAvg, earlyAvg)
      
      trends.set(name, {
        name,
        trend,
        changeRate,
        confidence: Math.min(groupMetrics.length / windowSize, 1)
      })
    }
    
    return trends
  })

  const scoreToOrdering = (scoreA: number, scoreB: number): Ordering.Ordering => {
    if (scoreA < scoreB) return -1
    if (scoreA > scoreB) return 1
    return 0
  }

  return { 
    evaluateMetricSeverity, 
    processMetrics, 
    analyzePerformanceTrends,
    generateAlert
  } as const
})
```

### Example 3: Content Ranking System with Weighted Factors

Building a content ranking system that evaluates articles based on multiple factors:

```typescript
import { Ordering, Effect, Option } from "effect"

interface Article {
  id: string
  title: string
  author: string
  publishDate: Date
  views: number
  likes: number
  comments: number
  shares: number
  readingTime: number // minutes
  category: string
  tags: string[]
  qualityScore: Option.Option<number> // 0-100, editorial review
}

interface RankingFactors {
  recency: number        // Weight for how recent the article is
  engagement: number     // Weight for user engagement (likes, comments, shares)
  popularity: number     // Weight for view count
  quality: number        // Weight for editorial quality score
  readability: number    // Weight for optimal reading time
}

// Create content ranking service
const makeContentRankingService = Effect.gen(function* () {
  const calculateEngagementScore = (article: Article): number => {
    const views = article.views || 1 // Avoid division by zero
    const engagementRate = (article.likes + article.comments + article.shares) / views
    return Math.min(engagementRate * 100, 100) // Cap at 100
  }

  const calculateRecencyScore = (article: Article): number => {
    const now = new Date().getTime()
    const articleTime = article.publishDate.getTime()
    const daysSincePublished = (now - articleTime) / (1000 * 60 * 60 * 24)
    
    // Decay function: newer articles score higher
    return Math.max(0, 100 * Math.exp(-daysSincePublished / 7)) // 7-day half-life
  }

  const calculateReadabilityScore = (article: Article): number => {
    // Optimal reading time is around 3-7 minutes
    const optimalMin = 3
    const optimalMax = 7
    
    if (article.readingTime >= optimalMin && article.readingTime <= optimalMax) {
      return 100
    } else if (article.readingTime < optimalMin) {
      return (article.readingTime / optimalMin) * 100
    } else {
      return Math.max(0, 100 - ((article.readingTime - optimalMax) * 10))
    }
  }

  const calculatePopularityScore = (article: Article, maxViews: number): number => {
    return maxViews > 0 ? (article.views / maxViews) * 100 : 0
  }

  const compareArticles = (
    articleA: Article,
    articleB: Article,
    factors: RankingFactors,
    maxViews: number
  ) => Effect.gen(function* () {
    // Calculate individual scores
    const scoresA = {
      recency: calculateRecencyScore(articleA),
      engagement: calculateEngagementScore(articleA),
      popularity: calculatePopularityScore(articleA, maxViews),
      quality: Option.getOrElse(articleA.qualityScore, () => 50), // Default quality
      readability: calculateReadabilityScore(articleA)
    }
    
    const scoresB = {
      recency: calculateRecencyScore(articleB),
      engagement: calculateEngagementScore(articleB),
      popularity: calculatePopularityScore(articleB, maxViews),
      quality: Option.getOrElse(articleB.qualityScore, () => 50),
      readability: calculateReadabilityScore(articleB)
    }
    
    // Apply weights and convert to ordering
    const recencyComparison = scoreToOrdering(
      scoresA.recency * factors.recency,
      scoresB.recency * factors.recency
    )
    
    const engagementComparison = scoreToOrdering(
      scoresA.engagement * factors.engagement,
      scoresB.engagement * factors.engagement
    )
    
    const popularityComparison = scoreToOrdering(
      scoresA.popularity * factors.popularity,
      scoresB.popularity * factors.popularity
    )
    
    const qualityComparison = scoreToOrdering(
      scoresA.quality * factors.quality,
      scoresB.quality * factors.quality
    )
    
    const readabilityComparison = scoreToOrdering(
      scoresA.readability * factors.readability,
      scoresB.readability * factors.readability
    )
    
    // Combine factors with weighted priority
    const finalRanking = Ordering.combineMany(qualityComparison, [
      engagementComparison,
      recencyComparison,
      popularityComparison,
      readabilityComparison
    ])
    
    return {
      result: finalRanking,
      scoresA,
      scoresB,
      comparisons: {
        recency: recencyComparison,
        engagement: engagementComparison,
        popularity: popularityComparison,
        quality: qualityComparison,
        readability: readabilityComparison
      }
    }
  })

  const rankArticles = (
    articles: Article[],
    factors: RankingFactors
  ) => Effect.gen(function* () {
    if (articles.length === 0) return []
    
    const maxViews = Math.max(...articles.map(a => a.views))
    
    // Calculate composite scores for each article
    const articleScores = articles.map(article => {
      const recencyScore = calculateRecencyScore(article)
      const engagementScore = calculateEngagementScore(article)
      const popularityScore = calculatePopularityScore(article, maxViews)
      const qualityScore = Option.getOrElse(article.qualityScore, () => 50)
      const readabilityScore = calculateReadabilityScore(article)
      
      const compositeScore = 
        (recencyScore * factors.recency) +
        (engagementScore * factors.engagement) +
        (popularityScore * factors.popularity) +
        (qualityScore * factors.quality) +
        (readabilityScore * factors.readability)
      
      return {
        article,
        compositeScore,
        breakdown: {
          recency: recencyScore,
          engagement: engagementScore,
          popularity: popularityScore,
          quality: qualityScore,
          readability: readabilityScore
        }
      }
    })
    
    // Sort by composite score (descending)
    return articleScores.sort((a, b) => 
      scoreToOrdering(b.compositeScore, a.compositeScore)
    )
  })

  const createPersonalizedRanking = (
    articles: Article[],
    userInterests: string[], // Tags user is interested in
    baseFactors: RankingFactors
  ) => Effect.gen(function* () {
    // Boost articles that match user interests
    const personalizedFactors = { ...baseFactors }
    
    const personalizedArticles = articles.map(article => {
      const interestMatch = article.tags.some(tag => 
        userInterests.includes(tag.toLowerCase())
      )
      
      // Boost engagement and quality factors for matching interests
      const boostMultiplier = interestMatch ? 1.5 : 1.0
      
      return {
        ...article,
        personalizedBoost: boostMultiplier
      }
    })
    
    return yield* rankArticles(articles, {
      ...personalizedFactors,
      engagement: personalizedFactors.engagement * 1.2, // Slight engagement boost for personalization
      quality: personalizedFactors.quality * 1.1
    })
  })

  const getTrendingArticles = (
    articles: Article[],
    timeWindow: number = 24 // hours
  ) => Effect.gen(function* () {
    const now = new Date()
    const windowStart = new Date(now.getTime() - (timeWindow * 60 * 60 * 1000))
    
    // Filter articles within time window
    const recentArticles = articles.filter(article => 
      article.publishDate >= windowStart
    )
    
    // Use engagement-heavy factors for trending
    const trendingFactors: RankingFactors = {
      recency: 0.3,
      engagement: 0.4,
      popularity: 0.2,
      quality: 0.05,
      readability: 0.05
    }
    
    return yield* rankArticles(recentArticles, trendingFactors)
  })

  const scoreToOrdering = (scoreA: number, scoreB: number): Ordering.Ordering => {
    if (scoreA < scoreB) return -1
    if (scoreA > scoreB) return 1
    return 0
  }

  return { 
    compareArticles, 
    rankArticles, 
    createPersonalizedRanking, 
    getTrendingArticles 
  } as const
})
```

## Advanced Features Deep Dive

### Feature 1: Functional Composition with Ordering Results

The true power of Ordering lies in its composability, allowing you to build complex decision trees from simple comparison results:

#### Basic Composition Patterns

```typescript
import { Ordering } from "effect"

// Sequential composition - first non-zero result wins
const sequentialComparison = (
  primary: Ordering.Ordering,
  secondary: Ordering.Ordering,
  tertiary: Ordering.Ordering
) => {
  return Ordering.combineMany(primary, [secondary, tertiary])
}

// Weighted composition example
const weightedComparison = (
  comparisons: Array<{ result: Ordering.Ordering; weight: number }>
) => {
  // Convert weighted results to multiple repetitions for priority
  const expandedResults: Ordering.Ordering[] = []
  
  comparisons.forEach(({ result, weight }) => {
    for (let i = 0; i < weight; i++) {
      expandedResults.push(result)
    }
  })
  
  return Ordering.combineAll(expandedResults)
}
```

#### Advanced Composition with Conditional Logic

```typescript
// Conditional ordering based on context
const createContextualOrdering = <T>(
  item: T,
  contextPredicate: (item: T) => boolean,
  contextTrueOrder: Ordering.Ordering,
  contextFalseOrder: Ordering.Ordering
): Ordering.Ordering => {
  return contextPredicate(item) ? contextTrueOrder : contextFalseOrder
}

// Multi-level decision tree using ordering composition
interface DecisionCriteria {
  level1: Ordering.Ordering
  level2: Ordering.Ordering
  level3: Ordering.Ordering
  fallback: Ordering.Ordering
}

const createDecisionTree = (criteria: DecisionCriteria): Ordering.Ordering => {
  const level1Result = Ordering.match(criteria.level1, {
    onLessThan: () => criteria.level1,
    onEqual: () => Ordering.match(criteria.level2, {
      onLessThan: () => criteria.level2,
      onEqual: () => Ordering.match(criteria.level3, {
        onLessThan: () => criteria.level3,
        onEqual: () => criteria.fallback,
        onGreaterThan: () => criteria.level3
      }),
      onGreaterThan: () => criteria.level2
    }),
    onGreaterThan: () => criteria.level1
  })
  
  return level1Result
}
```

### Feature 2: Pattern Matching and Control Flow

Ordering's pattern matching enables sophisticated control flow based on comparison results:

#### Comprehensive Pattern Matching

```typescript
import { Ordering } from "effect"
import { pipe } from "effect"

// Rich pattern matching with side effects
const handleComparisonResult = (result: Ordering.Ordering, context: string) => {
  return Ordering.match(result, {
    onLessThan: () => {
      console.log(`${context}: First value is smaller`)
      return { status: 'lesser', action: 'boost_first' }
    },
    onEqual: () => {
      console.log(`${context}: Values are equal`)
      return { status: 'equal', action: 'maintain' }
    },
    onGreaterThan: () => {
      console.log(`${context}: First value is larger`)
      return { status: 'greater', action: 'boost_second' }
    }
  })
}

// Chain pattern matching operations
const chainedPatternMatching = (
  primary: Ordering.Ordering,
  secondary: Ordering.Ordering
) => {
  const primaryResult = Ordering.match(primary, {
    onLessThan: () => 'primary_low',
    onEqual: () => 'primary_equal',
    onGreaterThan: () => 'primary_high'
  })
  
  const secondaryResult = Ordering.match(secondary, {
    onLessThan: () => 'secondary_low',
    onEqual: () => 'secondary_equal', 
    onGreaterThan: () => 'secondary_high'
  })
  
  return { primary: primaryResult, secondary: secondaryResult }
}
```

#### Dynamic Pattern Matching

```typescript
// Factory for creating custom pattern matchers
const createPatternMatcher = <T>({
  onLessThan,
  onEqual,
  onGreaterThan
}: {
  onLessThan: () => T
  onEqual: () => T
  onGreaterThan: () => T
}) => {
  return (ordering: Ordering.Ordering): T => {
    return Ordering.match(ordering, {
      onLessThan,
      onEqual,
      onGreaterThan
    })
  }
}

// Usage with different result types
const statusMatcher = createPatternMatcher({
  onLessThan: () => ({ level: 'low', color: 'red' }),
  onEqual: () => ({ level: 'medium', color: 'yellow' }),
  onGreaterThan: () => ({ level: 'high', color: 'green' })
})

const actionMatcher = createPatternMatcher({
  onLessThan: () => 'increase',
  onEqual: () => 'maintain',
  onGreaterThan: () => 'decrease'
})
```

### Feature 3: Monoid and Semigroup Properties

Ordering forms a monoid with specific algebraic properties that enable advanced composition:

#### Understanding the Monoid Structure

```typescript
import { Ordering } from "effect"

// Ordering follows monoid laws:
// 1. Associativity: combine(a, combine(b, c)) === combine(combine(a, b), c)
// 2. Identity: combine(a, 0) === combine(0, a) === a

// Identity element demonstration
const demonstrateIdentity = () => {
  const someOrdering: Ordering.Ordering = -1
  const identity: Ordering.Ordering = 0
  
  console.log(Ordering.combine(someOrdering, identity)) // -1
  console.log(Ordering.combine(identity, someOrdering)) // -1
}

// Associativity demonstration
const demonstrateAssociativity = () => {
  const a: Ordering.Ordering = -1
  const b: Ordering.Ordering = 0
  const c: Ordering.Ordering = 1
  
  const left = Ordering.combine(a, Ordering.combine(b, c))
  const right = Ordering.combine(Ordering.combine(a, b), c)
  
  console.log(left === right) // true
}
```

#### Leveraging Monoid Properties for Parallel Composition

```typescript
// Parallel composition using monoid properties
const parallelOrderingComposition = (
  orderings: Ordering.Ordering[]
): Ordering.Ordering => {
  // Can be computed in parallel and combined due to associativity
  return orderings.reduce(
    (acc, ordering) => Ordering.combine(acc, ordering),
    0 as Ordering.Ordering // Identity element
  )
}

// Chunked processing for large ordering arrays
const processOrderingsInChunks = (
  orderings: Ordering.Ordering[],
  chunkSize: number = 100
): Ordering.Ordering => {
  const chunks: Ordering.Ordering[][] = []
  
  for (let i = 0; i < orderings.length; i += chunkSize) {
    chunks.push(orderings.slice(i, i + chunkSize))
  }
  
  // Process chunks in parallel (conceptually)
  const chunkResults = chunks.map(chunk => 
    Ordering.combineAll(chunk)
  )
  
  return Ordering.combineAll(chunkResults)
}
```

## Practical Patterns & Best Practices

### Pattern 1: Ordering Result Caching

For expensive comparison operations, implement caching strategies:

```typescript
import { Ordering } from "effect"

// Memoized ordering comparison
const createMemoizedComparison = <T>(
  comparisonFn: (a: T, b: T) => Ordering.Ordering,
  keyFn: (a: T, b: T) => string = (a, b) => `${JSON.stringify(a)}-${JSON.stringify(b)}`
) => {
  const cache = new Map<string, Ordering.Ordering>()
  
  return (a: T, b: T): Ordering.Ordering => {
    const key = keyFn(a, b)
    const reverseKey = keyFn(b, a)
    
    if (cache.has(key)) {
      return cache.get(key)!
    }
    
    if (cache.has(reverseKey)) {
      return Ordering.reverse(cache.get(reverseKey)!)
    }
    
    const result = comparisonFn(a, b)
    cache.set(key, result)
    return result
  }
}

// Usage with expensive computations
interface ComplexData {
  id: string
  computedValue: number
  metadata: Record<string, any>
}

const expensiveComparison = (a: ComplexData, b: ComplexData): Ordering.Ordering => {
  // Simulate expensive computation
  const scoreA = Object.keys(a.metadata).length * a.computedValue
  const scoreB = Object.keys(b.metadata).length * b.computedValue
  
  if (scoreA < scoreB) return -1
  if (scoreA > scoreB) return 1
  return 0
}

const memoizedExpensiveComparison = createMemoizedComparison(
  expensiveComparison,
  (a, b) => `${a.id}-${b.id}` // Use IDs as cache keys
)
```

### Pattern 2: Ordering Pipelines

Create reusable ordering pipelines for complex business logic:

```typescript
import { Ordering, Effect } from "effect"

// Ordering pipeline step
interface OrderingStep<T> {
  name: string
  compare: (a: T, b: T) => Ordering.Ordering
  weight: number
  condition?: (a: T, b: T) => boolean
}

// Pipeline builder
class OrderingPipeline<T> {
  private steps: OrderingStep<T>[] = []
  
  addStep(step: OrderingStep<T>): this {
    this.steps.push(step)
    return this
  }
  
  addConditionalStep(
    condition: (a: T, b: T) => boolean,
    step: Omit<OrderingStep<T>, 'condition'>
  ): this {
    this.steps.push({ ...step, condition })
    return this
  }
  
  execute(a: T, b: T): { result: Ordering.Ordering; breakdown: Record<string, Ordering.Ordering> } {
    const breakdown: Record<string, Ordering.Ordering> = {}
    const weightedResults: Array<{ result: Ordering.Ordering; weight: number }> = []
    
    for (const step of this.steps) {
      if (step.condition && !step.condition(a, b)) {
        continue
      }
      
      const stepResult = step.compare(a, b)
      breakdown[step.name] = stepResult
      
      // Apply weight by repeating the result
      for (let i = 0; i < step.weight; i++) {
        weightedResults.push({ result: stepResult, weight: 1 })
      }
    }
    
    const finalResult = Ordering.combineAll(
      weightedResults.map(wr => wr.result)
    )
    
    return { result: finalResult, breakdown }
  }
}

// Usage example
interface Product {
  name: string
  price: number
  rating: number
  availability: 'in_stock' | 'limited' | 'out_of_stock'
  category: string
}

const createProductOrderingPipeline = () => {
  return new OrderingPipeline<Product>()
    .addStep({
      name: 'availability',
      compare: (a, b) => {
        const availabilityScore = (p: Product) => {
          switch (p.availability) {
            case 'in_stock': return 3
            case 'limited': return 2
            case 'out_of_stock': return 1
          }
        }
        const scoreA = availabilityScore(a)
        const scoreB = availabilityScore(b)
        if (scoreA < scoreB) return -1
        if (scoreA > scoreB) return 1
        return 0
      },
      weight: 3
    })
    .addStep({
      name: 'rating',
      compare: (a, b) => {
        if (a.rating < b.rating) return -1
        if (a.rating > b.rating) return 1
        return 0
      },
      weight: 2
    })
    .addConditionalStep(
      (a, b) => a.category === b.category, // Only compare price within same category
      {
        name: 'price',
        compare: (a, b) => {
          if (a.price > b.price) return -1 // Lower price is better
          if (a.price < b.price) return 1
          return 0
        },
        weight: 1
      }
    )
}
```

### Pattern 3: Ordering Validation and Testing

Ensure your ordering logic is correct with validation helpers:

```typescript
import { Ordering } from "effect"

// Ordering consistency validator
const validateOrderingConsistency = <T>(
  items: T[],
  orderingFn: (a: T, b: T) => Ordering.Ordering
): { isValid: boolean; violations: string[] } => {
  const violations: string[] = []
  
  // Test reflexivity: compare(a, a) === 0
  for (let i = 0; i < items.length; i++) {
    const result = orderingFn(items[i], items[i])
    if (result !== 0) {
      violations.push(`Reflexivity violation at index ${i}: compare(item, item) = ${result}, expected 0`)
    }
  }
  
  // Test antisymmetry: if compare(a, b) = x, then compare(b, a) = -x
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const ab = orderingFn(items[i], items[j])
      const ba = orderingFn(items[j], items[i])
      
      if (ab !== -ba && !(ab === 0 && ba === 0)) {
        violations.push(`Antisymmetry violation: compare(${i}, ${j}) = ${ab}, compare(${j}, ${i}) = ${ba}`)
      }
    }
  }
  
  // Test transitivity: if compare(a, b) <= 0 and compare(b, c) <= 0, then compare(a, c) <= 0
  for (let i = 0; i < items.length; i++) {
    for (let j = 0; j < items.length; j++) {
      for (let k = 0; k < items.length; k++) {
        if (i === j || j === k || i === k) continue
        
        const ab = orderingFn(items[i], items[j])
        const bc = orderingFn(items[j], items[k])
        const ac = orderingFn(items[i], items[k])
        
        if (ab <= 0 && bc <= 0 && ac > 0) {
          violations.push(`Transitivity violation: compare(${i}, ${j}) = ${ab}, compare(${j}, ${k}) = ${bc}, compare(${i}, ${k}) = ${ac}`)
        }
      }
    }
  }
  
  return {
    isValid: violations.length === 0,
    violations
  }
}

// Property-based testing helper
const generateOrderingTests = <T>(
  generator: () => T,
  orderingFn: (a: T, b: T) => Ordering.Ordering,
  testCount: number = 100
) => {
  const items = Array.from({ length: testCount }, generator)
  return validateOrderingConsistency(items, orderingFn)
}

// Usage example
interface TestItem {
  value: number
  category: string
}

const testItemOrdering = (a: TestItem, b: TestItem): Ordering.Ordering => {
  if (a.category !== b.category) {
    return a.category.localeCompare(b.category) as Ordering.Ordering
  }
  if (a.value < b.value) return -1
  if (a.value > b.value) return 1
  return 0
}

const randomTestItem = (): TestItem => ({
  value: Math.floor(Math.random() * 100),
  category: ['A', 'B', 'C'][Math.floor(Math.random() * 3)]
})

const validationResults = generateOrderingTests(
  randomTestItem,
  testItemOrdering,
  50
)

console.log('Ordering validation:', validationResults)
```

## Integration Examples

### Integration with Sorting Libraries

```typescript
import { Ordering, Array as Arr } from "effect"

// Bridge between Ordering and standard JavaScript sort
const orderingToComparator = <T>(
  orderingFn: (a: T, b: T) => Ordering.Ordering
) => {
  return (a: T, b: T): number => {
    const result = orderingFn(a, b)
    return result // Ordering values are already valid comparator results
  }
}

// Convert standard comparator to Ordering
const comparatorToOrdering = <T>(
  compareFn: (a: T, b: T) => number
) => {
  return (a: T, b: T): Ordering.Ordering => {
    const result = compareFn(a, b)
    if (result < 0) return -1
    if (result > 0) return 1
    return 0
  }
}

// Usage with different sorting approaches
interface SortableData {
  id: string
  value: number
  priority: 'low' | 'medium' | 'high'
}

const data: SortableData[] = [
  { id: '1', value: 10, priority: 'high' },
  { id: '2', value: 5, priority: 'low' },
  { id: '3', value: 15, priority: 'medium' }
]

// Using Effect's Array.sort with Ordering
const priorityOrdering = (a: SortableData, b: SortableData): Ordering.Ordering => {
  const priorityValue = (p: SortableData['priority']) => {
    switch (p) {
      case 'high': return 3
      case 'medium': return 2
      case 'low': return 1
    }
  }
  
  const aPriority = priorityValue(a.priority)
  const bPriority = priorityValue(b.priority)
  
  if (aPriority < bPriority) return -1
  if (aPriority > bPriority) return 1
  return 0
}

// Effect Array sort
const effectSorted = Arr.sort(data, priorityOrdering)

// Standard JavaScript sort using Ordering
const jsSorted = [...data].sort(orderingToComparator(priorityOrdering))
```

### Integration with State Management (Redux/Zustand)

```typescript
import { Ordering, Effect } from "effect"

// Redux-style ordering state management
interface OrderingState {
  comparisons: Record<string, Ordering.Ordering>
  results: Record<string, any>
  history: Array<{ timestamp: Date; operation: string; result: Ordering.Ordering }>
}

type OrderingAction =
  | { type: 'ADD_COMPARISON'; key: string; result: Ordering.Ordering }
  | { type: 'COMBINE_COMPARISONS'; keys: string[]; resultKey: string }
  | { type: 'REVERSE_COMPARISON'; key: string; resultKey: string }
  | { type: 'CLEAR_COMPARISONS' }

const orderingReducer = (
  state: OrderingState = { comparisons: {}, results: {}, history: [] },
  action: OrderingAction
): OrderingState => {
  switch (action.type) {
    case 'ADD_COMPARISON':
      return {
        ...state,
        comparisons: {
          ...state.comparisons,
          [action.key]: action.result
        },
        history: [
          ...state.history,
          { timestamp: new Date(), operation: 'ADD', result: action.result }
        ]
      }
    
    case 'COMBINE_COMPARISONS':
      const values = action.keys.map(key => state.comparisons[key]).filter(Boolean)
      const combined = Ordering.combineAll(values)
      return {
        ...state,
        results: {
          ...state.results,
          [action.resultKey]: combined
        },
        history: [
          ...state.history,
          { timestamp: new Date(), operation: 'COMBINE', result: combined }
        ]
      }
    
    case 'REVERSE_COMPARISON':
      const original = state.comparisons[action.key]
      if (original !== undefined) {
        const reversed = Ordering.reverse(original)
        return {
          ...state,
          results: {
            ...state.results,
            [action.resultKey]: reversed
          },
          history: [
            ...state.history,
            { timestamp: new Date(), operation: 'REVERSE', result: reversed }
          ]
        }
      }
      return state
    
    case 'CLEAR_COMPARISONS':
      return {
        comparisons: {},
        results: {},
        history: []
      }
    
    default:
      return state
  }
}

// Zustand store with Ordering
interface OrderingStore {
  comparisons: Map<string, Ordering.Ordering>
  addComparison: (key: string, result: Ordering.Ordering) => void
  combineComparisons: (keys: string[]) => Ordering.Ordering
  reverseComparison: (key: string) => Ordering.Ordering | undefined
  clearComparisons: () => void
}

const createOrderingStore = () => {
  const store: OrderingStore = {
    comparisons: new Map(),
    
    addComparison: (key: string, result: Ordering.Ordering) => {
      store.comparisons.set(key, result)
    },
    
    combineComparisons: (keys: string[]) => {
      const values = keys
        .map(key => store.comparisons.get(key))
        .filter((value): value is Ordering.Ordering => value !== undefined)
      return Ordering.combineAll(values)
    },
    
    reverseComparison: (key: string) => {
      const result = store.comparisons.get(key)
      return result !== undefined ? Ordering.reverse(result) : undefined
    },
    
    clearComparisons: () => {
      store.comparisons.clear()
    }
  }
  
  return store
}
```

### Testing Strategies

```typescript
import { describe, it, expect } from "bun:test"
import { Ordering } from "effect"

// Comprehensive Ordering testing suite
describe("Ordering Properties", () => {
  const testValues: Ordering.Ordering[] = [-1, 0, 1]
  
  it("should satisfy monoid identity laws", () => {
    testValues.forEach(value => {
      expect(Ordering.combine(value, 0)).toBe(value)
      expect(Ordering.combine(0, value)).toBe(value)
    })
  })
  
  it("should satisfy monoid associativity laws", () => {
    testValues.forEach(a => {
      testValues.forEach(b => {
        testValues.forEach(c => {
          const left = Ordering.combine(a, Ordering.combine(b, c))
          const right = Ordering.combine(Ordering.combine(a, b), c)
          expect(left).toBe(right)
        })
      })
    })
  })
  
  it("should reverse correctly", () => {
    expect(Ordering.reverse(-1)).toBe(1)
    expect(Ordering.reverse(0)).toBe(0)
    expect(Ordering.reverse(1)).toBe(-1)
  })
  
  it("should handle pattern matching correctly", () => {
    const matcher = Ordering.match({
      onLessThan: () => 'less',
      onEqual: () => 'equal',
      onGreaterThan: () => 'greater'
    })
    
    expect(matcher(-1)).toBe('less')
    expect(matcher(0)).toBe('equal')
    expect(matcher(1)).toBe('greater')
  })
  
  it("should combine multiple orderings correctly", () => {
    expect(Ordering.combineMany(0, [-1, 1, 0])).toBe(-1)
    expect(Ordering.combineMany(-1, [1, 0])).toBe(-1)
    expect(Ordering.combineMany(0, [0, 0])).toBe(0)
  })
  
  it("should combine all orderings correctly", () => {
    expect(Ordering.combineAll([0, 0, 1, -1])).toBe(1)
    expect(Ordering.combineAll([0, 0, 0])).toBe(0)
    expect(Ordering.combineAll([-1, 1])).toBe(-1)
  })
})

// Integration testing patterns
describe("Ordering Integration", () => {
  interface TestData {
    id: number
    category: string
    value: number
  }
  
  const testData: TestData[] = [
    { id: 1, category: 'A', value: 10 },
    { id: 2, category: 'B', value: 5 },
    { id: 3, category: 'A', value: 15 },
    { id: 4, category: 'B', value: 8 }
  ]
  
  it("should work with complex comparison logic", () => {
    const compareTestData = (a: TestData, b: TestData): Ordering.Ordering => {
      // Primary: category
      const categoryComparison = a.category.localeCompare(b.category) as Ordering.Ordering
      
      // Secondary: value (higher first)
      const valueComparison = (() => {
        if (a.value < b.value) return 1  // Reverse for descending
        if (a.value > b.value) return -1
        return 0
      })() as Ordering.Ordering
      
      return Ordering.combine(categoryComparison, valueComparison)
    }
    
    const result = compareTestData(testData[0], testData[1])
    expect(result).toBe(-1) // A comes before B
    
    const result2 = compareTestData(testData[0], testData[2])
    expect(result2).toBe(1) // Same category, but testData[2] has higher value
  })
  
  it("should handle edge cases correctly", () => {
    // Empty array combination
    expect(() => Ordering.combineAll([])).not.toThrow()
    
    // Single element combination
    expect(Ordering.combineAll([1])).toBe(1)
    expect(Ordering.combineMany(-1, [])).toBe(-1)
  })
})
```

## Conclusion

Ordering provides functional, composable tools for working with comparison results and building complex decision logic. It transforms scattered conditional logic into clear, type-safe, and reusable comparison operations.

Key benefits:
- **Type Safety**: Compile-time guarantees for comparison result handling
- **Composability**: Build complex ordering logic from simple building blocks  
- **Functional Approach**: Pattern matching and functional composition over imperative conditionals
- **Consistency**: Standardized approach to comparison result handling across your application

Ordering is essential when you need to work with comparison results, build complex decision trees, or create sophisticated ranking and evaluation systems while maintaining code clarity and type safety.