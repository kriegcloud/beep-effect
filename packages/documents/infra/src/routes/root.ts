import { DomainApi } from "@beep/documents-domain/DomainApi";
import * as HttpApi from "@effect/platform/HttpApi";

export const Api = HttpApi.make("api").addHttpApi(DomainApi);
