import { assert, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { dual } from "effect/Function";
import * as P from "effect/Predicate";
import { createElement } from "react";
import type { ReactElement } from "react";
import { holderSlot } from "../../../../effected/cli/ui/internal/Holder.ts";

it.effect("unbound swaps are refused and repeated commit notifications release each waiter only once", () =>
  Effect.sync(() => {
    const slot = holderSlot();
    const element = createElement("test");
    assert.isFalse(slot.swap(element));
    let notify: (() => void) | undefined;
    let commits = 0;
    slot.bind(dual((args) => P.isObjectKeyword(args[0]) && !P.isFunction(args[0]), (next: ReactElement, committed?: () => void): void => {
      assert.strictEqual(next, element);
      notify = committed;
    }));
    assert.isTrue(slot.swap(element, () => { commits++; }));
    assert.isDefined(notify);
    notify?.();
    notify?.();
    assert.strictEqual(commits, 1);
    slot.bind(undefined);
    notify?.();
    assert.strictEqual(commits, 1);
  }),
);
