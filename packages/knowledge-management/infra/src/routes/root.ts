import { DomainApi } from "@beep/knowledge-management-domain/DomainApi";
import * as HttpApi from "@effect/platform/HttpApi";

export const Api = HttpApi.make("api").addHttpApi(DomainApi);
