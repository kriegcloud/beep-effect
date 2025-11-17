import { BeepId } from "../src";

const schemaId = BeepId.module("schema");

// Valid nested segment
schemaId.compose("custom/dates");

// @ts-expect-error - leading slash should be rejected
schemaId.compose("/invalid");

// @ts-expect-error - trailing slash should be rejected
schemaId.compose("invalid/");

// @ts-expect-error - both leading and trailing slash rejected
schemaId.compose("/invalid/");
