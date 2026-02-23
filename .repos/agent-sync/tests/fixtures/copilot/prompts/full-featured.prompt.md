---
description: 'Generate comprehensive unit tests'
name: 'generate-tests'
argument-hint: 'file path or code selection'
agent: 'edit'
model: 'gpt-4o'
tools:
  - 'githubRepo'
  - 'search/codebase'
---

# Unit Test Generation

Generate comprehensive unit tests for: ${selection}

## Requirements

1. Use the testing framework from ${workspaceFolder}/package.json
2. Follow patterns in existing tests: #tool:search/codebase
3. Include edge cases and error scenarios
4. Add descriptive test names

## Context

- File: ${file}
- Project: ${workspaceFolderBasename}

## Coverage Goals

Aim for ${input:coverage:Target coverage percentage (e.g., 80%)} coverage.
