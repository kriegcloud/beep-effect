import {
  HttpApi,
  HttpApiEndpoint,
  HttpApiGroup,
  HttpApiSchema
} from "@effect/platform"
import * as Schema from "effect/Schema"
import { QuerySupervisorStatsSchema } from "../QuerySupervisor.js"
import * as SdkSchema from "../Schema/index.js"
import { QueryInput, QueryResultOutput } from "../Schema/Service.js"
import { AgentServiceError } from "./AgentRpcs.js"

class AgentHttpGroup extends HttpApiGroup.make("agent", { topLevel: true })
  .add(
    HttpApiEndpoint.post("query", "/query")
      .setPayload(QueryInput)
      .addSuccess(QueryResultOutput)
      .addError(AgentServiceError)
  )
  .add(
    HttpApiEndpoint.get("stats", "/stats")
      .addSuccess(QuerySupervisorStatsSchema)
  )
  .add(
    HttpApiEndpoint.post("interruptAll", "/interrupt-all")
      .addSuccess(HttpApiSchema.NoContent)
      .addError(AgentServiceError)
  )
  .add(
    HttpApiEndpoint.get("models", "/models")
      .addSuccess(Schema.Array(SdkSchema.ModelInfo))
      .addError(AgentServiceError)
  )
  .add(
    HttpApiEndpoint.get("commands", "/commands")
      .addSuccess(Schema.Array(SdkSchema.SlashCommand))
      .addError(AgentServiceError)
  )
  .add(
    HttpApiEndpoint.get("account", "/account")
      .addSuccess(SdkSchema.AccountInfo)
      .addError(AgentServiceError)
  )
{}

export class AgentHttpApi extends HttpApi.make("agent") // top-level routes
  .add(AgentHttpGroup)
{}
