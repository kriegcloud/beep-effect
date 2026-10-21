import { DuckDbTestLayer } from "@beep/duckdb";
import * as Layer from "effect/Layer";
import * as KeyValueStore from "effect/persistence/KeyValueStore";
import * as KeyValueStoreTest from "./shared/KeyValueStoreTest.ts";

KeyValueStoreTest.suite("duckdb", KeyValueStore.layerSql().pipe(Layer.provide(DuckDbTestLayer)));

KeyValueStoreTest.suite(
  "duckdb-custom-table",
  KeyValueStore.layerSql({ table: "effect_key_value_store_custom" }).pipe(Layer.provide(DuckDbTestLayer))
);
