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

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class CustodianTest {

    @Test
    void testSanitize_simple() {
        assertThat(Custodian.sanitizeName("simple")).isEqualTo("simple");
    }

    @Test
    void testSanitize_simpleCamel() {
        assertThat(Custodian.sanitizeName("simpleCamel")).isEqualTo("simpleCamel");
    }

    @Test
    void testSanitize_upperCamel() {
        assertThat(Custodian.sanitizeName("UpperCamel")).isEqualTo("upperCamel");
    }

    @Test
    void testSanitize_simpleNumeric() {
        assertThat(Custodian.sanitizeName("simple0")).isEqualTo("simple0");
    }

    @Test
    void testSanitize_mixed() {
        assertThat(Custodian.sanitizeName("fooBar-baz-bang")).isEqualTo("fooBarBazBang");
    }

    @Test
    void testSanitize_mixedNumeric() {
        assertThat(Custodian.sanitizeName("fooBar-baz7-bang9")).isEqualTo("fooBarBaz7Bang9");
    }

    @Test
    void testSanitize_reservedWord() {
        assertThat(Custodian.sanitizeName("for")).isEqualTo("for_");
    }

    @Test
    void testSanitize_leadingNumeric() {
        assertThat(Custodian.sanitizeName("4xx")).isEqualTo("_4xx");
    }

    @Test
    void testAnyToUpperUnderscore_lowerHyphen() {
        assertThat(Custodian.anyToUpperUnderscore("foo-bar")).isEqualTo("FOO_BAR");
    }

    @Test
    void testAnyToUpperUnderscore_lowerCamel() {
        assertThat(Custodian.anyToUpperUnderscore("fooBar")).isEqualTo("FOO_BAR");
    }

    @Test
    void testAnyToUpperUnderscore_upperCamel() {
        assertThat(Custodian.anyToUpperUnderscore("FooBar")).isEqualTo("FOO_BAR");
    }

    @Test
    void testAnyToUpperUnderscore_upperUnderscore() {
        assertThat(Custodian.anyToUpperUnderscore("FOO_BAR")).isEqualTo("FOO_BAR");
    }

    @Test
    void testAnyToUpperUnderscore_lowerUnderscore() {
        assertThat(Custodian.anyToUpperUnderscore("foo_bar")).isEqualTo("FOO_BAR");
    }

    @Test
    void testAnyToUpperUnderscore_5xx() {
        assertThat(Custodian.anyToUpperUnderscore("5xx")).isEqualTo("_5XX");
    }
}
