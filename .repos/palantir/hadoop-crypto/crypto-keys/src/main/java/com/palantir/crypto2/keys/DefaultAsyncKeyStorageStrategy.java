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
import java.util.concurrent.ExecutorService;

public final class DefaultAsyncKeyStorageStrategy implements AsyncKeyStorageStrategy {

    private final KeyStorageStrategy keys;
    private final ExecutorService executor;

    public DefaultAsyncKeyStorageStrategy(KeyStorageStrategy keys, ExecutorService executor) {
        this.keys = keys;
        this.executor = executor;
    }

    @Override
    public CompletableFuture<Void> put(String fileKey, KeyMaterial keyMaterial) {
        return CompletableFuture.supplyAsync(
                () -> {
                    keys.put(fileKey, keyMaterial);
                    return null;
                },
                executor);
    }

    @Override
    public CompletableFuture<KeyMaterial> get(String fileKey) {
        return CompletableFuture.supplyAsync(() -> keys.get(fileKey), executor);
    }

    @Override
    public CompletableFuture<Void> remove(String fileKey) {
        return CompletableFuture.supplyAsync(
                () -> {
                    keys.remove(fileKey);
                    return null;
                },
                executor);
    }
}
