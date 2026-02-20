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

import java.util.Properties;
import org.apache.commons.crypto.cipher.CryptoCipherFactory;

public final class ApacheCiphers {

    private ApacheCiphers() {}

    /**
     * Configures the provided {@link Properties} such that {@link CryptoCipherFactory#getCryptoCipher(String,
     * Properties)} will only try to use the OpenSSL cipher implementation which uses AES-NI.
     */
    public static Properties forceOpenSsl(Properties properties) {
        properties.setProperty(
                CryptoCipherFactory.CLASSES_KEY, CryptoCipherFactory.CipherProvider.OPENSSL.getClassName());
        return properties;
    }
}
