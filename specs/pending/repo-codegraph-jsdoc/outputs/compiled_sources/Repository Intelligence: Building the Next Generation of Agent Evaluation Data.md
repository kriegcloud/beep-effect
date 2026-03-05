# Repository Intelligence: Building the Next Generation of Agent Evaluation Data

Source: https://potpie.ai/blog/the-agent-evaluation-gap

## Deeptendu

## Feb 27, 2026

## Introduction: The Agent Evaluation Gap

While standard Large Language Model benchmarks like HumanEval or MBPP provided early baselines, production deployment of software engineering agents has exposed a persistent realism gap in evaluation. Research by Jimenez et al. demonstrates that resolving real-world GitHub issues requires fundamentally different capabilities than traditional coding benchmarks test, with even state-of-the-art models achieving only 1.96% accuracy on repository-level tasks without specialized agent scaffolding.

As of early 2026, the community has pivoted toward more rigorous, repository-level frameworks. The release of SWE-Bench+ and the Unified Software Engineering Benchmark (USEbench) highlight that agents often struggle with Repository Intelligence: the ability to understand not just isolated lines of code, but the temporal history and complex inter-dependencies of a codebase. Even high-performing agents on the SWE-bench Verified leaderboard frequently fail when faced with the mutation-based realism, coding standards and underspecified queries characteristic of actual developer workflows.

Success in these environments depends on an agent's ability to navigate cross-file dependencies, adhere to project-specific architectural patterns, and maintain state across long-running trajectories. At Potpie, our objective was to establish a systematic testing framework that accurately quantifies an agent's utility at the repository level. We required evaluation data that challenged three distinct cognitive functions:

-   QA Agent: Retrieval-based reasoning over deep dependency graphs.

-   CodeGen Agent: Context-aware synthesis that integrates with existing project types and utilities.

-   Debugger Agent: Fault localization and "fail-to-pass" trajectory resolution as seen in the GitTaskBench framework.

To build a reliable evaluation suite, we had to move beyond static snippets to create a dynamic data pipeline that mirrors the complexity of production software. This article outlines the technical methodologies we employed to automate the creation of this testing data, the failures we encountered with early synthetic approaches, and the refined architecture we currently use to benchmark our agentic workflows.

Why Open Datasets didn’t work for us

The initial phase of our evaluation strategy involved auditing existing open-source benchmarks. However, we found that most were insufficient for testing repository-level agents due to four primary technical failures: data contamination, lack of execution-based verification, the absence of cross-file context, and a lack of trajectory data.

The most significant hurdle is benchmark leakage. Standard datasets like HumanEval and MBPP have existed for years; their solutions are extensively present in the training corpora of modern LLMs. Research from the Epoch AI suggests that high performance on these benchmarks often correlates more with memorization than with genuine reasoning. For agents designed to solve novel engineering problems, a dataset where the model already knows the answer is scientifically useless. Li et al. further validate this through DevEval, a benchmark of 1,874 real-world repository tasks, where even GPT-4-turbo achieves only 53% Pass@1—highlighting the vast gap between synthetic benchmarks and production codebases.

Open datasets typically focus on atomic functions. For example, a prompt might ask an agent to "implement a function that reverses a linked list." In a production environment, an engineer rarely works in such isolation. Evidence from SWE-Bench+ shows that agents which score 90%+ on isolated coding tasks often drop to sub 20% when the solution requires cross-file reasoning. This gap is further emphasized by Xia et al., who demonstrate that a simple three-phase debugging process (localization, repair, validation) without complex tool integrations achieves 32% on SWE-bench Lite, outperforming sophisticated agentic approaches at a fraction of the cost ($0.70 per bug). Real repository-level tasks demand:

-   Dependency Awareness: Understanding how changing a utility function in lib/utils.py breaks a schema validation in api/routes.py.

-   Architectural Adherence: Following specific patterns (e.g., dependency injection or logging wrappers) that are unique to that codebase.

-   Environmental Parity: Most open datasets lack a containerized execution environment. Without the ability to run pytest or npm test against the agent's changes, the "Ground Truth" remains theoretical rather than functional.

Open datasets often provide gold-standard prompts that are too clean. In practice, developer issues are messy, underspecified, or even contradictory. USEbench identified that agents fail most frequently when they have to infer intent from an ambiguous bug report, a scenario that HumanEval-style benchmarks ignore.

To improve our agents, we didn't just need to know if they failed but how they failed. Existing datasets provided static Input/Output pairs but lacked the intermediate trajectories. The trajectories contain a sequence of terminal commands, file reads, and edits an agent performs. Without this data, we could not perform the fine-grained error analysis necessary to iterate on our CodeGen, and Debugger agents.

This forced us to conclude that for Potpie's specific needs, we had to move from relying on open datasets to generating them via a purpose-built synthetic pipeline.

## Repo Selection

To ensure our synthetic data retained the entropy and structural complexity of production software, we curated a diverse set of high-scale open-source repositories. The selection was based on four criteria: linguistic diversity, architectural complexity, presence of external service integrations, and the use of non-trivial design patterns.

## Our evaluation suite utilizes the following core repositories:

-   VS Code (TypeScript/C++): Provides a massive monorepo environment with complex event loops, asynchronous IPC, and strict architectural boundaries.

-   Apache Airflow (Python): Offers a multi-service distributed system context, involving complex workflow DAGs, database migrations, and integration with a vast ecosystem of third-party operators.

-   Mattermost (Go/React): A classic client-server architecture with high-concurrency requirements and complex state synchronization between the backend and the frontend.

-   Supabase (PostgreSQL/TypeScript/Go): Tests the agent's ability to reason across database schemas, real-time engines, and infrastructure-as-code patterns.

-   Tinygrad (Python/C): A minimalist yet mathematically dense deep-learning framework that challenges the agent's understanding of low-level optimization, compiler backends, and tensor abstractions.

By utilizing this diverse selection of projects, we ensured that our agents moved beyond language-specific optimizations toward a broader Repository Intelligence capable of navigating heterogeneous service boundaries and intricate dependency structures.

## QA Agent: Multi-hop Retrieval & Graph Analysis

The QA Agent is designed to function as a deep-reasoning interface for the entire codebase. Unlike standard documentation search or symbol lookup tools, this agent must reconcile high-level architectural intent with granular implementation details across heterogeneous modules.

Our primary goal in building these evaluations was to move beyond single-shot queries. We specifically sought to eliminate cases where an agent could provide a correct answer through simple keyword matching, pattern recognition, or memorized documentation from its training set. To achieve this, we explicitly disregarded several standard techniques:

-   Vector DB Similarity Search Checks: We ignored simple retrieval tasks where the query closely matched a chunk of code. These tasks only test the embedding model's quality, not the agent's ability to reason about the code's logic or state.

-   Symbol Definition Lookup: We avoided questions that could be answered by a simple LSP-style "Go to Definition.". Static analysis tools already solve this; we wanted to test the agent's ability to understand the semantics of the symbol's usage across call sites.

-   Standard Boilerplate Identification: We disregarded questions about common framework structures (e.g., "Where are the routes defined in this Express app?"). High-frequency patterns are overrepresented in LLM training data, leading to inflated scores through memory rather than active code comprehension.

## During our iterations, certain techniques that theoretically seemed robust produced poor evaluation results:

-   Auto-generated Javadoc/Docstring Summarization: We attempted to feed a model all project docstrings and ask it to generate summaries. Counterintuitively, this made the evaluations easier for agents. The summaries acted as cheatsheets that bypassed the need for the agent to read the actual source code, resulting in high scores that collapsed when the summaries were removed.

-   Cyclomatic Complexity-based Sampling: We tried targeting the most "complex" functions based on cyclomatic complexity metrics. While these functions were hard to read, they were often self-contained (e.g., a massive switch statement). They did not challenge the agent's ability to navigate relationships between files, which is where agents actually struggle.

-   Random Walk Graph Traversal: We tried generating questions by randomly traversing the dependency graph. This produced "hallucinated connections." Without anchoring the traversal in a functional logic flow (like a specific user request path), the questions became nonsensical or asked about dependencies that were technically present but logically irrelevant to the system's runtime behavior.

While our initial version of QA pairs generation relied heavily on static AST-based dependency mapping, we pivoted toward a more dynamic, agent-centric discovery model to capture the true complexity of modern software architectures.

The foundation of our analysis remains the extraction of the Abstract Syntax Tree (AST) to construct a global dependency graph. This provides the structural skeleton of the repository, mapping function calls, type inheritances, and service injections. However, static analysis alone often fails to highlight the hot paths or logical bottlenecks that define runtime behaviour. Recent work by Ouyang et al. demonstrates that repository-level code graphs significantly enhance agent performance, achieving new state-of-the-art results among open-source frameworks on SWE-bench through structured navigation of cross-file dependencies. Similarly, DraCo uses dataflow-guided retrieval augmentation to help LLMs identify relevant code entities across different files, addressing the fundamental challenge that agents struggle most not with reading individual functions, but with understanding relationships between files.

To overcome the limitations of static mapping, we integrated specialized services like Zread and DeepWiki to perform deep contextual reads of the repository, identifying areas with high logical density and interdependent service boundaries that are often missed by standard parsers. This approach aligns with CodeNav, which demonstrates that agents can effectively navigate and leverage previously unseen codebases through automatic indexing and iterative code search without manual tool registration. We use Model Context Protocols (MCPs — standardized interfaces for model-tool interaction) to generate a list of critical bottleneck modules and what are the suggested topics for this module and its interactions. Once these critical bottlenecks have been identified, we employ a multi-stage generation process:

## 1 Primary Generation: A teacher model generates raw questions based on the identified bottleneck logic.

## 2 Question Layering: We layer these questions by introducing additional constraints or requiring information from distant modules. This ensures the answer is not contained within a single context window but is distributed across the repository's architecture.

## 3 Deduplication: The final stage of the generation pipeline involves a rigorous deduplication pass. We filter the candidate list to remove redundant queries, ensuring that every question in the evaluation set targets a unique logic path or architectural intersection.

To maintain the Golden Set integrity (human-verified ground truth data used as the definitive correct answer), every generated QA pair undergoes a two-step validation process before ingestion:

## 1 Graph Path Verification: A validator script ensures that the files referenced in the correct answer are indeed connected via the AST-extracted dependency graph.

## 2 Ambiguity Heuristics: If a query could be interpreted in multiple ways based on available symbols, the system mandates further specificity in the prompt.

## CodeGen Agent: Integration Fidelity and Multi-Stage Filtering

The evaluation of Code Generation (CodeGen) agents centers on Integration Fidelity, which we define as the agent's capacity to synthesize new functional logic while strictly adhering to project-specific abstractions, internal APIs, and architectural constraints. Achieving this benchmark requires a comprehensive assessment of how generated code integrates within a dense dependency graph. Recent work by Pan et al. introduces SWE-Gym, the first environment for training real-world software engineering agents with 2,438 Python task instances, demonstrating that fine-tuning on repository-level tasks achieves up to 19% absolute performance gains, validating our approach of mining actual GitHub PRs rather than using synthetic function-level benchmarks.

Our evaluation data is curated using an automated agentic pipeline designed to mine high-quality Pull Requests (PRs) from popular open source and open license GitHub repositories. To isolate instances representing substantial engineering effort, we apply a multi-stage filtering process. Initially, unsuitable candidates are pruned based on repository activity, PR metadata and the complexity of code differences. Next, heuristic checks are applied to assess the commit's intended purpose, the sentiment expressed by reviewers, and the presence of technical debt. This is followed by an Oracle Agent (a higher-capability model used as a ground-truth reference validator) and Reviewer agents working to confirm the canonical implementation's validity and the fairness of the associated tests. The final stage is an expert review dedicated to ensuring a precise semantic alignment between the initial prompt and the delivered code solution.

## The initial step looks like this:

-   Review-Density and Peer Scrutiny: We prioritize PRs that have undergone significant human review, specifically filtering for those with a minimum of ten independent comments or reviews. This metric ensures that the implementation has survived rigorous debate and follows the project's consensus on code quality.

-   Architectural Breadth: To guarantee cross-module complexity, we select only those PRs that necessitate changes across multiple files or service boundaries. This prevents the evaluation from devolving into trivial single-file synthesis tasks.

-   Goldilocks Diff Sizing: We filter for a balanced diff size neither too small (lacking context) nor too large (exceeding context windows). PRs that are too small lack sufficient context for testing repository intelligence, while sprawling refactors exceeding several thousand lines are often too large for current context windows and lack the targeted feature-focus required for specific evaluation. In the end we settled around 300-1500 line PR changes.

-   Metadata and Spec Integrity: We mandate that each PR be linked to a structured Issue containing a detailed What and Why description. This provides the agent with a realistic starting point: a feature request or issue report without leaking the implementation details.

-   Temporal Stability and Commit Auditing: We perform a post-merge audit of the repository's history. If the target lines were fundamentally refactored or reverted shortly after merging, the PR is discarded. This ensures that our golden truth remains stable and represents code that successfully entered production.

We pass these candidate PRs to an agentic pipeline that helps us filter nuances like intent and tech debit which are  invisible to static metrics. During Intent Classification, we leverage models to differentiate between targeted feature additions, bug fixes, and sprawling refactors, explicitly prioritizing features that introduce novel logic within established service boundaries. Simultaneously, we perform Sentiment and Debt Detection by parsing the entire review thread. This allows us to detect hidden contexts such as reviewers noting that a merge is a temporary hack or identifying edge cases that were intentionally deferred. By quantifying this Implementation Debt, we can weigh the actual difficulty of the task and disqualify PRs that represent incomplete or sub-optimal solutions, thereby ensuring our ground truth is representative of canonical engineering standards.

## To ensure the Golden Truth is optimal, we utilize a two-agent verification system:

-   Oracle Agent: A superior model (GPT-5.2) reviews the human implementation against the PR description and repository structure and patterns to identify if the code is the canonical way of solving the problem within the project's specific idioms. This serves as our ground-truth validator — following the ML convention where an "oracle" provides the definitive reference answer.

-   Constraint Critic Agent: This agent audits the associated test harness. Its primary role is to identify and strip away overspecified constraints such as rigid mock expectations or arbitrary implementation-specific assertions that might lead the evaluation system to reject a functionally sound and logically correct alternative. This mitigates the risk of false negatives, such as the previously mentioned Django fail cases, where valid reasoning is penalized by brittle testing infrastructure.

-   Review Agent: We use this agent to review if the code is following the code best practices and doesn’t have any code vulnerabilities. This agent has the ability to look into the future commits, PRs and discussions associated with this diff to make well informed decisions about the quality of the code.

    Throughout our data generation process, we intentionally disregarded Isolated Function Synthesis and Template-Based Generation, as these modalities obscure an agent's propensity for architectural errors and dependency hallucinations. A common failure mode we identified was the standard library trap, which occurs when agents produce syntactically correct code using generic libraries (e.g., requests) in environments that strictly mandate custom internal wrappers. Additionally, to prevent trivializing the task through context leakage, we systematically mask project titles, PR identifiers, and specific naming conventions within the synthesized prompts, forcing the agent to rely on active code discovery rather than pattern memory.

## Debugger Agent: Fault Localization and Trajectory Evaluation

The Debugger Agent is designed to operate in the high-entropy environment of production failures, where the path from symptom to solution is rarely linear. Unlike QA agents that query static knowledge or CodeGen agents that synthesize new functionality, the Debugger must navigate through ambiguous error signals, incomplete context, and cascading failures to identify the minimal viable fix. This challenge of autonomous program repair has gained significant research attention, with Bouzenia et al. introducing RepairAgent: the first autonomous LLM-based repair system that interleaves bug information gathering with validation, successfully repairing 164 bugs on Defects4J at a cost of only 14 cents per bug using GPT-3.5.

Our primary goal in building these evaluations was to move beyond simplistic "spot the typo" tasks. We specifically sought to eliminate cases where an agent could succeed through shallow pattern matching or trivial syntax correction. To achieve this, we explicitly disregarded several standard techniques:

-   Static Bug Injection: We avoided artificially injecting bugs (e.g., swapping operators, deleting lines) into existing code. While easy to generate, these synthetic bugs lack the contextual complexity of real failures—the subtle interaction between multiple modules, the race condition that only manifests under specific load, or the configuration drift that breaks assumptions three levels deep in the call stack.

-   Single-File Debugging Scenarios: We disregarded test cases confined to a single file or function. In production, bugs rarely respect file boundaries. A null pointer in the API layer might originate from a schema validation issue in the models, which traces back to a migration change in the database layer. Isolated debugging tests create a false sense of capability.

-   Error-Only Evaluation: We rejected evaluations that only provided stack traces without the surrounding context. Real debugging requires understanding the environment state: recent deployments, configuration changes, dependency versions, and system logs. Agents need to reason about why the code reached a failure state, not just where.

## During our iterations, certain techniques that theoretically seemed robust produced poor evaluation results:

    -   Commit-Message-Based Bug Classification: We initially attempted to categorize bugs using the commit messages from fix commits (e.g., "fix race condition," "patch memory leak"). Counterintuitively, this introduced significant bias. Developers often mischaracterize bugs—what they call a "quick fix" might involve deep architectural changes, while a "major refactor" might just be renaming variables. Relying on subjective human descriptions led to inconsistent difficulty distributions.

    -   Test-Delta-Based Ground Truth: We tried using the test files modified in a fix commit as the definitive oracle for what needed to change. However, we discovered that many PRs include tangential test updates, adding coverage for unrelated features, updating mocks to match new interfaces, or refactoring test utilities. This noise made it impossible to isolate the specific behavioural change that constituted the actual bug fix.

    -   Silent Failure Inclusion: We experimented with including silent bugs, issues that didn't produce explicit errors but caused incorrect behaviour (e.g., off-by-one errors in pagination, incorrect currency conversions). These proved impossible to evaluate reliably. Without a clear failure signal, we couldn't verify that the Debugger Agent had actually identified the root cause versus making an unrelated change that happened to pass the tests.

While our initial version relied on simple git-diff analysis to identify bug-fix commits, we pivoted toward a more rigorous, execution-based validation model that treats historical commits as reproducible forensic evidence.

The foundation of our pipeline is the Fail-to-Pass commit pattern: a well-established concept in automated program repair where a commit transitions the codebase from a failing test state to a passing one. This approach aligns with AutoCodeRover, which demonstrated at NeurIPS 2024 that AST-based context retrieval followed by patch generation effectively resolves GitHub-scale issues through structured program analysis. However, simply identifying these commits is insufficient. We simulate the high-entropy state of real production failures through a rigorous operational sequence:

## 1 Temporal Reversion: We rewind the repository to the HEAD~1 state—the exact moment the bug existed but before the fix was applied. This captures the authentic failure environment, including dependency versions, configuration files, and build tools as they existed at that point in time.

## 2 Environment Reconstruction: We instantiate a containerized sandbox using repository-native lockfiles (package-lock.json, poetry.lock, Cargo.lock) and Docker configurations from that historical moment. This ensures environmental parity—evaluating the agent against the same OS, compiler, and dependency tree that the original developers faced.

## 3 Loud Failure Verification: We execute the regression test suite to verify that the bug produces a "Loud Failure": a verifiable error characterized by non-zero exit codes, explicit exception messages, or clear stderr stack traces. Silent failures (tests that pass but check wrong assertions, or behavioural bugs without error signals) are discarded. This constraint ensures we can objectively verify when the Debugger Agent has successfully identified and resolved the issue.

## 4 Sensory Input Extraction: We serialize the complete failure context—terminal output, build logs, environment variables, recent git history, and the failing test specifications—to serve as the initial state for the Debugger Agent. This mimics the information asymmetry real developers face: error signals without immediate clarity on root cause.

## Once we've extracted valid candidates, we subject them to Multi-Stage Automated Quality Control:

-   LLM Root Cause Analysis (RCA): An LLM agent classifies the bug type, differentiating between surface-level issues (syntax errors, missing imports) and deep logical flaws (race conditions, algorithmic errors, architectural mismatches). This ensures our evaluation set spans the full spectrum of debugging difficulty.

-   Reviewer Sentiment Audit: We parse the original PR conversation to detect contextual signals. Comments indicating "this is a temporary hack," "we should refactor this later," or security concerns trigger disqualification. We only accept fixes that represent canonical, production-ready solutions.

-   Oracle-Level Solution Validation: An Oracle Agent evaluates whether a proposed fix trajectory is semantically equivalent to the human-verified solution. This checks that the agent isn't just making the tests pass through arbitrary changes, but is actually addressing the root cause in a way that aligns with the codebase's architectural patterns.

-   Human-in-the-Loop (Final Verification): Human experts review the synthesized bug report to ensure it's clear enough for a human developer to solve. This validates that the test is technically fair and the failure signal provides sufficient information for root cause identification.

## Our evaluation metric, Trajectory Success Rate (TSR), acknowledges that successful debugging is multidimensional:

## The Automated Validation Layer

To trust our synthetic pipeline, we implemented an automated validation layer that acts as a gatekeeper before any evaluation instance enters the Golden Set. This layer performs three critical checks:

Semantic Parity: Using cross-model consensus, we verify that the generated User Query logically leads to the Ground Truth code. If two independent models (e.g., Opus 4.5 and GPT-5.2) cannot reach the same conclusion, the instance is flagged for human review.

Environment Health Check: Before an agent is tested, a pre-flight  script executes in the Dockerized sandbox to ensure all dependencies are resolved and the "Loud Failure" is indeed reproducible.

Prompt Leakage Scan: We run a specific pass to ensure the prompt does not contain leakage identifiers, file paths, or function names that effectively give away the solution.

## Current Status and Future Roadmap

The pipeline is currently 70% automated. We trigger Data Mining sprints monthly to refresh the Golden Set, ensuring our agents are tested against the latest patterns in our core repositories.

Looking forward, we are integrating Self-Play Reinforcement Learning, where agents generate increasingly difficult test cases for one another, creating an adversarial loop that continuously raises the ceiling for Repository Intelligence. Recent breakthrough work by Wei et al. from Meta FAIR introduces Self-play SWE-RL (SSR), demonstrating that agents can generate training data through adversarial self-play without human curation, training software engineering agents to super intelligent levels by having them compete to generate and solve increasingly complex repository-level tasks. This aligns with our vision of a continuously evolving evaluation framework where the difficulty adapts to agent capabilities.
