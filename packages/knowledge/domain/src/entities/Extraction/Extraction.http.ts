import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import { Cancel, Extract, GetStatus } from "./contracts";

export class Http extends HttpApiGroup.make("extractions")
  .add(Cancel.Contract.Http)
  .add(Extract.Contract.Http)
  .add(GetStatus.Contract.Http)
  .prefix("/extractions") {}
