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

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;

import com.palantir.crypto2.cipher.AesCtrCipher;
import com.palantir.crypto2.keys.KeyMaterial;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.security.KeyPair;
import java.security.NoSuchAlgorithmException;
import java.security.NoSuchProviderException;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

public final class FileKeyStorageStrategyTest {

    private FileKeyStorageStrategy keyStore;
    private KeyMaterial keyMaterial;
    private FileSystem fs;
    private KeyPair pair;
    private String path;

    @TempDir
    public java.nio.file.Path folder;

    @BeforeEach
    public void before() throws NoSuchAlgorithmException, NoSuchProviderException, IOException, URISyntaxException {
        pair = TestKeyPairs.generateKeyPair();
        keyMaterial = AesCtrCipher.generateKeyMaterial();
        fs = FileSystem.get(new URI("file:///"), new Configuration());
        keyStore = new FileKeyStorageStrategy(fs, pair);
        path = folder.resolve("test").toAbsolutePath().toString();
    }

    @Test
    public void testStoreKeyMaterial() throws IllegalArgumentException, IOException {
        keyStore.put(path, keyMaterial);
        KeyMaterial readKeyMaterial = keyStore.get(path);

        assertThat(readKeyMaterial).isEqualTo(keyMaterial);
        assertThat(fs.exists(new Path(path + FileKeyStorageStrategy.EXTENSION))).isTrue();
    }

    @Test
    public void testDeleteKeyMaterial() throws IOException {
        keyStore.put(path, keyMaterial);
        keyStore.remove(path);

        assertThat(fs.exists(new Path(path + FileKeyStorageStrategy.EXTENSION))).isFalse();
    }

    @Test
    public void testMissingPrivateKey() throws IOException {
        FileKeyStorageStrategy strategy = new FileKeyStorageStrategy(fs, pair.getPublic());

        // Put still succeeds with only the public key
        strategy.put(path, keyMaterial);

        assertThatExceptionOfType(IllegalArgumentException.class)
                .isThrownBy(() -> strategy.get("key"))
                .withMessage("Private key is absent but required to get key material");
    }

    @Test
    public void testMissingPrivateKeyInKeyPair() throws IOException {
        KeyPair keyPair = new KeyPair(pair.getPublic(), null);
        FileKeyStorageStrategy strategy = new FileKeyStorageStrategy(fs, keyPair);

        // Put still succeeds with only the public key
        strategy.put(path, keyMaterial);

        assertThatExceptionOfType(IllegalArgumentException.class)
                .isThrownBy(() -> strategy.get("key"))
                .withMessage("Private key is absent but required to get key material");
    }
}
