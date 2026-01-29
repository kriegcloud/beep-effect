# Logging Sucks - Wide Events & Observability

> **Source**: https://loggingsucks.com/
> **Author**: Boris Tane

## Core Problem

Traditional logging is fundamentally broken for modern distributed systems. A single user request might touch 15 services, 3 databases, 2 caches, and a message queue, yet logs remain structured around monolithic, single-server assumptions.

The central issue: logs optimize for writing, not querying. Developers emit convenient `console.log()` statements without considering how teams will search them during incidents.

## Key Terminology

**Structured Logging**: Key-value formatted output (typically JSON) replacing plain-text strings.

**Cardinality**: The number of unique values a field can contain. User IDs have high cardinality; HTTP methods have low cardinality.

**Dimensionality**: The field count per log event. More fields enable more sophisticated queries.

**Wide Events/Canonical Log Lines**: One comprehensive event per request, with all context attached instead of scattered multi-line outputs.

## The OpenTelemetry Misconception

OpenTelemetry functions as a protocol and SDK for standardizing telemetry collection. However, it does not:
- Determine what gets logged
- Add business context automatically
- Fix poor instrumentation practices

OpenTelemetry is a delivery mechanism. It doesn't know critical business context. You have to tell it.

## Wide Events Implementation

Rather than multiple debug statements throughout code execution, teams should emit a single enriched event containing:

- **Request metadata**: ID, timestamp, service name
- **User context**: Subscription tier, account age, lifetime value
- **Business data**: Cart contents, feature flags enabled
- **Performance metrics**: Latency, attempt counts
- **Error details**: If applicable

This allows single queries to answer complex questions: "Show checkout failures for premium users where the new flow was enabled."

## Tail Sampling Strategy

Managing observability costs requires intelligent sampling:

- **100% retention**: All errors, slow requests (above p99), VIP users
- **Partial retention**: Random sampling of successful, fast requests (1-5%)

This preserves critical debugging information while controlling infrastructure expenses.

## The Transformation

Wide events shift debugging from archaeological text searching to structured analytics—replacing "grep through 50 services hoping for clues" with targeted data queries returning results instantaneously.

## Summary

| Traditional Logs | Wide Events |
|-----------------|-------------|
| Many small log lines | One comprehensive event per request |
| Scattered context | All context attached to single event |
| Low dimensionality | High dimensionality |
| Text search (grep) | Structured queries |
| Hard to correlate | Easy to correlate |
| Optimized for writing | Optimized for querying |
