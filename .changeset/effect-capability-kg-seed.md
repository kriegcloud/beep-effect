---
"@beep/repo-utils": patch
---

Seed the Effect capability KG exploration packet and repo-utils proof helpers for internal architecture planning.

Dependency note: this packet also keeps the root install graph reproducible by
pinning `form-data@4.0.6`, `js-yaml@4.2.0`, and `protobufjs@7.6.4`. These exact
pins intentionally replace older hoisted/canary lockfile entries so Vercel and
local installs resolve the same patched workspace graph while the repo-utils
seed helpers are introduced.
