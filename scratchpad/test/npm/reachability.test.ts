// @effect-diagnostics nodeBuiltinImport:skip-file -- nodeBuiltinImport because it scans the lab's own source tree synchronously at test collection. Owner: @beep/scratchpad. Exit: effected-promotion graduates the module and ports this test to @effect/vitest layer() and Effect platform services.
// The tier guardrail, asserted rather than trusted to review.
//
// `@effected/npm` became boundary tier when NpmRegistry and PackagePublish
// landed, but `@effected/lockfiles` (PURE) and `@effected/package-json` depend
// on it for vocabulary only — `IntegrityHash`, `DependencySpecifier`, the
// section literals. Those consumers must be able to import the vocabulary
// without linking an HTTP client or a subprocess runner.
//
// Since the effected promotion the vocabulary lives in `@beep/npm-spec`
// (`packages/foundation/modeling/npm-spec/src`) and the driver half stays here.
// Two things protect the split, and both are checkable from the source graph:
//   1. the vocabulary modules import neither driver module, nor
//      `@beep/commands`, nor the core HTTP or process modules;
//   2. both entrypoints export every symbol individually — a namespace object
//      would be one live binding and would retain the whole graph.
//
// This is a source-level check because ESM offers no module-graph
// introspection at runtime; the import edges ARE the reachability.

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { assert, describe, it } from "@effect/vitest";

/** The deferred driver half, still in the scratchpad. */
const SRC = fileURLToPath(new URL("../../effected/npm/", import.meta.url));

/** The promoted pure vocabulary, `@beep/npm-spec`. */
const SPEC_SRC = fileURLToPath(new URL("../../../packages/foundation/modeling/npm-spec/src/", import.meta.url));

/** The modules a contracts-only consumer imports. */
const VOCABULARY = [
	"IntegrityHash.ts",
	"DependencySpecifier.ts",
	"PackageManagerPin.ts",
	"PackageManagerCache.ts",
	"DependencySection.ts",
	"ReleaseAgeGate.ts",
	"CatalogResolver.ts",
	"WorkspaceResolver.ts",
	"CatalogAssemblyError.ts",
	"Manifest.ts",
	"RegistryCredential.ts",
	"RegistryKind.ts",
	"index.ts",
];

/** Driver modules that reach IO, directly or transitively, by any specifier. */
const IO_MODULES = ["NpmRegistry", "PackagePublish", "PackageTarball", "NpmExecutor"];

/** Packages and core modules that reach IO; a subpath import such as `@beep/commands/Run` counts as well. */
const IO_PACKAGES = ["@beep/commands", "@beep/scratchpad", "effect/http", "effect/process"];

const read = (file: string): string => readFileSync(join(SRC, file), "utf8");

const readSpec = (file: string): string => readFileSync(join(SPEC_SRC, file), "utf8");

/** Every import specifier in comment-stripped source. */
const specifiersOf = (code: string): ReadonlyArray<string> =>
	Array.from(code.matchAll(/from\s*["']([^"']+)["']/g), (match) => match[1] ?? "");

/**
 * Source with comments removed, so an import that exists only in an
 * `@example` block is not mistaken for a real edge. Four of the modules
 * checked below already carry `@example` blocks, and a guardrail is exactly
 * the thing someone illustrates with a "never do this" import.
 *
 * LINE comments come out FIRST, and the ordering is load-bearing rather than
 * stylistic. Prose containing a `/*`-bearing token — a glob like `src/[*]`, or
 * a scope like `@effected/[*]` — opens a block comment as far as a regex is
 * concerned; stripping blocks first deletes everything from that word to the
 * end of the next doc comment, real imports included. In this suite that
 * direction is doubly bad: a devoured import makes the confinement assertion
 * PASS, so the guardrail would report success precisely when it had stopped
 * looking. Blocks cannot nest, so once the fake openers are gone a `/*` inside
 * a real block comment is harmless.
 */
const stripComments = (source: string): string =>
	source.replace(/(^|\n)\s*\/\/.*/g, "$1").replace(/\/\*[\s\S]*?\*\//g, "");

describe("tier guardrail: the pure vocabulary does not reach IO", () => {
	for (const module of VOCABULARY) {
		it(`${module} imports no IO module`, () => {
			const specifiers = specifiersOf(stripComments(readSpec(module)));
			for (const specifier of specifiers) {
				for (const io of IO_MODULES) {
					assert.notMatch(
						specifier,
						new RegExp(`(^|/)${io}(\\.ts)?$`),
						`${module} must not import ${io} — a contracts-only consumer would link it`,
					);
				}
				for (const io of IO_PACKAGES) {
					assert.isFalse(
						specifier === io || specifier.startsWith(`${io}/`),
						`${module} must not import ${io} — a contracts-only consumer would link it`,
					);
				}
			}
		});
	}

	// The discriminating case. A LINE comment mentioning a glob or a scoped
	// wildcard used to open a phantom block comment that ran to the end of the
	// next doc comment, swallowing every import between — and this suite reads a
	// swallowed import as "no edge", i.e. as a pass.
	//
	// Two things about this test were wrong on the first draft and are worth not
	// repeating: the token must sit in a LINE comment (inside a block comment a
	// `/*` is swallowed by its own comment and is harmless), and the body must be
	// the test function itself — an `it(name, () => (…) => {…})` returns a
	// closure that never runs, and passes unconditionally.
	it("the comment stripper does not devour code after a /*-bearing token", () => {
		const fixture = [
			"// Prose naming a glob like src/* and a scope like @effected/* here.",
			'import { Run } from "@beep/commands";',
			"/** A real doc comment, whose close is the phantom's close. */",
			"export const x = Run;",
		].join("\n");
		const stripped = stripComments(fixture);
		assert.include(stripped, 'from "@beep/commands"', "a real import must survive the stripper");
		assert.notInclude(stripped, "Prose naming a glob", "prose must not survive the stripper");
	});

	it("every vocabulary module in VOCABULARY actually exists", () => {
		// Guards the list itself: a renamed module would silently drop out of the
		// check above and the suite would still pass.
		const present = new Set(readdirSync(SPEC_SRC).filter((f) => f.endsWith(".ts")));
		for (const module of VOCABULARY) {
			assert.isTrue(present.has(module), `${module} is listed but missing from @beep/npm-spec src/`);
		}
	});

	it("every @beep/npm-spec module is listed in VOCABULARY", () => {
		// The converse guard: a module added to the package must be checked too.
		const listed = new Set(VOCABULARY);
		for (const module of readdirSync(SPEC_SRC).filter((f) => f.endsWith(".ts"))) {
			assert.isTrue(listed.has(module), `${module} is in @beep/npm-spec src/ but not in VOCABULARY`);
		}
	});

	it("the specifier matcher sees a driver import", () => {
		const fixture = 'import { NpmRegistry } from "@beep/scratchpad/effected/npm/NpmRegistry";';
		assert.deepStrictEqual(specifiersOf(fixture), ["@beep/scratchpad/effected/npm/NpmRegistry"]);
	});
});

describe("tier guardrail: the entrypoint exports individually", () => {
	it("neither index.ts declares a namespace object over the surface", () => {
		// Stripped, so the prohibition can be WRITTEN DOWN in this file's own
		// prose without failing the check that enforces it. (The package context
		// file already spells `export * as` out in exactly that way.)
		for (const code of [stripComments(read("index.ts")), stripComments(readSpec("index.ts"))]) {
			// `export * as X from` is the namespace-object form; a bundler cannot see
			// through it, so one import of the vocabulary would retain every service.
			assert.notMatch(
				code,
				/export\s+\*\s+as\s/,
				"index.ts must not export a namespace object — it defeats tree-shaking for every consumer",
			);
		}
	});

	it("index.ts exports the services by name", () => {
		// This assertion had THREE ways to pass without the export existing, all of
		// them the false-PASS direction, and a mutant (delete the export, leave a
		// comment naming it) survived the first two fixes:
		//
		// 1. a COMMENT naming `NpmRegistry` — closed by stripping comments;
		// 2. the module SPECIFIER `from "./NpmRegistry.ts"`, which contains the
		//    name — closed by removing specifiers before matching;
		// 3. a neighbouring identifier that merely CONTAINS the name, here
		//    `type NpmRegistryShape` — closed by matching on a word boundary
		//    rather than as a substring.
		//
		// Only all three together make the test fail when the export is gone.
		const code = stripComments(read("index.ts")).replace(/from\s*["'][^"']+["']/g, "");
		assert.match(code, /\bNpmRegistry\b/, "index.ts must export NpmRegistry by name");
		assert.match(code, /\bPackagePublish\b/, "index.ts must export PackagePublish by name");
	});
});
