import { schema } from './namespace.js';

const values = {
  AlbumRelease: schema.AlbumRelease,
  BroadcastRelease: schema.BroadcastRelease,
  EPRelease: schema.EPRelease,
  SingleRelease: schema.SingleRelease,
};

export type MusicAlbumReleaseType = typeof values[keyof typeof values];

export default values;
