/*
 * (c) Copyright 2022 Palantir Technologies Inc. All rights reserved.
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

package com.palantir.metric.schema.model;

import com.palantir.metric.schema.Documentation;
import com.squareup.javapoet.ClassName;
import java.util.Optional;
import org.immutables.value.Value;

@Value.Immutable
@ImmutablesStagedStyle
public interface BuilderStage {

    String name();

    String sanitizedName();

    ClassName className();

    Optional<Documentation> docs();

    static ImmutableBuilderStage.NameBuildStage builder() {
        return ImmutableBuilderStage.builder();
    }
}
