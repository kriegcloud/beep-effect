# Repository recovery cache review

The recovery branch includes labs in test and coverage, adds generated lab coverage scripts,
and retains the current practice-kg unit-test command. Cache audit reports the following
changed computations. Their existing manifest bytes are the command review inputs; this
review records the current script posture without expanding qualification.

- `@beep/api-docs`: `apps/labs/api-docs/package.json` SHA-256 `b96d42a20799884ab345826d251b4e52a0737ff503bee205d621786ec83b6ff6`.
- `@beep/ciops`: `apps/labs/ciops/package.json` SHA-256 `fc7d92fcd322ae839540174ca0c94f85309309a4b06eb9c8120ffd71d479428b`.
- `@beep/lejeune-bolt-workbench`: `apps/labs/lejeune-bolt-workbench/package.json` SHA-256 `194697cc160ac230dcaae25268826a4bc879f229317c63913094a87225045e3d`.
- `@beep/practice-kg-mcp`: `apps/practice-kg-mcp/package.json` SHA-256 `6829d0a16e0b54826b0e1018e3b9e384e18fdd5a4b67f6464d365647608ebcf7`.
- `@beep/semantica`: `apps/labs/semantica/package.json` SHA-256 `77ce1e00f7fbde2a911be791bc4b5ffa81a93a33a4d9e256e644a75604e7eeaa`.
- `@beep/trustgraph-workbench`: `apps/labs/trustgraph-workbench/package.json` SHA-256 `9d92ad3bac68837c064b335d6a209af36a770efcf90ee92649488c9672ba2ac7`.

Reviewed drifted computations:

- `@beep/api-docs#build`
- `@beep/api-docs#check`
- `@beep/api-docs#lint`
- `@beep/api-docs#lint:deprecated-apis`
- `@beep/api-docs#lint:laws`
- `@beep/api-docs#test`
- `@beep/ciops#build`
- `@beep/ciops#check`
- `@beep/ciops#lint`
- `@beep/ciops#lint:deprecated-apis`
- `@beep/ciops#lint:laws`
- `@beep/ciops#test`
- `@beep/lejeune-bolt-workbench#build`
- `@beep/lejeune-bolt-workbench#check`
- `@beep/lejeune-bolt-workbench#lint`
- `@beep/lejeune-bolt-workbench#lint:deprecated-apis`
- `@beep/lejeune-bolt-workbench#lint:laws`
- `@beep/lejeune-bolt-workbench#test`
- `@beep/practice-kg-mcp#test`
- `@beep/semantica#build`
- `@beep/semantica#check`
- `@beep/semantica#lint`
- `@beep/semantica#lint:deprecated-apis`
- `@beep/semantica#lint:laws`
- `@beep/semantica#test`
- `@beep/trustgraph-workbench#build`
- `@beep/trustgraph-workbench#check`
- `@beep/trustgraph-workbench#lint`
- `@beep/trustgraph-workbench#lint:deprecated-apis`
- `@beep/trustgraph-workbench#lint:laws`
- `@beep/trustgraph-workbench#test`

Configuration sources reported by audit (review-only source drift; current hashes):

- `apps/docket-intake/turbo.json`: `d32a35c31c730ce6b85b37f81581e49b192667fc0df762e0d6bac597f9986787`.
- `apps/labs/api-docs/turbo.json`: `d32a35c31c730ce6b85b37f81581e49b192667fc0df762e0d6bac597f9986787`.
- `apps/labs/ciops/turbo.json`: `d32a35c31c730ce6b85b37f81581e49b192667fc0df762e0d6bac597f9986787`.
- `apps/oip-web/turbo.json`: `136d8bc171d4c7659388ac0d50f087287dce0947b465ad56730efad7784a9aff`.
- `apps/practice-claude-mod/turbo.json`: `d32a35c31c730ce6b85b37f81581e49b192667fc0df762e0d6bac597f9986787`.
- `apps/practice-identify/turbo.json`: `d32a35c31c730ce6b85b37f81581e49b192667fc0df762e0d6bac597f9986787`.
- `apps/practice-m365-contacts/turbo.json`: `d32a35c31c730ce6b85b37f81581e49b192667fc0df762e0d6bac597f9986787`.
- `apps/practice-mail-tagging/turbo.json`: `d32a35c31c730ce6b85b37f81581e49b192667fc0df762e0d6bac597f9986787`.
- `apps/practice-review-hub/turbo.json`: `d32a35c31c730ce6b85b37f81581e49b192667fc0df762e0d6bac597f9986787`.
- `apps/practice-setup/turbo.json`: `d32a35c31c730ce6b85b37f81581e49b192667fc0df762e0d6bac597f9986787`.
- `apps/professional-desktop/turbo.json`: `715d1c999d0659ebcafa23be7b96073fc96f28eea7b535eaa02e30abd992e6f4`.
- `apps/storybook/turbo.json`: `24ae08a1be2011554d9a2dd73894610fe6089bb9ce8228dbadd7cdcd23cdfbd3`.
- `apps/todox/turbo.json`: `4e2b58bbe1225f62502d9fb4dfacab017ce405c4a2da98e3a9055c7002ceddf5`.
- `packages/foundation/modeling/identity/turbo.json`: `1e41eee1a9c445e82871c3bdc4582275c3920281406b3959c90c28d6944e7553`.
- `packages/foundation/primitive/types/turbo.json`: `5c3b9bc6806f53037f0e48638313d54153ee61c0370f03ef3ff0959feb78602d`.
- `packages/tooling/library/ai-sync/turbo.json`: `dc1e160de701f4ca2a94319261f0eb58cf96721612393d1d535c803747629016`.
- `packages/tooling/policy-pack/repo-configs/turbo.json`: `dab1b6ed3a743a1000d38e0f780409303f932e728c7d3f5a09109424c8655aaa`.
- `packages/tooling/tool/cli/turbo.json`: `d4351ddcf59fee063f5eb6fa8e3a16677a836dd1123777fc1f24a2494420c9e2`.
- `turbo.json`: `c9ea1c9eb573024a8da22c2d0a2a34c95512c0bba8550c1a7cda44191544ba39`.

The previous projection appended mcpb-kit nodes after xstate; the canonical recorder
restores computation ordering. Scope, profile, epoch, qualification ledger, and all
qualification states stay unchanged. Reverse by reverting this review and baseline commit.
