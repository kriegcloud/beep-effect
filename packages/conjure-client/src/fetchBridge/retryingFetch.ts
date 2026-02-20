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

import { FetchFunction, IFetchResponse } from "./fetchBridge";

/**
 * The maximum value we accept in a Retry-After header.
 * If a server passes a value larger than this, we disregard
 * the Retry-After header.
 */
const MAX_RETRY_AFTER_MS = 60000;

/**
 * A backoff strategy must return either the number of milliseconds to wait before retrying
 * a request, or undefined to indicate we should stop backing-off (e.g. if the maximum number
 * of retries have been exceeded.
 */
export type BackoffStrategy = (attempt: number) => number | undefined;

const SERVICE_UNAVAILABLE = 503;
const TOO_MANY_REQUESTS = 429;

/**
 * Implements "exponential backoff with full jitter", suggesting a backoff duration chosen randomly from the interval
 * `[0, backoffSlotSize * 2^c)` for the c-th retry for a maximum of `maxNumRetries` retries.
 */
export function exponentialBackoff(maxNumRetries: number, backoffSlotSizeMs: number): BackoffStrategy {
    return (attempt: number) => {
        if (attempt + 1 >= maxNumRetries) {
            return undefined;
        }

        const upperBound = Math.pow(2, attempt);
        return Math.floor(Math.random() * upperBound * backoffSlotSizeMs);
    };
}

export class RetryingFetch {
    constructor(private delegate: FetchFunction, private backoffStrategy: BackoffStrategy) {}

    public get fetch(): FetchFunction {
        return this.fetchInternal.bind(this);
    }

    private fetchInternal(url: string | Request, init?: RequestInit): Promise<IFetchResponse> {
        return new Promise((resolve, reject) => {
            this.doAttempt(url, init, 0, resolve, reject);
        });
    }

    private getRetryAfterHeaderValueInMilliseconds(response: IFetchResponse): number | undefined {
        const retryAfterHeader = response.headers.get("Retry-After");
        if (retryAfterHeader == null) {
            return undefined;
        }

        const retryAfterInSeconds = parseInt(retryAfterHeader, 10);
        if (isNaN(retryAfterInSeconds)) {
            return undefined;
        }

        const retryAfterInMilliseconds = retryAfterInSeconds * 1000;
        if (retryAfterInMilliseconds < 0 || retryAfterInMilliseconds > MAX_RETRY_AFTER_MS) {
            return undefined;
        }

        return retryAfterInMilliseconds;
    }

    private getRetryAfter(response: IFetchResponse, attempt: number): number | undefined {
        if (response.status === TOO_MANY_REQUESTS || response.status === SERVICE_UNAVAILABLE) {
            const backoffStrategyBackoff = this.backoffStrategy(attempt);
            if (backoffStrategyBackoff === undefined) {
                return undefined;
            }

            const retryAfterFromHeader = this.getRetryAfterHeaderValueInMilliseconds(response);
            if (retryAfterFromHeader !== undefined) {
                return retryAfterFromHeader;
            } else {
                return backoffStrategyBackoff;
            }
        }

        return undefined;
    }

    private async doAttempt(
        url: string | Request,
        init: RequestInit | undefined,
        attempt: number,
        resolve: (value: IFetchResponse) => void,
        reject: (value: any) => void,
    ): Promise<void> {
        // fetch expects a nully context, so alias
        const fetchFunction = this.delegate;
        try {
            const response = await fetchFunction(url, init);
            if (response.ok) {
                resolve(response);
                return;
            }

            const retryAfter = this.getRetryAfter(response, attempt);
            if (retryAfter !== undefined) {
                // let's try again!
                setTimeout(() => this.doAttempt(url, init, attempt + 1, resolve, reject), retryAfter);
            } else {
                // no more retries, return what we have
                resolve(response);
            }
        } catch (e) {
            reject(e);
        }
    }
}
