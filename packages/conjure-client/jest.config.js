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

/**
 * The Jest configuration object.
 * @see http://facebook.github.io/jest/docs/configuration.html
 */
module.exports = {
    bail: true,
    collectCoverage: false,
    collectCoverageFrom: [
        "src/**/*.{ts,tsx}",
        "!**/*.d.ts",
    ],
    coveragePathIgnorePatterns: [
        "src/index.ts",
        "src/httpApiBridge/httpApiBridge.ts",
    ],
    coverageThreshold: {
        global: {
            branches: 50,
            functions: 50,
            lines: 50,
            statements: 50,
        },
    },
    globals: {
        "ts-jest": {
            /** This global is necessary for ts-jest to locate the compiler project config. */
            tsConfigFile: "src/tsconfig.json",
        },
    },
    mapCoverage: true,
    moduleFileExtensions: ["js", "json", "ts", "tsx"],
    // rootDir is set at the package level and assumed to be the package root
    setupFiles: ["<rootDir>/src/testBootstrap.js"],
    testEnvironment: "jsdom",
    testMatch: ["<rootDir>/src/**/__tests__/*Tests.{ts,tsx}"],
    transform: {
        "^.+\\.(ts|tsx)$": require.resolve("ts-jest"),
    },
    verbose: true,
};
