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

import com.google.common.collect.HashMultiset;
import com.google.common.collect.Multiset;
import com.google.errorprone.annotations.CompileTimeConstant;
import com.palantir.logsafe.Arg;
import com.palantir.logsafe.Preconditions;
import com.palantir.logsafe.SafeArg;
import com.palantir.metric.schema.Documentation;
import com.palantir.metric.schema.MetricNamespace;
import com.palantir.metric.schema.MetricSchema;
import com.palantir.metric.schema.MetricType;
import com.palantir.metric.schema.TagDefinition;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import org.apache.commons.lang3.StringUtils;

final class Validator {

    private static final String SHORT_NAME_PATTERN = "[A-Z][a-zA-Z0-9]+";
    private static final String NAME_SEGMENT_PATTERN = "[a-z0-9][a-zA-Z0-9\\-]*";
    private static final String LAST_NAME_SEGMENT_PATTERN = "[a-zA-Z0-9][a-zA-Z0-9\\-]*";
    private static final String NAME_PATTERN = "(" + NAME_SEGMENT_PATTERN + "\\.)*" + LAST_NAME_SEGMENT_PATTERN;
    private static final String TAG_VALUE_PATTERN = "[a-zA-Z0-9:.\\-]*";
    private static final Pattern NAME_PREDICATE = Pattern.compile(NAME_PATTERN);
    private static final Pattern SHORT_NAME_PREDICATE = Pattern.compile(SHORT_NAME_PATTERN);
    private static final Pattern TAG_VALUE_PREDICATE = Pattern.compile(TAG_VALUE_PATTERN);

    static void validate(MetricSchema schema) {
        Preconditions.checkNotNull(schema, "MetricSchema is required");
        schema.getNamespaces().forEach(Validator::validateNamespace);
    }

    private static void validateNamespace(String namespace, MetricNamespace namespaceValue) {
        Preconditions.checkArgument(
                !namespace.isEmpty(),
                "Namespace must not be empty",
                // Provide enough data to figure out which schema is missing a namespace
                SafeArg.of("namespaceValue", namespaceValue));
        Preconditions.checkArgument(
                NAME_PREDICATE.matcher(namespace).matches(),
                "Namespace must match pattern",
                SafeArg.of("pattern", NAME_PATTERN));
        validateShortName(namespaceValue);
        validateDocumentation(namespaceValue.getDocs());

        validateTagDefinitions(namespaceValue.getTags(), Set.of(), List.of(SafeArg.of("namespace", namespace)));

        namespaceValue.getMetrics().forEach((name, definition) -> {
            Preconditions.checkNotNull(definition, "MetricDefinition is required", SafeArg.of("namespace", namespace));
            Preconditions.checkArgument(
                    !name.isEmpty(), "MetricDefinition names must not be empty", SafeArg.of("namespace", namespace));
            Preconditions.checkArgument(
                    NAME_PREDICATE.matcher(name).matches(),
                    "MetricDefinition names must match pattern",
                    SafeArg.of("pattern", NAME_PATTERN),
                    SafeArg.of("invalidTagName", name));
            Preconditions.checkArgument(
                    MetricType.Value.UNKNOWN != definition.getType().get(),
                    "Unknown metric type",
                    SafeArg.of("namespace", namespace),
                    SafeArg.of("definition", definition));
            validateDocumentation(definition.getDocs());
            Preconditions.checkArgument(definition.getTags().isEmpty(), "tags field is replaced tagDefinition");

            validateTagDefinitions(
                    definition.getTagDefinitions(),
                    namespaceValue.getTags().stream()
                            .map(TagDefinition::getName)
                            .collect(Collectors.toSet()),
                    List.of(SafeArg.of("namespace", namespace), SafeArg.of("definition", definition)));
        });
    }

    private static void validateTagDefinitions(
            List<TagDefinition> tagDefinition, Set<String> namespaceTagNames, List<SafeArg<?>> errorContext) {
        Set<String> duplicateNames =
                getDuplicates(tagDefinition.stream().map(TagDefinition::getName).collect(Collectors.toList()));
        checkArgumentWithErrorContext(
                duplicateNames.isEmpty(),
                "Encountered duplicate tag names",
                errorContext,
                SafeArg.of("duplicateTagNames", duplicateNames));
        Set<String> duplicateNamespaceTagNames = tagDefinition.stream()
                .map(TagDefinition::getName)
                .filter(namespaceTagNames::contains)
                .collect(Collectors.toSet());
        checkArgumentWithErrorContext(
                duplicateNamespaceTagNames.isEmpty(),
                "Encountered metric tag names that duplicate namespace tag names",
                errorContext,
                SafeArg.of("duplicateTagNames", duplicateNames),
                SafeArg.of("namespaceTagNames", namespaceTagNames));
        tagDefinition.forEach(tag -> {
            checkArgumentWithErrorContext(!tag.getName().isEmpty(), "tag name must not be empty", errorContext);
            checkArgumentWithErrorContext(
                    NAME_PREDICATE.matcher(tag.getName()).matches(),
                    "tags names must match pattern",
                    errorContext,
                    SafeArg.of("pattern", NAME_PATTERN));
            tag.getValues()
                    .forEach(tagValue -> checkArgumentWithErrorContext(
                            TAG_VALUE_PREDICATE.matcher(tagValue.getValue()).matches(),
                            "tag values must match pattern",
                            errorContext,
                            SafeArg.of("tag", tag.getName()),
                            SafeArg.of("tagValue", tagValue),
                            SafeArg.of("pattern", TAG_VALUE_PATTERN)));
        });
    }

    private static Set<String> getDuplicates(List<String> values) {
        Multiset<String> strings = HashMultiset.create(values);
        return strings.elementSet().stream()
                .filter(element -> strings.count(element) > 1)
                .collect(Collectors.toSet());
    }

    private static void validateShortName(MetricNamespace namespace) {
        namespace
                .getShortName()
                .ifPresent(shortName -> Preconditions.checkArgument(
                        SHORT_NAME_PREDICATE.matcher(shortName).matches(),
                        "ShortName must match pattern",
                        SafeArg.of("pattern", SHORT_NAME_PATTERN),
                        SafeArg.of("invalidShortName", shortName)));
    }

    private static void validateDocumentation(Documentation documentation) {
        Preconditions.checkArgument(StringUtils.isNotBlank(documentation.get()), "Documentation must not be blank");
    }

    private static void checkArgumentWithErrorContext(
            boolean expression,
            @CompileTimeConstant String message,
            List<SafeArg<?>> errorContext,
            SafeArg<?>... args) {
        List<SafeArg<?>> allArgs = new ArrayList<>(Arrays.asList(args));
        allArgs.addAll(errorContext);
        Preconditions.checkArgument(expression, message, allArgs.toArray(new Arg[0]));
    }

    private Validator() {}
}
