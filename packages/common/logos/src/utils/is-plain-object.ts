import _isPlainObject from "lodash.isplainobject";

/**
 * Check if value is object.
 * @export
 * @param {*} value
 * @return {*}  {value is object}
 */
export function isPlainObject(value: any): value is object {
  return _isPlainObject(value);
}
