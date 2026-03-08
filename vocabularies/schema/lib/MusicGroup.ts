import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { PerformingGroupMixin } from './PerformingGroup.js';

export interface MusicGroup<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.PerformingGroup<D>, rdfine.RdfResource<D> {
  album: Schema.MusicAlbum<D> | undefined;
  albums: Schema.MusicAlbum<D> | undefined;
  genre: string | undefined;
  genreTerm: RDF.NamedNode | undefined;
  musicGroupMember: Schema.Person<D> | undefined;
  track: Schema.ItemList<D> | Schema.MusicRecording<D> | undefined;
  tracks: Schema.MusicRecording<D> | undefined;
}

export function MusicGroupMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<MusicGroup & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MusicGroupClass extends PerformingGroupMixin(Resource) {
    @rdfine.property.resource()
    album: Schema.MusicAlbum | undefined;
    @rdfine.property.resource()
    albums: Schema.MusicAlbum | undefined;
    @rdfine.property.literal()
    genre: string | undefined;
    @rdfine.property({ path: schema.genre })
    genreTerm: RDF.NamedNode | undefined;
    @rdfine.property.resource()
    musicGroupMember: Schema.Person | undefined;
    @rdfine.property.resource()
    track: Schema.ItemList | Schema.MusicRecording | undefined;
    @rdfine.property.resource()
    tracks: Schema.MusicRecording | undefined;
  }
  return MusicGroupClass as any
}
MusicGroupMixin.appliesTo = schema.MusicGroup
MusicGroupMixin.createFactory = (env: RdfineEnvironment) => createFactory<MusicGroup>([PerformingGroupMixin, MusicGroupMixin], { types: [schema.MusicGroup] }, env)
