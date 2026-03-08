import { schema } from './namespace.js';

const values = {
  CommentPermission: schema.CommentPermission,
  ReadPermission: schema.ReadPermission,
  WritePermission: schema.WritePermission,
};

export type DigitalDocumentPermissionType = typeof values[keyof typeof values];

export default values;
