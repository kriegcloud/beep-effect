/**
 * @fileoverview
 * API key layer composition.
 *
 * @module @beep/iam-client/api-key/layer
 * @category ApiKey
 * @since 0.1.0
 */

import { Wrap } from "@beep/wrap";
import * as Create from "./create/mod.ts";
import * as Delete from "./delete/mod.ts";
import * as Get from "./get/mod.ts";
import * as List from "./list/mod.ts";
import * as Update from "./update/mod.ts";

/**
 * API key wrapper group.
 *
 * @category ApiKey
 * @since 0.1.0
 */
export const ApiKeyGroup = Wrap.WrapperGroup.make(
	Create.Contract.Wrapper,
	Get.Contract.Wrapper,
	Update.Contract.Wrapper,
	Delete.Contract.Wrapper,
	List.Contract.Wrapper,
);

/**
 * API key layer with implemented handlers.
 *
 * @category ApiKey
 * @since 0.1.0
 */
export const layer = ApiKeyGroup.toLayer({
	Create: Create.Handler,
	Get: Get.Handler,
	Update: Update.Handler,
	Delete: Delete.Handler,
	List: List.Handler,
});
