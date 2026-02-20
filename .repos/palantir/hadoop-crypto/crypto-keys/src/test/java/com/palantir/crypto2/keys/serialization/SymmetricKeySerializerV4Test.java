/*
 * (c) Copyright 2018 Palantir Technologies Inc. All rights reserved.
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

import static org.assertj.core.api.Assertions.assertThat;

import com.palantir.crypto2.keys.KeyMaterial;
import org.junit.jupiter.api.Test;

public final class SymmetricKeySerializerV4Test {

    private static final SymmetricKeySerializerV4 SERIALIZER = SymmetricKeySerializerV4.INSTANCE;
    private static final String KEY_ALG = "AES";
    private static final int KEY_SIZE = 128;
    private static final int IV_SIZE = 16;

    @Test
    public void testWrapUnwrap() {
        KeyMaterial wrappingKeyMaterial = KeyMaterials.generateKeyMaterial(KEY_ALG, KEY_SIZE, IV_SIZE);
        KeyMaterial keyMaterial = KeyMaterials.generateKeyMaterial(KEY_ALG, KEY_SIZE, IV_SIZE);

        byte[] wrapped = SERIALIZER.wrap(keyMaterial, wrappingKeyMaterial.getSecretKey());
        KeyMaterial unwrapped = SERIALIZER.unwrap(wrapped, wrappingKeyMaterial.getSecretKey());
        assertThat(keyMaterial).isEqualTo(unwrapped);
    }

    @Test
    public void testNewIvUsed() {
        KeyMaterial wrappingKeyMaterial = KeyMaterials.generateKeyMaterial(KEY_ALG, KEY_SIZE, IV_SIZE);
        KeyMaterial keyMaterial = KeyMaterials.generateKeyMaterial(KEY_ALG, KEY_SIZE, IV_SIZE);

        byte[] wrapped1 = SERIALIZER.wrap(keyMaterial, wrappingKeyMaterial.getSecretKey());
        byte[] wrapped2 = SERIALIZER.wrap(keyMaterial, wrappingKeyMaterial.getSecretKey());
        assertThat(wrapped1).isNotEqualTo(wrapped2);
    }
}
