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

import com.google.common.base.Throwables;
import com.google.common.io.ByteStreams;
import com.palantir.crypto2.keys.KeyMaterial;
import com.palantir.crypto2.keys.KeyStorageStrategy;
import com.palantir.crypto2.keys.serialization.KeyMaterials;
import com.palantir.logsafe.Preconditions;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.security.KeyPair;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.util.Optional;
import javax.crypto.SecretKey;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;

/**
 * Strategy that stores the {@link KeyMaterial} in a file with the same path as the encrypted file plus an extension. It
 * wraps and unwraps the symmetric {@link SecretKey} using the provided public/private {@link KeyPair}
 */
public final class FileKeyStorageStrategy implements KeyStorageStrategy {

    public static final String EXTENSION = ".keymaterial";

    private final FileSystem fs;
    private final PublicKey publicKey;
    private final Optional<PrivateKey> privateKey;

    public FileKeyStorageStrategy(FileSystem fs, KeyPair keyPair) {
        this.fs = fs;
        this.publicKey = keyPair.getPublic();
        this.privateKey = Optional.ofNullable(keyPair.getPrivate());
    }

    public FileKeyStorageStrategy(FileSystem fs, PublicKey publicKey) {
        this.fs = fs;
        this.publicKey = publicKey;
        this.privateKey = Optional.empty();
    }

    @Override
    public void put(String fileKey, KeyMaterial keyMaterial) {
        try (OutputStream stream = fs.create(getKeyPath(fileKey))) {
            byte[] wrappedKey = KeyMaterials.wrap(keyMaterial, publicKey);
            stream.write(wrappedKey);
        } catch (IOException e) {
            throw Throwables.propagate(e);
        }
    }

    @Override
    public KeyMaterial get(String fileKey) {
        Preconditions.checkArgument(privateKey.isPresent(), "Private key is absent but required to get key material");
        try (InputStream stream = fs.open(getKeyPath(fileKey))) {
            byte[] wrappedKey = ByteStreams.toByteArray(stream);
            return KeyMaterials.unwrap(wrappedKey, privateKey.get());
        } catch (IOException e) {
            throw Throwables.propagate(e);
        }
    }

    @Override
    public void remove(String fileKey) {
        try {
            fs.delete(getKeyPath(fileKey), false);
        } catch (IOException e) {
            throw Throwables.propagate(e);
        }
    }

    private static Path getKeyPath(String fileKey) {
        return new Path(fileKey + EXTENSION);
    }
}
