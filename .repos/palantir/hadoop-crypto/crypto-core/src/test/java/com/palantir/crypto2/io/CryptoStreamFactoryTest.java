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

package com.palantir.crypto2.io;

import static org.assertj.core.api.Assertions.assertThat;

import com.google.common.io.ByteStreams;
import com.palantir.crypto2.cipher.AesCtrCipher;
import com.palantir.crypto2.keys.KeyMaterial;
import com.palantir.seekio.InMemorySeekableDataInput;
import com.palantir.seekio.SeekableInput;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.ThreadLocalRandom;
import org.apache.commons.crypto.stream.CtrCryptoInputStream;
import org.apache.commons.crypto.stream.CtrCryptoOutputStream;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledOnOs;
import org.junit.jupiter.api.condition.OS;

public final class CryptoStreamFactoryTest {

    private static final boolean FORCE_JCE = true;
    private static final byte[] BYTES = "data".getBytes(StandardCharsets.UTF_8);

    private KeyMaterial keyMaterial;

    @BeforeEach
    public void before() {
        keyMaterial = AesCtrCipher.generateKeyMaterial();
    }

    @Test
    @EnabledOnOs(OS.LINUX)
    public void ensureDefaultIsApache() {
        OutputStream encrypted = CryptoStreamFactory.encrypt(null, keyMaterial, AesCtrCipher.ALGORITHM);
        SeekableInput decrypted =
                CryptoStreamFactory.decrypt((SeekableInput) null, keyMaterial, AesCtrCipher.ALGORITHM);

        assertThat(encrypted).isInstanceOf(CtrCryptoOutputStream.class);
        assertThat(decrypted).isInstanceOf(CtrCryptoInputStream.class);
    }

    @Test
    public void testEncryptDecryptInputStream() throws IOException {
        ByteArrayOutputStream os = new ByteArrayOutputStream();
        OutputStream encrypted = CryptoStreamFactory.encrypt(os, keyMaterial, AesCtrCipher.ALGORITHM);
        encrypted.write(BYTES);
        encrypted.close();

        InputStream decrypted = CryptoStreamFactory.decrypt(
                new ByteArrayInputStream(os.toByteArray()), keyMaterial, AesCtrCipher.ALGORITHM);

        assertThat(ByteStreams.toByteArray(decrypted)).isEqualTo(BYTES);
    }

    @Test
    public void testEncryptDecryptJce() throws IOException {
        ByteArrayOutputStream os = new ByteArrayOutputStream();
        OutputStream encrypted = CryptoStreamFactory.encrypt(os, keyMaterial, AesCtrCipher.ALGORITHM, FORCE_JCE);
        encrypted.write(BYTES);
        encrypted.close();

        SeekableInput decrypted = CryptoStreamFactory.decrypt(
                new InMemorySeekableDataInput(os.toByteArray()), keyMaterial, AesCtrCipher.ALGORITHM, FORCE_JCE);

        byte[] readBytes = new byte[BYTES.length];
        int bytesRead = decrypted.read(readBytes, 0, BYTES.length);

        assertThat(bytesRead).isEqualTo(BYTES.length);
        assertThat(readBytes).isEqualTo(BYTES);
    }

    @Test
    public void testChunkingOutputStream() throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        byte[] data = new byte[100 * 1024 * 1024];
        ThreadLocalRandom.current().nextBytes(data);
        int chunkSize = 1;
        int dataOffset = 0;
        try (OutputStream out = new CryptoStreamFactory.ChunkingOutputStream(baos)) {
            while (data.length - dataOffset > 0) {
                int remaining = data.length - dataOffset;
                int toWrite = Math.min(chunkSize, remaining);
                out.write(data, dataOffset, toWrite);
                dataOffset += toWrite;
                chunkSize += ThreadLocalRandom.current().nextInt(1024);
            }
        }
        assertThat(baos.toByteArray()).isEqualTo(data);
    }
}
