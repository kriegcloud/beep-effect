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
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InOrder;

public final class ChainedKeyStorageStrategyTest {

    private KeyStorageStrategy chained;
    private KeyStorageStrategy successfulStrategy;
    private KeyStorageStrategy failingStrategy;
    private KeyMaterial keyMaterial;
    private String key;

    @BeforeEach
    public void before() {
        key = "key";

        successfulStrategy = mock(KeyStorageStrategy.class);
        failingStrategy = mock(KeyStorageStrategy.class);
        keyMaterial = mock(KeyMaterial.class);

        when(successfulStrategy.get(key)).thenReturn(keyMaterial);
        when(failingStrategy.get(key)).thenThrow(new IllegalArgumentException());

        chained = new ChainedKeyStorageStrategy(successfulStrategy, failingStrategy);
    }

    @Test
    public void testAllPutsCalled() {
        chained.put(key, keyMaterial);

        InOrder inOrder = inOrder(successfulStrategy, failingStrategy);
        inOrder.verify(successfulStrategy).put(key, keyMaterial);
        inOrder.verify(failingStrategy).put(key, keyMaterial);
        verifyNoMoreInteractions(successfulStrategy, failingStrategy);
    }

    @Test
    public void testGetSucceeds() {
        assertThat(chained.get(key)).isEqualTo(keyMaterial);

        InOrder inOrder = inOrder(successfulStrategy, failingStrategy);
        inOrder.verify(successfulStrategy).get(key);
        verifyNoMoreInteractions(successfulStrategy, failingStrategy);
    }

    @Test
    public void testFailedGetIgnored() {
        chained = new ChainedKeyStorageStrategy(failingStrategy, successfulStrategy);

        assertThat(chained.get(key)).isEqualTo(keyMaterial);

        InOrder inOrder = inOrder(successfulStrategy, failingStrategy);
        inOrder.verify(failingStrategy).get(key);
        inOrder.verify(successfulStrategy).get(key);
        verifyNoMoreInteractions(successfulStrategy, failingStrategy);
    }

    @Test
    public void testAllStrategiesFail() {
        chained = new ChainedKeyStorageStrategy(failingStrategy);

        assertThatExceptionOfType(RuntimeException.class)
                .isThrownBy(() -> chained.get(key))
                .withMessageContaining("Unable to get key material for key using any of the provided strategies")
                .withMessageContaining(failingStrategy.getClass().getCanonicalName());
    }

    @Test
    public void testAllDeletesCalled() {
        chained.remove(key);

        InOrder inOrder = inOrder(successfulStrategy, failingStrategy);
        inOrder.verify(successfulStrategy).remove(key);
        inOrder.verify(failingStrategy).remove(key);
        verifyNoMoreInteractions(successfulStrategy, failingStrategy);
    }
}
