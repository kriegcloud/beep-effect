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

import com.google.common.collect.Collections2;
import com.google.common.collect.ImmutableList;
import com.palantir.logsafe.Preconditions;
import com.palantir.logsafe.SafeArg;
import com.palantir.logsafe.exceptions.SafeRuntimeException;
import com.palantir.logsafe.logger.SafeLogger;
import com.palantir.logsafe.logger.SafeLoggerFactory;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import java.util.function.Function;

/**
 * Async equivalent of {@link ChainedKeyStorageStrategy}. {@link #put(String, KeyMaterial)} and {@link #remove(String)}
 * calls will be applied to all {@link AsyncKeyStorageStrategy strategies} concurrently while {@link #get(String)} is
 * applied to each strategy in order and returns the result of the first successful strategy.
 */
public final class ChainedAsyncKeyStorageStrategy implements AsyncKeyStorageStrategy {

    private static final SafeLogger log = SafeLoggerFactory.get(ChainedAsyncKeyStorageStrategy.class);

    private final Executor executor;
    private final List<AsyncKeyStorageStrategy> strategies;

    public ChainedAsyncKeyStorageStrategy(Executor executor, AsyncKeyStorageStrategy... strategies) {
        this(executor, Arrays.asList(strategies));
    }

    public ChainedAsyncKeyStorageStrategy(Executor executor, List<AsyncKeyStorageStrategy> strategies) {
        Preconditions.checkArgument(strategies.size() > 0, "Must specify at least one storage strategy");
        this.executor = executor;
        this.strategies = ImmutableList.copyOf(strategies);
    }

    @Override
    public CompletableFuture<Void> put(String fileKey, KeyMaterial keyMaterial) {
        return applyToStrategies(strategy -> strategy.put(fileKey, keyMaterial));
    }

    @Override
    public CompletableFuture<KeyMaterial> get(String fileKey) {
        return CompletableFuture.supplyAsync(
                () -> {
                    List<Exception> suppressedExceptions = new ArrayList<>();
                    for (AsyncKeyStorageStrategy strategy : strategies) {
                        try {
                            return strategy.get(fileKey).join();
                        } catch (Exception e) {
                            suppressedExceptions.add(e);
                            log.info(
                                    "Failed to get key material using strategy",
                                    SafeArg.of("strategy", strategy.getClass().getCanonicalName()),
                                    e);
                        }
                    }
                    RuntimeException toThrow = new SafeRuntimeException(
                            "Unable to get key material using any of the provided strategies",
                            SafeArg.of("strategies", Collections2.transform(strategies, s -> s.getClass()
                                    .getCanonicalName())));
                    suppressedExceptions.forEach(toThrow::addSuppressed);
                    throw toThrow;
                },
                executor);
    }

    @Override
    public CompletableFuture<Void> remove(String fileKey) {
        return applyToStrategies(strategy -> strategy.remove(fileKey));
    }

    private CompletableFuture<Void> applyToStrategies(Function<AsyncKeyStorageStrategy, CompletableFuture<?>> mapper) {
        CompletableFuture<?>[] futures = strategies.stream().map(mapper).toArray(CompletableFuture[]::new);
        return CompletableFuture.allOf(futures);
    }
}
