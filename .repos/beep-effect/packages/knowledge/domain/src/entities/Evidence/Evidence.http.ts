import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import { List } from "./contracts";

export class Http extends HttpApiGroup.make("evidence").add(List.Contract.Http).prefix("/evidence") {}
