/**
 * @license
 * Copyright 2018 Palantir Technologies, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ConjureError, ConjureErrorType, isConjureError } from "../error";

const body = {
    errorCode: "NOT_FOUND",
    message: "Refer to the server logs",
};

function removeSpaces(str: string) {
    return str.replace(/\s/g, "");
}

describe("ConjureError", () => {
    describe("toString", () => {
        it("stringifies the body, and includes the status and type", () => {
            const error = new ConjureError(ConjureErrorType.Status, undefined, 400, body);
            expect(removeSpaces(error.toString())).toEqual(
                removeSpaces(
                    `{
                        "body": {
                            "errorCode": "NOT_FOUND",
                            "message": "Refer to the server logs"
                        },
                        "status": 400,
                        "type": "STATUS"
                    }`,
                ),
            );
        });

        it("uses the default string conversion for the originalError, if an originalError is defined", () => {
            const originalError = {
                toString: () => "I'm an error",
            };
            const error = new ConjureError(ConjureErrorType.Status, originalError, 400, undefined);
            expect(removeSpaces(error.toString())).toEqual(
                removeSpaces(
                    `{
                        "originalError": "I'm an error",
                        "status": 400,
                        "type": "STATUS"
                    }`,
                ),
            );
        });

        it("handles cases where the originalError, status and body are undefined", () => {
            const error = new ConjureError(ConjureErrorType.Status);
            expect(removeSpaces(error.toString())).toEqual(
                removeSpaces(
                    `{
                        "type": "STATUS"
                    }`,
                ),
            );
        });
    });
});

describe("isConjureError", () => {
    it("handles null errors", () => {
        expect(isConjureError(null)).toBe(false);
    });

    it("handles undefined errors", () => {
        expect(isConjureError(undefined)).toBe(false);
    });

    it("handles non-Conjure errors", () => {
        expect(isConjureError(new Error("I'm an error"))).toBe(false);
    });

    it("handles Conjure errors", () => {
        expect(isConjureError(new ConjureError(ConjureErrorType.Status, undefined, 400, body))).toBe(true);
    });
});
