import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { MusicPlaylistMixin } from './MusicPlaylist.js';

export interface MusicRelease<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.MusicPlaylist<D>, rdfine.RdfResource<D> {
  catalogNumber: string | undefined;
  creditedTo: Schema.Organization<D> | Schema.Person<D> | undefined;
  duration: Schema.Duration<D> | undefined;
  musicReleaseFormat: Schema.MusicReleaseFormatType | undefined;
  recordLabel: Schema.Organization<D> | undefined;
  releaseOf: Schema.MusicAlbum<D> | undefined;
}

export function MusicReleaseMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<MusicRelease & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MusicReleaseClass extends MusicPlaylistMixin(Resource) {
    @rdfine.property.literal()
    catalogNumber: string | undefined;
    @rdfine.property.resource()
    creditedTo: Schema.Organization | Schema.Person | undefined;
    @rdfine.property.resource()
    duration: Schema.Duration | undefined;
    @rdfine.property()
    musicReleaseFormat: Schema.MusicReleaseFormatType | undefined;
    @rdfine.property.resource()
    recordLabel: Schema.Organization | undefined;
    @rdfine.property.resource()
    releaseOf: Schema.MusicAlbum | undefined;
  }
  return MusicReleaseClass as any
}
MusicReleaseMixin.appliesTo = schema.MusicRelease
MusicReleaseMixin.createFactory = (env: RdfineEnvironment) => createFactory<MusicRelease>([MusicPlaylistMixin, MusicReleaseMixin], { types: [schema.MusicRelease] }, env)
