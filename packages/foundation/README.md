# Foundation Packages

Foundation packages are repo-owned, domain-agnostic substrate. They provide
primitive types/data, modeling helpers, reusable technical capabilities, and
product-agnostic UI system code.

Foundation packages live at:

```txt
packages/foundation/<kind>/<name>
```

Valid kinds:

- `primitive`
- `modeling`
- `capability`
- `ui-system`

Foundation package manifests must declare:

```json
{
  "beep": {
    "family": "foundation",
    "kind": "<kind>"
  }
}
```

Do not put product-domain language here. If a reusable package carries
cross-slice product semantics, it belongs in `packages/shared`.
