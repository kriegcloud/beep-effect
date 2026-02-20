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

import com.google.common.annotations.VisibleForTesting;
import java.io.IOException;
import java.net.URI;
import java.util.EnumSet;
import java.util.function.Function;
import org.apache.hadoop.fs.CreateFlag;
import org.apache.hadoop.fs.FSDataInputStream;
import org.apache.hadoop.fs.FSDataOutputStream;
import org.apache.hadoop.fs.FSDataOutputStreamBuilder;
import org.apache.hadoop.fs.FileChecksum;
import org.apache.hadoop.fs.FileStatus;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Options.ChecksumOpt;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.fs.permission.FsPermission;
import org.apache.hadoop.util.Progressable;

/**
 * A decorator {@link FileSystem} that delegates calls and converts paths to/from the delegate FileSystem.
 * {@link Path}s passed into methods are converted using {@link #toFunc} before being forwarded.
 * {@link Path}s returned from the delegate are converted using {@link #fromFunc} before being returned.
 */
public final class PathConvertingFileSystem extends DelegatingFileSystem {

    private final FileSystem delegate;
    private final Function<Path, Path> toFunc;
    private final Function<Path, Path> fromFunc;
    private Function<URI, URI> fromUriFunc;

    public PathConvertingFileSystem(
            FileSystem delegate,
            Function<Path, Path> toFunc,
            Function<Path, Path> fromFunc,
            Function<URI, URI> fromUriFunc) {
        super(delegate);
        this.delegate = delegate;
        this.toFunc = toFunc;
        this.fromFunc = fromFunc;
        this.fromUriFunc = fromUriFunc;
    }

    @Override
    public URI getUri() {
        return fromUriFunc.apply(delegate.getUri());
    }

    @Override
    public FSDataInputStream open(Path path, int bufferSize) throws IOException {
        return delegate.open(to(path), bufferSize);
    }

    @Override
    public FSDataOutputStream create(
            Path path,
            FsPermission permission,
            boolean overwrite,
            int bufferSize,
            short replication,
            long blockSize,
            Progressable progress)
            throws IOException {
        return delegate.create(to(path), permission, overwrite, bufferSize, replication, blockSize, progress);
    }

    @Override
    public FSDataOutputStream create(
            Path path,
            FsPermission permission,
            EnumSet<CreateFlag> flags,
            int bufferSize,
            short replication,
            long blockSize,
            Progressable progress,
            ChecksumOpt checksumOpt)
            throws IOException {
        return delegate.create(to(path), permission, flags, bufferSize, replication, blockSize, progress, checksumOpt);
    }

    @Override
    public FSDataOutputStream append(Path path, int bufferSize, Progressable progress) throws IOException {
        return delegate.append(to(path), bufferSize, progress);
    }

    @Override
    public boolean rename(Path src, Path dst) throws IOException {
        return delegate.rename(to(src), to(dst));
    }

    @Override
    public boolean delete(Path path, boolean recursive) throws IOException {
        return delegate.delete(to(path), recursive);
    }

    @Override
    public FSDataOutputStreamBuilder<?, ?> createFile(Path path) {
        return delegate.createFile(to(path));
    }

    @Override
    public Path makeQualified(Path path) {
        return from(delegate.makeQualified(to(path)));
    }

    @Override
    public FileStatus[] listStatus(Path path) throws IOException {
        FileStatus[] fileStatuses = delegate.listStatus(to(path));
        for (int i = 0; i < fileStatuses.length; i++) {
            fileStatuses[i] = toReturnFileStatus(fileStatuses[i]);
        }
        return fileStatuses;
    }

    @Override
    public FileStatus getFileStatus(Path path) throws IOException {
        return toReturnFileStatus(delegate.getFileStatus(to(path)));
    }

    @Override
    public void setWorkingDirectory(Path path) {
        delegate.setWorkingDirectory(to(path));
    }

    @Override
    public Path getWorkingDirectory() {
        return from(delegate.getWorkingDirectory());
    }

    @Override
    public boolean mkdirs(Path path, FsPermission permission) throws IOException {
        return delegate.mkdirs(to(path), permission);
    }

    @Override
    public FileChecksum getFileChecksum(Path path) throws IOException {
        return fs.getFileChecksum(to(path));
    }

    @VisibleForTesting
    Path to(Path path) {
        return toFunc.apply(path);
    }

    private Path from(Path path) {
        return fromFunc.apply(path);
    }

    private FileStatus toReturnFileStatus(FileStatus status) {
        status.setPath(from(status.getPath()));
        return status;
    }
}
