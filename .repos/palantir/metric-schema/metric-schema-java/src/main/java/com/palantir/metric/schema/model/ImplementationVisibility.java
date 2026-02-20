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

import com.google.common.collect.ImmutableList;
import javax.lang.model.element.Modifier;

public enum ImplementationVisibility {

    /** Generated class will be public. */
    PUBLIC,

    /** Generate class will be package private. */
    PACKAGE_PRIVATE;

    public static ImplementationVisibility fromString(String value) {
        if (value.equals("public")) {
            return PUBLIC;
        } else if (value.equals("packagePrivate")) {
            return PACKAGE_PRIVATE;
        }
        throw new IllegalArgumentException();
    }

    public Modifier[] apply(Modifier... modifiers) {
        if (this == PUBLIC) {
            return ImmutableList.<Modifier>builderWithExpectedSize(modifiers.length + 1)
                    .add(Modifier.PUBLIC)
                    .add(modifiers)
                    .build()
                    .toArray(new Modifier[0]);
        }
        return modifiers;
    }
}
