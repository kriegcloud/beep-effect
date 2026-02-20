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

import com.google.common.base.Throwables;
import java.security.GeneralSecurityException;
import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.PrivateKey;
import java.security.spec.KeySpec;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.Optional;

public final class KeyPairs {

    private KeyPairs() {}

    /**
     * Constructs a {@link KeyPair} from base64 encoded public and private keys.
     *
     * @param privateKeyString base64 encoded PKCS8 private key
     * @param publicKeyString base64 encoded X509 public key
     */
    public static KeyPair fromStrings(String privateKeyString, String publicKeyString, String algorithm) {
        try {
            KeyFactory keyFactory = KeyFactory.getInstance(algorithm);
            // Private key is only required for decryption, can be null
            Optional<PrivateKey> privateKey = Optional.empty();
            if (privateKeyString != null) {
                KeySpec privateKs = new PKCS8EncodedKeySpec(Base64.getDecoder().decode(privateKeyString));
                privateKey = Optional.of(keyFactory.generatePrivate(privateKs));
            }

            KeySpec publicKs = new X509EncodedKeySpec(Base64.getDecoder().decode(publicKeyString));

            return new KeyPair(keyFactory.generatePublic(publicKs), privateKey.orElse(null));
        } catch (GeneralSecurityException e) {
            throw Throwables.propagate(e);
        }
    }
}
