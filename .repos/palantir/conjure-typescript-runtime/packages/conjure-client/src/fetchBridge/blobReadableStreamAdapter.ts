/**
 * @license
 * Copyright 2019 Palantir Technologies, Inc.
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

import { ReadableStream as PonyfilledReadableStream } from "web-streams-polyfill/ponyfill";

export function blobToReadableStream(blobPromise: Promise<Blob>): Promise<ReadableStream<Uint8Array>> {
    const underlyingSource = {
        start: (controller: ReadableStreamDefaultController<Uint8Array>) => {
            const reader = new FileReader();
            reader.onload = () => {
                controller.enqueue(new Uint8Array(reader.result as ArrayBuffer));
            };
            reader.onerror = () => {
                controller.error(reader.error);
            };
            blobPromise.then(blob => reader.readAsArrayBuffer(blob));
        },
    };
    if (process.env.MODERN) {
        return blobPromise.then(blob => blob.stream());
    } else {
        return Promise.resolve(
            typeof ReadableStream === "undefined"
                ? (new PonyfilledReadableStream<Uint8Array>(underlyingSource) as ReadableStream<Uint8Array>)
                : new ReadableStream(underlyingSource),
        );
    }
}
