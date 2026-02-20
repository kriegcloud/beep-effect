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

import * as express from "express";
import * as http from "http";
import * as nodeFetch from "node-fetch";
import { TextDecoder, TextEncoder } from "util";
import { IHttpApiBridge } from "../../httpApiBridge";
import { IUserAgent } from "../../userAgent";
import { FetchBridge } from "../fetchBridge";
import { ConjureService } from "./conjureService";
import { nodeFetchStreamAdapter } from "./nodeFetchStreamAdapter";

const token = "TOKEN";

describe("FetchBridgeImplServer", () => {
    let bridge: IHttpApiBridge;
    let app: express.Application;
    let server: http.Server;

    beforeEach(done => {
        const host = "localhost";
        const port = 9000;
        const baseUrl = `http://${host}:${port}`;
        const userAgent: IUserAgent = { productName: "foo", productVersion: "1.2.3", comments: ["some-comment"] };
        bridge = new FetchBridge({ baseUrl, token, fetch: nodeFetchStreamAdapter(nodeFetch), userAgent });

        app = express();
        server = http.createServer(app);
        server.listen(port, host, done);
    });

    afterEach(done => {
        server.close(done);
    });

    it("should reject strange raw strings returned by Jetty (for consistency with http-remoting)", done => {
        app.all("/*", (_req, res) => {
            res.status(200).type("application/json").send("Hello, world!");
        });

        new ConjureService(bridge)
            .string()
            .then(fail)
            .catch(s => {
                expect(s.originalError.toString()).toMatch(
                    /Unexpected token H in JSON at position 0|Unexpected token 'H', "Hello, world!" is not valid JSON/,
                );
                done();
            });
    });

    it("should receive strings with quotes", done => {
        app.all("/*", (_req, res) => {
            res.status(200).type("application/json").send('"Hello, world!"');
        });

        new ConjureService(bridge)
            .string()
            .then(s => {
                expect(s).toEqual("Hello, world!");
                done();
            })
            .catch(fail);
    });

    it("should receive JSON stringified payloads", done => {
        const payload = { dataset: "foo", count: 1 };

        app.all("/*", (_req, res) => {
            res.status(200).type("application/json").send(JSON.stringify(payload));
        });

        new ConjureService(bridge)
            .body(payload)
            .then(s => {
                expect(s).toEqual(payload);
                done();
            })
            .catch(fail);
    });

    it("compact method should receive JSON stringified payloads", done => {
        const payload = { dataset: "foo", count: 1 };

        app.all("/*", (_req, res) => {
            res.status(200).type("application/json").send(JSON.stringify(payload));
        });

        new ConjureService(bridge)
            .bodyCompact(payload)
            .then(s => {
                expect(s).toEqual(payload);
                done();
            })
            .catch(fail);
    });

    it("should stream binary responses", testDone => {
        const response = { dataset: "foo", count: 1 };

        app.all("/*", (_req, res) => {
            res.status(200)
                .type("application/octet-stream")
                .send(Buffer.from(new TextEncoder().encode(JSON.stringify(response))));
        });

        new ConjureService(bridge)
            .binary()
            .then(s => s.getReader().read())
            .then(({ done, value }) => {
                expect(done).toEqual(false);
                expect(JSON.parse(new TextDecoder().decode(value))).toEqual(response);
                testDone();
            })
            .catch(fail);
    });
});
