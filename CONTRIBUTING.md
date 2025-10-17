# Vibes

# Recommended MCP Server Setup
```json
{
  "mcpServers": {
    "effect_docs": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "timsmart/effect-mcp"
      ],
      "env": {}
    },
    "mui-mcp": {
      "command": "npx",
      "args": [
        "-y",
        "@mui/mcp@latest"
      ]
    },
    "chrome-devtools": {
      "command": "/home/elpresidank/.nvm/versions/node/v20.19.0/bin/npx",
      "args": [
        "chrome-devtools-mcp@latest",
        "--connect-url"
      ]
    },
    "context7": {
      "command": "npx",
      "args": [
        "-y",
        "@upstash/context7-mcp",
        "--api-key",
        "<your-api-key-here>"
      ]
    },
    "mcp-deepwiki": {
      "command": "npx",
      "args": ["-y", "@nekzus/mcp-server@latest"]
    }
  }
}
```