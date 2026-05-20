# Product Feature Map

## Purpose

This map separates product-specific capabilities from shared runtime
capabilities. If a feature has the same product language in both products, it is
a shared-kernel candidate. If it only makes sense in law or wealth, it stays in
the vertical slice.

## Law Practice Features

| Feature | Description | Runtime Dependency |
|---|---|---|
| Client and matter intake | Capture prospect/client details, matter purpose, conflict notes, and initial evidence. | tenancy, workspace, epistemic |
| IP asset workspace | Track patents, trademarks, copyrights, licenses, and contract assets as matter-linked context. | workspace, law-practice |
| Drafting support | Produce candidate patent, contract, email, and memo drafts with cited source context. | workspace, agent-capability, epistemic |
| Contract review | Extract obligations, risks, definitions, parties, deadlines, and candidate comments. | workspace, epistemic, law-practice |
| Filing/docket awareness | Reference official filing and deadline systems without replacing them. | law-practice, connectors |
| Autonomous office secretary | Schedule meetings, prepare reminders, triage inbox, and draft follow-ups. | workspace, agent-capability |
| Practice memory | Preserve prior work product, client preferences, legal positions, and source evidence. | epistemic |

## Todox Features

| Feature | Description | Runtime Dependency |
|---|---|---|
| Client meeting prep | Assemble household, goal, account, holding, prior thread, and recent communication context. | workspace, wealth-management, epistemic |
| Email and statement triage | Turn advisor inbox items and private investment statements into candidate claims and tasks. | workspace, epistemic |
| Advisor task queue | Extract concrete follow-ups with assignee, due date, evidence, and approval state. | workspace |
| Compliance review | Flag draft communications or agent output against firm policy and evidence. | epistemic, agent-capability |
| Skill marketplace | Let users author skills, teams share them, and organizations approve promoted versions. | agent-capability, tenancy |
| Model and cost attribution | Track provider, model, credential, actor, activity, tokens, latency, and cost. | agent-capability, epistemic |
| Household memory | Preserve client intent changes, supersessions, and source spans over time. | wealth-management, epistemic |

## Similarity Pressure

The two product proofs both need:

- organization, user, team, membership, and role context
- local workspace and thread runtime
- artifact ingestion from email, calendar, documents, and assistant threads
- claims with evidence and provenance
- candidate tasks and approval gates
- agent skills, commands, connectors, and model bindings
- usage and cost records
- native first-run onboarding

That overlap is the forcing function for the shared kernel. Shared promotion is
valid only when both products need the same product meaning, not merely the same
technical implementation.

## Difference Pressure

The verticals differ where professional language differs:

- Law owns clients as legal-service clients, matters, IP assets, filings,
  contracts, office actions, legal research, and attorney approval.
- Wealth owns parties, households, accounts, holdings, instruments, goals,
  meetings, planning engagements, advisor teams, and compliance review.

Those concepts should stay in `law-practice` and `wealth-management` unless a
later third product proves a more general professional-services abstraction.
