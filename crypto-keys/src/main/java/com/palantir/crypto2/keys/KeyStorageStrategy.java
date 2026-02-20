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

package com.palantir.crypto2.keys;

/**
 * The strategy used to store the per file {@link KeyMaterial} used for encryption operations.
 */
public interface KeyStorageStrategy {

    /**
     * Stores the {@link KeyMaterial} for a file with the given {@code fileKey}.
     */
    void put(String fileKey, KeyMaterial keyMaterial);

    /**
     * Retrieves the {@link KeyMaterial} for a file with the given {@code fileKey}.
     */
    KeyMaterial get(String fileKey);

    /**
     * Removes the {@link KeyMaterial} for a file with the given {@code fileKey}.
     */
    void remove(String fileKey);
}
