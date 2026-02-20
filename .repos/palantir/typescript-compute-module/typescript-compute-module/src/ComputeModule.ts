import { Logger, loggerToInstanceLogger } from "./logger";
import {
  QueryResponseMapping,
  QueryRunner,
  QueryListener,
} from "./QueryRunner";
import {
  ComputeModuleApi,
  formatAxiosErrorResponse,
  sanitizeAxiosError,
} from "./api/ComputeModuleApi";
import { convertJsonSchemaToCustomSchema } from "./api/convertJsonSchematoFoundrySchema";
import { Static } from "@sinclair/typebox";
import { SourceCredentials } from "./sources/SourceCredentials";
import { Resource, ResourceAliases } from "./resources/ResourceAliases";
import { Environment } from "./environment/types";
import {
  FoundryService,
  getFoundryServices,
} from "./services/getFoundryServices";
import * as fs from "fs";
import { isAxiosError } from "axios";

export interface ComputeModuleOptions<
  M extends QueryResponseMapping = any,
  S extends string = string
> {
  /**
   * Definitions for the queries that the module will respond to, defined using typebox.
   * @example
   * ```typescript
   * import { Type } from "@sinclair/typebox";
   * const definitions = {
   *    "isFirstName": {
   *        input: Type.String(),
   *        output: Type.Boolean(),
   *      },
   * };
   * ```
   *
   * If not provided, functions will not be autoregistered and typesafety will not be provided.
   */
  definitions?: M;
  /**
   * Logger to use for logging, if not provided, no logging will be done.
   * This interface accepts console, winston, or any other object that has the same methods as console.
   */
  logger?: Logger;
  /**
   * Instance ID to use for logging, if not provided no instance ID will be added
   */
  instanceId?: string;
  /**
   * If the module should automatically register queries with the runtime, defaults to true.
   *
   * Can be set to false to enable typesafety without registering the queries.
   */
  isAutoRegistered?: boolean;
  /**
   * Expected sources to be mounted on the module, if provided will throw an error if the sources are not mounted.
   */
  sources?: {
    [K in S]: SourceOptions;
  };
}

type SourceOptions<S extends string = string> = {
  credentials?: S[];
};

const resourceAliasMapPath = process.env["RESOURCE_ALIAS_MAP"];
const resourceAliases =
  resourceAliasMapPath != null
    ? new ResourceAliases(resourceAliasMapPath)
    : null;
export class ComputeModule<const O extends ComputeModuleOptions> {
  // Environment variables
  private static GET_JOB_URI = "GET_JOB_URI";
  private static POST_RESULT_URI = "POST_RESULT_URI";
  private static POST_SCHEMA_URI = "POST_SCHEMA_URI";

  // Known mounted files
  private static SOURCE_CREDENTIALS = "SOURCE_CREDENTIALS";
  private static DEFAULT_CA_PATH = "DEFAULT_CA_PATH";
  private static MODULE_AUTH_TOKEN = "MODULE_AUTH_TOKEN";
  private static BUILD2_TOKEN = "BUILD2_TOKEN";
  private static CLIENT_ID = "CLIENT_ID";
  private static CLIENT_SECRET = "CLIENT_SECRET";

  private sourceCredentials: SourceCredentials | null;
  private logger?: Logger;
  private queryRunner: QueryRunner<O["definitions"]>;

  private listeners: Partial<{
    [K in keyof O["definitions"]]: QueryListener<Pick<O["definitions"], K>>;
  }> = {};
  private defaultListener?: (data: any, queryName: string) => Promise<any>;

  constructor({
    logger,
    instanceId,
    definitions,
    isAutoRegistered,
    sources,
  }: O) {
    this.logger =
      logger != null ? loggerToInstanceLogger(logger, instanceId) : undefined;

    const sourceCredentialsPath = process.env[ComputeModule.SOURCE_CREDENTIALS];
    this.sourceCredentials =
      sourceCredentialsPath != null
        ? new SourceCredentials(sourceCredentialsPath)
        : null;

    if (sources != null) {
      Object.keys(sources).forEach((source) => {
        if (!this.sourceCredentials?.hasSource(source)) {
          throw new Error(
            `Source ${source} not found in source credentials. Ensure you have mounted the correct sources.`
          );
        }
        sources[source].credentials?.forEach((credential) => {
          if (!this.sourceCredentials?.getCredential(source, credential)) {
            throw new Error(
              `Credential ${credential} not found in source ${source}. Ensure you have mounted the correct sources.`
            );
          }
        });
      });
    }

    this.queryRunner = new QueryRunner<O["definitions"]>(
      this.listeners,
      this.defaultListener,
      this.logger
    );

    if (process.env.NODE_ENV === "development") {
      console.warn("Inactive module - running in dev mode");
      return;
    }

    this.initialize(definitions, isAutoRegistered ?? true);
  }

  /**
   * Adds a listener for a specific query, only one response listener can be added per query
   * @param queryName Foundry query name to respond to
   * @param listener Function to run when the query is received
   * @returns
   */
  public register<T extends keyof O["definitions"]>(
    queryName: T,
    listener: (
      data: Static<O["definitions"][T]["input"]>
    ) => Promise<Static<O["definitions"][T]["output"]>>
  ) {
    this.listeners[queryName] = { type: "response", listener };
    return this;
  }

  /**
   * Adds a listener for a specific query, only one streaming listener can be added per query
   * @param queryName Foundry query name to respond to
   * @param listener Function to run when the query is received
   * @returns
   */
  public registerStreaming<T extends keyof O["definitions"]>(
    queryName: T,
    listener: (
      data: Static<O["definitions"][T]["input"]>,
      writable: {
        write: (chunk: Buffer | Uint8Array | string) => void;
        end: () => void;
      }
    ) => void
  ) {
    this.listeners[queryName] = { type: "streaming", listener };
    return this;
  }

  /**
   * Adds a listener for events within the compute module
   * - responsive: When the module is responsive and can receive queries
   * @returns
   */
  public on(_eventName: "responsive", listener: () => void) {
    this.queryRunner?.on("responsive", listener);
    return this;
  }

  /**
   * Adds a default listener for when no other listener is found for a query
   * @param listener Function to run when the query is received
   * @returns
   */
  public default(listener: (data: any, queryName: string) => Promise<any>) {
    this.defaultListener = listener;
    this.queryRunner?.updateDefaultListener(listener);
    return this;
  }

  /**
   * Sources can be used to store secrets for use within a Compute Module, they prevent you from having to put secrets in your container or in plaintext in the job specification.
   */
  public getCredential<
    T_Source extends O extends { sources: infer S } ? keyof S : string,
    T_Credential extends O extends {
      sources: { [K in T_Source]: SourceOptions<infer C> };
    }
      ? C
      : string
  >(sourceApiName: T_Source, credentialName: T_Credential): string | null {
    if (this.sourceCredentials == null) {
      throw new Error(
        "No source credentials mounted. This implies the SOURCE_CREDENTIALS environment variable has not been set, ensure you have set sources mounted on the Compute Module."
      );
    }
    return this.sourceCredentials.getCredential(sourceApiName, credentialName);
  }

  /**
   * At runtime, you can retrieve the api paths for known Foundry services, this allows you to call those endpoints without using a source to ingress back into the platform.
   */
  public static getServiceApi(service: FoundryService): string | undefined {
    return getFoundryServices()[service];
  }

  /**
   * Compute Modules can interact with resources in their execution environment, within Palantir Foundry these are defined as inputs and outputs on the Compute Module spec. Resource identifiers can be unique to the execution environment,
   * so using aliases allows your code to maintain a static reference to known resources.
   */
  public static getResource(alias: string): Resource | null {
    if (resourceAliases == null) {
      throw new Error(
        "No resource aliases mounted. This implies the RESOURCE_ALIAS_MAP environment variable has not been set, ensure you have set resources mounted on the Compute Module."
      );
    }
    return resourceAliases.getAlias(alias);
  }

  /**
   * Returns the environment and tokens for the current execution mode
   */
  public static getEnvironment(): Environment {
    const buildTokenPath = process.env[ComputeModule.BUILD2_TOKEN];
    if (buildTokenPath != null) {
      return {
        type: "pipelines",
        buildToken: fs.readFileSync(buildTokenPath, "utf-8"),
      };
    }
    const maybeClientId = process.env[ComputeModule.CLIENT_ID];
    const maybeClientSecret = process.env[ComputeModule.CLIENT_SECRET];
    return {
      type: "functions",
      thirdPartyApplication:
        maybeClientId != null && maybeClientSecret != null
          ? {
              clientId: maybeClientId,
              clientSecret: maybeClientSecret,
            }
          : undefined,
    };
  }

  /**
   * @deprecated Use `ComputeModule.getServiceApi()` instead
   * This method is deprecated and will be removed in future versions.
   *
   * Returns the api path for a given Foundry service
   */
  public getServiceApi(service: FoundryService): string | undefined {
    return ComputeModule.getServiceApi(service);
  }

  /**
   * @deprecated Use `ComputeModule.getResource()` instead
   * This method is deprecated and will be removed in future versions.
   *
   * Returns the resource for a given alias, if the alias is not found, returns null
   */
  public getResource(alias: string): Resource | null {
    return ComputeModule.getResource(alias);
  }

  /**
   * @deprecated Use `ComputeModule.getEnvironment()` instead
   * This method is deprecated and will be removed in future versions.
   *
   * Returns the environment and tokens for the current execution mode
   */
  public get environment(): Environment {
    return ComputeModule.getEnvironment();
  }

  private initialize(
    definitions: O["definitions"],
    shouldAutoRegister: boolean
  ) {
    const defaultCAPath = process.env[ComputeModule.DEFAULT_CA_PATH];

    const computeModuleApi = new ComputeModuleApi({
      getJobUri: process.env[ComputeModule.GET_JOB_URI] ?? "",
      postResultUri: process.env[ComputeModule.POST_RESULT_URI] ?? "",
      postSchemaUri: process.env[ComputeModule.POST_SCHEMA_URI] ?? "",
      trustStore:
        defaultCAPath != null
          ? fs.readFileSync(defaultCAPath, "utf-8")
          : undefined,
      moduleAuthToken: fs.readFileSync(
        process.env[ComputeModule.MODULE_AUTH_TOKEN] ?? "",
        "utf-8"
      ),
    });

    this.queryRunner.on("responsive", () => {
      this.logger?.info("Module is responsive");
      if (definitions && shouldAutoRegister) {
        const schemas = Object.entries(definitions).map(([queryName, query]) =>
          convertJsonSchemaToCustomSchema(queryName, query.input, query.output)
        );

        this.logger?.info(`Posting schemas:${JSON.stringify(schemas)}`);
        computeModuleApi.postSchema(schemas).catch((e) => {
          if (isAxiosError(e)) {
            const sanitizedError = sanitizeAxiosError(e);
            this.logger?.error(
              `Error posting schemas: ${formatAxiosErrorResponse(sanitizedError)}`
            );
          }
        });
      }
    });

    this.queryRunner.run(computeModuleApi);
  }
}
