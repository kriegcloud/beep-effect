import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import { Query, QueryFromSeeds } from "./contracts";

export class Http extends HttpApiGroup.make("graphrag")
  .add(Query.Contract.Http)
  .add(QueryFromSeeds.Contract.Http)
  .prefix("/graphrag") {}
