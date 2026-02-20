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
import com.google.common.base.Suppliers;
import com.palantir.crypto2.cipher.ApacheCiphers;
import com.palantir.crypto2.cipher.SeekableCipher;
import com.palantir.crypto2.cipher.SeekableCipherFactory;
import com.palantir.crypto2.keys.KeyMaterial;
import com.palantir.logsafe.exceptions.SafeIllegalStateException;
import com.palantir.logsafe.exceptions.SafeNullPointerException;
import com.palantir.logsafe.exceptions.SafeUnsupportedOperationException;
import com.palantir.logsafe.logger.SafeLogger;
import com.palantir.logsafe.logger.SafeLoggerFactory;
import com.palantir.seekio.SeekableInput;
import java.io.FilterOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Properties;
import java.util.function.Supplier;
import javax.crypto.Cipher;
import javax.crypto.CipherOutputStream;
import javax.crypto.SecretKey;
import org.apache.commons.crypto.stream.CtrCryptoOutputStream;

public final class CryptoStreamFactory {

    private static final SafeLogger log = SafeLoggerFactory.get(CryptoStreamFactory.class);
    private static final Properties PROPS = ApacheCiphers.forceOpenSsl(new Properties());
    private static final String AES_ALGORITHM = "AES/CTR/NoPadding";

    private static final Supplier<Boolean> OPENSSL_IS_AVAILABLE = Suppliers.memoize(() -> {
        try {
            ApacheCtrDecryptingSeekableInput.getCipherInstance().close();
            log.info("Detected OpenSSL: the openssl native implementation will be used for AES/CTR/NoPadding");
            return true;
        } catch (Throwable t) {
            log.info(
                    "Unable to initialize cipher with OpenSSL, falling back to "
                            + "JCE implementation - see github.com/palantir/hadoop-crypto#faq",
                    t);
            return false;
        }
    });

    private CryptoStreamFactory() {}

    /**
     * Returns a {@link SeekableInput} that decrypts the given SeekableInput using the given {@link KeyMaterial} and
     * cipher {@code algorithm}. When OpenSSL is available an implementation that uses AES-NI will be returned.
     */
    public static SeekableInput decrypt(SeekableInput encryptedInput, KeyMaterial keyMaterial, String algorithm) {
        return decrypt(encryptedInput, keyMaterial, algorithm, false);
    }

    @VisibleForTesting
    static SeekableInput decrypt(
            SeekableInput encryptedInput, KeyMaterial keyMaterial, String algorithm, boolean forceJce) {
        if (!algorithm.equals(AES_ALGORITHM) || !OPENSSL_IS_AVAILABLE.get() || forceJce) {
            return new DecryptingSeekableInput(encryptedInput, SeekableCipherFactory.getCipher(algorithm, keyMaterial));
        }

        try {
            return new ApacheCtrDecryptingSeekableInput(encryptedInput, keyMaterial);
        } catch (IOException e) {
            throw new SafeIllegalStateException("Failed to create ApacheCtrDecryptingSeekableInput", e);
        }
    }

    /**
     * Returns an {@link InputStream} that decrypts the given InputStream using the given {@link KeyMaterial} and
     * cipher {@code algorithm}. When OpenSSL is available an implementation that uses AES-NI will be returned.
     */
    public static InputStream decrypt(InputStream input, KeyMaterial keyMaterial, String algorithm) {
        return new DefaultSeekableInputStream(decrypt(new StreamSeekableInput(input), keyMaterial, algorithm));
    }

    /**
     * Returns an {@link OutputStream} that encrypts the given OutputStream using the given {@link KeyMaterial} and
     * cipher {@code algorithm}. When OpenSSL is available an implementation that uses AES-NI will be returned.
     */
    public static OutputStream encrypt(OutputStream output, KeyMaterial keyMaterial, String algorithm) {
        return encrypt(output, keyMaterial, algorithm, false);
    }

    @VisibleForTesting
    static OutputStream encrypt(OutputStream output, KeyMaterial keyMaterial, String algorithm, boolean forceJce) {
        if (!algorithm.equals(AES_ALGORITHM) || !OPENSSL_IS_AVAILABLE.get() || forceJce) {
            return createDefaultEncryptedStream(output, keyMaterial, algorithm);
        }

        try {
            return createApacheEncryptedStream(output, keyMaterial);
        } catch (IOException e) {
            throw new SafeIllegalStateException("Failed to create CtrCryptoOutputStream", e);
        }
    }

    private static OutputStream createApacheEncryptedStream(OutputStream output, KeyMaterial keyMaterial)
            throws IOException {
        SecretKey secretKey = keyMaterial.getSecretKey();
        byte[] iv = keyMaterial.getIv();
        return new CtrCryptoOutputStream(PROPS, output, secretKey.getEncoded(), iv);
    }

    private static OutputStream createDefaultEncryptedStream(
            OutputStream output, KeyMaterial keyMaterial, String algorithm) {
        SeekableCipher cipher = SeekableCipherFactory.getCipher(algorithm, keyMaterial);
        return new ChunkingOutputStream(new CipherOutputStream(output, cipher.initCipher(Cipher.ENCRYPT_MODE)));
    }

    private static class StreamSeekableInput implements SeekableInput {
        private final InputStream input;

        StreamSeekableInput(InputStream input) {
            this.input = input;
        }

        @Override
        public void seek(long _offset) {
            throw new SafeUnsupportedOperationException();
        }

        @Override
        public long getPos() {
            throw new SafeUnsupportedOperationException();
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

    /**
     * {@link ChunkingOutputStream} limits the size of individual writes to the wrapped {@link OutputStream}
     * in order to prevent degraded performance on large buffers as described in
     * <a href="https://github.com/palantir/hadoop-crypto/pull/586">hadoop-crypto#586</a>.
     */
    static final class ChunkingOutputStream extends FilterOutputStream {

        /**
         * Chunk size of 16 KB is small enough to allow cipher implementations to become hot and optimize properly
         * when given large inputs. Otherwise large array writes into a {@link CipherOutputStream} fail to use
         * intrinsified implementations. If 16 KB chunks aren't enough to produce hot methods, the I/O is small
         * and infrequent enough that performance isn't relevant.
         * For more information, see the details around {@code com.sun.crypto.provider.GHASH::processBlocks} in
         * <a href="https://github.com/palantir/hadoop-crypto/pull/586#issuecomment-964394587">
         * hadoop-crypto#586 (comment)</a>
         */
        private static final int CHUNK_SIZE = 16 * 1024;

        ChunkingOutputStream(OutputStream delegate) {
            super(delegate);
        }

        @Override
        public void write(byte[] buffer, int off, int len) throws IOException {
            validateArgs(buffer, off, len);
            doWrite(buffer, off, len);
        }

        private void doWrite(byte[] buffer, int off, int len) throws IOException {
            int currentOffset = off;
            int remaining = len;
            while (remaining > 0) {
                int toWrite = Math.min(remaining, CHUNK_SIZE);
                out.write(buffer, currentOffset, toWrite);
                currentOffset += toWrite;
                remaining -= toWrite;
            }
        }

        private static void validateArgs(byte[] buffer, int off, int len) {
            if (buffer == null) {
                throw new SafeNullPointerException("buffer is required");
            }
            if (off < 0 || len < 0 || buffer.length < off + len) {
                throw new IndexOutOfBoundsException();
            }
        }
    }
}
