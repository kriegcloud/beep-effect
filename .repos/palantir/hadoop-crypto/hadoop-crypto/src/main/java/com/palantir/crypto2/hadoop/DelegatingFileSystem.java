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

import com.palantir.logsafe.exceptions.SafeRuntimeException;
import java.io.IOException;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.BlockLocation;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.FileUtil;
import org.apache.hadoop.fs.FilterFileSystem;
import org.apache.hadoop.fs.Path;

/**
 * Equivalent to {@link FilterFileSystem} but invokes {@link #create} and {@link #open} on this class when calling
 * {@link #copyFromLocalFile} and {@link #copyToLocalFile}.
 * <p>
 * Additionally, delegates {@link #getFileBlockLocations(Path, long, long)} to the underlying filesystem.
 * <p>
 * Solves: <a href="https://issues.apache.org/jira/browse/HADOOP-13870">HADOOP-13870</a>
 */
public abstract class DelegatingFileSystem extends FilterFileSystem {

    protected DelegatingFileSystem(FileSystem delegate) {
        super(delegate);
        try {
            super.initialize(delegate.getUri(), delegate.getConf());
        } catch (IOException e) {
            throw new SafeRuntimeException("Failed to initialize the delegating filesystem", e);
        }
    }

    @Override
    public final void copyFromLocalFile(Path src, Path dst) throws IOException {
        copyFromLocalFile(false, src, dst);
    }

    @Override
    public final void copyFromLocalFile(boolean delSrc, Path src, Path dst) throws IOException {
        copyFromLocalFile(delSrc, true, src, dst);
    }

    @Override
    public final void copyFromLocalFile(boolean delSrc, boolean overwrite, Path[] srcs, Path dst) throws IOException {
        Configuration conf = getConf();
        FileUtil.copy(getLocal(conf), srcs, this, dst, delSrc, overwrite, conf);
    }

    @Override
    public final void copyFromLocalFile(boolean delSrc, boolean overwrite, Path src, Path dst) throws IOException {
        Configuration conf = getConf();
        FileUtil.copy(getLocal(conf), src, this, dst, delSrc, overwrite, conf);
    }

    @Override
    public final void copyToLocalFile(Path src, Path dst) throws IOException {
        copyToLocalFile(false, src, dst);
    }

    @Override
    public final void copyToLocalFile(boolean delSrc, Path src, Path dst) throws IOException {
        copyToLocalFile(delSrc, src, dst, false);
    }

    @Override
    public final void copyToLocalFile(boolean delSrc, Path src, Path dst, boolean useRawLocalFileSystem)
            throws IOException {
        Configuration conf = getConf();
        FileSystem local = useRawLocalFileSystem ? getLocal(conf).getRaw() : getLocal(conf);
        FileUtil.copy(this, src, local, dst, delSrc, conf);
    }

    @Override
    public final BlockLocation[] getFileBlockLocations(Path path, long start, long len) throws IOException {
        return fs.getFileBlockLocations(path, start, len);
    }
}
