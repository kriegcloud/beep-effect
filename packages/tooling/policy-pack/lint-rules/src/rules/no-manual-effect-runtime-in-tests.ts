import { defineRule } from "@oxlint/plugins";
import * as HashMap from "effect/HashMap";
import * as HashSet from "effect/HashSet";
import * as Option from "effect/Option";
import { getPropertyName, isIdentifier, unwrapExpression } from "./utils.ts";
import type { MaybeNode } from "./utils.ts";

const TEST_FILE_PATTERN = /\.(?:test|spec)\.[cm]?[jt]sx?$/u;
const EFFECT_RUNTIME_METHODS = HashSet.fromIterable([
  "runCallback",
  "runCallbackWith",
  "runFork",
  "runForkWith",
  "runPromise",
  "runPromiseExit",
  "runPromiseExitWith",
  "runPromiseWith",
  "runSync",
  "runSyncExit",
  "runSyncExitWith",
  "runSyncWith",
]);

// Existing manual runners are tracked as debt. The rule permits no net-new
// occurrences in these files, while unlisted test files must have zero.
//
// Regenerate (run from repo root) after running oxlint with this rule enabled
// and an empty baseline; tally per repo-relative file:
//   bunx oxlint --config <cfg> packages apps \
//     | rg "no-manual-effect-runtime-in-tests" | cut -d: -f1 | sort | uniq -c
// then transcribe each `<repo-relative-path>: <count>` pair below.
const LEGACY_BASELINE = HashMap.fromIterable<string, number>([
  ["apps/oip-web/test/oip-seo.test.ts", 1],
  ["apps/oip-web/test/oip-web.test.tsx", 13],
  ["apps/professional-desktop/test/chat-ui.test.tsx", 2],
  ["packages/architecture-lab/server/test/integration/WorkItemDrizzleRepository.pglite.test.ts", 12],
  ["packages/drivers/acp/test/agent.test.ts", 6],
  ["packages/drivers/acp/test/protocol.test.ts", 6],
  ["packages/drivers/libpff/test/Libpff.service.test.ts", 6],
  ["packages/drivers/tika/test/Tika.service.test.ts", 6],
  ["packages/drivers/venice-ai/test/VeniceAI.service.test.ts", 6],
  ["packages/drivers/wink/test/Layers.test.ts", 1],
  ["packages/drivers/wink/test/ParityTools.test.ts", 4],
  ["packages/drivers/wink/test/ToolValidation.test.ts", 2],
  ["packages/drivers/wink/test/WinkEngineRef.test.ts", 2],
  ["packages/drivers/wink/test/WinkTokenization.test.ts", 2],
  ["packages/foundation/capability/file-processing/test/FileProcessing.test.ts", 10],
  ["packages/foundation/capability/nlp/test/Graph/Schema.test.ts", 16],
  ["packages/foundation/capability/nlp/test/Handoff/Contract.test.ts", 1],
  ["packages/foundation/capability/nlp/test/PatternCore.test.ts", 6],
  ["packages/foundation/capability/observability/test/Boundary.test.ts", 3],
  ["packages/foundation/capability/observability/test/DevToolsRelay.test.ts", 1],
  ["packages/foundation/capability/observability/test/HttpApiTelemetry.test.ts", 2],
  ["packages/foundation/capability/observability/test/Metric.test.ts", 3],
  ["packages/foundation/capability/observability/test/NodeSdk.test.ts", 5],
  ["packages/foundation/capability/observability/test/OtlpPacketLab.test.ts", 2],
  ["packages/foundation/capability/observability/test/PhaseProfiler.test.ts", 2],
  ["packages/foundation/capability/semantic-web/test/CanonicalizationSecurity.test.ts", 1],
  ["packages/foundation/capability/semantic-web/test/JsonLd.test.ts", 13],
  ["packages/foundation/capability/semantic-web/test/Provenance.test.ts", 1],
  ["packages/foundation/capability/semantic-web/test/ServicesAndSurface.test.ts", 9],
  ["packages/foundation/modeling/lexical/test/Lexical.codec.test.ts", 6],
  ["packages/foundation/modeling/pandoc-ast/test/integration/Pandoc.integration.test.ts", 1],
  ["packages/foundation/modeling/pandoc-ast/test/Pandoc.codec.test.ts", 16],
  ["packages/foundation/modeling/pandoc-ast/test/Pandoc.mapping.test.ts", 17],
  ["packages/foundation/modeling/schema/test/Fn.test.ts", 2],
  ["packages/foundation/modeling/schema/test/HttpHeaders.test.ts", 5],
  ["packages/foundation/modeling/schema/test/Number.test.ts", 2],
  ["packages/foundation/modeling/schema/test/Sha256.test.ts", 3],
  ["packages/foundation/modeling/utils/test/Glob.test.ts", 1],
  ["packages/foundation/ui-system/editor/test/editor-nodes.test.ts", 1],
  ["packages/tooling/library/repo-utils/test/DependencyIndex.test.ts", 1],
  ["packages/tooling/library/repo-utils/test/TsConfig.test.ts", 1],
  ["packages/tooling/library/repo-utils/test/UniqueDeps.test.ts", 1],
  ["packages/tooling/library/repo-utils/test/Workspaces.test.ts", 1],
  ["packages/tooling/policy-pack/lint-rules/test/parity/parity.test.ts", 1],
  ["packages/tooling/policy-pack/lint-rules/test/registry.test.ts", 1],
  ["packages/tooling/policy-pack/lint-rules/test/rules.test.ts", 1],
  ["packages/tooling/policy-pack/repo-configs/test/EffectTsgoEffectFnPolicy.test.ts", 1],
  ["packages/tooling/policy-pack/repo-configs/test/NextConfig.schemas.test.ts", 3],
  ["packages/tooling/policy-pack/repo-configs/test/NextModels.schema.test.ts", 9],
  ["packages/tooling/test-kit/test-utils/test/integration/SqlTest.pglite.test.ts", 1],
  ["packages/tooling/tool/cli/test/agent-effectiveness-command.test.ts", 12],
  ["packages/tooling/tool/cli/test/ai-metrics-command.test.ts", 52],
  ["packages/tooling/tool/cli/test/allowlist-check.test.ts", 6],
  ["packages/tooling/tool/cli/test/changeset-graph.test.ts", 4],
  ["packages/tooling/tool/cli/test/ci-command.test.ts", 1],
  ["packages/tooling/tool/cli/test/create-package-security.test.ts", 7],
  ["packages/tooling/tool/cli/test/create-package.test.ts", 13],
  ["packages/tooling/tool/cli/test/docgen.test.ts", 56],
  ["packages/tooling/tool/cli/test/effect-fn.test.ts", 4],
  ["packages/tooling/tool/cli/test/effect-imports.test.ts", 2],
  ["packages/tooling/tool/cli/test/files-command.test.ts", 74],
  ["packages/tooling/tool/cli/test/foundation-topology.test.ts", 2],
  ["packages/tooling/tool/cli/test/graphiti-proxy-security.test.ts", 2],
  ["packages/tooling/tool/cli/test/image-command.test.ts", 7],
  ["packages/tooling/tool/cli/test/lint-command.test.ts", 27],
  ["packages/tooling/tool/cli/test/native-runtime.test.ts", 5],
  ["packages/tooling/tool/cli/test/package-verify.test.ts", 3],
  ["packages/tooling/tool/cli/test/purge-security.test.ts", 2],
  ["packages/tooling/tool/cli/test/quality-artifact-generators.test.ts", 3],
  ["packages/tooling/tool/cli/test/quality-tasks.test.ts", 11],
  ["packages/tooling/tool/cli/test/reflection-lint.test.ts", 6],
  ["packages/tooling/tool/cli/test/sync-data-to-ts.test.ts", 7],
  ["packages/tooling/tool/cli/test/terse-effect.test.ts", 14],
  ["packages/tooling/tool/cli/test/tsconfig-sync.test.ts", 7],
  ["packages/tooling/tool/cli/test/yeet.test.ts", 10],
  ["packages/tooling/tool/docgen/test/Parser.test.ts", 1],
]);

const baselineFor = (filename: string): number => {
  const normalized = filename.replaceAll("\\", "/");
  for (const [suffix, count] of LEGACY_BASELINE) {
    if (normalized.endsWith(suffix)) return count;
  }
  return 0;
};

const manualRunnerName = (callee: MaybeNode): Option.Option<string> => {
  const expression = unwrapExpression(callee);
  if (Option.isNone(expression) || expression.value.type !== "MemberExpression") {
    return Option.none();
  }

  const object = unwrapExpression(expression.value.object);
  const property = getPropertyName(expression.value.property);
  if (Option.isNone(property)) return Option.none();

  if (isIdentifier(object, "Effect") && HashSet.has(EFFECT_RUNTIME_METHODS, property.value)) {
    return Option.some(`Effect.${property.value}`);
  }

  if (isIdentifier(object, "ManagedRuntime") && property.value === "make") {
    return Option.some("ManagedRuntime.make");
  }

  return Option.none();
};

export default defineRule({
  meta: {
    type: "problem",
    docs: {
      description: "Disallow manually creating or running Effect runtimes in tests; use @effect/vitest.",
    },
  },
  create(context) {
    if (!TEST_FILE_PATTERN.test(context.filename)) return {};

    const allowedCount = baselineFor(context.filename);
    let occurrenceCount = 0;

    return {
      CallExpression(node) {
        const runner = manualRunnerName(node.callee);
        if (Option.isNone(runner)) return;

        occurrenceCount++;
        if (occurrenceCount <= allowedCount) return;

        context.report({
          node: node.callee,
          message: `Do not use ${runner.value} in tests. Use @effect/vitest with it.effect(...) and test layers instead.`,
        });
      },
    };
  },
});
