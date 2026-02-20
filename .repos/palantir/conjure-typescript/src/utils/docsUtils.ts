/**
 * @license
 * Copyright 2025 Palantir Technologies, Inc.
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

import { IEndpointDefinition, IEndpointError, IEnumValueDefinition, IFieldDefinition } from "conjure-api";

type DeprecatableDefinitions = IFieldDefinition | IEnumValueDefinition | IEndpointDefinition;

export const addDeprecatedToDocs = <T extends DeprecatableDefinitions>(typeDefintion: T): string | undefined => {
    if (typeDefintion.deprecated != null && typeDefintion.deprecated != null) {
        if (typeDefintion.docs != null && typeDefintion.docs != null) {
            // Do not add deprecated JSDoc if already exists
            if (typeDefintion.docs.indexOf("@deprecated") === -1) {
                return `${typeDefintion.docs}\n@deprecated ${typeDefintion.deprecated}`;
            }
        } else {
            return `@deprecated ${typeDefintion.deprecated}`;
        }
    }
    return typeDefintion.docs != null ? typeDefintion.docs : undefined;
};

export const addIncubatingToDocs = (
    endpointDefinition: IEndpointDefinition,
    existingDocs: string | undefined,
): string | undefined => {
    if (endpointDefinition.tags != null && endpointDefinition.tags.indexOf("incubating") >= 0) {
        if (existingDocs == null) {
            return "@incubating";
        } else {
            return `${existingDocs}\n@incubating`;
        }
    }
    return existingDocs;
};

export const addErrorsToDocs = (
    endpointDefinition: IEndpointDefinition,
    existingDocs: string | undefined,
): string | undefined => {
    if (endpointDefinition.errors != null && endpointDefinition.errors.length > 0) {
        if (existingDocs != null) {
            const formattedErrors = endpointDefinition.errors
                .map(error => `@throws ${formattedEndpointError(error)}`)
                .join("\n");
            return `${existingDocs}\n${formattedErrors}`;
        } else {
            return endpointDefinition.errors.map(error => `@throws ${formattedEndpointError(error)}`).join("\n");
        }
    }
    return existingDocs;
};

const formattedEndpointError = (errorDefinition: IEndpointError): string => {
    let formattedString = `{I${errorDefinition.error.name}}`;
    if (errorDefinition.docs != null && errorDefinition.docs != null) {
        formattedString += ` ${errorDefinition.docs}`;
    }
    return formattedString;
};
