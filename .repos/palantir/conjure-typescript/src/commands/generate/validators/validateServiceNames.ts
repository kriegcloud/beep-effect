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

import { IServiceDefinition } from "conjure-api";
import { IServiceGenerationFlags } from "../../../types/serviceGenerationFlags";

const NON_THROWING_SERVICE_SUFFIX = "WithErrors";

/**
 * @description Validates that there are no conflicting service names when generating both throwing and non-throwing services.
 * Throws an error if a conflict is found.
 *
 * @param services - The list of service definitions to validate.
 * @param serviceGenerationFlags - Flags indicating which services are being generated.
 */
export const validateServiceNames = (
    services: IServiceDefinition[],
    serviceGenerationFlags: IServiceGenerationFlags,
): void => {
    // Check if both throwing and non-throwing services are being generated
    if (!serviceGenerationFlags.generateNonThrowingServices || !serviceGenerationFlags.generateThrowingServices) {
        return;
    }

    const packageToServiceNamesMap: Map<string, Set<string>> = new Map();

    services.forEach(service => {
        const { name: serviceName, package: packageName } = service.serviceName;
        if (!packageToServiceNamesMap.has(packageName)) {
            packageToServiceNamesMap.set(packageName, new Set());
        }

        packageToServiceNamesMap.get(packageName)!.add(serviceName);
    });

    Array.from(packageToServiceNamesMap.entries()).forEach(([packageName, throwingServiceNames]) => {
        throwingServiceNames.forEach(throwingServiceName => {
            const nonThrowingServiceName = `${throwingServiceName}${NON_THROWING_SERVICE_SUFFIX}`;
            if (throwingServiceNames.has(nonThrowingServiceName)) {
                throw new Error(
                    `Found service name conflict in ${packageName}. Cannot generate non-throwing service '${nonThrowingServiceName}' because it already exists.`,
                );
            }
        });
    });
};
