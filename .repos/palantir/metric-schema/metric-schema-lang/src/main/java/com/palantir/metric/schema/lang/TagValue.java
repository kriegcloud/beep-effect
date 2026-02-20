/*
 * (c) Copyright 2023 Palantir Technologies Inc. All rights reserved.
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

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import java.io.IOException;
import java.util.Optional;
import org.immutables.value.Value.Immutable;

@Immutable
@JsonDeserialize(using = TagValue.TagValueDeserializer.class)
public interface TagValue {
    String value();

    Optional<String> docs();

    final class TagValueDeserializer extends JsonDeserializer<TagValue> {
        @Override
        @SuppressWarnings("deprecation") // internal use permitted
        public TagValue deserialize(JsonParser parser, DeserializationContext _ctxt) throws IOException {
            if (parser.currentToken() == JsonToken.VALUE_STRING) {
                String value = parser.getValueAsString();
                return ImmutableTagValue.builder().value(value).build();
            }
            return ImmutableTagValue.fromJson(parser.readValueAs(ImmutableTagValue.Json.class));
        }
    }
}
