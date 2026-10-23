// @effect-diagnostics strictEffectProvide:skip-file nodeBuiltinImport:skip-file -- strictEffectProvide because each test provides its test layers at its own entry point (operator ruling 2026-10-09); nodeBuiltinImport because it scans the lab's own source tree synchronously at test collection. Owner: @beep/scratchpad. Exit: effected-promotion graduates the module and ports this test to @effect/vitest layer() and Effect platform services.
// The signer half's confinement, as a test rather than a promise.
//
// The pure SBOM, statement, provenance, bundle and identity models moved to
// `@beep/sbom` (effected-promotion wave 4-S), which pins its own closure with a
// Bun-safe raw-source walker. What stays in this lab module is the Sigstore
// DSSE signer, the one module that reaches `@sigstore/*`. This test checks that
// it does, that it reaches the promoted models only through `@beep/sbom` leaves
// (never the root barrel), and that every runtime dependency is declared.
//
// `import type` is skipped because it is erased.

import { readFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { assert, describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";
import * as S from "effect/Schema";
import * as Ts from "@typescript/native/unstable/ast";
import { TsNativeApi, TsNativeConfig } from "@beep/repo-utils/TsNativeApi";
import { NodeServices } from "@effect/platform-node";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

const SRC = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "effected", "sbom");

const Manifest = S.Struct({
	sideEffects: S.optionalKey(S.Unknown),
	dependencies: S.optionalKey(S.Record(S.String, S.String)),
	peerDependencies: S.optionalKey(S.Record(S.String, S.String)),
});

/** Every runtime import or re-export, ignoring prose, string contents and type-only edges. */
const nativeLayer = TsNativeApi.layer(TsNativeConfig.make({ cwd: process.cwd(), tsconfig: "tsconfig.json" })).pipe(Layer.provide(NodeServices.layer));
const runtimeSpecifiers = Effect.fn("runtimeSpecifiers")(function* (source: string) {
	// Vendored siblings expose a larger graph than upstream's bare package edges.
	// Parse declarations so an exported class's error message containing `from`
	// cannot become a phantom dependency, and comment tokens cannot hide imports.
	const api = yield* TsNativeApi;
	const file = yield* api.parseSource("reachability.ts", source);
	const specifiers: Array<string> = [];
	for (const statement of file.statements) {
		if (!Ts.isImportDeclaration(statement) && !Ts.isExportDeclaration(statement)) continue;
		const specifier = statement.moduleSpecifier;
		if (specifier === undefined || !Ts.isStringLiteral(specifier)) continue;
		if (Ts.isImportDeclaration(statement)) {
			if (statement.importClause?.isTypeOnly === true) continue;
		} else {
			if (statement.isTypeOnly) continue;
		}
		specifiers.push(specifier.text);
	}
	return specifiers;
}, Effect.scoped);

/**
 * Runtime files and bare specifiers, including the lab's vendored sibling modules.
 *
 * `own` is the same walk seen at this package's boundary, the way upstream's bare
 * edges were: bare specifiers imported by this package's own files, plus each lab
 * sibling it enters, named as that sibling's upstream `@effected/*` package. What a
 * sibling imports in turn is the sibling's manifest's business, not this one's.
 */
const reachableImports = Effect.fn("reachableImports")(function* (entry: string) {
	const seen = new Set<string>();
	const bare = new Set<string>();
	const own = new Set<string>();
	const queue = [resolve(SRC, entry)];
	while (queue.length > 0) {
		const file = queue.pop();
		if (file === undefined || seen.has(file)) continue;
		seen.add(file);
		const inside = !relative(SRC, file).startsWith("../");
		for (const specifier of (yield* runtimeSpecifiers(readFileSync(file, "utf8")))) {
			if (specifier.startsWith(".")) {
				const target = resolve(dirname(file), specifier.replace(/\.js$/, ".ts"));
				const [up, sibling] = relative(SRC, target).split("/");
				if (inside && up === "..") own.add(`@effected/${sibling}`);
				queue.push(target);
			} else {
				bare.add(specifier);
				if (inside) own.add(specifier);
			}
		}
	}
	return { files: seen, bare, own };
});

/** Every bare (non-relative) specifier reachable at runtime from `entry`. */
const reachableBareImports = Effect.fn("reachableBareImports")(function* (entry: string) { return (yield* reachableImports(entry)).bare; });

const reachesSigstore = Effect.fn("reachesSigstore")(function* (entry: string) { return [...(yield* reachableBareImports(entry))].some((specifier) => specifier.startsWith("@sigstore/")); });

describe("bundle reachability", () => {
	it.effect("the walker does not lose imports after a /*-bearing token in prose", Effect.fnUntraced(function* () {
		// The stripper's own regression test, self-contained rather than relying on
		// the real sources. Every other assertion here happens to discriminate only
		// because this package's prose contains `@sigstore/*` in a line comment;
		// reword those comments and the ordering bug becomes undetectable again,
		// with the suite still green. This fixture cannot be reworded away.
		//
		// The token must sit in a LINE comment. Inside a block comment a `/*` is
		// swallowed by its own container and cannot open anything, so a
		// block-comment fixture passes with or without the fix — a fixture that
		// proves nothing, which is the trap this test exists to avoid.
		const fixture = [
			"// Prose naming a scope like @sigstore/* and a glob like src/* here.",
			'import { Schema } from "effect";',
			"/** A real doc comment, whose close is the phantom comment's close. */",
			'import { License } from "@beep/spdx";',
			"export const x = [Schema, License];",
			"export class ReadError {",
			'  message = `Failed to read package.json from "${this.path}"`;',
			"}",
			'import type { Package } from "@beep/package-json";',
			'export type { Person } from "@beep/package-json";',
		].join("\n");
		assert.deepStrictEqual([...(yield* runtimeSpecifiers(fixture))], ["effect", "@beep/spdx"]);
	}, Effect.scoped, Effect.provide(nativeLayer)));

	it.effect("the signer DOES reach @sigstore/*", Effect.fnUntraced(function* () {
		// The control. Without it, every assertion below could pass because the
		// walker is broken rather than because the edge is absent — the classic
		// test that cannot fail.
		assert.isTrue((yield* reachesSigstore("SigstoreSigner.ts")));
	}, Effect.scoped, Effect.provide(nativeLayer)));

	it.effect("the entry point reaches the signer, and that is correct", Effect.fnUntraced(function* () {
		// The lab `index.ts` re-exports only `SigstoreSigner`, so of course it
		// reaches Sigstore. The pure models are reachable WITHOUT it from
		// `@beep/sbom`, whose own reachability test pins that closure.
		assert.isTrue(yield* reachesSigstore("index.ts"));
	}, Effect.scoped, Effect.provide(nativeLayer)));

	it.effect("the package declares itself side-effect free", Effect.fnUntraced(function* () {
		// The other half of the mechanism: without this a bundler must assume
		// evaluating an unreferenced module matters, and keeps it.
		const manifest: unknown = JSON.parse(readFileSync(resolve(SRC, "package.json"), "utf8"));
		assertTrue(S.is(Manifest)(manifest));
		assert.strictEqual(manifest.sideEffects, false);
	}, Effect.scoped, Effect.provide(nativeLayer)));

	it.effect("every runtime dependency is declared", Effect.fnUntraced(function* () {
		// A package you import but do not declare is how a peer closure rots.
		//
		// Checked at the package boundary (`own`), as upstream checked its bare
		// edges. Promoted kit modules this module imports itself, such as
		// `@beep/sbom`, are bare package edges and must be declared like any other.
		const manifest: unknown = JSON.parse(readFileSync(resolve(SRC, "package.json"), "utf8"));
		assertTrue(S.is(Manifest)(manifest));
		const declared = new Set([
			...Object.keys(manifest.dependencies ?? {}),
			...Object.keys(manifest.peerDependencies ?? {}),
		]);
		for (const specifier of (yield* reachableImports("index.ts")).own) {
			// A `node:` builtin is not a package and can never appear in a manifest.
			if (specifier.startsWith("node:")) continue;
			const packageName = specifier.startsWith("@")
				? specifier.split("/").slice(0, 2).join("/")
				: specifier.split("/")[0];
			assert.isTrue(declared.has(packageName ?? specifier), `${specifier} is imported but not declared`);
		}
	}, Effect.scoped, Effect.provide(nativeLayer)));

	it.effect("the signer reaches the promoted models through @beep/sbom leaves only", Effect.fnUntraced(function* () {
		// The lab entry point re-exports only the signer, so nothing in the lab
		// aliases `@beep/sbom`; the signer names each model by its leaf.
		const sbomEdges = [...(yield* reachableBareImports("SigstoreSigner.ts"))].filter((specifier) => specifier.startsWith("@beep/sbom")).sort();
		assert.deepStrictEqual(sbomEdges, ["@beep/sbom/IdentityToken", "@beep/sbom/SigstoreBundle"]);
	}, Effect.scoped, Effect.provide(nativeLayer)));
});
