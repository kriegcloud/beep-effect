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

import com.palantir.crypto2.keys.KeyMaterial;
import javax.crypto.SecretKey;

/**
 * Provides the same functionality as {@link KeySerializer} but relies on symmetric encryption rather than asymmetric
 * encryption when wrapping the {@link KeyMaterial}. Using symmetric key encryption is faster than asymmetric encryption
 * but is only an option when there is a single entity wrapping and unwrapping keys.
 * <p>
 * ** WARNING ** If you require {@link #wrap} and {@link #unwrap} operations to be performed by different entities then
 * you must use a {@link KeySerializer}.
 */
public interface SymmetricKeySerializer {
    /**
     * Serializes the given {@link KeyMaterial} and wraps the {@link javax.crypto.SecretKey} using the provided {@link
     * SecretKey}. The produced {@code byte[]} can be unwrapped and deserialized using {@link #unwrap}.
     */
    byte[] wrap(KeyMaterial keyMaterial, SecretKey key);

    /**
     * Deserializes and unwraps a {@link KeyMaterial} from the provided {@code byte[]}. The input {@code byte[]} is only
     * guaranteed to be valid if produced by the corresponding {@link #wrap} method.
     */
    KeyMaterial unwrap(byte[] wrappedKeyMaterial, SecretKey key);

    /**
     * Returns the unique version of the serializer.
     */
    int getVersion();
}
