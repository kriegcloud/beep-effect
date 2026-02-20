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

public class JavadocTest {

    @Test
    public void testEmptyString() {
        assertThat(Javadoc.render(Documentation.of(""))).isEmpty();
    }

    @Test
    public void testBlankString() {
        assertThat(Javadoc.render(Documentation.of(" \n "))).isEmpty();
    }

    @Test
    public void testAddsTrailingNewline() {
        assertThat(Javadoc.render(Documentation.of("Returns a Foo."))).isEqualTo("Returns a Foo.\n");
    }

    @Test
    public void testRetainsTrailingNewline() {
        assertThat(Javadoc.render(Documentation.of("Returns a Foo.\n"))).isEqualTo("Returns a Foo.\n");
    }

    @Test
    public void testRendersMarkdown() {
        assertThat(Javadoc.render(Documentation.of("Docs in _markdown_?"))).isEqualTo("Docs in <em>markdown</em>?\n");
    }

    @Test
    public void testNewlines() {
        assertThat(Javadoc.render(Documentation.of("Line one.\n\nLine two.")))
                .isEqualTo("Line one.\n<p>Line two.</p>\n");
    }

    @Test
    public void testExistingHtmlTags() {
        assertThat(Javadoc.render(Documentation.of("Line includes <em>existing</em> html.")))
                .isEqualTo("Line includes <em>existing</em> html.\n");
    }
}
