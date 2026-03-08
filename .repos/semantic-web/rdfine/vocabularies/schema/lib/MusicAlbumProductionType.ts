import { schema } from './namespace.js';

const values = {
  CompilationAlbum: schema.CompilationAlbum,
  DJMixAlbum: schema.DJMixAlbum,
  DemoAlbum: schema.DemoAlbum,
  LiveAlbum: schema.LiveAlbum,
  MixtapeAlbum: schema.MixtapeAlbum,
  RemixAlbum: schema.RemixAlbum,
  SoundtrackAlbum: schema.SoundtrackAlbum,
  SpokenWordAlbum: schema.SpokenWordAlbum,
  StudioAlbum: schema.StudioAlbum,
};

export type MusicAlbumProductionType = typeof values[keyof typeof values];

export default values;
