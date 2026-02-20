<p align="right">
<a href="https://autorelease.general.dmz.palantir.tech/palantir/palantir-mcp"><img src="https://img.shields.io/badge/Perform%20an-Autorelease-success.svg" alt="Autorelease"></a>
</p>

# Palantir MCP

A lightweight open-source wrapper for downloading and installing the @palantir/mcp package from secure Foundry environments.

## Overview

This tool provides a streamlined way to access and run Palantir's Model Context Protocol (MCP) server from within Foundry environments. It handles authentication, package retrieval, and environment setup automatically.

## How It Works

1. **Preflight Checks**: Validates Node.js version, network connectivity to Foundry, and token authentication
2. **Registry Setup**: Configures NPM to use Foundry's internal package registry
3. **Package Execution**: Downloads and runs the latest @palantir/mcp package from your secure Foundry environment with your provided arguments

## 🛠️ Installation

### Requirements

- Node.js 18 or higher
- Valid Foundry instance access
- Foundry user token with appropriate permissions

### MCP Inspector

Test the palantir-mcp using the mcp-inspector package.

```sh
# Replace the below with your Foundry URL
export FOUNDRY_HOST="<enrollment>.palantirfoundry.com"

# Replace the below with your Foundry Token
export FOUNDRY_TOKEN=<token>

npx @modelcontextprotocol/inspector \
  npx -y palantir-mcp \
  --foundry-api-url \
  https://$FOUNDRY_HOST
```

### Claude Code

```bash
# Replace the below with your Foundry URL
export FOUNDRY_HOST="<enrollment>.palantirfoundry.com"

# Replace the below with your Foundry Token
export FOUNDRY_TOKEN=<token>

claude mcp add palantir-mcp \
    --scope user \
    -e FOUNDRY_TOKEN=$FOUNDRY_TOKEN \
    -- npx "-y" "palantir-mcp" "--foundry-api-url" "https://$FOUNDRY_HOST"
```

### Cursor

```json
{
  "mcpServers": {
    "palantir-mcp": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "palantir-mcp",
        "--foundry-api-url",
        "https://<enrollment>.palantirfoundry.com" // Replace with your Foundry URL
      ],
      "env": {
        "FOUNDRY_TOKEN": "<token>" // Replace with your Foundry Token
      }
    }
  }
}
```

### VS Code Copilot

```json
"mcp": {
    "inputs": [
        {
            "type": "promptString",
            "id": "foundry-token",
            "description": "Foundry user token",
            "password": true
        }
    ],
    "servers": {
        "Palantir": {
            "type": "stdio",
            "command": "npx",
            "args": [
                "-y",
                "palantir-mcp",
                "--foundry-api-url",
                "https://<enrollment>.palantirfoundry.com" // Replace with your Foundry URL
            ],
            "env": {
                "FOUNDRY_TOKEN": "${input:foundry-token}"
            }
        }
    }
}
```

### Cline

```json
{
  "mcpServers": {
    "palantir-mcp": {
      "command": "npx",
      "args": [
        "-y",
        "palantir-mcp",
        "--foundry-api-url",
        "https://<enrollment>.palantirfoundry.com" // Replace with your Foundry URL
      ],
      "env": {
        "FOUNDRY_TOKEN": "<token>" // Replace with your Foundry Token
      },
      "disabled": false
    }
  }
}
```

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev -- --foundry-api-url https://<enrollment>.palantirfoundry.com --foundry-token <token>

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Build for production
npm run build

# Lint and format
npm run lint
npm run format
```

## Architecture

The tool is organized into focused modules:

- `cli.ts` - Command-line argument parsing and validation
- `spawn.ts` - Process spawning and signal handling
- `registry.ts` - NPM registry URL construction
- `errors.ts` - Custom error classes for better error handling
- `preflightChecks.ts` - Validation of environment and credentials
- `index.ts` - Main orchestration logic

## Error Handling

The tool provides detailed error messages for common issues:

- **Node Version Error**: When Node.js version is below 18
- **Network Error**: When unable to reach Foundry API
- **Authentication Error**: When token is invalid or expired
- **Package Fetch Error**: When unable to retrieve the MCP package

## Contributing

Contributions are welcome! Please ensure:

1. All tests pass (`npm test`)
2. Code is properly linted (`npm run lint`)
3. Code is formatted (`npm run format`)
4. Type checking passes (`npm run typecheck`)

## License

MIT - See LICENSE file for details

## Support

For issues related to:

- This wrapper tool: Please open an issue in this repository
- The underlying @palantir/mcp package: Contact Foundry support
- Foundry access or tokens: Contact your Foundry administrator
