package com.palantir.test;

import com.codahale.metrics.Gauge;
import com.palantir.logsafe.Preconditions;
import com.palantir.tritium.metrics.registry.MetricName;
import com.palantir.tritium.metrics.registry.TaggedMetricRegistry;

/** Test data metric. */
public final class ProvidedVersionMetrics {
    private static final String JAVA_VERSION = System.getProperty("java.version", "unknown");

    private static final String LIBRARY_NAME = "specific_libraryVersion";

    private static final String LIBRARY_VERSION = "1.0.0";

    private static final MetricName utilizationMetricName = MetricName.builder()
            .safeName("provided.version.utilization")
            .putSafeTags("libraryName", LIBRARY_NAME)
            .putSafeTags("libraryVersion", LIBRARY_VERSION)
            .putSafeTags("javaVersion", JAVA_VERSION)
            .build();

    private final TaggedMetricRegistry registry;

    private ProvidedVersionMetrics(TaggedMetricRegistry registry) {
        this.registry = registry;
    }

    public static ProvidedVersionMetrics of(TaggedMetricRegistry registry) {
        return new ProvidedVersionMetrics(Preconditions.checkNotNull(registry, "TaggedMetricRegistry"));
    }

    /** Test data. */
    public void utilization(Gauge<? extends Number> gauge) {
        registry.registerWithReplacement(utilizationMetricName(), gauge);
    }

    public static MetricName utilizationMetricName() {
        return utilizationMetricName;
    }

    @Override
    public String toString() {
        return "ProvidedVersionMetrics{registry=" + registry + '}';
    }
}
