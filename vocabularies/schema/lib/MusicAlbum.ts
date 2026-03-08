import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { MusicPlaylistMixin } from './MusicPlaylist.js';

export interface MusicAlbum<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.MusicPlaylist<D>, rdfine.RdfResource<D> {
  albumProductionType: Schema.MusicAlbumProductionType | undefined;
  albumRelease: Schema.MusicRelease<D> | undefined;
  albumReleaseType: Schema.MusicAlbumReleaseType | undefined;
  byArtist: Schema.MusicGroup<D> | Schema.Person<D> | undefined;
}

export function MusicAlbumMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<MusicAlbum & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MusicAlbumClass extends MusicPlaylistMixin(Resource) {
    @rdfine.property()
    albumProductionType: Schema.MusicAlbumProductionType | undefined;
    @rdfine.property.resource()
    albumRelease: Schema.MusicRelease | undefined;
    @rdfine.property()
    albumReleaseType: Schema.MusicAlbumReleaseType | undefined;
    @rdfine.property.resource()
    byArtist: Schema.MusicGroup | Schema.Person | undefined;
  }
  return MusicAlbumClass as any
}
MusicAlbumMixin.appliesTo = schema.MusicAlbum
MusicAlbumMixin.createFactory = (env: RdfineEnvironment) => createFactory<MusicAlbum>([MusicPlaylistMixin, MusicAlbumMixin], { types: [schema.MusicAlbum] }, env)
