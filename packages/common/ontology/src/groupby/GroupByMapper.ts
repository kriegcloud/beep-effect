/**
 * Wire-type to group-by strategy mappings.
 *
 * @since 0.0.0
 * @module @beep/ontology/groupby/GroupByMapper
 */
import type {
  BooleanGroupByValue,
  DateGroupByValue,
  NumericGroupByValue,
  StringGroupByValue,
  TimestampGroupByValue,
} from "./GroupByClause.js";
import { $OntologyId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $OntologyId.create("groupby/GroupByMapper");

/**
 * Group-by value contract per ontology property wire type.
 *
 * @since 0.0.0
 * @category models
 */
export interface GroupByMapper {
  string: StringGroupByValue;
  short: NumericGroupByValue;
  float: NumericGroupByValue;
  decimal: NumericGroupByValue;
  byte: NumericGroupByValue;
  double: NumericGroupByValue;
  integer: NumericGroupByValue;
  timestamp: TimestampGroupByValue;
  datetime: DateGroupByValue;
  boolean: BooleanGroupByValue;
}
