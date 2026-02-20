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

package com.palantir.crypto2.hadoop;

import com.palantir.crypto2.keys.KeyMaterial;
import com.palantir.crypto2.keys.KeyStorageStrategy;
import java.util.HashMap;
import java.util.Map;

public final class InMemoryKeyStorageStrategy implements KeyStorageStrategy {

    private Map<String, KeyMaterial> store = new HashMap<>();

    public InMemoryKeyStorageStrategy() {}

    @Override
    public void put(String fileKey, KeyMaterial keyMaterial) {
        store.put(fileKey, keyMaterial);
    }

    @Override
    public KeyMaterial get(String fileKey) {
        return store.get(fileKey);
    }

    @Override
    public void remove(String fileKey) {
        if (!store.containsKey(fileKey)) {
            // Mimic how the non-test-in-memory version could throw an exception if trying to remove a non-existent key
            throw new RuntimeException(fileKey);
        }
        store.remove(fileKey);
    }
}
