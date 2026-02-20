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
import com.palantir.crypto2.cipher.AesCbcCipher;
import com.palantir.crypto2.cipher.AesCtrCipher;
import com.palantir.crypto2.cipher.SeekableCipherFactory;
import com.palantir.crypto2.keys.KeyMaterial;
import com.palantir.seekio.InMemorySeekableDataInput;
import com.palantir.seekio.SeekableInput;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.util.Arrays;
import java.util.Random;
import java.util.stream.Stream;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.extension.ParameterContext;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.aggregator.AggregateWith;
import org.junit.jupiter.params.aggregator.ArgumentsAccessor;
import org.junit.jupiter.params.aggregator.ArgumentsAggregationException;
import org.junit.jupiter.params.aggregator.ArgumentsAggregator;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

public final class DecryptionTests {

    private static final boolean JCE = true;
    private static final boolean APACHE = !JCE;
    private static final String AES_CTR = AesCtrCipher.ALGORITHM;
    private static final String AES_CBC = AesCbcCipher.ALGORITHM;
    private static final int BLOCK_SIZE = 16;
    private static final int NUM_BYTES = 1024 * 1024;
    private static final Random random = new Random(0);
    private static byte[] data;

    @BeforeAll
    public static void beforeClass() {
        data = new byte[NUM_BYTES];
        random.nextBytes(data);
    }

    public static Stream<Arguments> ciphers() {
        return Stream.of(
                Arguments.of(AES_CTR, JCE, JCE),
                Arguments.of(AES_CTR, APACHE, APACHE),
                Arguments.of(AES_CTR, JCE, APACHE),
                Arguments.of(AES_CTR, APACHE, JCE),
                Arguments.of(AES_CBC, JCE, JCE));
    }

    static class StreamAggregator implements ArgumentsAggregator {
        @Override
        public Object aggregateArguments(ArgumentsAccessor accessor, ParameterContext _context)
                throws ArgumentsAggregationException {
            try {
                String algorithm = accessor.getString(0);
                Boolean forceJceEncrypt = accessor.getBoolean(1);
                Boolean forceJceDecrypt = accessor.getBoolean(2);
                ByteArrayOutputStream os = new ByteArrayOutputStream();
                KeyMaterial keyMaterial = SeekableCipherFactory.generateKeyMaterial(algorithm);
                try (OutputStream cos = CryptoStreamFactory.encrypt(os, keyMaterial, algorithm, forceJceEncrypt)) {
                    cos.write(data);
                }
                InMemorySeekableDataInput input = new InMemorySeekableDataInput(os.toByteArray());
                return CryptoStreamFactory.decrypt(input, keyMaterial, algorithm, forceJceDecrypt);
            } catch (Exception e) {
                throw new ArgumentsAggregationException("Could not create stream", e);
            }
        }
    }

    @ParameterizedTest
    @MethodSource("ciphers")
    public void testDecrypt(@AggregateWith(StreamAggregator.class) SeekableInput cis) throws IOException {
        assertThat(cis.getPos()).isZero();

        byte[] decrypted = new byte[NUM_BYTES];
        readFully(cis, decrypted);

        assertThat(cis.getPos()).isEqualTo(NUM_BYTES);
        assertThat(decrypted).isEqualTo(data);
    }

    @ParameterizedTest
    @MethodSource("ciphers")
    public void testSeek_firstBlock(@AggregateWith(StreamAggregator.class) SeekableInput cis) throws IOException {
        testSeek(cis, 0);
    }

    @ParameterizedTest
    @MethodSource("ciphers")
    public void testSeek_firstBlockAndOffset(@AggregateWith(StreamAggregator.class) SeekableInput cis)
            throws IOException {
        testSeek(cis, 1);
    }

    @ParameterizedTest
    @MethodSource("ciphers")
    public void testSeek_manyBlocks(@AggregateWith(StreamAggregator.class) SeekableInput cis) throws IOException {
        int pos = BLOCK_SIZE * 10;
        testSeek(cis, pos);
    }

    @ParameterizedTest
    @MethodSource("ciphers")
    public void testSeek_manyBlocksAndOffset(@AggregateWith(StreamAggregator.class) SeekableInput cis)
            throws IOException {
        int pos = BLOCK_SIZE * 10 + 1;
        testSeek(cis, pos);
    }

    @ParameterizedTest
    @MethodSource("ciphers")
    public void testSeek_onePastEndOfData(@AggregateWith(StreamAggregator.class) SeekableInput cis) throws IOException {
        cis.seek(NUM_BYTES);
        assertThat(cis.read(new byte[1], 0, 1)).isEqualTo(-1);
    }

    @ParameterizedTest
    @MethodSource("ciphers")
    public void testSeek_manyBlocksAndNegativeOffset(@AggregateWith(StreamAggregator.class) SeekableInput cis)
            throws IOException {
        int pos = BLOCK_SIZE * 10 - 1;
        testSeek(cis, pos);
    }

    @ParameterizedTest
    @MethodSource("ciphers")
    public void testBulkRead(@AggregateWith(StreamAggregator.class) SeekableInput cis) throws IOException {
        long startPos = cis.getPos();
        byte[] buffer = new byte[NUM_BYTES];
        int offset = 0;

        while (offset < buffer.length) {
            int read = cis.read(buffer, offset, buffer.length - offset);
            if (read == -1) {
                break;
            }
            offset += read;
        }

        assertThat(cis.getPos()).isEqualTo(startPos + buffer.length);
        assertThat(buffer).isEqualTo(data);
        assertThat(offset).isEqualTo(NUM_BYTES);
        cis.close();
    }

    private static void testSeek(SeekableInput cis, int seekPos) throws IOException {
        cis.seek(seekPos);

        assertThat(cis.getPos()).isEqualTo(seekPos);

        byte[] decrypted = new byte[NUM_BYTES - seekPos];
        readFully(cis, decrypted);

        byte[] expected = Arrays.copyOfRange(data, seekPos, NUM_BYTES);

        assertThat(decrypted).hasSameSizeAs(expected);
        assertThat(decrypted).isEqualTo(expected);
    }

    private static void readFully(SeekableInput input, byte[] decrypted) throws IOException {
        ByteStreams.readFully(new DefaultSeekableInputStream(input), decrypted);
    }
}
