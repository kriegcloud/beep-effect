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

import { IConjureDefinition } from "conjure-api";
import * as fs from "fs-extra";
import * as path from "path";
import { SlsVersion, SlsVersionMatcher } from "sls-version";
import { Argv, CommandModule } from "yargs";
import { IPackageJson, IProductDependency, ISlsManifestDependency } from "../../types";
import { writeJson } from "../../utils/writeJson";
import { generate } from "./generator";

export interface IGenerateCommandArgs {
    /*
     * Positional arguments
     */
    _: string[];

    /*
     * The name of the package to generate
     */
    packageName?: string;

    /*
     * The version of the package to generate
     */
    packageVersion?: string;

    /*
     * Configure TypeScript compilation to generate modules that are node compatible
     */
    nodeCompatibleModules: boolean;

    /*
     * Generate raw source without any package metadata
     */
    rawSource: boolean;

    /**
     * Path to a file containing a list of product dependencies
     */
    productDependencies?: string;

    /**
     * Generate flavoured types for compatible aliases (string, rids...)
     */
    flavorizedAliases?: boolean;

    /**
     * Generated interfaces have readonly properties and collections
     */
    readonlyInterfaces?: boolean;

    /**
     * Generate services whose methods rethrow thrown API errors
     */
    generateThrowingServices: boolean;

    /**
     * Generate services whose methods return thrown API errors as results
     */
    generateNonThrowingServices: boolean;
}

interface ICleanedGenerateCommandArgs {
    conjureDefinition: IConjureDefinition;
    packageJson: IPackageJson;
    tsConfig: ITsConfig;
    gitIgnore: string;
}

export interface ITsConfig {
    compilerOptions: {
        [option: string]: any;
    };
}

export class GenerateCommand implements CommandModule {
    public aliases = [];

    public command = "generate";

    public describe = "Generate TypeScript bindings for a Conjure API";

    public builder(args: Argv) {
        return args
            .positional("input", {
                describe: "The location of the API IR",
            })
            .positional("output", {
                describe: "The output directory for the generated code",
            })
            .option("packageVersion", {
                default: undefined,
                describe: "The version of the generated package",
                type: "string",
            })
            .option("packageName", {
                default: undefined,
                describe: "The name of the generated package",
                type: "string",
            })
            .option("flavorizedAliases", {
                default: false,
                describe: "Generates flavoured types for compatible aliases.",
                type: "boolean",
            })
            .option("nodeCompatibleModules", {
                default: false,
                describe: "Generate node compatible javascript",
                type: "boolean",
            })
            .option("rawSource", {
                default: false,
                describe: "Generate raw source without any package metadata",
                type: "boolean",
            })
            .option("readonlyInterfaces", {
                default: false,
                describe: "Generated interfaces have readonly properties and collections",
                type: "boolean",
            })
            .option("productDependencies", {
                default: undefined,
                describe: "Path to a file containing a list of product dependencies",
                type: "string",
            })
            .option("generateThrowingServices", {
                default: true,
                describe: "Generate services whose methods rethrow thrown API errors",
                type: "boolean",
            })
            .option("generateNonThrowingServices", {
                default: false,
                describe: "Generate services whose methods return thrown API errors as results",
                type: "boolean",
            })
            .demand(2);
    }

    public handler = async (args: IGenerateCommandArgs) => {
        const [, , output] = args._;
        const { rawSource } = args;
        const { conjureDefinition, packageJson, tsConfig, gitIgnore } = await this.parseCommandLineArguments(args);
        const generatePromise = generate(
            conjureDefinition,
            output,
            {
                flavorizedAliases: args.flavorizedAliases ?? false,
                readonlyInterfaces: args.readonlyInterfaces ?? false,
            },
            {
                generateNonThrowingServices: args.generateNonThrowingServices,
                generateThrowingServices: args.generateThrowingServices,
            },
        );
        if (rawSource) {
            return generatePromise;
        }
        return Promise.all([
            writeJson(path.join(output, "package.json"), packageJson),
            writeJson(path.join(output, "tsconfig.json"), tsConfig),
            fs.writeFile(path.join(output, ".npmignore"), gitIgnore),
            generatePromise,
        ]);
    };

    private async parseCommandLineArguments(args: IGenerateCommandArgs): Promise<ICleanedGenerateCommandArgs> {
        const { packageName, packageVersion, productDependencies, rawSource } = args;
        const [, input, output] = args._;
        if (!rawSource && (packageName == null || packageVersion == null)) {
            throw Error('Must either specify "rawSource" or specify "packageName" and "packageVersion"');
        } else if (!fs.existsSync(output)) {
            throw new Error(`Directory "${output}" does not exist`);
        } else if (!rawSource && !SlsVersion.isValid(packageVersion!)) {
            throw new Error(
                `Expected version to be valid SLS version but found "${packageVersion}. ` +
                    "Please see https://github.com/palantir/sls-version-js for more details on SLS version.",
            );
        }

        return {
            conjureDefinition: await loadConjureDefinition(input),
            packageJson: await createPackageJson(
                require("../../../package.json"),
                packageName!,
                packageVersion!,
                productDependencies,
            ),
            tsConfig: createTsconfigJson(args.nodeCompatibleModules),
            gitIgnore: ["*.ts", "!*.d.ts", "tsconfig.json"].join("\n"),
        };
    }
}

export async function loadConjureDefinition(input: string): Promise<IConjureDefinition> {
    return { errors: [], services: [], types: [], ...JSON.parse(await fs.readFile(input, "utf8")) };
}

export async function createPackageJson(
    projectPackageJson: IPackageJson,
    packageName: string,
    packageVersion: string,
    productDependencies?: string,
): Promise<IPackageJson> {
    const packageJson: IPackageJson = {
        name: packageName!,
        version: packageVersion!,
        main: "index.js",
        types: "index.d.ts",
        sideEffects: false,
        scripts: { build: "tsc" },
        dependencies: {
            "conjure-client": projectPackageJson.dependencies["conjure-client"],
        },
        devDependencies: { typescript: projectPackageJson.devDependencies.typescript },
        author: "Conjure",
        license: "UNLICENSED",
    };

    if (productDependencies != null) {
        const dependencies = await resolveProductDependencies(productDependencies);
        if (Object.keys(dependencies).length > 0) {
            packageJson.sls = { dependencies };
        }
    }

    return packageJson;
}

export async function resolveProductDependencies(
    productDependencies: string,
): Promise<{ [coordinate: string]: IProductDependency }> {
    const resolvedProductDependencies: ISlsManifestDependency[] = await fs.readJSON(productDependencies);
    const dependencies: { [coordinate: string]: IProductDependency } = {};
    resolvedProductDependencies.forEach(productDependency => {
        const coordinate = `${productDependency["product-group"]}:${productDependency["product-name"]}`;
        const minVersion = productDependency["minimum-version"];
        const maxVersion = productDependency["maximum-version"];
        const optional = productDependency.optional;
        const recommendedVersion = productDependency["recommended-version"];
        if (
            !SlsVersion.isValid(minVersion) ||
            SlsVersionMatcher.safeValueOf(maxVersion) == null ||
            (recommendedVersion && !SlsVersion.isValid(recommendedVersion))
        ) {
            throw new Error("Encountered invalid product dependency");
        }
        dependencies[coordinate] = {
            minVersion,
            maxVersion,
            optional,
            recommendedVersion,
        };
    });
    return dependencies;
}

export function createTsconfigJson(nodeCompatibleModules: boolean): ITsConfig {
    return {
        compilerOptions: {
            declaration: true,
            module: nodeCompatibleModules ? "commonjs" : "es2015",
            moduleResolution: "node",
            noImplicitAny: true,
            removeComments: false,
            stripInternal: true,
            target: "es5",
            typeRoots: [],
        },
    };
}
