import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { isToolCallEventType } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import { StringEnum } from "@mariozechner/pi-ai";
import * as fs from "node:fs";
import * as path from "node:path";

// Reference doc topics and their files
const TOPICS: Record<string, { file: string; label: string }> = {
  services: { file: "services-and-layers.md", label: "Services & Layers" },
  layers: { file: "services-and-layers.md", label: "Services & Layers" },
  "data-modeling": { file: "data-modeling.md", label: "Data Modeling" },
  schema: { file: "schema-decisions.md", label: "Schema Decisions" },
  errors: { file: "error-handling.md", label: "Error Handling" },
  testing: { file: "testing.md", label: "Testing" },
  http: { file: "http-clients.md", label: "HTTP Clients" },
  cli: { file: "cli.md", label: "CLI" },
  config: { file: "config.md", label: "Config" },
  processes: { file: "processes.md", label: "Processes & Scopes" },
  setup: { file: "setup.md", label: "Project Setup" },
};

// Pattern detection for smart injection
const PATTERNS: Record<string, { match: RegExp[]; topic: string }> = {
  services: {
    match: [/ServiceMap\.Service/, /Layer\.effect/, /Layer\.sync/, /Layer\.scoped/],
    topic: "services",
  },
  schema: {
    match: [/Schema\.Class/, /Schema\.TaggedClass/, /Schema\.Struct/, /Schema\.brand/],
    topic: "data-modeling",
  },
  errors: {
    match: [/Schema\.TaggedErrorClass/, /Schema\.TaggedError/, /Effect\.catchTag/, /Schema\.Defect/],
    topic: "errors",
  },
  testing: {
    match: [/from ["']@effect\/vitest/, /it\.effect/, /it\.layer/, /it\.live/],
    topic: "testing",
  },
  http: {
    match: [/from ["']effect\/unstable\/http/, /HttpClient/, /HttpClientResponse/, /FetchHttpClient/],
    topic: "http",
  },
  cli: {
    match: [/from ["']effect\/unstable\/cli/, /Command\.make/, /Argument\./, /Flag\./],
    topic: "cli",
  },
  config: {
    match: [/Config\.redacted/, /Config\.schema/, /ConfigProvider/, /Config\.int\(/, /Config\.string\(/],
    topic: "config",
  },
  processes: {
    match: [/Scope\.make/, /Scope\.extend/, /Effect\.forkDaemon/, /Effect\.forkScoped/, /Command\.start/],
    topic: "processes",
  },
};

function getSkillDir(extensionFile: string): string {
  // extensionFile is this file. Skill is at ../skills/effect-ts/
  return path.resolve(path.dirname(extensionFile), "..", "skills", "effect-ts");
}

function loadReference(skillDir: string, topic: string): string | null {
  const meta = TOPICS[topic];
  if (!meta) return null;
  const refPath = path.join(skillDir, "references", meta.file);
  try {
    return fs.readFileSync(refPath, "utf-8");
  } catch {
    return null;
  }
}

function detectEffectProject(cwd: string): boolean {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(cwd, "package.json"), "utf-8"));
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies, ...pkg.peerDependencies };
    return "effect" in allDeps || "@effect/platform" in allDeps || "@effect/cli" in allDeps;
  } catch {
    return false;
  }
}

function detectPatterns(content: string): string[] {
  const detected = new Set<string>();
  for (const [, { match, topic }] of Object.entries(PATTERNS)) {
    for (const re of match) {
      if (re.test(content)) {
        detected.add(topic);
        break;
      }
    }
  }
  return [...detected];
}

export default function (pi: ExtensionAPI) {
  const skillDir = getSkillDir(__filename);
  let isEffectProject = false;
  const injectedTopics = new Set<string>();

  // --- Session start: detect Effect project ---
  pi.on("session_start", async (_event, ctx) => {
    isEffectProject = detectEffectProject(ctx.cwd);
    if (isEffectProject) {
      ctx.ui.setStatus("effect", "Effect v4");
    }
  });

  // --- Smart context injection on file reads ---
  pi.on("tool_result", async (event, ctx) => {
    if (!isEffectProject) return;
    if (event.toolName !== "read") return;

    // Get the file content from the result
    const textContent = event.content
      ?.filter((c: any) => c.type === "text")
      .map((c: any) => c.text)
      .join("\n");

    if (!textContent || textContent.length < 50) return;

    // Detect Effect patterns
    const topics = detectPatterns(textContent);
    const newTopics = topics.filter((t) => !injectedTopics.has(t));

    if (newTopics.length === 0) return;

    // Inject up to 2 reference docs per read, max 1 total injection
    const toInject = newTopics.slice(0, 1);
    const hints: string[] = [];

    for (const topic of toInject) {
      const meta = TOPICS[topic];
      if (meta) {
        injectedTopics.add(topic);
        hints.push(`[Effect patterns detected: ${meta.label}. Use /effect:docs ${topic} for full reference.]`);
      }
    }

    if (hints.length > 0) {
      return {
        content: [
          ...event.content,
          { type: "text", text: "\n" + hints.join("\n") },
        ],
      };
    }
  });

  // --- /effect:docs <topic> command ---
  pi.registerCommand("effect:docs", {
    description: "Load Effect reference docs. Topics: " + Object.keys(TOPICS).join(", "),
    handler: async (args, ctx) => {
      const topic = args?.trim().toLowerCase();

      if (!topic) {
        const list = Object.entries(TOPICS)
          .map(([key, { label }]) => `  ${key.padEnd(14)} ${label}`)
          .join("\n");
        ctx.ui.notify(`Available topics:\n${list}`, "info");
        return;
      }

      const content = loadReference(skillDir, topic);
      if (!content) {
        ctx.ui.notify(`Unknown topic: ${topic}. Available: ${Object.keys(TOPICS).join(", ")}`, "error");
        return;
      }

      const meta = TOPICS[topic]!;
      pi.sendMessage(
        {
          customType: "effect-docs",
          content: `# Effect Reference: ${meta.label}\n\n${content}`,
          display: true,
        },
        { triggerTurn: false }
      );
      ctx.ui.notify(`Loaded: ${meta.label}`, "success");
      injectedTopics.add(topic);
    },
  });

  // --- /effect:service command ---
  pi.registerCommand("effect:service", {
    description: "Generate an Effect service scaffold",
    handler: async (args, ctx) => {
      const name = args?.trim() || "MyService";
      const scaffold = generateServiceScaffold(name);
      pi.sendMessage(
        {
          customType: "effect-scaffold",
          content: `Here is a scaffold for the \`${name}\` service. Adapt it to your needs:\n\n\`\`\`typescript\n${scaffold}\n\`\`\``,
          display: true,
        },
        { triggerTurn: false }
      );
      ctx.ui.notify(`Service scaffold: ${name}`, "success");
    },
  });

  // --- /effect:test command ---
  pi.registerCommand("effect:test", {
    description: "Generate an Effect test scaffold",
    handler: async (args, ctx) => {
      const name = args?.trim() || "MyService";
      const scaffold = generateTestScaffold(name);
      pi.sendMessage(
        {
          customType: "effect-scaffold",
          content: `Here is a test scaffold for \`${name}\`. Adapt it to your needs:\n\n\`\`\`typescript\n${scaffold}\n\`\`\``,
          display: true,
        },
        { triggerTurn: false }
      );
      ctx.ui.notify(`Test scaffold: ${name}`, "success");
    },
  });

  // --- effect_scaffold tool (LLM-callable) ---
  pi.registerTool({
    name: "effect_scaffold",
    label: "Effect Scaffold",
    description:
      "Generate idiomatic Effect v4 boilerplate. Creates service, schema, error, or test scaffolds following effect-solutions best practices.",
    promptSnippet: "Generate Effect v4 boilerplate (service, schema, error, test)",
    parameters: Type.Object({
      type: StringEnum(["service", "schema", "error", "test"] as const, {
        description: "Type of scaffold to generate",
      }),
      name: Type.String({ description: "Name for the generated type/service (PascalCase)" }),
    }),
    async execute(_toolCallId, params) {
      let scaffold: string;
      switch (params.type) {
        case "service":
          scaffold = generateServiceScaffold(params.name);
          break;
        case "schema":
          scaffold = generateSchemaScaffold(params.name);
          break;
        case "error":
          scaffold = generateErrorScaffold(params.name);
          break;
        case "test":
          scaffold = generateTestScaffold(params.name);
          break;
      }
      return {
        content: [{ type: "text", text: scaffold }],
        details: { type: params.type, name: params.name },
      };
    },
  });

  // --- effect_docs tool (LLM-callable) ---
  pi.registerTool({
    name: "effect_docs",
    label: "Effect Docs",
    description:
      "Load Effect v4 reference documentation on a specific topic. Returns the full reference content for the requested topic.",
    promptSnippet: "Load Effect v4 reference docs (services, schema, errors, testing, http, cli, config, processes, setup)",
    parameters: Type.Object({
      topic: StringEnum(Object.keys(TOPICS) as [string, ...string[]], {
        description: "Topic to load",
      }),
    }),
    async execute(_toolCallId, params) {
      const content = loadReference(skillDir, params.topic);
      if (!content) {
        return {
          content: [{ type: "text", text: `Unknown topic: ${params.topic}` }],
          details: {},
        };
      }
      injectedTopics.add(params.topic);
      return {
        content: [{ type: "text", text: content }],
        details: { topic: params.topic, label: TOPICS[params.topic]?.label },
      };
    },
  });
}

// --- Scaffold generators ---

function generateServiceScaffold(name: string): string {
  return `import { Effect, Layer, Schema, ServiceMap } from "effect"

const ${name}Id = Schema.String.pipe(Schema.brand("${name}Id"))
type ${name}Id = typeof ${name}Id.Type

class ${name} extends ServiceMap.Service<
  ${name},
  {
    readonly findById: (id: ${name}Id) => Effect.Effect<unknown>
    readonly create: (data: unknown) => Effect.Effect<unknown>
  }
>()("@app/${name}") {
  static readonly layer = Layer.effect(
    ${name},
    Effect.gen(function* () {
      // yield* dependencies here

      const findById = Effect.fn("${name}.findById")(function* (id: ${name}Id) {
        // implementation
        return yield* Effect.succeed({ id })
      })

      const create = Effect.fn("${name}.create")(function* (data: unknown) {
        // implementation
        return yield* Effect.succeed(data)
      })

      return { findById, create }
    })
  )

  static readonly testLayer = Layer.sync(${name}, () => {
    const store = new Map<${name}Id, unknown>()

    const findById = (id: ${name}Id) => Effect.succeed(store.get(id))
    const create = (data: unknown) => Effect.sync(() => {
      // store data
      return data
    })

    return { findById, create }
  })
}`;
}

function generateSchemaScaffold(name: string): string {
  return `import { Schema } from "effect"

const ${name}Id = Schema.NonEmptyString.pipe(Schema.brand("${name}Id"))
type ${name}Id = typeof ${name}Id.Type

class ${name} extends Schema.Class("${name}")({
  id: ${name}Id,
  name: Schema.String,
  createdAt: Schema.Date,
}) {
  get displayName() {
    return this.name
  }
}

// JSON encoding/decoding
const ${name}FromJson = Schema.fromJsonString(${name})`;
}

function generateErrorScaffold(name: string): string {
  return `import { Schema } from "effect"

class ${name}NotFoundError extends Schema.TaggedErrorClass("${name}NotFoundError")(
  "${name}NotFoundError",
  {
    id: Schema.String,
    message: Schema.String,
  }
) {}

class ${name}ValidationError extends Schema.TaggedErrorClass("${name}ValidationError")(
  "${name}ValidationError",
  {
    field: Schema.String,
    message: Schema.String,
  }
) {}

class ${name}Error extends Schema.TaggedErrorClass("${name}Error")(
  "${name}Error",
  {
    cause: Schema.Defect,
  }
) {}`;
}

function generateTestScaffold(name: string): string {
  return `import { describe, expect, it } from "@effect/vitest"
import { Effect, Layer } from "effect"
// import { ${name} } from "../src/${name.toLowerCase()}"

describe("${name}", () => {
  // const testLayer = ${name}.testLayer

  it.effect("creates an instance", () =>
    Effect.gen(function* () {
      // const svc = yield* ${name}
      // const result = yield* svc.create({ name: "test" })
      // expect(result).toBeDefined()
      expect(true).toBe(true)
    })
    // .pipe(Effect.provide(testLayer))
  )

  it.effect("finds by id", () =>
    Effect.gen(function* () {
      // const svc = yield* ${name}
      // yield* svc.create({ id: "test-1", name: "Alice" })
      // const found = yield* svc.findById("test-1")
      // expect(found).toBeDefined()
      expect(true).toBe(true)
    })
    // .pipe(Effect.provide(testLayer))
  )

  it.effect("handles errors", () =>
    Effect.gen(function* () {
      // const svc = yield* ${name}
      // const error = yield* svc.findById("nonexistent").pipe(Effect.flip)
      // expect(error._tag).toBe("${name}NotFoundError")
      expect(true).toBe(true)
    })
    // .pipe(Effect.provide(testLayer))
  )
})`;
}
