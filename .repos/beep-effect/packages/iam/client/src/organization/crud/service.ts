/**
 * @fileoverview
 * Organization CRUD service composition.
 *
 * @module @beep/iam-client/organization/crud/service
 * @category Organization/CRUD
 * @since 0.1.0
 */

import * as Create from "./create/mod.ts";
import * as Delete from "./delete/mod.ts";
import * as GetFull from "./get-full/mod.ts";
import * as List from "./list/mod.ts";
import * as SetActive from "./set-active/mod.ts";
import * as Update from "./update/mod.ts";

/**
 * Organization CRUD service methods.
 *
 * @category Organization/CRUD
 * @since 0.1.0
 */
export const Create_ = Create.Handler;
export const Delete_ = Delete.Handler;
export const GetFull_ = GetFull.Handler;
export const List_ = List.Handler;
export const SetActive_ = SetActive.Handler;
export const Update_ = Update.Handler;
