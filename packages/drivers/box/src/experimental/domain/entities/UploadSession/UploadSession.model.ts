/**
 * TODO
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $BoxId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $BoxId.create("experimental/domain/entities/UploadSession/UploadSession.model");

/**
 *
 * @example
 * ```ts
 * import { UploadSession } from "@beep/box/experimental/domain/values/UploadSession/UploadSession.model";
 *
 * console.log(UploadSession.make({
 *
 * }))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class UploadSession extends S.Class<UploadSession>($I`UploadSession`)(
	{},
	$I.annote("UploadSession", {
		description: "TODO",
	})
) {}

/**
 * Companion namespace for {@link UploadSession}
 *
 * @since 0.0.0
 */
export declare namespace UploadSession {
	/**
	 * Companion encoded type for {@link UploadSession}.
	 *
	 * @example
	 * ```ts
	 * import {UploadSession} from "@beep/box/experimental/domain/values/UploadSession/UploadSession.model";
	 *
	 * const thing: UploadSession.Encoded = S.encodeUnknownSync(UploadSession)({});
	 * ```
	 *
	 * @category models
	 * @since 0.0.0
	 */
	export type Encoded = typeof UploadSession.Encoded;
}

/**
 * Companion runtime type for {@link UploadSession}.
 *
 * @example
 * ```ts
 * import {UploadSession} from "@beep/box/experimental/domain/values/UploadSession/UploadSession.model";
 *
 * const thing: UploadSession = S.encodeUnknownSync(UploadSession)({});
 * ```
 *
 * @category models
 * @since 0.0.0
 */
// export type UploadSession = typeof UploadSession.Type;