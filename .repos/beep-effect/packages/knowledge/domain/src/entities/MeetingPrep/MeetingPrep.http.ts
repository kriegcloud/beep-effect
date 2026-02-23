import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import { Generate } from "./contracts";

export class Http extends HttpApiGroup.make("meeting-prep").add(Generate.Contract.Http).prefix("/meeting-prep") {}
