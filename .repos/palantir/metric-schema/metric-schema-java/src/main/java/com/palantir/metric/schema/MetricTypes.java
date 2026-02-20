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

import com.codahale.metrics.Counter;
import com.codahale.metrics.Histogram;
import com.codahale.metrics.Meter;
import com.codahale.metrics.Timer;
import com.palantir.logsafe.SafeArg;
import com.palantir.logsafe.exceptions.SafeRuntimeException;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.TypeName;

final class MetricTypes {

    private static final MetricType.Visitor<TypeName> METRIC_TYPE = new MetricType.Visitor<TypeName>() {
        @Override
        public TypeName visitCounter() {
            return ClassName.get(Counter.class);
        }

        @Override
        public TypeName visitGauge() {
            return TypeName.VOID;
        }

        @Override
        public TypeName visitMeter() {
            return ClassName.get(Meter.class);
        }

        @Override
        public TypeName visitTimer() {
            return ClassName.get(Timer.class);
        }

        @Override
        public TypeName visitHistogram() {
            return ClassName.get(Histogram.class);
        }

        @Override
        public TypeName visitUnknown(String unknownValue) {
            throw new SafeRuntimeException("Unknown type", SafeArg.of("type", unknownValue));
        }
    };

    private static final MetricType.Visitor<String> REGISTRY_ACCESSOR = new MetricType.Visitor<String>() {
        @Override
        public String visitCounter() {
            return "counter";
        }

        @Override
        public String visitGauge() {
            return "registerWithReplacement";
        }

        @Override
        public String visitMeter() {
            return "meter";
        }

        @Override
        public String visitTimer() {
            return "timer";
        }

        @Override
        public String visitHistogram() {
            return "histogram";
        }

        @Override
        public String visitUnknown(String unknownValue) {
            throw new SafeRuntimeException("Unknown type", SafeArg.of("type", unknownValue));
        }
    };

    static TypeName type(MetricType type) {
        return type.accept(METRIC_TYPE);
    }

    static String registryAccessor(MetricType type) {
        return type.accept(REGISTRY_ACCESSOR);
    }

    private MetricTypes() {}
}
