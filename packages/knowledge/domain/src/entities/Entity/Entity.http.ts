import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import {
  CountByOrganization,
  Delete,
  FindByIds,
  FindByNormalizedText,
  FindByOntology,
  FindByType,
  Get,
} from "./contracts";

export class Http extends HttpApiGroup.make("knowledge-entities")
  .add(Get.Contract.Http)
  .add(Delete.Contract.Http)
  .add(FindByIds.Contract.Http)
  .add(FindByOntology.Contract.Http)
  .add(FindByType.Contract.Http)
  .add(CountByOrganization.Contract.Http)
  .add(FindByNormalizedText.Contract.Http)
  .prefix("/knowledge-entities") {}
