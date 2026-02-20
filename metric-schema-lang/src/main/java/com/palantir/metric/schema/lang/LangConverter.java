/*
 * (c) Copyright 2021 Palantir Technologies Inc. All rights reserved.
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

package com.palantir.metric.schema.lang;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.Maps;
import com.palantir.metric.schema.Documentation;
import com.palantir.metric.schema.MetricDefinition;
import com.palantir.metric.schema.MetricNamespace;
import com.palantir.metric.schema.MetricSchema;
import com.palantir.metric.schema.TagDefinition;
import com.palantir.metric.schema.TagValue;
import java.util.List;

final class LangConverter {
    static MetricSchema toApi(LangMetricSchema schema) {
        return MetricSchema.builder()
                .namespaces(Maps.transformValues(schema.namespaces(), LangConverter::convert))
                .options(schema.options())
                .build();
    }

    private static MetricNamespace convert(LangMetricNamespace namespace) {
        return MetricNamespace.builder()
                .shortName(namespace.shortName())
                .docs(Documentation.of(namespace.docs()))
                .tags(convert(namespace.tags()))
                .metrics(Maps.transformValues(namespace.metrics(), LangConverter::convert))
                .build();
    }

    private static MetricDefinition convert(LangMetricDefinition definition) {
        return MetricDefinition.builder()
                .type(definition.type())
                .tagDefinitions(convert(definition.tags()))
                .docs(Documentation.of(definition.docs()))
                .build();
    }

    private static List<TagDefinition> convert(List<com.palantir.metric.schema.lang.TagDefinition> tags) {
        return tags.stream()
                .map(tag -> TagDefinition.builder()
                        .name(tag.name())
                        .docs(tag.docs().map(Documentation::of))
                        .values(tag.values().stream()
                                .map(LangConverter::convert)
                                .collect(ImmutableList.toImmutableList()))
                        .build())
                .collect(ImmutableList.toImmutableList());
    }

    private static TagValue convert(com.palantir.metric.schema.lang.TagValue tagValue) {
        return TagValue.builder()
                .value(tagValue.value())
                .docs(tagValue.docs().map(Documentation::of))
                .build();
    }

    private LangConverter() {}
}
