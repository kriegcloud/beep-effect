# Rubrics

## Global Quality Rubric

### 1. Source Fidelity
- 0: Unverified assumptions.
- 1: Partial source references.
- 2: All major decisions trace to local source files.
- 3: Every parity-sensitive decision cites upstream + local evidence.

### 2. Type Fidelity
- 0: Simplified away critical generic behavior.
- 1: Some heavy generics preserved, some drift.
- 2: Heavy generics preserved for key modules.
- 3: High-fidelity parity for core generic contracts.

### 3. Schema Quality
- 0: Missing runtime schemas for data-bearing contracts.
- 1: Incomplete tagged unions/recursion.
- 2: Data-bearing schemas complete with decode/encode behavior.
- 3: Complete schemas plus discriminator and recursion verification tests.

### 4. API Compatibility
- 0: Major export surface drift.
- 1: Partial parity but missing key modules.
- 2: Stable parity complete with documented intentional differences.
- 3: Stable + unstable parity complete with alias compatibility.

### 5. Repository Compliance
- 0: Violates codebase laws.
- 1: Minor policy deviations.
- 2: Full law compliance except documented pre-existing blockers.
- 3: Full law compliance with successful checks and docs.

## Phase Exit Rubric

### P0
- Baseline matrix complete.
- Missing/stub counts verified.
- Dependency order frozen.

### P1
- `TBD=0` across contract docs.
- Contracts frozen for recursion/discriminants/errors/exports.

### P2
- Foundation modules compile.
- No unresolved recursion blockers.

### P3
- Core SCC compiles.
- Core type fixtures pass.

### P4
- Aggregate stack compiles end-to-end.
- GroupBy + WhereClause type checks pass.

### P5
- ObjectSet + OsdkObjectFrom heavy scenarios compile.
- Actions/queries contracts compile.

### P6
- Stable export parity matrix complete.
- Unstable export parity matrix complete.
- Alias compatibility matrix complete.

### P7
- Required command suite executed.
- Runtime and type parity scenarios verified.
- Open risks documented with concrete evidence.
