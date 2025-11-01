import { ApiKey } from "@beep/iam-domain/entities";

const ApiKeyView = ApiKey.Model.select.pick("id", "name", "start", "expiresAt", "createdAt", "updatedAt", "metadata");
export type ApiKey = typeof ApiKeyView.Type;
