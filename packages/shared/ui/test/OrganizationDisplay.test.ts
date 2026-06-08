import * as Organization from "@beep/shared-ui/entities/Organization";
import { assert, describe, expect, it } from "@effect/vitest";
import { Effect, Exit } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { FastCheck as fc } from "effect/testing";

const decodeDisplay = S.decodeUnknownEffect(Organization.Display);
const decodeForm = S.decodeUnknownEffect(Organization.Form);
const encodeDisplay = S.encodeEffect(Organization.Display);
const encodeForm = S.encodeEffect(Organization.Form);
const DisplayArbitrary = S.toArbitrary(Organization.Display);
const FormArbitrary = S.toArbitrary(Organization.Form);
const expectFailure = Effect.fn("expectFailure")(function* <A, E>(effect: Effect.Effect<A, E, never>) {
  const exit = yield* Effect.exit(effect);
  assert.strictEqual(Exit.isFailure(exit), true);
});

const displayInput = {
  id: 1,
  legalName: "Acme Legal LLC",
  licenseTier: "team",
  name: "Acme",
  settings: {
    allowAgentActions: true,
    defaultRetentionDays: 90,
  },
  slug: "acme",
} as const;

const formInput = {
  legalName: "Acme Legal LLC",
  licenseTier: "team",
  name: "Acme",
  settings: {
    allowAgentActions: true,
    defaultRetentionDays: 90,
  },
  slug: "acme",
} as const;

describe("Organization UI contracts", () => {
  it.effect(
    "decodes browser-safe display payloads",
    Effect.fnUntraced(function* () {
      const display = yield* decodeDisplay(displayInput);

      expect(display.id).toBe(1);
      expect(display.licenseTier).toBe("team");
      expect(display.settings.defaultRetentionDays).toBe(90);
      expect(O.isNone(display.parentOrgId)).toBe(true);
    })
  );

  it.effect(
    "decodes browser-safe form payloads with parent organizations",
    Effect.fnUntraced(function* () {
      const form = yield* decodeForm({
        ...formInput,
        parentOrgId: 1,
      });

      expect(form.slug).toBe("acme");
      expect(O.getOrThrow(form.parentOrgId)).toBe(1);
    })
  );

  it.effect(
    "decodes null parent organization ids as None",
    Effect.fnUntraced(function* () {
      const display = yield* decodeDisplay({
        ...displayInput,
        parentOrgId: null,
      });
      const form = yield* decodeForm({
        ...formInput,
        parentOrgId: null,
      });

      expect(display.parentOrgId).toEqual(O.none());
      expect(form.parentOrgId).toEqual(O.none());
    })
  );

  it.effect(
    "derives the primary display label from the organization name",
    Effect.fnUntraced(function* () {
      const display = yield* decodeDisplay(displayInput);

      expect(Organization.primaryLabel(display)).toBe("Acme");
    })
  );

  it.effect(
    "encodes nullish parent organization ids for browser payloads",
    Effect.fnUntraced(function* () {
      const withoutParent = yield* decodeDisplay(displayInput);
      const withParent = yield* decodeDisplay({
        ...displayInput,
        parentOrgId: 1,
      });
      const formWithoutParent = yield* decodeForm(formInput);

      expect((yield* encodeDisplay(withoutParent)).parentOrgId).toBeNull();
      expect((yield* encodeDisplay(withParent)).parentOrgId).toBe(1);
      expect((yield* encodeForm(formWithoutParent)).parentOrgId).toBeNull();
    })
  );

  it("round-trips schema-derived browser organization payloads", () =>
    fc.assert(
      fc.asyncProperty(DisplayArbitrary, FormArbitrary, async (display, form) => {
        const encodedDisplay = await Effect.runPromise(encodeDisplay(display));
        const decodedDisplay = await Effect.runPromise(decodeDisplay(encodedDisplay));
        const reencodedDisplay = await Effect.runPromise(encodeDisplay(decodedDisplay));
        const encodedForm = await Effect.runPromise(encodeForm(form));
        const decodedForm = await Effect.runPromise(decodeForm(encodedForm));
        const reencodedForm = await Effect.runPromise(encodeForm(decodedForm));

        assert.instanceOf(decodedDisplay, Organization.Display);
        assert.instanceOf(decodedForm, Organization.Form);
        expect(reencodedDisplay).toEqual(encodedDisplay);
        expect(reencodedForm).toEqual(encodedForm);
        expect(Organization.primaryLabel(decodedDisplay)).toBe(decodedDisplay.name);
      }),
      { numRuns: 50 }
    ));

  it.effect(
    "rejects invalid browser-safe organization payload fields",
    Effect.fnUntraced(function* () {
      yield* expectFailure(
        decodeDisplay({
          ...displayInput,
          licenseTier: "custom",
        })
      );
      yield* expectFailure(
        decodeDisplay({
          ...displayInput,
          name: "",
        })
      );
      yield* expectFailure(
        decodeDisplay({
          ...displayInput,
          settings: {
            ...displayInput.settings,
            defaultRetentionDays: 0,
          },
        })
      );
      yield* expectFailure(
        decodeDisplay({
          ...displayInput,
          slug: "Invalid Slug",
        })
      );
    })
  );
});
