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

package com.palantir.metric.schema;

import com.codahale.metrics.Gauge;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableSortedSet;
import com.google.common.collect.Iterables;
import com.google.errorprone.annotations.CheckReturnValue;
import com.palantir.logsafe.Preconditions;
import com.palantir.logsafe.Safe;
import com.palantir.metric.schema.model.BuilderStage;
import com.palantir.metric.schema.model.ImplementationVisibility;
import com.palantir.metric.schema.model.StagedBuilderSpec;
import com.palantir.tritium.metrics.registry.MetricName;
import com.palantir.tritium.metrics.registry.TaggedMetricRegistry;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.CodeBlock;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeSpec;
import com.squareup.javapoet.WildcardTypeName;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
import javax.lang.model.element.Modifier;

final class UtilityGenerator {

    static JavaFile generateUtilityClass(
            String namespace,
            MetricNamespace metrics,
            Optional<String> libraryName,
            Optional<String> libraryVersion,
            String packageName,
            ImplementationVisibility visibility) {
        String name = metrics.getShortName().orElse(namespace);
        ClassName className = ClassName.get(packageName, className(name));
        TypeSpec.Builder builder = TypeSpec.classBuilder(className.simpleName())
                .addModifiers(visibility.apply(Modifier.FINAL))
                .addJavadoc(Javadoc.render(metrics.getDocs()))
                .addField(TaggedMetricRegistry.class, ReservedNames.REGISTRY_NAME, Modifier.PRIVATE, Modifier.FINAL)
                .addField(FieldSpec.builder(
                                String.class,
                                ReservedNames.JAVA_VERSION_FIELD,
                                Modifier.PRIVATE,
                                Modifier.STATIC,
                                Modifier.FINAL)
                        .initializer("$T.getProperty($S, $S)", System.class, "java.version", "unknown")
                        .build());

        if (libraryName.isPresent()) {
            builder.addField(FieldSpec.builder(
                            String.class,
                            ReservedNames.LIBRARY_NAME_FIELD,
                            Modifier.PRIVATE,
                            Modifier.STATIC,
                            Modifier.FINAL)
                    .initializer("$S", libraryName.get())
                    .build());
            builder.addField(FieldSpec.builder(
                            String.class,
                            ReservedNames.LIBRARY_VERSION_FIELD,
                            Modifier.PRIVATE,
                            Modifier.STATIC,
                            Modifier.FINAL)
                    .initializer(libraryVersion
                            // When a libraryVersion value is provided, use the string constant:
                            .map(version -> CodeBlock.of("$S", version))
                            // Otherwise fall back to package.getImplementationVersion()
                            .orElseGet(() -> CodeBlock.of(
                                    "$T.requireNonNullElse($T.class.getPackage().getImplementationVersion(), $S)",
                                    Objects.class,
                                    className,
                                    "unknown")))
                    .build());
        }

        metrics.getTags().forEach(tagDef -> {
            if (tagDefinitionRequiresParam(tagDef)) {
                builder.addField(FieldSpec.builder(String.class, tagValueField(tagDef.getName()))
                        .addModifiers(Modifier.PRIVATE, Modifier.FINAL)
                        .build());
            }

            if (tagDef.getValues().size() <= 1) {
                return;
            }

            generateTagEnum(builder, name, visibility, tagDef);
        });

        metrics.getMetrics().forEach((metricName, metricDef) -> {
            if (!metricDef.getTagDefinitions().isEmpty()) {
                return;
            }

            if (metrics.getTags().isEmpty()) {
                builder.addField(FieldSpec.builder(MetricName.class, metricNameField(metricName))
                        .addModifiers(Modifier.PRIVATE, Modifier.STATIC, Modifier.FINAL)
                        .initializer(metricName(namespace, metricName, libraryName, metricDef, metrics))
                        .build());
            } else {
                builder.addField(FieldSpec.builder(MetricName.class, metricNameField(metricName))
                        .addModifiers(Modifier.PRIVATE, Modifier.FINAL)
                        .build());
            }
        });

        if (metrics.getTags().isEmpty()) {
            builder.addMethod(generateSimpleFactory(visibility, className));
        } else {
            generateFactoryBuilder(name, className, metrics, builder, visibility);
        }

        builder.addMethod(generateConstructor(name, namespace, libraryName, metrics));

        metrics.getMetrics().forEach((metricName, definition) -> {
            generateConstants(builder, metricName, definition, visibility);
            if (numArgs(definition) <= 1) {
                generateSimpleMetricFactory(
                        builder, namespace, metricName, libraryName, metrics, definition, visibility);
            } else {
                generateMetricFactoryBuilder(
                        builder, namespace, metricName, libraryName, definition, metrics, visibility);
            }
        });

        builder.addMethod(generateToString(metrics, className));

        return JavaFile.builder(className.packageName(), builder.build())
                .skipJavaLangImports(true)
                .indent("    ")
                .build();
    }

    private static MethodSpec generateSimpleFactory(ImplementationVisibility visibility, ClassName className) {
        return MethodSpec.methodBuilder(ReservedNames.FACTORY_METHOD)
                .addModifiers(visibility.apply(Modifier.STATIC))
                .addParameter(TaggedMetricRegistry.class, ReservedNames.REGISTRY_NAME)
                .addStatement(
                        "return new $T($T.checkNotNull(registry, $S))",
                        className,
                        Preconditions.class,
                        TaggedMetricRegistry.class.getSimpleName())
                .returns(className)
                .build();
    }

    /** Produce a private staged builder, which implements public interfaces. */
    private static void generateFactoryBuilder(
            String name,
            ClassName className,
            MetricNamespace metricNamespace,
            TypeSpec.Builder outerBuilder,
            ImplementationVisibility visibility1) {
        List<BuilderStage> builderStages = ImmutableList.<BuilderStage>builder()
                .add(BuilderStage.builder()
                        .name(ReservedNames.REGISTRY_NAME)
                        .sanitizedName(ReservedNames.REGISTRY_NAME)
                        .className(ClassName.get(TaggedMetricRegistry.class))
                        .build())
                .addAll(metricNamespace.getTags().stream()
                        .filter(UtilityGenerator::tagDefinitionRequiresParam)
                        .map(tagDef -> BuilderStage.builder()
                                .name(tagDef.getName())
                                .sanitizedName(Custodian.sanitizeName(tagDef.getName()))
                                .className(tagClassName(name, tagDef))
                                .build())
                        .collect(Collectors.toList()))
                .build();
        StagedBuilderSpec stagedBuilderSpec = StagedBuilderSpec.builder()
                .name(name)
                .className(className)
                .constructor(CodeBlock.of(
                        "new $T($L);",
                        className,
                        builderStages.stream()
                                .map(stage -> CodeBlock.of("$L", stage.sanitizedName()))
                                .collect(CodeBlock.joining(","))))
                .visibility(visibility1)
                .isStatic(true)
                .addAllStages(builderStages)
                .build();
        generateStagedBuilder(stagedBuilderSpec, outerBuilder);
    }

    private static void generateStagedBuilder(StagedBuilderSpec stagedBuilderSpec, TypeSpec.Builder outerBuilder) {
        MethodSpec.Builder abstractBuildMethodBuilder = MethodSpec.methodBuilder("build")
                .addModifiers(Modifier.PUBLIC, Modifier.ABSTRACT)
                .returns(stagedBuilderSpec.className());
        abstractBuildMethodBuilder.addAnnotation(CheckReturnValue.class);
        MethodSpec abstractBuildMethod = abstractBuildMethodBuilder.build();
        List<MethodSpec> abstractBuildMethods = ImmutableList.of(abstractBuildMethod);
        outerBuilder.addType(TypeSpec.interfaceBuilder(buildStage(stagedBuilderSpec.name()))
                .addModifiers(stagedBuilderSpec.visibility().apply())
                .addMethods(abstractBuildMethods)
                .build());
        for (int i = 0; i < stagedBuilderSpec.stages().size(); i++) {
            boolean lastTag = i == stagedBuilderSpec.stages().size() - 1;
            BuilderStage tag = stagedBuilderSpec.stages().get(i);
            String tagName = tag.name();
            MethodSpec.Builder methodBuilder = MethodSpec.methodBuilder(tag.sanitizedName());
            tag.docs().ifPresent(docs -> methodBuilder.addJavadoc(Javadoc.render(docs)));
            outerBuilder.addType(TypeSpec.interfaceBuilder(stageName(stagedBuilderSpec.name(), tagName))
                    .addModifiers(stagedBuilderSpec.visibility().apply())
                    .addMethod(methodBuilder
                            .addParameter(ParameterSpec.builder(tag.className(), tag.sanitizedName())
                                    .addAnnotation(Safe.class)
                                    .build())
                            .addModifiers(Modifier.PUBLIC, Modifier.ABSTRACT)
                            .addAnnotation(CheckReturnValue.class)
                            .returns(ClassName.bestGuess(
                                    lastTag
                                            ? buildStage(stagedBuilderSpec.name())
                                            : stageName(
                                                    stagedBuilderSpec.name(),
                                                    stagedBuilderSpec
                                                            .stages()
                                                            .get(i + 1)
                                                            .name())))
                            .build())
                    .build());
        }
        MethodSpec.Builder buildMethodBuilder = MethodSpec.methodBuilder("build")
                .addModifiers(Modifier.PUBLIC)
                .addAnnotation(Override.class)
                .returns(stagedBuilderSpec.className())
                .addCode("return $L", stagedBuilderSpec.constructor());
        MethodSpec buildMethod = buildMethodBuilder.build();
        List<Modifier> modifiers = new ArrayList<>();
        modifiers.addAll(List.of(Modifier.PRIVATE, Modifier.FINAL));
        if (stagedBuilderSpec.isStatic()) {
            modifiers.add(Modifier.STATIC);
        }
        outerBuilder.addType(TypeSpec.classBuilder(Custodian.anyToUpperCamel(stagedBuilderSpec.name()) + "Builder")
                .addModifiers(modifiers.toArray(new Modifier[0]))
                .addSuperinterfaces(stagedBuilderSpec.stages().stream()
                        .map(stage -> ClassName.bestGuess(stageName(stagedBuilderSpec.name(), stage.name())))
                        .collect(Collectors.toList()))
                .addSuperinterface(ClassName.bestGuess(buildStage(stagedBuilderSpec.name())))
                .addFields(stagedBuilderSpec.stages().stream()
                        .map(tag -> FieldSpec.builder(tag.className(), tag.sanitizedName(), Modifier.PRIVATE)
                                .build())
                        .collect(Collectors.toList()))
                .addMethod(buildMethod)
                .addMethods(stagedBuilderSpec.stages().stream()
                        .map(tag -> MethodSpec.methodBuilder(tag.sanitizedName())
                                .addModifiers(Modifier.PUBLIC)
                                .addAnnotation(Override.class)
                                .returns(ClassName.bestGuess(
                                        Custodian.anyToUpperCamel(stagedBuilderSpec.name()) + "Builder"))
                                .addParameter(ParameterSpec.builder(tag.className(), tag.sanitizedName())
                                        .addAnnotation(Safe.class)
                                        .build())
                                .addStatement(
                                        "$1T.checkState(this.$2L == null, $3S)",
                                        Preconditions.class,
                                        tag.sanitizedName(),
                                        tag.name() + " is already set")
                                .addStatement(
                                        "this.$1L = $2T.checkNotNull($1L, $3S)",
                                        tag.sanitizedName(),
                                        Preconditions.class,
                                        tag.name() + " is required")
                                .addStatement("return this")
                                .build())
                        .collect(Collectors.toList()))
                .build());
        MethodSpec.Builder methodBuilder = MethodSpec.methodBuilder(ReservedNames.BUILDER_METHOD)
                .addModifiers(stagedBuilderSpec.visibility().apply(Modifier.STATIC))
                .returns(ClassName.bestGuess(stageName(
                        stagedBuilderSpec.name(),
                        stagedBuilderSpec.stages().get(0).name())))
                .addAnnotation(CheckReturnValue.class)
                .addStatement(
                        "return new $T()",
                        ClassName.bestGuess(Custodian.anyToUpperCamel(stagedBuilderSpec.name()) + "Builder"));
        stagedBuilderSpec.docs().ifPresent(docs -> methodBuilder.addJavadoc(Javadoc.render(docs)));
        outerBuilder.addMethod(methodBuilder.build());
    }

    private static MethodSpec generateConstructor(
            String name, String namespace, Optional<String> libraryName, MetricNamespace metrics) {
        MethodSpec.Builder builder = MethodSpec.constructorBuilder()
                .addModifiers(Modifier.PRIVATE)
                .addParameter(TaggedMetricRegistry.class, ReservedNames.REGISTRY_NAME)
                .addStatement("this.$1L = $1L", ReservedNames.REGISTRY_NAME);

        metrics.getTags().forEach(tagDef -> {
            if (tagDefinitionRequiresParam(tagDef)) {
                builder.addParameter(tagClassName(name, tagDef), Custodian.sanitizeName(tagDef.getName()));
                if (tagDef.getValues().isEmpty()) {
                    builder.addStatement(
                            "this.$L = $L", tagValueField(tagDef.getName()), Custodian.sanitizeName(tagDef.getName()));
                } else {
                    builder.addStatement(
                            "this.$L = $L.getValue()",
                            tagValueField(tagDef.getName()),
                            Custodian.sanitizeName(tagDef.getName()));
                }
            }
        });

        metrics.getMetrics().forEach((metricName, metricDef) -> {
            if (!metricDef.getTagDefinitions().isEmpty()) {
                return;
            }

            if (!metrics.getTags().isEmpty()) {
                builder.addStatement(
                        "this.$L = $L",
                        metricNameField(metricName),
                        metricName(namespace, metricName, libraryName, metricDef, metrics));
            }
        });

        return builder.build();
    }

    private static void generateConstants(
            TypeSpec.Builder builder,
            String metricName,
            MetricDefinition definition,
            ImplementationVisibility visibility) {
        definition.getTagDefinitions().forEach(tagDef -> {
            if (tagDef.getValues().size() <= 1) {
                return;
            }

            generateTagEnum(builder, metricName, visibility, tagDef);
        });
    }

    private static void generateTagEnum(
            TypeSpec.Builder builder, String metricName, ImplementationVisibility visibility, TagDefinition tagDef) {
        TypeSpec.Builder enumBuilder = TypeSpec.enumBuilder(tagClassName(metricName, tagDef));
        tagDef.getValues().forEach(value -> {
            TypeSpec.Builder tagValueBuilder = TypeSpec.anonymousClassBuilder("$S", value.getValue());
            value.getDocs().map(Javadoc::render).ifPresent(tagValueBuilder::addJavadoc);
            enumBuilder.addEnumConstant(Custodian.anyToUpperUnderscore(value.getValue()), tagValueBuilder.build());
        });

        builder.addType(enumBuilder
                .addModifiers(visibility.apply())
                .addField(FieldSpec.builder(String.class, "value", Modifier.PRIVATE, Modifier.FINAL)
                        .build())
                .addMethod(MethodSpec.constructorBuilder()
                        .addParameter(String.class, "value")
                        .addStatement("this.value = value")
                        .build())
                .addMethod(MethodSpec.methodBuilder("getValue")
                        .addModifiers(Modifier.PRIVATE)
                        .returns(String.class)
                        .addStatement("return value")
                        .build())
                .build());
    }

    private static String className(String namespace) {
        return Custodian.anyToUpperCamel(namespace) + "Metrics";
    }

    private static CodeBlock metricName(
            String namespace,
            String metricName,
            Optional<String> libraryName,
            MetricDefinition definition,
            MetricNamespace metricNamespace) {
        String safeName = namespace + '.' + metricName;
        CodeBlock.Builder builder = CodeBlock.builder().add("$T.builder().safeName($S)", MetricName.class, safeName);
        metricNamespace.getTags().forEach(tagDef -> {
            if (tagDef.getValues().size() != 1) {
                builder.add(".putSafeTags($S, $L)", tagDef.getName(), tagValueField(tagDef.getName()));
            } else {
                builder.add(
                        ".putSafeTags($S, $S)",
                        tagDef.getName(),
                        Iterables.getOnlyElement(tagDef.getValues()).getValue());
            }
        });

        definition.getTagDefinitions().forEach(tagDef -> putSafeTags(tagDef, builder));
        ImmutableSortedSet<String> insensitiveTags = insensitiveTags(definition);
        if (libraryName.isPresent()) {
            if (!insensitiveTags.contains(ReservedNames.LIBRARY_NAME_TAG)) {
                builder.add(".putSafeTags($S, $L)", ReservedNames.LIBRARY_NAME_TAG, ReservedNames.LIBRARY_NAME_FIELD);
            }
            if (!insensitiveTags.contains(ReservedNames.LIBRARY_VERSION_TAG)) {
                builder.add(
                        ".putSafeTags($S, $L)", ReservedNames.LIBRARY_VERSION_TAG, ReservedNames.LIBRARY_VERSION_FIELD);
            }
        }
        if (!insensitiveTags.contains(ReservedNames.JAVA_VERSION_TAG)) {
            builder.add(".putSafeTags($S, $L)", ReservedNames.JAVA_VERSION_TAG, ReservedNames.JAVA_VERSION_FIELD);
        }
        return builder.add(".build()").build();
    }

    private static void putSafeTags(TagDefinition tagDef, CodeBlock.Builder builder) {
        if (tagDef.getValues().isEmpty()) {
            builder.add(".putSafeTags($S, $L)", tagDef.getName(), Custodian.sanitizeName(tagDef.getName()));
        } else if (tagDef.getValues().size() == 1) {
            builder.add(
                    ".putSafeTags($S, $S)",
                    tagDef.getName(),
                    Iterables.getOnlyElement(tagDef.getValues()).getValue());
        } else {
            builder.add(".putSafeTags($S, $L.getValue())", tagDef.getName(), Custodian.sanitizeName(tagDef.getName()));
        }
    }

    private static ImmutableSortedSet<String> insensitiveTags(MetricDefinition definition) {
        return definition.getTagDefinitions().stream()
                .map(TagDefinition::getName)
                .collect(ImmutableSortedSet.toImmutableSortedSet(String.CASE_INSENSITIVE_ORDER));
    }

    private static MethodSpec generateToString(MetricNamespace metricNamespace, ClassName className) {
        CodeBlock tagsBlock = metricNamespace.getTags().stream()
                .map(tagDef -> {
                    if (tagDef.getValues().size() != 1) {
                        return CodeBlock.of(
                                "$S + $L", String.format(", %s=", tagDef.getName()), tagValueField(tagDef.getName()));
                    } else {
                        return CodeBlock.of(
                                "$S",
                                String.format(
                                        ", %s=%s",
                                        tagDef.getName(),
                                        Iterables.getOnlyElement(tagDef.getValues())
                                                .getValue()));
                    }
                })
                .collect(CodeBlock.joining("+"));
        CodeBlock concat = tagsBlock.isEmpty() ? tagsBlock : CodeBlock.of("+ $L", tagsBlock);
        CodeBlock returnBlock = CodeBlock.of(
                "return $S + $L $L + '}'",
                String.format("%s{%s=", className.simpleName(), ReservedNames.REGISTRY_NAME),
                ReservedNames.REGISTRY_NAME,
                concat);
        return MethodSpec.methodBuilder("toString")
                .addModifiers(Modifier.PUBLIC)
                .addAnnotation(Override.class)
                .addStatement(returnBlock)
                .returns(String.class)
                .build();
    }

    private static void generateSimpleMetricFactory(
            TypeSpec.Builder outerBuilder,
            String namespace,
            String metricName,
            Optional<String> libraryName,
            MetricNamespace metricNamespace,
            MetricDefinition definition,
            ImplementationVisibility visibility) {
        boolean isGauge = MetricType.GAUGE.equals(definition.getType());

        List<ParameterSpec> parameters = definition.getTagDefinitions().stream()
                .filter(UtilityGenerator::tagDefinitionRequiresParam)
                .map(tag -> ParameterSpec.builder(tagClassName(metricName, tag), Custodian.sanitizeName(tag.getName()))
                        .addAnnotation(Safe.class)
                        .build())
                .collect(ImmutableList.toImmutableList());

        MethodSpec metricNameMethod = MethodSpec.methodBuilder(Custodian.sanitizeName(metricName + "MetricName"))
                .addModifiers(visibility.apply())
                .addModifiers(metricNamespace.getTags().isEmpty() ? List.of(Modifier.STATIC) : List.of())
                .addParameters(parameters)
                .returns(MetricName.class)
                .addCode(
                        "return $L;",
                        definition.getTagDefinitions().isEmpty()
                                ? metricNameField(metricName)
                                : metricName(namespace, metricName, libraryName, definition, metricNamespace))
                .build();

        MethodSpec.Builder methodBuilder = MethodSpec.methodBuilder(Custodian.sanitizeName(metricName))
                .addModifiers(visibility.apply())
                .returns(MetricTypes.type(definition.getType()))
                .addParameters(parameters)
                .addJavadoc(Javadoc.render(definition.getDocs()));

        CodeBlock metricNameMethodInvocation = CodeBlock.of(
                "$N($L)",
                metricNameMethod,
                CodeBlock.join(
                        parameters.stream()
                                .map(parameter -> CodeBlock.of("$N", parameter))
                                .collect(ImmutableList.toImmutableList()),
                        ","));
        if (isGauge) {
            methodBuilder.addParameter(
                    ParameterizedTypeName.get(ClassName.get(Gauge.class), WildcardTypeName.subtypeOf(Number.class)),
                    ReservedNames.GAUGE_NAME);
            // TODO(ckozak): Update to use a method which can log a warning and replace existing gauges.
            // See MetricRegistries.registerWithReplacement.
            methodBuilder.addStatement(
                    "$L.$L($L, $L)",
                    ReservedNames.REGISTRY_NAME,
                    MetricTypes.registryAccessor(definition.getType()),
                    metricNameMethodInvocation,
                    ReservedNames.GAUGE_NAME);
        } else {
            methodBuilder.addAnnotation(CheckReturnValue.class);
            methodBuilder.addStatement(
                    "return $L.$L($L)",
                    ReservedNames.REGISTRY_NAME,
                    MetricTypes.registryAccessor(definition.getType()),
                    metricNameMethodInvocation);
        }
        MethodSpec method = methodBuilder.build();

        outerBuilder.addMethod(method).addMethod(metricNameMethod);
    }

    /** Produce a private staged builder, which implements public interfaces. */
    private static void generateMetricFactoryBuilder(
            TypeSpec.Builder outerBuilder,
            String namespaceName,
            String metricName,
            Optional<String> libraryName,
            MetricDefinition definition,
            MetricNamespace metricNamespace,
            ImplementationVisibility visibility) {
        boolean isGauge = MetricType.GAUGE.equals(definition.getType());

        MethodSpec.Builder abstractBuildMethodBuilder = MethodSpec.methodBuilder("build")
                .addModifiers(Modifier.PUBLIC, Modifier.ABSTRACT)
                .returns(MetricTypes.type(definition.getType()));
        if (isGauge) {
            abstractBuildMethodBuilder.addParameter(
                    ParameterizedTypeName.get(ClassName.get(Gauge.class), WildcardTypeName.subtypeOf(Number.class)),
                    ReservedNames.GAUGE_NAME);
        } else {
            abstractBuildMethodBuilder.addAnnotation(CheckReturnValue.class);
        }
        MethodSpec abstractBuildMethod = abstractBuildMethodBuilder.build();
        MethodSpec abstractBuildMetricName = MethodSpec.methodBuilder("buildMetricName")
                .addModifiers(Modifier.PUBLIC, Modifier.ABSTRACT)
                .addAnnotation(CheckReturnValue.class)
                .returns(MetricName.class)
                .build();

        outerBuilder.addType(TypeSpec.interfaceBuilder(buildStage(metricName))
                .addModifiers(visibility.apply())
                .addMethod(abstractBuildMethod)
                .addMethod(abstractBuildMetricName)
                .build());
        ImmutableList<TagDefinition> tagList = definition.getTagDefinitions().stream()
                .filter(UtilityGenerator::tagDefinitionRequiresParam)
                .collect(ImmutableList.toImmutableList());
        for (int i = 0; i < tagList.size(); i++) {
            boolean lastTag = i == tagList.size() - 1;
            TagDefinition tag = tagList.get(i);
            String tagName = tag.getName();
            MethodSpec.Builder methodBuilder = MethodSpec.methodBuilder(Custodian.sanitizeName(tagName));
            tag.getDocs().ifPresent(docs -> methodBuilder.addJavadoc(Javadoc.render(docs)));
            outerBuilder.addType(TypeSpec.interfaceBuilder(stageName(metricName, tagName))
                    .addModifiers(visibility.apply())
                    .addMethod(methodBuilder
                            .addParameter(ParameterSpec.builder(
                                            tagClassName(metricName, tag), Custodian.sanitizeName(tagName))
                                    .addAnnotation(Safe.class)
                                    .build())
                            .addModifiers(Modifier.PUBLIC, Modifier.ABSTRACT)
                            .addAnnotation(CheckReturnValue.class)
                            .returns(ClassName.bestGuess(
                                    lastTag
                                            ? buildStage(metricName)
                                            : stageName(
                                                    metricName,
                                                    tagList.get(i + 1).getName())))
                            .build())
                    .build());
        }

        MethodSpec buildMetricName = MethodSpec.methodBuilder("buildMetricName")
                .addModifiers(Modifier.PUBLIC)
                .addAnnotation(Override.class)
                .returns(MetricName.class)
                .addStatement(
                        "return $L", metricName(namespaceName, metricName, libraryName, definition, metricNamespace))
                .build();

        MethodSpec.Builder buildMethodBuilder = MethodSpec.methodBuilder("build")
                .addModifiers(Modifier.PUBLIC)
                .addAnnotation(Override.class)
                .returns(MetricTypes.type(definition.getType()));
        if (isGauge) {
            buildMethodBuilder
                    .addParameter(
                            ParameterizedTypeName.get(
                                    ClassName.get(Gauge.class), WildcardTypeName.subtypeOf(Number.class)),
                            ReservedNames.GAUGE_NAME)
                    // TODO(ckozak): Update to use a method which can log a warning and replace existing gauges.
                    // See MetricRegistries.registerWithReplacement.
                    .addStatement(
                            "$L.$L($N(), $L)",
                            ReservedNames.REGISTRY_NAME,
                            MetricTypes.registryAccessor(definition.getType()),
                            buildMetricName,
                            ReservedNames.GAUGE_NAME);
        } else {
            buildMethodBuilder.addStatement(
                    "return $L.$L($N())",
                    ReservedNames.REGISTRY_NAME,
                    MetricTypes.registryAccessor(definition.getType()),
                    buildMetricName);
        }
        MethodSpec buildMethod = buildMethodBuilder.build();

        outerBuilder.addType(TypeSpec.classBuilder(Custodian.anyToUpperCamel(metricName) + "Builder")
                .addModifiers(Modifier.PRIVATE, Modifier.FINAL)
                .addSuperinterfaces(tagList.stream()
                        .map(tag -> ClassName.bestGuess(stageName(metricName, tag.getName())))
                        .collect(ImmutableList.toImmutableList()))
                .addSuperinterface(ClassName.bestGuess(buildStage(metricName)))
                .addFields(tagList.stream()
                        .map(tag -> FieldSpec.builder(
                                        tagClassName(metricName, tag),
                                        Custodian.sanitizeName(tag.getName()),
                                        Modifier.PRIVATE)
                                .build())
                        .collect(ImmutableList.toImmutableList()))
                .addMethods(tagList.stream()
                        .map(tag -> MethodSpec.methodBuilder(Custodian.sanitizeName(tag.getName()))
                                .addModifiers(Modifier.PUBLIC)
                                .addAnnotation(Override.class)
                                .returns(ClassName.bestGuess(Custodian.anyToUpperCamel(metricName) + "Builder"))
                                .addParameter(ParameterSpec.builder(
                                                tagClassName(metricName, tag), Custodian.sanitizeName(tag.getName()))
                                        .addAnnotation(Safe.class)
                                        .build())
                                .addStatement(
                                        "$1T.checkState(this.$2L == null, $3S)",
                                        Preconditions.class,
                                        Custodian.sanitizeName(tag.getName()),
                                        tag.getName() + " is already set")
                                .addStatement(
                                        "this.$1L = $2T.checkNotNull($1L, $3S)",
                                        Custodian.sanitizeName(tag.getName()),
                                        Preconditions.class,
                                        tag.getName() + " is required")
                                .addStatement("return this")
                                .build())
                        .collect(ImmutableList.toImmutableList()))
                .addMethod(buildMethod)
                .addMethod(buildMetricName)
                .build());
        outerBuilder.addMethod(MethodSpec.methodBuilder(Custodian.sanitizeName(metricName))
                .addModifiers(visibility.apply())
                .returns(
                        ClassName.bestGuess(stageName(metricName, tagList.get(0).getName())))
                .addAnnotation(CheckReturnValue.class)
                .addStatement("return new $T()", ClassName.bestGuess(Custodian.anyToUpperCamel(metricName) + "Builder"))
                .addJavadoc(Javadoc.render(definition.getDocs()))
                .build());
    }

    private static long numArgs(MetricDefinition definition) {
        return definition.getTagDefinitions().stream()
                        .filter(UtilityGenerator::tagDefinitionRequiresParam)
                        .count()
                // Gauges require a gauge argument.
                + (MetricType.GAUGE.equals(definition.getType()) ? 1 : 0);
    }

    private static boolean tagDefinitionRequiresParam(TagDefinition tagDefinition) {
        return tagDefinition.getValues().size() != 1;
    }

    private static ClassName tagClassName(String metricName, TagDefinition tag) {
        if (tag.getValues().isEmpty()) {
            return ClassName.get(String.class);
        }
        return ClassName.bestGuess(
                Custodian.anyToUpperCamel(metricName) + "_" + Custodian.anyToUpperCamel(tag.getName()));
    }

    private static String tagValueField(String tagName) {
        return Custodian.sanitizeName(tagName + "Value");
    }

    private static String metricNameField(String metricName) {
        return Custodian.sanitizeName(metricName + "MetricName");
    }

    private static String stageName(String metricName, String tag) {
        return Custodian.anyToUpperCamel(metricName) + "Builder" + Custodian.anyToUpperCamel(tag) + "Stage";
    }

    private static String buildStage(String metricName) {
        return Custodian.anyToUpperCamel(metricName) + "BuildStage";
    }

    private UtilityGenerator() {}
}
