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

import com.palantir.seekio.SeekableInput;
import java.io.IOException;
import java.io.InputStream;

public final class DefaultSeekableInputStream extends InputStream implements SeekableInput {

    private final byte[] oneByte = new byte[1];
    private final SeekableInput input;

    public DefaultSeekableInputStream(SeekableInput input) {
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
    public int read() throws IOException {
        int numRead = input.read(oneByte, 0, 1);
        if (numRead == 1) {
            return oneByte[0] & 0xFF;
        } else {
            return numRead;
        }
    }

    @Override
    public int read(byte[] buf, int off, int len) throws IOException {
        return input.read(buf, off, len);
    }

    @Override
    public void close() throws IOException {
        input.close();
    }
}
