import { serverEnv } from "@beep/core-env/server";
import * as Context from "effect/Context";
import * as Layer from "effect/Layer";

export class FilesConfig extends Context.Tag("@beep/documents-infra/FilesConfig")<FilesConfig, FilesConfig.Service>() {
  static fromServerEnv(env: typeof serverEnv): FilesConfig.Service {
    return {
      aws: {
        s3: {
          bucketName: env.cloud.aws.s3.bucketName,
        },
      },
    };
  }

  static readonly Live = Layer.succeed(this, this.of(this.fromServerEnv(serverEnv)));

  static layerFrom(env: typeof serverEnv) {
    return Layer.succeed(this, this.of(this.fromServerEnv(env)));
  }
}

export declare namespace FilesConfig {
  export interface Service {
    readonly aws: {
      readonly s3: {
        readonly bucketName: typeof serverEnv.cloud.aws.s3.bucketName;
      };
    };
  }
}
