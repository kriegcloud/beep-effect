import * as Contract from "./Search.contract.ts";
import { HttpApiEndpoint, HttpApiSchema } from "effect/unstable/httpapi";

export const Http = HttpApiEndpoint.post("search", "/search", {
	payload: Contract.Payload,
	error: Contract.Failure,
	success: Contract.Success.pipe(
		HttpApiSchema.status(200)
	),
})