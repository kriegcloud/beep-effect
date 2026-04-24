/**
 * @since 1.0.0
 */

import { $SharedDomainId } from "@beep/identity";
import { O, thunkEffectVoid } from "@beep/utils";
import { Context, Effect } from "effect";

const $I = $SharedDomainId.create("services/SemanticSearch");
/**
 * @since 1.0.0
 * @category Services
 */
export class SemanticSearch extends Context.Service<
  SemanticSearch,
  {
    search(options: { readonly query: string; readonly limit: number }): Effect.Effect<string>;
    updateFile(path: string): Effect.Effect<void>;
    removeFile(path: string): Effect.Effect<void>;
  }
>()($I`SemanticSearch`) {}

/**
 * @since 1.0.0
 * @category Utils
 */
export const maybeUpdateFile = (path: string): Effect.Effect<void> =>
  Effect.serviceOption(SemanticSearch).pipe(
    Effect.flatMap(
      O.match({
        onNone: thunkEffectVoid,
        onSome: (service) => service.updateFile(path),
      })
    )
  );

/**
 * @since 1.0.0
 * @category Utils
 */
export const maybeRemoveFile = (path: string): Effect.Effect<void> =>
  Effect.serviceOption(SemanticSearch).pipe(
    Effect.flatMap(
      O.match({
        onNone: thunkEffectVoid,
        onSome: (service) => service.removeFile(path),
      })
    )
  );
