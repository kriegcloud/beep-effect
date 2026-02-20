package com.palantir.test;

import com.codahale.metrics.Counter;
import com.codahale.metrics.Gauge;
import com.codahale.metrics.Histogram;
import com.codahale.metrics.Meter;
import com.codahale.metrics.Timer;
import com.google.errorprone.annotations.CheckReturnValue;
import com.palantir.logsafe.Preconditions;
import com.palantir.logsafe.Safe;
import com.palantir.tritium.metrics.registry.MetricName;
import com.palantir.tritium.metrics.registry.TaggedMetricRegistry;
import java.util.Objects;

/** General web server metrics. */
public final class NamespaceTagsMetrics {
    private static final String JAVA_VERSION = System.getProperty("java.version", "unknown");

    private static final String LIBRARY_NAME = "witchcraft";

    private static final String LIBRARY_VERSION =
            Objects.requireNonNullElse(NamespaceTagsMetrics.class.getPackage().getImplementationVersion(), "unknown");

    private final TaggedMetricRegistry registry;

    private final String noValueTagValue;

    private final String locatorWithMultipleValuesValue;

    private final MetricName gaugesMetricName;

    private final MetricName timesMetricName;

    private final MetricName histogramsMetricName;

    private NamespaceTagsMetrics(
            TaggedMetricRegistry registry,
            String noValueTag,
            NamespaceTags_LocatorWithMultipleValues locatorWithMultipleValues) {
        this.registry = registry;
        this.noValueTagValue = noValueTag;
        this.locatorWithMultipleValuesValue = locatorWithMultipleValues.getValue();
        this.gaugesMetricName = MetricName.builder()
                .safeName("namespace-tags.gauges")
                .putSafeTags("locator", "package:identifier")
                .putSafeTags("noValueTag", noValueTagValue)
                .putSafeTags("locatorWithMultipleValues", locatorWithMultipleValuesValue)
                .putSafeTags("libraryName", LIBRARY_NAME)
                .putSafeTags("libraryVersion", LIBRARY_VERSION)
                .putSafeTags("javaVersion", JAVA_VERSION)
                .build();
        this.timesMetricName = MetricName.builder()
                .safeName("namespace-tags.times")
                .putSafeTags("locator", "package:identifier")
                .putSafeTags("noValueTag", noValueTagValue)
                .putSafeTags("locatorWithMultipleValues", locatorWithMultipleValuesValue)
                .putSafeTags("libraryName", LIBRARY_NAME)
                .putSafeTags("libraryVersion", LIBRARY_VERSION)
                .putSafeTags("javaVersion", JAVA_VERSION)
                .build();
        this.histogramsMetricName = MetricName.builder()
                .safeName("namespace-tags.histograms")
                .putSafeTags("locator", "package:identifier")
                .putSafeTags("noValueTag", noValueTagValue)
                .putSafeTags("locatorWithMultipleValues", locatorWithMultipleValuesValue)
                .putSafeTags("libraryName", LIBRARY_NAME)
                .putSafeTags("libraryVersion", LIBRARY_VERSION)
                .putSafeTags("javaVersion", JAVA_VERSION)
                .build();
    }

    @CheckReturnValue
    public static NamespaceTagsBuilderRegistryStage builder() {
        return new NamespaceTagsBuilder();
    }

    /** Measures number of installations that were processed */
    @CheckReturnValue
    public ProcessingBuilderResultStage processing() {
        return new ProcessingBuilder();
    }

    /** Counts something */
    @CheckReturnValue
    public Counter more() {
        return registry.counter(moreMetricName());
    }

    public MetricName moreMetricName() {
        return MetricName.builder()
                .safeName("namespace-tags.more")
                .putSafeTags("locator", "package:identifier")
                .putSafeTags("noValueTag", noValueTagValue)
                .putSafeTags("locatorWithMultipleValues", locatorWithMultipleValuesValue)
                .putSafeTags("otherLocator2", "package:identifier")
                .putSafeTags("libraryName", LIBRARY_NAME)
                .putSafeTags("libraryVersion", LIBRARY_VERSION)
                .putSafeTags("javaVersion", JAVA_VERSION)
                .build();
    }

    /** Gauges something */
    public void gauges(Gauge<? extends Number> gauge) {
        registry.registerWithReplacement(gaugesMetricName(), gauge);
    }

    public MetricName gaugesMetricName() {
        return gaugesMetricName;
    }

    /** Times something */
    @CheckReturnValue
    public Timer times() {
        return registry.timer(timesMetricName());
    }

    public MetricName timesMetricName() {
        return timesMetricName;
    }

    /** Histograms something */
    @CheckReturnValue
    public Histogram histograms() {
        return registry.histogram(histogramsMetricName());
    }

    public MetricName histogramsMetricName() {
        return histogramsMetricName;
    }

    @Override
    public String toString() {
        return "NamespaceTagsMetrics{registry=" + registry + ", locator=package:identifier" + ", noValueTag="
                + noValueTagValue + ", locatorWithMultipleValues=" + locatorWithMultipleValuesValue + '}';
    }

    public enum NamespaceTags_LocatorWithMultipleValues {
        PACKAGE_IDENTIFIER("package:identifier"),

        PACKAGE_IDENTIFIER2("package:identifier2");

        private final String value;

        NamespaceTags_LocatorWithMultipleValues(String value) {
            this.value = value;
        }

        private String getValue() {
            return value;
        }
    }

    public interface NamespaceTagsBuildStage {
        @CheckReturnValue
        NamespaceTagsMetrics build();
    }

    public interface NamespaceTagsBuilderRegistryStage {
        @CheckReturnValue
        NamespaceTagsBuilderNoValueTagStage registry(@Safe TaggedMetricRegistry registry);
    }

    public interface NamespaceTagsBuilderNoValueTagStage {
        @CheckReturnValue
        NamespaceTagsBuilderLocatorWithMultipleValuesStage noValueTag(@Safe String noValueTag);
    }

    public interface NamespaceTagsBuilderLocatorWithMultipleValuesStage {
        @CheckReturnValue
        NamespaceTagsBuildStage locatorWithMultipleValues(
                @Safe NamespaceTags_LocatorWithMultipleValues locatorWithMultipleValues);
    }

    private static final class NamespaceTagsBuilder
            implements NamespaceTagsBuilderRegistryStage,
                    NamespaceTagsBuilderNoValueTagStage,
                    NamespaceTagsBuilderLocatorWithMultipleValuesStage,
                    NamespaceTagsBuildStage {
        private TaggedMetricRegistry registry;

        private String noValueTag;

        private NamespaceTags_LocatorWithMultipleValues locatorWithMultipleValues;

        @Override
        public NamespaceTagsMetrics build() {
            return new NamespaceTagsMetrics(registry, noValueTag, locatorWithMultipleValues);
        }

        @Override
        public NamespaceTagsBuilder registry(@Safe TaggedMetricRegistry registry) {
            Preconditions.checkState(this.registry == null, "registry is already set");
            this.registry = Preconditions.checkNotNull(registry, "registry is required");
            return this;
        }

        @Override
        public NamespaceTagsBuilder noValueTag(@Safe String noValueTag) {
            Preconditions.checkState(this.noValueTag == null, "noValueTag is already set");
            this.noValueTag = Preconditions.checkNotNull(noValueTag, "noValueTag is required");
            return this;
        }

        @Override
        public NamespaceTagsBuilder locatorWithMultipleValues(
                @Safe NamespaceTags_LocatorWithMultipleValues locatorWithMultipleValues) {
            Preconditions.checkState(
                    this.locatorWithMultipleValues == null, "locatorWithMultipleValues is already set");
            this.locatorWithMultipleValues =
                    Preconditions.checkNotNull(locatorWithMultipleValues, "locatorWithMultipleValues is required");
            return this;
        }
    }

    public enum Processing_Result {
        SUCCESS("success"),

        FAILURE("failure");

        private final String value;

        Processing_Result(String value) {
            this.value = value;
        }

        private String getValue() {
            return value;
        }
    }

    public enum Processing_OtherLocator {
        PACKAGE_IDENTIFIER("package:identifier"),

        PACKAGE_IDENTIFIER2("package:identifier2");

        private final String value;

        Processing_OtherLocator(String value) {
            this.value = value;
        }

        private String getValue() {
            return value;
        }
    }

    public interface ProcessingBuildStage {
        @CheckReturnValue
        Meter build();

        @CheckReturnValue
        MetricName buildMetricName();
    }

    public interface ProcessingBuilderResultStage {
        /** The result of processing */
        @CheckReturnValue
        ProcessingBuilderTypeStage result(@Safe Processing_Result result);
    }

    public interface ProcessingBuilderTypeStage {
        @CheckReturnValue
        ProcessingBuilderOtherLocatorStage type(@Safe String type);
    }

    public interface ProcessingBuilderOtherLocatorStage {
        @CheckReturnValue
        ProcessingBuildStage otherLocator(@Safe Processing_OtherLocator otherLocator);
    }

    private final class ProcessingBuilder
            implements ProcessingBuilderResultStage,
                    ProcessingBuilderTypeStage,
                    ProcessingBuilderOtherLocatorStage,
                    ProcessingBuildStage {
        private Processing_Result result;

        private String type;

        private Processing_OtherLocator otherLocator;

        @Override
        public ProcessingBuilder result(@Safe Processing_Result result) {
            Preconditions.checkState(this.result == null, "result is already set");
            this.result = Preconditions.checkNotNull(result, "result is required");
            return this;
        }

        @Override
        public ProcessingBuilder type(@Safe String type) {
            Preconditions.checkState(this.type == null, "type is already set");
            this.type = Preconditions.checkNotNull(type, "type is required");
            return this;
        }

        @Override
        public ProcessingBuilder otherLocator(@Safe Processing_OtherLocator otherLocator) {
            Preconditions.checkState(this.otherLocator == null, "otherLocator is already set");
            this.otherLocator = Preconditions.checkNotNull(otherLocator, "otherLocator is required");
            return this;
        }

        @Override
        public Meter build() {
            return registry.meter(buildMetricName());
        }

        @Override
        public MetricName buildMetricName() {
            return MetricName.builder()
                    .safeName("namespace-tags.processing")
                    .putSafeTags("locator", "package:identifier")
                    .putSafeTags("noValueTag", noValueTagValue)
                    .putSafeTags("locatorWithMultipleValues", locatorWithMultipleValuesValue)
                    .putSafeTags("result", result.getValue())
                    .putSafeTags("type", type)
                    .putSafeTags("otherLocator", otherLocator.getValue())
                    .putSafeTags("libraryName", LIBRARY_NAME)
                    .putSafeTags("libraryVersion", LIBRARY_VERSION)
                    .putSafeTags("javaVersion", JAVA_VERSION)
                    .build();
        }
    }
}
