/**
 *
 *
 * @module @beep/repo-cli/commands/DocgenV2/Configuration
 * @since 0.0.0
 */

import {$RepoCliId} from "@beep/identity/packages";
import {JSDocCategory} from "@beep/repo-utils/JSDoc/JSDoc";
import {FilePath, SemanticVersion, SchemaUtils} from "@beep/schema";
import * as S from "effect/Schema";
import * as O from "effect/Option";
import * as Str from "effect/String";
import {Order, flow} from "effect";
import {Struct, A} from "@beep/utils";

const $I = $RepoCliId.create("commands/DocgenV2/Configuration");

const PACKAGE_JSON_FILE_NAME = "package.json"
const CONFIG_FILE_NAME = "docgen.json"
