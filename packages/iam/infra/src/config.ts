import { serverEnv } from "@beep/shared-infra/ServerEnv";
import * as Context from "effect/Context";
import * as Layer from "effect/Layer";

export class IamConfig extends Context.Tag("@beep/iam-infra/IamConfig")<IamConfig, IamConfig.Service>() {
  static fromServerEnv(env: typeof serverEnv): IamConfig.Service {
    return {
      app: {
        env: env.app.env,
        name: env.app.name,
        domain: env.app.domain,
        baseUrl: env.app.baseUrl,
        clientUrl: env.app.clientUrl,
        projectProductionUrl: env.app.projectProductionUrl,
        authUrl: env.app.authUrl,
        logLevel: env.app.logLevel,
        logFormat: env.app.logFormat,
      },
      auth: env.auth,
      security: env.security,
      oauth: env.oauth,
      marketing: env.marketing,
      payment: env.payment,
      email: env.email,
      cloud: {
        google: env.cloud.google,
      },
    };
  }

  static readonly Live = Layer.succeed(this, this.of(this.fromServerEnv(serverEnv)));

  static layerFrom(env: typeof serverEnv) {
    return Layer.succeed(this, this.of(this.fromServerEnv(env)));
  }
}

export declare namespace IamConfig {
  export interface Service {
    readonly app: {
      readonly env: typeof serverEnv.app.env;
      readonly name: typeof serverEnv.app.name;
      readonly domain: typeof serverEnv.app.domain;
      readonly baseUrl: typeof serverEnv.app.baseUrl;
      readonly clientUrl: typeof serverEnv.app.clientUrl;
      readonly projectProductionUrl: typeof serverEnv.app.projectProductionUrl;
      readonly authUrl: typeof serverEnv.app.authUrl;
      readonly logLevel: typeof serverEnv.app.logLevel;
      readonly logFormat: typeof serverEnv.app.logFormat;
    };
    readonly auth: typeof serverEnv.auth;
    readonly security: typeof serverEnv.security;
    readonly oauth: typeof serverEnv.oauth;
    readonly marketing: typeof serverEnv.marketing;
    readonly payment: typeof serverEnv.payment;
    readonly email: typeof serverEnv.email;
    readonly cloud: {
      readonly google: typeof serverEnv.cloud.google;
    };
  }
}
