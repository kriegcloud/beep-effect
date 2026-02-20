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

package com.palantir.crypto2.keys.serialization;

import static com.palantir.logsafe.testing.Assertions.assertThatLoggableExceptionThrownBy;
import static org.assertj.core.api.Assertions.assertThat;

import com.palantir.crypto2.keys.KeyMaterial;
import com.palantir.crypto2.keys.TestKeyPairs;
import com.palantir.logsafe.SafeArg;
import java.security.KeyPair;
import java.util.Set;
import org.junit.jupiter.api.Test;

public abstract class KeySerializerTest {

    private static final String KEY_ALG = "AES";
    private static final int KEY_SIZE = 128;
    private static final int IV_SIZE = 16;

    private KeyPair keyPair;

    public abstract KeySerializer getSerializer();

    @Test
    public final void testIncorrectVersion() {
        keyPair = TestKeyPairs.generateKeyPair();
        KeyMaterial keyMaterial = KeyMaterials.generateKeyMaterial(KEY_ALG, KEY_SIZE, IV_SIZE);

        byte[] wrapped = getSerializer().wrap(keyMaterial, keyPair.getPublic());
        wrapped[0] = 0x00;

        assertThatLoggableExceptionThrownBy(() -> getSerializer().unwrap(wrapped, keyPair.getPrivate()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasLogMessage("Invalid serialization format version")
                .hasExactlyArgs(
                        SafeArg.of("foundVersion", 0),
                        SafeArg.of("expectedVersion", getSerializer().getVersion()));
    }

    final void testWrapAndUnwrap(Set<Integer> symmetricKeySizes, Set<Integer> wrappingKeySizes) {
        for (Integer symmetricKeySize : symmetricKeySizes) {
            for (Integer wrappingKeySize : wrappingKeySizes) {
                testWrapAndUnwrap(symmetricKeySize, wrappingKeySize);
            }
        }
    }

    final void testWrapAndUnwrap(int symmetricKeySize, int wrappingKeySize) {
        keyPair = TestKeyPairs.generateKeyPair(wrappingKeySize);
        KeyMaterial keyMaterial = KeyMaterials.generateKeyMaterial(KEY_ALG, symmetricKeySize, IV_SIZE);

        byte[] wrapped = getSerializer().wrap(keyMaterial, keyPair.getPublic());
        KeyMaterial unwrapped = getSerializer().unwrap(wrapped, keyPair.getPrivate());
        assertThat(keyMaterial).isEqualTo(unwrapped);
    }
}
