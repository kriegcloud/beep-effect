/*
 * (c) Copyright 2021 Palantir Technologies Inc. All rights reserved.
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

import com.palantir.seekio.InMemorySeekableDataInput;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.util.Random;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

public final class ApacheCtrDecryptingSeekableInputTests {
    private static final int NUM_BYTES = 1024 * 1024;
    private static final Random random = new Random(0);
    private static byte[] data;

    @BeforeAll
    public static void beforeClass() throws IOException {
        data = new byte[NUM_BYTES];
        random.nextBytes(data);
    }

    @Test
    public void testEmptyRead() throws IOException {
        ByteBuffer dst = ByteBuffer.allocate(1024);
        byte[] emptyData = new byte[] {};

        ApacheCtrDecryptingSeekableInput.InputAdapter adapter = inputAdapter(emptyData);
        assertThat(adapter.read(dst)).isEqualTo(-1);
        assertThat(dst.position()).isEqualTo(0);
    }

    @Test
    public void testFullRead() throws IOException {
        ByteBuffer dst = ByteBuffer.allocate(2 * NUM_BYTES);

        ApacheCtrDecryptingSeekableInput.InputAdapter adapter = inputAdapter(data);
        assertThat(adapter.read(dst)).isEqualTo(NUM_BYTES);
        assertThat(dst.position()).isEqualTo(NUM_BYTES);
    }

    @Test
    public void testPartialRead() throws IOException {
        int toRead = NUM_BYTES / 2;
        ByteBuffer dst = ByteBuffer.allocate(toRead);

        ApacheCtrDecryptingSeekableInput.InputAdapter adapter = inputAdapter(data);
        assertThat(adapter.read(dst)).isEqualTo(toRead);
        assertThat(dst.position()).isEqualTo(toRead);
    }

    private ApacheCtrDecryptingSeekableInput.InputAdapter inputAdapter(byte[] inputData) {
        return new ApacheCtrDecryptingSeekableInput.InputAdapter(new InMemorySeekableDataInput(inputData));
    }
}
