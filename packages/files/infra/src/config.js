import { serverEnv } from "@beep/core-env/server";
import * as Context from "effect/Context";
import * as Layer from "effect/Layer";
export class FilesConfig extends Context.Tag("@beep/files-infra/FilesConfig")() {
    static fromServerEnv(env) {
        return {
            aws: {
                s3: {
                    bucketName: env.cloud.aws.s3.bucketName,
                },
            },
        };
    }
    static Live = Layer.succeed(this, this.of(this.fromServerEnv(serverEnv)));
    static layerFrom(env) {
        return Layer.succeed(this, this.of(this.fromServerEnv(env)));
    }
}
//# sourceMappingURL=config.js.map