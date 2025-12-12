import * as HttpApi from "@effect/platform/HttpApi";
import { DomainApi } from "../../DomainApi.ts";

export class Api extends HttpApi.make("api").addHttpApi(DomainApi) {}
