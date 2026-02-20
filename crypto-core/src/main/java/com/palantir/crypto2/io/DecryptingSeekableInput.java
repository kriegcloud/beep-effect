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

import com.google.common.annotations.VisibleForTesting;
import com.google.common.io.ByteStreams;
import com.palantir.crypto2.cipher.CipherStreamSupplier;
import com.palantir.crypto2.cipher.CipherStreamSupplierImpl;
import com.palantir.crypto2.cipher.SeekableCipher;
import com.palantir.seekio.SeekableInput;
import java.io.IOException;
import javax.crypto.Cipher;
import javax.crypto.CipherInputStream;

public final class DecryptingSeekableInput implements SeekableInput {

    /** Size of the {@link CipherInputStream} internal buffer. */
    private static final int CIPHER_INPUT_STREAM_BUFFER_SIZE = 512;

    private final DefaultSeekableInputStream delegate;
    private final SeekableCipher seekableCipher;
    private final CipherStreamSupplier supplier;
    private final long skipThreshold;

    private CipherInputStream decryptedStream;
    private long decryptedStreamPos;

    public DecryptingSeekableInput(SeekableInput delegate, SeekableCipher cipher) {
        this(delegate, cipher, new CipherStreamSupplierImpl());
    }

    @VisibleForTesting
    DecryptingSeekableInput(SeekableInput input, SeekableCipher cipher, CipherStreamSupplier supplier) {
        this.delegate = new DefaultSeekableInputStream(input);
        this.seekableCipher = cipher;
        this.supplier = supplier;

        /* small forward seeks can generate reverse seeks in some circumstances:
         *  1. seeking within the current block or the next block causes reading of the previous block (negative seek).
         *  2. CipherInputStream consumes CIPHER_INPUT_STREAM_BUFFER_SIZE bytes of the underlying stream, seeking
         *     more than a block ahead but less than this buffer results in needing to move the underlying stream
         *     backwards.
         */
        this.skipThreshold = Math.max(seekableCipher.getBlockSize() * 2, CIPHER_INPUT_STREAM_BUFFER_SIZE);

        decryptedStream = supplier.getInputStream(delegate, cipher.initCipher(Cipher.DECRYPT_MODE));
        decryptedStreamPos = 0L;
    }

    /**
     * Seeking can only be done to a block offset such that pos % blockSize == 0. "AES/CBC" must be updated with the
     * previous encrypted block in order to properly decrypt after seeking. It should therefore be seeked to block n - 1
     * and then updated by one block in order to be initialized correctly.
     */
    @Override
    public void seek(long pos) throws IOException {
        if (pos == decryptedStreamPos) {
            // short-circuit if no work to do
            return;
        }

        // read forward within a small range to prevent forward seeks in this stream causing reverse seeks in the
        // underlying stream
        long jump = pos - decryptedStreamPos;
        if (0 < jump && jump < skipThreshold) {
            ByteStreams.skipFully(decryptedStream, jump);
            decryptedStreamPos = pos;
            return;
        }

        int blockSize = seekableCipher.getBlockSize();

        // TODO(markelliot): (#34) not all SeekableCipher implementations require reading the previous blocks, we can
        // read and decrypt less (i.e. do less work) if we were able to switch this calculation into the right mode by
        // SeekableCipher implementation

        // If pos is in the first block then seek to 0 and skip pos bytes
        // else seek to block n - 1 where block n is the block containing the byte at offset pos
        // in order to initialize the Cipher with the previous encrypted block
        final long prevBlock;
        final int bytesToSkip;

        if (pos < blockSize) {
            prevBlock = 0;
            bytesToSkip = (int) pos;
        } else {
            prevBlock = pos / blockSize - 1;
            bytesToSkip = (int) (pos % blockSize + blockSize);
        }

        long prevBlockOffset = prevBlock * blockSize;
        Cipher cipher = seekableCipher.seek(prevBlockOffset);
        delegate.seek(prevBlockOffset);

        // Need a new cipher stream since seeking the stream and cipher invalidate the cipher stream's buffer
        decryptedStream = supplier.getInputStream(delegate, cipher);

        // Skip to the byte offset in the block where 'pos' is located
        ByteStreams.skipFully(decryptedStream, bytesToSkip);
        decryptedStreamPos = pos;
    }

    @Override
    public long getPos() throws IOException {
        return decryptedStreamPos;
    }

    @Override
    public int read(byte[] buffer, int offset, int length) throws IOException {
        int bytesRead = decryptedStream.read(buffer, offset, length);
        if (bytesRead != -1) {
            decryptedStreamPos += bytesRead;
        }
        return bytesRead;
    }

    @Override
    public void close() throws IOException {
        delegate.close();
        // TODO(davids): really this should close decryptedStream, but https://bugs.openjdk.java.net/browse/JDK-8064546
        // causes "java.io.IOException: javax.crypto.BadPaddingException: Given final block not properly padded" and
        // is not fixed until Java 7u85 (not publicly available) and Java 8u51.
        // decryptedStream.close();
    }
}
