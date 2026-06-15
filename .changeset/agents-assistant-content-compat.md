---
"@beep/agents-domain": patch
"@beep/agents-use-cases": patch
---

Preserve AssistantContent turn compatibility while moving the implementation
into value-object modules. Keeps the `@beep/agents-domain/turn` subpath and
root `Turn` namespace available, retains the previous schema identity path for
AssistantContent wire metadata, and documents the use-case contract alignment.
