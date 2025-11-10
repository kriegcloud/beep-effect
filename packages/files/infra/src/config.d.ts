import { serverEnv } from "@beep/core-env/server";
import * as Context from "effect/Context";
import * as Layer from "effect/Layer";
declare const FilesConfig_base: Context.TagClass<FilesConfig, "@beep/files-infra/FilesConfig", FilesConfig.Service>;
export declare class FilesConfig extends FilesConfig_base {
    static fromServerEnv(env: typeof serverEnv): FilesConfig.Service;
    static readonly Live: Layer.Layer<FilesConfig, never, never>;
    static layerFrom(env: typeof serverEnv): Layer.Layer<FilesConfig, never, never>;
}
export declare namespace FilesConfig {
    interface Service {
        readonly aws: {
            readonly s3: {
                readonly bucketName: typeof serverEnv.cloud.aws.s3.bucketName;
            };
        };
    }
}
export {};
//# sourceMappingURL=config.d.ts.map