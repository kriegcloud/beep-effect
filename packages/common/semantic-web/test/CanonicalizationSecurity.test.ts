import { CanonicalizationServiceLive } from "@beep/semantic-web/adapters/canonicalization";
import { Dataset, makeDataset, makeLiteral, makeNamedNode, makeQuad } from "@beep/semantic-web/rdf";
import { CanonicalizationService, CanonicalizeDatasetRequest } from "@beep/semantic-web/services/canonicalization";
import { XSD_STRING } from "@beep/semantic-web/vocab/xsd";
import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import * as S from "effect/Schema";
import { afterEach, vi } from "vitest";

const { canonizeMock } = vi.hoisted(() => ({
  canonizeMock: vi.fn(),
}));

vi.mock("rdf-canonize", async () => {
  const actual = await vi.importActual<typeof import("rdf-canonize")>("rdf-canonize");
  return {
    ...actual,
    canonize: canonizeMock,
  };
});

const decodeUnknownSync = <Schema extends S.Decoder<unknown, never>>(schema: Schema) => S.decodeUnknownSync(schema);

const dataset = makeDataset([
  makeQuad(
    makeNamedNode("https://example.com/people/alice"),
    makeNamedNode("https://schema.org/name"),
    makeLiteral("Alice", XSD_STRING.value)
  ),
  makeQuad(makeNamedNode("https://example.com/people/alice"), makeNamedNode("https://schema.org/knows"), {
    object: makeNamedNode("https://example.com/people/bob"),
  }),
]);

const runCanonicalization = <A>(effect: Effect.Effect<A, unknown, CanonicalizationService>) =>
  Effect.runPromise(effect.pipe(Effect.provide(CanonicalizationServiceLive)));

const expectSemanticBudgetFailure = (error: Error) => {
  canonizeMock.mockRejectedValueOnce(error);

  return expect(
    runCanonicalization(
      Effect.gen(function* () {
        const service = yield* CanonicalizationService;
        return yield* service.canonicalize(
          decodeUnknownSync(CanonicalizeDatasetRequest)({
            dataset: S.encodeSync(Dataset)(dataset),
            algorithm: "rdfc-1.0",
          })
        );
      })
    )
  ).rejects.toMatchObject({
    reason: "workLimitExceeded",
    message: expect.stringContaining("configured resource budget"),
  });
};

afterEach(() => {
  canonizeMock.mockReset();
});

describe("Canonicalization security hardening", () => {
  it("passes explicit resource controls to rdf-canonize for semantic canonicalization", async () => {
    const actual = await vi.importActual<typeof import("rdf-canonize")>("rdf-canonize");
    canonizeMock.mockImplementation(actual.canonize);

    await runCanonicalization(
      Effect.gen(function* () {
        const service = yield* CanonicalizationService;
        return yield* service.canonicalize(
          decodeUnknownSync(CanonicalizeDatasetRequest)({
            dataset: S.encodeSync(Dataset)(dataset),
            algorithm: "rdfc-1.0",
          })
        );
      })
    );

    expect(canonizeMock).toHaveBeenCalledTimes(1);
    const call = canonizeMock.mock.calls[0];
    expect(call).toBeDefined();

    if (!call) {
      return;
    }

    const [, options] = call;
    expect(options.algorithm).toBe("RDFC-1.0");
    expect(options.format).toBe("application/n-quads");
    expect(options.maxWorkFactor).toBe(1);
    expect(options.signal).toBeInstanceOf(AbortSignal);
  });

  it("maps semantic resource-budget failures to work-limit errors", async () => {
    await expectSemanticBudgetFailure(new Error("Maximum deep iterations exceeded (8)."));
  });

  it("maps abort-signal budget failures to work-limit errors", async () => {
    await expectSemanticBudgetFailure(new Error("Abort signal received"));
  });

  it("maps timeout-style budget failures to work-limit errors", async () => {
    const timeoutError = new Error("signal timed out");
    timeoutError.name = "TimeoutError";

    await expectSemanticBudgetFailure(timeoutError);
  });
});
