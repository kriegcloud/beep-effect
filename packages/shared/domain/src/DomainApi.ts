import * as HttpApi from "@effect/platform/HttpApi";
import { File } from "./entities";

export class DomainApi extends HttpApi.make("domain").add(File.Contract).prefix("/api/v1/upload") {}
