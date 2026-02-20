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

package com.palantir.crypto2.example;

import static org.assertj.core.api.Assertions.assertThat;

import com.palantir.crypto2.cipher.AesCtrCipher;
import com.palantir.crypto2.cipher.SeekableCipherFactory;
import com.palantir.crypto2.io.CryptoStreamFactory;
import com.palantir.crypto2.keys.KeyMaterial;
import com.palantir.seekio.InMemorySeekableDataInput;
import com.palantir.seekio.SeekableInput;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.Test;

public final class ExampleUsage {

    @Test
    public void decryptingSeekableInputExample() throws IOException {
        byte[] bytes = "0123456789".getBytes(StandardCharsets.UTF_8);

        // Store this key material for future decryption
        KeyMaterial keyMaterial = SeekableCipherFactory.generateKeyMaterial(AesCtrCipher.ALGORITHM);
        ByteArrayOutputStream os = new ByteArrayOutputStream(bytes.length);

        // Encrypt some bytes
        OutputStream encryptedStream = CryptoStreamFactory.encrypt(os, keyMaterial, AesCtrCipher.ALGORITHM);
        encryptedStream.write(bytes);
        encryptedStream.close();
        byte[] encryptedBytes = os.toByteArray();

        // Bytes written to stream are encrypted
        assertThat(encryptedBytes).isNotEqualTo(bytes);

        SeekableInput is = new InMemorySeekableDataInput(encryptedBytes);
        SeekableInput decryptedStream = CryptoStreamFactory.decrypt(is, keyMaterial, AesCtrCipher.ALGORITHM);

        // Seek to the last byte in the decrypted stream and verify its decrypted value
        byte[] readBytes = new byte[bytes.length];
        decryptedStream.seek(bytes.length - 1);
        decryptedStream.read(readBytes, 0, 1);
        assertThat(readBytes[0]).isEqualTo(bytes[bytes.length - 1]);

        // Seek to the beginning of the decrypted stream and verify it's equal to the raw bytes
        decryptedStream.seek(0);
        decryptedStream.read(readBytes, 0, bytes.length);
        assertThat(readBytes).isEqualTo(bytes);
    }
}
