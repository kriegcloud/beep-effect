/**
 * Embedded init templates for the sandbox capability.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $SandboxId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import { A, Str, Struct } from "@beep/utils";
import { Effect } from "effect";
import { dual, pipe } from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { InitError } from "./Sandbox.errors.ts";

const $I = $SandboxId.create("Template");

/**
 * Supported scaffold template names.
 *
 * @category schemas
 * @since 0.0.0
 */
export const SandboxTemplateName = LiteralKit(["blank", "simple-loop"]).annotate(
  $I.annote("SandboxTemplateName", {
    description: "Supported scaffold template names.",
  })
);

/**
 * Runtime type for {@link SandboxTemplateName}.
 *
 * @category models
 * @since 0.0.0
 */
export type SandboxTemplateName = typeof SandboxTemplateName.Type;

/**
 * Public template registry entry.
 *
 * @example
 * ```ts
 * import { listSandboxTemplates } from "@beep/sandbox"
 * import { A } from "@beep/utils"
 *
 * const names = A.map(listSandboxTemplates(), (template) => template.name)
 * console.log(names)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class SandboxTemplateEntry extends S.Class<SandboxTemplateEntry>($I`SandboxTemplateEntry`)(
  {
    description: S.String,
    name: SandboxTemplateName,
  },
  $I.annote("SandboxTemplateEntry", {
    description: "Public template registry entry.",
  })
) {}

/**
 * Rendered scaffold file.
 *
 * @example
 * ```ts
 * import { SandboxTemplateFile } from "@beep/sandbox"
 *
 * const file = new SandboxTemplateFile({ content: "hello", path: "prompt.md" })
 * console.log(file.path)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class SandboxTemplateFile extends S.Class<SandboxTemplateFile>($I`SandboxTemplateFile`)(
  {
    content: S.String,
    path: S.String,
  },
  $I.annote("SandboxTemplateFile", {
    description: "Rendered scaffold file.",
  })
) {}

/**
 * Values available to embedded scaffold templates.
 *
 * @example
 * ```ts
 * import { SandboxTemplateRenderContext } from "@beep/sandbox"
 *
 * const context = new SandboxTemplateRenderContext({
 *   agentFactory: "claudeCode",
 *   agentModel: "claude-opus-4-6",
 *   imageName: "beep-sandbox:demo",
 *   mainFilename: "main.ts",
 *   providerFactory: "docker",
 *   templateName: "blank"
 * })
 * console.log(context.templateName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class SandboxTemplateRenderContext extends S.Class<SandboxTemplateRenderContext>(
  $I`SandboxTemplateRenderContext`
)(
  {
    agentFactory: S.String,
    agentModel: S.String,
    imageName: S.String,
    mainFilename: S.String,
    providerFactory: S.String,
    templateName: SandboxTemplateName,
  },
  $I.annote("SandboxTemplateRenderContext", {
    description: "Values available to embedded scaffold templates.",
  })
) {}

const sandboxTemplateEntries: ReadonlyArray<SandboxTemplateEntry> = [
  new SandboxTemplateEntry({
    description: "Bare scaffold for a prompt-driven sandbox run.",
    name: "blank",
  }),
  new SandboxTemplateEntry({
    description: "Small loop-oriented prompt scaffold for backlog-driven agent work.",
    name: "simple-loop",
  }),
];

const skeletonPrompt = `# Context

Use this file to describe the work the sandboxed agent should perform.

# Task

Describe the next task here.

# Done

When the task is complete, output <promise>COMPLETE</promise>.
`;

const simpleLoopPrompt = `# Context

You are working through one ready backlog item at a time inside an isolated sandbox.

# Task

1. Inspect the next ready item.
2. Implement the smallest complete fix.
3. Run the relevant checks.
4. Summarize what changed.

# Done

When the task is complete, output <promise>COMPLETE</promise>.
`;

const mainTemplate = `import { NodeChildProcessSpawner, NodeRuntime, NodeServices } from "@effect/platform-node"
import { Effect, Layer } from "effect"
import {
  ClackDisplay,
  ContainerProviderOptions,
  SandboxProcessLive,
  {{AGENT_FACTORY}},
  {{PROVIDER_FACTORY}},
  noopAgentStreamEmitterLayer,
  run
} from "@beep/sandbox"

const PlatformLayer = Layer.mergeAll(
  NodeServices.layer,
  NodeChildProcessSpawner.layer.pipe(Layer.provideMerge(NodeServices.layer))
)

const MainLayer = Layer.mergeAll(
  PlatformLayer,
  SandboxProcessLive.pipe(Layer.provide(PlatformLayer)),
  ClackDisplay.layer,
  noopAgentStreamEmitterLayer
)

const program = run({
  agent: {{AGENT_FACTORY}}("{{AGENT_MODEL}}"),
  maxIterations: 1,
  promptFile: ".sandcastle/prompt.md",
  sandbox: {{PROVIDER_FACTORY}}(
    new ContainerProviderOptions({
      imageName: "{{IMAGE_NAME}}"
    })
  )
})

NodeRuntime.runMain(program.pipe(Effect.provide(MainLayer)))
`;

const variablesFromContext = (context: SandboxTemplateRenderContext): Record<string, string> => ({
  AGENT_FACTORY: context.agentFactory,
  AGENT_MODEL: context.agentModel,
  IMAGE_NAME: context.imageName,
  MAIN_FILENAME: context.mainFilename,
  PROVIDER_FACTORY: context.providerFactory,
  TEMPLATE_NAME: context.templateName,
});

const renderText = (content: string, context: SandboxTemplateRenderContext): string =>
  pipe(
    variablesFromContext(context),
    Struct.entries,
    A.reduce(content, (rendered, [key, value]) => pipe(rendered, Str.replaceAll(`{{${key}}}`, value)))
  );

const filesForTemplate = (context: SandboxTemplateRenderContext): ReadonlyArray<SandboxTemplateFile> => [
  new SandboxTemplateFile({
    content: context.templateName === "simple-loop" ? simpleLoopPrompt : skeletonPrompt,
    path: "prompt.md",
  }),
  new SandboxTemplateFile({
    content: renderText(mainTemplate, context),
    path: context.mainFilename,
  }),
];

/**
 * List scaffold templates supported by the init command.
 *
 * @example
 * ```ts
 * import { listSandboxTemplates } from "@beep/sandbox"
 *
 * console.log(listSandboxTemplates()[0]?.name)
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const listSandboxTemplates = (): ReadonlyArray<SandboxTemplateEntry> => sandboxTemplateEntries;

/**
 * Look up a scaffold template by name.
 *
 * @example
 * ```ts
 * import { getSandboxTemplate } from "@beep/sandbox"
 * import * as O from "effect/Option"
 *
 * console.log(O.isSome(getSandboxTemplate("blank")))
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const getSandboxTemplate = (name: string): O.Option<SandboxTemplateEntry> =>
  A.findFirst(sandboxTemplateEntries, (template) => template.name === name);

/**
 * Render files for a supported scaffold template.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { renderSandboxTemplateFiles, SandboxTemplateRenderContext } from "@beep/sandbox"
 *
 * const files = renderSandboxTemplateFiles(
 *   new SandboxTemplateRenderContext({
 *     agentFactory: "claudeCode",
 *     agentModel: "claude-opus-4-6",
 *     imageName: "beep-sandbox:demo",
 *     mainFilename: "main.ts",
 *     providerFactory: "docker",
 *     templateName: "blank"
 *   })
 * )
 *
 * Effect.runSync(files)
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const renderSandboxTemplateFiles: (
  context: SandboxTemplateRenderContext
) => Effect.Effect<ReadonlyArray<SandboxTemplateFile>, InitError> = Effect.fn("Template.renderSandboxTemplateFiles")(
  function* (context) {
    const template = getSandboxTemplate(context.templateName);

    if (O.isNone(template)) {
      return yield* InitError.new("unknown sandbox template", `Unknown sandbox template: ${context.templateName}`);
    }

    return filesForTemplate(context);
  }
);

/**
 * Build human-readable next steps for a scaffolded template.
 *
 * @example
 * ```ts
 * import { sandboxTemplateNextSteps } from "@beep/sandbox"
 *
 * console.log(sandboxTemplateNextSteps("blank", "main.ts"))
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const sandboxTemplateNextSteps: {
  (templateName: SandboxTemplateName, mainFilename: string): ReadonlyArray<string>;
  (mainFilename: string): (templateName: SandboxTemplateName) => ReadonlyArray<string>;
} = dual(
  2,
  (templateName: SandboxTemplateName, mainFilename: string): ReadonlyArray<string> =>
    templateName === "blank"
      ? [
          "Set the required environment variables in .sandcastle/.env.",
          "Edit .sandcastle/prompt.md with the task you want the agent to run.",
          `Run the generated entrypoint with a TypeScript runner, for example: bunx tsx .sandcastle/${mainFilename}.`,
        ]
      : [
          "Set the required environment variables in .sandcastle/.env.",
          "Edit .sandcastle/prompt.md so the backlog query matches your workflow.",
          `Run the generated entrypoint with a TypeScript runner, for example: bunx tsx .sandcastle/${mainFilename}.`,
        ]
);
