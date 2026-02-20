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

package com.palantir.metric.schema.gradle

import com.google.common.base.Throwables
import com.palantir.gradle.plugintesting.TestContentHelpers

import java.nio.file.Files
import java.nio.file.StandardCopyOption
import nebula.test.IntegrationSpec
import nebula.test.dependencies.DependencyGraph
import nebula.test.dependencies.GradleDependencyGenerator
import nebula.test.functional.ExecutionResult
import org.apache.commons.io.FileUtils

class MetricSchemaPluginIntegrationSpec extends IntegrationSpec {
    public static final String METRICS = """
        namespaces:
          server:
            docs: General web server metrics.
            metrics:
              response.size:
                type: histogram
                tags:
                  - service-name
                  - endpoint
                docs: A histogram of the number of bytes written into the response.
              worker.utilization:
                type: gauge
                docs: A gauge of the ratio of active workers to the number of workers.
        """.stripIndent()

    public static final String METRICS_NO_TAGS = """
        namespaces:
          server:
            docs: General web server metrics.
            metrics:
              worker.utilization:
                type: gauge
                docs: A gauge of the ratio of active workers to the number of workers.
        """.stripIndent()

    public static final String METRICS_INVALID = """
        namespaces:
          server:
            docs: General web server metrics.
            metrics:
              response.size:
                type: histogram
                tags:
                  - service_name
                  - endpoint
                docs: A histogram of the number of bytes written into the response.
        """.stripIndent()

    void setup() {
        buildFile << """
        buildscript {
            repositories {
                mavenCentral()
                gradlePluginPortal()
            }

            dependencies {
                classpath 'com.palantir.gradle.consistentversions:gradle-consistent-versions:2.32.0'
                classpath 'com.palantir.baseline:gradle-baseline-java:6.25.0'
            }
        }

        apply plugin: 'com.palantir.consistent-versions'
        allprojects {
            ${applyPlugin(MetricSchemaPlugin.class)}
            group 'com.palantir.test'

            repositories {
                mavenCentral()
            }
        }
        """.stripIndent()
        TestContentHelpers.addVersionsToPropsFile(file('versions.props'), [
                'com.google.errorprone:error_prone_annotations',
                'com.palantir.tritium:tritium-registry',
                'com.palantir.safe-logging:preconditions',
                'com.palantir.safe-logging:safe-logging',
                'io.dropwizard.metrics:metrics-core'
        ])
        runTasksSuccessfully('--write-locks')
    }

    def 'handles shorthand schema'() {
        when:
        file('src/main/metrics/metrics.yml') << """
        namespaces:
          server:
            docs: General web server metrics.
            metrics:
              response.size:
                type: histogram
                docs: A histogram of the number of bytes written into the response.
                tags:
                  - name: serviceName
                    values: [foo]
        """.stripIndent()

        then:
        def result = runTasksSuccessfully('compileMetricSchema')
    }

    def 'generates java'() {
        when:
        file('src/main/metrics/metrics.yml') << METRICS

        then:
        def result = runTasksSuccessfully('classes')
        result.wasExecuted(':generateMetrics')
        fileExists("build/generated/sources/metricSchema/java/main/com/palantir/test/ServerMetrics.java")
    }

    def 'build cache works'() {
        when:
        file("gradle.properties") << "org.gradle.caching=true"
        file('src/main/metrics/metrics.yml') << METRICS

        runTasksSuccessfully('generateMetrics')
        fileExists("build/generated/sources/metricSchema/java/main/com/palantir/test/ServerMetrics.java")

        // we want cache hits no matter where the project is checked out on disk
        File originalProjectDir = getProjectDir()
        File newProjectDir = getProjectDir().toPath().getParent().resolve(
                originalProjectDir.getName() + "-relocated").toFile()
        FileUtils.copyDirectory(originalProjectDir, newProjectDir)
        setProjectDir(newProjectDir)
        FileUtils.deleteDirectory(originalProjectDir)
        FileUtils.deleteDirectory(file("build/generated/sources/metricSchema"))

        then:
        ExecutionResult result = runTasksSuccessfully('generateMetrics')
        result.standardOutput.contains("> Task :generateMetrics FROM-CACHE")
    }

    def 'invalid schema results in task failure'() {
        when:
        file('src/main/metrics/metrics.yml') << METRICS_INVALID

        then:
        def result = runTasksWithFailure('classes')
        result.wasExecuted(':compileMetricSchema')
        Throwables.getRootCause(result.getFailure()).getMessage().contains("tags names must match pattern")
    }

    def 'missing definition results in task failure'() {
        when:
        file('src/main/metrics/metrics.yml') << """
            namespaces:
              aa.namespace:
                docs: test metrics
                metrics:
                  my.custom.metric:
            """

        then:
        def result = runTasksWithFailure('classes')
        result.wasExecuted(':compileMetricSchema')
        Throwables.getRootCause(result.getFailure()).getMessage().contains("null value in entry: my.custom.metric=null")
    }

    def 'embeds metrics into jar'() {
        when:
        buildFile << """
        task unJar(type: Sync, dependsOn: jar) {
            from { zipTree(tasks.jar.archiveFile) }
            into file("unjar")
        }
        """.stripIndent()
        file('src/main/metrics/metrics.yml') << METRICS

        then:
        def result = runTasksSuccessfully(':unJar')
        result.wasExecuted(':compileMetricSchema')
        fileExists("unjar/metric-schema/metrics.json")
        !ObjectMappers.loadMetricSchema(file('unjar/metric-schema/metrics.json')).isEmpty()
    }

    def "createManifest discovers metric schema"() {
        when:
        def dependencyGraph = new DependencyGraph('a:a:1.0')
        GradleDependencyGenerator generator = new GradleDependencyGenerator(
                dependencyGraph, new File(projectDir, "build/testrepogen").toString())
        def mavenRepo = generator.generateTestMavenRepo()

        Files.copy(
                MetricSchemaPluginIntegrationSpec.getResourceAsStream("/a-1.0.jar"),
                new File(mavenRepo, "a/a/1.0/a-1.0.jar").toPath(),
                StandardCopyOption.REPLACE_EXISTING)

        buildFile << """
        group 'com.palantir.test'

        repositories {
            maven {url "file:///${mavenRepo.getAbsolutePath()}"}
        }
        dependencies {
            implementation 'a:a:1.0'
        }
        """.stripIndent()

        then:
        def result = runTasksSuccessfully(':createMetricsManifest')

        then:
        fileExists('build/metricSchema/manifest.json')

        def manifest = ObjectMappers.mapper.readValue(file("build/metricSchema/manifest.json"), Map.class)
        !manifest.isEmpty()
        manifest['a:a:1.0'] != null
    }

    def "createManifest discovers in repo metric schema"() {
        setup:
        addSubproject("foo-lib", "")
        file('foo-lib/src/main/metrics/metric.yml') << METRICS

        addSubproject("foo-server", """
            dependencies {
                implementation project(':foo-lib')
            }
        """.stripIndent())

        when:
        def result = runTasksSuccessfully(':foo-server:createMetricsManifest')

        then:
        result.wasExecuted(":foo-lib:compileMetricSchema")
        !result.wasExecuted(':foo-lib:jar')
        result.wasExecuted(":foo-server:compileMetricSchema")

        fileExists('foo-server/build/metricSchema/manifest.json')
        def manifest = ObjectMappers.mapper.readValue(file("foo-server/build/metricSchema/manifest.json"), Map.class)
        !manifest.isEmpty()
        manifest['com.palantir.test:foo-lib:$projectVersion'] != []
    }

    def 'createManifest respects project dependency changes'() {
        setup:
        addSubproject("foo-lib", "")
        def libMetrics = file('foo-lib/src/main/metrics/metric.yml')
        libMetrics << METRICS

        addSubproject("foo-server", """
            dependencies {
                implementation project(':foo-lib')
            }
        """.stripIndent())

        when:
        def result1 = runTasksSuccessfully(':foo-server:createMetricsManifest')

        then:
        result1.wasExecuted(":foo-lib:compileMetricSchema")
        !result1.wasExecuted(':foo-lib:jar')
        result1.wasExecuted(":foo-server:compileMetricSchema")

        when:
        libMetrics.delete()
        def result2 = runTasksSuccessfully(':foo-server:createMetricsManifest')

        then:
        result2.wasExecuted(":foo-lib:compileMetricSchema")
        !result2.wasExecuted(':foo-lib:jar')
        result2.wasExecuted(":foo-server:compileMetricSchema")

        fileExists('foo-server/build/metricSchema/manifest.json')
        def manifest = ObjectMappers.mapper.readValue(file("foo-server/build/metricSchema/manifest.json"), Map.class)
        manifest['com.palantir.test:foo-lib:$projectVersion'] == []
    }

    def 'createManifest discovers transitive external metric schema'() {
        when:
        def dependencyGraph = new DependencyGraph('a:a:1.0')
        GradleDependencyGenerator generator = new GradleDependencyGenerator(
                dependencyGraph, new File(projectDir, "build/testrepogen").toString())
        def mavenRepo = generator.generateTestMavenRepo()

        Files.copy(
                MetricSchemaPluginIntegrationSpec.getResourceAsStream("/a-1.0.jar"),
                new File(mavenRepo, "a/a/1.0/a-1.0.jar").toPath(),
                StandardCopyOption.REPLACE_EXISTING)

        addSubproject("foo-lib", """
        repositories {
            maven {url "file:///${mavenRepo.getAbsolutePath()}"}
        }

        dependencies { implementation 'a:a:1.0' }
        """.stripIndent())

        buildFile << """
        repositories {
            maven {url "file:///${mavenRepo.getAbsolutePath()}"}
        }
        dependencies { implementation project(':foo-lib') }
        """.stripIndent()

        then:
        def result = runTasksSuccessfully(':createMetricsManifest')
        !result.wasExecuted(':foo-lib:jar')
        fileExists('build/metricSchema/manifest.json')

        def manifest = ObjectMappers.mapper.readValue(file("build/metricSchema/manifest.json"), Map.class)
        !manifest.isEmpty()
        manifest['a:a:1.0'] != null
    }

    def 'createManifest ignores local metrics from discovered metrics'() {
        setup:
        addSubproject("foo-lib", """
            dependencies {
                implementation project(':foo-server')
            }
        """)

        addSubproject("foo-server", """
            dependencies {
                runtimeOnly project(':foo-lib')
            }
        """.stripIndent())
        def serverMetrics = file('foo-server/src/main/metrics/metric.yml')
        serverMetrics << METRICS

        when:
        def result1 = runTasksSuccessfully(':foo-server:createMetricsManifest')

        then:
        fileExists('foo-server/build/metricSchema/manifest.json')
    }

    def 'declare exact dependencies'() {
        setup:
        buildFile << """
        apply plugin: 'com.palantir.baseline'
        """.stripIndent(true)
        file('src/main/metrics/metrics.yml') << METRICS

        when:
        ExecutionResult result = runTasksSuccessfully("classes", "checkImplicitDependencies", "checkUnusedDependencies")

        then:
        result.wasExecuted(':generateMetrics')
        fileExists("build/generated/sources/metricSchema/java/main/com/palantir/test/ServerMetrics.java")

        result.wasExecuted(":checkImplicitDependenciesMain")
        !result.wasSkipped(":checkImplicitDependenciesMain")
        result.wasExecuted(":checkUnusedDependenciesMain")
        !result.wasSkipped(":checkUnusedDependenciesMain")
    }

    def 'declare exact dependencies even without generated metrics'() {
        setup:
        buildFile << """
        apply plugin: 'com.palantir.baseline'
        """.stripIndent(true)

        when:
        ExecutionResult result = runTasksSuccessfully("classes", "checkImplicitDependencies", "checkUnusedDependencies")

        then:
        result.wasExecuted(':generateMetrics')
        !fileExists("build/generated/sources/metricSchema/java/main/com/palantir/test/ServerMetrics.java")

        result.wasExecuted(":checkImplicitDependenciesMain")
        !result.wasSkipped(":checkImplicitDependenciesMain")
        result.wasExecuted(":checkUnusedDependenciesMain")
        !result.wasSkipped(":checkUnusedDependenciesMain")
    }

    def 'declare exact dependencies even with metrics without safety-annotated tags'() {
        setup:
        buildFile << """
        apply plugin: 'com.palantir.baseline'
        """.stripIndent(true)
        file('src/main/metrics/metrics.yml') << METRICS_NO_TAGS

        when:
        ExecutionResult result = runTasksSuccessfully("classes", "checkImplicitDependencies", "checkUnusedDependencies")

        then:
        result.wasExecuted(':generateMetrics')
        fileExists("build/generated/sources/metricSchema/java/main/com/palantir/test/ServerMetrics.java")

        result.wasExecuted(":checkImplicitDependenciesMain")
        !result.wasSkipped(":checkImplicitDependenciesMain")
        result.wasExecuted(":checkUnusedDependenciesMain")
        !result.wasSkipped(":checkUnusedDependenciesMain")
    }
}
