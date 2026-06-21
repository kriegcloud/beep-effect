import { definePlugin } from "@oxlint/plugins";
import namespaceNodeImports from "./namespace-node-imports.ts";
import noGlobalProcessRuntime from "./no-global-process-runtime.ts";
import noInlineSchemaCompile from "./no-inline-schema-compile.ts";
import noManualEffectRuntimeInTests from "./no-manual-effect-runtime-in-tests.ts";
import noOpaqueInstanceFields from "./no-opaque-instance-fields.ts";

export default definePlugin({
  meta: {
    name: "beep",
  },
  rules: {
    "namespace-node-imports": namespaceNodeImports,
    "no-global-process-runtime": noGlobalProcessRuntime,
    "no-inline-schema-compile": noInlineSchemaCompile,
    "no-manual-effect-runtime-in-tests": noManualEffectRuntimeInTests,
    "no-opaque-instance-fields": noOpaqueInstanceFields,
  },
});
