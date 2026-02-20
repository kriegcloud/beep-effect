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

package com.palantir.metric.schema.markdown;

import static org.assertj.core.api.Assertions.assertThat;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.palantir.metric.schema.Documentation;
import com.palantir.metric.schema.MetricDefinition;
import com.palantir.metric.schema.MetricNamespace;
import com.palantir.metric.schema.MetricSchema;
import com.palantir.metric.schema.MetricType;
import com.palantir.metric.schema.TagDefinition;
import com.palantir.metric.schema.TagValue;
import org.junit.jupiter.api.Test;

class MarkdownRendererTest {

    @SuppressWarnings("for-rollout:StringConcatToTextBlock")
    @Test
    void testSimple() {
        MetricSchema firstSchema = MetricSchema.builder()
                .namespaces(
                        "namespace",
                        MetricNamespace.builder()
                                .docs(Documentation.of("namespace docs"))
                                .metrics(
                                        "metric",
                                        MetricDefinition.builder()
                                                .type(MetricType.METER)
                                                .docs(Documentation.of("metric docs"))
                                                .build())
                                .build())
                .namespaces(
                        "anamespace",
                        MetricNamespace.builder()
                                .docs(Documentation.of("namespace docs"))
                                .metrics(
                                        "metric",
                                        MetricDefinition.builder()
                                                .type(MetricType.METER)
                                                .docs(Documentation.of("metric docs"))
                                                .build())
                                .build())
                .build();
        MetricSchema secondSchema = MetricSchema.builder()
                .namespaces(
                        "secondSchema",
                        MetricNamespace.builder()
                                .docs(Documentation.of("namespace docs"))
                                .metrics(
                                        "metric",
                                        MetricDefinition.builder()
                                                .type(MetricType.METER)
                                                .docs(Documentation.of("metric docs"))
                                                .build())
                                .build())
                .build();
        String firstMarkdown = MarkdownRenderer.render(
                "com.palantir:test",
                ImmutableMap.of("com.palantir:test:1.0.0", ImmutableList.of(firstSchema, secondSchema)));
        String secondMarkdown = MarkdownRenderer.render(
                "com.palantir:test",
                ImmutableMap.of(
                        "com.palantir:test:1.0.0",
                        // reverse order should produce the same results
                        ImmutableList.of(secondSchema, firstSchema)));
        assertThat(firstMarkdown)
                .isEqualTo("# Metrics\n"
                        + "\n"
                        + "## Test\n"
                        + "\n"
                        + "`com.palantir:test`\n"
                        + "\n"
                        + "### anamespace\n"
                        + "namespace docs\n"
                        + "- `anamespace.metric` (meter): metric docs\n"
                        + "\n"
                        + "### namespace\n"
                        + "namespace docs\n"
                        + "- `namespace.metric` (meter): metric docs\n"
                        + "\n"
                        + "### secondSchema\n"
                        + "namespace docs\n"
                        + "- `secondSchema.metric` (meter): metric docs")
                .isEqualTo(secondMarkdown);
    }

    @SuppressWarnings("for-rollout:StringConcatToTextBlock")
    @Test
    void testMultipleNamespacesWithSameName() {
        MetricSchema firstSchema = MetricSchema.builder()
                .namespaces(
                        "namespace",
                        MetricNamespace.builder()
                                .docs(Documentation.of("namespace docs"))
                                .metrics(
                                        "metric1",
                                        MetricDefinition.builder()
                                                .type(MetricType.METER)
                                                .docs(Documentation.of("metric docs 1"))
                                                .build())
                                .build())
                .build();
        MetricSchema secondSchema = MetricSchema.builder()
                .namespaces(
                        "namespace",
                        MetricNamespace.builder()
                                .docs(Documentation.of("namespace docs"))
                                .metrics(
                                        "metric2",
                                        MetricDefinition.builder()
                                                .type(MetricType.METER)
                                                .docs(Documentation.of("metric docs 2"))
                                                .build())
                                .build())
                .build();
        String firstMarkdown = MarkdownRenderer.render(
                "com.palantir:test",
                ImmutableMap.of("com.palantir:test:1.0.0", ImmutableList.of(firstSchema, secondSchema)));
        String secondMarkdown = MarkdownRenderer.render(
                "com.palantir:test",
                ImmutableMap.of(
                        "com.palantir:test:1.0.0",
                        // reverse order should produce the same results
                        ImmutableList.of(secondSchema, firstSchema)));
        assertThat(firstMarkdown)
                .isEqualTo("# Metrics\n"
                        + "\n"
                        + "## Test\n"
                        + "\n"
                        + "`com.palantir:test`\n"
                        + "\n"
                        + "### namespace\n"
                        + "namespace docs\n"
                        + "- `namespace.metric1` (meter): metric docs 1\n"
                        + "\n"
                        + "### namespace\n"
                        + "namespace docs\n"
                        + "- `namespace.metric2` (meter): metric docs 2")
                .isEqualTo(secondMarkdown);
    }

    @SuppressWarnings("for-rollout:StringConcatToTextBlock")
    @Test
    void testTagged() {
        String markdown = MarkdownRenderer.render(
                "com.palantir:test",
                ImmutableMap.of(
                        "com.palantir:test:1.0.0",
                        ImmutableList.of(MetricSchema.builder()
                                .namespaces(
                                        "namespace",
                                        MetricNamespace.builder()
                                                .docs(Documentation.of("namespace docs"))
                                                .metrics(
                                                        "metric",
                                                        MetricDefinition.builder()
                                                                .type(MetricType.METER)
                                                                .tags("service")
                                                                .tags("endpoint")
                                                                .docs(Documentation.of("metric docs"))
                                                                .build())
                                                .build())
                                .build())));
        assertThat(markdown)
                .isEqualTo("# Metrics\n"
                        + "\n"
                        + "## Test\n"
                        + "\n"
                        + "`com.palantir:test`\n"
                        + "\n"
                        + "### namespace\n"
                        + "namespace docs\n"
                        + "- `namespace.metric` tagged `service`, `endpoint` (meter): metric docs");
    }

    @SuppressWarnings("for-rollout:StringConcatToTextBlock")
    @Test
    void testComplexTagged() {
        MetricSchema schema = MetricSchema.builder()
                .namespaces(
                        "namespace",
                        MetricNamespace.builder()
                                .docs(Documentation.of("namespace docs"))
                                .tags(TagDefinition.builder()
                                        .name("namespaceTag")
                                        .build())
                                .metrics(
                                        "metric",
                                        MetricDefinition.builder()
                                                .type(MetricType.METER)
                                                .tagDefinitions(TagDefinition.builder()
                                                        .name("result")
                                                        .values(TagValue.of(
                                                                "success", Documentation.of("This is a success enum")))
                                                        .values(TagValue.builder()
                                                                .value("failure")
                                                                .build())
                                                        .build())
                                                .tagDefinitions(TagDefinition.builder()
                                                        .name("endpoint")
                                                        .docs(Documentation.of("Some docs"))
                                                        .build())
                                                .tagDefinitions(TagDefinition.builder()
                                                        .name("processing")
                                                        .values(TagValue.builder()
                                                                .value("foo")
                                                                .build())
                                                        .values(TagValue.builder()
                                                                .value("bar")
                                                                .build())
                                                        .build())
                                                .docs(Documentation.of("metric docs"))
                                                .build())
                                .build())
                .build();
        String markdown = MarkdownRenderer.render(
                "com.palantir:test", ImmutableMap.of("com.palantir:test:1.0.0", ImmutableList.of(schema)));
        assertThat(markdown)
                .isEqualTo("# Metrics\n"
                        + "\n"
                        + "## Test\n"
                        + "\n"
                        + "`com.palantir:test`\n"
                        + "\n"
                        + "### namespace\n"
                        + "namespace docs\n"
                        + "- `namespace.metric` (meter): metric docs\n"
                        + "  - `namespaceTag`\n"
                        + "  - `result`\n"
                        + "    - `success`: This is a success enum\n"
                        + "    - `failure`\n"
                        + "  - `endpoint`: Some docs\n"
                        + "  - `processing` values (`foo`,`bar`)");
    }

    @SuppressWarnings("for-rollout:StringConcatToTextBlock")
    @Test
    void testTaggedWithDocsOnlyOnTag() {
        MetricSchema schema = MetricSchema.builder()
                .namespaces(
                        "namespace",
                        MetricNamespace.builder()
                                .docs(Documentation.of("namespace docs"))
                                .metrics(
                                        "metric",
                                        MetricDefinition.builder()
                                                .type(MetricType.METER)
                                                .tagDefinitions(TagDefinition.builder()
                                                        .name("result")
                                                        .docs(Documentation.of("This is a result tag"))
                                                        .build())
                                                .docs(Documentation.of("metric docs"))
                                                .build())
                                .build())
                .build();
        String markdown = MarkdownRenderer.render(
                "com.palantir:test", ImmutableMap.of("com.palantir:test:1.0.0", ImmutableList.of(schema)));
        assertThat(markdown)
                .isEqualTo("# Metrics\n\n"
                        + "## Test\n\n"
                        + "`com.palantir:test`\n\n"
                        + "### namespace\n"
                        + "namespace docs\n"
                        + "- `namespace.metric` (meter): metric docs\n"
                        + "  - `result`: This is a result tag");
    }

    @SuppressWarnings("for-rollout:StringConcatToTextBlock")
    @Test
    void testEmptyNamespacesExcluded() {
        String markdown = MarkdownRenderer.render(
                "com.palantir:test",
                ImmutableMap.of(
                        "com.palantir:test",
                        ImmutableList.of(MetricSchema.builder()
                                .namespaces(
                                        "com.foo.namespace",
                                        MetricNamespace.builder()
                                                .docs(Documentation.of("Foo namespace docs"))
                                                .metrics(
                                                        "metric",
                                                        MetricDefinition.builder()
                                                                .type(MetricType.METER)
                                                                .docs(Documentation.of("metric docs"))
                                                                .build())
                                                .build())
                                .namespaces(
                                        "empty",
                                        MetricNamespace.builder()
                                                .docs(Documentation.of("empty namespace docs"))
                                                .build())
                                .build())));
        assertThat(markdown)
                .isEqualTo("# Metrics\n"
                        + "\n"
                        + "## Test\n"
                        + "\n"
                        + "`com.palantir:test`\n"
                        + "\n"
                        + "### com.foo.namespace\n"
                        + "Foo namespace docs\n"
                        + "- `com.foo.namespace.metric` (meter): metric docs");
    }

    @Test
    void testGetName() {
        assertThat(MarkdownRenderer.getName("com.palantir.foo:bar-baz:123.4.5")).isEqualTo("bar-baz");
        assertThat(MarkdownRenderer.getName("com.palantir.foo:bar-baz:$projectVersion"))
                .isEqualTo("bar-baz");
        assertThat(MarkdownRenderer.getName("com.palantir.foo:bar-baz")).isEqualTo("bar-baz");
    }

    @Test
    void testGetGroupArtifact() {
        assertThat(MarkdownRenderer.getGroupArtifact("com.palantir.foo:bar-baz:123.4.5"))
                .isEqualTo("com.palantir.foo:bar-baz");
        assertThat(MarkdownRenderer.getGroupArtifact("com.palantir.foo:bar-baz:$projectVersion"))
                .isEqualTo("com.palantir.foo:bar-baz");
        assertThat(MarkdownRenderer.getGroupArtifact("com.palantir.foo:bar-baz"))
                .isEqualTo("com.palantir.foo:bar-baz");
    }

    @Test
    void testGetGroup() {
        assertThat(MarkdownRenderer.getGroup("com.palantir.foo:bar-baz:123.4.5"))
                .isEqualTo("com.palantir.foo");
        assertThat(MarkdownRenderer.getGroup("com.palantir.foo:bar-baz:$projectVersion"))
                .isEqualTo("com.palantir.foo");
        assertThat(MarkdownRenderer.getGroup("com.palantir.foo:bar-baz")).isEqualTo("com.palantir.foo");
    }

    @Test
    void testGetDisplayName() {
        assertThat(MarkdownRenderer.displayName("bar-baz")).isEqualTo("Bar Baz");
        assertThat(MarkdownRenderer.displayName("bar.baz")).isEqualTo("Bar Baz");
    }

    @Test
    void testCoordinateComparator() {
        assertThat("com.palantir.foo:name")
                .usingComparator(new MarkdownRenderer.CoordinateComparator("com.unknown:name"))
                .isGreaterThan("com.palantir.bar:name");
        assertThat("com.palantir.foo:name")
                .usingComparator(new MarkdownRenderer.CoordinateComparator("com.palantir.foo:name2"))
                .isLessThan("com.palantir.bar:name");
        assertThat("com.palantir.foo:a")
                .usingComparator(new MarkdownRenderer.CoordinateComparator("com.palantir.foo:any"))
                .isLessThan("com.palantir.foo:b");
        assertThat("com.palantir.foo:b")
                .usingComparator(new MarkdownRenderer.CoordinateComparator("com.palantir.foo:any"))
                .isGreaterThan("com.palantir.foo:a");
    }
}
