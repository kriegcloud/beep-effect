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

import com.palantir.logsafe.Preconditions;
import com.palantir.logsafe.SafeArg;
import java.nio.file.Path;
import java.util.Optional;
import java.util.function.Predicate;
import java.util.regex.Pattern;
import org.immutables.value.Value;

// Automatically suppressed to unblock enforcement in new code
@SuppressWarnings("ImmutablesStyle")
@Value.Immutable
@Value.Style(
        visibility = Value.Style.ImplementationVisibility.PACKAGE,
        overshadowImplementation = true,
        jdkOnly = true,
        get = {"get*", "is*"})
public abstract class JavaGeneratorArgs {

    private static final Predicate<String> LIBRARY_NAME =
            Pattern.compile("[a-z0-9]+(-[a-z0-9]+)*").asPredicate();

    /**
     * Input file with a list of metric schema definitions.
     */
    abstract Path input();

    /** Output directory for generated java code. */
    abstract Path output();

    /** Used to add the libraryName tag to all metrics. */
    abstract Optional<String> libraryName();

    /** Used to add the libraryVersion tag to all metrics. */
    abstract Optional<String> libraryVersion();

    /** The default Java package name for generated classes. */
    abstract String defaultPackageName();

    @Value.Check
    final void check() {
        libraryName().ifPresent(value -> {
            Preconditions.checkArgument(
                    value.length() < 128,
                    "libraryName must be less than 128 chars",
                    SafeArg.of("length", value.length()));
            Preconditions.checkArgument(
                    LIBRARY_NAME.test(value), "libraryName must be lower kebab case", SafeArg.of("value", value));
        });
    }

    public static final class Builder extends ImmutableJavaGeneratorArgs.Builder {}

    public static Builder builder() {
        return new Builder();
    }
}
