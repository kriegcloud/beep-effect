import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import {
  Delete,
  DeleteByOntology,
  FindByCanonicalEntity,
  FindByMember,
  FindByOntology,
  FindHighCohesion,
  Get,
} from "./contracts";

export class Http extends HttpApiGroup.make("entity-clusters")
  .add(Get.Contract.Http)
  .add(Delete.Contract.Http)
  .add(FindByCanonicalEntity.Contract.Http)
  .add(FindByMember.Contract.Http)
  .add(FindByOntology.Contract.Http)
  .add(FindHighCohesion.Contract.Http)
  .add(DeleteByOntology.Contract.Http)
  .prefix("/entity-clusters") {}
