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
import com.palantir.crypto2.keys.KeyMaterial;
import com.palantir.logsafe.Preconditions;
import com.palantir.logsafe.SafeArg;
import com.palantir.logsafe.exceptions.SafeRuntimeException;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.DataInputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.KeyPair;
import java.security.NoSuchAlgorithmException;
import java.security.PrivateKey;
import java.security.PublicKey;
import javax.crypto.Cipher;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.SecretKey;

/**
 * Serializer of wrapping and unwrapping {@link KeyMaterial}. The {@link #wrap} method returns the KeyMaterial
 * serialized as follows, which is the same format the {@link #unwrap} method expects:
 *
 * <pre>
 *  +--------------------------------------------------------------------------------------------------------------+
 *  | version | cipher algorithm length | cipher algorithm | wrapped key length | wrapped key | iv length |   iv   |
 *  |   byte  |           int           |       byte[]     |         int        |    byte[]   |    int    | byte[] |
 *  +--------------------------------------------------------------------------------------------------------------+
 * </pre>
 *
 * {@link KeySerializerV1} incorrectly wrote the length values for the algorithm, wrapped key, and iv as bytes rather
 * than ints which meant certain {@link KeyMaterial} couldn't be properly serialized/deserialized when {@link KeyPair}s
 * of certain lengths were used.
 */
enum KeySerializerV2 implements KeySerializer {
    INSTANCE;

    private static final int VERSION = 2;

    @Override
    public byte[] wrap(KeyMaterial keyMaterial, PublicKey key) {
        ByteArrayOutputStream byteStream = new ByteArrayOutputStream();
        DataOutputStream stream = new DataOutputStream(byteStream);
        Cipher keyWrappingCipher = KeySerializers.getCipher(Cipher.WRAP_MODE, key);
        SecretKey secretKey = keyMaterial.getSecretKey();

        try {
            stream.write(VERSION);

            String keyAlgorithm = secretKey.getAlgorithm();
            stream.writeInt(keyAlgorithm.length());
            stream.write(keyAlgorithm.getBytes(StandardCharsets.UTF_8));

            byte[] encryptedKey = keyWrappingCipher.wrap(secretKey);
            stream.writeInt(encryptedKey.length);
            stream.write(encryptedKey);

            byte[] iv = keyMaterial.getIv();
            stream.writeInt(iv.length);
            stream.write(iv);

            stream.close();
            return byteStream.toByteArray();
        } catch (IOException | InvalidKeyException | IllegalBlockSizeException e) {
            throw Throwables.propagate(e);
        }
    }

    @Override
    public KeyMaterial unwrap(byte[] wrappedKeyMaterial, PrivateKey key) {
        DataInputStream stream = new DataInputStream(new ByteArrayInputStream(wrappedKeyMaterial));
        Cipher keyUnwrappingCipher = KeySerializers.getCipher(Cipher.UNWRAP_MODE, key);

        try {
            int version = stream.read();
            Preconditions.checkArgument(
                    VERSION == version,
                    "Invalid serialization format version",
                    SafeArg.of("expectedVersion", VERSION),
                    SafeArg.of("foundVersion", version));

            int algorithmLength = stream.readInt();
            byte[] algorithmBytes = new byte[algorithmLength];
            stream.readFully(algorithmBytes);

            int keyLength = stream.readInt();
            byte[] secretKeyBytes = new byte[keyLength];
            stream.readFully(secretKeyBytes);

            int ivLength = stream.readInt();
            byte[] iv = new byte[ivLength];
            stream.readFully(iv);

            String algorithm = new String(algorithmBytes, StandardCharsets.UTF_8);
            SecretKey secretKey = (SecretKey) keyUnwrappingCipher.unwrap(secretKeyBytes, algorithm, Cipher.SECRET_KEY);
            return KeyMaterial.of(secretKey, iv);
        } catch (InvalidKeyException | NoSuchAlgorithmException | IOException e) {
            throw new SafeRuntimeException("Unable to unwrap key", e);
        }
    }

    @Override
    public int getVersion() {
        return VERSION;
    }
}
