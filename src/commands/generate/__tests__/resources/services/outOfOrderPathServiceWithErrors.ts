import type { IConjureResult, IHttpApiBridge } from "conjure-client";

/** Constant reference to `undefined` that we expect to get minified and therefore reduce total code size */
const __undefined: undefined = undefined;

export interface IOutOfOrderPathServiceWithErrors {
    foo(param1: string, param2: string): Promise<IConjureResult<void, never>>;
}

export class OutOfOrderPathServiceWithErrors implements IOutOfOrderPathServiceWithErrors {
    constructor(private bridge: IHttpApiBridge) {
    }

    public foo(param1: string, param2: string): Promise<IConjureResult<void, never>> {
        return this.bridge
            .call<void>(
                "OutOfOrderPathService",
                "foo",
                "GET",
                "/{param2}/{param1}",
                __undefined,
                __undefined,
                __undefined,
                [
                    param2,
                    param1,
                ],
                __undefined,
                __undefined
            )
            .then(result => ({ status: "success" as const, result }))
            .catch((error: any) => ({ status: "failure", error }));
    }
}
