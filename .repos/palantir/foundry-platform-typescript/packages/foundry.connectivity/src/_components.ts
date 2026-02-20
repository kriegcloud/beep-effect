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

import type * as _Core from "@osdk/foundry.core";
import type * as _Filesystem from "@osdk/foundry.filesystem";

export type LooselyBrandedString<T extends string> = string & {
  __LOOSE_BRAND?: T;
};

/**
 * The Resource Identifier (RID) of an Agent.
 *
 * Log Safety: UNSAFE
 */
export type AgentRid = LooselyBrandedString<"AgentRid">;

/**
   * The API key used to authenticate to the external system.
This can be configured as a header or query parameter.
   *
   * Log Safety: DO_NOT_LOG
   */
export interface ApiKeyAuthentication {
  location: RestRequestApiKeyLocation;
  apiKey: EncryptedProperty;
}

/**
 * Log Safety: DO_NOT_LOG
 */
export interface AsPlaintextValue {
  value: PlaintextValue;
}

/**
 * Log Safety: UNSAFE
 */
export interface AsSecretName {
  value: SecretName;
}

/**
   * Access keys are long-term
credentials for an IAM user or the AWS account root user.
Access keys consist of two parts: an access key ID (for example, AKIAIOSFODNN7EXAMPLE) and a secret access
key (for example, wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY). You must use both the access key ID and
secret access key together to authenticate your requests.
   *
   * Log Safety: DO_NOT_LOG
   */
export interface AwsAccessKey {
  accessKeyId: string;
  secretAccessKey: EncryptedProperty;
}

/**
   * OpenID Connect (OIDC) is an open authentication protocol that allows
you to authenticate to external system resources without the use of static credentials.
   *
   * Log Safety: UNSAFE
   */
export interface AwsOidcAuthentication {
  audience: string;
  issuerUrl: string;
  subject: ConnectionRid;
}

/**
 * Log Safety: DO_NOT_LOG
 */
export interface BasicCredentials {
  username: string;
  password: EncryptedProperty;
}

/**
 * The bearer token used to authenticate to the external system.
 *
 * Log Safety: DO_NOT_LOG
 */
export interface BearerToken {
  bearerToken: EncryptedProperty;
}

/**
 * Pointer to the table in BigQuery. Uses the BigQuery table identifier of project, dataset and table.
 *
 * Log Safety: UNSAFE
 */
export interface BigQueryVirtualTableConfig {
  project: string;
  dataset: string;
  table: string;
}

/**
   * Cloud identities allow you to authenticate to
cloud provider resources without the use of static credentials.
   *
   * Log Safety: SAFE
   */
export interface CloudIdentity {
  cloudIdentityRid: CloudIdentityRid;
}

/**
 * The Resource Identifier (RID) of a Cloud Identity.
 *
 * Log Safety: SAFE
 */
export type CloudIdentityRid = LooselyBrandedString<"CloudIdentityRid">;

/**
 * Log Safety: DO_NOT_LOG
 */
export interface Connection {
  rid: ConnectionRid;
  parentFolderRid: _Filesystem.FolderRid;
  displayName: ConnectionDisplayName;
  exportSettings: ConnectionExportSettings;
  worker: ConnectionWorker;
  configuration: ConnectionConfiguration;
}

/**
 * Log Safety: DO_NOT_LOG
 */
export type ConnectionConfiguration =
  | ({ type: "s3" } & S3ConnectionConfiguration)
  | ({ type: "rest" } & RestConnectionConfiguration)
  | ({ type: "snowflake" } & SnowflakeConnectionConfiguration)
  | ({ type: "databricks" } & DatabricksConnectionConfiguration)
  | ({ type: "smb" } & SmbConnectionConfiguration)
  | ({ type: "jdbc" } & JdbcConnectionConfiguration);

/**
 * The display name of the Connection. The display name must not be blank.
 *
 * Log Safety: UNSAFE
 */
export type ConnectionDisplayName = LooselyBrandedString<
  "ConnectionDisplayName"
>;

/**
 * The export settings of a Connection.
 *
 * Log Safety: SAFE
 */
export interface ConnectionExportSettings {
  exportsEnabled: boolean;
  exportEnabledWithoutMarkingsValidation: boolean;
}

/**
 * The Resource Identifier (RID) of a Connection (also known as a source).
 *
 * Log Safety: SAFE
 */
export type ConnectionRid = LooselyBrandedString<"ConnectionRid">;

/**
   * The worker of a Connection, which defines where
compute for capabilities are run.
   *
   * Log Safety: SAFE
   */
export type ConnectionWorker =
  | ({ type: "unknownWorker" } & UnknownWorker)
  | ({ type: "foundryWorker" } & FoundryWorker);

/**
 * Log Safety: DO_NOT_LOG
 */
export interface CreateConnectionRequest {
  parentFolderRid: _Filesystem.FolderRid;
  configuration: CreateConnectionRequestConnectionConfiguration;
  displayName: ConnectionDisplayName;
  worker: CreateConnectionRequestConnectionWorker;
}

/**
 * Log Safety: DO_NOT_LOG
 */
export interface CreateConnectionRequestAsPlaintextValue {
  value: PlaintextValue;
}

/**
 * Log Safety: UNSAFE
 */
export interface CreateConnectionRequestAsSecretName {
  value: SecretName;
}

/**
 * Log Safety: DO_NOT_LOG
 */
export interface CreateConnectionRequestAwsAccessKey {
  accessKeyId: string;
  secretAccessKey: CreateConnectionRequestEncryptedProperty;
}

/**
 * Log Safety: UNSAFE
 */
export interface CreateConnectionRequestAwsOidcAuthentication {
  audience: string;
}

/**
 * Log Safety: DO_NOT_LOG
 */
export interface CreateConnectionRequestBasicCredentials {
  password: CreateConnectionRequestEncryptedProperty;
  username: string;
}

/**
 * Log Safety: SAFE
 */
export interface CreateConnectionRequestCloudIdentity {
  cloudIdentityRid: CloudIdentityRid;
}

/**
 * Log Safety: DO_NOT_LOG
 */
export type CreateConnectionRequestConnectionConfiguration =
  | ({ type: "s3" } & CreateConnectionRequestS3ConnectionConfiguration)
  | ({ type: "rest" } & CreateConnectionRequestRestConnectionConfiguration)
  | ({
    type: "snowflake";
  } & CreateConnectionRequestSnowflakeConnectionConfiguration)
  | ({
    type: "databricks";
  } & CreateConnectionRequestDatabricksConnectionConfiguration)
  | ({ type: "smb" } & CreateConnectionRequestSmbConnectionConfiguration)
  | ({ type: "jdbc" } & CreateConnectionRequestJdbcConnectionConfiguration);

/**
   * The worker of a Connection, which defines where
compute for capabilities are run.
   *
   * Log Safety: SAFE
   */
export type CreateConnectionRequestConnectionWorker =
  | ({ type: "unknownWorker" } & CreateConnectionRequestUnknownWorker)
  | ({ type: "foundryWorker" } & CreateConnectionRequestFoundryWorker);

/**
 * The method of authentication for connecting to an external Databricks system.
 *
 * Log Safety: DO_NOT_LOG
 */
export type CreateConnectionRequestDatabricksAuthenticationMode =
  | ({
    type: "workflowIdentityFederation";
  } & CreateConnectionRequestWorkflowIdentityFederation)
  | ({ type: "oauthM2M" } & CreateConnectionRequestOauthMachineToMachineAuth)
  | ({
    type: "personalAccessToken";
  } & CreateConnectionRequestPersonalAccessToken)
  | ({ type: "basic" } & CreateConnectionRequestBasicCredentials);

/**
 * Log Safety: DO_NOT_LOG
 */
export interface CreateConnectionRequestDatabricksConnectionConfiguration {
  hostName: string;
  httpPath: string;
  jdbcProperties: JdbcProperties;
  authentication: CreateConnectionRequestDatabricksAuthenticationMode;
}

/**
 * Log Safety: SAFE
 */
export interface CreateConnectionRequestDuration {
  unit: _Core.TimeUnit;
  value: number;
}

/**
   * When reading an encrypted property, the secret name representing the encrypted value will be returned.
When writing to an encrypted property:

If a plaintext value is passed as an input, the plaintext value will be encrypted and saved to the property.
If a secret name is passed as an input, the secret name must match the existing secret name of the property
and the property will retain its previously encrypted value.
   *
   * Log Safety: DO_NOT_LOG
   */
export type CreateConnectionRequestEncryptedProperty =
  | ({ type: "asSecretName" } & CreateConnectionRequestAsSecretName)
  | ({ type: "asPlaintextValue" } & CreateConnectionRequestAsPlaintextValue);

/**
 * Log Safety: SAFE
 */
export interface CreateConnectionRequestFoundryWorker {
  networkEgressPolicyRids: Array<NetworkEgressPolicyRid>;
}

/**
 * Log Safety: DO_NOT_LOG
 */
export interface CreateConnectionRequestJdbcConnectionConfiguration {
  credentials?: BasicCredentials;
  driverClass: string;
  jdbcProperties: JdbcProperties;
  url: string;
}

/**
 * Log Safety: DO_NOT_LOG
 */
export interface CreateConnectionRequestOauthMachineToMachineAuth {
  clientID: string;
  clientSecret: CreateConnectionRequestEncryptedProperty;
}

/**
 * Log Safety: DO_NOT_LOG
 */
export interface CreateConnectionRequestPersonalAccessToken {
  personalAccessToken: CreateConnectionRequestEncryptedProperty;
}

/**
   * When creating or updating additional secrets, use SecretsWithPlaintextValues.
When fetching the RestConnectionConfiguration, SecretsNames will be provided.
   *
   * Log Safety: DO_NOT_LOG
   */
export type CreateConnectionRequestRestConnectionAdditionalSecrets =
  | ({
    type: "asSecretsWithPlaintextValues";
  } & CreateConnectionRequestSecretsWithPlaintextValues)
  | ({ type: "asSecretsNames" } & CreateConnectionRequestSecretsNames);

/**
 * Log Safety: DO_NOT_LOG
 */
export interface CreateConnectionRequestRestConnectionConfiguration {
  additionalSecrets?: RestConnectionAdditionalSecrets;
  oauth2ClientRid?: string;
  domains: Array<Domain>;
}

/**
 * Log Safety: DO_NOT_LOG
 */
export type CreateConnectionRequestS3AuthenticationMode =
  | ({ type: "awsAccessKey" } & CreateConnectionRequestAwsAccessKey)
  | ({ type: "cloudIdentity" } & CreateConnectionRequestCloudIdentity)
  | ({ type: "oidc" } & CreateConnectionRequestAwsOidcAuthentication);

/**
 * Log Safety: DO_NOT_LOG
 */
export interface CreateConnectionRequestS3ConnectionConfiguration {
  connectionTimeoutMillis?: string;
  maxErrorRetry?: number;
  bucketUrl: string;
  clientKmsConfiguration?: S3KmsConfiguration;
  matchSubfolderExactly?: boolean;
  stsRoleConfiguration?: StsRoleConfiguration;
  s3Endpoint?: string;
  socketTimeoutMillis?: string;
  enableRequesterPays?: boolean;
  s3EndpointSigningRegion?: Region;
  region?: Region;
  authenticationMode?: S3AuthenticationMode;
  proxyConfiguration?: S3ProxyConfiguration;
  maxConnections?: number;
}

/**
 * Log Safety: UNSAFE
 */
export interface CreateConnectionRequestS3KmsConfiguration {
  kmsRegion?: Region;
  kmsKey: string;
}

/**
 * Log Safety: DO_NOT_LOG
 */
export interface CreateConnectionRequestS3ProxyConfiguration {
  nonProxyHosts?: Array<string>;
  protocol?: Protocol;
  port: number;
  credentials?: BasicCredentials;
  host: string;
}

/**
 * Log Safety: SAFE
 */
export interface CreateConnectionRequestSecretsNames {}

/**
 * Log Safety: DO_NOT_LOG
 */
export interface CreateConnectionRequestSecretsWithPlaintextValues {
  secrets: Record<SecretName, PlaintextValue>;
}

/**
 * Log Safety: DO_NOT_LOG
 */
export type CreateConnectionRequestSmbAuth = {
  type: "usernamePassword";
} & CreateConnectionRequestSmbUsernamePasswordAuth;

/**
 * Log Safety: DO_NOT_LOG
 */
export interface CreateConnectionRequestSmbConnectionConfiguration {
  proxy?: SmbProxyConfiguration;
  hostname: string;
  port?: number;
  auth: CreateConnectionRequestSmbAuth;
  share: string;
  baseDirectory?: string;
  requireMessageSigning?: boolean;
}

/**
 * Log Safety: UNSAFE
 */
export interface CreateConnectionRequestSmbProxyConfiguration {
  hostname: string;
  protocol: SmbProxyType;
  port: number;
}

/**
 * Log Safety: DO_NOT_LOG
 */
export interface CreateConnectionRequestSmbUsernamePasswordAuth {
  password: CreateConnectionRequestEncryptedProperty;
  domain?: string;
  username: string;
}

/**
 * Log Safety: DO_NOT_LOG
 */
export type CreateConnectionRequestSnowflakeAuthenticationMode =
  | ({ type: "externalOauth" } & CreateConnectionRequestSnowflakeExternalOauth)
  | ({
    type: "keyPair";
  } & CreateConnectionRequestSnowflakeKeyPairAuthentication)
  | ({ type: "basic" } & CreateConnectionRequestBasicCredentials);

/**
 * Log Safety: DO_NOT_LOG
 */
export interface CreateConnectionRequestSnowflakeConnectionConfiguration {
  schema?: string;
  database?: string;
  role?: string;
  accountIdentifier: string;
  jdbcProperties: JdbcProperties;
  warehouse?: string;
  authenticationMode: CreateConnectionRequestSnowflakeAuthenticationMode;
}

/**
 * Log Safety: SAFE
 */
export interface CreateConnectionRequestSnowflakeExternalOauth {}

/**
 * Log Safety: DO_NOT_LOG
 */
export interface CreateConnectionRequestSnowflakeKeyPairAuthentication {
  privateKey: CreateConnectionRequestEncryptedProperty;
  user: string;
}

/**
 * Log Safety: UNSAFE
 */
export interface CreateConnectionRequestStsRoleConfiguration {
  stsEndpoint?: string;
  roleArn: string;
  roleSessionName: string;
  externalId?: string;
  roleSessionDuration?: _Core.Duration;
}

/**
 * Log Safety: SAFE
 */
export interface CreateConnectionRequestUnknownWorker {}

/**
 * Log Safety: UNSAFE
 */
export interface CreateConnectionRequestWorkflowIdentityFederation {
  audience: string;
  servicePrincipalApplicationId?: string;
}

/**
 * Log Safety: UNSAFE
 */
export interface CreateFileImportRequest {
  datasetRid: _Core.DatasetRid;
  importMode: FileImportMode;
  displayName: FileImportDisplayName;
  branchName?: _Core.BranchName;
  subfolder?: string;
  fileImportFilters: Array<FileImportFilter>;
}

/**
 * Log Safety: UNSAFE
 */
export interface CreateTableImportRequest {
  datasetRid: _Core.DatasetRid;
  importMode: TableImportMode;
  displayName: TableImportDisplayName;
  allowSchemaChanges?: TableImportAllowSchemaChanges;
  branchName?: _Core.BranchName;
  config: CreateTableImportRequestTableImportConfig;
}

/**
 * Log Safety: UNSAFE
 */
export interface CreateTableImportRequestDatabricksTableImportConfig {
  initialIncrementalState?: TableImportInitialIncrementalState;
  query: TableImportQuery;
}

/**
 * Log Safety: UNSAFE
 */
export interface CreateTableImportRequestDateColumnInitialIncrementalState {
  currentValue: string;
  columnName: string;
}

/**
 * Log Safety: UNSAFE
 */
export interface CreateTableImportRequestDecimalColumnInitialIncrementalState {
  currentValue: string;
  columnName: string;
}

/**
 * Log Safety: UNSAFE
 */
export interface CreateTableImportRequestIntegerColumnInitialIncrementalState {
  currentValue: number;
  columnName: string;
}

/**
 * Log Safety: UNSAFE
 */
export interface CreateTableImportRequestJdbcTableImportConfig {
  initialIncrementalState?: TableImportInitialIncrementalState;
  query: TableImportQuery;
}

/**
 * Log Safety: UNSAFE
 */
export interface CreateTableImportRequestLongColumnInitialIncrementalState {
  currentValue: string;
  columnName: string;
}

/**
 * Log Safety: UNSAFE
 */
export interface CreateTableImportRequestMicrosoftAccessTableImportConfig {
  initialIncrementalState?: TableImportInitialIncrementalState;
  query: TableImportQuery;
}

/**
 * Log Safety: UNSAFE
 */
export interface CreateTableImportRequestMicrosoftSqlServerTableImportConfig {
  initialIncrementalState?: TableImportInitialIncrementalState;
  query: TableImportQuery;
}

/**
 * Log Safety: UNSAFE
 */
export interface CreateTableImportRequestOracleTableImportConfig {
  initialIncrementalState?: TableImportInitialIncrementalState;
  query: TableImportQuery;
}

/**
 * Log Safety: UNSAFE
 */
export interface CreateTableImportRequestPostgreSqlTableImportConfig {
  initialIncrementalState?: TableImportInitialIncrementalState;
  query: TableImportQuery;
}

/**
 * Log Safety: UNSAFE
 */
export interface CreateTableImportRequestSnowflakeTableImportConfig {
  initialIncrementalState?: TableImportInitialIncrementalState;
  query: TableImportQuery;
}

/**
 * Log Safety: UNSAFE
 */
export interface CreateTableImportRequestStringColumnInitialIncrementalState {
  currentValue: string;
  columnName: string;
}

/**
 * The import configuration for a specific connector type.
 *
 * Log Safety: UNSAFE
 */
export type CreateTableImportRequestTableImportConfig =
  | ({
    type: "databricksImportConfig";
  } & CreateTableImportRequestDatabricksTableImportConfig)
  | ({
    type: "jdbcImportConfig";
  } & CreateTableImportRequestJdbcTableImportConfig)
  | ({
    type: "microsoftSqlServerImportConfig";
  } & CreateTableImportRequestMicrosoftSqlServerTableImportConfig)
  | ({
    type: "postgreSqlImportConfig";
  } & CreateTableImportRequestPostgreSqlTableImportConfig)
  | ({
    type: "microsoftAccessImportConfig";
  } & CreateTableImportRequestMicrosoftAccessTableImportConfig)
  | ({
    type: "snowflakeImportConfig";
  } & CreateTableImportRequestSnowflakeTableImportConfig)
  | ({
    type: "oracleImportConfig";
  } & CreateTableImportRequestOracleTableImportConfig);

/**
   * The incremental configuration for a table import enables append-style transactions from the same table without duplication of data.
You must provide a monotonically increasing column such as a timestamp or id and an initial value for this column.
An incremental table import will import rows where the value is greater than the largest already imported.
You can use the '?' character to reference the incremental state value when constructing your query.
Normally this would be used in a WHERE clause or similar filter applied in order to only sync data with an incremental column value
larger than the previously observed maximum value stored in the incremental state.
   *
   * Log Safety: UNSAFE
   */
export type CreateTableImportRequestTableImportInitialIncrementalState =
  | ({
    type: "stringColumnInitialIncrementalState";
  } & CreateTableImportRequestStringColumnInitialIncrementalState)
  | ({
    type: "dateColumnInitialIncrementalState";
  } & CreateTableImportRequestDateColumnInitialIncrementalState)
  | ({
    type: "integerColumnInitialIncrementalState";
  } & CreateTableImportRequestIntegerColumnInitialIncrementalState)
  | ({
    type: "timestampColumnInitialIncrementalState";
  } & CreateTableImportRequestTimestampColumnInitialIncrementalState)
  | ({
    type: "longColumnInitialIncrementalState";
  } & CreateTableImportRequestLongColumnInitialIncrementalState)
  | ({
    type: "decimalColumnInitialIncrementalState";
  } & CreateTableImportRequestDecimalColumnInitialIncrementalState);

/**
 * Log Safety: UNSAFE
 */
export interface CreateTableImportRequestTimestampColumnInitialIncrementalState {
  currentValue: string;
  columnName: string;
}

/**
 * Log Safety: UNSAFE
 */
export interface CreateVirtualTableRequest {
  markings?: Array<_Core.MarkingId>;
  parentRid: _Filesystem.FolderRid;
  name: TableName;
  config: VirtualTableConfig;
}

/**
 * The method of authentication for connecting to an external Databricks system.
 *
 * Log Safety: DO_NOT_LOG
 */
export type DatabricksAuthenticationMode =
  | ({ type: "workflowIdentityFederation" } & WorkflowIdentityFederation)
  | ({ type: "oauthM2M" } & OauthMachineToMachineAuth)
  | ({ type: "personalAccessToken" } & PersonalAccessToken)
  | ({ type: "basic" } & BasicCredentials);

/**
   * The configuration needed to connect to a Databricks external system.
Refer to the official Databricks documentation
for more information on how to obtain connection details for your system.
   *
   * Log Safety: DO_NOT_LOG
   */
export interface DatabricksConnectionConfiguration {
  hostName: string;
  httpPath: string;
  authentication: DatabricksAuthenticationMode;
  jdbcProperties: JdbcProperties;
}

/**
 * The table import configuration for a Databricks connection.
 *
 * Log Safety: UNSAFE
 */
export interface DatabricksTableImportConfig {
  query: TableImportQuery;
  initialIncrementalState?: TableImportInitialIncrementalState;
}

/**
 * The state for an incremental table import using a column with a date type.
 *
 * Log Safety: UNSAFE
 */
export interface DateColumnInitialIncrementalState {
  columnName: string;
  currentValue: string;
}

/**
 * The state for an incremental table import using a column with a decimal data type.
 *
 * Log Safety: UNSAFE
 */
export interface DecimalColumnInitialIncrementalState {
  columnName: string;
  currentValue: string;
}

/**
 * Pointer to the Delta table in cloud object storage (e.g., Azure Data Lake Storage, Google Cloud Storage, S3).
 *
 * Log Safety: UNSAFE
 */
export interface DeltaVirtualTableConfig {
  path: string;
}

/**
 * The domain that the connection is allowed to access.
 *
 * Log Safety: DO_NOT_LOG
 */
export interface Domain {
  scheme?: UriScheme;
  host: string;
  port?: number;
  auth?: RestAuthenticationMode;
}

/**
   * When reading an encrypted property, the secret name representing the encrypted value will be returned.
When writing to an encrypted property:

If a plaintext value is passed as an input, the plaintext value will be encrypted and saved to the property.
If a secret name is passed as an input, the secret name must match the existing secret name of the property
and the property will retain its previously encrypted value.
   *
   * Log Safety: DO_NOT_LOG
   */
export type EncryptedProperty =
  | ({ type: "asSecretName" } & AsSecretName)
  | ({ type: "asPlaintextValue" } & AsPlaintextValue);

/**
 * If any file has a relative path matching the regular expression, sync all files in the subfolder that are not otherwise filtered.
 *
 * Log Safety: UNSAFE
 */
export interface FileAnyPathMatchesFilter {
  regex: string;
}

/**
 * Import all filtered files only if there are at least the specified number of files remaining.
 *
 * Log Safety: SAFE
 */
export interface FileAtLeastCountFilter {
  minFilesCount: number;
}

/**
   * Only import files that have changed or been added since the last import run. Whether or not a file is considered to be changed is determined by the specified file properties.
This will exclude files uploaded in any previous imports, regardless of the file import mode used. A SNAPSHOT file import mode does not reset the filter.
   *
   * Log Safety: SAFE
   */
export interface FileChangedSinceLastUploadFilter {
  fileProperties: Array<FileProperty>;
}

/**
 * The format of files in the upstream source.
 *
 * Log Safety: SAFE
 */
export type FileFormat = "AVRO" | "CSV" | "PARQUET";

/**
 * Log Safety: UNSAFE
 */
export interface FileImport {
  rid: FileImportRid;
  connectionRid: ConnectionRid;
  datasetRid: _Core.DatasetRid;
  branchName?: _Core.BranchName;
  displayName: FileImportDisplayName;
  fileImportFilters: Array<FileImportFilter>;
  importMode: FileImportMode;
  subfolder?: string;
}

/**
   * A custom file import filter. Custom file import filters can be fetched but cannot currently be used
when creating or updating file imports.
   *
   * Log Safety: UNSAFE
   */
export interface FileImportCustomFilter {
  config: any;
}

/**
 * Log Safety: UNSAFE
 */
export type FileImportDisplayName = LooselyBrandedString<
  "FileImportDisplayName"
>;

/**
   * Filters allow you to filter source files
before they are imported into Foundry.
   *
   * Log Safety: UNSAFE
   */
export type FileImportFilter =
  | ({ type: "pathNotMatchesFilter" } & FilePathNotMatchesFilter)
  | ({ type: "anyPathMatchesFilter" } & FileAnyPathMatchesFilter)
  | ({ type: "filesCountLimitFilter" } & FilesCountLimitFilter)
  | ({
    type: "changedSinceLastUploadFilter";
  } & FileChangedSinceLastUploadFilter)
  | ({ type: "customFilter" } & FileImportCustomFilter)
  | ({ type: "lastModifiedAfterFilter" } & FileLastModifiedAfterFilter)
  | ({ type: "pathMatchesFilter" } & FilePathMatchesFilter)
  | ({ type: "atLeastCountFilter" } & FileAtLeastCountFilter)
  | ({ type: "fileSizeFilter" } & FileSizeFilter);

/**
   * Import mode governs how raw files are read from an external system, and written into a Foundry dataset.
SNAPSHOT: Defines a new dataset state consisting only of files from a particular import execution.
APPEND: Purely additive and yields data from previous import executions in addition to newly added files.
UPDATE: Replaces existing files from previous import executions based on file names.
   *
   * Log Safety: SAFE
   */
export type FileImportMode = "SNAPSHOT" | "APPEND" | "UPDATE";

/**
 * The Resource Identifier (RID) of a FileImport (also known as a batch sync).
 *
 * Log Safety: SAFE
 */
export type FileImportRid = LooselyBrandedString<"FileImportRid">;

/**
 * Only import files that have been modified after a specified timestamp
 *
 * Log Safety: UNSAFE
 */
export interface FileLastModifiedAfterFilter {
  afterTimestamp?: string;
}

/**
   * Only import files whose path (relative to the root of the source) matches the regular expression.
Example
Suppose we are importing files from relative/subfolder.
relative/subfolder contains:

relative/subfolder/include-file.txt
relative/subfolder/exclude-file.txt
relative/subfolder/other-file.txt

With the relative/subfolder/include-.*.txt regex, only relative/subfolder/include-file.txt will be imported.
   *
   * Log Safety: UNSAFE
   */
export interface FilePathMatchesFilter {
  regex: string;
}

/**
   * Only import files whose path (relative to the root of the source) does not match the regular expression.
Example
Suppose we are importing files from relative/subfolder.
relative/subfolder contains:

relative/subfolder/include-file.txt
relative/subfolder/exclude-file.txt
relative/subfolder/other-file.txt

With the relative/subfolder/exclude-.*.txt regex, both relative/subfolder/include-file.txt and relative/subfolder/other-file.txt will be imported,
and relative/subfolder/exclude-file.txt will be excluded from the import.
   *
   * Log Safety: UNSAFE
   */
export interface FilePathNotMatchesFilter {
  regex: string;
}

/**
 * Log Safety: SAFE
 */
export type FileProperty = "LAST_MODIFIED" | "SIZE";

/**
   * Only retain filesCount number of files in each transaction.
The choice of files to retain is made without any guarantee of order.
This option can increase the reliability of incremental syncs.
   *
   * Log Safety: SAFE
   */
export interface FilesCountLimitFilter {
  filesCount: number;
}

/**
   * Only import files whose size is between the specified minimum and maximum values.
At least one of gt or lt should be present.
If both are present, the value specified for gt must be strictly less than lt - 1.
   *
   * Log Safety: SAFE
   */
export interface FileSizeFilter {
  gt?: _Core.SizeBytes;
  lt?: _Core.SizeBytes;
}

/**
 * Pointer to the table in cloud object storage (e.g., Azure Data Lake Storage, Google Cloud Storage, S3).
 *
 * Log Safety: UNSAFE
 */
export interface FilesVirtualTableConfig {
  format: FileFormat;
  path: string;
}

/**
 * The unique resource identifier (RID) of a Folder.
 *
 * Log Safety: SAFE
 */
export type FolderRid = LooselyBrandedString<"FolderRid">;

/**
   * The Foundry worker is used to run capabilities
in Foundry.
This is the preferred method for connections, as these connections benefit from Foundry's containerized
and scalable job execution, improved stability and do not incur the maintenance overhead associated with agents.
   *
   * Log Safety: SAFE
   */
export interface FoundryWorker {
  networkEgressPolicyRids: Array<NetworkEgressPolicyRid>;
}

/**
 * Log Safety: SAFE
 */
export interface GetConfigurationConnectionsBatchRequestElement {
  connectionRid: ConnectionRid;
}

/**
 * Log Safety: DO_NOT_LOG
 */
export interface GetConfigurationConnectionsBatchResponse {
  data: Record<ConnectionRid, ConnectionConfiguration>;
}

/**
 * Pointer to the table in AWS Glue.
 *
 * Log Safety: UNSAFE
 */
export interface GlueVirtualTableConfig {
  database: string;
  table: string;
}

/**
 * Log Safety: UNSAFE
 */
export interface HeaderApiKey {
  headerName: string;
}

/**
 * Pointer to the Iceberg table.
 *
 * Log Safety: UNSAFE
 */
export interface IcebergVirtualTableConfig {
  tableIdentifier: string;
  warehousePath?: string;
}

/**
 * The state for an incremental table import using a numeric integer datatype.
 *
 * Log Safety: UNSAFE
 */
export interface IntegerColumnInitialIncrementalState {
  columnName: string;
  currentValue: number;
}

/**
 * Reasons why a connection configuration is invalid.
 *
 * Log Safety: SAFE
 */
export type InvalidConnectionReason =
  | "CONNECTION_NOT_FOUND"
  | "INVALID_CREDENTIALS"
  | "NETWORK_POLICY_VIOLATION"
  | "CONNECTION_UNAVAILABLE"
  | "CANNOT_DESERIALIZE"
  | "CANNOT_SUBSTITUTE_SECRETS"
  | "CANNOT_USE_USER_HOME_FOLDER"
  | "INVALID_SOURCE_RUNTIME"
  | "INVALID_SOURCE_TYPE"
  | "MISSING_CREDENTIALS"
  | "MISSING_PROXY_SETTINGS"
  | "NOT_CLOUD_RUNTIME"
  | "NO_AGENTS_ASSIGNED"
  | "SERVICE_UNAVAILABLE"
  | "TOO_MANY_REQUESTS"
  | "AZURE_CONTAINER_DOES_NOT_EXIST"
  | "AZURE_MANAGED_IDENTITY_AUTH_NOT_SUPPORTED"
  | "AZURE_REFRESH_TOKEN_AUTH_NOT_SUPPORTED"
  | "AZURE_SHARED_ACCESS_SIGNATURE_AUTH_NOT_SUPPORTED"
  | "AZURE_SHARED_KEY_AUTH_NOT_SUPPORTED"
  | "AZURE_TENANT_NOT_FOUND"
  | "INVALID_ABFS_ROOT_DIRECTORY"
  | "INVALID_CLIENT_ENDPOINT"
  | "DATABRICKS_AUTH_UNSUPPORTED"
  | "DATABRICKS_BASIC_AUTH_NOT_SUPPORTED"
  | "DATABRICKS_INVALID_CLIENT_CREDENTIALS"
  | "DATABRICKS_INVALID_HOST"
  | "DATABRICKS_INVALID_HTTP_PATH"
  | "DATABRICKS_INVALID_OIDC_CREDENTIALS"
  | "DATABRICKS_INVALID_TOKEN_URL"
  | "GCP_INSTANCE_AUTH_NOT_SUPPORTED"
  | "GCP_INVALID_OIDC_CREDENTIALS"
  | "INVALID_GCS_CONFIG"
  | "INVALID_GCS_URL"
  | "GCS_INVALID_PREFIX_PATH"
  | "MISSING_GLUE_CATALOG"
  | "INVALID_HIVE_URL"
  | "INVALID_KERBEROS_URL"
  | "MISSING_HIVE_CONFIGURATION"
  | "ICEBERG_CATALOG_UNSUPPORTED"
  | "INVALID_ICEBERG_CATALOG_URL"
  | "INVALID_ICEBERG_TOKEN_URL"
  | "CONNECTION_FAILED"
  | "INVALID_JDBC_DRIVER"
  | "INVALID_JDBC_URL"
  | "AWS_BUCKET_DOES_NOT_EXIST"
  | "AWS_SESSION_TOKEN_NOT_SUPPORTED"
  | "INVALID_S3_ENDPOINT"
  | "INVALID_S3_URL"
  | "INVALID_STS_ENDPOINT"
  | "MISSING_STS_ROLE"
  | "STS_ASSUME_ROLE_DENIED"
  | "INVALID_SNOWFLAKE_URL"
  | "SNOWFLAKE_IAM_AUTH_NOT_SUPPORTED"
  | "SNOWFLAKE_RSA_AUTH_NOT_SUPPORTED"
  | "INVALID_UNITY_CATALOG_TOKEN_URL"
  | "INVALID_UNITY_CATALOG_URL"
  | "MISSING_UNITY_CATALOG"
  | "UNITY_CATALOG_EXTERNAL_ACCESS_NOT_ENABLED"
  | "UNITY_CATALOG_INSUFFICIENT_PERMISSIONS"
  | "UNITY_CATALOG_TEMPORARY_CREDENTIALS_FAILED";

/**
 * Describes specific reasons why a connection configuration is invalid.
 *
 * Log Safety: SAFE
 */
export type InvalidTableReason =
  | "TABLE_NOT_FOUND"
  | "INVALID_TABLE_NAME"
  | "SCHEMA_VALIDATION_FAILED"
  | "TABLE_ACCESS_DENIED";

/**
 * The configuration needed to connect to an external system using the JDBC protocol.
 *
 * Log Safety: DO_NOT_LOG
 */
export interface JdbcConnectionConfiguration {
  url: string;
  driverClass: string;
  uploadedJdbcDrivers: Array<JdbcDriverArtifactName>;
  jdbcProperties: JdbcProperties;
  credentials?: BasicCredentials;
}

/**
 * The name of the uploaded JDBC artifact.
 *
 * Log Safety: UNSAFE
 */
export type JdbcDriverArtifactName = LooselyBrandedString<
  "JdbcDriverArtifactName"
>;

/**
   * A map of properties passed
to the JDBC driver to configure behavior. Refer to the documentation of your specific connection type for additional
available JDBC properties to add to your connection configuration.
This should only contain unencrypted properties, all values specified here are sent unencrypted to Foundry.
   *
   * Log Safety: UNSAFE
   */
export type JdbcProperties = Record<string, string>;

/**
 * The import configuration for a custom JDBC connection.
 *
 * Log Safety: UNSAFE
 */
export interface JdbcTableImportConfig {
  query: TableImportQuery;
  initialIncrementalState?: TableImportInitialIncrementalState;
}

/**
 * Log Safety: UNSAFE
 */
export interface ListFileImportsResponse {
  data: Array<FileImport>;
  nextPageToken?: _Core.PageToken;
}

/**
 * Log Safety: UNSAFE
 */
export interface ListTableImportsResponse {
  data: Array<TableImport>;
  nextPageToken?: _Core.PageToken;
}

/**
 * The state for an incremental table import using a column with a numeric long datatype.
 *
 * Log Safety: UNSAFE
 */
export interface LongColumnInitialIncrementalState {
  columnName: string;
  currentValue: string;
}

/**
 * The ID of a security marking.
 *
 * Log Safety: UNSAFE
 */
export type MarkingId = LooselyBrandedString<"MarkingId">;

/**
 * The import configuration for a Microsoft Access connection.
 *
 * Log Safety: UNSAFE
 */
export interface MicrosoftAccessTableImportConfig {
  query: TableImportQuery;
  initialIncrementalState?: TableImportInitialIncrementalState;
}

/**
 * The import configuration for a Microsoft SQL Server connection.
 *
 * Log Safety: UNSAFE
 */
export interface MicrosoftSqlServerTableImportConfig {
  query: TableImportQuery;
  initialIncrementalState?: TableImportInitialIncrementalState;
}

/**
 * The Resource Identifier (RID) of a Network Egress Policy.
 *
 * Log Safety: SAFE
 */
export type NetworkEgressPolicyRid = LooselyBrandedString<
  "NetworkEgressPolicyRid"
>;

/**
   * Authenticate as a service principal using OAuth. Create a service principal in Databricks and generate an OAuth secret to obtain a client ID and secret.
Read the official Databricks documentation for more information about OAuth machine-to-machine
authentication.
   *
   * Log Safety: DO_NOT_LOG
   */
export interface OauthMachineToMachineAuth {
  clientID: string;
  clientSecret: EncryptedProperty;
}

/**
 * The import configuration for an Oracle Database 21 connection.
 *
 * Log Safety: UNSAFE
 */
export interface OracleTableImportConfig {
  query: TableImportQuery;
  initialIncrementalState?: TableImportInitialIncrementalState;
}

/**
   * Authenticate as a user or service principal using a personal access token.
Read the official Databricks documentation for information on generating a personal access token.
   *
   * Log Safety: DO_NOT_LOG
   */
export interface PersonalAccessToken {
  personalAccessToken: EncryptedProperty;
}

/**
 * Log Safety: DO_NOT_LOG
 */
export type PlaintextValue = LooselyBrandedString<"PlaintextValue">;

/**
 * The import configuration for a PostgreSQL connection.
 *
 * Log Safety: UNSAFE
 */
export interface PostgreSqlTableImportConfig {
  query: TableImportQuery;
  initialIncrementalState?: TableImportInitialIncrementalState;
}

/**
 * Protocol to establish a connection with another system.
 *
 * Log Safety: SAFE
 */
export type Protocol = "HTTP" | "HTTPS";

/**
 * Log Safety: UNSAFE
 */
export interface QueryParameterApiKey {
  queryParameterName: string;
}

/**
 * The region of the external system.
 *
 * Log Safety: UNSAFE
 */
export type Region = LooselyBrandedString<"Region">;

/**
 * Log Safety: UNSAFE
 */
export interface ReplaceFileImportRequest {
  importMode: FileImportMode;
  displayName: FileImportDisplayName;
  subfolder?: string;
  fileImportFilters: Array<FileImportFilter>;
}

/**
 * Log Safety: UNSAFE
 */
export interface ReplaceTableImportRequest {
  importMode: TableImportMode;
  displayName: TableImportDisplayName;
  allowSchemaChanges?: TableImportAllowSchemaChanges;
  config: ReplaceTableImportRequestTableImportConfig;
}

/**
 * Log Safety: UNSAFE
 */
export interface ReplaceTableImportRequestDatabricksTableImportConfig {
  initialIncrementalState?: TableImportInitialIncrementalState;
  query: TableImportQuery;
}

/**
 * Log Safety: UNSAFE
 */
export interface ReplaceTableImportRequestDateColumnInitialIncrementalState {
  currentValue: string;
  columnName: string;
}

/**
 * Log Safety: UNSAFE
 */
export interface ReplaceTableImportRequestDecimalColumnInitialIncrementalState {
  currentValue: string;
  columnName: string;
}

/**
 * Log Safety: UNSAFE
 */
export interface ReplaceTableImportRequestIntegerColumnInitialIncrementalState {
  currentValue: number;
  columnName: string;
}

/**
 * Log Safety: UNSAFE
 */
export interface ReplaceTableImportRequestJdbcTableImportConfig {
  initialIncrementalState?: TableImportInitialIncrementalState;
  query: TableImportQuery;
}

/**
 * Log Safety: UNSAFE
 */
export interface ReplaceTableImportRequestLongColumnInitialIncrementalState {
  currentValue: string;
  columnName: string;
}

/**
 * Log Safety: UNSAFE
 */
export interface ReplaceTableImportRequestMicrosoftAccessTableImportConfig {
  initialIncrementalState?: TableImportInitialIncrementalState;
  query: TableImportQuery;
}

/**
 * Log Safety: UNSAFE
 */
export interface ReplaceTableImportRequestMicrosoftSqlServerTableImportConfig {
  initialIncrementalState?: TableImportInitialIncrementalState;
  query: TableImportQuery;
}

/**
 * Log Safety: UNSAFE
 */
export interface ReplaceTableImportRequestOracleTableImportConfig {
  initialIncrementalState?: TableImportInitialIncrementalState;
  query: TableImportQuery;
}

/**
 * Log Safety: UNSAFE
 */
export interface ReplaceTableImportRequestPostgreSqlTableImportConfig {
  initialIncrementalState?: TableImportInitialIncrementalState;
  query: TableImportQuery;
}

/**
 * Log Safety: UNSAFE
 */
export interface ReplaceTableImportRequestSnowflakeTableImportConfig {
  initialIncrementalState?: TableImportInitialIncrementalState;
  query: TableImportQuery;
}

/**
 * Log Safety: UNSAFE
 */
export interface ReplaceTableImportRequestStringColumnInitialIncrementalState {
  currentValue: string;
  columnName: string;
}

/**
 * The import configuration for a specific connector type.
 *
 * Log Safety: UNSAFE
 */
export type ReplaceTableImportRequestTableImportConfig =
  | ({
    type: "databricksImportConfig";
  } & ReplaceTableImportRequestDatabricksTableImportConfig)
  | ({
    type: "jdbcImportConfig";
  } & ReplaceTableImportRequestJdbcTableImportConfig)
  | ({
    type: "microsoftSqlServerImportConfig";
  } & ReplaceTableImportRequestMicrosoftSqlServerTableImportConfig)
  | ({
    type: "postgreSqlImportConfig";
  } & ReplaceTableImportRequestPostgreSqlTableImportConfig)
  | ({
    type: "microsoftAccessImportConfig";
  } & ReplaceTableImportRequestMicrosoftAccessTableImportConfig)
  | ({
    type: "snowflakeImportConfig";
  } & ReplaceTableImportRequestSnowflakeTableImportConfig)
  | ({
    type: "oracleImportConfig";
  } & ReplaceTableImportRequestOracleTableImportConfig);

/**
   * The incremental configuration for a table import enables append-style transactions from the same table without duplication of data.
You must provide a monotonically increasing column such as a timestamp or id and an initial value for this column.
An incremental table import will import rows where the value is greater than the largest already imported.
You can use the '?' character to reference the incremental state value when constructing your query.
Normally this would be used in a WHERE clause or similar filter applied in order to only sync data with an incremental column value
larger than the previously observed maximum value stored in the incremental state.
   *
   * Log Safety: UNSAFE
   */
export type ReplaceTableImportRequestTableImportInitialIncrementalState =
  | ({
    type: "stringColumnInitialIncrementalState";
  } & ReplaceTableImportRequestStringColumnInitialIncrementalState)
  | ({
    type: "dateColumnInitialIncrementalState";
  } & ReplaceTableImportRequestDateColumnInitialIncrementalState)
  | ({
    type: "integerColumnInitialIncrementalState";
  } & ReplaceTableImportRequestIntegerColumnInitialIncrementalState)
  | ({
    type: "timestampColumnInitialIncrementalState";
  } & ReplaceTableImportRequestTimestampColumnInitialIncrementalState)
  | ({
    type: "longColumnInitialIncrementalState";
  } & ReplaceTableImportRequestLongColumnInitialIncrementalState)
  | ({
    type: "decimalColumnInitialIncrementalState";
  } & ReplaceTableImportRequestDecimalColumnInitialIncrementalState);

/**
 * Log Safety: UNSAFE
 */
export interface ReplaceTableImportRequestTimestampColumnInitialIncrementalState {
  currentValue: string;
  columnName: string;
}

/**
 * The method of authentication for connecting to an external REST system.
 *
 * Log Safety: DO_NOT_LOG
 */
export type RestAuthenticationMode =
  | ({ type: "bearerToken" } & BearerToken)
  | ({ type: "apiKey" } & ApiKeyAuthentication)
  | ({ type: "basic" } & BasicCredentials)
  | ({ type: "oauth2" } & RestConnectionOAuth2);

/**
   * When creating or updating additional secrets, use SecretsWithPlaintextValues.
When fetching the RestConnectionConfiguration, SecretsNames will be provided.
   *
   * Log Safety: DO_NOT_LOG
   */
export type RestConnectionAdditionalSecrets =
  | ({ type: "asSecretsWithPlaintextValues" } & SecretsWithPlaintextValues)
  | ({ type: "asSecretsNames" } & SecretsNames);

/**
 * The configuration needed to connect to a REST external system.
 *
 * Log Safety: DO_NOT_LOG
 */
export interface RestConnectionConfiguration {
  domains: Array<Domain>;
  additionalSecrets?: RestConnectionAdditionalSecrets;
  oauth2ClientRid?: string;
}

/**
   * In order to use OAuth2 you must have an Outbound application configured in the Foundry Control Panel Organization settings.
The RID of the Outbound application must be configured in the RestConnectionConfiguration in the oauth2ClientRid field.
   *
   * Log Safety: SAFE
   */
export interface RestConnectionOAuth2 {}

/**
 * The location of the API key in the request.
 *
 * Log Safety: UNSAFE
 */
export type RestRequestApiKeyLocation =
  | ({ type: "header" } & HeaderApiKey)
  | ({ type: "queryParameter" } & QueryParameterApiKey);

/**
 * Log Safety: DO_NOT_LOG
 */
export type S3AuthenticationMode =
  | ({ type: "awsAccessKey" } & AwsAccessKey)
  | ({ type: "cloudIdentity" } & CloudIdentity)
  | ({ type: "oidc" } & AwsOidcAuthentication);

/**
   * The configuration needed to connect to an AWS S3 external system (or any other S3-like external systems that
implement the s3a protocol).
   *
   * Log Safety: DO_NOT_LOG
   */
export interface S3ConnectionConfiguration {
  bucketUrl: string;
  s3Endpoint?: string;
  region?: Region;
  authenticationMode?: S3AuthenticationMode;
  s3EndpointSigningRegion?: Region;
  clientKmsConfiguration?: S3KmsConfiguration;
  stsRoleConfiguration?: StsRoleConfiguration;
  proxyConfiguration?: S3ProxyConfiguration;
  maxConnections?: number;
  connectionTimeoutMillis?: string;
  socketTimeoutMillis?: string;
  maxErrorRetry?: number;
  matchSubfolderExactly?: boolean;
  enableRequesterPays?: boolean;
}

/**
 * Log Safety: UNSAFE
 */
export interface S3KmsConfiguration {
  kmsKey: string;
  kmsRegion?: Region;
}

/**
 * Log Safety: DO_NOT_LOG
 */
export interface S3ProxyConfiguration {
  host: string;
  port: number;
  nonProxyHosts?: Array<string>;
  protocol?: Protocol;
  credentials?: BasicCredentials;
}

/**
 * Log Safety: UNSAFE
 */
export type SecretName = LooselyBrandedString<"SecretName">;

/**
   * A list of secret names that can be referenced in code and webhook configurations.
This will be provided to the client when fetching the RestConnectionConfiguration.
   *
   * Log Safety: UNSAFE
   */
export interface SecretsNames {
  secretNames: Array<SecretName>;
}

/**
   * A map representing secret name to plaintext secret value pairs.
This should be used when creating or updating additional secrets for a REST connection.
   *
   * Log Safety: DO_NOT_LOG
   */
export interface SecretsWithPlaintextValues {
  secrets: Record<SecretName, PlaintextValue>;
}

/**
 * Log Safety: DO_NOT_LOG
 */
export type SmbAuth = { type: "usernamePassword" } & SmbUsernamePasswordAuth;

/**
 * Log Safety: DO_NOT_LOG
 */
export interface SmbConnectionConfiguration {
  hostname: string;
  port?: number;
  proxy?: SmbProxyConfiguration;
  share: string;
  baseDirectory?: string;
  auth: SmbAuth;
  requireMessageSigning?: boolean;
}

/**
 * Egress proxy to pass all traffic through.
 *
 * Log Safety: UNSAFE
 */
export interface SmbProxyConfiguration {
  hostname: string;
  port: number;
  protocol: SmbProxyType;
}

/**
 * Log Safety: SAFE
 */
export type SmbProxyType = "HTTP" | "SOCKS";

/**
 * Log Safety: DO_NOT_LOG
 */
export interface SmbUsernamePasswordAuth {
  username: string;
  password: EncryptedProperty;
  domain?: string;
}

/**
 * Log Safety: DO_NOT_LOG
 */
export type SnowflakeAuthenticationMode =
  | ({ type: "externalOauth" } & SnowflakeExternalOauth)
  | ({ type: "keyPair" } & SnowflakeKeyPairAuthentication)
  | ({ type: "basic" } & BasicCredentials);

/**
 * The configuration needed to connect to a Snowflake database.
 *
 * Log Safety: DO_NOT_LOG
 */
export interface SnowflakeConnectionConfiguration {
  accountIdentifier: string;
  database?: string;
  role?: string;
  schema?: string;
  warehouse?: string;
  authenticationMode: SnowflakeAuthenticationMode;
  jdbcProperties: JdbcProperties;
}

/**
   * Use an External OAuth security integration to connect and authenticate to Snowflake.
See https://docs.snowflake.com/en/user-guide/oauth-ext-custom
   *
   * Log Safety: UNSAFE
   */
export interface SnowflakeExternalOauth {
  audience: string;
  issuerUrl: string;
  subject: ConnectionRid;
}

/**
   * Use a key-pair to connect and authenticate to Snowflake.
See https://docs.snowflake.com/en/user-guide/key-pair-auth
   *
   * Log Safety: DO_NOT_LOG
   */
export interface SnowflakeKeyPairAuthentication {
  user: string;
  privateKey: EncryptedProperty;
}

/**
 * The table import configuration for a Snowflake connection.
 *
 * Log Safety: UNSAFE
 */
export interface SnowflakeTableImportConfig {
  query: TableImportQuery;
  initialIncrementalState?: TableImportInitialIncrementalState;
}

/**
 * Pointer to the table in Snowflake. Uses the Snowflake table identifier of database, schema and table.
 *
 * Log Safety: UNSAFE
 */
export interface SnowflakeVirtualTableConfig {
  database: string;
  schema: string;
  table: string;
}

/**
 * The state for an incremental table import using a column with a string data type.
 *
 * Log Safety: UNSAFE
 */
export interface StringColumnInitialIncrementalState {
  columnName: string;
  currentValue: string;
}

/**
 * Log Safety: UNSAFE
 */
export interface StsRoleConfiguration {
  roleArn: string;
  roleSessionName: string;
  roleSessionDuration?: _Core.Duration;
  externalId?: string;
  stsEndpoint?: string;
}

/**
 * Log Safety: UNSAFE
 */
export interface TableImport {
  rid: TableImportRid;
  connectionRid: ConnectionRid;
  datasetRid: _Core.DatasetRid;
  branchName?: _Core.BranchName;
  displayName: TableImportDisplayName;
  importMode: TableImportMode;
  allowSchemaChanges: TableImportAllowSchemaChanges;
  config: TableImportConfig;
}

/**
 * Allow the TableImport to succeed if the schema of imported rows does not match the existing dataset's schema. Defaults to false for new table imports.
 *
 * Log Safety: SAFE
 */
export type TableImportAllowSchemaChanges = boolean;

/**
 * The import configuration for a specific connector type.
 *
 * Log Safety: UNSAFE
 */
export type TableImportConfig =
  | ({ type: "databricksImportConfig" } & DatabricksTableImportConfig)
  | ({ type: "jdbcImportConfig" } & JdbcTableImportConfig)
  | ({
    type: "microsoftSqlServerImportConfig";
  } & MicrosoftSqlServerTableImportConfig)
  | ({ type: "postgreSqlImportConfig" } & PostgreSqlTableImportConfig)
  | ({ type: "microsoftAccessImportConfig" } & MicrosoftAccessTableImportConfig)
  | ({ type: "snowflakeImportConfig" } & SnowflakeTableImportConfig)
  | ({ type: "oracleImportConfig" } & OracleTableImportConfig);

/**
 * Log Safety: UNSAFE
 */
export type TableImportDisplayName = LooselyBrandedString<
  "TableImportDisplayName"
>;

/**
   * The incremental configuration for a table import enables append-style transactions from the same table without duplication of data.
You must provide a monotonically increasing column such as a timestamp or id and an initial value for this column.
An incremental table import will import rows where the value is greater than the largest already imported.
You can use the '?' character to reference the incremental state value when constructing your query.
Normally this would be used in a WHERE clause or similar filter applied in order to only sync data with an incremental column value
larger than the previously observed maximum value stored in the incremental state.
   *
   * Log Safety: UNSAFE
   */
export type TableImportInitialIncrementalState =
  | ({
    type: "stringColumnInitialIncrementalState";
  } & StringColumnInitialIncrementalState)
  | ({
    type: "dateColumnInitialIncrementalState";
  } & DateColumnInitialIncrementalState)
  | ({
    type: "integerColumnInitialIncrementalState";
  } & IntegerColumnInitialIncrementalState)
  | ({
    type: "timestampColumnInitialIncrementalState";
  } & TimestampColumnInitialIncrementalState)
  | ({
    type: "longColumnInitialIncrementalState";
  } & LongColumnInitialIncrementalState)
  | ({
    type: "decimalColumnInitialIncrementalState";
  } & DecimalColumnInitialIncrementalState);

/**
   * Import mode governs how data is read from an external system, and written into a Foundry dataset.
SNAPSHOT: Defines a new dataset state consisting only of data from a particular import execution.
APPEND: Purely additive and yields data from previous import executions in addition to newly added data.
   *
   * Log Safety: SAFE
   */
export type TableImportMode = "SNAPSHOT" | "APPEND";

/**
   * A single SQL query can be executed per sync, which should output a data table
and avoid operations like invoking stored procedures.
The query results are saved to the output dataset in Foundry.
   *
   * Log Safety: UNSAFE
   */
export type TableImportQuery = LooselyBrandedString<"TableImportQuery">;

/**
 * The Resource Identifier (RID) of a TableImport (also known as a batch sync).
 *
 * Log Safety: SAFE
 */
export type TableImportRid = LooselyBrandedString<"TableImportRid">;

/**
 * The name of a VirtualTable.
 *
 * Log Safety: UNSAFE
 */
export type TableName = LooselyBrandedString<"TableName">;

/**
 * The Resource Identifier (RID) of a registered VirtualTable.
 *
 * Log Safety: SAFE
 */
export type TableRid = LooselyBrandedString<"TableRid">;

/**
 * Log Safety: UNSAFE
 */
export interface TimestampColumnInitialIncrementalState {
  columnName: string;
  currentValue: string;
}

/**
 * Pointer to the table in Unity Catalog. Uses the Databricks table identifier of catalog, schema and table.
 *
 * Log Safety: UNSAFE
 */
export interface UnityVirtualTableConfig {
  catalog: string;
  schema: string;
  table: string;
}

/**
   * A ConnectionWorker that is not supported in the Platform APIs. This can happen because either the
ConnectionWorker configuration is malformed, or because the ConnectionWorker is a legacy one.
The ConnectionWorker should be updated to use the Foundry worker
with either direct egress policies or agent proxy egress policies.
   *
   * Log Safety: SAFE
   */
export interface UnknownWorker {}

/**
 * Log Safety: SAFE
 */
export interface UpdateExportSettingsForConnectionRequest {
  exportSettings: ConnectionExportSettings;
}

/**
 * Log Safety: DO_NOT_LOG
 */
export interface UpdateSecretsForConnectionRequest {
  secrets: Record<SecretName, PlaintextValue>;
}

/**
 * Defines supported URI schemes to be used for external connections.
 *
 * Log Safety: SAFE
 */
export type UriScheme = "HTTP" | "HTTPS";

/**
 * Log Safety: UNSAFE
 */
export interface VirtualTable {
  rid: TableRid;
  name: TableName;
  parentRid: _Filesystem.FolderRid;
  config: VirtualTableConfig;
  markings?: Array<_Core.MarkingId>;
}

/**
 * Log Safety: UNSAFE
 */
export type VirtualTableConfig =
  | ({ type: "snowflake" } & SnowflakeVirtualTableConfig)
  | ({ type: "unity" } & UnityVirtualTableConfig)
  | ({ type: "glue" } & GlueVirtualTableConfig)
  | ({ type: "delta" } & DeltaVirtualTableConfig)
  | ({ type: "iceberg" } & IcebergVirtualTableConfig)
  | ({ type: "files" } & FilesVirtualTableConfig)
  | ({ type: "bigquery" } & BigQueryVirtualTableConfig);

/**
   * Authenticate as a service principal using workload identity federation. This is the recommended way to connect to Databricks.
Workload identity federation allows workloads running in Foundry to access Databricks APIs without the need for Databricks secrets.
Refer to our OIDC documentation for an overview of how OpenID Connect is supported in Foundry.
A service principal federation policy must exist in Databricks to allow Foundry to act as an identity provider.
Refer to the official documentation for guidance.
   *
   * Log Safety: UNSAFE
   */
export interface WorkflowIdentityFederation {
  servicePrincipalApplicationId?: string;
  issuerUrl: string;
  audience: string;
  subject: ConnectionRid;
}
