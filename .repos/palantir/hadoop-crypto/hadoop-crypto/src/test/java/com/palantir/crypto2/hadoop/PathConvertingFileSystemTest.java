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
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.net.URI;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.FSDataInputStream;
import org.apache.hadoop.fs.FSDataOutputStream;
import org.apache.hadoop.fs.FileChecksum;
import org.apache.hadoop.fs.FileStatus;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public final class PathConvertingFileSystemTest {

    private static final Path PATH = new Path("/dummy/path");
    private static final Path DELEGATE_PATH = new Path("/delegate/path");
    private static final Path RETURN_PATH = new Path("/return/path");
    private static final URI DELEGATE_URI = URI.create("/delegate/uri");
    private static final URI RETURN_URI = URI.create("/return/uri");

    private FileSystem delegate;
    private FSDataInputStream inputStream;
    private FSDataOutputStream outputStream;
    private FileChecksum fileChecksum;
    private PathConvertingFileSystem convertingFs;

    @BeforeEach
    public void before() {
        delegate = mock(FileSystem.class);
        inputStream = mock(FSDataInputStream.class);
        outputStream = mock(FSDataOutputStream.class);
        fileChecksum = mock(FileChecksum.class);
        when(delegate.getConf()).thenReturn(new Configuration());
        when(delegate.getUri()).thenReturn(URI.create("foo://bar"));
        convertingFs = new PathConvertingFileSystem(delegate, _p -> DELEGATE_PATH, _p -> RETURN_PATH, _u -> RETURN_URI);
    }

    @Test
    public void getUri() throws Exception {
        when(delegate.getUri()).thenReturn(DELEGATE_URI);
        URI actualUri = convertingFs.getUri();

        assertThat(actualUri).isEqualTo(RETURN_URI);
    }

    @Test
    public void open() throws Exception {
        when(delegate.open(DELEGATE_PATH, 0)).thenReturn(inputStream);
        FSDataInputStream actualStream = convertingFs.open(PATH, 0);

        assertThat(actualStream).isEqualTo(inputStream);
    }

    @Test
    public void create() throws Exception {
        when(delegate.create(DELEGATE_PATH, null, false, 0, (short) 0, 0, null)).thenReturn(outputStream);
        FSDataOutputStream actualStream = convertingFs.create(PATH, null, false, 0, (short) 0, 0, null);

        when(delegate.create(DELEGATE_PATH, null, null, 0, (short) 0, 0, null, null))
                .thenReturn(outputStream);
        FSDataOutputStream actualStream1 = convertingFs.create(PATH, null, null, 0, (short) 0, 0, null, null);

        assertThat(actualStream).isEqualTo(outputStream);
        assertThat(actualStream1).isEqualTo(outputStream);
    }

    @Test
    public void append() throws Exception {
        when(delegate.append(DELEGATE_PATH, 0, null)).thenReturn(outputStream);
        FSDataOutputStream actualStream = convertingFs.append(PATH, 0, null);

        assertThat(actualStream).isEqualTo(outputStream);
    }

    @Test
    public void rename() throws Exception {
        when(delegate.rename(DELEGATE_PATH, DELEGATE_PATH)).thenReturn(false);
        boolean success = convertingFs.rename(PATH, PATH);

        assertThat(success).isFalse();
    }

    @Test
    public void delete() throws Exception {
        when(delegate.delete(DELEGATE_PATH, false)).thenReturn(false);
        boolean success = convertingFs.delete(PATH, false);

        assertThat(success).isFalse();
    }

    @Test
    public void makeQualified() {
        when(delegate.makeQualified(DELEGATE_PATH)).thenReturn(DELEGATE_PATH);
        Path path = convertingFs.makeQualified(PATH);

        assertThat(path).isEqualTo(RETURN_PATH);
    }

    @Test
    public void listStatus() throws Exception {
        FileStatus delegateFileStatus = fileStatus(DELEGATE_PATH);
        when(delegate.listStatus(DELEGATE_PATH)).thenReturn(new FileStatus[] {delegateFileStatus});
        FileStatus[] fileStatuses = convertingFs.listStatus(PATH);

        assertThat(fileStatuses)
                .satisfiesExactly(status ->
                        // The returned status is the same object returned by the delegate, the path converted in-place
                        assertThat(status).isEqualTo(fileStatus(RETURN_PATH)).isSameAs(delegateFileStatus));
    }

    @Test
    public void getFileStatus() throws Exception {
        FileStatus delegateFileStatus = fileStatus(DELEGATE_PATH);
        when(delegate.getFileStatus(DELEGATE_PATH)).thenReturn(delegateFileStatus);
        FileStatus convertedFileStatus = convertingFs.getFileStatus(PATH);

        // The returned status is the same object returned by the delegate, the path converted in-place
        assertThat(convertedFileStatus).isEqualTo(fileStatus(RETURN_PATH)).isSameAs(delegateFileStatus);
    }

    @Test
    public void setWorkingDirectory() throws Exception {
        convertingFs.setWorkingDirectory(PATH);
        verify(delegate).setWorkingDirectory(DELEGATE_PATH);
    }

    @Test
    public void getWorkingDirectory() throws Exception {
        when(delegate.getWorkingDirectory()).thenReturn(DELEGATE_PATH);
        Path workingDirectory = convertingFs.getWorkingDirectory();

        assertThat(workingDirectory).isEqualTo(RETURN_PATH);
    }

    @Test
    public void mkdirs() throws Exception {
        when(delegate.mkdirs(DELEGATE_PATH, null)).thenReturn(false);
        boolean success = convertingFs.mkdirs(PATH, null);

        assertThat(success).isFalse();
    }

    @Test
    public void getFileChecksum() throws Exception {
        when(delegate.getFileChecksum(DELEGATE_PATH)).thenReturn(fileChecksum);
        FileChecksum checksum = convertingFs.getFileChecksum(PATH);

        assertThat(checksum).isEqualTo(fileChecksum);
    }

    private static FileStatus fileStatus(Path path) {
        return new FileStatus(0, false, 0, 0, 0, path);
    }
}
