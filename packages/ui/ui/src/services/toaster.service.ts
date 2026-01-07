import { $UiId } from "@beep/identity/packages";
import type { ToastActionElement, ToastProps } from "@beep/ui/components/toast";
import { Atom, Registry } from "@effect-atom/atom-react";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Queue from "effect/Queue";
import * as Ref from "effect/Ref";

const $I = $UiId.create("services/toaster.service");

export interface Toast extends ToastProps {
  readonly id: string;
  readonly title?: string | undefined;
  readonly description?: React.ReactNode | undefined;
  readonly action?: ToastActionElement | undefined;
}

export const toastsAtom = Atom.make(A.empty<Toast>());

export class ToasterService extends Effect.Service<ToasterService>()($I`ToasterService`, {
  scoped: Effect.gen(function* () {
    const counter = yield* Ref.make(0);
    const removeQueue = yield* Queue.unbounded<string>();
    const registry = yield* Registry.AtomRegistry;

    const nextId = Ref.getAndUpdate(counter, (n) => n + 1).pipe(
      Effect.map((n) => (n % Number.MAX_SAFE_INTEGER).toString())
    );

    function createToast(id: string, toast: Omit<Toast, "id">): Toast {
      return {
        ...toast,
        id,
        open: true,
        onOpenChange: (open) => !open && dismissToast(id),
      };
    }

    function addToast(toast: Omit<Toast, "id">) {
      return nextId.pipe(Effect.andThen((id) => registry.update(toastsAtom, A.prepend(createToast(id, toast)))));
    }

    function removeToast(id: string) {
      return Effect.sync(() =>
        registry.update(
          toastsAtom,
          A.filter((toast) => toast.id !== id)
        )
      );
    }

    function dismissToast(id: string) {
      Queue.unsafeOffer(removeQueue, id);
      registry.update(
        toastsAtom,
        A.map((toast) => (toast.id === id ? { ...toast, open: false } : toast))
      );
    }

    yield* Queue.take(removeQueue).pipe(
      Effect.flatMap((id) => removeToast(id).pipe(Effect.delay("5 seconds"), Effect.fork)),
      Effect.forever,
      Effect.forkScoped,
      Effect.interruptible
    );

    return {
      toast: addToast,
    } as const;
  }),
}) {}
