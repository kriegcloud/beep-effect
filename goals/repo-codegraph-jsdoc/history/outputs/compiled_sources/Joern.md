# Joern

Source: https://docs.joern.io/

## [Joern Documentation](/)

[Installation](/installation/)

[Quickstart](/quickstart/)

[Code Property Graph](/code-property-graph/)

[Traversal Basics](/traversal-basics/)

[Syntax-Tree Queries](/c-syntaxtree/)

[Workspace](/organizing-projects/)

[Interactive Shell](/shell/)

[Interpreter](/interpreter/)

[Exporting Graphs](/export/)

[Joern Scan](/scan/)

[CPG Slicing](/cpg-slicing/)

[Server](/server/)

[Developing Plugins](/extensions/)

[Common Issues](/common-issues/)

[Glossary](/glossary/)

[Frontends](/frontends/)

- [X2CPG](/frontends/x2cpg/)
- [Java](/frontends/java/)
- [JavaScript](/frontends/javascript/)
- [Python](/frontends/python/)

## CPGQL Reference

- [Augmentation Directives](/cpgql/augmentation-directives/)
- [Calls](/cpgql/calls/)
- [Complex Steps](/cpgql/complex-steps/)
- [Control-Flow Steps](/cpgql/control-flow-steps/)
- [Core Steps](/cpgql/core-steps/)
- [Custom Defined Steps](/cpgql/custom-defined-steps/)
- [Data-Flow Steps](/cpgql/data-flow-steps/)
- [Execution Directives](/cpgql/execution-directives/)
- [Filter Steps](/cpgql/filter-steps/)
- [Help Directive](/cpgql/help-directive/)
- [Node-Type Steps](/cpgql/node-type-steps/)
- [Reference Card](/cpgql/reference-card/)
- [Repeat Steps](/cpgql/repeat-steps/)

[Custom Data-Flow Semantics](/dataflow-semantics/)

[Upgrade Guide](/upgrade-guides/)

## Developer Guide

- [Contributing to Joern](/developer-guide/contribution-guidelines/)
- [Learning Scala](/developer-guide/learning-scala/)
- [Setting Up Your IDE](/developer-guide/ide-setup/)
- [Creating a Custom Static Analysis with Joern](/developer-guide/custom-tool/)

![Menu](/svg/menu.svg) **Overview** ![Table of Contents](/svg/toc.svg)

- [Supported languages](#supported-languages)
- [Core features](#core-features)

Welcome to the documentation of the code analysis platform Joern! For a high-level overview, please also check out  .

Joern is a platform for robust analysis of source code, bytecode, and binary code. It generates code property graphs, a graph representation of code for cross-language code analysis. Code property graphs are stored in a custom graph database. This allows code to be mined using search queries formulated in a Scala-based domain-specific query language. Joern is developed with the goal of providing a useful tool for vulnerability discovery and research in static program analysis.

## Supported languages [\#](#supported-languages)

| Name         | Built with   | Maturity   |
|--------------|--------------|------------|
| C/C++        | Eclipse CDT  | Very High  |
| Java         | JavaParser   | Very High  |
| JavaScript   | GraalVM      | High       |
| Python       | JavaCC       | High       |
| x86/x64      | Ghidra       | High       |
| JVM Bytecode | Soot         | Medium     |
| Kotlin       | IntelliJ PSI | Medium     |
| PHP          | PHP-Parser   | Medium     |
| Go           | go.parser    | Medium     |
| Ruby         | ANTLR        | Medium-Low |
| Swift        | SwiftSyntax  | Medium     |
| C#           | Roslyn       | Medium-Low |

## Core features [\#](#core-features)

## The core features of Joern are:

- **Robust parsing.** Joern allows importing code even if a working build environment cannot be supplied or parts of the code are missing.

- **Code Property Graphs.** Joern creates semantic code property graphs from the fuzzy parser output and stores them in an in-memory graph database. SCPGs are a language-agnostic intermediate representation of code designed for query-based code analysis.

- **Taint Analysis.** Joern provides a taint-analysis engine that allows the propagation of attacker-controlled data in the code to be analyzed statically.

- **Search Queries.** Joern offers a strongly-typed Scala-based extensible query language for code analysis based on Gremlin-Scala. This language can be used to manually formulate search queries for vulnerabilities as well as automatically infer them using machine learning techniques.

- **Extendable via CPG passes.** Code property graphs are multi-layered, offering information about code on different levels of abstraction. Joern comes with many default passes, but also allows users to add passes to include additional information in the graph, and extend the query language accordingly.

- [Supported languages](#supported-languages)
- [Core features](#core-features)
