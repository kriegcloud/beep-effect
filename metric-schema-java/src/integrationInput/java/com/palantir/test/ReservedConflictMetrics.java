package com.palantir.test;

import com.codahale.metrics.Gauge;
import com.codahale.metrics.Histogram;
import com.codahale.metrics.Meter;
import com.google.errorprone.annotations.CheckReturnValue;
import com.palantir.logsafe.Preconditions;
import com.palantir.logsafe.Safe;
import com.palantir.tritium.metrics.registry.MetricName;
import com.palantir.tritium.metrics.registry.TaggedMetricRegistry;
import java.util.Objects;

/** Tests that reserved words are escaped. */
public final class ReservedConflictMetrics {
    private static final String JAVA_VERSION = System.getProperty("java.version", "unknown");

    private static final String LIBRARY_NAME = "witchcraft";

    private static final String LIBRARY_VERSION = Objects.requireNonNullElse(
            ReservedConflictMetrics.class.getPackage().getImplementationVersion(), "unknown");

    private static final MetricName floatMetricName = MetricName.builder()
            .safeName("reserved.conflict.float")
            .putSafeTags("libraryName", LIBRARY_NAME)
            .putSafeTags("libraryVersion", LIBRARY_VERSION)
            .putSafeTags("javaVersion", JAVA_VERSION)
            .build();

    private final TaggedMetricRegistry registry;

    private ReservedConflictMetrics(TaggedMetricRegistry registry) {
        this.registry = registry;
    }

    public static ReservedConflictMetrics of(TaggedMetricRegistry registry) {
        return new ReservedConflictMetrics(Preconditions.checkNotNull(registry, "TaggedMetricRegistry"));
    }

    /** Uh-oh! */
    @CheckReturnValue
    public IntBuilderIntStage int_() {
        return new IntBuilder();
    }

    /** Meter with a single tag. */
    @CheckReturnValue
    public Meter long_(@Safe String int_) {
        return registry.meter(longMetricName(int_));
    }

    public static MetricName longMetricName(@Safe String int_) {
        return MetricName.builder()
                .safeName("reserved.conflict.long")
                .putSafeTags("int", int_)
                .putSafeTags("libraryName", LIBRARY_NAME)
                .putSafeTags("libraryVersion", LIBRARY_VERSION)
                .putSafeTags("javaVersion", JAVA_VERSION)
                .build();
    }

    /** Gauge metric with a single no tags. */
    public void float_(Gauge<? extends Number> gauge) {
        registry.registerWithReplacement(floatMetricName(), gauge);
    }

    public static MetricName floatMetricName() {
        return floatMetricName;
    }

    /** Gauge metric with a single tag. */
    @CheckReturnValue
    public DoubleBuilderIntStage double_() {
        return new DoubleBuilder();
    }

    /** docs. */
    @CheckReturnValue
    public IncludesDefaultTagsBuilderJavaVersionStage includesDefaultTags() {
        return new IncludesDefaultTagsBuilder();
    }

    /** docs. */
    @CheckReturnValue
    public IncludesDefaultTagsDifferentCaseBuilderJavaversionStage includesDefaultTagsDifferentCase() {
        return new IncludesDefaultTagsDifferentCaseBuilder();
    }

    @Override
    public String toString() {
        return "ReservedConflictMetrics{registry=" + registry + '}';
    }

    public interface IntBuildStage {
        @CheckReturnValue
        Histogram build();

        @CheckReturnValue
        MetricName buildMetricName();
    }

    public interface IntBuilderIntStage {
        @CheckReturnValue
        IntBuilderRegistryStage int_(@Safe String int_);
    }

    public interface IntBuilderRegistryStage {
        @CheckReturnValue
        IntBuilderLongStage registry_(@Safe String registry_);
    }

    public interface IntBuilderLongStage {
        @CheckReturnValue
        IntBuildStage long_(@Safe String long_);
    }

    private final class IntBuilder
            implements IntBuilderIntStage, IntBuilderRegistryStage, IntBuilderLongStage, IntBuildStage {
        private String int_;

        private String registry_;

        private String long_;

        @Override
        public IntBuilder int_(@Safe String int_) {
            Preconditions.checkState(this.int_ == null, "int is already set");
            this.int_ = Preconditions.checkNotNull(int_, "int is required");
            return this;
        }

        @Override
        public IntBuilder registry_(@Safe String registry_) {
            Preconditions.checkState(this.registry_ == null, "registry is already set");
            this.registry_ = Preconditions.checkNotNull(registry_, "registry is required");
            return this;
        }

        @Override
        public IntBuilder long_(@Safe String long_) {
            Preconditions.checkState(this.long_ == null, "long is already set");
            this.long_ = Preconditions.checkNotNull(long_, "long is required");
            return this;
        }

        @Override
        public Histogram build() {
            return registry.histogram(buildMetricName());
        }

        @Override
        public MetricName buildMetricName() {
            return MetricName.builder()
                    .safeName("reserved.conflict.int")
                    .putSafeTags("int", int_)
                    .putSafeTags("registry", registry_)
                    .putSafeTags("long", long_)
                    .putSafeTags("libraryName", LIBRARY_NAME)
                    .putSafeTags("libraryVersion", LIBRARY_VERSION)
                    .putSafeTags("javaVersion", JAVA_VERSION)
                    .build();
        }
    }

    public interface DoubleBuildStage {
        void build(Gauge<? extends Number> gauge);

        @CheckReturnValue
        MetricName buildMetricName();
    }

    public interface DoubleBuilderIntStage {
        @CheckReturnValue
        DoubleBuildStage int_(@Safe String int_);
    }

    private final class DoubleBuilder implements DoubleBuilderIntStage, DoubleBuildStage {
        private String int_;

        @Override
        public DoubleBuilder int_(@Safe String int_) {
            Preconditions.checkState(this.int_ == null, "int is already set");
            this.int_ = Preconditions.checkNotNull(int_, "int is required");
            return this;
        }

        @Override
        public void build(Gauge<? extends Number> gauge) {
            registry.registerWithReplacement(buildMetricName(), gauge);
        }

        @Override
        public MetricName buildMetricName() {
            return MetricName.builder()
                    .safeName("reserved.conflict.double")
                    .putSafeTags("int", int_)
                    .putSafeTags("libraryName", LIBRARY_NAME)
                    .putSafeTags("libraryVersion", LIBRARY_VERSION)
                    .putSafeTags("javaVersion", JAVA_VERSION)
                    .build();
        }
    }

    public interface IncludesDefaultTagsBuildStage {
        @CheckReturnValue
        Meter build();

        @CheckReturnValue
        MetricName buildMetricName();
    }

    public interface IncludesDefaultTagsBuilderJavaVersionStage {
        @CheckReturnValue
        IncludesDefaultTagsBuilderLibraryNameStage javaVersion(@Safe String javaVersion);
    }

    public interface IncludesDefaultTagsBuilderLibraryNameStage {
        @CheckReturnValue
        IncludesDefaultTagsBuilderLibraryVersionStage libraryName(@Safe String libraryName);
    }

    public interface IncludesDefaultTagsBuilderLibraryVersionStage {
        @CheckReturnValue
        IncludesDefaultTagsBuildStage libraryVersion(@Safe String libraryVersion);
    }

    private final class IncludesDefaultTagsBuilder
            implements IncludesDefaultTagsBuilderJavaVersionStage,
                    IncludesDefaultTagsBuilderLibraryNameStage,
                    IncludesDefaultTagsBuilderLibraryVersionStage,
                    IncludesDefaultTagsBuildStage {
        private String javaVersion;

        private String libraryName;

        private String libraryVersion;

        @Override
        public IncludesDefaultTagsBuilder javaVersion(@Safe String javaVersion) {
            Preconditions.checkState(this.javaVersion == null, "javaVersion is already set");
            this.javaVersion = Preconditions.checkNotNull(javaVersion, "javaVersion is required");
            return this;
        }

        @Override
        public IncludesDefaultTagsBuilder libraryName(@Safe String libraryName) {
            Preconditions.checkState(this.libraryName == null, "libraryName is already set");
            this.libraryName = Preconditions.checkNotNull(libraryName, "libraryName is required");
            return this;
        }

        @Override
        public IncludesDefaultTagsBuilder libraryVersion(@Safe String libraryVersion) {
            Preconditions.checkState(this.libraryVersion == null, "libraryVersion is already set");
            this.libraryVersion = Preconditions.checkNotNull(libraryVersion, "libraryVersion is required");
            return this;
        }

        @Override
        public Meter build() {
            return registry.meter(buildMetricName());
        }

        @Override
        public MetricName buildMetricName() {
            return MetricName.builder()
                    .safeName("reserved.conflict.includes.default.tags")
                    .putSafeTags("javaVersion", javaVersion)
                    .putSafeTags("libraryName", libraryName)
                    .putSafeTags("libraryVersion", libraryVersion)
                    .build();
        }
    }

    public interface IncludesDefaultTagsDifferentCaseBuildStage {
        @CheckReturnValue
        Meter build();

        @CheckReturnValue
        MetricName buildMetricName();
    }

    public interface IncludesDefaultTagsDifferentCaseBuilderJavaversionStage {
        @CheckReturnValue
        IncludesDefaultTagsDifferentCaseBuilderLibrarynameStage javaversion(@Safe String javaversion);
    }

    public interface IncludesDefaultTagsDifferentCaseBuilderLibrarynameStage {
        @CheckReturnValue
        IncludesDefaultTagsDifferentCaseBuilderLibraryversionStage libraryname(@Safe String libraryname);
    }

    public interface IncludesDefaultTagsDifferentCaseBuilderLibraryversionStage {
        @CheckReturnValue
        IncludesDefaultTagsDifferentCaseBuildStage libraryversion(@Safe String libraryversion);
    }

    private final class IncludesDefaultTagsDifferentCaseBuilder
            implements IncludesDefaultTagsDifferentCaseBuilderJavaversionStage,
                    IncludesDefaultTagsDifferentCaseBuilderLibrarynameStage,
                    IncludesDefaultTagsDifferentCaseBuilderLibraryversionStage,
                    IncludesDefaultTagsDifferentCaseBuildStage {
        private String javaversion;

        private String libraryname;

        private String libraryversion;

        @Override
        public IncludesDefaultTagsDifferentCaseBuilder javaversion(@Safe String javaversion) {
            Preconditions.checkState(this.javaversion == null, "javaversion is already set");
            this.javaversion = Preconditions.checkNotNull(javaversion, "javaversion is required");
            return this;
        }

        @Override
        public IncludesDefaultTagsDifferentCaseBuilder libraryname(@Safe String libraryname) {
            Preconditions.checkState(this.libraryname == null, "libraryname is already set");
            this.libraryname = Preconditions.checkNotNull(libraryname, "libraryname is required");
            return this;
        }

        @Override
        public IncludesDefaultTagsDifferentCaseBuilder libraryversion(@Safe String libraryversion) {
            Preconditions.checkState(this.libraryversion == null, "libraryversion is already set");
            this.libraryversion = Preconditions.checkNotNull(libraryversion, "libraryversion is required");
            return this;
        }

        @Override
        public Meter build() {
            return registry.meter(buildMetricName());
        }

        @Override
        public MetricName buildMetricName() {
            return MetricName.builder()
                    .safeName("reserved.conflict.includes.default.tags.different.case")
                    .putSafeTags("javaversion", javaversion)
                    .putSafeTags("libraryname", libraryname)
                    .putSafeTags("libraryversion", libraryversion)
                    .build();
        }
    }
}
