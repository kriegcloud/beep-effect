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
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;

import com.palantir.crypto2.keys.KeyMaterial;
import com.palantir.crypto2.keys.TestKeyPairs;
import com.palantir.logsafe.SafeArg;
import java.security.InvalidKeyException;
import java.security.KeyPair;
import javax.crypto.SecretKey;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public final class KeyMaterialsTest {

    private static final String KEY_ALG = "AES";
    private static final int KEY_SIZE = 128;
    private static final int IV_SIZE = 16;

    private KeyMaterial keyMaterial;
    private KeyPair keyPair;
    private SecretKey symmetricKey;

    @BeforeEach
    public void before() {
        keyPair = TestKeyPairs.generateKeyPair();
        symmetricKey = KeyMaterials.generateKey(KEY_ALG, KEY_SIZE);
        SecretKey secretKey = KeyMaterials.generateKey(KEY_ALG, KEY_SIZE);
        byte[] iv = KeyMaterials.generateIv(IV_SIZE);
        keyMaterial = KeyMaterial.of(secretKey, iv);
    }

    @Test
    public void testGenerateKey() {
        SecretKey secretKey = KeyMaterials.generateKey(KEY_ALG, KEY_SIZE);
        assertThat(secretKey.getAlgorithm()).isEqualTo(KEY_ALG);
    }

    @Test
    public void testGenerateIv() {
        byte[] iv = KeyMaterials.generateIv(IV_SIZE);
        assertThat(iv).hasSize(IV_SIZE);
    }

    @Test
    public void testUsingLastestSerializer() {
        byte[] wrapped = KeyMaterials.wrap(keyMaterial, keyPair.getPublic());
        KeyMaterial unwrapped = KeySerializerV2.INSTANCE.unwrap(wrapped, keyPair.getPrivate());

        assertThat(unwrapped).isEqualTo(keyMaterial);
    }

    @Test
    public void testWrapAndUnwrap() {
        byte[] wrapped = KeyMaterials.wrap(keyMaterial, keyPair.getPublic());
        KeyMaterial unwrapped = KeyMaterials.unwrap(wrapped, keyPair.getPrivate());

        assertThat(unwrapped).isEqualTo(keyMaterial);
    }

    @Test
    public void testUnwrapFailsWhenUsedWithWrongKeyPair() {
        KeyPair invalidKeyPair = TestKeyPairs.generateKeyPair();
        byte[] wrapped = KeyMaterials.wrap(keyMaterial, keyPair.getPublic());

        assertThatExceptionOfType(RuntimeException.class)
                .isThrownBy(() -> KeyMaterials.unwrap(wrapped, invalidKeyPair.getPrivate()))
                .withCauseInstanceOf(InvalidKeyException.class)
                .withMessageContaining("Unable to unwrap key");
    }

    @Test
    public void testWrapAndUnwrap_serializedByAllVersions() {
        for (KeySerializer keySerializer :
                KeySerializers.getAsymmetricSerializers().values()) {
            testUnwrapWhenSerializedBy(keySerializer);
        }
    }

    private void testUnwrapWhenSerializedBy(KeySerializer keySerializer) {
        byte[] wrapped = keySerializer.wrap(keyMaterial, keyPair.getPublic());
        KeyMaterial unwrapped = KeyMaterials.unwrap(wrapped, keyPair.getPrivate());
        assertThat(unwrapped).isEqualTo(keyMaterial);
    }

    @Test
    public void testUnwrap_wrongVersion() {
        byte[] wrapped = KeyMaterials.wrap(keyMaterial, keyPair.getPublic());
        wrapped[0] = 0x00;

        assertThatLoggableExceptionThrownBy(() -> KeyMaterials.unwrap(wrapped, keyPair.getPrivate()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasLogMessage("Invalid serialization format version")
                .hasExactlyArgs(
                        SafeArg.of(
                                "expectedVersion",
                                KeySerializers.getAsymmetricSerializers().keySet()),
                        SafeArg.of("foundVersion", 0));
    }

    @Test
    public void testSymmetric_wrapAndUnwrap() {
        byte[] wrapped = KeyMaterials.symmetricWrap(keyMaterial, symmetricKey);
        KeyMaterial unwrapped = KeyMaterials.symmetricUnwrap(wrapped, symmetricKey);
        assertThat(unwrapped).isEqualTo(keyMaterial);
    }

    @Test
    public void testSymmetric_unwrapInvalidWithWrongKey() {
        SecretKey wrongKey = KeyMaterials.generateKey(KEY_ALG, KEY_SIZE);
        byte[] wrapped = KeyMaterials.symmetricWrap(keyMaterial, symmetricKey);
        assertThatExceptionOfType(RuntimeException.class)
                .isThrownBy(() -> KeyMaterials.symmetricUnwrap(wrapped, wrongKey))
                .withCauseInstanceOf(InvalidKeyException.class)
                .withMessageContaining("Unable to unwrap key");
    }

    @Test
    public void testSymmetric_wrongVersion() {
        byte[] wrapped = KeyMaterials.symmetricWrap(keyMaterial, symmetricKey);
        wrapped[0] = 0x00;

        assertThatLoggableExceptionThrownBy(() -> KeyMaterials.symmetricUnwrap(wrapped, symmetricKey))
                .isInstanceOf(IllegalArgumentException.class)
                .hasLogMessage("Invalid serialization format version")
                .hasExactlyArgs(
                        SafeArg.of(
                                "expectedVersion",
                                KeySerializers.getSymmetricSerializers().keySet()),
                        SafeArg.of("foundVersion", 0));
    }

    @Test
    public void testSerializeDeserialize() {
        SecretKey secretKey = keyMaterial.getSecretKey();
        String algorithm = secretKey.getAlgorithm();
        byte[] encoded = secretKey.getEncoded();
        byte[] iv = keyMaterial.getIv();
        assertThat(KeyMaterials.from(algorithm, encoded, iv)).isEqualTo(keyMaterial);
    }
}
