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

package com.palantir.crypto2.jmh;

import com.palantir.crypto2.cipher.ApacheCiphers;
import com.palantir.crypto2.keys.KeyMaterial;
import com.palantir.crypto2.keys.serialization.KeyMaterials;
import com.palantir.logsafe.SafeArg;
import com.palantir.logsafe.exceptions.SafeIllegalStateException;
import com.palantir.logsafe.exceptions.SafeRuntimeException;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.Key;
import java.security.NoSuchAlgorithmException;
import java.security.spec.AlgorithmParameterSpec;
import java.util.Arrays;
import java.util.Properties;
import java.util.Random;
import javax.crypto.Cipher;
import javax.crypto.CipherOutputStream;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.IvParameterSpec;
import org.apache.commons.crypto.stream.CtrCryptoOutputStream;
import org.openjdk.jmh.annotations.Benchmark;
import org.openjdk.jmh.annotations.Fork;
import org.openjdk.jmh.annotations.Measurement;
import org.openjdk.jmh.annotations.Param;
import org.openjdk.jmh.annotations.Scope;
import org.openjdk.jmh.annotations.Setup;
import org.openjdk.jmh.annotations.Warmup;
import org.openjdk.jmh.runner.Runner;
import org.openjdk.jmh.runner.RunnerException;
import org.openjdk.jmh.runner.options.OptionsBuilder;

@Warmup(iterations = 3, time = 3)
@Measurement(iterations = 4, time = 4)
@Fork(1)
public class EncryptionBenchmark {

    @org.openjdk.jmh.annotations.State(Scope.Benchmark)
    @SuppressWarnings("DesignForExtension") // JMH needs public non-final State classes
    public static class State {
        private static final Random random = new Random();

        @Param({"1048576", "10485760", "104857600"})
        public int numBytes;

        @Param
        public WriteStrategy writeStrategy;

        public byte[] data;

        public KeyMaterial key;

        @SuppressWarnings("RegexpSinglelineJava")
        @Setup
        public void setup() throws IOException {
            data = new byte[numBytes];
            random.nextBytes(data);
            key = KeyMaterials.generateKeyMaterial("AES", 256, 16);
            for (WriteStrategy strategy : WriteStrategy.values()) {
                validateWriteStrategy(data, strategy);
            }
        }
    }

    private static void validateWriteStrategy(byte[] data, WriteStrategy strategy) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        strategy.writeTo(data, baos);
        byte[] copy = baos.toByteArray();
        if (!Arrays.equals(data, copy)) {
            throw new SafeIllegalStateException("WriteStrategy failed", SafeArg.of("strategy", strategy));
        }
    }

    public enum WriteStrategy {
        ENTIRE_BUFFER() {
            @Override
            void writeTo(byte[] input, OutputStream output) throws IOException {
                output.write(input);
            }
        },
        CHUNKED() {
            private static final int BUFFER_SIZE = 16 * 1024;

            // Simulate a buffered write with relatively large buffers
            @Override
            void writeTo(byte[] input, OutputStream output) throws IOException {
                for (int i = 0; i < input.length; i += BUFFER_SIZE) {
                    output.write(input, i, Math.min(BUFFER_SIZE, input.length - i));
                }
            }
        };

        abstract void writeTo(byte[] input, OutputStream output) throws IOException;
    }

    @Benchmark
    public final byte[] gcmEncrypt(State state) throws NoSuchPaddingException, NoSuchAlgorithmException {
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        GCMParameterSpec gcmSpec = new GCMParameterSpec(8 * 16, state.key.getIv());

        return encrypt(state.writeStrategy, state.data, cipher, state.key.getSecretKey(), gcmSpec);
    }

    @Benchmark
    public final byte[] ctrEncrypt(State state) throws NoSuchPaddingException, NoSuchAlgorithmException {
        Cipher cipher = Cipher.getInstance("AES/CTR/NoPadding");
        IvParameterSpec ivSpec = new IvParameterSpec(state.key.getIv());
        return encrypt(state.writeStrategy, state.data, cipher, state.key.getSecretKey(), ivSpec);
    }

    @Benchmark
    public final byte[] apacheEncrypt(State state) throws IOException {
        Properties props = ApacheCiphers.forceOpenSsl(new Properties());

        // TODO(ckozak): implement BlackholeOutputStream wrapper around jmh Blackhole rather than buffering
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (CtrCryptoOutputStream output =
                new CtrCryptoOutputStream(props, baos, state.key.getSecretKey().getEncoded(), state.key.getIv())) {
            state.writeStrategy.writeTo(state.data, output);
        }
        return baos.toByteArray();
    }

    private byte[] encrypt(
            WriteStrategy writeStrategy, byte[] bytes, Cipher cipher, Key key, AlgorithmParameterSpec spec) {
        try {
            cipher.init(Cipher.ENCRYPT_MODE, key, spec);
            // TODO(ckozak): implement BlackholeOutputStream wrapper around jmh Blackhole rather than buffering
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            try (CipherOutputStream os = new CipherOutputStream(baos, cipher)) {
                writeStrategy.writeTo(bytes, os);
            }
            return baos.toByteArray();
        } catch (InvalidKeyException | InvalidAlgorithmParameterException | IOException e) {
            throw new SafeRuntimeException(e);
        }
    }

    public static void main(String[] _args) throws RunnerException {
        new Runner(new OptionsBuilder()
                        .include(EncryptionBenchmark.class.getSimpleName())
                        .build())
                .run();
    }
}
