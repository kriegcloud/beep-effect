import * as Config from "effect/Config";
import * as F from "effect/Function";

export const ConfigURL = F.flow(
  <TName extends string>(name: TName) => name,
  Config.url,
  Config.map((url) => url.toString())
);

export const ConfigArrayURL = F.flow(<TName extends string>(name: TName) =>
  Config.array(Config.hashSet(Config.url()), name).pipe(Config.map((urls) => urls.map((url) => url.toString())))
);