/**
 * @license
 * Copyright 2018 Palantir Technologies, Inc.
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

import { IConjureDefinition, ITypeDefinition } from "conjure-api";
import * as fs from "fs-extra";
import * as _ from "lodash";
import * as path from "path";
import { IServiceGenerationFlags } from "../../types/serviceGenerationFlags";
import { ITypeGenerationFlags } from "../../types/typeGenerationFlags";
import { directoryNameForType } from "../../utils/fileUtils";
import { createHashableTypeName, disassembleHashableTypeName } from "../../utils/hashingUtils";
import { generateError } from "./generators/generateError";
import { generateNonThrowingService } from "./generators/generateNonThrowingService";
import { generateThrowingService } from "./generators/generateThrowingService";
import { generateType } from "./generators/generateType";
import { SimpleAst } from "./simpleAst";
import { validateServiceNames } from "./validators/validateServiceNames";

export async function generate(
    definition: IConjureDefinition,
    outDir: string,
    typeGenerationFlags: ITypeGenerationFlags,
    serviceGenerationFlags: IServiceGenerationFlags,
) {
    // Create project structure
    const knownTypes = computeKnownTypes(definition.types);

    // Add the errors to knownTypes so they can be imported by services
    definition.errors.forEach(errorDefinition =>
        knownTypes.set(
            createHashableTypeName(errorDefinition.errorName),
            ITypeDefinition.object({
                typeName: errorDefinition.errorName,
                docs: errorDefinition.docs,
                fields: [], // We don't need to know an error's fields to import an error
            }),
        ),
    );

    // Validate service names if user wants to generate throwing an non-throwing services
    validateServiceNames(definition.services, serviceGenerationFlags);

    const knownDefinitions = Array.from(knownTypes.keys())
        .map(disassembleHashableTypeName)
        .concat(definition.services.map(serviceDefinition => serviceDefinition.serviceName))
        .concat(definition.errors.map(errorDefinition => errorDefinition.errorName));
    await Promise.all(
        _.uniqBy(knownDefinitions, ({ package: packageName }) => packageName).map(typeName => {
            const modulePath = path.join(outDir, directoryNameForType(typeName));
            if (fs.existsSync(modulePath)) {
                fs.removeSync(modulePath);
            }
            return fs.mkdirp(modulePath);
        }),
    );

    const promises: Array<Promise<any>> = [];
    const simpleAst = new SimpleAst(outDir);

    if (serviceGenerationFlags.generateThrowingServices) {
        definition.services.forEach(serviceDefinition =>
            promises.push(generateThrowingService(serviceDefinition, knownTypes, simpleAst, typeGenerationFlags)),
        );
    }

    if (serviceGenerationFlags.generateNonThrowingServices) {
        definition.services.forEach(serviceDefinition =>
            promises.push(generateNonThrowingService(serviceDefinition, knownTypes, simpleAst, typeGenerationFlags)),
        );
    }

    definition.types.forEach(typeDefinition =>
        promises.push(generateType(typeDefinition, knownTypes, simpleAst, typeGenerationFlags)),
    );

    definition.errors.forEach(errorDefinition =>
        promises.push(generateError(errorDefinition, knownTypes, simpleAst, typeGenerationFlags)),
    );

    promises.push(simpleAst.generateIndexFiles());
    return Promise.all(promises)
        .then(() => {
            return;
        })
        .catch(e => {
            fs.removeSync(outDir);
            throw e;
        });
}

const computeKnownTypes = (types: ITypeDefinition[]): Map<string, ITypeDefinition> => {
    return types.reduce((knownTypes, typeDefinition) => {
        switch (typeDefinition.type) {
            case "alias":
                knownTypes.set(
                    createHashableTypeName(typeDefinition.alias.typeName),
                    ITypeDefinition.alias(typeDefinition.alias),
                );
                break;
            case "enum":
                knownTypes.set(
                    createHashableTypeName(typeDefinition.enum.typeName),
                    ITypeDefinition.enum_(typeDefinition.enum),
                );
                break;
            case "object":
                knownTypes.set(
                    createHashableTypeName(typeDefinition.object.typeName),
                    ITypeDefinition.object(typeDefinition.object),
                );
                break;
            case "union":
                knownTypes.set(
                    createHashableTypeName(typeDefinition.union.typeName),
                    ITypeDefinition.union(typeDefinition.union),
                );
                break;
        }
        return knownTypes;
    }, new Map<string, ITypeDefinition>());
};
