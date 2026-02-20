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

package com.palantir.crypto2.hadoop.cipher;

import com.palantir.crypto2.cipher.SeekableCipher;
import com.palantir.crypto2.io.CryptoStreamFactory;
import com.palantir.crypto2.io.DecryptingSeekableInput;
import com.palantir.crypto2.io.DefaultSeekableInputStream;
import com.palantir.crypto2.keys.KeyMaterial;
import com.palantir.seekio.SeekableInput;
import java.io.IOException;
import org.apache.hadoop.fs.FSDataInputStream;
import org.apache.hadoop.fs.FSInputStream;

/**
 * Decrypts data read from the given {@link FSDataInputStream} using the given {@link KeyMaterial} and cipher {@code
 * algorithm}.
 */
public final class FsCipherInputStream extends FSInputStream {

    private final DefaultSeekableInputStream delegate;

    /**
     * Deprecated as this constructor will always use the JCE crypto implementations which can be significantly
     * slower in many cases.
     *
     * @deprecated use {@link FsCipherInputStream#FsCipherInputStream(FSDataInputStream, KeyMaterial, String)} instead.
     */
    @Deprecated
    public FsCipherInputStream(FSDataInputStream delegate, SeekableCipher cipher) {
        this.delegate =
                new DefaultSeekableInputStream(new DecryptingSeekableInput(new FsSeekableInput(delegate), cipher));
    }

    public FsCipherInputStream(FSDataInputStream delegate, KeyMaterial keyMaterial, String algorithm) {
        SeekableInput decrypted = CryptoStreamFactory.decrypt(new FsSeekableInput(delegate), keyMaterial, algorithm);
        this.delegate = new DefaultSeekableInputStream(decrypted);
    }

    @Override
    public void seek(long pos) throws IOException {
        delegate.seek(pos);
    }

    @Override
    public long getPos() throws IOException {
        return delegate.getPos();
    }

    @Override
    public boolean seekToNewSource(long _targetPos) throws IOException {
        return false;
    }

    @Override
    public int read() throws IOException {
        return delegate.read();
    }

    @Override
    public int read(byte[] buf, int off, int len) throws IOException {
        return delegate.read(buf, off, len);
    }

    @Override
    public void close() throws IOException {
        delegate.close();
    }

    /**
     * Wrapper that converts an {@link FSDataInputStream} into a {@link SeekableInput}.
     */
    private static final class FsSeekableInput implements SeekableInput {

        private FSDataInputStream input;

        private FsSeekableInput(FSDataInputStream input) {
            this.input = input;
        }

        @Override
        public void seek(long offset) throws IOException {
            input.seek(offset);
        }

        @Override
        public long getPos() throws IOException {
            return input.getPos();
        }

        @Override
        public int read(byte[] bytes, int offset, int length) throws IOException {
            return input.read(bytes, offset, length);
        }

        @Override
        public void close() throws IOException {
            input.close();
        }
    }
}
