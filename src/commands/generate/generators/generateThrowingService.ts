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

import { IServiceDefinition, IType, ITypeDefinition } from "conjure-api";
import {
    ImportDeclarationStructure,
    MethodDeclarationStructure,
    MethodSignatureStructure,
    ParameterDeclarationStructure,
    Scope,
    StructureKind,
    VariableDeclarationKind,
} from "ts-morph";
import { ITypeGenerationFlags } from "../../../types/typeGenerationFlags";
import { CONJURE_CLIENT_MODULE_SPECIFIER } from "../../../utils/constants";
import { addDeprecatedToDocs, addErrorsToDocs, addIncubatingToDocs } from "../../../utils/docsUtils";
import { resolveImports, resolveImportsForReferenceType, sortImports } from "../../../utils/resolveImports";
import { resolveTsType } from "../../../utils/resolveTsType";
import { SimpleAst } from "../simpleAst";
import { generateThrowingEndpoint } from "./utils/generateThrowingEndpoint";

/** Type used in the generation of the service class. Expected to be provided by conjure-client */
const HTTP_API_BRIDGE_TYPE = "IHttpApiBridge";

/** Variable names used in the generation of the service class. */
const BRIDGE = "bridge";
const UNDEFINED_CONSTANT = "__undefined";

/** Default import used in the generation of the service class. */
const HTTP_API_BRIDGE_IMPORT: ImportDeclarationStructure = {
    kind: StructureKind.ImportDeclaration,
    moduleSpecifier: CONJURE_CLIENT_MODULE_SPECIFIER,
    namedImports: [{ name: HTTP_API_BRIDGE_TYPE }],
    isTypeOnly: true,
};

export function generateThrowingService(
    definition: IServiceDefinition,
    knownTypes: Map<string, ITypeDefinition>,
    simpleAst: SimpleAst,
    typeGenerationFlags: ITypeGenerationFlags,
): Promise<void> {
    const sourceFile = simpleAst.createSourceFile(definition.serviceName);

    const endpointSignatures: MethodSignatureStructure[] = [];
    const endpointImplementations: MethodDeclarationStructure[] = [];
    const imports: ImportDeclarationStructure[] = [HTTP_API_BRIDGE_IMPORT];

    sourceFile.addVariableStatement({
        declarationKind: VariableDeclarationKind.Const,
        docs: ["Constant reference to `undefined` that we expect to get minified and therefore reduce total code size"],
        declarations: [{ name: UNDEFINED_CONSTANT, type: "undefined", initializer: "undefined" }],
    });

    definition.endpoints.forEach(endpointDefinition => {
        const parameters: ParameterDeclarationStructure[] = endpointDefinition.args
            .sort((a, b) => {
                const aIsOptional = IType.isOptional(a.type);
                const bIsOptional = IType.isOptional(b.type);
                // Maintain order except optional arguments are pushed to the back
                return aIsOptional && !bIsOptional ? 1 : !aIsOptional && bIsOptional ? -1 : 0;
            })
            .map(argDefinition => {
                const parameterType = resolveTsType(
                    argDefinition.type,
                    definition.serviceName,
                    knownTypes,
                    typeGenerationFlags,
                    true,
                    true,
                );

                imports.push(
                    ...resolveImports(argDefinition.type, definition.serviceName, knownTypes, typeGenerationFlags),
                );

                return {
                    kind: StructureKind.Parameter,
                    hasQuestionToken: IType.isOptional(argDefinition.type),
                    name: argDefinition.argName,
                    type: parameterType,
                };
            });

        let resultType = "void";
        if (endpointDefinition.returns != null) {
            resultType = resolveTsType(
                endpointDefinition.returns,
                definition.serviceName,
                knownTypes,
                typeGenerationFlags,
                false,
                true,
            );
            imports.push(
                ...resolveImports(endpointDefinition.returns, definition.serviceName, knownTypes, typeGenerationFlags),
            );
        }

        let docs = addDeprecatedToDocs(endpointDefinition);
        docs = addIncubatingToDocs(endpointDefinition, docs);
        docs = addErrorsToDocs(endpointDefinition, docs);

        const { signature, implementation } = generateThrowingEndpoint({
            serviceDefinition: definition,
            endpointDefinition,
            resultType,
            knownTypes,
            parameters,
            docs,
        });

        endpointSignatures.push(signature);
        endpointImplementations.push(implementation);

        endpointDefinition.errors?.forEach(error => {
            const errorImports = resolveImportsForReferenceType(
                {
                    name: error.error.name,
                    package: error.error.package,
                },
                definition.serviceName,
                knownTypes,
                typeGenerationFlags,
            ).map(i => ({ ...i, isTypeOnly: true }));
            imports.push(...errorImports);
        });
    });

    sourceFile.addImportDeclarations(sortImports(imports));

    const iface = sourceFile.addInterface({
        isExported: true,
        methods: endpointSignatures,
        name: "I" + definition.serviceName.name,
    });
    if (definition.docs != null) {
        iface.addJsDoc({ description: definition.docs });
    }

    sourceFile.addClass({
        ctors: [
            {
                parameters: [
                    {
                        name: BRIDGE,
                        scope: Scope.Private,
                        type: HTTP_API_BRIDGE_TYPE,
                    },
                ],
            },
        ],
        isExported: true,
        methods: endpointImplementations,
        name: definition.serviceName.name,
        implements: [iface.getName()],
    });

    sourceFile.formatText();
    return sourceFile.save();
}
