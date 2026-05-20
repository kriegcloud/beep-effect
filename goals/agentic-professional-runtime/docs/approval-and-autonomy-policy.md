# Approval And Autonomy Policy

## Purpose

The first runtime proof must be useful without pretending agents are licensed
professionals. This document defines the v1 policy boundary between candidate
agent work and authoritative runtime truth.

## V1 Default

All agent-produced claims, tasks, drafts, and approval gates remain candidate
state until a human reviewer accepts, edits, rejects, or requests revision.

This strict policy applies to both product proofs:

- Law: attorney review is required for legal advice, filing work, and
  client-facing communication.
- Wealth: advisor or compliance review is required for financial advice,
  recommendations, account actions, and client-facing communication.

## Candidate Lifecycle

The initial lifecycle vocabulary is:

- `candidate`
- `accepted`
- `rejected`
- `revision_requested`
- `superseded`

`accepted` state means the runtime records the item as authoritative runtime
truth. It does not mean an external system of record has accepted it.

## Approval Gate Requirements

Each approval gate records:

- requested actions
- reviewer principal
- produced candidate item references
- evidence references
- policy basis
- decision state
- decision timestamp when decided

The v1 fixture gates remain `pending`.

## Allowed Autonomous Work Later

Administrative automation may become autonomous after the loop is proven:

- organize imported artifacts
- prepare internal task drafts
- prepare reminder drafts
- prepare scheduling suggestions
- classify inbox items
- assemble context packets

Even then, autonomy should be policy-scoped by organization, workspace, role,
and action type.

## Not Autonomous In V1

The following require review in v1:

- legal advice
- financial advice
- filings
- client-facing drafts
- recommendations
- portfolio or account actions
- compliance-weighted assertions
- accepted claims about client intent, deadlines, or obligations

## Rejection And Revision

Rejected or revised candidate work remains useful evidence. The runtime should
preserve the activity trail instead of deleting the candidate output silently.

Future package tests should prove that rejected candidates do not appear in
current authoritative views while still appearing in audit, activity, or review
history.
