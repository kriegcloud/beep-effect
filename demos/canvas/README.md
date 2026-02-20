# Canvas Demo

A demo application showcasing Pack's features for collaborative document editing with a canvas-based interface.

## Quick Start

From the repository root:

```bash
pnpm demo:canvas
```

This watches the pack libraries and runs the demo app at `https://localhost:5173`.

## Running Modes

The demo supports two modes:

### Demo Mode (Default)

Out of the box, the app runs in **demo mode** with no backend connection. This uses:

- Mock authentication (no real OAuth flow)
- In-memory document storage (changes are lost on refresh)
- Simulated API responses

Demo mode is useful for exploring the UI and testing frontend changes without needing a Foundry instance.

### Real Foundry Backend

To connect to a real Foundry instance, you need to:

1. Create a `.env.local` file in `demos/canvas/app/`
2. Configure your Foundry credentials
3. Set up a Third Party Application (TPA) in Foundry

## Configuration

### Environment Files

| File               | Purpose                                     |
| ------------------ | ------------------------------------------- |
| `.env.development` | Default development settings (demo mode)    |
| `.env.local`       | **Your local overrides** (create this file) |
| `.env.example`     | Template showing all available variables    |

The `.env.local` file takes precedence and is gitignored.

### Environment Variables

#### Core Settings

| Variable                       | Required         | Description                                                                                                 |
| ------------------------------ | ---------------- | ----------------------------------------------------------------------------------------------------------- |
| `VITE_DEMO_MODE`               | No               | Set to `false` to connect to real Foundry. Defaults to `true` if not set or if `VITE_FOUNDRY_URL` is empty. |
| `VITE_FOUNDRY_URL`             | For real backend | Your Foundry stack URL (e.g., `https://your-stack.palantircloud.com`)                                       |
| `VITE_FOUNDRY_API_URL`         | For real backend | Foundry API URL (usually same as `VITE_FOUNDRY_URL`)                                                        |
| `VITE_FOUNDRY_CLIENT_ID`       | For real backend | OAuth Client ID from your Foundry TPA                                                                       |
| `VITE_FOUNDRY_REDIRECT_URL`    | For real backend | OAuth callback URL (default: `https://localhost:5173/auth/callback`)                                        |
| `VITE_FOUNDRY_ONTOLOGY_RID`    | For real backend | Your ontology RID (format: `ri.ontology.main.ontology.<uuid>`)                                              |
| `VITE_PACK_DOCUMENT_TYPE_NAME` | For real backend | Document type name registered in your Foundry Pack configuration                                            |

#### Optional Settings

| Variable                 | Default     | Description                                                 |
| ------------------------ | ----------- | ----------------------------------------------------------- |
| `DEV_SERVER_PORT`        | `5173`      | Local dev server port                                       |
| `DEV_SERVER_HOST`        | `localhost` | Local dev server host                                       |
| `VITE_DEV_FOUNDRY_TOKEN` | -           | Skip OAuth by providing a token directly (development only) |

### Example: Connecting to a Real Foundry Backend

Create `demos/canvas/app/.env.local`:

```properties
# Disable demo mode to use real Foundry
VITE_DEMO_MODE=false

# Your Foundry stack URL
VITE_FOUNDRY_URL=https://your-stack.palantircloud.com
VITE_FOUNDRY_API_URL=https://your-stack.palantircloud.com

# OAuth configuration (from your TPA)
VITE_FOUNDRY_CLIENT_ID=your-client-id-here
VITE_FOUNDRY_REDIRECT_URL=https://localhost:5173/auth/callback

# Your ontology RID
VITE_FOUNDRY_ONTOLOGY_RID=ri.ontology.main.ontology.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# Document type name (must match your Pack configuration)
VITE_PACK_DOCUMENT_TYPE_NAME=your-document-type
```

## Foundry Setup

### 1. Create a Third Party Application (TPA)

In Foundry, navigate to **Control Panel > Third-party applications** and create a new application:

1. **Application type**: Public (client-side)
2. **Redirect URLs**: Add `https://localhost:5173/auth/callback`
3. **Required scopes** - Enable the following:
   - `api:use-admin-read`
   - `api:use-admin-write`
   - `api:use-mediasets-read`
   - `api:use-mediasets-write`
   - `api:use-ontologies-read`
   - `api:use-ontologies-write`
   - `api:use-pack-read` (check your environment for availability)
   - `api:use-pack-write` (check your environment for availability)

Copy the **Client ID** to your `.env.local` file.

### 2. Configure Document Security

When creating documents, the app requires security settings. Edit [CreateCanvasDialog.tsx](app/src/components/home/CreateCanvasDialog.tsx) to configure:

#### Mandatory Security (Classification)

Set your organization's classification labels:

```typescript
// Example: Single classification
const DEFAULT_CLASSIFICATION: readonly string[] = ["MU"];
```

The classification must be a valid marking from your Foundry instance.

#### Discretionary Security (Access Control)

Optionally configure owners for document access:

```typescript
const DEFAULT_DOCUMENT_SECURITY = {
  discretionary: {
    owners: [{
      groupId: "your-group-uuid-here",
      type: "groupId",
    }],
  },
  mandatory: {
    classification: DEFAULT_CLASSIFICATION,
  },
};
```

## Troubleshooting

### "DEFAULT_CLASSIFICATION is not configured"

Edit `CreateCanvasDialog.tsx` and set a valid classification for your Foundry instance.

### OAuth redirect errors

Ensure:

- Your TPA's redirect URL exactly matches `VITE_FOUNDRY_REDIRECT_URL`
- You're using HTTPS (`https://localhost:5173`, not `http://`)
- The TPA has all required scopes enabled

### CORS or proxy errors

The Vite dev server proxies `/api/v2` requests to your Foundry instance. Verify `VITE_FOUNDRY_API_URL` is correct.

## Development

### Project Structure

```
demos/canvas/
├── app/                    # React application
│   ├── src/
│   │   ├── app.ts         # App initialization and auth setup
│   │   ├── components/    # React components
│   │   └── hooks/         # Custom React hooks
│   ├── .env.development   # Default env (demo mode)
│   └── .env.local         # Your local overrides (create this)
├── schema/                 # Document schema definition
└── sdk/                    # Generated OSDK client for canvas objects
```
