import type { UnsafeTypes } from "@beep/types";
import { Atom, Hydration, Registry } from "@effect-atom/atom-react";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Struct from "effect/Struct";

declare global {
  interface Window {
    __ATOM_NEXT_HYDRATED__?: boolean | undefined;
  }
}

/**
 * Helper function to get a key from an atom for debugging/logging purposes
 */
const getAtomKey = (atom: Atom.Atom<UnsafeTypes.UnsafeAny>): string => {
  if (Atom.isSerializable(atom)) {
    return atom[Atom.SerializableTypeId].key;
  }
  return atom.toString();
};

export interface SSROptions {
  /**
   * Timeout for async atom resolution during SSR
   * @default 5000
   */
  readonly timeout?: undefined | number;

  /**
   * Whether to include error states in dehydrated data
   * @default false
   */
  readonly includeErrors?: undefined | boolean;

  /**
   * Custom scheduler for SSR context
   */
  readonly scheduler?: undefined | ((f: () => void) => void);
}

export interface SSRResult {
  /**
   * Dehydrated atom state for client hydration
   */
  readonly dehydratedState: Hydration.DehydratedAtom[];

  /**
   * Any errors that occurred during SSR
   */
  readonly errors: Array<{ readonly atomKey: string; readonly error: unknown }>;

  /**
   * Atoms that timed out during SSR
   */
  readonly timeouts: string[];
}

export const createSSRRegistry = (options: SSROptions = {}): Registry.Registry => {
  const { scheduler = (f) => f() } = options;

  return Registry.make({
    scheduleTask: scheduler,
    defaultIdleTTL: Number.POSITIVE_INFINITY, // Don't cleanup during SSR
  });
};

/**
 * Preload atoms during SSR
 */
export const preloadAtoms = (
  registry: Registry.Registry,
  atoms: Atom.Atom<UnsafeTypes.UnsafeAny>[],
  options: SSROptions = {}
): Effect.Effect<SSRResult, never> =>
  Effect.gen(function* () {
    const { includeErrors = false, timeout = 5000 } = options;
    const errors: Array<{ atomKey: string; error: unknown }> = [];
    const timeouts: string[] = [];

    // Preload all atoms with timeout
    const preloadEffects = A.map(atoms, (atom) =>
      Effect.gen(function* () {
        try {
          yield* Effect.sync(() => registry.get(atom));
        } catch (error) {
          const atomKey = getAtomKey(atom);
          errors.push({ atomKey, error });
        }
      }).pipe(
        Effect.timeout(`${timeout} millis`),
        Effect.catchAll((error) =>
          Effect.sync(() => {
            const atomKey = getAtomKey(atom);
            if (error._tag === "TimeoutException") {
              timeouts.push(atomKey);
            } else {
              errors.push({ atomKey, error });
            }
          })
        )
      )
    );

    // Wait for all preloads to complete or timeout
    yield* Effect.all(preloadEffects, { concurrency: "unbounded" });

    // Dehydrate the registry state
    const dehydratedState = Array.from(Hydration.dehydrate(registry));

    // Filter out errors if not including them
    const finalDehydratedState = includeErrors
      ? dehydratedState
      : A.filter(dehydratedState, (atom) => !A.some(errors, (error) => error.atomKey === atom.key));

    return {
      dehydratedState: finalDehydratedState,
      errors,
      timeouts,
    };
  });

/**
 * Render atoms to static values for SSR
 *
 * @since 0.1.0
 * @category SSR
 */
export const renderAtomsStatic = (
  registry: Registry.Registry,
  atoms: Atom.Atom<UnsafeTypes.UnsafeAny>[]
): Record<string, UnsafeTypes.UnsafeAny> => {
  const staticValues: Record<string, UnsafeTypes.UnsafeAny> = {};

  for (const atom of atoms) {
    try {
      const nodes = registry.getNodes();
      const node = nodes.get(atom);
      if (node) {
        staticValues[getAtomKey(atom)] = registry.get(atom);
      }
    } catch {
      // Ignore errors for static rendering
    }
  }

  return staticValues;
};

/**
 * Create a server-side registry with initial data
 *
 * @since 0.1.0
 * @category SSR
 */
export const createServerRegistry = (
  initialData?: Record<string, UnsafeTypes.UnsafeAny> | undefined,
  options: SSROptions = {}
): Registry.Registry => {
  const registry = createSSRRegistry(options);

  if (initialData) {
    // Hydrate with initial data
    const dehydratedAtoms = A.map(Struct.entries(initialData), ([key, value]) => ({
      key,
      value,
      dehydratedAt: Date.now(),
    }));

    Hydration.hydrate(registry, dehydratedAtoms);
  }

  return registry;
};

/**
 * Extract critical atoms that should be preloaded for SSR
 *
 * @since 0.1.0
 * @category SSR
 */
export const extractCriticalAtoms = (
  registry: Registry.Registry,
  criticalKeys: string[]
): Atom.Atom<UnsafeTypes.UnsafeAny>[] => {
  const nodes = registry.getNodes();
  const criticalAtoms: Atom.Atom<UnsafeTypes.UnsafeAny>[] = [];

  for (const [atomOrKey, _node] of nodes.entries()) {
    // atomOrKey can be either an Atom or a string (serializable key)
    if (typeof atomOrKey === "string") {
      // If it's already a string key, check directly
      if (criticalKeys.includes(atomOrKey)) {
        // We need to get the actual atom from the node
        criticalAtoms.push(_node.atom);
      }
    } else if (criticalKeys.includes(getAtomKey(atomOrKey))) {
      // If it's an atom, get its key and check
      criticalAtoms.push(atomOrKey);
    }
  }

  return criticalAtoms;
};

/**
 * Serialize dehydrated state for client
 *
 * @since 0.1.0
 * @category SSR
 */
export const serializeState = (dehydratedState: Hydration.DehydratedAtom[]): string => {
  try {
    return JSON.stringify(dehydratedState);
  } catch (_error) {
    return "[]";
  }
};

/**
 * Deserialize state on client
 *
 * @since 0.1.0
 * @category SSR
 */
export const deserializeState = (serializedState: string): Hydration.DehydratedAtom[] => {
  try {
    return JSON.parse(serializedState);
  } catch (_error) {
    return [];
  }
};

/**
 * Create a SSR-safe atom that provides fallback values
 *
 * @since 0.1.0
 * @category SSR
 */
export const createSSRAtom = <T>(serverValue: T, clientAtom: Atom.Atom<T>): Atom.Atom<T> => {
  return Atom.make((get) => {
    // During SSR, return server value
    if (typeof window === "undefined") {
      return serverValue;
    }

    // On client, use the actual atom
    return get(clientAtom);
  });
};

/**
 * Check if we're in SSR context
 *
 * @since 0.1.0
 * @category SSR
 */
export const isSSR = (): boolean => {
  return typeof window === "undefined";
};
/**
 * Check if we're in hydration phase
 *
 * @since 0.1.0
 * @category SSR
 */
export const isHydrating = (): boolean => {
  return typeof window !== "undefined" && !window.__ATOM_NEXT_HYDRATED__;
};

/**
 * Mark hydration as complete
 *
 * @since 0.1.0
 * @category SSR
 */
export const markHydrationComplete = (): void => {
  if (typeof window !== "undefined") {
    (window as UnsafeTypes.UnsafeAny).__ATOM_NEXT_HYDRATED__ = true;
  }
};

/**
 * SSR-safe effect that only runs on client
 *
 * @since 0.1.0
 * @category SSR
 */
export const clientOnlyEffect = <A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A | null, E, R> => {
  return Effect.gen(function* () {
    if (isSSR()) {
      return null;
    }
    return yield* effect;
  });
};

/**
 * Create an atom that behaves differently on server vs client
 *
 * @since 0.1.0
 * @category SSR
 */
export const createIsomorphicAtom = <TServer, TClient>(
  serverFactory: () => Atom.Atom<TServer>,
  clientFactory: () => Atom.Atom<TClient>
): Atom.Atom<TServer | TClient> => {
  return Atom.make((get) => {
    if (isSSR()) {
      return get(serverFactory());
    }
    return get(clientFactory());
  });
};
