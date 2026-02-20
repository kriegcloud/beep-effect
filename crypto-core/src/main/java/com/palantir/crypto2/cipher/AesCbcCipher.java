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

package com.palantir.crypto2.cipher;

import com.google.common.base.Throwables;
import com.palantir.crypto2.keys.KeyMaterial;
import com.palantir.crypto2.keys.serialization.KeyMaterials;
import com.palantir.logsafe.Preconditions;
import com.palantir.logsafe.SafeArg;
import com.palantir.logsafe.exceptions.SafeIllegalArgumentException;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.NoSuchProviderException;
import javax.crypto.Cipher;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.SecretKey;
import javax.crypto.spec.IvParameterSpec;

/**
 * An extention of the 'AES/CBC/PKCS5Padding' {@link Cipher} implementation which allows seeking of the cipher in
 * constant time. This is the same Cipher used by the original implementation of the hadoop-s3e-adapter.
 */
public final class AesCbcCipher implements SeekableCipher {

    public static final String ALGORITHM = "AES/CBC/PKCS5Padding";
    private static final String KEY_ALGORITHM = "AES";
    private static final String PROVIDER = Ciphers.getProvider();
    private static final int KEY_SIZE = 256;
    private static final int BLOCK_SIZE = 16;
    private static final int IV_SIZE = 16;

    private final KeyMaterial keyMaterial;
    private final SecretKey key;
    private final byte[] initIv;
    private int currentOpmode;

    public AesCbcCipher(KeyMaterial keyMaterial) {
        this.initIv = keyMaterial.getIv();
        this.key = keyMaterial.getSecretKey();
        this.keyMaterial = keyMaterial;
    }

    @Override
    public Cipher initCipher(int opmode) {
        this.currentOpmode = opmode;
        try {
            Cipher cipher = getInstance();
            cipher.init(opmode, key, new IvParameterSpec(initIv));
            return cipher;
        } catch (InvalidKeyException | InvalidAlgorithmParameterException e) {
            throw Throwables.propagate(e);
        }
    }

    /**
     * Seeking the AES/CBC {@link Cipher} requires initializing its IV with the previous block of encrypted data and
     * therefore cannot be done by the Cipher alone, which is why seeking returns a Cipher initialized the same way
     * regardless of position.
     */
    @Override
    public Cipher seek(long pos) {
        Preconditions.checkState(
                currentOpmode == Cipher.DECRYPT_MODE || currentOpmode == Cipher.ENCRYPT_MODE, "Cipher not initialized");
        if (pos < 0) {
            throw new SafeIllegalArgumentException("Cannot seek to negative position", SafeArg.of("pos", pos));
        }
        Preconditions.checkArgument(
                pos % BLOCK_SIZE == 0,
                "Can only seek AES/CBC cipher to block offset positions every " + BLOCK_SIZE + " bytes");
        return initCipher(currentOpmode);
    }

    @Override
    public KeyMaterial getKeyMaterial() {
        return keyMaterial;
    }

    @Override
    public int getBlockSize() {
        return BLOCK_SIZE;
    }

    public static KeyMaterial generateKeyMaterial() {
        return KeyMaterials.generateKeyMaterial(KEY_ALGORITHM, KEY_SIZE, IV_SIZE);
    }

    private Cipher getInstance() {
        try {
            return Cipher.getInstance(ALGORITHM, PROVIDER);
        } catch (NoSuchAlgorithmException | NoSuchProviderException | NoSuchPaddingException e) {
            throw Throwables.propagate(e);
        }
    }
}
