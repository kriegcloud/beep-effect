# @palantir/pack.sdkgen

A flexible CLI tool for generating TypeScript/JavaScript SDKs from schema definitions using customizable templates. The intention is for this to remain generic and not pack-specific,
the pack-specific parts are up to the template scripts that are used!

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Usage](#usage)
- [Creating Templates](#creating-templates)
- [CLI Development Guide](#cli-development-guide)
- [API Reference](#api-reference)
- [Examples](#examples)

## Overview

`@palantir/pack.sdkgen` is a scaffolding tool that generates SDK packages from schema files using pluggable templates. Similar to `create-react-app`, it allows you to:

- Transform schema definitions into fully-configured SDK projects
- Customize generation through configuration and hooks
- Apply template substitutions and run initialization scripts

## Usage

### Basic Usage

```bash
# Create a new SDK using the default template
npx @palantir/pack.sdkgen create my-sdk --schema ./my-schema.json

# Use a specific template
npx @palantir/pack.sdkgen create my-sdk \
  --template @myorg/custom-template \
  --schema ./my-schema.json

# Use a local template
npx @palantir/pack.sdkgen create my-sdk \
  --template ./path/to/template \
  --schema ./my-schema.yaml

# Skip dependency installation
npx @palantir/pack.sdkgen create my-sdk \
  --schema ./my-schema.json \
  --skip-install
```

### Available Commands

```
Usage: sdkgen [options] [command]

Generate TypeScript/JavaScript SDKs from schema definitions

Options:
  -V, --version                    output the version number
  -h, --help                       display help for command

Commands:
  create [options] <project-name>  Create a new SDK project
  help [command]                   display help for command
```

### Create Command Options

```
Usage: sdkgen create [options] <project-name>

Create a new SDK project

Options:
  -t, --template <template>      template to use (default: "default")
  -s, --schema <path>            path to schema file
  --skip-install                 skip dependency installation
  --verbose                      enable verbose logging
  --dry-run                      preview without writing files
  --non-interactive              run in non-interactive mode using defaults
  --config <path>                path to JSON config file with template configuration
  --overwrite                    overwrite existing directory
  -h, --help                     display help for command
```

## Creating Templates

Templates are npm packages or local directories with a specific structure that defines how to generate SDK code.

### Template Structure

```
my-sdk-template/
├── package.json           # Template package metadata
├── template.config.js     # Template configuration
├── template/              # File templates
│   ├── package.json.ejs
│   ├── src/
│   │   ├── index.ts.ejs
│   │   └── types.ts.ejs
│   ├── README.md.ejs
│   └── .gitignore
├── scripts/               # Hook scripts
│   ├── pre-generate.js
│   └── post-generate.js
└── transformers/          # Schema transformers (optional)
    └── default.js
```

### Minimal Template Example

Here's a simple template that generates a "Hello World" SDK:

#### `template.config.js`

```javascript
module.exports = {
  name: "hello-world-template",
  description: "A simple Hello World SDK template",

  // Define prompts for user input
  prompts: [
    {
      type: "input",
      name: "greeting",
      message: "What greeting would you like to use?",
      default: "Hello, World!",
    },
    {
      type: "input",
      name: "author",
      message: "Author name?",
      default: "Palantir SDK Generator",
    },
  ],

  // Files to process as EJS templates
  templateFiles: ["**/*.ejs"],

  // Files to copy without processing
  staticFiles: [".gitignore", "**/*.md"],

  // Hooks for custom logic
  hooks: {
    beforeGenerate: "./scripts/pre-generate.js",
    afterGenerate: "./scripts/post-generate.js",
  },
};
```

#### `template/package.json.ejs`

```json
{
  "name": "<%= projectName %>",
  "version": "1.0.0",
  "description": "SDK generated from schema",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "author": "<%= author %>",
  "license": "<%= license %>",
  "scripts": {
    "build": "tsc",
    "test": "jest"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0"
  }
}
```

#### `template/src/helloWorld.ts.ejs`

```typescript
/**
 * Generated on <%= new Date().toISOString() %>
 * Author: <%= author %>
 */

export class HelloWorld {
  private greeting: string = '<%= greeting %>';

  constructor(customGreeting?: string) {
    if (customGreeting) {
      this.greeting = customGreeting;
    }
  }

  greet(name: string = 'World'): string {
    return `${this.greeting}, ${name}!`;
  }

  // Schema information
  getSchemaInfo(): object {
    return <%- JSON.stringify(schema, null, 2) %>;
  }
}

export default HelloWorld;
```

#### `scripts/pre-generate.js`

```javascript
module.exports = async function preGenerate(context) {
  const { projectName, schema, answers, templateConfig } = context;

  console.log(`🚀 Preparing to generate ${projectName}`);
  console.log(`📋 Using template: ${templateConfig.name}`);
  console.log(`👤 Author: ${answers.author}`);

  // Validate schema
  if (!schema || Object.keys(schema).length === 0) {
    console.warn("⚠️  Warning: Schema is empty");
  }

  // Modify context if needed
  context.additionalData = {
    generatedAt: new Date().toISOString(),
    nodeVersion: process.version,
  };

  return context;
};
```

#### `scripts/post-generate.js`

```javascript
const fs = require("fs-extra");
const path = require("path");

module.exports = async function postGenerate(context, outputPath) {
  const { projectName, answers } = context;

  console.log(`✨ Finalizing ${projectName}`);

  // Create additional directories
  await fs.ensureDir(path.join(outputPath, "dist"));
  await fs.ensureDir(path.join(outputPath, "tests"));

  // Create a simple test file
  const testContent = `
import HelloWorld from '../src/helloWorld';

describe('HelloWorld', () => {
  it('should greet correctly', () => {
    const hw = new HelloWorld();
    expect(hw.greet('SDK')).toBe('${answers.greeting}, SDK!');
  });
});
`;

  await fs.writeFile(
    path.join(outputPath, "tests", "helloWorld.test.ts"),
    testContent.trim(),
  );

  // Create TypeScript config
  const tsConfig = {
    compilerOptions: {
      target: "ES2020",
      module: "commonjs",
      declaration: true,
      outDir: "./dist",
      rootDir: "./src",
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
    },
    include: ["src/**/*"],
    exclude: ["node_modules", "dist", "tests"],
  };

  await fs.writeJSON(
    path.join(outputPath, "tsconfig.json"),
    tsConfig,
    { spaces: 2 },
  );

  console.log("📦 Package structure created successfully!");
};
```

### Hook Execution Model

**Important**: Template hooks run as separate Node.js processes in the template's directory context. This means:

1. **Dependency Isolation**: Hooks have access to the template package's `node_modules`, not the CLI's
2. **Version Independence**: The template can depend on a specific version of `@palantir/pack.sdkgen` and other tools
3. **Context Passing**: Hook context is serialized to JSON and passed via command-line arguments
4. **Return Values**: Hooks can return modified context (for `beforeGenerate`) via stdout

Example hook that uses template dependencies:

```javascript
// hooks/afterGenerate.js
import { execSync } from "child_process";

export default async function afterGenerate(context) {
  const { outputPath, schemaPath } = context;

  // This uses the template's own dependencies
  const typeGenPath = require.resolve("@my-org/type-generator/bin/cli.js");

  execSync(
    `node "${typeGenPath}" -i "${schemaPath}" -o "${outputPath}/types"`,
    {
      stdio: "inherit",
      cwd: outputPath,
    },
  );
}
```

### Advanced Template Features

#### Custom Schema Transformers

```javascript
// transformers/default.js
module.exports = {
  async transform(schema, context) {
    // Transform the raw schema into a format your templates can use
    return {
      version: schema.version || "1.0.0",
      endpoints: extractEndpoints(schema),
      types: extractTypes(schema),
      metadata: {
        generatedAt: new Date().toISOString(),
        sourceFile: context.schemaPath,
      },
    };
  },
};

function extractEndpoints(schema) {
  // Your schema parsing logic
  return [];
}

function extractTypes(schema) {
  // Your type extraction logic
  return [];
}
```

#### Template Variables

Templates have access to these variables:

- `projectName` - The name of the project being created
- `schema` - The transformed schema data
- `answers` - User responses to prompts
- `utils` - Helper functions (see below)
- Any additional data added by hooks

#### Utility Functions

```javascript
// Available in templates as `utils`
{
  camelCase: (str) => string,      // Convert to camelCase
  pascalCase: (str) => string,     // Convert to PascalCase
  kebabCase: (str) => string,      // Convert to kebab-case
  snakeCase: (str) => string,      // Convert to snake_case
  pluralize: (str) => string,      // Pluralize a word
  singularize: (str) => string,    // Singularize a word
  capitalize: (str) => string,     // Capitalize first letter
  lower: (str) => string,          // Convert to lowercase
  upper: (str) => string           // Convert to uppercase
}
```

## CLI Development Guide

### Project Structure

```
sdkgen/
├── src/
│   ├── cli.ts                 # CLI entry point
│   ├── commands/
│   │   └── create.ts          # Create command implementation
│   ├── core/
│   │   ├── generator.ts       # Core generation engine
│   │   ├── template-loader.ts # Template loading logic
│   │   └── schema-parser.ts   # Schema parsing utilities
│   ├── utils/
│   │   ├── prompts.ts         # User prompt utilities
│   │   ├── logger.ts          # Logging utilities
│   │   └── file-system.ts     # File system helpers
│   └── types/
│       └── index.ts           # TypeScript type definitions
├── templates/
│   └── default/               # Default template
├── bin/
│   └── cli.js                 # Executable entry point
├── package.json
├── tsconfig.json
└── README.md
```

### Implementation Steps

1. **Set up the project**
   ```bash
   mkdir sdkgen
   cd sdkgen
   npm init -y
   npm install commander inquirer ejs fs-extra glob chalk
   npm install -D typescript @types/node @types/inquirer @types/ejs
   ```

2. **Create the CLI entry point**
   ```typescript
   // src/cli.ts
   #!/usr/bin/env node
   import { Command } from 'commander';
   import { create } from './commands/create';

   const program = new Command();

   program
     .name('sdkgen')
     .description('Generate SDKs from schema definitions')
     .version('1.0.0');

   program
     .command('create <project-name>')
     .description('Create a new SDK project')
     .option('-t, --template <template>', 'template to use', 'default')
     .option('-s, --schema <path>', 'path to schema file')
     .option('--skip-install', 'skip dependency installation')
     .option('--verbose', 'enable verbose logging')
     .option('--dry-run', 'preview without writing files')
     .action(create);

   program.parse();
   ```

3. **Implement the generator core**
   ```typescript
   // src/core/generator.ts
   import ejs from "ejs";
   import fs from "fs-extra";
   import glob from "glob";
   import path from "path";

   export class Generator {
     constructor(private context: GeneratorContext) {}

     async generate(outputPath: string): Promise<void> {
       // Implementation as shown in architecture section
     }
   }
   ```

4. **Build and link for testing**
   ```bash
   npm run build
   npm link
   npx @palantir/pack.sdkgen create test-project --schema ./test.json
   ```

## API Reference

### Generator Context

```typescript
interface GeneratorContext {
  projectName: string;
  schema: any;
  answers: Record<string, any>;
  templateConfig: TemplateConfig;
  schemaPath: string;
  outputPath: string;
  options: {
    skipInstall?: boolean;
    verbose?: boolean;
    dryRun?: boolean;
  };
}
```

### Template Configuration

```typescript
interface TemplateConfig {
  name: string;
  description: string;
  prompts?: PromptQuestion[];
  templateFiles?: string[];
  staticFiles?: string[];
  hooks?: {
    beforeGenerate?: string | Function;
    afterGenerate?: string | Function;
    beforeInstall?: string | Function;
    afterInstall?: string | Function;
  };
  transformers?: {
    [key: string]: string | Function;
  };
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}
```

### Hook Functions

```typescript
// Pre-generate hook
type PreGenerateHook = (context: GeneratorContext) => Promise<GeneratorContext>;

// Post-generate hook
type PostGenerateHook = (
  context: GeneratorContext,
  outputPath: string,
) => Promise<void>;
```

## Examples

### Creating a REST API Client Template

```javascript
// template.config.js
module.exports = {
  name: "rest-api-client",
  prompts: [
    {
      type: "input",
      name: "baseUrl",
      message: "API base URL?",
      default: "https://api.example.com",
    },
    {
      type: "list",
      name: "httpClient",
      message: "HTTP client library?",
      choices: ["fetch", "axios", "node-fetch"],
    },
  ],
  hooks: {
    afterGenerate: async (context, outputPath) => {
      // Install selected HTTP client
      const { httpClient } = context.answers;
      if (httpClient === "axios") {
        // Add axios to package.json dependencies
      }
    },
  },
};
```

### Using Environment-Specific Configuration

```bash
# Development
TEMPLATE_ENV=dev npx @palantir/pack.sdkgen create my-sdk \
  --schema ./schema.json

# Production
TEMPLATE_ENV=prod npx @palantir/pack.sdkgen create my-sdk \
  --schema ./schema.json
```

---

## Troubleshooting

### Common Issues

**Template not found**

- Ensure the template package is published to npm
- Check that the template path is correct for local templates
- Verify the template has a valid `template.config.js`

**Schema parsing errors**

- Validate your schema file is valid JSON/YAML
- Check that the schema transformer matches your schema format
- Use `--verbose` flag for detailed error messages

**Generation fails**

- Run with `--dry-run` first to preview changes
- Check hook scripts for errors
- Ensure all required template variables are provided
