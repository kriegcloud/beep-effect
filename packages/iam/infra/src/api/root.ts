import { DomainApi } from "@beep/iam-domain/DomainApi";
import * as HttpApi from "@effect/platform/HttpApi";

export const Api = HttpApi.make("api").addHttpApi(DomainApi);
