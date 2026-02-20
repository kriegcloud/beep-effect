/*
 * (c) Copyright 2017 Palantir Technologies Inc. All rights reserved.
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

package com.palantir.crypto2.cipher;

import static com.palantir.logsafe.testing.Assertions.assertThatLoggableExceptionThrownBy;
import static org.assertj.core.api.Assertions.assertThat;

import com.google.common.collect.ImmutableList;
import com.palantir.logsafe.SafeArg;
import java.util.List;
import org.junit.jupiter.api.Test;

public final class CiphersTest {

    @Test
    public void testProvider_exists() {
        assertThat(Ciphers.getProvider()).isIn("SunJCE", "IBMJCE");
    }

    @Test
    public void testProvider_ignoresUnavailable() {
        assertThat(Ciphers.getProvider(ImmutableList.of("Invalid", "SunJCE", "IBMJCE")))
                .doesNotContain("Invalid");
    }

    @Test
    public void testProvider_noneAvailable() {
        assertThatLoggableExceptionThrownBy(() -> Ciphers.getProvider(ImmutableList.of("Invalid")))
                .isInstanceOf(IllegalStateException.class)
                .hasLogMessage("None of the acceptable JCE providers are available")
                .hasExactlyArgs(SafeArg.of("providers", List.of("Invalid")));
    }
}
