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

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

import com.google.common.util.concurrent.MoreExecutors;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionException;
import java.util.concurrent.Executor;
import org.jmock.lib.concurrent.DeterministicExecutor;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public final class ChainedAsyncKeyStorageStrategyTest {

    private static final Executor EXECUTOR = MoreExecutors.directExecutor();
    private static final CompletableFuture<Void> VOID = CompletableFuture.allOf();
    private static final String KEY = "key";

    private KeyMaterial keyMaterial;
    private AsyncKeyStorageStrategy failingStrategy;
    private AsyncKeyStorageStrategy successfulStrategy;
    private ChainedAsyncKeyStorageStrategy chained;

    @BeforeEach
    public void before() {
        keyMaterial = mock(KeyMaterial.class);
        failingStrategy = mock(AsyncKeyStorageStrategy.class);
        successfulStrategy = mock(AsyncKeyStorageStrategy.class);

        when(successfulStrategy.put(KEY, keyMaterial)).thenReturn(VOID);
        when(failingStrategy.put(KEY, keyMaterial)).thenThrow(IllegalArgumentException.class);

        when(successfulStrategy.remove(KEY)).thenReturn(VOID);
        when(failingStrategy.remove(KEY)).thenThrow(IllegalArgumentException.class);

        when(successfulStrategy.get(KEY)).thenReturn(CompletableFuture.completedFuture(keyMaterial));
        when(failingStrategy.get(KEY)).thenThrow(IllegalArgumentException.class);
    }

    @Test
    public void testPut_allCalled() {
        chained = new ChainedAsyncKeyStorageStrategy(EXECUTOR, successfulStrategy, successfulStrategy);

        chained.put(KEY, keyMaterial).join();

        verify(successfulStrategy, times(2)).put(KEY, keyMaterial);
        verifyNoMoreInteractions(successfulStrategy, failingStrategy);
    }

    @Test
    public void testPut_fails() {
        chained = new ChainedAsyncKeyStorageStrategy(EXECUTOR, successfulStrategy, failingStrategy);

        assertThatExceptionOfType(IllegalArgumentException.class)
                .isThrownBy(() -> chained.put(KEY, keyMaterial).join());
    }

    @Test
    public void testGet_succeedsAfterFirstStrategy() {
        chained = new ChainedAsyncKeyStorageStrategy(EXECUTOR, successfulStrategy, failingStrategy);

        assertThat(chained.get(KEY).join()).isEqualTo(keyMaterial);

        verify(successfulStrategy).get(KEY);
        verifyNoMoreInteractions(successfulStrategy, failingStrategy);
    }

    @Test
    public void testGet_FailedGetIgnored() {
        chained = new ChainedAsyncKeyStorageStrategy(EXECUTOR, failingStrategy, successfulStrategy);

        assertThat(chained.get(KEY).join()).isEqualTo(keyMaterial);

        verify(failingStrategy).get(KEY);
        verify(successfulStrategy).get(KEY);
        verifyNoMoreInteractions(successfulStrategy, failingStrategy);
    }

    @Test
    public void testGet_AllStrategiesFail() {
        chained = new ChainedAsyncKeyStorageStrategy(EXECUTOR, failingStrategy);

        assertThatExceptionOfType(CompletionException.class)
                .isThrownBy(() -> chained.get(KEY).join())
                .withCauseInstanceOf(RuntimeException.class)
                .withMessageContaining("Unable to get key material using any of the provided strategies")
                .withMessageContaining(failingStrategy.getClass().getCanonicalName());
    }

    @Test
    public void testRemove_allCalled() {
        chained = new ChainedAsyncKeyStorageStrategy(EXECUTOR, successfulStrategy, successfulStrategy);

        chained.remove(KEY).join();

        verify(successfulStrategy, times(2)).remove(KEY);
        verifyNoMoreInteractions(successfulStrategy, failingStrategy);
    }

    @Test
    public void testDelete_fails() {
        chained = new ChainedAsyncKeyStorageStrategy(EXECUTOR, successfulStrategy, failingStrategy);

        assertThatExceptionOfType(IllegalArgumentException.class)
                .isThrownBy(() -> chained.remove(KEY).join());
    }

    @Test
    public void testCancelForwarded() {
        DeterministicExecutor executor = new DeterministicExecutor();
        chained = new ChainedAsyncKeyStorageStrategy(executor, successfulStrategy);

        chained.get(KEY).cancel(true);
        executor.runUntilIdle();

        verify(successfulStrategy, never()).get(KEY);

        // sanity check that not cancelling invokes the strategy
        CompletableFuture<KeyMaterial> keyMaterialFuture = chained.get(KEY);
        executor.runUntilIdle();

        verify(successfulStrategy).get(KEY);

        assertThat(keyMaterialFuture)
                .isCompleted()
                .isDone()
                .isNotCompletedExceptionally()
                .isNotCancelled()
                .satisfies(f -> assertThat(f.join()).isNotNull());
    }
}
