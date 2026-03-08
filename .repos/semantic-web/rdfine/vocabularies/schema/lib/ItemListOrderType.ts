import { schema } from './namespace.js';

const values = {
  ItemListOrderAscending: schema.ItemListOrderAscending,
  ItemListOrderDescending: schema.ItemListOrderDescending,
  ItemListUnordered: schema.ItemListUnordered,
};

export type ItemListOrderType = typeof values[keyof typeof values];

export default values;
