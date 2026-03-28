/**
 * A @effect/cli command to sync data from a url to a typescript file for use in
 * type safe api's
 *
 * @module @beep/cli/commands/SyncDataToTs
 * @since 0.0.0
 */
import {$RepoCliId} from "@beep/identity";
// import {Flag, Command} from "effect/unstable/cli";
// import {Console, Effect, FileSystem, Path} from "effect";
// import {DomainError, findRepoRoot} from "@beep/repo-utils";
import * as Str from "effect/String";
import * as A from "effect/Array";
import * as O from "effect/Option";
import {
//  FilePath,
  LiteralKit,
  NonEmptyTrimmedStr,
  URLStr
} from "@beep/schema";
import * as S from "effect/Schema";
import * as YAML from "yaml";

const $I = $RepoCliId.create("commands/SyncDataToTs");

export class SyncDataToTsInput extends S.Class<SyncDataToTsInput>($I`SyncDataToTsInput`)(
  {},
  $I.annote(
    "SyncDataToTsInput",
    {
      description: "The input to sync data to a ts file"
    }
  )
) {
}

/**
 * The Supported file extensions for the sync-data-to-ts command url's
 *
 * @category Configuration
 * @since 0.0.0
 */
export const ValidExtension = LiteralKit(
  [
    "json",
    "csv"
  ]
)
  .pipe(
    $I.annoteSchema(
      "ValidExtension",
      {
        description: "The Supported file extensions for the sync-data-to-ts command url's"
      }
    )
  );

/**
 * Type of {@link ValidExtension}
 *
 * @category Configuration
 * @since 0.0.0
 */
export type ValidExtension = typeof ValidExtension.Type;

export const filterValidDataSourceURL = S.makeFilter((u: unknown): u is URLStr => URLStr.is(u) && A.some(
  ValidExtension.Options,
  (opt) => Str.endsWith(`.${opt}`)(
      u)
    && Str.startsWith("https://")(
      u)
));

/**
 * A URL that is a valid data source
 *
 * @category Configuration
 * @since 0.0.0
 */
export const ValidDataSourceURL = URLStr.check(
  filterValidDataSourceURL
)
  .pipe(
    S.brand("ValidDataSourceURL"),
    $I.annoteSchema(
      "ValidDataSourceURL",
      {
        description: "A URL that is a valid data source"
      }
    )
  )

/**
 *
 *
 * @category Configuration
 * @since 0.0.0
 */


