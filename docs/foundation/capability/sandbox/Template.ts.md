---
title: Template.ts
nav_order: 26
parent: "@beep/sandbox"
---

## Template.ts overview

Embedded init templates for the sandbox capability.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [SandboxTemplateEntry (class)](#sandboxtemplateentry-class)
  - [SandboxTemplateFile (class)](#sandboxtemplatefile-class)
  - [SandboxTemplateName (type alias)](#sandboxtemplatename-type-alias)
  - [SandboxTemplateRenderContext (class)](#sandboxtemplaterendercontext-class)
- [schemas](#schemas)
  - [SandboxTemplateName](#sandboxtemplatename)
- [utilities](#utilities)
  - [getSandboxTemplate](#getsandboxtemplate)
  - [listSandboxTemplates](#listsandboxtemplates)
  - [renderSandboxTemplateFiles](#rendersandboxtemplatefiles)
  - [sandboxTemplateNextSteps](#sandboxtemplatenextsteps)
---

# models

## SandboxTemplateEntry (class)

Public template registry entry.

**Example**

```ts
import { listSandboxTemplates } from "@beep/sandbox"
import { A } from "@beep/utils"

const names = A.map(listSandboxTemplates(), (template) => template.name)
console.log(names)
```

**Signature**

```ts
declare class SandboxTemplateEntry
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Template.ts#L61)

Since v0.0.0

## SandboxTemplateFile (class)

Rendered scaffold file.

**Example**

```ts
import { SandboxTemplateFile } from "@beep/sandbox"

const file = SandboxTemplateFile.make({ content: "hello", path: "prompt.md" })
console.log(file.path)
```

**Signature**

```ts
declare class SandboxTemplateFile
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Template.ts#L85)

Since v0.0.0

## SandboxTemplateName (type alias)

Runtime type for `SandboxTemplateName`.

**Signature**

```ts
type SandboxTemplateName = typeof SandboxTemplateName.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Template.ts#L44)

Since v0.0.0

## SandboxTemplateRenderContext (class)

Values available to embedded scaffold templates.

**Example**

```ts
import { SandboxTemplateRenderContext } from "@beep/sandbox"

const context = SandboxTemplateRenderContext.make({
  agentFactory: "claudeCode",
  agentModel: "claude-opus-4-6",
  imageName: "beep-sandbox:demo",
  mainFilename: "main.ts",
  providerFactory: "docker",
  templateName: "blank"
})
console.log(context.templateName)
```

**Signature**

```ts
declare class SandboxTemplateRenderContext
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Template.ts#L116)

Since v0.0.0

# schemas

## SandboxTemplateName

Supported scaffold template names.

**Example**

```ts
import { SandboxTemplateName } from "@beep/sandbox/Template"

console.log(SandboxTemplateName)
```

**Signature**

```ts
declare const SandboxTemplateName: AnnotatedSchema<LiteralKit<readonly ["blank", "simple-loop"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Template.ts#L32)

Since v0.0.0

# utilities

## getSandboxTemplate

Look up a scaffold template by name.

**Example**

```ts
import { getSandboxTemplate } from "@beep/sandbox"
import * as O from "effect/Option"

console.log(O.isSome(getSandboxTemplate("blank")))
```

**Signature**

```ts
declare const getSandboxTemplate: (name: string) => O.Option<SandboxTemplateEntry>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Template.ts#L266)

Since v0.0.0

## listSandboxTemplates

List scaffold templates supported by the init command.

**Example**

```ts
import { listSandboxTemplates } from "@beep/sandbox"

console.log(listSandboxTemplates()[0]?.name)
```

**Signature**

```ts
declare const listSandboxTemplates: () => ReadonlyArray<SandboxTemplateEntry>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Template.ts#L250)

Since v0.0.0

## renderSandboxTemplateFiles

Render files for a supported scaffold template.

**Example**

```ts
import { Effect } from "effect"
import { renderSandboxTemplateFiles, SandboxTemplateRenderContext } from "@beep/sandbox"

const files = renderSandboxTemplateFiles(
  SandboxTemplateRenderContext.make({
    agentFactory: "claudeCode",
    agentModel: "claude-opus-4-6",
    imageName: "beep-sandbox:demo",
    mainFilename: "main.ts",
    providerFactory: "docker",
    templateName: "blank"
  })
)

Effect.runSync(files)
```

**Signature**

```ts
declare const renderSandboxTemplateFiles: (context: SandboxTemplateRenderContext) => Effect.Effect<ReadonlyArray<SandboxTemplateFile>, InitError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Template.ts#L294)

Since v0.0.0

## sandboxTemplateNextSteps

Build human-readable next steps for a scaffolded template.

**Example**

```ts
import { sandboxTemplateNextSteps } from "@beep/sandbox"

console.log(sandboxTemplateNextSteps("blank", "main.ts"))
```

**Signature**

```ts
declare const sandboxTemplateNextSteps: { (templateName: SandboxTemplateName, mainFilename: string): ReadonlyArray<string>; (mainFilename: string): (templateName: SandboxTemplateName) => ReadonlyArray<string>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Template.ts#L321)

Since v0.0.0