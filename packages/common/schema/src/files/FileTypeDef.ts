/**
 * @module @beep/schema/files/FileTypeDef
 * @since 0.0.0
 */
import * as S from "effect/Schema";
import {$SchemaId} from "@beep/identity";
import {FileExtension} from "../FileExtension.ts";
import {MimeType} from "../MimeType.ts";

const $I = $SchemaId.create("files/FileTypeDef");

/**
 * Information about a unique file signature
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class FileSignature extends S.Class<FileSignature>($I`FileSignature`)(
	{
		sequence: S.Array(S.Union([
			S.Number,
			S.String
		])),
		offset: S.OptionFromOptionalKey(S.Number),
		skippedBytes: S.OptionFromOptionalKey(S.Number),
		description: S.OptionFromOptionalKey(S.String),
		compatibleExtensions: S.Array(S.String)
			.pipe(S.OptionFromOptionalKey)
	},
	$I.annote(
		"FileSignature",
		{
			description: "Information about a unique file signature",
		}
	)
) {
}

/**
 * File type information definition
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class FileInfo extends S.Class<FileInfo>($I`FileInfo`)(
	{
		extension: FileExtension,
		mimeType: MimeType,
		description: S.String,
		signatures: S.Array(FileSignature)
	},
	$I.annote(
		"FileInfo",
		{
			description: "File type information definition",
		}
	)
) {
	static readonly assert: (u: unknown) => asserts u is FileInfo = (u: unknown): asserts u is FileInfo => S.asserts(FileInfo)(u);
}
