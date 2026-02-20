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
import { MediaType } from "conjure-client";
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
import { resolveMediaType } from "../../../utils/resolveMediaType";
import { resolveTsType } from "../../../utils/resolveTsType";
import { SimpleAst } from "../simpleAst";
import { generateNonThrowingEndpoint } from "./utils/generateNonThrowingEndpoint";
import { generateThrowingEndpoint } from "./utils/generateThrowingEndpoint";

/** Types used in the generation of the service class. Expected to be provided by conjure-client */
const HTTP_API_BRIDGE_TYPE = "IHttpApiBridge";
const CONJURE_RESULT_TYPE = "IConjureResult";

/** Variable names used in the generation of the service class. */
const BRIDGE = "bridge";
const UNDEFINED_CONSTANT = "__undefined";
const NON_THROWING_SERVICE_SUFFIX = "WithErrors";

/** Default imports used in the generation of the service class. */
const CONJURE_CLIENT_IMPORTS: ImportDeclarationStructure = {
    kind: StructureKind.ImportDeclaration,
    moduleSpecifier: CONJURE_CLIENT_MODULE_SPECIFIER,
    namedImports: [{ name: CONJURE_RESULT_TYPE }, { name: HTTP_API_BRIDGE_TYPE }],
    isTypeOnly: true,
};

const THROWING_METHOD_DOCUMENTATION =
    "This method calls a streaming endpoint. The method will throw if the endpoint throws an error.";

export function generateNonThrowingService(
    definition: IServiceDefinition,
    knownTypes: Map<string, ITypeDefinition>,
    simpleAst: SimpleAst,
    typeGenerationFlags: ITypeGenerationFlags,
): Promise<void> {
    const serviceName = `${definition.serviceName.name}${NON_THROWING_SERVICE_SUFFIX}`;
    const sourceFile = simpleAst.createSourceFile({
        package: definition.serviceName.package,
        name: serviceName,
    });
    const endpointSignatures: MethodSignatureStructure[] = [];
    const endpointImplementations: MethodDeclarationStructure[] = [];
    const imports: ImportDeclarationStructure[] = [CONJURE_CLIENT_IMPORTS];

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
        let responseMediaType = MediaType.APPLICATION_JSON;
        if (endpointDefinition.returns != null) {
            responseMediaType = resolveMediaType(endpointDefinition.returns, knownTypes);
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

        const errorNames = endpointDefinition.errors?.map(error => `I${error.error.name}`) ?? [];
        if (errorNames.length === 0) {
            errorNames.push("never");
        }
        const errorsType = errorNames.join(" | ");

        // If the endpoint is a streaming endpoint, we don't want to wrap the result in an `IConjureResult`
        // and instead return the raw result type. This means the method will be throwing.
        const { signature, implementation } =
            responseMediaType === MediaType.APPLICATION_OCTET_STREAM
                ? generateThrowingEndpoint({
                      serviceDefinition: definition,
                      endpointDefinition,
                      resultType,
                      knownTypes,
                      parameters,
                      docs: addErrorsToDocs(
                          endpointDefinition,
                          docs != null ? `${docs}\n${THROWING_METHOD_DOCUMENTATION}` : THROWING_METHOD_DOCUMENTATION,
                      ),
                  })
                : generateNonThrowingEndpoint({
                      serviceDefinition: definition,
                      endpointDefinition,
                      resultType,
                      errorsType,
                      knownTypes,
                      parameters,
                      docs,
                  });

        endpointSignatures.push(signature);
        endpointImplementations.push(implementation);
    });

    sourceFile.addImportDeclarations(sortImports(imports));

    const iface = sourceFile.addInterface({
        isExported: true,
        methods: endpointSignatures,
        name: `I${serviceName}`,
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
        name: serviceName,
        implements: [iface.getName()],
    });

    sourceFile.formatText();
    return sourceFile.save();
}
