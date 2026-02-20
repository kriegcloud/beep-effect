/*
 * (c) Copyright 2025 Palantir Technologies Inc. All rights reserved.
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

package com.palantir.metric.schema.gradle;

import com.google.common.collect.ImmutableSetMultimap;
import com.google.common.collect.Multimap;
import com.palantir.metric.schema.lang.LangMetricSchema;
import com.palantir.metric.schema.lang.MetricSchemaCompiler;
import java.io.File;
import java.io.IOException;
import java.util.Collection;
import java.util.Optional;
import javax.annotation.Nonnull;

public final class DependencyRequirements {

    public static Multimap<String, String> getDependencies(@Nonnull Collection<File> metricSchemaFiles) {
        Collection<LangMetricSchema> rawSchemas = metricSchemaFiles.stream()
                .<Optional<LangMetricSchema>>map(schemaFile -> {
                    try {
                        return Optional.of(MetricSchemaCompiler.parseRawSchema(schemaFile));
                    } catch (IOException e) {
                        // for configuration purposes, ignore files that cannot be parsed as schemas
                        return Optional.empty();
                    }
                })
                .<LangMetricSchema>mapMulti(Optional::ifPresent)
                .toList();

        if (rawSchemas.stream().allMatch(schema -> schema.namespaces().isEmpty())) {
            // There isn't anything to generate, so no dependencies are required.
            return ImmutableSetMultimap.of();
        }

        ImmutableSetMultimap.Builder<String, String> dependencies = ImmutableSetMultimap.<String, String>builder()
                .put("api", "com.palantir.tritium:tritium-registry")
                .put("api", "com.palantir.safe-logging:preconditions")
                .put("api", "com.google.errorprone:error_prone_annotations")
                // Metric types like Gauge are part of the generated code's public API
                .put("api", "io.dropwizard.metrics:metrics-core");
        if (requiresSafeLogging(rawSchemas)) {
            dependencies.put("implementation", "com.palantir.safe-logging:safe-logging");
        }
        return dependencies.build();
    }

    /**
     * Determines whether any of the provided schemas require the com.palantir.safe-logging:safe-logging dependency.
     */
    private static boolean requiresSafeLogging(Collection<LangMetricSchema> schemas) {
        return schemas.stream()
                .flatMap(schema -> schema.namespaces().values().stream())
                .flatMap(namespace -> namespace.metrics().values().stream())
                .anyMatch(metric -> !metric.tags().isEmpty());
    }

    private DependencyRequirements() {}
}
