import { schema } from './namespace.js';

const values = {
  AudiobookFormat: schema.AudiobookFormat,
  EBook: schema.EBook,
  GraphicNovel: schema.GraphicNovel,
  Hardcover: schema.Hardcover,
  Paperback: schema.Paperback,
};

export type BookFormatType = typeof values[keyof typeof values];

export default values;
