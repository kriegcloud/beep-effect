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
import javax.crypto.spec.GCMParameterSpec;

/**
 * This serialization format has been deprecated.
 *
 * @deprecated As per the NIST recommendation in section 8.3 [1] the same key should not be used with AES GCM more than
 * 2^32 times. An alternative method should be used as the current implementation does not guard against this
 * limitation.
 *
 * [1] https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38d.pdf
 */
@Deprecated
enum SymmetricKeySerializerV3 implements SymmetricKeySerializer {
    INSTANCE;

    private static final String AES_GCM_NO_PADDING = "AES/GCM/NoPadding";
    private static final int IV_SIZE = 12;
    // 128 bit tag length as recommended by:
    // https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38d.pdf
    private static final int TAG_LENGTH = 128;
    private static final int VERSION = 3;

    private static final SymmetricKeySerializer delegate =
            new CipherSymmetricKeySerializer(IV_SIZE, VERSION, SymmetricKeySerializerV3::getCipher);

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

    static Cipher getCipher(int cipherMode, SecretKey key, byte[] iv) {
        try {
            Cipher cipher = Cipher.getInstance(AES_GCM_NO_PADDING);
            cipher.init(cipherMode, key, new GCMParameterSpec(TAG_LENGTH, iv));
            return cipher;
        } catch (NoSuchAlgorithmException
                | NoSuchPaddingException
                | InvalidKeyException
                | InvalidAlgorithmParameterException e) {
            throw Throwables.propagate(e);
        }
    }
}
