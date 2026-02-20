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

package com.palantir.metric.schema;

import static org.assertj.core.api.Assertions.assertThat;

import com.google.common.base.CaseFormat;
import org.junit.jupiter.api.Test;

class CaseFormatsTest {

    @Test
    void testLowerCamel() {
        assertThat(CaseFormats.estimate("fooBar")).hasValue(CaseFormat.LOWER_CAMEL);
    }

    @Test
    void testUpperCamel() {
        assertThat(CaseFormats.estimate("FooBar")).hasValue(CaseFormat.UPPER_CAMEL);
    }

    @Test
    void testLowerUnderscore() {
        assertThat(CaseFormats.estimate("foo_bar")).hasValue(CaseFormat.LOWER_UNDERSCORE);
    }

    @Test
    void testUpperUnderscore() {
        assertThat(CaseFormats.estimate("FOO_BAR")).hasValue(CaseFormat.UPPER_UNDERSCORE);
    }

    @Test
    void testLowerHyphen() {
        assertThat(CaseFormats.estimate("foo-bar")).hasValue(CaseFormat.LOWER_HYPHEN);
    }

    // edge cases

    @Test
    void testEmptyString() {
        assertThat(CaseFormats.estimate("")).isEmpty();
    }

    @Test
    void testUpperHyphen() {
        assertThat(CaseFormats.estimate("FOO-BAR")).isEmpty();
    }

    @Test
    void testNumeric5xx() {
        assertThat(CaseFormats.estimate("5xx")).hasValue(CaseFormat.LOWER_UNDERSCORE);
    }
}
