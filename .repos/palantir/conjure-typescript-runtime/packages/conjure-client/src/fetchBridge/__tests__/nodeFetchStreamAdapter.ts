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
import { MediaType } from "../../httpApiBridge";

export function nodeFetchStreamAdapter(
    nodeFetch: (url: any, opts: any) => Promise<any>,
): (url: any, opts: any) => Promise<any> {
    return async (url, opts) => {
        const response = await nodeFetch(url, opts);
        const contentType =
            response.headers.get("Content-Type") != null ? (response.headers.get("Content-Type") as string) : "";
        if (contentType.includes(MediaType.APPLICATION_OCTET_STREAM)) {
            const bodyInternals = Object.getOwnPropertySymbols(response).find(s => {
                return String(s) === "Symbol(Body internals)";
            });
            if (bodyInternals !== undefined) {
                response[bodyInternals].body = nodeToWeb(response.body);
            }
        }
        return response;
    };
}

function nodeToWeb(nodeStream: NodeJS.ReadableStream): ReadableStream<Uint8Array> {
    let destroyed = false;
    const listeners: { [key: string]: (...args: any[]) => void } = {};

    function start(controller: ReadableStreamDefaultController<Uint8Array>) {
        nodeStream.pause();

        function onData(chunk: any) {
            if (!destroyed) {
                controller.enqueue(chunk);
                nodeStream.pause();
            }
        }

        function onDestroy(err: any) {
            if (!destroyed) {
                destroyed = true;

                Object.keys(listeners).forEach(key => nodeStream.removeListener(key, listeners[key]));

                if (err) {
                    controller.error(err);
                } else {
                    controller.close();
                }
            }
        }

        listeners.data = onData;
        listeners.end = onData;
        listeners.end = onDestroy;
        listeners.close = onDestroy;
        listeners.error = onDestroy;
        Object.keys(listeners).forEach(key => nodeStream.on(key, listeners[key]));
    }

    function pull() {
        if (!destroyed) {
            nodeStream.resume();
        }
    }

    function cancel() {
        destroyed = true;
        Object.keys(listeners).forEach(key => nodeStream.removeListener(key, listeners[key]));

        const nodeStreamHack = nodeStream as any;

        if (nodeStreamHack.push) {
            nodeStreamHack.push(null);
        }

        nodeStreamHack.pause();
        if (nodeStreamHack.destroy) {
            nodeStreamHack.destroy();
        } else if (nodeStreamHack.close) {
            nodeStreamHack.close();
        }
    }

    return new ReadableStream<Uint8Array>({ start, pull, cancel });
}
