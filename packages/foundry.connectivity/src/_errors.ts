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
 * The additional secrets must be specified as a plaintext value map.
 *
 * Log Safety: SAFE
 */
export interface AdditionalSecretsMustBeSpecifiedAsPlaintextValueMap {
  errorCode: "INVALID_ARGUMENT";
  errorName: "AdditionalSecretsMustBeSpecifiedAsPlaintextValueMap";
  errorDescription:
    "The additional secrets must be specified as a plaintext value map.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * Details of the connection (such as which types of import it supports) could not be determined.
 *
 * Log Safety: UNSAFE
 */
export interface ConnectionDetailsNotDetermined {
  errorCode: "INTERNAL";
  errorName: "ConnectionDetailsNotDetermined";
  errorDescription:
    "Details of the connection (such as which types of import it supports) could not be determined.";
  errorInstanceId: string;
  parameters: {
    connectionRid: unknown;
    connectionType: unknown;
  };
}

/**
 * The given Connection could not be found.
 *
 * Log Safety: SAFE
 */
export interface ConnectionNotFound {
  errorCode: "NOT_FOUND";
  errorName: "ConnectionNotFound";
  errorDescription: "The given Connection could not be found.";
  errorInstanceId: string;
  parameters: {
    connectionRid: unknown;
  };
}

/**
 * The specified connection is not yet supported in the Platform API.
 *
 * Log Safety: UNSAFE
 */
export interface ConnectionTypeNotSupported {
  errorCode: "INVALID_ARGUMENT";
  errorName: "ConnectionTypeNotSupported";
  errorDescription:
    "The specified connection is not yet supported in the Platform API.";
  errorInstanceId: string;
  parameters: {
    connectionType: unknown;
  };
}

/**
 * Could not create the Connection.
 *
 * Log Safety: SAFE
 */
export interface CreateConnectionPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "CreateConnectionPermissionDenied";
  errorDescription: "Could not create the Connection.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * Could not create the FileImport.
 *
 * Log Safety: SAFE
 */
export interface CreateFileImportPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "CreateFileImportPermissionDenied";
  errorDescription: "Could not create the FileImport.";
  errorInstanceId: string;
  parameters: {
    connectionRid: unknown;
  };
}

/**
 * Could not create the TableImport.
 *
 * Log Safety: SAFE
 */
export interface CreateTableImportPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "CreateTableImportPermissionDenied";
  errorDescription: "Could not create the TableImport.";
  errorInstanceId: string;
  parameters: {
    connectionRid: unknown;
  };
}

/**
 * Could not create the VirtualTable.
 *
 * Log Safety: SAFE
 */
export interface CreateVirtualTablePermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "CreateVirtualTablePermissionDenied";
  errorDescription: "Could not create the VirtualTable.";
  errorInstanceId: string;
  parameters: {
    connectionRid: unknown;
  };
}

/**
 * Could not delete the FileImport.
 *
 * Log Safety: SAFE
 */
export interface DeleteFileImportPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "DeleteFileImportPermissionDenied";
  errorDescription: "Could not delete the FileImport.";
  errorInstanceId: string;
  parameters: {
    fileImportRid: unknown;
    connectionRid: unknown;
  };
}

/**
 * Could not delete the TableImport.
 *
 * Log Safety: SAFE
 */
export interface DeleteTableImportPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "DeleteTableImportPermissionDenied";
  errorDescription: "Could not delete the TableImport.";
  errorInstanceId: string;
  parameters: {
    tableImportRid: unknown;
    connectionRid: unknown;
  };
}

/**
 * The domain must use HTTPS if authentication is required.
 *
 * Log Safety: SAFE
 */
export interface DomainMustUseHttpsWithAuthentication {
  errorCode: "INVALID_ARGUMENT";
  errorName: "DomainMustUseHttpsWithAuthentication";
  errorDescription: "The domain must use HTTPS if authentication is required.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * The driver content must be provided as a jar.
 *
 * Log Safety: UNSAFE
 */
export interface DriverContentMustBeUploadedAsJar {
  errorCode: "INVALID_ARGUMENT";
  errorName: "DriverContentMustBeUploadedAsJar";
  errorDescription: "The driver content must be provided as a jar.";
  errorInstanceId: string;
  parameters: {
    driverName: unknown;
  };
}

/**
 * Duplicate jar with different versions already exists on connection.
 *
 * Log Safety: UNSAFE
 */
export interface DriverJarAlreadyExists {
  errorCode: "CONFLICT";
  errorName: "DriverJarAlreadyExists";
  errorDescription:
    "Duplicate jar with different versions already exists on connection.";
  errorInstanceId: string;
  parameters: {
    driverName: unknown;
    connectionRid: unknown;
  };
}

/**
 * The encrypted property must be specified as a plaintext value.
 *
 * Log Safety: SAFE
 */
export interface EncryptedPropertyMustBeSpecifiedAsPlaintextValue {
  errorCode: "INVALID_ARGUMENT";
  errorName: "EncryptedPropertyMustBeSpecifiedAsPlaintextValue";
  errorDescription:
    "The encrypted property must be specified as a plaintext value.";
  errorInstanceId: string;
  parameters: {
    propertyName: unknown;
  };
}

/**
 * Could not execute the FileImport.
 *
 * Log Safety: SAFE
 */
export interface ExecuteFileImportPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "ExecuteFileImportPermissionDenied";
  errorDescription: "Could not execute the FileImport.";
  errorInstanceId: string;
  parameters: {
    fileImportRid: unknown;
    connectionRid: unknown;
  };
}

/**
 * Could not execute the TableImport.
 *
 * Log Safety: SAFE
 */
export interface ExecuteTableImportPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "ExecuteTableImportPermissionDenied";
  errorDescription: "Could not execute the TableImport.";
  errorInstanceId: string;
  parameters: {
    tableImportRid: unknown;
    connectionRid: unknown;
  };
}

/**
 * The provided minFilesCount property in the FileAtLeastCountFilter must be strictly greater than 0.
 *
 * Log Safety: SAFE
 */
export interface FileAtLeastCountFilterInvalidMinCount {
  errorCode: "INVALID_ARGUMENT";
  errorName: "FileAtLeastCountFilterInvalidMinCount";
  errorDescription:
    "The provided minFilesCount property in the FileAtLeastCountFilter must be strictly greater than 0.";
  errorInstanceId: string;
  parameters: {
    minFilesCount: unknown;
  };
}

/**
   * Custom file import filters can be fetched but cannot currently be used
when creating or updating file imports.
   *
   * Log Safety: UNSAFE
   */
export interface FileImportCustomFilterCannotBeUsedToCreateOrUpdateFileImports {
  errorCode: "INVALID_ARGUMENT";
  errorName: "FileImportCustomFilterCannotBeUsedToCreateOrUpdateFileImports";
  errorDescription:
    "Custom file import filters can be fetched but cannot currently be used when creating or updating file imports.";
  errorInstanceId: string;
  parameters: {
    config: unknown;
  };
}

/**
 * The given FileImport could not be found.
 *
 * Log Safety: SAFE
 */
export interface FileImportNotFound {
  errorCode: "NOT_FOUND";
  errorName: "FileImportNotFound";
  errorDescription: "The given FileImport could not be found.";
  errorInstanceId: string;
  parameters: {
    fileImportRid: unknown;
    connectionRid: unknown;
  };
}

/**
 * The specified connection does not support file imports.
 *
 * Log Safety: SAFE
 */
export interface FileImportNotSupportedForConnection {
  errorCode: "INVALID_ARGUMENT";
  errorName: "FileImportNotSupportedForConnection";
  errorDescription: "The specified connection does not support file imports.";
  errorInstanceId: string;
  parameters: {
    connectionRid: unknown;
  };
}

/**
 * The filesCount property in the FilesCountLimitFilter must be strictly greater than 0.
 *
 * Log Safety: SAFE
 */
export interface FilesCountLimitFilterInvalidLimit {
  errorCode: "INVALID_ARGUMENT";
  errorName: "FilesCountLimitFilterInvalidLimit";
  errorDescription:
    "The filesCount property in the FilesCountLimitFilter must be strictly greater than 0.";
  errorInstanceId: string;
  parameters: {
    filesCount: unknown;
  };
}

/**
 * The gt property in the FileSizeFilter cannot be a negative number.
 *
 * Log Safety: SAFE
 */
export interface FileSizeFilterGreaterThanCannotBeNegative {
  errorCode: "INVALID_ARGUMENT";
  errorName: "FileSizeFilterGreaterThanCannotBeNegative";
  errorDescription:
    "The gt property in the FileSizeFilter cannot be a negative number.";
  errorInstanceId: string;
  parameters: {
    gt: unknown;
  };
}

/**
   * The provided gt and lt properties in the FileSizeFilter are invalid. No files will ever
satisfy the provided range. The value specified for gt must be strictly less than lt - 1.
   *
   * Log Safety: SAFE
   */
export interface FileSizeFilterInvalidGreaterThanAndLessThanRange {
  errorCode: "INVALID_ARGUMENT";
  errorName: "FileSizeFilterInvalidGreaterThanAndLessThanRange";
  errorDescription:
    "The provided gt and lt properties in the FileSizeFilter are invalid. No files will ever satisfy the provided range. The value specified for gt must be strictly less than lt - 1.";
  errorInstanceId: string;
  parameters: {
    gt: unknown;
    lt: unknown;
  };
}

/**
 * The lt property in the FileSizeFilter must be at least 1 byte.
 *
 * Log Safety: SAFE
 */
export interface FileSizeFilterLessThanMustBeOneByteOrLarger {
  errorCode: "INVALID_ARGUMENT";
  errorName: "FileSizeFilterLessThanMustBeOneByteOrLarger";
  errorDescription:
    "The lt property in the FileSizeFilter must be at least 1 byte.";
  errorInstanceId: string;
  parameters: {
    lt: unknown;
  };
}

/**
   * Both the gt and lt properties are missing from the FileSizeFilter. At least one of these
properties must be present
   *
   * Log Safety: SAFE
   */
export interface FileSizeFilterMissingGreaterThanAndLessThan {
  errorCode: "INVALID_ARGUMENT";
  errorName: "FileSizeFilterMissingGreaterThanAndLessThan";
  errorDescription:
    "Both the gt and lt properties are missing from the FileSizeFilter. At least one of these properties must be present";
  errorInstanceId: string;
  parameters: {};
}

/**
 * Could not getConfiguration the Connection.
 *
 * Log Safety: SAFE
 */
export interface GetConfigurationPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "GetConfigurationPermissionDenied";
  errorDescription: "Could not getConfiguration the Connection.";
  errorInstanceId: string;
  parameters: {
    connectionRid: unknown;
  };
}

/**
 * The hostname should not include a protocol (e.g., https://) or port number (e.g., :443).
 *
 * Log Safety: UNSAFE
 */
export interface HostNameCannotHaveProtocolOrPort {
  errorCode: "INVALID_ARGUMENT";
  errorName: "HostNameCannotHaveProtocolOrPort";
  errorDescription:
    "The hostname should not include a protocol (e.g., https://) or port number (e.g., :443).";
  errorInstanceId: string;
  parameters: {
    hostName: unknown;
  };
}

/**
 * The share name is invalid. Share names cannot contain the following characters: \ / : * ? " < > |
 *
 * Log Safety: UNSAFE
 */
export interface InvalidShareName {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidShareName";
  errorDescription:
    "The share name is invalid. Share names cannot contain the following characters: \\ / : * ? \" < > |";
  errorInstanceId: string;
  parameters: {
    shareName: unknown;
  };
}

/**
 * The specified connection is invalid or inaccessible.
 *
 * Log Safety: SAFE
 */
export interface InvalidVirtualTableConnection {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidVirtualTableConnection";
  errorDescription: "The specified connection is invalid or inaccessible.";
  errorInstanceId: string;
  parameters: {
    connection: unknown;
    reason: unknown;
  };
}

/**
 * The parent folder for the specified connection could not be found.
 *
 * Log Safety: SAFE
 */
export interface ParentFolderNotFoundForConnection {
  errorCode: "NOT_FOUND";
  errorName: "ParentFolderNotFoundForConnection";
  errorDescription:
    "The parent folder for the specified connection could not be found.";
  errorInstanceId: string;
  parameters: {
    connectionRid: unknown;
  };
}

/**
 * The specified port is not in the valid range (1-65535).
 *
 * Log Safety: SAFE
 */
export interface PortNotInRange {
  errorCode: "INVALID_ARGUMENT";
  errorName: "PortNotInRange";
  errorDescription: "The specified port is not in the valid range (1-65535).";
  errorInstanceId: string;
  parameters: {
    port: unknown;
  };
}

/**
 * The specified property cannot be blank.
 *
 * Log Safety: SAFE
 */
export interface PropertyCannotBeBlank {
  errorCode: "INVALID_ARGUMENT";
  errorName: "PropertyCannotBeBlank";
  errorDescription: "The specified property cannot be blank.";
  errorInstanceId: string;
  parameters: {
    propertyName: unknown;
  };
}

/**
 * The specified property cannot be empty.
 *
 * Log Safety: SAFE
 */
export interface PropertyCannotBeEmpty {
  errorCode: "INVALID_ARGUMENT";
  errorName: "PropertyCannotBeEmpty";
  errorDescription: "The specified property cannot be empty.";
  errorInstanceId: string;
  parameters: {
    propertyName: unknown;
  };
}

/**
 * Could not replace the FileImport.
 *
 * Log Safety: SAFE
 */
export interface ReplaceFileImportPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "ReplaceFileImportPermissionDenied";
  errorDescription: "Could not replace the FileImport.";
  errorInstanceId: string;
  parameters: {
    fileImportRid: unknown;
    connectionRid: unknown;
  };
}

/**
 * Could not replace the TableImport.
 *
 * Log Safety: SAFE
 */
export interface ReplaceTableImportPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "ReplaceTableImportPermissionDenied";
  errorDescription: "Could not replace the TableImport.";
  errorInstanceId: string;
  parameters: {
    tableImportRid: unknown;
    connectionRid: unknown;
  };
}

/**
 * The secret names provided do not exist on the connection.
 *
 * Log Safety: UNSAFE
 */
export interface SecretNamesDoNotExist {
  errorCode: "INVALID_ARGUMENT";
  errorName: "SecretNamesDoNotExist";
  errorDescription: "The secret names provided do not exist on the connection.";
  errorInstanceId: string;
  parameters: {
    connectionRid: unknown;
    secretNames: unknown;
  };
}

/**
 * The given TableImport could not be found.
 *
 * Log Safety: SAFE
 */
export interface TableImportNotFound {
  errorCode: "NOT_FOUND";
  errorName: "TableImportNotFound";
  errorDescription: "The given TableImport could not be found.";
  errorInstanceId: string;
  parameters: {
    tableImportRid: unknown;
    connectionRid: unknown;
  };
}

/**
 * The specified connection does not support creating or replacing a table import with the specified config.
 *
 * Log Safety: UNSAFE
 */
export interface TableImportNotSupportedForConnection {
  errorCode: "INVALID_ARGUMENT";
  errorName: "TableImportNotSupportedForConnection";
  errorDescription:
    "The specified connection does not support creating or replacing a table import with the specified config.";
  errorInstanceId: string;
  parameters: {
    connectionRid: unknown;
    tableImportType: unknown;
  };
}

/**
 * The specified table import type is not yet supported in the Platform API.
 *
 * Log Safety: UNSAFE
 */
export interface TableImportTypeNotSupported {
  errorCode: "INTERNAL";
  errorName: "TableImportTypeNotSupported";
  errorDescription:
    "The specified table import type is not yet supported in the Platform API.";
  errorInstanceId: string;
  parameters: {
    tableImportType: unknown;
  };
}

/**
 * The UnknownWorker cannot be used for creating or updating connections. Please use the Foundry worker instead.
 *
 * Log Safety: SAFE
 */
export interface UnknownWorkerCannotBeUsedForCreatingOrUpdatingConnections {
  errorCode: "INVALID_ARGUMENT";
  errorName: "UnknownWorkerCannotBeUsedForCreatingOrUpdatingConnections";
  errorDescription:
    "The UnknownWorker cannot be used for creating or updating connections. Please use the Foundry worker instead.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * Could not updateExportSettings the Connection.
 *
 * Log Safety: SAFE
 */
export interface UpdateExportSettingsForConnectionPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "UpdateExportSettingsForConnectionPermissionDenied";
  errorDescription: "Could not updateExportSettings the Connection.";
  errorInstanceId: string;
  parameters: {
    connectionRid: unknown;
  };
}

/**
 * Could not update secrets for the Connection.
 *
 * Log Safety: SAFE
 */
export interface UpdateSecretsForConnectionPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "UpdateSecretsForConnectionPermissionDenied";
  errorDescription: "Could not update secrets for the Connection.";
  errorInstanceId: string;
  parameters: {
    connectionRid: unknown;
  };
}

/**
 * Only JDBC connections support uploading custom JDBC drivers.
 *
 * Log Safety: UNSAFE
 */
export interface UploadCustomJdbcDriverNotSupportForConnection {
  errorCode: "INVALID_ARGUMENT";
  errorName: "UploadCustomJdbcDriverNotSupportForConnection";
  errorDescription:
    "Only JDBC connections support uploading custom JDBC drivers.";
  errorInstanceId: string;
  parameters: {
    connectionType: unknown;
  };
}

/**
 * Could not uploadCustomJdbcDrivers the Connection.
 *
 * Log Safety: SAFE
 */
export interface UploadCustomJdbcDriversConnectionPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "UploadCustomJdbcDriversConnectionPermissionDenied";
  errorDescription: "Could not uploadCustomJdbcDrivers the Connection.";
  errorInstanceId: string;
  parameters: {
    connectionRid: unknown;
  };
}

/**
 * A VirtualTable with the same name already exists in the parent folder.
 *
 * Log Safety: UNSAFE
 */
export interface VirtualTableAlreadyExists {
  errorCode: "CONFLICT";
  errorName: "VirtualTableAlreadyExists";
  errorDescription:
    "A VirtualTable with the same name already exists in the parent folder.";
  errorInstanceId: string;
  parameters: {
    parentRid: unknown;
    name: unknown;
  };
}

/**
 * User lacks permission to use the specified connection for virtual table registration.
 *
 * Log Safety: SAFE
 */
export interface VirtualTableRegisterFromSourcePermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "VirtualTableRegisterFromSourcePermissionDenied";
  errorDescription:
    "User lacks permission to use the specified connection for virtual table registration.";
  errorInstanceId: string;
  parameters: {};
}
