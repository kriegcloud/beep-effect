import { ConfigFile } from "@beep/config-file/ConfigFile";
import { ConfigResolver } from "@beep/config-file/ConfigResolver";
import { JsonCodec } from "@beep/config-file/JsonCodec";
import { MergeStrategy } from "@beep/config-file/MergeStrategy";
import { assert, describe, it } from "@effect/vitest";
import * as Context from "effect/Context";
import * as S from "effect/Schema";
import type { ConfigFileShape } from "@beep/config-file/ConfigFile";
import type * as FileSystem from "effect/FileSystem";
import type * as Layer from "effect/Layer";
import type * as Path from "effect/Path";

class Settings extends S.Class<Settings, { readonly brand: unique symbol }>("Settings")({ port: S.Finite }) {}
type SettingsEncoded = typeof Settings.Encoded;
class SettingsFile extends ConfigFile.Service<SettingsFile, Settings>()("key-typing/SettingsFile") {}
// A key over a WIDER shape: the layer could never supply `extra`.
class WiderFile extends Context.Service<WiderFile, ConfigFileShape<Settings> & { readonly extra: string }>()(
  "@beep/config-file/test/ConfigFileKeyTyping.test/WiderFile"
) {}

// The downstream regression shape: optional fields and a bare `firstMatch()`, whose
// `A` comes only from the call's context. The tag must keep `A` inferable, or it
// falls to `unknown` and the correctly shaped key below is rejected.
class Optional extends S.Class<Optional, { readonly brand: unique symbol }>("Optional")({
  cacheDir: S.optional(S.String),
  projectKey: S.optional(S.String),
}) {}
class OptionalFile extends ConfigFile.Service<OptionalFile, Optional>()("key-typing/OptionalFile") {}

const options = { schema: Settings, codec: JsonCodec, strategy: MergeStrategy.firstMatch<Settings>() };

describe("ConfigFile key typing", () => {
  it("layer accepts a ConfigFile.Service key, with or without explicit type arguments", () => {
    const inferred = ConfigFile.layer(SettingsFile, { ...options, resolvers: [] });
    const explicit = ConfigFile.layer<SettingsFile, Settings, SettingsEncoded, never>(SettingsFile, {
      ...options,
      resolvers: [],
    });
    assert.isDefined(inferred);
    assert.isDefined(explicit);
  });

  it("layer and testLayer reject a key over a wider shape", () => {
    // @ts-expect-error -- a wider shape would be handed a value missing `extra`. Owner: @beep/config-file. Exit: remove if the API is meant to accept this.
    const layer = () => ConfigFile.layer(WiderFile, { ...options, resolvers: [] });
    // @ts-expect-error -- the same pin applies to testLayer. Owner: @beep/config-file. Exit: remove if the API is meant to accept this.
    const testLayer = () => ConfigFile.testLayer(WiderFile, { ...options, files: {} });
    const accepted = () => ConfigFile.testLayer(SettingsFile, { ...options, files: {} });
    for (const build of [layer, testLayer, accepted]) assert.isFunction(build);
  });

  it("layer and testLayer infer A from the key when the strategy is a bare firstMatch()", () => {
    const layer = ConfigFile.layer(OptionalFile, {
      schema: Optional,
      codec: JsonCodec,
      strategy: MergeStrategy.firstMatch(),
      resolvers: [ConfigResolver.upwardWalk({ filename: "optional.json" })],
    });
    // RR is inferred from the resolvers, so the layer's requirements carry no stray `unknown`.
    const typed: Layer.Layer<OptionalFile, never, FileSystem.FileSystem | Path.Path> = layer;
    const testLayer = ConfigFile.testLayer(OptionalFile, {
      schema: Optional,
      codec: JsonCodec,
      strategy: MergeStrategy.firstMatch(),
      files: {},
    });
    assert.isDefined(typed);
    assert.isDefined(testLayer);
  });

  it("still rejects a wider key when the strategy is a bare firstMatch()", () => {
    const build = () =>
      // @ts-expect-error -- a wider shape would be handed a value missing `extra`. Owner: @beep/config-file. Exit: remove if the API is meant to accept this.
      ConfigFile.layer(WiderFile, {
        schema: Settings,
        codec: JsonCodec,
        strategy: MergeStrategy.firstMatch(),
        resolvers: [],
      });
    assert.isFunction(build);
  });
});
