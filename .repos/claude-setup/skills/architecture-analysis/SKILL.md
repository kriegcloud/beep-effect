---
name: architecture-analysis
description: "Architectural dependency analysis and impact assessment. Use for: (1) Blast radius - who depends on a service, what breaks if I change it; (2) Dependency tree - what does a service depend on (ancestors/upstream); (3) Root cause analysis - find shared dependencies when multiple services fail; (4) Architecture metrics - coupling (density), depth (diameter), connectivity; (5) Domain discovery - identify module boundaries via cut vertices; (6) Hot services - critical infrastructure with many dependents; (7) Impact assessment before changes; (8) Debugging cascading failures; (9) Identifying god services, tight coupling, deep hierarchies. Provides graph-based analysis via CLI commands: analyze, blast-radius, ancestors, common-ancestors, metrics, domains, hot-services. All agents can use this for architectural questions."
invocableBy: agent
context: fork
---

<architecture-analysis-skill>

## Overview

This skill provides comprehensive architectural analysis capabilities using graph theory and dependency analysis. Load this skill when working on:
- Architectural analysis or design
- Impact assessment before changes
- Multi-service failure debugging
- Coupling and cohesion optimization
- Domain boundary identification

## Architecture CLI

All analysis is performed via the architecture CLI tool located at `./.claude/bin/architecture`.

### Path Specification

All commands accept an optional directory argument to specify where to search for TypeScript files:

```bash
# Default (searches ./src)
architecture analyze

# Custom directory
architecture analyze apps/ui/src

# Current directory
architecture analyze .
```

The default is `./src`. If the specified directory doesn't exist or contains no TypeScript files, the tool will gracefully return an empty graph with an informative message.

### Progressive Disclosure Pattern

The CLI uses progressive disclosure. Run once to discover everything:

```bash
./.claude/bin/architecture analyze
```

This shows:
- Core analysis (locations, edges, warnings, violations)
- Collapsed sections with hints (metrics, domains, advanced)
- Debug section listing all available commands with usage examples

**Expand sections as needed:**
```bash
architecture analyze --metrics    # Show graph metrics
architecture analyze --domains    # Show domain analysis
architecture analyze --advanced   # Show betweenness/clustering
architecture analyze --all        # Show everything
```

**Skill workflow:**
1. Run `architecture analyze` first
2. Read debug section to discover available commands
3. Use specialized commands for specific analysis needs
4. All commands self-document with usage/examples/when-to-use

### Available Commands

#### 1. analyze [--metrics] [--domains] [--advanced] [--all]

Full dependency graph analysis with progressive disclosure. By default shows core analysis with collapsed sections.

**Usage:** `./.claude/bin/architecture analyze [options]`

**Flags:**
- `--metrics`: Expand metrics section (density, diameter, average degree)
- `--domains`: Expand domain analysis section (cut vertices, domain groupings)
- `--advanced`: Expand advanced metrics (betweenness, clustering)
- `--workflows`: Show full workflow details
- `--all`: Expand all sections

**Default Output (collapsed):** Core XML with:
- locations (all services)
- node_classification (leaf/mid/vm categories)
- edges (dependency relationships)
- metrics (collapsed by default, expandable with --metrics)
- advanced_metrics (collapsed by default, expandable with --advanced)
- domains (collapsed by default, expandable with --domains)
- workflows (collapsed by default, expandable with --workflows)
- warnings (architectural smells)
- violations (circular dependencies, etc.)
- debug (always shown - lists all commands with usage/examples)

**When to use:**
- Primary entry point for all architecture analysis
- Discovering available commands (via debug section)
- Quick overview with option to dive deeper
- Self-documenting interface for agents

#### 2. blast-radius <service>

Shows impact analysis for a specific service - what depends on it (downstream) and what it depends on (upstream), grouped by depth level.

**Usage:** `./.claude/bin/architecture blast-radius ServiceName`

**Output:** XML with downstream and upstream dependencies, risk assessment

**When to use:**
- Before making changes to a service (assess impact)
- Understanding coupling of a specific service
- Determining testing scope for changes
- Assessing change risk level

**Risk levels:**
- HIGH: ≥5 downstream dependents (affects many services)
- MEDIUM: 3-4 downstream dependents (moderate impact)
- LOW: <3 downstream dependents (limited impact)

**Interpretation:**
- `depth="1"`: Direct dependents - immediately affected by changes
- `depth="2"`: Two-hop dependents - affected through intermediate services
- `depth≥3`: Deep propagation - changes ripple far through system
- `n` attribute on downstream: Total number of affected services
- `risk` attribute: Automatic assessment based on downstream count

#### 3. common-ancestors <service1> <service2>

Finds shared dependencies across multiple services - essential for root cause analysis when multiple services are failing.

**Usage:** `./.claude/bin/architecture common-ancestors Service1 Service2 Service3`

**Output:** XML with shared dependencies ranked by coverage percentage

**When to use:**
- Multiple services failing simultaneously (root cause analysis)
- Understanding shared infrastructure
- Identifying coupling points between services
- Debugging cascading failures

**Coverage interpretation:**
- 100%: All input services depend on it - primary root cause candidate
- ≥50%: Majority depend on it - secondary candidate
- <50%: Minority depend on it - less likely root cause

#### 4. ancestors <service>

Shows all upstream dependencies (transitive closure) for a single service - everything the service depends on, grouped by depth level.

**Usage:** `./.claude/bin/architecture ancestors ServiceName`

**Output:** XML with upstream dependencies only (no downstream)

**When to use:**
- Understanding what a service depends on
- Identifying deep dependency chains
- Checking for unexpected transitive dependencies
- Planning service isolation or extraction
- Understanding initialization order requirements

**Interpretation:**
- `depth="1"`: Direct dependencies - immediate requirements
- `depth="2"`: Transitive dependencies - required by direct dependencies
- `depth≥3`: Deep dependency chains - may indicate layering issues
- `n` attribute: Total count of all upstream dependencies (transitive closure)

**Comparison with blast-radius:**
- `ancestors`: Shows ONLY upstream (dependencies) - simpler, focused view
- `blast-radius`: Shows BOTH upstream and downstream - comprehensive impact

#### 5. metrics

Shows graph metrics only (no service lists) - quick health check.

**Usage:** `./.claude/bin/architecture metrics`

**Output:** Just the metrics section (density, diameter, average degree)

**When to use:**
- Quick architecture health check
- Tracking metrics over time
- Fast assessment without full analysis overhead

#### 6. domains

Domain discovery via cut vertices (services that bridge separate domains).

**Usage:** `./.claude/bin/architecture domains`

**Output:** XML with identified domains and bridge services

**When to use:**
- Understanding module boundaries
- Planning package/module splits
- Identifying architectural layers
- Finding domain separation points

**Interpretation:**
- **Cut vertices (domain bridges)**: Services that, if removed, would separate the graph into disconnected components
- **Domains**: Clusters of services grouped by connectivity
- Bridges indicate where you could split the codebase into separate packages/modules

#### 7. hot-services

Shows services with ≥4 dependents (high-risk services requiring extra care).

**Usage:** `./.claude/bin/architecture hot-services`

**Output:** List of high-impact services

**When to use:**
- Identifying critical infrastructure
- Prioritizing test coverage
- Finding services that need stability guarantees
- Assessing refactoring risks

**Interpretation:**
- Services with many dependents are high-risk changes
- Require comprehensive test coverage
- Changes should be carefully planned
- Consider interface stability contracts

#### 8. format [--format <type>] [--output <file>] [--show-errors]

Outputs analysis in different formats for various use cases.

**Usage:** `./.claude/bin/architecture format [options]`

**Format Options:**
- `--format mermaid`: Mermaid flowchart syntax (visual dependency graph)
- `--format human`: Human-readable tree structure with redundancy markers
- `--format agent`: XML format (same as analyze command)
- `--format adjacency`: Simple adjacency list with error counts

**Additional Options:**
- `--output <file>`: Write output to file (mermaid format only)
- `--show-errors`: Show detailed error types in adjacency format

**When to use:**
- Mermaid: Generate visual diagrams for documentation/presentations
- Human: Quick readable overview for developers
- Agent: Programmatic parsing (same as analyze)
- Adjacency: Simple list format with runtime error information

**Examples:**
```bash
./.claude/bin/architecture format --format mermaid
./.claude/bin/architecture format --format mermaid --output diagram.mmd
./.claude/bin/architecture format --format human
./.claude/bin/architecture format --format adjacency --show-errors
```

## Metric Interpretation

### Graph Metrics Thresholds

#### Density

Measures: edges / max_possible_edges (how interconnected services are)

**Formula:** `n_edges / (n_nodes * (n_nodes - 1) / 2)`

**Thresholds:**
- **< 0.2: Sparse (excellent)** - Loose coupling, services are independent
- **0.2-0.4: Moderate** - Acceptable coupling level
- **> 0.4: Dense (concerning)** - Tight coupling, refactoring needed
  - Services too interconnected
  - Changes propagate widely
  - High coordination cost
  - Action: Identify domain boundaries, extract interfaces

#### Diameter

Measures: Longest shortest path between any two services

**Meaning:** Maximum dependency chain depth

**Thresholds:**
- **≤ 3: Shallow (excellent)** - Short dependency chains
- **4-5: Moderate** - Acceptable depth
- **> 5: Deep (concerning)** - Long propagation paths
  - Changes take many hops to propagate
  - Difficult to reason about dependencies
  - High coupling risk
  - Action: Flatten chains, use direct dependencies where possible

#### Average Degree

Measures: Mean number of connections per service

**Formula:** `total_edges / n_nodes`

**Thresholds:**
- **< 2: Minimal (excellent)** - Highly decoupled services
- **2-4: Moderate** - Acceptable connection level
- **≥ 4: High (concerning)** - Services too connected
  - Individual services have many dependencies
  - High fan-out or fan-in
  - Potential god services
  - Action: Split services by concern, reduce dependencies

#### Betweenness Centrality

Measures: Proportion of shortest paths that pass through a service

**Meaning:** How often a service mediates between other services

**Thresholds:**
- **> 0.5: God service** - Critical bottleneck
  - Most paths flow through this service
  - Single point of failure
  - High coordination cost
  - Action: Extract services, create facade layer
- **0.3-0.5: Hub service** - Important mediator
  - Many paths use this service
  - Monitor closely
  - Ensure stability
- **< 0.3: Normal service** - Not a bottleneck

#### Clustering Coefficient

Measures: How interconnected a service's dependencies are

**Meaning:** Do the things I depend on also depend on each other?

**Formula:** For service S: `actual_edges_between_neighbors / possible_edges_between_neighbors`

**Thresholds:**
- **> 0.7: Tight cluster** - Dependencies know each other
  - Cohesive domain
  - Could be a module boundary
  - Good if intentional (domain grouping)
  - Bad if unintentional (coupling)
- **0.4-0.7: Moderate clustering**
- **< 0.4: Loose connections** - Dependencies are independent
  - Hub-and-spoke pattern
  - May indicate god service if high degree

### Risk Assessment

#### Blast Radius Risk Levels

Number of services that depend on the target service (directly or indirectly)

**Risk Levels:**
- **≥ 5: HIGH risk**
  - Affects many services
  - Thorough testing required
  - Consider feature flags
  - Coordinate with all dependent teams
  - Test all downstream services
- **3-4: MEDIUM risk**
  - Moderate impact
  - Test affected services
  - Review with dependent service owners
- **< 3: LOW risk**
  - Limited impact
  - Safe to change
  - Standard testing sufficient

#### Depth Analysis

How far changes propagate through dependency chain

**Levels:**
- **Depth 1: Direct dependents only**
  - Impact contained
  - Easiest to test
  - Breaking changes affect visible dependents
- **Depth 2: Two-hop propagation**
  - Moderate spread
  - Test direct and indirect dependents
  - Consider interface stability
- **Depth ≥3: Deep propagation**
  - Changes ripple far
  - Hard to predict full impact
  - Indicates potential architecture smell
  - Consider refactoring to reduce depth

#### Coverage (in common-ancestors)

Percentage of input services that depend on a shared dependency

**Interpretation:**
- **100%: All services depend on it**
  - Primary root cause candidate
  - Investigate first
  - Most likely source of cascading failure
- **≥50%: Majority depend on it**
  - Secondary candidate
  - Investigate if primary candidates cleared
- **<50%: Minority depend on it**
  - Less likely root cause
  - May be coincidental
  - Lower priority investigation

## Architectural Patterns

### Patterns Indicating Issues

#### 1. God Service

**Indicators:**
- Outdegree ≥ 5 (many services depend on it)
- High betweenness centrality (>0.5)
- High average degree (≥4)
- Appears in many blast radius analyses

**Problems:**
- Single point of failure
- Bottleneck for changes
- High coordination cost
- Testing overhead

**Solutions:**
- Extract services by concern
- Split into domain services
- Create facade layer if high fan-out
- Use Layer.provide to compose dependencies
- Consider event-driven communication

#### 2. Tight Coupling

**Indicators:**
- Graph density > 0.4
- Average degree > 4
- Many bidirectional relationships
- High clustering coefficients across board

**Problems:**
- Changes propagate widely
- Hard to reason about dependencies
- High coordination cost
- Difficult to test in isolation

**Solutions:**
- Identify domain boundaries via `domains` command
- Extract shared functionality into separate services
- Use interfaces/contracts at boundaries
- Apply dependency inversion principle
- Consider event-driven architecture

#### 3. Deep Hierarchy

**Indicators:**
- Graph diameter > 5
- Long dependency chains in edges output
- High depth levels in blast-radius

**Problems:**
- Long propagation paths
- Difficult to trace dependencies
- High coupling risk
- Brittle architecture

**Solutions:**
- Flatten dependency chains
- Look for transitive deps that could be direct
- Use Layer.merge for parallel dependencies
- Check for unnecessary intermediate services
- Consider collapsing layers

#### 4. Hub-and-Spoke

**Indicators:**
- High fan-out (many dependents)
- Low clustering coefficient (<0.2)
- Dependencies don't know each other
- Central service with many independent dependents

**Problems:**
- Service may be doing too much
- Potential god service forming
- High blast radius
- Coordination bottleneck

**Solutions:**
- Verify single responsibility
- Consider if service should be multiple services
- Check if hub is just infrastructure (acceptable)
- Extract specialized services if needed

#### 5. Circular Dependencies

**Indicators:**
- Detected in violations section
- Services depend on each other (A→B→A)

**Problems:**
- Cannot reason about initialization order
- Testing becomes difficult
- Tight coupling
- Architectural violation

**Solutions:**
- Break cycles by inverting dependency
- Depend on abstraction instead of concrete service
- Extract shared concerns into separate service
- Use event-based communication
- Introduce dependency injection layer

#### 6. Hot Service (High Risk)

**Indicators:**
- ≥4 dependents (from hot-services command)
- High downstream count in blast-radius
- Appears in many common-ancestors analyses

**Problems:**
- Changes affect many services
- High testing burden
- Stability critical
- Breaking changes expensive

**Solutions:**
- Ensure comprehensive test coverage
- Add integration tests for all dependents
- Consider interface stability guarantees
- Document breaking change process
- Use versioning if appropriate
- Add deprecation warnings before changes

#### 7. Leaf Service with No Dependents

**Indicators:**
- Outdegree = 0 (nothing depends on it)
- Listed in node_classification as leaf
- Not used by any other service

**Problems:**
- Dead code candidate
- May be work-in-progress
- Wasted maintenance

**Solutions:**
- Verify service is actually used (check for dynamic imports)
- Remove if truly dead code
- Document if intentionally unused (future work)

#### 8. Mid Service with Single Dependent

**Indicators:**
- Only one service depends on it
- Acts as unnecessary intermediary

**Problems:**
- Over-abstraction
- Unnecessary layer
- Complexity without benefit

**Solutions:**
- Consider inlining into dependent
- Verify abstraction serves purpose
- Keep only if multiple future dependents expected

## Workflows

Workflows are collapsed by default in the `analyze` command output. Use `--workflows` flag to expand.

**Collapsed format:**
```xml
<workflows>
  <workflow name="Impact Assessment"/>
  <workflow name="Root Cause Analysis"/>
  <workflow name="Architecture Health Check"/>
  <workflow name="Domain Boundary Discovery"/>
  <workflow name="Dependency Analysis"/>
  Include "--workflows" to see all
</workflows>
```

### Workflow 1: Impact Assessment Before Change

**Scenario:** About to modify a service, need to understand impact

**Steps:**

1. Run blast-radius for the service:
   ```bash
   ./.claude/bin/architecture blast-radius ServiceName
   ```

2. Parse XML output:
   - Note `downstream n` and `risk` attributes
   - Count services at each depth level
   - Identify depth of propagation

3. Assess risk:
   - HIGH risk: List all affected services, recommend comprehensive testing
   - MEDIUM risk: Note affected services, recommend focused testing
   - LOW risk: Minimal impact, standard testing sufficient

4. Provide recommendations:
   - List services requiring testing
   - Note depth of impact
   - Suggest coordination needs if HIGH risk
   - Recommend feature flags if very high impact

### Workflow 2: Root Cause Analysis (Multiple Services Failing)

**Scenario:** Several services are broken, need to find root cause

**Steps:**

1. Gather failing service names
2. Run common-ancestors with all failing services:
   ```bash
   ./.claude/bin/architecture common-ancestors Service1 Service2 Service3
   ```

3. Parse XML output:
   - Focus on shared_dependencies section
   - Look for dependencies with coverage="N/N" (100%)
   - Check root_cause_candidates ranking

4. Prioritize investigation:
   - Start with rank 1 candidate (highest coverage)
   - Check if recent changes to candidate service
   - Verify candidate service is working

5. Provide investigation plan:
   - List root cause candidates in priority order
   - Explain coverage percentages
   - Suggest debugging steps for each candidate

### Workflow 3: Architecture Health Check

**Scenario:** Periodic assessment or before major changes

**Steps:**

1. Run full analysis:
   ```bash
   ./.claude/bin/architecture analyze
   ```

2. Extract and assess metrics:
   - Compare density/diameter/avg_degree against thresholds
   - Note any warnings in warnings section
   - Check violations section for hard errors

3. Review advanced metrics:
   - Identify services with high betweenness (god services)
   - Note tight clusters (potential domain boundaries)
   - Check domain bridges

4. Run hot-services to identify critical infrastructure:
   ```bash
   ./.claude/bin/architecture hot-services
   ```

5. Provide summary:
   - Overall health assessment
   - Key issues identified
   - Prioritized recommendations
   - Trend analysis if doing periodic checks

### Workflow 4: Domain Boundary Discovery

**Scenario:** Planning to split codebase into packages/modules

**Steps:**

1. Run domains command:
   ```bash
   ./.claude/bin/architecture domains
   ```

2. Parse domain bridges (cut vertices):
   - These are services that connect separate domains
   - Removing these would split graph into components

3. Identify domain clusters:
   - Services grouped by connectivity
   - High clustering coefficients indicate cohesive domains

4. Run full analysis for context:
   ```bash
   ./.claude/bin/architecture analyze
   ```

5. Recommend package splits:
   - Suggest module boundaries at bridges
   - Group services by domain
   - Note shared infrastructure

### Workflow 5: Dependency Analysis

**Scenario:** Understanding what a service depends on, planning service extraction or isolation

**Steps:**

1. Run ancestors command to see all dependencies:
   ```bash
   ./.claude/bin/architecture ancestors ServiceName
   ```

2. Parse XML output:
   - Note total upstream count
   - Identify direct dependencies (depth 1)
   - Identify transitive dependencies (depth 2+)
   - Check for deep dependency chains (depth >3)

3. Analyze dependency structure:
   - Unexpected dependencies may indicate coupling issues
   - Deep chains may indicate layering problems
   - High count suggests service is complex or doing too much

4. Provide recommendations:
   - List all required services for initialization
   - Identify dependencies that could be removed
   - Suggest refactoring if dependency count is high
   - Note initialization order requirements

## Output Format Guidelines

### For Impact Assessment (Blast Radius)

```
## Blast Radius Analysis: [ServiceName]

**Impact Level:** [HIGH/MEDIUM/LOW] ([N] downstream dependents)

**Affected Services:**
- Depth 1 (direct): [N] services
  - [List services]
- Depth 2 (indirect): [N] services
  - [List services]
[Continue for all depths]

**Risk Assessment:**
[Explain risk level and implications]

**Recommendations:**
1. [Specific action with rationale]
2. [Specific action with rationale]

**Testing Strategy:**
[Describe testing approach based on risk]
```

### For Root Cause Analysis (Common Ancestors)

```
## Root Cause Analysis: [Failing Services]

**Shared Dependencies:** [N] services

**Root Cause Candidates (Priority Order):**
1. **[ServiceName]** ([coverage]% coverage, [risk] risk)
   - [Why this is candidate]
   - [What to check]
   - [How to verify]

2. **[ServiceName]** ([coverage]% coverage, [risk] risk)
   - [Similar breakdown]

**Recommended Action:**
[Specific first step to investigate]
```

### For Health Check (Analyze/Metrics)

```
## Architecture Health Check

**Overall Status:** [Healthy/Concerns/Issues]

**Key Metrics:**
- Density: [value] ([assessment])
- Diameter: [value] ([assessment])
- Average Degree: [value] ([assessment])

**Issues Identified:**
1. [Issue with severity]
   - Severity: [HIGH/MEDIUM/LOW]
   - Impact: [Describe impact]
   - Action: [Recommended action]

2. [Continue for all issues]

**Recommendations:**
1. [Prioritized recommendation]
2. [Prioritized recommendation]

[Optional: Trend analysis if applicable]
```

### For Domain Analysis

```
## Domain Boundary Analysis

**Identified Domains:**
1. **[Domain Name]** ([description])
   - [Services in domain]
   - Bridge: [Bridge service]

2. [Continue for all domains]

**Recommended Package Structure:**
[Proposed package layout]

**Migration Strategy:**
[Ordered steps to split codebase]
```

### General Principles

- Lead with summary and key findings
- Cite specific metrics and XML output
- Provide actionable recommendations
- Prioritize actions by impact/risk
- Include rationale for each recommendation
- Use service names from actual analysis
- Reference specific metric values

## Laws

evidence-based := ∀claim: cite(xml-output) ∨ cite(metric)
  -- All claims must reference specific analysis output
  -- Never make assertions about architecture without data
  -- Always quote relevant XML sections or metric values

run-analysis-first := ∀question: execute-command → parse → interpret
  -- Always run appropriate architecture command before answering
  -- Parse XML output completely before reasoning
  -- Never answer based on assumptions

parse-xml := ∀command-output: extract-attributes → extract-content → reason
  -- Parse XML structure carefully (attributes and content)
  -- Extract all relevant information before interpreting
  -- Note n attributes, risk levels, coverage percentages

no-assumption := ∀dependency: verified(via-analysis) ∨ ¬claimed
  -- Never assume service relationships without checking
  -- Run common-ancestors or analyze to verify relationships
  -- If uncertain, run command to check

xml-to-insight := command → xml → metrics → patterns → recommendations
  -- Transform raw data into actionable insights
  -- Identify patterns (god service, tight coupling, etc.)
  -- Provide specific, prioritized recommendations
  -- Reference thresholds and risk levels

complete-context := ∀analysis: sufficient-data ∨ run-additional-commands
  -- If one command insufficient, run additional commands
  -- Combine analyze + blast-radius for full picture
  -- Use multiple commands to triangulate issues

concrete-recommendations := ∀recommendation: actionable ∧ specific ∧ prioritized
  -- Every recommendation must be actionable (not vague)
  -- Specify which services, which changes, which order
  -- Prioritize by impact and effort
  -- Explain rationale grounded in metrics

</architecture-analysis-skill>
