/*
 * Copyright 2025 Palantir Technologies, Inc. All rights reserved.
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

import type { Logger } from "@osdk/api";
import type { Client } from "@osdk/client";
import { MinimalLogger } from "@osdk/client/internal";
import { type createConfidentialOauthClient, type PublicOauthClient } from "@osdk/oauth";
import type { SharedClient, SharedClientContext } from "@osdk/shared.client2";
import { symbolClientContext } from "@osdk/shared.client2";
import {
  type AuthModule,
  type BaseAuthService,
  createAuthModuleConfig,
  getAuthModule,
} from "@palantir/pack.auth";
import {
  createConfidentialOauthService,
  createPublicOauthService,
  createStaticTokenService,
} from "@palantir/pack.auth.foundry";
import {
  type AppConfig,
  type AppOptions,
  isModuleConfigTuple,
  type ModuleConfig,
  type ModuleKey,
  type PackApp,
  type PackAppInternal,
} from "@palantir/pack.core";
import { getStateModule, type WithStateModule } from "@palantir/pack.state.core";
import { getDocumentServiceConfig } from "./getDocumentServiceConfig.js";
import { getPageEnv } from "./getPageEnv.js";

type ConfidentialOauthClient = ReturnType<typeof createConfidentialOauthClient>;

interface OsdkClientSharedContext extends Readonly<SharedClientContext> {
  // From MinimalClient but it's not exported
  readonly logger?: Logger;
}

/**
 * Simplify intersection chains for clean tooltips
 */
type Simplify<T> = { [K in keyof T]: T[K] } & {};

/**
 * Simplify intersection chains while omitting specified keys
 */
type SimplifyOmit<T, K extends PropertyKey> = Simplify<Omit<T, K>>;

/**
 * Helper type to extract module types from ModuleConfig record
 */
export type WithNamedModules<T extends Record<string, ModuleConfig>> = {
  readonly [K in keyof T]: T[K] extends readonly [ModuleKey<infer M>, unknown] ? M
    : T[K] extends ModuleKey<infer M> ? M
    : never;
};

/**
 * Pack app with auth module automatically added
 */
export type PackAppWithAuth = PackApp & {
  readonly auth: AuthModule;
};

/**
 * Builder methods for configuring modules
 */
export interface AppBuilders {
  build(): SimplifyOmit<this, keyof AppBuilders>;

  /**
   * Configure and initialize modules without adding accessor properties.
   */
  with(...modules: readonly ModuleConfig[]): this;

  /**
   * Configure and initialize modules with named accessor properties.
   */
  withNamed<const T extends Record<string, ModuleConfig>>(
    modules: T,
  ): SimplifyOmit<this & WithNamedModules<T>, keyof AppBuilders> & AppBuilders;

  /**
   * Configure state module and add state accessor.
   */
  withState(): SimplifyOmit<WithStateModule<this>, keyof AppBuilders> & AppBuilders;
}

/**
 * Initialize an Pack application instance from an OSDK client.
 *
 * @param client - OSDK client instance (required)
 * @param options - Application configuration options / overrides
 * @returns Configured Pack application instance
 */
export function initPackApp(
  client: Client,
  options: AppOptions,
): PackAppWithAuth & AppBuilders {
  // PackAppInternal -> PackApp is tricky due to module accessors (eg 'state').
  // This probably needs some rethinking, but we ideally want to maintain inversion of dependencies
  return new PackAppImpl(
    client,
    options,
  ) satisfies PackAppInternal as unknown as PackAppWithAuth & AppBuilders;
}

function getOsdkClientSharedContext(value: SharedClient): OsdkClientSharedContext {
  return value[symbolClientContext] as OsdkClientSharedContext;
}

/**
 * Internal app implementation.
 *
 * The module system provides loose coupling and modular framework. It is not a full IoC / DI
 * framework, but is a lightweight system to decouple pack modules while keeping pack
 * internals private.
 *
 * Configuration of modules is done through moduleConfig, and allows for initialization of
 * specific module interfaces, eg createInMemoryDocumentServiceConfig() vs createPackDocumentServiceConfig()
 * both produce configs that allow a more specific Document Service Module (identified via
 * DOCUMENT_SERVICE_MODULE_KEY) to be initialized.
 *
 * See {@link ModuleKey} for module config & identification details.
 */
class PackAppImpl implements PackAppInternal, AppBuilders {
  readonly #moduleConfigs: Record<symbol, unknown>;
  readonly #moduleInstances: Map<symbol, unknown> = new Map();
  readonly config: AppConfig;

  constructor(client: Client, options: AppOptions) {
    this.config = Object.freeze(getAppConfig(client, options));

    const moduleOverrides = options.moduleOverrides ?? [];

    const authService = this.createAuthService(client);
    const authModuleConfig = createAuthModuleConfig(authService);

    const [defaultDocModule, defaultDocModuleConfig] = getDocumentServiceConfig(this.config);
    this.#moduleConfigs = {
      [authModuleConfig[0].key]: authModuleConfig[1],
      [defaultDocModule.key]: defaultDocModuleConfig,
    };

    for (const [moduleKey, config] of moduleOverrides) {
      this.#moduleConfigs[moduleKey.key] = config;
    }

    // Always initialize the auth module
    getAuthModule(this);
  }

  build(): this {
    return this;
  }

  private createAuthService(client: Client): BaseAuthService {
    const osdkClientContext = getOsdkClientSharedContext(client);
    const tokenProvider = osdkClientContext.tokenProvider;

    if (isPublicOauthClient(tokenProvider)) {
      return createPublicOauthService(this, tokenProvider);
    }

    if (isConfidentialOauthClient(tokenProvider)) {
      return createConfidentialOauthService(this, tokenProvider);
    }

    if (typeof tokenProvider === "function") {
      return createStaticTokenService(this, tokenProvider);
    }

    throw new Error("Invalid token provider type");
  }

  getModule<T, TConfig>(moduleKey: ModuleKey<T, TConfig>): T {
    if (this.#moduleInstances.has(moduleKey.key)) {
      // Safe assertion via ModuleKey
      return this.#moduleInstances.get(moduleKey.key) as T;
    }

    const config = this.#moduleConfigs[moduleKey.key] as TConfig | undefined;
    const instance = moduleKey.initModule(this, config);
    this.#moduleInstances.set(moduleKey.key, instance);

    if (moduleKey.appMemberName != null) {
      if (moduleKey.appMemberName in this) {
        // This likely indicates duplicated packages through poor dependency management or bundler quirks.
        // Most modules will be implemented with a named symbol (via Symbol.for) which will dedupe as expected, but
        // there is room for private modules using unique symbols.
        // Duplication of modules and symbol based resolution could be considered a feature for some scenarios,
        // it doesn't immediately break usage but may cause multiple data loads and caches for each implementation,
        // and break reference equality for things like refs.
        this.config.logger.error(
          `Module "${moduleKey.key.description}" is already registered as "${moduleKey.appMemberName}"`,
        );
      }
      Object.defineProperty(this, moduleKey.appMemberName, {
        configurable: false,
        enumerable: true,
        get: () => instance,
      });
    }

    return instance;
  }

  with(...modules: readonly ModuleConfig[]): this {
    for (const moduleConfig of modules) {
      if (isModuleConfigTuple(moduleConfig)) {
        const [module, config] = moduleConfig;
        if (this.#moduleConfigs[module.key] == null && config != null) {
          this.#moduleConfigs[module.key] = config;
        } else if (config != null && this.#moduleConfigs[module.key] !== config) {
          throw new Error(
            `Module ${module.key.description} is already configured with a different config`,
          );
        }
        // Always initialize the module
        this.getModule(module);
      } else {
        // It's just a moduleKey
        this.getModule(moduleConfig);
      }
    }
    return this;
  }

  withNamed<const T extends Record<string, ModuleConfig>>(
    modules: T,
  ): SimplifyOmit<this & WithNamedModules<T>, keyof AppBuilders> & AppBuilders {
    // Process all modules first
    for (const [accessorName, moduleConfig] of Object.entries(modules)) {
      let moduleKey: ModuleKey<unknown>;

      if (isModuleConfigTuple(moduleConfig)) {
        const [module, config] = moduleConfig;
        if (this.#moduleConfigs[module.key] == null && config != null) {
          this.#moduleConfigs[module.key] = config;
        } else if (config != null && this.#moduleConfigs[module.key] !== config) {
          throw new Error(
            `Module ${module.key.description} is already configured with a different config`,
          );
        }
        moduleKey = module;
      } else {
        // Single ModuleKey with no config
        moduleKey = moduleConfig;
      }

      // Add accessor property
      Object.defineProperty(this, accessorName, {
        configurable: false,
        enumerable: true,
        get: () => this.getModule(moduleKey),
      });
    }

    return this as unknown as
      & SimplifyOmit<this & WithNamedModules<T>, keyof AppBuilders>
      & AppBuilders;
  }

  withState(): SimplifyOmit<WithStateModule<this>, keyof AppBuilders> & AppBuilders {
    // Initialize and register the state accessor using the internal function
    getStateModule(this);
    return this as unknown as SimplifyOmit<WithStateModule<this>, keyof AppBuilders> & AppBuilders;
  }
}

function hasRealFoundryConfig(baseUrl: string | undefined): boolean {
  if (baseUrl == null || baseUrl === "") {
    return false;
  }

  const isLocalhost = baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1");
  return !isLocalhost;
}

function getAppConfig(
  client: Client,
  options: AppOptions,
): AppConfig {
  const pageEnv = getPageEnv();
  const osdkClientContext = getOsdkClientSharedContext(client);

  // Precedence: provided options ?? osdkClientContext ?? defaults
  const level = options.logLevel ?? "warn";
  const logger = options.logger
    ?? osdkClientContext.logger?.child({}, { level, msgPrefix: "PACK" })
    ?? new MinimalLogger({ level, msgPrefix: "PACK" });

  const baseUrl = options.remote?.baseUrl || osdkClientContext.baseUrl;
  const fetchFn = options.remote?.fetchFn ?? osdkClientContext.fetch;

  const hasRealConfig = hasRealFoundryConfig(baseUrl);
  const explicitDemoMode = options.demoMode;

  let demoModeOption: boolean | "auto";
  if (explicitDemoMode != null) {
    demoModeOption = explicitDemoMode;
  } else {
    demoModeOption = !baseUrl ? true : "auto";
  }

  const isDemoMode = demoModeOption === true
    || (demoModeOption === "auto" && !hasRealConfig);

  const appId = options.app?.appId ?? pageEnv.appId ?? pageEnv.clientId;
  if (appId == null) {
    throw new Error("No appId provided or present in document meta[pack-appId]");
  }

  const ontologyRid = options.ontologyRid ?? pageEnv.ontologyRid;

  return {
    app: {
      appId,
      appVersion: options.app?.appVersion ?? (pageEnv.appVersion || undefined),
    },
    isDemoMode,
    logger,
    ontologyRid: ontologyRid != null && ontologyRid !== ""
      ? Promise.resolve(ontologyRid)
      : Promise.reject(
        new Error("No ontologyRid provided or present in document meta[osdk-ontologyRid]"),
      ),
    osdkClient: client,
    remote: {
      baseUrl,
      fetchFn,
      packWsPath: options.remote?.packWsPath ?? "/api/v2/packSubscriptions",
    },
  };
}

function isPublicOauthClient(auth: AppOptions["auth"]): auth is PublicOauthClient {
  if (auth == null || typeof auth !== "function") {
    return false;
  }

  return "refresh" in auth && typeof auth.refresh === "function"
    && "getTokenOrUndefined" in auth && typeof auth.getTokenOrUndefined === "function"
    && "signIn" in auth && typeof auth.signIn === "function";
}

function isConfidentialOauthClient(auth: AppOptions["auth"]): auth is ConfidentialOauthClient {
  if (auth == null || typeof auth !== "function") {
    return false;
  }

  return "signIn" in auth && typeof auth.signIn === "function"
    && "getTokenOrUndefined" in auth && typeof auth.getTokenOrUndefined === "function"
    && !("refresh" in auth);
}
