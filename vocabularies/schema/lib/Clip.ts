import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreativeWorkMixin } from './CreativeWork.js';

export interface Clip<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreativeWork<D>, rdfine.RdfResource<D> {
  actor: Schema.Person<D> | undefined;
  actors: Schema.Person<D> | undefined;
  clipNumber: number | string | undefined;
  director: Schema.Person<D> | undefined;
  directors: Schema.Person<D> | undefined;
  endOffset: Schema.HyperTocEntry<D> | undefined;
  endOffsetLiteral: number | undefined;
  musicBy: Schema.MusicGroup<D> | Schema.Person<D> | undefined;
  partOfEpisode: Schema.Episode<D> | undefined;
  partOfSeason: Schema.CreativeWorkSeason<D> | undefined;
  partOfSeries: Schema.CreativeWorkSeries<D> | undefined;
  startOffset: Schema.HyperTocEntry<D> | undefined;
  startOffsetLiteral: number | undefined;
}

export function ClipMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Clip & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ClipClass extends CreativeWorkMixin(Resource) {
    @rdfine.property.resource()
    actor: Schema.Person | undefined;
    @rdfine.property.resource()
    actors: Schema.Person | undefined;
    @rdfine.property.literal()
    clipNumber: number | string | undefined;
    @rdfine.property.resource()
    director: Schema.Person | undefined;
    @rdfine.property.resource()
    directors: Schema.Person | undefined;
    @rdfine.property.resource()
    endOffset: Schema.HyperTocEntry | undefined;
    @rdfine.property.literal({ path: schema.endOffset, type: Number })
    endOffsetLiteral: number | undefined;
    @rdfine.property.resource()
    musicBy: Schema.MusicGroup | Schema.Person | undefined;
    @rdfine.property.resource()
    partOfEpisode: Schema.Episode | undefined;
    @rdfine.property.resource()
    partOfSeason: Schema.CreativeWorkSeason | undefined;
    @rdfine.property.resource()
    partOfSeries: Schema.CreativeWorkSeries | undefined;
    @rdfine.property.resource()
    startOffset: Schema.HyperTocEntry | undefined;
    @rdfine.property.literal({ path: schema.startOffset, type: Number })
    startOffsetLiteral: number | undefined;
  }
  return ClipClass as any
}
ClipMixin.appliesTo = schema.Clip
ClipMixin.createFactory = (env: RdfineEnvironment) => createFactory<Clip>([CreativeWorkMixin, ClipMixin], { types: [schema.Clip] }, env)
