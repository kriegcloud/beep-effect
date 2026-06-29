import { format } from "effect/Formatter";
import { NodeInspectSymbol } from "effect/Inspectable";
import { pipeArguments } from "effect/Pipeable";

/**
 * Prototype mixin providing `pipe` plus structural inspection (`toJSON`,
 * `toString`, and the Node inspect hook). Mirrors the effect-internal
 * `PipeInspectableProto` using only public `effect` entry points.
 *
 * @internal
 */
export const PipeInspectableProto = {
  pipe() {
    return pipeArguments(this, arguments);
  },
  toJSON(this: any) {
    return { ...this };
  },
  toString(this: any) {
    return format(this.toJSON(), { ignoreToString: true, space: 2 });
  },
  [NodeInspectSymbol](this: any) {
    return this.toJSON();
  },
};
