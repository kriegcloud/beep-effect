/**
 * Logger interface used by ontology API clients.
 *
 * @since 0.0.0
 * @module @beep/ontology/Logger
 */

/**
 * Logging methods available to ontology runtime helpers.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export interface Logger {
  readonly trace: Logger.LogFn;
  readonly debug: Logger.LogFn;
  readonly fatal: Logger.LogFn;
  readonly error: Logger.LogFn;
  readonly warn: Logger.LogFn;
  readonly info: Logger.LogFn;

  readonly isLevelEnabled: (level: string) => boolean;

  readonly child: (
    bindings: Readonly<Record<string, unknown>>,
    options?: {
      readonly level?: string;
      readonly msgPrefix?: string;
    }
  ) => Logger;
}

/**
 * Utility types for {@link Logger}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export declare namespace Logger {
  /**
   * Structured logger call signature.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  export interface LogFn {
    (obj: unknown, msg?: string, ...args: Array<unknown>): void;
    (msg: string, ...args: Array<unknown>): void;
  }
}
