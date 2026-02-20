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

package com.palantir.crypto2.hadoop;

import com.google.common.base.Predicate;
import com.google.common.collect.Collections2;
import com.palantir.crypto2.keys.KeyPairs;
import com.palantir.crypto2.keys.KeyStorageStrategy;
import com.palantir.logsafe.Preconditions;
import com.palantir.logsafe.SafeArg;
import com.palantir.logsafe.exceptions.SafeRuntimeException;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.security.KeyPair;
import java.util.Arrays;
import java.util.Collection;
import java.util.function.Function;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.FileStatus;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.FilterFileSystem;
import org.apache.hadoop.fs.Path;

/**
 * A {@link FileSystem} that transparently encrypts and decrypts the streams of an underlying FileSystem and stores
 * encapsulated/wrapped encryption keys alongside the encrypted data in the same FileSystem as the encrypted data (see
 * {@link FileKeyStorageStrategy}). Unlike the {@link EncryptedFileSystem}, the StandaloneEncryptedFileSystem is
 * initialized using a {@link Configuration} and can be used as a standalone FileSystem (like {@code s3a://, hdfs://,
 * etc.}).
 * <p>
 * This FileSystem requires the first character of the scheme of any URI or Path to be `e` and the remainder of the
 * scheme to be that of a backing FileSystem that can be instantiated using {@link FileSystem#get}.
 */
public final class StandaloneEncryptedFileSystem extends FilterFileSystem {

    /**
     * Scheme is defined at runtime as `e[FS-scheme]`. This FileSystem can never be instantiated without
     * `fs.e[FS-scheme].impl` being defined in the {@link Configuration} passed into the {@link #initialize} method.
     */
    private static final String SCHEME = "";

    private static final String DEFAULT_ALGORITHM = "RSA";
    private static final Predicate<FileStatus> NOT_KEY_MATERIAL = new Predicate<FileStatus>() {
        @Override
        public boolean apply(FileStatus status) {
            return !status.getPath().toString().endsWith(FileKeyStorageStrategy.EXTENSION);
        }
    };

    /**
     * Key mapping to a base64 encoded X509 public key.
     */
    public static final String PUBLIC_KEY_CONF = "fs.efs.key.public";

    /**
     * Key mapping to a base64 encoded PKCS8 private key.
     */
    public static final String PRIVATE_KEY_CONF = "fs.efs.key.private";

    /**
     * Key mapping to the public/private key algorithm (ex: RSA).
     */
    public static final String KEY_ALGORITHM_CONF = "fs.efs.key.algorithm";

    private String encryptedScheme;
    // The raw underlying FileSystem that encrypted bytes and key material is stored on
    private FileSystem delegate;
    private KeyStorageStrategy keyStore;

    @Override
    public void initialize(URI uri, Configuration conf) throws IOException {
        encryptedScheme = uri.getScheme();
        Preconditions.checkArgument(
                encryptedScheme.startsWith("e"),
                "URI scheme must begin with 'e'",
                SafeArg.of("encryptedScheme", encryptedScheme));

        delegate = getDelegateFileSystem(uri, conf);

        KeyPair keyPair = getKeyPair(conf);
        keyStore = new FileKeyStorageStrategy(delegate, keyPair);

        this.fs = new EncryptedFileSystem(delegate, keyStore);
    }

    @Override
    public URI getUri() {
        return setUriSchemeFunc(encryptedScheme).apply(fs.getUri());
    }

    @Override
    // TODO(jellis): consider moving logic related to FileKeyStorageStrategy into a separate FileSystem
    public FileStatus[] listStatus(Path path) throws IOException {
        Collection<FileStatus> files = Collections2.filter(Arrays.asList(fs.listStatus(path)), NOT_KEY_MATERIAL);
        return files.toArray(new FileStatus[files.size()]);
    }

    private static KeyPair getKeyPair(Configuration conf) {
        String publicKey = Preconditions.checkNotNull(
                conf.get(PUBLIC_KEY_CONF), "Public Key must be configured for key: " + PUBLIC_KEY_CONF);
        String privateKey = conf.get(PRIVATE_KEY_CONF);
        String algorithm = conf.get(KEY_ALGORITHM_CONF, DEFAULT_ALGORITHM);

        return KeyPairs.fromStrings(privateKey, publicKey, algorithm);
    }

    private FileSystem getDelegateFileSystem(URI uri, Configuration conf) throws IOException {
        String backingScheme = encryptedScheme.substring(1);
        URI backingUri = setUriSchemeFunc(backingScheme).apply(uri);

        // Do not call `initialize` as Filesystem#get calls `initialize` prior to returning the FileSystem
        FileSystem backingFs = FileSystem.get(backingUri, conf);

        return new PathConvertingFileSystem(
                backingFs,
                setSchemeFunc(backingScheme),
                setSchemeFunc(encryptedScheme),
                setUriSchemeFunc(encryptedScheme));
    }

    @Override
    public boolean exists(Path path) throws IOException {
        return fs.exists(path);
    }

    @Override
    public boolean delete(Path path, boolean recursive) throws IOException {
        // Since StandaloneEncryptedFileSystem uses a FileKeyStorageStrategy, the delegate delete call on folders
        // deletes both the payload files and the adjacent encryption materials. For files we can
        // rely on the EncryptedFileSystem handling removal of both the file and the key material.
        if (fs.isFile(path)) {
            return fs.delete(path, false);
        } else {
            return delegate.delete(path, recursive);
        }
    }

    @Override
    public boolean rename(Path src, Path dst) throws IOException {
        // Since StandaloneEncryptedFileSystem uses a FileKeyStorageStrategy, the delegate rename call on folders
        // renames both the payload files and the adjacent encryption materials. For files we can
        // rely on the EncryptedFileSystem handling renaming both the file and the key material.
        if (fs.isFile(src)) {
            return fs.rename(src, dst);
        } else {
            return delegate.rename(src, dst);
        }
    }

    private static Function<Path, Path> setSchemeFunc(final String scheme) {
        return path -> new Path(setUriSchemeFunc(scheme).apply(path.toUri()));
    }

    private static Function<URI, URI> setUriSchemeFunc(final String scheme) {
        return uri -> {
            if (uri.getScheme() == null) {
                return uri;
            }
            try {
                return new URI(
                        scheme,
                        uri.getUserInfo(),
                        uri.getHost(),
                        uri.getPort(),
                        uri.getPath(),
                        uri.getQuery(),
                        uri.getFragment());
            } catch (URISyntaxException e) {
                throw new SafeRuntimeException(e);
            }
        };
    }

    @Override
    public String getScheme() {
        return SCHEME;
    }
}
