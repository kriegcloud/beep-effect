# Runtime Fixture Catalog

## Purpose

The fixture catalog defines the synthetic data used by the first runtime data
loop proof. The fixtures are product-shaped, but not real legal, financial,
client, or firm data.

Fixtures live under:

```txt
initiatives/agentic-professional-runtime/fixtures/runtime-data-loop/
```

## Directory Contract

Each scenario directory uses the same files:

```txt
seed.json
input.email.json
body.md
expected.claims.json
expected.tasks.json
expected.drafts.json
expected.approval-gates.json
expected.context-packet.json
```

`seed.json` defines the initial organization, user, workspace, agent, and
minimal vertical context.

`input.email.json` defines normalized email metadata. It points to `body.md`
instead of embedding raw body text.

`body.md` contains human-readable synthetic email content with stable span
markers.

`expected.*.json` files define deterministic fixture-agent output snapshots.

## Scenario Index

### Law Patent Intake

Path:
`fixtures/runtime-data-loop/law-patent-intake`

The seeded world contains:

- one solo-practice organization
- one attorney user
- one workspace
- one existing legal client and contact
- one existing matter and patent asset

The incoming email asks the attorney to help prepare a provisional patent filing
before a public demo. Expected outputs include deadline and inventor claims,
patent-intake tasks, a client-facing acknowledgement draft, and one approval
gate.

### Wealth Cash Request

Path:
`fixtures/runtime-data-loop/wealth-cash-request`

The seeded world contains:

- one wealth-firm organization
- one advisor user
- one workspace
- one existing household and client
- one existing taxable account reference

The incoming email asks the advisor for help planning a cash need before a
payment date. Expected outputs include cash-need and preference claims, advisor
tasks, a client-facing acknowledgement draft, and one approval gate.

## ID Policy

Fixture IDs are readable and stable by design. Examples:

- `law-patent-email-001`
- `claim-law-demo-date-001`
- `task-wealth-review-liquidity-001`
- `approval-law-patent-intake-001`

Implementation code can later map these to production identity constructors.
The fixture contract favors reviewability over UUID realism.

## Span Policy

Each `body.md` file marks source spans with:

```md
[span:<span-id>]
```

Expected snapshots may cite spans through keys named `spanId`, `spanIds`, or
`spanRefs`. Every cited span must exist in the scenario body.

Byte offsets are intentionally deferred. Stable span IDs are easier to author,
review, and preserve while the proof is still a product contract.

## Validation

Run the fixture validator from the repo root:

```sh
node initiatives/agentic-professional-runtime/fixtures/runtime-data-loop/validate-fixtures.mjs
```

The validator checks:

- all required files exist
- JSON files parse
- every expected snapshot cites only known source spans

It does not validate the final TypeScript schema shape. That belongs in package
tests once P3 creates implementation packages.

## Promotion Path

These fixtures begin inside the initiative packet. During P3 and the first
slice implementation, their contracts should be promoted into package-local
tests or `shared/use-cases/test` only when the architecture requires a
cross-slice fixture.
