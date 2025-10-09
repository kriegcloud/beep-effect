import { Schema } from "effect";
import { BSUiConfig, type FieldConfig } from "./annotations.js";
import { JsonStringToArray, JsonStringToStringArray, TimestampToIsoString } from "./custom/index.js";
import { CustomFieldSchema } from "./custom-fields-schema.js";

// Base system fields as a class
export class BaseSystemFields extends Schema.Class<BaseSystemFields>("BaseSystemFields")({
  createdAt: TimestampToIsoString.annotations({
    description: "The datetime the record was created",
    [BSUiConfig]: {
      field: {
        hidden: true,
      },
      table: {
        cellType: "datetime",
        order: 10,
        readonly: true,
        sortable: true,
      },
    } satisfies FieldConfig,
  }),
  createdBy: Schema.String.pipe(Schema.NullOr, Schema.optional).annotations({
    description: "The typeid of the user who created the record",
    [BSUiConfig]: {
      field: {
        hidden: true,
      },
      table: {
        hidden: true,
        readonly: true,
      },
    } satisfies FieldConfig,
  }),
  customFields: JsonStringToArray(CustomFieldSchema).annotations({
    description: "The custom fields for the record",
    [BSUiConfig]: {
      field: {
        hidden: true,
      },
      table: {
        hidden: true,
        readonly: true,
      },
    } satisfies FieldConfig,
  }),
  deletedAt: TimestampToIsoString.pipe(Schema.NullOr, Schema.optional).annotations({
    description: "The datetime the record was deleted",
    [BSUiConfig]: {
      field: {
        hidden: true,
      },
      table: {
        hidden: true,
        readonly: true,
      },
    } satisfies FieldConfig,
  }),
  deletedBy: Schema.String.pipe(Schema.NullOr, Schema.optional).annotations({
    description: "The typeid of the user who deleted the record",
    [BSUiConfig]: {
      field: {
        hidden: true,
      },
      table: {
        hidden: true,
        readonly: true,
      },
    } satisfies FieldConfig,
  }),
  inactivatedAt: TimestampToIsoString.pipe(Schema.NullOr, Schema.optional).annotations({
    description: "The datetime the record was inactivated",
    [BSUiConfig]: {
      field: {
        hidden: true,
      },
      table: {
        hidden: true,
        readonly: true,
      },
    } satisfies FieldConfig,
  }),
  inactivatedBy: Schema.String.pipe(Schema.NullOr, Schema.optional).annotations({
    description: "The typeid of the user who inactivated the record",
    [BSUiConfig]: {
      field: {
        hidden: true,
      },
      table: {
        hidden: true,
        readonly: true,
      },
    } satisfies FieldConfig,
  }),
  status: Schema.Literal("active", "inactive").annotations({
    description: "The status of the record",
    [BSUiConfig]: {
      field: {
        hidden: true,
      },
      table: {
        cellType: "badge",
        filterable: true,
        order: 5,
        sortable: true,
      },
    } satisfies FieldConfig,
  }),
  tags: JsonStringToStringArray.annotations({
    description: "The tags for the record",
    [BSUiConfig]: {
      field: {
        hidden: true,
      },
      table: {
        hidden: true,
      },
    } satisfies FieldConfig,
  }),
  updatedAt: TimestampToIsoString.pipe(Schema.NullOr, Schema.optional).annotations({
    description: "The datetime the record was updated",
    [BSUiConfig]: {
      field: {
        hidden: true,
      },
      table: {
        cellType: "datetime",
        order: 11,
        readonly: true,
        sortable: true,
      },
    } satisfies FieldConfig,
  }),
  updatedBy: Schema.String.pipe(Schema.NullOr, Schema.optional).annotations({
    description: "The typeid of the user who updated the record",
    [BSUiConfig]: {
      field: {
        hidden: true,
      },
      table: {
        hidden: true,
        readonly: true,
      },
    } satisfies FieldConfig,
  }),
}) {}

// Pure identification fields class (no system fields)
export class BaseIdentifiedEntity extends Schema.Class<BaseIdentifiedEntity>("BaseIdentifiedEntity")({
  externalIds: Schema.Array(
    Schema.Struct({
      id: Schema.String,
      type: Schema.String,
    })
  ).annotations({
    description: "The external ids for the record (e.g. PCO, CCB, etc.)",
    [BSUiConfig]: {
      field: {
        hidden: true,
      },
      table: {
        hidden: true,
        readonly: true,
      },
    } satisfies FieldConfig,
  }),
  id: Schema.String.annotations({
    description: "The typeid for the record",
    [BSUiConfig]: {
      field: {
        hidden: true,
      },
      table: {
        hidden: true,
        readonly: true,
      },
    } satisfies FieldConfig,
  }),
  orgId: Schema.String.annotations({
    description: "The typeid for the organization",
    [BSUiConfig]: {
      field: {
        hidden: true,
      },
      table: {
        hidden: true,
        readonly: true,
      },
    } satisfies FieldConfig,
  }),
}) {}
