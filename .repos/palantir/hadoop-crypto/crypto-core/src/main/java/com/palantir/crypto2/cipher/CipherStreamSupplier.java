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

import java.io.InputStream;
import java.io.OutputStream;
import javax.crypto.Cipher;
import javax.crypto.CipherInputStream;
import javax.crypto.CipherOutputStream;

/**
 * Wraps streams in cryptographic streams for encryption and decryption.
 */
public interface CipherStreamSupplier {

    /**
     * Wraps the {@link InputStream} in a {@link CipherInputStream} which uses the given {@link Cipher} for decryption.
     */
    CipherInputStream getInputStream(InputStream is, Cipher cipher);

    /**
     * Wraps the {@link OutputStream} in a {@link CipherOutputStream} which uses the given {@link Cipher} for
     * encryption.
     */
    CipherOutputStream getOutputStream(OutputStream os, Cipher cipher);
}
