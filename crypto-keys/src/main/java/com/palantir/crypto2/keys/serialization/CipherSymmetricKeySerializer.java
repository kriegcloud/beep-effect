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
import java.security.NoSuchAlgorithmException;
import javax.crypto.Cipher;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.SecretKey;

/**
 * Serializer for wrapping and unwrapping {@link KeyMaterial}. The {@link #wrap} method returns the KeyMaterial
 * serialized as follows, which is the same format the {@link #unwrap} method expects:
 *
 * <pre>
 *  +--------------------------------------------------------------+
 *  | version | wrapping iv | key algorithm length | key algorithm |
 *  |   byte  |    byte[]   |          int         |     byte[]    |
 *  +--------------------------------------------------------------+
 *  +-------------------------------------------------------+
 *  | wrapped key length | wrapped key | iv length |   iv   |
 *  |        int         |    byte[]   |    int    | byte[] |
 *  +-------------------------------------------------------+
 * </pre>
 */
final class CipherSymmetricKeySerializer implements SymmetricKeySerializer {
    private final int ivSize;
    private final int version;
    private final CipherFactory cipherFactory;

    CipherSymmetricKeySerializer(int ivSize, int version, CipherFactory cipherFactory) {
        this.ivSize = ivSize;
        this.version = version;
        this.cipherFactory = cipherFactory;
    }

    @Override
    public byte[] wrap(KeyMaterial keyMaterial, SecretKey key) {
        ByteArrayOutputStream byteStream = new ByteArrayOutputStream();
        DataOutputStream stream = new DataOutputStream(byteStream);

        byte[] wrappingIv = KeyMaterials.generateIv(ivSize);
        Cipher keyWrappingCipher = cipherFactory.getCipher(Cipher.WRAP_MODE, key, wrappingIv);
        SecretKey secretKey = keyMaterial.getSecretKey();

        try {
            stream.write(version);

            stream.write(wrappingIv);

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
            throw new SafeRuntimeException("Unable to wrap key", e);
        }
    }

    @Override
    public KeyMaterial unwrap(byte[] wrappedKeyMaterial, SecretKey key) {
        DataInputStream stream = new DataInputStream(new ByteArrayInputStream(wrappedKeyMaterial));

        try {
            int readVersion = stream.read();
            Preconditions.checkArgument(
                    readVersion == version,
                    "Invalid serialization format version",
                    SafeArg.of("expectedVersion", readVersion),
                    SafeArg.of("foundVersion", version));

            byte[] wrappingIv = new byte[ivSize];
            stream.readFully(wrappingIv);
            Cipher keyUnwrappingCipher = cipherFactory.getCipher(Cipher.UNWRAP_MODE, key, wrappingIv);

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
        return version;
    }

    interface CipherFactory {
        Cipher getCipher(int cipherMode, SecretKey secretKey, byte[] iv);
    }
}
