export * from "effect/Context";

import * as Context from "effect/Context";

export const Tag = (id: string) =>
  <Self, Shape>() =>
    Context.Service<Self, Shape>()(id);
