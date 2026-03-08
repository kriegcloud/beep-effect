import { schema } from './namespace.js';

const values = {
  CDFormat: schema.CDFormat,
  CassetteFormat: schema.CassetteFormat,
  DVDFormat: schema.DVDFormat,
  DigitalAudioTapeFormat: schema.DigitalAudioTapeFormat,
  DigitalFormat: schema.DigitalFormat,
  LaserDiscFormat: schema.LaserDiscFormat,
  VinylFormat: schema.VinylFormat,
};

export type MusicReleaseFormatType = typeof values[keyof typeof values];

export default values;
