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

import com.google.common.base.Throwables;
import com.google.common.collect.ImmutableMap;
import java.security.InvalidKeyException;
import java.security.Key;
import java.security.NoSuchAlgorithmException;
import java.util.Map;
import javax.crypto.Cipher;
import javax.crypto.NoSuchPaddingException;

final class KeySerializers {

    private static final Map<Integer, ? extends KeySerializer> SERIALIZERS = ImmutableMap.of(
            KeySerializerV1.INSTANCE.getVersion(), KeySerializerV1.INSTANCE,
            KeySerializerV2.INSTANCE.getVersion(), KeySerializerV2.INSTANCE);
    private static final Map<Integer, ? extends SymmetricKeySerializer> SYMMETRIC_SERIALIZERS = ImmutableMap.of(
            SymmetricKeySerializerV3.INSTANCE.getVersion(), SymmetricKeySerializerV3.INSTANCE,
            SymmetricKeySerializerV4.INSTANCE.getVersion(), SymmetricKeySerializerV4.INSTANCE);

    private KeySerializers() {}

    static Cipher getCipher(int cipherMode, Key key) {
        try {
            Cipher cipher = Cipher.getInstance(key.getAlgorithm());
            cipher.init(cipherMode, key);
            return cipher;
        } catch (NoSuchAlgorithmException | NoSuchPaddingException | InvalidKeyException e) {
            throw Throwables.propagate(e);
        }
    }

    static Map<Integer, ? extends KeySerializer> getAsymmetricSerializers() {
        return SERIALIZERS;
    }

    static Map<Integer, ? extends SymmetricKeySerializer> getSymmetricSerializers() {
        return SYMMETRIC_SERIALIZERS;
    }
}
