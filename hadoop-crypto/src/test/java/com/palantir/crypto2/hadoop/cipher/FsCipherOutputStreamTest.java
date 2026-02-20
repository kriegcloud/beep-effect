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

import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.palantir.crypto2.cipher.CipherStreamSupplier;
import com.palantir.crypto2.cipher.SeekableCipher;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import javax.crypto.Cipher;
import javax.crypto.CipherOutputStream;
import org.apache.hadoop.fs.FSDataOutputStream;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public final class FsCipherOutputStreamTest {

    private static final byte[] bytes = "bytes".getBytes(StandardCharsets.UTF_8);

    private FSDataOutputStream os;
    private Cipher initCipher;
    private SeekableCipher seekableCipher;
    private CipherStreamSupplier supplier;
    private CipherOutputStream cos;
    private FsCipherOutputStream scos;

    @BeforeEach
    public void before() {
        initCipher = mock(Cipher.class);
        os = mock(FSDataOutputStream.class);
        cos = mock(CipherOutputStream.class);
        seekableCipher = mock(SeekableCipher.class);
        supplier = mock(CipherStreamSupplier.class);

        when(seekableCipher.initCipher(anyInt())).thenReturn(initCipher);
        when(supplier.getOutputStream(os, initCipher)).thenReturn(cos);

        scos = new FsCipherOutputStream(os, seekableCipher, supplier);
    }

    @Test
    public void testInit() throws IOException {
        verify(seekableCipher).initCipher(Cipher.ENCRYPT_MODE);
        verify(supplier).getOutputStream(os, initCipher);
    }

    @Test
    public void testWrite() throws IOException {
        scos.write(0);
        verify(cos).write(0);
    }

    @Test
    public void testWrite_callsWriteWithLength() throws IOException {
        scos.write(bytes, 0, bytes.length);
        verify(cos).write(bytes, 0, bytes.length);
    }

    @Test
    public void testWrite_callsBatchWrite() throws IOException {
        scos.write(bytes);
        verify(cos).write(bytes);
    }
}
