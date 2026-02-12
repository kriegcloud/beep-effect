import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import {
  CountMembers,
  Delete,
  DeleteByCanonical,
  FindByCanonical,
  FindByMember,
  FindBySource,
  FindHighConfidence,
  Get,
  ResolveCanonical,
} from "./contracts";

export class Http extends HttpApiGroup.make("same-as-links")
  .add(Get.Contract.Http)
  .add(Delete.Contract.Http)
  .add(FindByCanonical.Contract.Http)
  .add(FindByMember.Contract.Http)
  .add(ResolveCanonical.Contract.Http)
  .add(FindHighConfidence.Contract.Http)
  .add(FindBySource.Contract.Http)
  .add(DeleteByCanonical.Contract.Http)
  .add(CountMembers.Contract.Http)
  .prefix("/same-as-links") {}
