import * as Config from "effect/Config";
import * as F from "effect/Function";

export const ConfigArrayURL = F.flow(<TName extends string>(name: TName) =>
  Config.array(Config.hashSet(Config.url()), name).pipe(Config.map((urls) => urls.map((url) => url.toString())))
);
