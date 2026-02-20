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

import java.security.KeyPair;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.util.Base64;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public final class KeyPairsTest {

    private KeyPair keyPair;
    private PrivateKey privateKey;
    private PublicKey publicKey;

    @BeforeEach
    public void before() {
        keyPair = TestKeyPairs.generateKeyPair();
        privateKey = keyPair.getPrivate();
        publicKey = keyPair.getPublic();
    }

    @Test
    public void testDeserialization() {
        String privateEncoded = encode(privateKey.getEncoded());
        String publicEncoded = encode(publicKey.getEncoded());
        KeyPair deserialized = KeyPairs.fromStrings(privateEncoded, publicEncoded, "RSA");

        // KeyPair does not implement equals so check each key individually
        assertThat(deserialized.getPrivate()).isEqualTo(privateKey);
        assertThat(deserialized.getPublic()).isEqualTo(publicKey);
    }

    private static String encode(byte[] bytes) {
        return Base64.getEncoder().encodeToString(bytes);
    }
}
