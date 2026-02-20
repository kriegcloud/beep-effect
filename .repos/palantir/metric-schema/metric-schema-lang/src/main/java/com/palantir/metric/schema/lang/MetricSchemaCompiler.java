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

package com.palantir.metric.schema.lang;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectReader;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import com.palantir.conjure.java.serialization.ObjectMappers;
import com.palantir.logsafe.SafeArg;
import com.palantir.logsafe.exceptions.SafeUncheckedIoException;
import com.palantir.metric.schema.MetricSchema;
import java.io.File;
import java.io.IOException;
import java.nio.file.Path;

public final class MetricSchemaCompiler {
    private static final ObjectReader reader = ObjectMappers.withDefaultModules(new ObjectMapper(new YAMLFactory()))
            .readerFor(LangMetricSchema.class);

    public static MetricSchema compile(Path inputFile) {
        MetricSchema metricSchema = readFile(inputFile.toFile());
        Validator.validate(metricSchema);
        return metricSchema;
    }

    private static MetricSchema readFile(File file) {
        try {
            return LangConverter.toApi(parseRawSchema(file));
        } catch (IOException e) {
            throw new SafeUncheckedIoException("Failed to deserialize file", e, SafeArg.of("file", file));
        }
    }

    public static LangMetricSchema parseRawSchema(File inputFile) throws IOException {
        return reader.readValue(inputFile);
    }

    private MetricSchemaCompiler() {}
}
