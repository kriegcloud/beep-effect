export const commonExtraFields = {
  _rowId: {
    type: "number",
    required: false,
  },
  deletedAt: {
    type: "date",
    required: false,
  },
  updatedAt: {
    type: "date",
    required: false,
  },
  createdAt: {
    type: "date",
    required: false,
  },
  createdBy: {
    type: "string",
    required: false,
  },
  updatedBy: {
    type: "string",
    required: false,
  },
  deletedBy: {
    type: "string",
    required: false,
  },
  version: {
    type: "number",
    required: false,
  },
  source: {
    type: "string",
    required: false,
  },
} as const;

export type CommonExtraFields = typeof commonExtraFields;
