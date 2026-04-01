/**
 *
 *
 * @module @beep/repo-cli/commands/DocgenV2/File
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import { FilePath } from "@beep/schema";

import * as S from "effect/Schema";

const $I = $RepoCliId.create("commands/DocgenV2/File");

/**
 * Represents a file which can be optionally overwriteable.
 *
 * @category DomainModel
 * @since 1.0.0
 */
export class File extends S.Class<File>($I`File`)(
  {
    path: FilePath,
    content: S.String,
    isOverwriteable: S.Boolean,
  },
  $I.annote("File", {
    description: "Represents a file which can be optionally overwriteable.",
  })
) {}

/**
 * By default files are readonly (`isOverwriteable = false`).
 *
 * @category constructors
 * @since 1.0.0
 */
export const createFile = (path: FilePath, content: string, isOverwriteable = false): File =>
  new File({
    path,
    content,
    isOverwriteable,
  });
