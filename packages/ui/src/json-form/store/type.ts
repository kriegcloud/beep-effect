import { BS } from "@beep/schema";
import type { StringTypes } from "@beep/types";
import * as S from "effect/Schema";
export class Action extends BS.Class<Action>("Action")(
  {
    type: BS.SnakeTag,
  },
  {
    schemaId: Symbol.for("@beep/ui/form/store/Action"),
    identifier: "Action",
    title: "Action",
    description: "Base class for actions.",
  }
) {}

export namespace Action {
  /**
   * An Action type which accepts any other properties.
   * This is mainly for the use of the `Reducer` type.
   * This is not part of `Action` itself to prevent types that extend `Action` from
   * having an index signature.
   */
  export type Type<T extends StringTypes.NonEmptyString<string> = StringTypes.NonEmptyString<string>> = {
    readonly type: T;
  };
  export type Encoded<T extends StringTypes.NonEmptyString<string> = StringTypes.NonEmptyString<string>> = {
    readonly type: T;
  };
}

/**
 * An Action type which accepts any other properties.
 * This is mainly for the use of the `Reducer` type.
 * This is not part of `Action` itself to prevent types that extend `Action` from
 * having an index signature.
 */
export class AnyAction extends Action.extend<AnyAction>("AnyAction")(
  S.Struct(
    {},
    // Allows any extra properties to be defined in an action.
    S.Record({
      key: S.NonEmptyString,
      value: S.Any,
    })
  ),
  {
    schemaId: Symbol.for("@beep/ui/form/store/AnyAction"),
    identifier: "AnyAction",
    title: "Any Action",
    description: "An action type which accepts any other properties.",
    documentation:
      "An Action type which accepts any other properties.\nThis is mainly for the use of the `Reducer` type.\nThis is not part of `Action` itself to prevent types that extend `Action` from\nhaving an index signature.",
  }
) {}

export namespace AnyAction {
  export type Type = S.Schema.Type<typeof AnyAction>;
  export type Encoded = S.Schema.Encoded<typeof AnyAction>;
}

export namespace Dispatch {
  /**
   * A *dispatching function* (or simply *dispatch function*) is a function that
   * accepts an action or an async action; it then may or may not dispatch one
   * or more actions to the store.
   *
   * We must distinguish between dispatching functions in general and the base
   * `dispatch` function provided by the store instance without any middleware.
   *
   * The base dispatch function *always* synchronously sends an action to the
   * store's reducer, along with the previous state returned by the store, to
   * calculate a new state. It expects actions to be plain objects ready to be
   * consumed by the reducer.
   *
   * Middleware wraps the base dispatch function. It allows the dispatch
   * function to handle async actions in addition to actions. Middleware may
   * transform, delay, ignore, or otherwise interpret actions or async actions
   * before passing them to the next middleware.
   *
   * @template A The type of things (actions or otherwise) which may be
   *   dispatched.
   */
  export type Type<A extends Action.Type = AnyAction.Type> = <T extends A>(action: T) => T;
}
