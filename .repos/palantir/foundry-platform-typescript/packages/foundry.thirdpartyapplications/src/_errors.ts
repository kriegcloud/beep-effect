/*
 * Copyright 2024 Palantir Technologies, Inc. All rights reserved.
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

export type LooselyBrandedString<T extends string> = string & {
  __LOOSE_BRAND?: T;
};

/**
 * The given website version is deployed. You must un-deploy it before deleting it.
 *
 * Log Safety: UNSAFE
 */
export interface CannotDeleteDeployedVersion {
  errorCode: "INVALID_ARGUMENT";
  errorName: "CannotDeleteDeployedVersion";
  errorDescription:
    "The given website version is deployed. You must un-deploy it before deleting it.";
  errorInstanceId: string;
  parameters: {
    version: unknown;
  };
}

/**
 * Could not delete the Version.
 *
 * Log Safety: UNSAFE
 */
export interface DeleteVersionPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "DeleteVersionPermissionDenied";
  errorDescription: "Could not delete the Version.";
  errorInstanceId: string;
  parameters: {
    thirdPartyApplicationRid: unknown;
    versionVersion: unknown;
  };
}

/**
 * Could not deploy the Website.
 *
 * Log Safety: SAFE
 */
export interface DeployWebsitePermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "DeployWebsitePermissionDenied";
  errorDescription: "Could not deploy the Website.";
  errorInstanceId: string;
  parameters: {
    thirdPartyApplicationRid: unknown;
  };
}

/**
 * The .zip archive contains too many files.
 *
 * Log Safety: SAFE
 */
export interface FileCountLimitExceeded {
  errorCode: "INVALID_ARGUMENT";
  errorName: "FileCountLimitExceeded";
  errorDescription: "The .zip archive contains too many files.";
  errorInstanceId: string;
  parameters: {
    fileCountLimit: unknown;
  };
}

/**
   * A file inside the .zip archive is too big. You must ensure that all files inside
the .zip archive are within the limit.
   *
   * Log Safety: UNSAFE
   */
export interface FileSizeLimitExceeded {
  errorCode: "INVALID_ARGUMENT";
  errorName: "FileSizeLimitExceeded";
  errorDescription:
    "A file inside the .zip archive is too big. You must ensure that all files inside the .zip archive are within the limit.";
  errorInstanceId: string;
  parameters: {
    fileSizeBytesLimit: unknown;
    currentFileSizeBytes: unknown;
    currentFilePath: unknown;
  };
}

/**
 * The given website version is invalid. Versions must follow semantic versioning with major, minor, and patch versions separate by periods, e.g. 0.1.0 or 1.2.3.
 *
 * Log Safety: UNSAFE
 */
export interface InvalidVersion {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidVersion";
  errorDescription:
    "The given website version is invalid. Versions must follow semantic versioning with major, minor, and patch versions separate by periods, e.g. 0.1.0 or 1.2.3.";
  errorInstanceId: string;
  parameters: {
    version: unknown;
  };
}

/**
 * An error occurred while scanning the website files for vulnerabilities. Please check the Website Hosting page in Developer Console for more information and try uploading again.
 *
 * Log Safety: UNSAFE
 */
export interface ScanningErrored {
  errorCode: "CUSTOM_CLIENT";
  errorName: "ScanningErrored";
  errorDescription:
    "An error occurred while scanning the website files for vulnerabilities. Please check the Website Hosting page in Developer Console for more information and try uploading again.";
  errorInstanceId: string;
  parameters: {
    version: unknown;
  };
}

/**
 * The website files are currently being scanned for vulnerabilities. Please wait for the scan to complete and confirm no vulnerabilities first.
 *
 * Log Safety: UNSAFE
 */
export interface ScanningInProgress {
  errorCode: "CUSTOM_CLIENT";
  errorName: "ScanningInProgress";
  errorDescription:
    "The website files are currently being scanned for vulnerabilities. Please wait for the scan to complete and confirm no vulnerabilities first.";
  errorInstanceId: string;
  parameters: {
    version: unknown;
  };
}

/**
 * Vulnerabilities were detected in these website files. Please check the Website Hosting page in Developer Console for more information and address these vulnerabilities before uploading again.
 *
 * Log Safety: UNSAFE
 */
export interface SiteAssetHasVulnerabilities {
  errorCode: "CUSTOM_CLIENT";
  errorName: "SiteAssetHasVulnerabilities";
  errorDescription:
    "Vulnerabilities were detected in these website files. Please check the Website Hosting page in Developer Console for more information and address these vulnerabilities before uploading again.";
  errorInstanceId: string;
  parameters: {
    version: unknown;
  };
}

/**
 * The given ThirdPartyApplication could not be found.
 *
 * Log Safety: SAFE
 */
export interface ThirdPartyApplicationNotFound {
  errorCode: "NOT_FOUND";
  errorName: "ThirdPartyApplicationNotFound";
  errorDescription: "The given ThirdPartyApplication could not be found.";
  errorInstanceId: string;
  parameters: {
    thirdPartyApplicationRid: unknown;
  };
}

/**
 * Could not undeploy the Website.
 *
 * Log Safety: SAFE
 */
export interface UndeployWebsitePermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "UndeployWebsitePermissionDenied";
  errorDescription: "Could not undeploy the Website.";
  errorInstanceId: string;
  parameters: {
    thirdPartyApplicationRid: unknown;
  };
}

/**
 * Could not uploadSnapshot the Version.
 *
 * Log Safety: SAFE
 */
export interface UploadSnapshotVersionPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "UploadSnapshotVersionPermissionDenied";
  errorDescription: "Could not uploadSnapshot the Version.";
  errorInstanceId: string;
  parameters: {
    thirdPartyApplicationRid: unknown;
  };
}

/**
 * Could not upload the Version.
 *
 * Log Safety: SAFE
 */
export interface UploadVersionPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "UploadVersionPermissionDenied";
  errorDescription: "Could not upload the Version.";
  errorInstanceId: string;
  parameters: {
    thirdPartyApplicationRid: unknown;
  };
}

/**
 * The given website version already exists.
 *
 * Log Safety: UNSAFE
 */
export interface VersionAlreadyExists {
  errorCode: "CONFLICT";
  errorName: "VersionAlreadyExists";
  errorDescription: "The given website version already exists.";
  errorInstanceId: string;
  parameters: {
    version: unknown;
  };
}

/**
   * The website contains too many versions. You must delete an old version before
uploading a new one.
   *
   * Log Safety: SAFE
   */
export interface VersionLimitExceeded {
  errorCode: "INVALID_ARGUMENT";
  errorName: "VersionLimitExceeded";
  errorDescription:
    "The website contains too many versions. You must delete an old version before uploading a new one.";
  errorInstanceId: string;
  parameters: {
    versionLimit: unknown;
  };
}

/**
 * The given Version could not be found.
 *
 * Log Safety: UNSAFE
 */
export interface VersionNotFound {
  errorCode: "NOT_FOUND";
  errorName: "VersionNotFound";
  errorDescription: "The given Version could not be found.";
  errorInstanceId: string;
  parameters: {
    thirdPartyApplicationRid: unknown;
    versionVersion: unknown;
  };
}

/**
 * The given Website could not be found.
 *
 * Log Safety: SAFE
 */
export interface WebsiteNotFound {
  errorCode: "NOT_FOUND";
  errorName: "WebsiteNotFound";
  errorDescription: "The given Website could not be found.";
  errorInstanceId: string;
  parameters: {
    thirdPartyApplicationRid: unknown;
  };
}
