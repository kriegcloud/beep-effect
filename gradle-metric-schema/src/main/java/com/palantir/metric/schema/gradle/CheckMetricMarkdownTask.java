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

package com.palantir.metric.schema.gradle;

import com.fasterxml.jackson.core.type.TypeReference;
import com.google.common.base.Preconditions;
import com.palantir.metric.schema.MetricSchema;
import com.palantir.metric.schema.markdown.MarkdownRenderer;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.List;
import java.util.Map;
import org.gradle.api.DefaultTask;
import org.gradle.api.GradleException;
import org.gradle.api.file.RegularFileProperty;
import org.gradle.api.provider.Property;
import org.gradle.api.tasks.CacheableTask;
import org.gradle.api.tasks.Input;
import org.gradle.api.tasks.InputFiles;
import org.gradle.api.tasks.PathSensitive;
import org.gradle.api.tasks.PathSensitivity;
import org.gradle.api.tasks.TaskAction;

@CacheableTask
public abstract class CheckMetricMarkdownTask extends DefaultTask {

    static final String NAME = "checkMetricsMarkdown";

    @InputFiles
    @PathSensitive(PathSensitivity.RELATIVE)
    public abstract RegularFileProperty getManifestFile();

    @Input
    public abstract Property<String> getLocalCoordinates();

    @InputFiles
    @PathSensitive(PathSensitivity.RELATIVE)
    public abstract RegularFileProperty getMarkdownFile();

    @TaskAction
    public final void check() throws IOException {
        File manifest = getManifestFile().getAsFile().get();

        Map<String, List<MetricSchema>> schemas = ObjectMappers.mapper.readValue(manifest, new TypeReference<>() {});
        if (isEmpty(schemas)) {
            return;
        }

        File markdown = getMarkdownFile().get().getAsFile();
        String upToDateContents = MarkdownRenderer.render(getLocalCoordinates().get(), schemas);

        if (!markdown.exists()) {
            throw new GradleException(String.format(
                    "%s does not exist, please run `./gradlew %s` or "
                            + "`./gradlew --write-locks` and commit the resultant file",
                    markdown.getName(), getName()));
        } else {
            String fromDisk = Files.readString(markdown.toPath().toAbsolutePath());
            Preconditions.checkState(
                    fromDisk.equals(upToDateContents),
                    "%s is out of date, please run `./gradlew %s` or `./gradlew --write-locks` to update it.",
                    markdown.getName(),
                    GenerateMetricMarkdownTask.NAME);
        }
    }

    private static boolean isEmpty(Map<String, List<MetricSchema>> schemas) {
        return schemas.isEmpty() || schemas.values().stream().allMatch(List::isEmpty);
    }
}
