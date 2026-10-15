"use strict";
// Preloaded into every infra Pulumi program through Pulumi.yaml
// `runtime.options.nodeargs`. Pulumi's nodejs runtime loads the classic
// TypeScript compiler API (ts-node registration in tsutils.js and the closure
// serializer's typescript-shim.js). The hoisted linker installs @pulumi/pulumi
// at the repository root, where `require("typescript")` finds the root
// TypeScript 7, whose package exposes no classic API. This hook resolves
// `typescript` for the Pulumi runtime to infra's own nested TypeScript 6
// (infra/package.json pins ^6.0.3), keeping that requirement inside infra/.
// Remove it once Pulumi's nodejs runtime supports TypeScript 7.
const Module = require("node:module");

const typescript6 = require.resolve("typescript", { paths: [__dirname] });
const resolveFilename = Module._resolveFilename;

Module._resolveFilename = function resolveInfraTypeScript(request, ...rest) {
  return request === "typescript" ? typescript6 : resolveFilename.call(this, request, ...rest);
};
