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

import static org.assertj.core.api.Assertions.fail;

import com.palantir.crypto2.io.DecryptingSeekableInput;
import com.palantir.crypto2.keys.KeyMaterial;
import com.palantir.seekio.SeekableInput;
import java.io.IOException;
import org.junit.jupiter.api.Test;

public final class NoNegativeSeeksTest {

    @Test
    public void testDecryptingSeekableInput_doesNotSeekNegatively() throws IOException {
        KeyMaterial keyMaterial = SeekableCipherFactory.generateKeyMaterial(AesCtrCipher.ALGORITHM);
        SeekableCipher cipher = SeekableCipherFactory.getCipher(AesCtrCipher.ALGORITHM, keyMaterial);

        for (int increment = 16; increment < 2048; increment += 16) {
            try (DecryptingSeekableInput stream =
                    new DecryptingSeekableInput(new DisallowNegativeSeeksSeekableInput(), cipher)) {
                for (int i = 0; i < 1024 * 1024; i += increment) {
                    stream.seek(i);
                }
            }
        }
    }

    private static final class DisallowNegativeSeeksSeekableInput implements SeekableInput {
        private long pos = 0;

        @Override
        public void close() throws IOException {}

        @Override
        public void seek(long offset) throws IOException {
            if (offset < pos) {
                fail("fail");
            }
            pos = offset;
        }

        @Override
        public long getPos() throws IOException {
            return pos;
        }

        @Override
        public int read(byte[] _bytes, int _offset, int length) throws IOException {
            pos += length;
            return length;
        }
    }
}
