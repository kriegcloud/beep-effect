import isPlainObject from "lodash.isplainobject";

/**
 * Check if value is object.
 * @export
 * @param {*} value
 * @return {*}  {value is object}
 */
export function isObject(value: any): value is object {
  return isPlainObject(value);
}
