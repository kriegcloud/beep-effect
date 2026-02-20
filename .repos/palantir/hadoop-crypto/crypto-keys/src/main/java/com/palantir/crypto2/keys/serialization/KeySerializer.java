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

import com.palantir.crypto2.keys.KeyMaterial;
import java.security.KeyPair;
import java.security.PrivateKey;
import java.security.PublicKey;

/**
 * Provides key wrapping functionality in order to use a single master {@link KeyPair} to encrypt many
 * {@link KeyMaterial}s. These serializes are not as performant {@link SymmetricKeySerializer}s, but do allow
 * {@link #wrap} and {@link #unwrap} calls to be done by entities with different levels of trust. eg: {@link #wrap} may
 * be called by anyone with access to the publicly available {@link PublicKey} while {@link #unwrap} may only be called
 * by the trusted entity with access to the {@link PrivateKey}.
 */
interface KeySerializer {

    /**
     * Serializes the given {@link KeyMaterial} and wraps the {@link javax.crypto.SecretKey} using the provided {@link
     * PublicKey}. The produced {@code byte[]} can be unwrapped and deserialized using {@link #unwrap}.
     */
    byte[] wrap(KeyMaterial keyMaterial, PublicKey key);

    /**
     * Deserializes and unwraps a {@link KeyMaterial} from the provided {@code byte[]}. The input {@code byte[]} is only
     * guaranteed to be valid if produced by the corresponding {@link #wrap} method.
     */
    KeyMaterial unwrap(byte[] wrappedKeyMaterial, PrivateKey key);

    /**
     * Returns the unique version of the serializer.
     */
    int getVersion();
}
