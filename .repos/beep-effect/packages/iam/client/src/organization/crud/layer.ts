/**
 * @fileoverview
 * Organization CRUD layer composition.
 *
 * @module @beep/iam-client/organization/crud/layer
 * @category Organization/CRUD
 * @since 0.1.0
 */

import { Wrap } from "@beep/wrap";
import * as Create from "./create/mod.ts";
import * as Delete from "./delete/mod.ts";
import * as GetFull from "./get-full/mod.ts";
import * as List from "./list/mod.ts";
import * as SetActive from "./set-active/mod.ts";
import * as Update from "./update/mod.ts";

/**
 * Organization CRUD wrapper group.
 *
 * @category Organization/CRUD
 * @since 0.1.0
 */
export const OrganizationCrudGroup = Wrap.WrapperGroup.make(
  Create.Contract.Wrapper,
  Delete.Contract.Wrapper,
  GetFull.Contract.Wrapper,
  List.Contract.Wrapper,
  SetActive.Contract.Wrapper,
  Update.Contract.Wrapper
);

/**
 * Organization CRUD layer with implemented handlers.
 *
 * @category Organization/CRUD
 * @since 0.1.0
 */
export const layer = OrganizationCrudGroup.toLayer({
  Create: Create.Handler,
  Delete: Delete.Handler,
  GetFull: GetFull.Handler,
  List: List.Handler,
  SetActive: SetActive.Handler,
  Update: Update.Handler,
});
