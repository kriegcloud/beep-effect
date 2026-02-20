/*
 * (c) Copyright 2017 Palantir Technologies Inc. All rights reserved.
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

package com.palantir.crypto2.keys;

import java.util.concurrent.CompletableFuture;

/**
 * The asynchronous equivalent of {@link KeyStorageStrategy}.
 */
public interface AsyncKeyStorageStrategy {

    /**
     * Async equivalent of {@link KeyStorageStrategy#put(String, KeyMaterial)}.
     */
    CompletableFuture<Void> put(String fileKey, KeyMaterial keyMaterial);

    /**
     * Async equivalent of {@link KeyStorageStrategy#get(String)}.
     */
    CompletableFuture<KeyMaterial> get(String fileKey);

    /**
     * Async equivalent of {@link KeyStorageStrategy#remove(String)}.
     */
    CompletableFuture<Void> remove(String fileKey);
}
