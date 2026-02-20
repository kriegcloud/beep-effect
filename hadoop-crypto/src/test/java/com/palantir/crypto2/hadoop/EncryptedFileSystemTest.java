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

import static com.palantir.logsafe.testing.Assertions.assertThatLoggableExceptionThrownBy;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

import com.google.common.io.ByteStreams;
import com.palantir.crypto2.cipher.AesCtrCipher;
import com.palantir.crypto2.keys.KeyMaterial;
import com.palantir.crypto2.keys.KeyStorageStrategy;
import com.palantir.logsafe.SafeArg;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.Arrays;
import java.util.EnumSet;
import java.util.Random;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.CreateFlag;
import org.apache.hadoop.fs.FSDataInputStream;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.fs.RawLocalFileSystem;
import org.apache.hadoop.fs.permission.FsPermission;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

public final class EncryptedFileSystemTest {

    private static final int MB = 1024 * 1024;
    private static final Random random = new Random();

    private EncryptedFileSystem efs;
    private FileSystem delegateFs;
    private Path path;
    private Path newPath;
    private InMemoryKeyStorageStrategy keyStore;
    private KeyMaterial keyMaterial;
    private FileSystem mockFs;
    private KeyStorageStrategy mockKeyStore;
    private EncryptedFileSystem mockedEfs;

    @TempDir
    public File folder;

    @BeforeEach
    public void before() throws IOException, URISyntaxException {
        delegateFs = new RawLocalFileSystem();
        delegateFs.initialize(new URI("file://" + folder.getAbsolutePath()), new Configuration());
        keyStore = new InMemoryKeyStorageStrategy();
        efs = new EncryptedFileSystem(delegateFs, keyStore);
        path = new Path(new File(folder, "test.bin").getAbsolutePath());
        newPath = path.suffix("renamed");

        OutputStream os = efs.create(path);
        os.write(0x00);
        os.close();

        keyMaterial = AesCtrCipher.generateKeyMaterial();
        mockFs = mock(FileSystem.class);
        mockKeyStore = mock(KeyStorageStrategy.class);

        // Mock a successful rename operation
        when(mockFs.getConf()).thenReturn(new Configuration());
        when(mockFs.getUri()).thenReturn(URI.create("foo://bar"));
        when(mockFs.rename(any(Path.class), any(Path.class))).thenReturn(true);
        when(mockKeyStore.get(anyString())).thenReturn(keyMaterial);

        mockedEfs = new EncryptedFileSystem(mockFs, mockKeyStore);
    }

    @Test
    public void testDelegateStreamIsClosed() throws IOException {
        EncryptedFileSystem fs = new EncryptedFileSystem(mockFs, new InMemoryKeyStorageStrategy());

        fs.create(path); // populate key store

        FSDataInputStream is = mock(FSDataInputStream.class);
        when(mockFs.open(path, 4096)).thenReturn(is);

        FSDataInputStream myIs = fs.open(path);
        myIs.close();
        fs.close();

        verify(is).close();
    }

    @Test
    public void testEncryptDecrypt_success() throws IllegalArgumentException, IOException {
        byte[] data = new byte[MB];
        random.nextBytes(data);

        OutputStream os = efs.create(path);
        os.write(data);
        os.close();

        // Read using EncryptedFileSystem yields input data
        InputStream is = efs.open(path);
        byte[] readData = ByteStreams.toByteArray(is);
        is.close();

        assertThat(data).isEqualTo(readData);

        // Read using delegate FileSystem does not yield input data
        is = delegateFs.open(path);
        byte[] rawData = ByteStreams.toByteArray(is);
        is.close();

        assertThat(data).isNotEqualTo(rawData);
    }

    @Test
    public void testEncryptDecrypt_secondaryCreateMethod() throws IOException {
        byte[] data = new byte[MB];
        random.nextBytes(data);

        OutputStream os = efs.create(
                path,
                FsPermission.getDefault(),
                EnumSet.of(CreateFlag.OVERWRITE),
                8192,
                (short) 3,
                64 * 1024 * 1024,
                null,
                null);
        os.write(data);
        os.close();

        // Read using EncryptedFileSystem yields input data
        InputStream is = efs.open(path);
        byte[] readData = ByteStreams.toByteArray(is);
        is.close();

        assertThat(data).isEqualTo(readData);

        // Read using delegate FileSystem does not yield input data
        is = delegateFs.open(path);
        byte[] rawData = ByteStreams.toByteArray(is);
        is.close();

        assertThat(data).isNotEqualTo(rawData);
    }

    @Test
    public void testEncryptDecrypt_decryptSeek() throws IllegalArgumentException, IOException {
        byte[] data = new byte[MB];
        int seekPos = MB / 2;
        random.nextBytes(data);

        OutputStream os = efs.create(path);
        os.write(data);
        os.close();

        FSDataInputStream is = efs.open(path);
        is.seek(seekPos);
        byte[] readData = ByteStreams.toByteArray(is);

        byte[] actualReadData = Arrays.copyOfRange(data, seekPos, MB);
        assertThat(actualReadData).isEqualTo(readData);
    }

    @Test
    public void testCreate_normalizePathPassedToKeyStore() throws IOException {
        mockedEfs.create(new Path("foo//bar"));

        verify(mockKeyStore).put(eq("foo/bar"), any(KeyMaterial.class));
        verifyNoMoreInteractions(mockKeyStore);
    }

    @Test
    public void testOpen_normalizePathPassedToKeyStore() throws IOException {
        mockedEfs.open(new Path("foo//bar"));

        verify(mockKeyStore).get("foo/bar");
        verifyNoMoreInteractions(mockKeyStore);
    }

    @Test
    public void testRename_normalizePathPassedToKeyStore() throws IOException {
        mockedEfs.rename(new Path("src//foo"), new Path("dst//bar"));

        verify(mockKeyStore).get("src/foo");
        verify(mockKeyStore).put("dst/bar", keyMaterial);
        verify(mockKeyStore).remove("src/foo");
        verifyNoMoreInteractions(mockKeyStore);
    }

    @Test
    public void testRename_successful() throws IOException {
        KeyMaterial actualKeyMaterial = keyStore.get(path.toString());

        efs.rename(path, newPath);

        assertThat(efs.exists(path)).isFalse();
        assertThat(efs.exists(newPath)).isTrue();

        assertThat(keyStore.get(path.toString())).isNull();
        assertThat(keyStore.get(newPath.toString())).isEqualTo(actualKeyMaterial);
    }

    @Test
    public void testRename_failedGet() throws IOException {
        doThrow(new IllegalArgumentException()).when(mockKeyStore).get(path.toString());

        assertThatExceptionOfType(IllegalArgumentException.class).isThrownBy(() -> mockedEfs.rename(path, newPath));
        verify(mockFs, never()).rename(path, newPath);
        verify(mockKeyStore, never()).remove(path.toString());
    }

    @Test
    public void testRename_failedPut() throws IOException {
        doThrow(new IllegalArgumentException()).when(mockKeyStore).put(newPath.toString(), keyMaterial);

        assertThatExceptionOfType(IllegalArgumentException.class).isThrownBy(() -> mockedEfs.rename(path, newPath));
        verify(mockFs, never()).rename(path, newPath);
        verify(mockKeyStore, never()).remove(path.toString());
    }

    @Test
    public void testRename_failedRename() throws IOException {
        when(mockFs.rename(path, newPath)).thenReturn(false);

        boolean renamed = mockedEfs.rename(path, newPath);

        assertThat(renamed).isFalse();
        verify(mockKeyStore, never()).remove(path.toString());
        verify(mockKeyStore).remove(newPath.toString());
    }

    @Test
    public void testRename_successfulRenameFailedRemoveIsIgnored() throws IOException {
        when(mockFs.rename(path, newPath)).thenReturn(true);
        doThrow(new IllegalArgumentException()).when(mockKeyStore).remove(anyString());

        assertThat(mockedEfs.rename(path, newPath)).isTrue();
    }

    @Test
    public void testRename_failedRenameFailedRemoveIsIgnored() throws IOException {
        when(mockFs.rename(path, newPath)).thenReturn(false);
        doThrow(new IllegalArgumentException()).when(mockKeyStore).remove(anyString());

        assertThat(mockedEfs.rename(path, newPath)).isFalse();
    }

    @Test
    public void testGetCipherAlgorithm_default() {
        assertThat(efs.getCipherAlgorithm()).isEqualTo("AES/CTR/NoPadding");
    }

    @Test
    public void testGetCipherAlgorithm_nonDefault() throws IOException, URISyntaxException {
        String cipherAlg = "cipherAlg";

        Configuration conf = new Configuration();
        conf.set(EncryptedFileSystem.CIPHER_ALGORITHM_KEY, cipherAlg);
        delegateFs = FileSystem.newInstance(new URI(folder.getAbsolutePath()), conf);
        efs = new EncryptedFileSystem(delegateFs, new InMemoryKeyStorageStrategy());

        assertThat(efs.getCipherAlgorithm()).isEqualTo(cipherAlg);
    }

    @Test
    public void testGetCipherAlgorithm_deprecated() throws IOException, URISyntaxException {
        String cipherAlg = "cipherAlg";

        Configuration conf = new Configuration();
        conf.set(EncryptedFileSystem.DEPRECATED_CIPHER_ALGORITHM_KEY, cipherAlg);
        delegateFs = FileSystem.newInstance(new URI(folder.getAbsolutePath()), conf);
        efs = new EncryptedFileSystem(delegateFs, new InMemoryKeyStorageStrategy());

        assertThat(efs.getCipherAlgorithm()).isEqualTo(cipherAlg);
    }

    @Test
    public void testGetCipherAlgorithm_bothConfiguredDifferently() throws IOException, URISyntaxException {
        String cipherAlg = "cipherAlg";
        String deprecatedCipherAlg = "deprecatedCipherAlg";

        Configuration conf = new Configuration();
        conf.set(EncryptedFileSystem.CIPHER_ALGORITHM_KEY, cipherAlg);
        conf.set(EncryptedFileSystem.DEPRECATED_CIPHER_ALGORITHM_KEY, deprecatedCipherAlg);
        delegateFs = FileSystem.newInstance(new URI(folder.getAbsolutePath()), conf);

        assertThatLoggableExceptionThrownBy(() -> new EncryptedFileSystem(delegateFs, new InMemoryKeyStorageStrategy()))
                .isInstanceOf(IllegalStateException.class)
                .hasLogMessage("Two incompatible ciphers configured")
                .hasExactlyArgs(
                        SafeArg.of("cipher", "cipherAlg"), SafeArg.of("deprecatedCipher", "deprecatedCipherAlg"));
    }

    @Test
    public void testGetCipherAlgorithm_bothConfigured() throws IOException, URISyntaxException {
        String cipherAlg = "cipherAlg";

        Configuration conf = new Configuration();
        conf.set(EncryptedFileSystem.CIPHER_ALGORITHM_KEY, cipherAlg);
        conf.set(EncryptedFileSystem.DEPRECATED_CIPHER_ALGORITHM_KEY, cipherAlg);
        delegateFs = FileSystem.newInstance(new URI(folder.getAbsolutePath()), conf);
        efs = new EncryptedFileSystem(delegateFs, new InMemoryKeyStorageStrategy());

        assertThat(efs.getCipherAlgorithm()).isEqualTo(cipherAlg);
    }

    @Test
    public void testDelete_successful() throws IOException {
        assertThat(efs.delete(path, false)).isTrue();

        assertThat(efs.exists(path)).isFalse();
        assertThat(keyStore.get(path.toString())).isNull();
    }

    @Test
    public void testDelete_recursiveDelete() throws IOException {
        Path folderPath = new Path(folder.getAbsolutePath());

        assertThatExceptionOfType(UnsupportedOperationException.class)
                .isThrownBy(() -> efs.delete(folderPath, true))
                .withMessage("EncryptedFileSystem does not support recursive deletes");
    }

    @Test
    public void testDelete_nonRecursiveDeleteOnDir() throws IOException {
        Path folderPath = new Path(folder.getAbsolutePath());

        assertThatExceptionOfType(IOException.class)
                .isThrownBy(() -> efs.delete(folderPath, false))
                .withMessage("Directory %s is not empty", folderPath);
    }

    @Test
    public void testDelete_keyMaterialAlreadyDeleted() throws IOException {
        keyStore.remove(path.toString());

        assertThat(keyStore.get(path.toString())).isNull();
        assertThat(efs.delete(path, false)).isTrue();
        assertThat(efs.exists(path)).isFalse();
    }

    @Test
    public void testDelete_fileAlreadyDeleted() throws IOException {
        delegateFs.delete(path, false);

        assertThat(keyStore.get(path.toString())).isInstanceOf(KeyMaterial.class);
        assertThat(efs.delete(path, false)).isFalse();
        assertThat(keyStore.get(path.toString())).isNull();
    }

    @Test
    public void testAppend() {
        assertThatExceptionOfType(UnsupportedOperationException.class)
                .isThrownBy(() -> mockedEfs.append(path, 0, null))
                .withMessage("appending to encrypted files is not supported");
    }

    @Test // https://github.com/palantir/hadoop-crypto/issues/27
    public void testCopyFromLocalFile() throws IOException {
        File file = new File(folder, "local.bin");
        byte[] data = "data".getBytes(StandardCharsets.UTF_8);

        Files.write(file.toPath(), data);
        efs.copyFromLocalFile(new Path(file.getAbsolutePath()), path);

        FSDataInputStream input = efs.open(path);
        byte[] readBytes = ByteStreams.toByteArray(input);
        assertThat(readBytes).isEqualTo(data);
    }
}
