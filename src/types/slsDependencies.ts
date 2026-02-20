/**
 * @license Copyright 2018 Palantir Technologies, Inc. All rights reserved.
 */

export interface ISlsManifestDependency {
    "product-group": string;
    "product-name": string;
    "minimum-version": string;
    "maximum-version": string;
    "recommended-version"?: string;
    // Optional for backcompat
    "optional"?: boolean;
}

export interface IProductDependency {
    minVersion: string;
    maxVersion: string;
    // Optional for backcompat
    optional?: boolean;
    recommendedVersion?: string;
}
