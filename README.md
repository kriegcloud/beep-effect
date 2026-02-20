<p align="right">
<a href="https://autorelease.general.dmz.palantir.tech/palantir/metric-schema"><img src="https://img.shields.io/badge/Perform%20an-Autorelease-success.svg" alt="Autorelease"></a>
</p>

# Metric Schema
_A simple opinionated toolchain to define and document metrics produced by a project._

Features:
* Source of truth for metrics, eliminating incorrect and outdated documentation.
* Produces a standardized representation of metrics to library and service consumers based on the classpath.

The generated java utilities wrap a [Tritium](https://github.com/palantir/tritium) registry to provide simple, concise
accessors to declared metrics.

## Getting started

Start by adding a buildscript dependency on the Metric-schema gradle plugin:

_`build.gradle`_
```groovy
buildscript {
    dependencies {
        classpath 'com.palantir.metricschema:gradle-metric-schema:<latest-version>'
    }
}
```

Then apply `com.palantir.metric-schema` gradle plugin to your service project:

_`<your-service>/build.gradle`_
```groovy
apply plugin: 'com.palantir.metric-schema'
```

Then start defining metrics in your project:

_`<your-service>/src/main/metrics/my-metrics.yml`_
```yaml
namespaces:
  my.service:
    # Documentation describing the entire namespace.
    docs: Metrics helpful for monitoring a my-service instance.
    tags:
      # Namespace tags will get automatically propagated to all child metrics and are checked for duplicates.
      - operationType
    metrics:
      # Results in a meter with name `my.service.failures`
      failures:
        # Type of the metric can be one of [counter, meter, timer, histogram, gauge]
        # Each metric type corresponds to a metric type from https://metrics.dropwizard.io
        type: meter
        # General documentation about the metric
        docs: Rate of failures by `operationType`
        # Each tag allows you to provide annotate the metric with a key-value pair
        tags:
          # Tag which allows for an arbitrary string value
          - operationType
          # Tag with a predefined set of values
          - name: severity
            # Specific documentation about the tag
            docs: How important the operation was
            values: [P0, P1]
```

Then generate the utilities by running `./gradlew generateMetrics` and begin instrumenting your code. Examples of the
generated code can be found [here](metric-schema-java/src/integrationInput/java/com/palantir/test).

```java
MyServiceMetrics metrics = MyServiceMetrics.of(server.taggedMetrics());
// Metric objects should be reused as much as possible to avoid unnecessary lookups
Meter creationFailures = metrics.failures()
        .operationType("create")
        .severity(Failures_Severity.P0)
        .build();
```

## Details

Metric definitions are located in project `src/main/metrics` directories.
Files are YAML formatted with the `.yml` extension and represent a collection of namespaces, a logical group of metrics 
with a shared prefix. The schema is defined using [conjure](https://palantir.github.io/conjure),
and can be [found here](metric-schema-api/src/main/conjure/metric-schema-api.yml).

Metric utilities are updated using the `generateMetrics` gradle task. If this is the first
metric definition in the module, it may be necessary to regenerate the IDE configuration
after metrics are generated, IntelliJ IDEA users can run the `idea` task.

Metric documentation is updated using the `generateMetricsMarkdown` gradle task or by running 
`./gradlew --write-locks`. The gradle plugin will ensure that the metrics markdown is always up to date.

All metric definitions will be embedded within the output JAR as a resource located `metric-schema/metrics.json`.

### Options
Metric definitions can also include options that do not change the overall declaration, but may affect the way it is 
handled in a particular context.
```yml
options:
  # Specifies under which package Java classes should be generated
  javaPackage: 'com.palantir.my.package'
  # Specifies visibility of generated Utility class. Defaults to public
  javaVisibility: packagePrivate 
namespaces:
...
```

## Architecture
Design documentation describing the rationale for decisions is maintained in [design.md](docs/design.md).

### Start Developing
Run one of the following commands:

* `./gradlew idea` for IntelliJ
* `./gradlew eclipse` for Eclipse
