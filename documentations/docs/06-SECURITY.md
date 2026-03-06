# NOMIK — Security

## Threat Model

NOMIK operates as a **local sidecar** — it never touches production systems. It stores metadata about your codebase, not source code.

| Threat | Risk | Mitigation |
|---|---|---|
| Graph DB exposed to network | HIGH | Bind to `127.0.0.1` only, Docker isolation |
| Credentials in config files | HIGH | Environment variables, `.env` in `.gitignore` |
| Cypher injection via MCP | MEDIUM | Parameterized queries only (no string concatenation) |
| Source code in graph | NONE | Graph stores metadata only — names, paths, line numbers, relationships |
| Viz dashboard access | LOW | Localhost-only by default |
| Dependency supply chain | MEDIUM | `nomik audit` with blast radius, lockfile pinning |

## Security Principles

### 1. No Raw Source Code in the Graph

The graph stores **metadata** — function names, file paths, line numbers, relationships. A stolen graph DB reveals architecture topology, not implementation details. Compliance-friendly (no PII/secrets stored).

### 2. Parameterized Cypher Only

All graph queries use parameters. No string concatenation in Cypher.

```typescript
// Correct — parameterized
session.run('MATCH (n:Function {name: $name}) RETURN n', { name });

// Never — injection risk
session.run(`MATCH (n:Function {name: '${name}'}) RETURN n`);
```

### 3. Network Isolation

```yaml
# docker-compose.yml
services:
  neo4j:
    ports:
      - "127.0.0.1:7474:7474"    # Localhost only
      - "127.0.0.1:7687:7687"    # No external access
```

> On Docker Desktop (Windows/macOS), `networks: internal: true` can block host→container port-forwarding. The `127.0.0.1` binding is sufficient to prevent external access. Do not use `internal: true` on Docker Desktop.

### 4. Environment-Based Secrets

```bash
# .env (never committed)
NOMIK_GRAPH_URI=bolt://localhost:7687
NOMIK_GRAPH_USER=neo4j
NOMIK_GRAPH_PASS=nomik_local
```

### 5. Role-Scoped MCP Access

The `NOMIK_ROLE` environment variable restricts which MCP tools are exposed:

| Role | Access Level |
|---|---|
| `dev` | All 21 tools (default) |
| `architect` | Architecture tools only |
| `security` | Security/audit tools only |
| `pm` | Stats/reporting tools only |

### 6. Built-in Security Tooling

| Tool | Description |
|---|---|
| `nomik audit` | Dependency vulnerability check with graph blast radius |
| `nomik guard` | Quality gate with secret detection |
| `nomik rules` | Architecture rules including `maxSecurityIssues` |
| `nomik ci` | Unified pipeline: scan → rules → guard → audit |
| Secret detection | Parser detects hardcoded secrets in source code |

### 7. CI Integration

```yaml
# .github/workflows/security.yml
name: NOMIK Security
on: [push, pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - run: docker compose up -d neo4j && sleep 5
      - run: pnpm nomik ci --skip-scan
```

## Future: RBAC + Multi-Tenant (Enterprise)

| Role | Read | Write | MCP Tools | Admin |
|---|---|---|---|---|
| `viewer` | Yes | No | No | No |
| `developer` | Yes | No | Yes | No |
| `maintainer` | Yes | Yes | Yes | No |
| `admin` | Yes | Yes | Yes | Yes |
