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
import com.google.common.collect.ImmutableMap;
import com.google.common.io.Files;
import com.palantir.metric.schema.MetricSchema;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;
import org.gradle.api.DefaultTask;
import org.gradle.api.Project;
import org.gradle.api.artifacts.Configuration;
import org.gradle.api.artifacts.ResolvedArtifact;
import org.gradle.api.artifacts.component.ComponentIdentifier;
import org.gradle.api.artifacts.component.ProjectComponentIdentifier;
import org.gradle.api.artifacts.result.ComponentResult;
import org.gradle.api.file.ConfigurableFileCollection;
import org.gradle.api.file.FileCollection;
import org.gradle.api.file.RegularFileProperty;
import org.gradle.api.logging.Logger;
import org.gradle.api.logging.Logging;
import org.gradle.api.provider.Property;
import org.gradle.api.provider.Provider;
import org.gradle.api.tasks.Input;
import org.gradle.api.tasks.InputFile;
import org.gradle.api.tasks.InputFiles;
import org.gradle.api.tasks.Internal;
import org.gradle.api.tasks.OutputFile;
import org.gradle.api.tasks.TaskAction;

public abstract class CreateMetricsManifestTask extends DefaultTask {
    private static final Logger log = Logging.getLogger(CreateMetricsManifestTask.class);

    static final String NAME = "createMetricsManifest";

    @SuppressWarnings("for-rollout:GradleTypesAsFields")
    private final Provider<FileCollection> projectDependencyMetrics;

    @SuppressWarnings("for-rollout:GradleTypesAsFields")
    private final RegularFileProperty metricsFile = getProject().getObjects().fileProperty();

    @SuppressWarnings("for-rollout:GradleTypesAsFields")
    private final Property<Configuration> configuration =
            getProject().getObjects().property(Configuration.class);

    @SuppressWarnings("for-rollout:GradleTypesAsFields")
    private final RegularFileProperty outputFile = getProject().getObjects().fileProperty();

    @InputFiles
    public final Provider<FileCollection> getProjectDependencyMetrics() {
        return projectDependencyMetrics;
    }

    @InputFile
    public final RegularFileProperty getMetricsFile() {
        return metricsFile;
    }

    @Internal
    public final Property<Configuration> getConfiguration() {
        return configuration;
    }

    @Input
    final Set<String> getProductDependenciesConfig() {
        // HACKHACK serializable way of representing all dependencies
        return configuration.get().getIncoming().getResolutionResult().getAllComponents().stream()
                .map(ComponentResult::getId)
                .map(ComponentIdentifier::getDisplayName)
                .collect(Collectors.toSet());
    }

    @OutputFile
    public final RegularFileProperty getOutputFile() {
        return outputFile;
    }

    public CreateMetricsManifestTask() {
        this.projectDependencyMetrics = otherProjectMetricSchemaTasks();
        dependsOn(projectDependencyMetrics);
    }

    /**
     * A lazy collection of tasks that ensure the {@link CompileMetricSchemaTask} task of any project dependencies from
     * {@link #configuration} are executed.
     */
    private Provider<FileCollection> otherProjectMetricSchemaTasks() {
        return getConfiguration().map(productDeps -> {
            // Using a ConfigurableFileCollection simply because it implements Buildable and provides a convenient API
            // to wire up task dependencies to it in a lazy way.
            ConfigurableFileCollection emptyFileCollection = getProject().files();
            productDeps.getIncoming().getArtifacts().getArtifacts().stream()
                    .flatMap(artifact -> {
                        ComponentIdentifier id = artifact.getId().getComponentIdentifier();

                        // Depend on the ConfigureProductDependenciesTask, if it exists, which will wire up the jar
                        // manifest with recommended product dependencies.
                        if (id instanceof ProjectComponentIdentifier projectComponentIdentifier) {
                            Project dependencyProject =
                                    getProject().getRootProject().project(projectComponentIdentifier.getProjectPath());
                            return Stream.of(dependencyProject.getTasks().withType(CompileMetricSchemaTask.class));
                        }
                        return Stream.empty();
                    })
                    .forEach(tasks -> {
                        emptyFileCollection.from(tasks);
                        emptyFileCollection.builtBy(tasks);
                    });
            return emptyFileCollection;
        });
    }

    @TaskAction
    public final void createManifest() throws IOException {
        ObjectMappers.mapper.writeValue(
                getOutputFile().get().getAsFile(),
                ImmutableMap.builder()
                        .putAll(getLocalMetrics())
                        .putAll(getDiscoveredMetrics())
                        .buildOrThrow());
    }

    @SuppressWarnings("for-rollout:IllegalMethodCalledDuringTaskExecution")
    private Map<String, List<MetricSchema>> getLocalMetrics() {
        if (getMetricsFile().getAsFile().isPresent()) {
            return ImmutableMap.of(
                    getProjectCoordinates(getProject()),
                    ObjectMappers.loadMetricSchema(getMetricsFile().getAsFile().get()));
        }
        return Collections.emptyMap();
    }

    private Map<String, List<MetricSchema>> getDiscoveredMetrics() {
        ImmutableMap.Builder<String, List<MetricSchema>> discoveredMetrics = ImmutableMap.builder();

        configuration.get().getResolvedConfiguration().getResolvedArtifacts().forEach(artifact -> {
            ComponentIdentifier id = artifact.getId().getComponentIdentifier();

            if (id instanceof ProjectComponentIdentifier projectComponentIdentifier) {
                Project dependencyProject = getProject().project(projectComponentIdentifier.getProjectPath());
                if (!dependencyProject.equals(getProject())) {
                    inferProjectDependencyMetrics(dependencyProject)
                            .ifPresent(metrics ->
                                    discoveredMetrics.put(getProjectCoordinates(dependencyProject), metrics));
                }
            } else {
                getExternalMetrics(id, artifact).ifPresent(metrics -> discoveredMetrics.put(id.toString(), metrics));
            }
        });

        return discoveredMetrics.buildOrThrow();
    }

    private static Optional<List<MetricSchema>> inferProjectDependencyMetrics(Project dependencyProject) {
        if (!dependencyProject.getPlugins().hasPlugin(MetricSchemaPlugin.class)) {
            return Optional.empty();
        }
        CompileMetricSchemaTask compileMetricSchemaTask =
                (CompileMetricSchemaTask) dependencyProject.getTasks().getByName(CompileMetricSchemaTask.NAME);

        File file = compileMetricSchemaTask.getMetricsJsonFile().get().getAsFile();
        if (!file.isFile()) {
            log.debug("File {} does not exist", file);
            return Optional.empty();
        }
        return Optional.of(ObjectMappers.loadMetricSchema(file));
    }

    private static Optional<List<MetricSchema>> getExternalMetrics(ComponentIdentifier id, ResolvedArtifact artifact) {
        if (!artifact.getFile().exists()) {
            log.debug("Artifact did not exist: {}", artifact.getFile());
            return Optional.empty();
        } else if (!Files.getFileExtension(artifact.getFile().getName()).equals("jar")) {
            log.debug("Artifact is not jar: {}", artifact.getFile());
            return Optional.empty();
        }

        try (ZipFile zipFile = new ZipFile(artifact.getFile())) {
            ZipEntry manifestEntry = zipFile.getEntry(MetricSchemaPlugin.METRICS_JSON_FILE);
            if (manifestEntry == null) {
                log.debug("Manifest file does not exist in JAR: {}", id);
                return Optional.empty();
            }

            try (InputStream is = zipFile.getInputStream(manifestEntry)) {
                return Optional.of(ObjectMappers.mapper.readValue(is, new TypeReference<>() {}));
            }
        } catch (IOException e) {
            throw new UncheckedIOException("Failed to load external monitors", e);
        }
    }

    private static String getProjectCoordinates(Project project) {
        // We explicitly exclude the version for project dependencies so that the output of the task does not depend on
        // project version and is more likely to be cached
        return String.format("%s:%s:$projectVersion", project.getGroup(), project.getName());
    }
}
