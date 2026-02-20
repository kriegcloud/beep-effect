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

import com.google.common.base.Throwables;
import com.palantir.crypto2.keys.KeyMaterial;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import javax.crypto.Cipher;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.SecretKey;
import javax.crypto.spec.IvParameterSpec;

enum SymmetricKeySerializerV4 implements SymmetricKeySerializer {
    INSTANCE;

    private static final String AES_CBC_PKCS_5_PADDING = "AES/CBC/PKCS5Padding";
    private static final int IV_SIZE = 16;
    private static final int VERSION = 4;

    private static final SymmetricKeySerializer delegate =
            new CipherSymmetricKeySerializer(IV_SIZE, VERSION, SymmetricKeySerializerV4::getCipher);

    static Cipher getCipher(int cipherMode, SecretKey key, byte[] iv) {
        try {
            Cipher cipher = Cipher.getInstance(AES_CBC_PKCS_5_PADDING);
            cipher.init(cipherMode, key, new IvParameterSpec(iv));
            return cipher;
        } catch (NoSuchAlgorithmException
                | NoSuchPaddingException
                | InvalidKeyException
                | InvalidAlgorithmParameterException e) {
            throw Throwables.propagate(e);
        }
    }

    @Override
    public byte[] wrap(KeyMaterial keyMaterial, SecretKey key) {
        return delegate.wrap(keyMaterial, key);
    }

    @Override
    public KeyMaterial unwrap(byte[] wrappedKeyMaterial, SecretKey key) {
        return delegate.unwrap(wrappedKeyMaterial, key);
    }

    @Override
    public int getVersion() {
        return delegate.getVersion();
    }
}
