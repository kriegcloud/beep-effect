import type { IConjureResult, IHttpApiBridge } from "conjure-client";

/** Constant reference to `undefined` that we expect to get minified and therefore reduce total code size */
const __undefined: undefined = undefined;

export interface IOptionalServiceWithErrors {
    foo(header: string, name?: string | null): Promise<IConjureResult<void, never>>;
}

export class OptionalServiceWithErrors implements IOptionalServiceWithErrors {
    constructor(private bridge: IHttpApiBridge) {
    }

    public foo(header: string, name?: string | null): Promise<IConjureResult<void, never>> {
        return this.bridge
            .call<void>(
                "OptionalService",
                "foo",
                "GET",
                "/foo",
                __undefined,
                {
                    "Header": header,
                },
                {
                    "Query": name,
                },
                __undefined,
                __undefined,
                __undefined
            )
            .then(result => ({ status: "success" as const, result }))
            .catch((error: any) => ({ status: "failure", error }));
    }
}
