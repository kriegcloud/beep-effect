/**
 * @module @beep/repo-cli/commands/DocgenV2/File
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import { FilePath } from "@beep/schema";

import * as S from "effect/Schema";

const $I = $RepoCliId.create("commands/DocgenV2/File");

/**
 * Represents a file which can be optionally overwritable.
 *
 * @category DomainModel
 * @since 1.0.0
 */
export class File extends S.Class<File>($I`File`)(
  {
    path: FilePath,
    content: S.String,
    isOverwritable: S.Boolean,
  },
  $I.annote("File", {
    description: "Represents a file which can be optionally overwritable.",
  })
) {}

/**
 * By default files are readonly (`isOverwritable = false`).
 *
 * @param path The file path that will be written.
 * @param content The markdown or source content to persist.
 * @param isOverwritable Whether an existing file may be replaced.
 * @returns A `File` value with the provided metadata.
 * @category Constructors
 * @since 1.0.0
 */
export const createFile = (path: FilePath, content: string, isOverwritable = false): File =>
  new File({
    path,
    content,
    isOverwritable,
  });
