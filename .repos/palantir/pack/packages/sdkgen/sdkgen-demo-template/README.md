# @palantir/pack.sdkgen.demo-template

Demo template for the sdkgen CLI showcasing template capabilities with a simple "Hello World" SDK generator.

## Overview

This template serves as a demonstration and testing example for the sdkgen CLI system. It generates a simple "Hello World" SDK package with TypeScript configuration, showing how templates can prompt for user input, process EJS templates, and run generation hooks.

## Features Demonstrated

This template should exercise all features of sdkgen for thorough testing.

- **User Prompts** - Interactive prompts for greeting, author, and license
- **Template Processing** - EJS template files with variable substitution
- **Hook System** - Pre/post generation hooks for custom logic
- **Schema Transformation** - Custom schema transformer for processing input schemas
- **File Handling** - Mix of template and static file processing

## Template Configuration

The template includes:

### Prompts

- `greeting` - Custom greeting message (default: "Hello, World!")
- `author` - Author name (default: "SDK Generator")
- `license` - License type (default: "MIT")

### File Processing

- `**/*.ejs` - Processed as EJS templates with variable substitution
- `_gitignore` - Copied as static file (becomes `.gitignore`)

### Hooks

- `beforeGenerate` - Pre-generation setup and validation
- `afterGenerate` - Post-generation finalization (creates test files, tsconfig.json)

### Schema Transformer

- `default` - Transforms input schemas for template consumption

## Usage

```bash
# Generate a new SDK using this demo template
npx @palantir/pack.sdkgen create my-demo-sdk \
  --template @palantir/pack.sdkgen.demo-template \
  --schema ./my-schema.json

# The template will prompt for:
# - What greeting would you like to use? (Hello, World!)
# - Author name? (SDK Generator)
# - License? (MIT)
```

## Generated Structure

The template creates:

```
my-demo-sdk/
├── src/
│   ├── index.ts          # Main SDK entry point
│   └── helloWorld.ts     # Hello World class with schema integration
├── tests/
│   └── helloWorld.test.ts # Generated test file
├── package.json          # Package configuration with user inputs
├── tsconfig.json         # TypeScript configuration
└── .gitignore           # Git ignore rules
```
