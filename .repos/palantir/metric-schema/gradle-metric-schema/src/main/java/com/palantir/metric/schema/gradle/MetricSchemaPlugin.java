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

import com.google.common.collect.Multimap;
import com.palantir.sls.versions.OrderableSlsVersion;
import com.palantir.sls.versions.SlsVersion;
import com.palantir.sls.versions.SlsVersionType;
import java.util.List;
import java.util.Objects;
import javax.annotation.Nullable;
import org.gradle.api.Plugin;
import org.gradle.api.Project;
import org.gradle.api.file.Directory;
import org.gradle.api.file.FileSystemLocation;
import org.gradle.api.file.RegularFile;
import org.gradle.api.file.SourceDirectorySet;
import org.gradle.api.plugins.JavaLibraryPlugin;
import org.gradle.api.plugins.JavaPlugin;
import org.gradle.api.plugins.JavaPluginExtension;
import org.gradle.api.provider.Provider;
import org.gradle.api.tasks.SourceSet;
import org.gradle.api.tasks.TaskProvider;
import org.gradle.plugins.ide.idea.model.IdeaModel;

public final class MetricSchemaPlugin implements Plugin<Project> {

    public static final String TASK_GROUP = "MetricSchema";

    public static final String METRICS_JSON_FILE = "metric-schema/metrics.json";

    @Override
    public void apply(Project project) {
        project.getPluginManager().apply(JavaLibraryPlugin.class);

        Provider<Directory> generatedJavaDir =
                project.getLayout().getBuildDirectory().dir("generated/sources/metricSchema/java/main");
        Provider<Directory> generatedResourcesDir =
                project.getLayout().getBuildDirectory().dir("generated/sources/metricSchema/resources/main");
        Provider<Directory> metricSchemaDir =
                project.getLayout().getBuildDirectory().dir("metricSchema");

        SourceDirectorySet metricSchemaSourceDirectorySet =
                project.getObjects().sourceDirectorySet("metricSchema", "Metric Schema source set");
        metricSchemaSourceDirectorySet.srcDir("src/main/metrics");
        metricSchemaSourceDirectorySet.include("**/*.yml");

        TaskProvider<CompileMetricSchemaTask> compileMetricSchemaTask = project.getTasks()
                .register(CompileMetricSchemaTask.NAME, CompileMetricSchemaTask.class, task -> {
                    task.setGroup(TASK_GROUP);
                    task.getSource().from(metricSchemaSourceDirectorySet);
                    task.getOutputDir().set(generatedResourcesDir);
                });

        Provider<RegularFile> metricsFiles =
                compileMetricSchemaTask.flatMap(CompileMetricSchemaTask::getMetricsJsonFile);

        TaskProvider<GenerateMetricsTask> generateMetricsTask = project.getTasks()
                .register(GenerateMetricsTask.NAME, GenerateMetricsTask.class, task -> {
                    task.setGroup(TASK_GROUP);
                    task.setDescription("Generates bindings for producing well defined metrics");
                    task.getInputFile().set(metricsFiles);
                    task.getLibraryName().convention(defaultLibraryName(project));
                    task.getLibraryVersion().convention(defaultLibraryVersion(project));
                    task.getOutputDir().set(generatedJavaDir);
                    task.getPackageName().set(project.getGroup().toString());
                });

        project.getTasks().register(CreateMetricsManifestTask.NAME, CreateMetricsManifestTask.class, task -> {
            task.setGroup(TASK_GROUP);
            task.getMetricsFile().set(metricsFiles);
            task.getOutputFile().set(metricSchemaDir.map(dir -> dir.file("manifest.json")));
            task.getConfiguration()
                    .set(project.getConfigurations().getByName(JavaPlugin.RUNTIME_CLASSPATH_CONFIGURATION_NAME));
        });

        JavaPluginExtension javaPluginExtension = project.getExtensions().getByType(JavaPluginExtension.class);

        javaPluginExtension
                .getSourceSets()
                .named(SourceSet.MAIN_SOURCE_SET_NAME)
                .configure(sourceSet -> {
                    sourceSet.getJava().srcDir(generateMetricsTask);
                    sourceSet.getResources().srcDir(compileMetricSchemaTask.map(CompileMetricSchemaTask::getOutputDir));
                });

        project.getPluginManager().withPlugin("com.palantir.sls-java-service-distribution", _plugin -> {
            project.getPluginManager().apply(MetricSchemaMarkdownPlugin.class);
        });

        configureIdea(project, generatedJavaDir);

        configureDependencies(project, metricSchemaSourceDirectorySet);
    }

    private static void configureIdea(Project project, Provider<Directory> generatedJavaDir) {
        project.getPluginManager().withPlugin("idea", _plugin -> {
            IdeaModel ideaModel = project.getExtensions().getByType(IdeaModel.class);

            ideaModel
                    .getModule()
                    .getGeneratedSourceDirs()
                    .add(generatedJavaDir.get().getAsFile());
        });
    }

    private static void configureDependencies(Project project, SourceDirectorySet metricSchemaSourceDirectorySet) {
        Provider<Multimap<String, String>> dependencies = metricSchemaSourceDirectorySet
                .getElements()
                .map(metricsFiles -> DependencyRequirements.getDependencies(
                        metricsFiles.stream().map(FileSystemLocation::getAsFile).toList()));

        List.of(JavaPlugin.API_CONFIGURATION_NAME, JavaPlugin.IMPLEMENTATION_CONFIGURATION_NAME)
                .forEach(configurationName -> project.getConfigurations().named(configurationName, configuration -> {
                    configuration
                            .getDependencies()
                            .addAllLater(dependencies.map(deps -> deps.get(configurationName).stream()
                                    .map(project.getDependencies()::create)
                                    .toList()));
                }));
    }

    private String defaultLibraryName(Project project) {
        String rootProjectName = project.getRootProject().getName();
        return rootProjectName.replaceAll("-root$", "");
    }

    @Nullable
    private String defaultLibraryVersion(Project project) {
        // Gradle returns 'unspecified' when there is no version information, which is not orderable.
        String version = Objects.toString(project.getRootProject().getVersion());
        return OrderableSlsVersion.safeValueOf(version)
                // Only provide version data for releases and release candidates, not snapshots. This way we
                // don't invalidate build caches on each commit.
                // We prefer passing along version information at this level because it will not be mutated
                // by shading, where the fallback based on 'package.getImplementationVersion()' will reflect
                // the shadow jar version.
                .filter(ver ->
                        ver.getType() == SlsVersionType.RELEASE || ver.getType() == SlsVersionType.RELEASE_CANDIDATE)
                .map(SlsVersion::getValue)
                .orElse(null);
    }
}
