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

import com.google.common.annotations.VisibleForTesting;
import com.google.common.collect.ImmutableList;
import com.palantir.logsafe.SafeArg;
import com.palantir.logsafe.exceptions.SafeIllegalStateException;
import java.security.Security;
import java.util.List;

final class Ciphers {

    private static final ImmutableList<String> ACCEPTABLE_PROVIDERS = ImmutableList.of("SunJCE", "IBMJCE");

    private Ciphers() {}

    /**
     * Returns the first acceptable provider that is installed on the system.
     */
    static String getProvider() {
        return getProvider(ACCEPTABLE_PROVIDERS);
    }

    /**
     * Returns the first provider that is installed on the system.
     */
    @VisibleForTesting
    static String getProvider(List<String> providers) {
        for (String provider : providers) {
            if (Security.getProvider(provider) != null) {
                return provider;
            }
        }
        throw new SafeIllegalStateException(
                "None of the acceptable JCE providers are available", SafeArg.of("providers", providers));
    }
}
