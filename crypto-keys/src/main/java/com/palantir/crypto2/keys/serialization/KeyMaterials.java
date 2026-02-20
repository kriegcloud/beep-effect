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

import static com.palantir.logsafe.Preconditions.checkArgument;

import com.google.common.base.Throwables;
import com.palantir.crypto2.keys.KeyMaterial;
import com.palantir.logsafe.SafeArg;
import com.palantir.logsafe.exceptions.SafeRuntimeException;
import com.palantir.logsafe.logger.SafeLogger;
import com.palantir.logsafe.logger.SafeLoggerFactory;
import java.io.ByteArrayInputStream;
import java.io.DataInputStream;
import java.io.IOException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.SecureRandom;
import java.util.Map;
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

/**
 * Utilities for {@link KeyMaterial} generation and serialization. The KeyMaterial is securely serialized by wrapping
 * the {@link SecretKey} using the given {@link PublicKey} and deserialized by unwrapping the SecretKey using the given
 */
public final class KeyMaterials {

    private static final SafeLogger log = SafeLoggerFactory.get(KeyMaterials.class);
    private static final Map<Integer, ? extends KeySerializer> ASYMMETRIC_SERIALIZERS =
            KeySerializers.getAsymmetricSerializers();
    private static final Map<Integer, ? extends SymmetricKeySerializer> SYMMETRIC_SERIALIZERS =
            KeySerializers.getSymmetricSerializers();

    private KeyMaterials() {}

    public static SecretKey generateKey(String keyAlgorithm, int keySize) {
        try {
            KeyGenerator keyGen = KeyGenerator.getInstance(keyAlgorithm);
            keyGen.init(getSafeKeyLength(keyAlgorithm, keySize));
            return keyGen.generateKey();
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw Throwables.propagate(e);
        }
    }

    public static byte[] generateIv(int ivSize) {
        byte[] iv = new byte[ivSize];
        SecureRandom rng = new SecureRandom();
        rng.nextBytes(iv);
        return iv;
    }

    public static KeyMaterial generateKeyMaterial(String keyAlgorithm, int keySize, int ivSize) {
        SecretKey key = generateKey(keyAlgorithm, keySize);
        byte[] iv = generateIv(ivSize);
        return KeyMaterial.of(key, iv);
    }

    public static KeyMaterial from(String keyAlgorithm, byte[] encodedKey, byte[] iv) {
        SecretKeySpec secretKey = new SecretKeySpec(encodedKey, keyAlgorithm);
        return KeyMaterial.of(secretKey, iv);
    }

    /**
     * See {@link KeySerializer} to understand when to use {@link #wrap} vs. {@link #symmetricWrap}.
     */
    public static byte[] wrap(KeyMaterial keyMaterial, PublicKey key) {
        return KeySerializerV2.INSTANCE.wrap(keyMaterial, key);
    }

    /**
     * See {@link SymmetricKeySerializer} to understand when to use {@link #wrap} vs. {@link #symmetricWrap}.
     */
    public static byte[] symmetricWrap(KeyMaterial keyMaterial, SecretKey key) {
        return SymmetricKeySerializerV4.INSTANCE.wrap(keyMaterial, key);
    }

    public static KeyMaterial unwrap(byte[] wrappedKeyMaterial, PrivateKey key) {
        int version = version(wrappedKeyMaterial);
        checkArgument(
                ASYMMETRIC_SERIALIZERS.containsKey(version),
                "Invalid serialization format version",
                SafeArg.of("expectedVersion", ASYMMETRIC_SERIALIZERS.keySet()),
                SafeArg.of("foundVersion", version));

        return ASYMMETRIC_SERIALIZERS.get(version).unwrap(wrappedKeyMaterial, key);
    }

    public static KeyMaterial symmetricUnwrap(byte[] wrappedKeyMaterial, SecretKey key) {
        int version = version(wrappedKeyMaterial);
        checkArgument(
                SYMMETRIC_SERIALIZERS.containsKey(version),
                "Invalid serialization format version",
                SafeArg.of("expectedVersion", SYMMETRIC_SERIALIZERS.keySet()),
                SafeArg.of("foundVersion", version));

        return SYMMETRIC_SERIALIZERS.get(version).unwrap(wrappedKeyMaterial, key);
    }

    private static int version(byte[] wrappedKeyMaterial) {
        try {
            DataInputStream stream = new DataInputStream(new ByteArrayInputStream(wrappedKeyMaterial));
            return stream.read();
        } catch (IOException e) {
            throw new SafeRuntimeException("Unable to read version from wrapped key", e);
        }
    }

    /**
     * Returns a key length for the provided algorithm that is at most the desired length but not more than this JVM
     * supports.
     *
     * @param algorithm the key algorithm to be used
     * @param desiredLength the desired key length
     * @return a length that is the smaller of provided key size and the maximum allowed for that algorithm on this JVM
     * @throws InvalidKeyException when desired key length exceeds maximum allowable unless environmental variable
     * {@code OVERRIDE_KEY_SAFETY_PROTECTIONS} is set and true
     */
    public static int getSafeKeyLength(String algorithm, int desiredLength) throws InvalidKeyException {
        int maxAllowedKeyLength;
        try {
            maxAllowedKeyLength = Cipher.getMaxAllowedKeyLength(algorithm);
        } catch (NoSuchAlgorithmException e) {
            throw Throwables.propagate(e);
        }
        int safeSize = Math.min(maxAllowedKeyLength, desiredLength);
        if (safeSize < desiredLength) {
            if (!Boolean.parseBoolean(System.getenv("OVERRIDE_KEY_SAFETY_PROTECTIONS"))) {
                throw new InvalidKeyException(String.format(
                        "Requested key length %d exceeds JVM allowable key length %d for %s",
                        desiredLength, maxAllowedKeyLength, algorithm));
            }
            log.warn(
                    "Requested key length exceeds JVM allowable key length for algorithm, using max key size",
                    SafeArg.of("desiredLength", desiredLength),
                    SafeArg.of("algorithm", algorithm),
                    SafeArg.of("maxAllowedKeyLength", maxAllowedKeyLength),
                    SafeArg.of("safeSize", safeSize));
        }
        return safeSize;
    }
}
