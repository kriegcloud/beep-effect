/**
Copyright 2024 Palantir Technologies, Inc.

Licensed under Palantir's License;
you may not use this file except in compliance with the License.
You may obtain a copy of the License from the root of this repository at LICENSE.md

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */

/**
 * Final composite 'async' loading types.
 * 
 * @type V The value type
 * @type E The error type, defaults to `unknown`
 */
export type IAsyncValue<V, E = unknown> =
  | IAsyncValue_NotStarted
  | IAsyncValue_Loading
  | IAsyncValue_Loaded<V>
  | IAsyncValue_Reloading<V>
  | IAsyncValue_Failed<E>;

/**
 * State that represents that loading hasn't started yet.
 */
interface IAsyncValue_NotStarted {
  status: "NOT_STARTED" | undefined;
}

/**
 * State that represents that loading is in progress.
 */
interface IAsyncValue_Loading {
  status: "LOADING";
}

/**
 * State that represents that loading has completed successfully.
 * 
 * @type V: The value type
 */
interface IAsyncValue_Loaded<V> {
  status: "LOADED";
  value: V;
}

/**
 * State that represents that reloading is in progress.
 * 
 * @type V: The value type
 */
interface IAsyncValue_Reloading<V> {
  progress?: number;
  status: "RELOADING";
  value: V;
}

/**
 * State that represents that loading failed.
 * 
 * @type E: The error type
 */
interface IAsyncValue_Failed<E> {
  status: "FAILED";
  error: E;
}

/**
 * Helper function for creating "not started" async loading state.
 */
export function asyncValueNotStarted(): IAsyncValue_NotStarted {
  return {
    status: undefined,
  };
}

/**
 * Helper function for creating "loading" async loading state.
 */
export function asyncValueLoading(): IAsyncValue_Loading {
  return {
    status: "LOADING",
  };
}

/**
 * Helper function for creating the "loaded" async loading state.
 * 
 * @param value: The loaded value
 * @type V: The value type
 */
export function asyncValueLoaded<V>(value: V): IAsyncValue_Loaded<V> {
  return {
    status: "LOADED",
    value,
  };
}

/**
 * Helper function for creating the "failed" async loading state.
 * 
 * @param error: The error associated with the reason behind the failure
 * @type E: The error type
 */
export function asyncValueFailed<E>(error: E): IAsyncValue_Failed<E> {
  return {
    status: "FAILED",
    error,
  };
}

/**
 * Helper function for creating the "failed" async loading state.
 * 
 * @param value: The previously loaded value
 * @param progress: The loading progress percentage
 * @type V: The value type
 */
export function asyncValueReloading<V>(
  value: V,
  progress?: number
): IAsyncValue_Reloading<V> {
  return {
    progress,
    status: "RELOADING",
    value,
  };
}

/**
 * Type guard for "not started" async loaded state.
 * 
 * @param state: The async loaded state to type check
 * @type V: The value type
 * @type E: The error type
 * @returns true only if the asyncloaded state is "not started".
 */
export function isAsyncValue_NotStarted<V, E>(
  state: IAsyncValue<V, E> | undefined
): state is IAsyncValue_NotStarted | undefined {
  return (
    state == null || state.status == null || state.status === "NOT_STARTED"
  );
}

/**
 * Type guard for "loading" async loaded state.
 * 
 * @param state: The async loaded state to type check
 * @type V: The value type
 * @type E: The error type
 * @returns true only if the asyncloaded state is "loading".
 */
export function isAsyncValue_Loading<V, E>(
  state: IAsyncValue<V, E> | undefined
): state is IAsyncValue_Loading {
  return state != null && state.status === "LOADING";
}

/**
 * Type guard for "loaded" async loaded state.
 * 
 * @param state: The async loaded state to type check
 * @type V: The value type
 * @type E: The error type
 * @returns true only if the asyncloaded state is "loaded".
 */
export function isAsyncValue_Loaded<V, E>(
  state: IAsyncValue<V, E> | undefined
): state is IAsyncValue_Loaded<V> {
  return state != null && state.status === "LOADED";
}

/**
 * Type guard for "reloading" async loaded state.
 * 
 * @param state: The async loaded state to type check
 * @type V: The value type
 * @type E: The error type
 * @returns true only if the asyncloaded state is "reloading".
 */
export function isAsyncValue_Reloading<V, E>(
  state: IAsyncValue<V, E> | undefined
): state is IAsyncValue_Reloading<V> {
  return state != null && state.status === "RELOADING";
}

/**
 * Type guard for "failed loading" async loaded state.
 * 
 * @param state: The async loaded state to type check
 * @type V: The value type
 * @type E: The error type
 * @returns true only if the asyncloaded state is "failed loading".
 */
export function isAsyncValue_FailedLoading<V, E>(
  state: IAsyncValue<V, E> | undefined
): state is IAsyncValue_Failed<E> {
  return state != null && state.status === "FAILED";
}

/**
 * A visitor with all possible async states
 */
export interface IAsyncValueVisitor<V, R, E = unknown> {
  loading: () => R;
  succeeded: (value: V) => R;
  reloading: (previousValue: V) => R;
  failed: (error: E) => R;
}

/**
 * A visitor function to visit an IAsyncValue
 */
export function visitLoadingState<V, R, E = unknown>(
  state: IAsyncValue<V, E>,
  visitor: IAsyncValueVisitor<V, R, E>,
): R {
  if (isAsyncValue_Loading(state) || isAsyncValue_NotStarted(state)) {
      return visitor.loading();
  } else if (isAsyncValue_Reloading(state)) {
      return visitor.reloading(state.value);
  } else if (isAsyncValue_FailedLoading(state)) {
      return visitor.failed(state.error);
  }

  // state.status === "LOADED"
  return visitor.succeeded(state.value);
}