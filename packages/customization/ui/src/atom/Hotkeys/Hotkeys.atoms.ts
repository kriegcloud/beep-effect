import { UserHotkey } from "@beep/customization-domain/entities";
import { $CustomizationUiId } from "@beep/identity/packages";
import { deepEqual } from "@beep/utils/equality";
import { Atom, Registry } from "@effect-atom/atom-react";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";

const $I = $CustomizationUiId.create("atom/Hotkeys/Hotkeys.atoms");

// -- Scope state (Atom.family per scope + global wildcard) --

const globalScopeAtom = Atom.make(true);

const scopeActiveFamily = Atom.family((_scope: string) => Atom.make(false));

const knownScopesAtom = Atom.make<ReadonlyArray<string>>(A.empty<string>());

export const activeScopesAtom = Atom.make((get) => {
  if (get(globalScopeAtom)) {
    return A.make("*");
  }
  const known = get(knownScopesAtom);
  return A.filter(known, (scope) => get(scopeActiveFamily(scope)));
});

const trackScope = (registry: Registry.Registry, scope: string): void => {
  const known = registry.get(knownScopesAtom);
  if (!A.contains(known, scope)) {
    registry.set(knownScopesAtom, A.append(known, scope));
  }
};

export const enableScopeAtom = Atom.fn(
  Effect.fn("enableScopeAtom")(function* (scope: string) {
    const registry = yield* Registry.AtomRegistry;

    trackScope(registry, scope);
    registry.set(globalScopeAtom, false);
    registry.set(scopeActiveFamily(scope), true);
  })
);

export const disableScopeAtom = Atom.fn(
  Effect.fn("disableScopeAtom")(function* (scope: string) {
    const registry = yield* Registry.AtomRegistry;

    registry.set(scopeActiveFamily(scope), false);
  })
);

export const toggleScopeAtom = Atom.fn(
  Effect.fn("toggleScopeAtom")(function* (scope: string) {
    const registry = yield* Registry.AtomRegistry;

    trackScope(registry, scope);

    const isActive = registry.get(scopeActiveFamily(scope));
    const isGlobal = registry.get(globalScopeAtom);

    if (isActive && !isGlobal) {
      registry.set(scopeActiveFamily(scope), false);
    } else {
      registry.set(globalScopeAtom, false);
      registry.set(scopeActiveFamily(scope), true);
    }
  })
);

// -- Bound hotkeys --

const boundHotkeysAtom = Atom.make(A.empty<UserHotkey.Hotkey>());

export const addBoundHotkeyAtom = Atom.fn(
  Effect.fn("addBoundHotkeyAtom")(function* (hotkey: UserHotkey.Hotkey) {
    const registry = yield* Registry.AtomRegistry;

    const boundHotkeys = registry.get(boundHotkeysAtom);

    registry.set(boundHotkeysAtom, A.append(boundHotkeys, hotkey));
  })
);

export const removeBoundHotkeyAtom = Atom.fn(
  Effect.fn("removeBoundHotkeyAtom")(function* (hotkey: UserHotkey.Hotkey) {
    const registry = yield* Registry.AtomRegistry;

    const boundHotkeys = registry.get(boundHotkeysAtom);

    registry.set(
      boundHotkeysAtom,
      A.filter(
        boundHotkeys,
        P.not((bh) => deepEqual(bh, hotkey))
      )
    );
  })
);

export class HotkeysContextType extends S.Class<HotkeysContextType>($I`HotkeysContextType`)({
  hotkeys: S.Array(UserHotkey.Hotkey),
  activeScopes: S.Array(S.String),
}) {}
