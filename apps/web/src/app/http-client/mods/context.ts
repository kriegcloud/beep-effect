import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";

type CurrentUserShape = O.Option<{
  readonly id: string;
  readonly email: string;
}>;

export class CurrentUser extends Context.Tag("CurrentUser")<CurrentUser, CurrentUserShape>() {
  static readonly provide = (currentUser: CurrentUserShape) => Effect.provideService(this, currentUser);

  static readonly Test = Layer.succeed(
    this,
    O.some({
      id: "1",
      email: "test@example.com",
    })
  );
}

export class UserRepository extends Effect.Service<UserRepository>()("UserRepository", {
  dependencies: [],
  effect: Effect.gen(function* () {
    return {
      getUser: () => Effect.dieMessage("beep"),
    };
  }),
}) {
  static readonly Test = Layer.mock(this, {
    _tag: "UserRepository",
    getUser: () => Effect.dieMessage("beep"),
  });
}

// export class CurrentUser extends Context.Reference<CurrentUser>()(
//   "Current",
//   { defaultValue: O.none<CurrentUserShape> }
// ) {}
