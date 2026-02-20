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

import com.google.common.base.CaseFormat;
import com.google.common.base.CharMatcher;
import com.palantir.logsafe.Preconditions;
import java.util.Optional;

/**
 * Utility functionality for handling guava {@link CaseFormat} values.
 */
final class CaseFormats {

    private static final CharMatcher LOWER = CharMatcher.inRange('a', 'z');
    private static final CharMatcher UPPER = CharMatcher.inRange('A', 'Z');
    private static final CharMatcher HYPHEN = CharMatcher.is('-');
    private static final CharMatcher UNDERSCORE = CharMatcher.is('_');

    @SuppressWarnings("checkstyle:CyclomaticComplexity") // Easier to follow as a single method
    static Optional<CaseFormat> estimate(String input) {
        Preconditions.checkNotNull(input, "Input string is required");
        int upper = UPPER.countIn(input);
        int lower = LOWER.countIn(input);
        int hyphen = HYPHEN.countIn(input);
        int underscore = UNDERSCORE.countIn(input);
        // Undefined when no alphabetical characters are found
        if ((upper == 0 && lower == 0)
                // Undefined when both hyphens and underscores are present
                || (hyphen > 0 && underscore > 0)
                // Upper hyphen isn't real: FOO-BAR
                || (upper > 0 && hyphen > 0)) {
            return Optional.empty();
        }
        if (lower > 0 && upper > 0) {
            // Mixed case cannot be combined with underscores or hyphens.
            if (hyphen != 0 || underscore != 0) {
                return Optional.empty();
            }
            // If the first character isn't [a-zA-Z] we bias toward lower camel to match historical behavior.
            return Optional.of(UPPER.matches(input.charAt(0)) ? CaseFormat.UPPER_CAMEL : CaseFormat.LOWER_CAMEL);
        }
        // match all upper or all lower
        if (underscore == 0 && hyphen == 0) {
            return Optional.of(upper > 0 ? CaseFormat.UPPER_UNDERSCORE : CaseFormat.LOWER_UNDERSCORE);
        }

        if (underscore >= hyphen) {
            return Optional.of(lower > 0 ? CaseFormat.LOWER_UNDERSCORE : CaseFormat.UPPER_UNDERSCORE);
        }
        return Optional.of(CaseFormat.LOWER_HYPHEN);
    }

    private CaseFormats() {}
}
