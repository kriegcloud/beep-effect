/**
 * Object-set subscription listener contracts.
 *
 * @since 0.0.0
 * @module @beep/ontology/objectSet/ObjectSetListener
 */

import type { Osdk } from "../OsdkObjectFrom.js";
import type { ObjectOrInterfaceDefinition, PropertyKeys } from "../ontology/ObjectOrInterface.js";
import type { CompileTimeMetadata } from "../ontology/ObjectTypeDefinition.js";
import type { WirePropertyTypes } from "../ontology/WirePropertyTypes.js";

/**
 * Object-set subscription helper namespace.
 *
 * @since 0.0.0
 * @category models
 */
export namespace ObjectSetSubscription {
  /**
   * Listener callbacks for an object-set subscription.
   *
   * @since 0.0.0
   * @category models
   */
  export interface Listener<
    O extends ObjectOrInterfaceDefinition,
    P extends PropertyKeys<O> = PropertyKeys<O>,
    R extends boolean = false,
  > {
    /** Specific objects have changed and can be immediately updated. */
    onChange?: (objectUpdate: ObjectUpdate<O, P, R>) => void;

    /** The subscription has been successfully established. */
    onSuccessfulSubscription?: () => void;

    /** The object set is outdated and should be re-fetched. */
    onOutOfDate?: () => void;

    /** A fatal subscription error occurred. */
    onError?: (errors: { subscriptionClosed: boolean; error: unknown }) => void;
  }

  /**
   * Options for subscribing to an object set.
   *
   * @since 0.0.0
   * @category models
   */
  export interface Options<
    O extends ObjectOrInterfaceDefinition,
    P extends PropertyKeys<O> = PropertyKeys<O>,
    R extends boolean = false,
  > {
    /** Properties requested in subscription updates. */
    properties?: Array<P>;

    /** Whether `$rid` should be included in updates when allowed. */
    includeRid?: AllFalse<PropertyTypesOnDefMatchesType<O, P, "geotimeSeriesReference">> extends true ? R : false;
  }
}

type ObjectUpdate<O extends ObjectOrInterfaceDefinition, P extends PropertyKeys<O>, R extends boolean = false> = {
  object: R extends false ? Osdk.Instance<O, never, P> : Osdk.Instance<O, "$rid", P>;
  state: "ADDED_OR_UPDATED" | "REMOVED";
};

type PropertyTypesOnDefMatchesType<
  Q extends ObjectOrInterfaceDefinition,
  P extends PropertyKeys<Q>,
  T extends WirePropertyTypes,
> = {
  [K in P]: CompileTimeMetadata<Q>["properties"][K]["type"] extends T ? true : false;
};

type AllFalse<T extends Record<string, boolean>> = Exclude<T[keyof T], false> extends never ? true : false;
