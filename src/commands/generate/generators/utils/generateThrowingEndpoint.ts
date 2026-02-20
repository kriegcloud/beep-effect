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

import {
    IArgumentDefinition,
    IEndpointDefinition,
    IParameterType,
    IParameterType_Header,
    IParameterType_Query,
    IServiceDefinition,
    ITypeDefinition,
} from "conjure-api";
import { MediaType } from "conjure-client";
import {
    CodeBlockWriter,
    MethodDeclarationStructure,
    MethodSignatureStructure,
    ParameterDeclarationStructure,
    Scope,
    StructureKind,
} from "ts-morph";
import { parsePathParamsFromPath } from "../../../../utils/parsePathParamsFromPath";
import { resolveMediaType } from "../../../../utils/resolveMediaType";
import { resolveStringConversion } from "../../../../utils/resolveStringConversion";

const BRIDGE = "bridge";
const UNDEFINED_CONSTANT = "__undefined";

type generateNonThrowingEndpointBodyArgs = {
    endpointDefinition: IEndpointDefinition;
    knownTypes: Map<string, ITypeDefinition>;
    resultType: string;
    serviceDefinition: IServiceDefinition;
};

function generateThrowingEndpointBody({
    endpointDefinition,
    knownTypes,
    resultType,
    serviceDefinition,
}: generateNonThrowingEndpointBodyArgs): (writer: CodeBlockWriter) => void {
    const bodyArgs: IArgumentDefinition[] = [];
    const headerArgs: IArgumentDefinition[] = [];
    const queryArgs: IArgumentDefinition[] = [];

    endpointDefinition.args.forEach(argDefinition => {
        if (IParameterType.isBody(argDefinition.paramType)) {
            bodyArgs.push(argDefinition);
        } else if (IParameterType.isHeader(argDefinition.paramType)) {
            headerArgs.push(argDefinition);
        } else if (IParameterType.isQuery(argDefinition.paramType)) {
            queryArgs.push(argDefinition);
        }
    });

    const pathParamsFromPath = parsePathParamsFromPath(endpointDefinition.httpPath);

    if (bodyArgs.length > 1) {
        throw Error("endpoint cannot have more than one body arg, found: " + bodyArgs.length);
    }

    const data = bodyArgs.length === 0 ? UNDEFINED_CONSTANT : bodyArgs[0].argName;
    // It's not quite correct to default to application/json for body less and return less requests.
    // We do this to preserve existing behaviour.
    const requestMediaType =
        bodyArgs.length === 0 ? MediaType.APPLICATION_JSON : resolveMediaType(bodyArgs[0].type, knownTypes);
    const responseMediaType =
        endpointDefinition.returns != null
            ? resolveMediaType(endpointDefinition.returns, knownTypes)
            : MediaType.APPLICATION_JSON;
    const formattedHeaderArgs = headerArgs.map(argDefinition => {
        const paramId = (argDefinition.paramType as IParameterType_Header).header.paramId!;
        if (paramId == null) {
            throw Error("header arguments must define a 'param-id': " + argDefinition.argName);
        }
        const stringConversion = resolveStringConversion(argDefinition.type);
        return `"${paramId}": ${argDefinition.argName}${stringConversion},`;
    });
    const formattedQueryArgs = queryArgs.map(argDefinition => {
        const paramId = (argDefinition.paramType as IParameterType_Query).query.paramId;
        if (paramId == null) {
            throw Error("query arguments must define a 'param-id': " + argDefinition.argName);
        }
        return `"${paramId}": ${argDefinition.argName},`;
    });

    return writer => {
        writer
            .write(`return this.${BRIDGE}.call<${resultType}>(`)
            .writeLine(`"${serviceDefinition.serviceName.name}",`)
            .writeLine(`"${endpointDefinition.endpointName}",`)
            .writeLine(`"${endpointDefinition.httpMethod}",`)
            .writeLine(`"${endpointDefinition.httpPath}",`)
            .writeLine(`${data},`);

        if (formattedHeaderArgs.length === 0) {
            writer.writeLine(`${UNDEFINED_CONSTANT},`);
        } else {
            writer.write("{");
            formattedHeaderArgs.forEach(formattedHeader => writer.writeLine(formattedHeader));
            writer.writeLine("},");
        }

        if (formattedQueryArgs.length === 0) {
            writer.writeLine(`${UNDEFINED_CONSTANT},`);
        } else {
            writer.write("{");
            formattedQueryArgs.forEach(formattedQuery => writer.writeLine(formattedQuery));
            writer.writeLine("},");
        }

        if (pathParamsFromPath.length === 0) {
            writer.writeLine(`${UNDEFINED_CONSTANT},`);
        } else {
            writer.write("[");
            pathParamsFromPath.forEach(pathArgName => writer.writeLine(pathArgName + ","));
            writer.writeLine("],");
        }
        writer.writeLine(
            `${requestMediaType === MediaType.APPLICATION_JSON ? UNDEFINED_CONSTANT : `"${requestMediaType}"`},`,
        );
        writer.writeLine(
            `${responseMediaType === MediaType.APPLICATION_JSON ? UNDEFINED_CONSTANT : `"${responseMediaType}"`}`,
        );
        writer.write(");");
    };
}

type GenerateNonThrowingEndpointArgs = generateNonThrowingEndpointBodyArgs & {
    docs: string | undefined;
    parameters: ParameterDeclarationStructure[];
};

type GenerateNonThrowingEndpointReturn = {
    implementation: MethodDeclarationStructure;
    signature: MethodSignatureStructure;
};

export function generateThrowingEndpoint({
    docs,
    endpointDefinition,
    knownTypes,
    parameters,
    resultType,
    serviceDefinition,
}: GenerateNonThrowingEndpointArgs): GenerateNonThrowingEndpointReturn {
    const returnType = `Promise<${resultType}>`;

    return {
        signature: {
            kind: StructureKind.MethodSignature,
            name: endpointDefinition.endpointName,
            parameters,
            returnType,
            docs: docs != null ? [docs] : undefined,
        },
        implementation: {
            kind: StructureKind.Method,
            statements: generateThrowingEndpointBody({ endpointDefinition, knownTypes, resultType, serviceDefinition }),
            name: endpointDefinition.endpointName,
            parameters,
            returnType,
            // this appears to be a no-op by ts-simple-ast, since default in typescript is public
            scope: Scope.Public,
            docs: docs != null ? [docs] : undefined,
        },
    };
}
