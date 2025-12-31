import type { ColumnType } from "@beep/bsl/schemas";

export interface Any {
  readonly id: string;
  readonly name: string;
  readonly type: ColumnType.Type;
  readonly primaryKey?: undefined | boolean;
  readonly unique?: boolean | undefined;
  readonly autoIncrement?: boolean | undefined;
  /**
   * Static SQL default value evaluated by the database.
   * @example 'now()', "'active'", '1'
   */
  readonly default?: string | undefined;
  /**
   * Alias for `$defaultFn` - runtime function called by Drizzle on INSERT.
   */
  readonly $default?: (() => unknown) | undefined;
  /**
   * Runtime function called by Drizzle on INSERT when value is undefined.
   * @example () => crypto.randomUUID()
   */
  readonly $defaultFn?: (() => unknown) | undefined;
  /**
   * Alias for `$onUpdateFn` - runtime function called by Drizzle on UPDATE.
   */
  readonly $onUpdate?: (() => unknown) | undefined;
  /**
   * Runtime function called by Drizzle on UPDATE when value is undefined.
   * Also used on INSERT if no `$defaultFn` is provided.
   * @example () => new Date().toISOString()
   */
  readonly $onUpdateFn?: (() => unknown) | undefined;
}
