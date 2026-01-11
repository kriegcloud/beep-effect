import { isLocationDefined, isLocationNullable, isWindowUndefined, thunk } from "@beep/utils";
import { Atom } from "@effect-atom/atom-react";
import * as Bool from "effect/Boolean";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Str from "effect/String";

const getHash = () =>
  Bool.match(isLocationDefined, {
    onFalse: O.none<string>,
    onTrue: F.pipe(location.hash, Str.slice(1), O.liftPredicate(Str.isNonEmpty), thunk),
  });

export const hashAtom = Atom.make<O.Option<string>>((get) => {
  if (isLocationNullable || isWindowUndefined) {
    return O.none<string>();
  }

  function onHashChange() {
    get.setSelf(getHash());
  }

  window.addEventListener("hashchange", onHashChange);
  get.addFinalizer(() => {
    window.removeEventListener("hashchange", onHashChange);
  });

  return getHash();
});
