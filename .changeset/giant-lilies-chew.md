---
"@beep/canvas": patch
"@beep/canvas-domain": patch
"@beep/form": patch
"@beep/oip-web": patch
"@beep/professional-desktop": patch
"@beep/professional-runtime-proof": patch
"@beep/ui": patch
---

Migrate canvas, oip-web, and professional app UI state to Effect atom reactivity, fix the shared `@beep/ui` carousel infinite-render loop by hoisting render-body atoms into module-scoped `Atom.family` instances, document the canvas project aggregates, and refresh repo-exports catalog shards.
