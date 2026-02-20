import {
  TObject,
  TBoolean,
  TInteger,
  TNumber,
  TString,
  TArray,
  TSchema,
  TypeGuard,
} from "@sinclair/typebox";
import { Schema } from "./schemaTypes";

export type SupportedTypeboxTypes =
  | TObject
  | TBoolean
  | TInteger
  | TNumber
  | TString
  | TArray;

// Function to convert JSON Schema to our custom Schema type
export function convertJsonSchemaToCustomSchema(
  schemaName: string,
  input: TObject | undefined,
  output: SupportedTypeboxTypes
): Schema {
  return {
    functionName: schemaName,
    inputs: input != null ? Object.keys(input.properties).map((key) => ({
      name: key,
      required: input.required?.includes(key) ?? false,
      dataType: convertJsonType(input.properties[key]),
      constraints: [],
    })) : [],
    output: {
      type: "single",
      single: { dataType: convertJsonType(output) },
    }
  };
}

function convertJsonType(jsonType: TSchema): Schema.DataType {
  if (TypeGuard.IsOptional(jsonType)) {
    return {
      type: "optionalType",
      optionalType: {
        wrappedType: convertJsonType(jsonType.type)
      }
    }
  }
  else if (TypeGuard.IsObject(jsonType)) {
    return {
      type: "anonymousCustomType",
      anonymousCustomType: {
        fields: Object.keys(jsonType.properties).reduce(
          (acc, key) => ({
            ...acc,
            [key]: convertJsonType(jsonType.properties[key]),
          }),
          {}
        ),
      },
    }
  } else if (TypeGuard.IsArray(jsonType)) {
    return {
      type: "list",
      list: {
        elementsType: convertJsonType(jsonType.items),
      },
    };
  } else if (TypeGuard.IsBoolean(jsonType)) {
    return { type: "boolean", boolean: {} };
  } else if (TypeGuard.IsInteger(jsonType)) {
    return { type: "integer", integer: {} };
  } else if (TypeGuard.IsNumber(jsonType)) {
    return { type: "float", float: {} };
  } else if (TypeGuard.IsString(jsonType)) {
    return { type: "string", string: {} };
  } else {
    // Default to string on failure
    return { type: "string", string: {} };
  }
}