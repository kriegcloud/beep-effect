/*
 * (c) Copyright 2019 Palantir Technologies Inc. All rights reserved.
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

package com.palantir.metric.schema;

import com.google.common.collect.ImmutableSet;
import com.palantir.logsafe.Preconditions;
import javax.lang.model.SourceVersion;

/** Field and parameter names used by this generator. */
final class ReservedNames {

    static final String LIBRARY_NAME_FIELD = "LIBRARY_NAME";
    static final String LIBRARY_NAME_TAG = "libraryName";
    static final String LIBRARY_VERSION_FIELD = "LIBRARY_VERSION";
    static final String LIBRARY_VERSION_TAG = "libraryVersion";
    static final String JAVA_VERSION_FIELD = "JAVA_VERSION";
    static final String JAVA_VERSION_TAG = "javaVersion";
    static final String FACTORY_METHOD = "of";
    static final String BUILDER_METHOD = "builder";
    static final String GAUGE_NAME = "gauge";
    static final String REGISTRY_NAME = "registry";

    private static final ImmutableSet<String> RESERVED_NAMES = ImmutableSet.of(
            FACTORY_METHOD, GAUGE_NAME, JAVA_VERSION_FIELD, LIBRARY_NAME_FIELD, LIBRARY_VERSION_FIELD, REGISTRY_NAME);

    /** Returns true if the input string cannot be used. */
    static boolean isValid(String input) {
        Preconditions.checkNotNull(input, "Argument string is required");
        return SourceVersion.isName(input) && !RESERVED_NAMES.contains(input);
    }

    private ReservedNames() {}
}
