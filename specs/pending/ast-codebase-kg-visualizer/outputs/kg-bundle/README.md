# Codebase Knowledge Graph Bundle

## Contents

| File | Purpose |
|------|---------|
| `extract-graph-v2.ts` | ts-morph extractor — run against any TS project to produce graph JSON |
| `visualize-v2.html` | Standalone D3 visualizer (drop JSON file or load from API) |
| `codebase-graph-v2-demo.html` | Self-contained demo with embedded sample graph |
| `sample-graph-v2.json` | Sample graph output (114 nodes, 205 edges) |
| `codex-prompt-kg-visualizer.md` | Codex prompt for building the Next.js `/kg` page |
| `sample-project/` | Sample TS project the graph was extracted from |

## Quick Start

```bash
# 1. Extract a graph from your project
npx tsx extract-graph-v2.ts --tsconfig ./path/to/tsconfig.json --out codebase-graph.json

# 2. View it in the standalone visualizer
open visualize-v2.html  # then drop codebase-graph.json onto it

# 3. Or use the self-contained demo
open codebase-graph-v2-demo.html
```

## For Codex Integration

Feed `codex-prompt-kg-visualizer.md` to Codex along with `visualize-v2.html` (reference 
implementation) and `sample-graph-v2.json` (test data) as context files.

## Node Kinds (19)

package, file, namespace, class, interface, type_alias, enum, enum_member,
function, method, constructor, getter, setter, property, parameter,
variable, decorator, jsx_component, module_declaration

## Edge Kinds (26)

imports, re_exports, exports, calls, conditional_calls, instantiates,
extends, implements, overrides, contains, has_method, has_constructor,
has_property, has_getter, has_setter, has_parameter, has_member,
type_reference, return_type, generic_constraint, reads_property,
writes_property, decorates, throws, test_covers, uses_type
