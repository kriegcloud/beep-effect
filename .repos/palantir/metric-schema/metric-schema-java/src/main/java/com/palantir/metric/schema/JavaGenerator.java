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

import com.google.common.collect.ImmutableList;
import com.google.errorprone.annotations.CanIgnoreReturnValue;
import com.palantir.goethe.Goethe;
import com.palantir.metric.schema.model.ImplementationVisibility;
import java.nio.file.Path;
import java.util.List;
import java.util.Optional;

public final class JavaGenerator {
    // TODO(forozco): consider splitting this out into an API package
    /**
     * Specifies under which package Java classes should be generated.
     */
    private static final String JAVA_PACKAGE = "javaPackage";

    /**
     * Specifies visibility of generated Utility class. Defaults to public
     */
    private static final String JAVA_VISIBILITY = "javaVisibility";

    @CanIgnoreReturnValue
    public static List<Path> generate(JavaGeneratorArgs args) {
        return SchemaParser.get().parseFile(args.input()).stream()
                .flatMap(schema -> schema.getNamespaces().entrySet().stream().map(entry -> {
                    return UtilityGenerator.generateUtilityClass(
                            entry.getKey(),
                            entry.getValue(),
                            args.libraryName(),
                            args.libraryVersion(),
                            getPackage(args, schema),
                            getVisibility(schema));
                }))
                .map(javaFile -> Goethe.formatAndEmit(javaFile, args.output()))
                .collect(ImmutableList.toImmutableList());
    }

    private static String getPackage(JavaGeneratorArgs args, MetricSchema schema) {
        return Optional.ofNullable(schema.getOptions().get(JAVA_PACKAGE)).orElseGet(args::defaultPackageName);
    }

    private static ImplementationVisibility getVisibility(MetricSchema schema) {
        return Optional.ofNullable(schema.getOptions().get(JAVA_VISIBILITY))
                .map(ImplementationVisibility::fromString)
                .orElse(ImplementationVisibility.PUBLIC);
    }

    private JavaGenerator() {}
}
