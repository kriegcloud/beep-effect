import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreativeWorkMixin } from './CreativeWork.js';

export interface Episode<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreativeWork<D>, rdfine.RdfResource<D> {
  actor: Schema.Person<D> | undefined;
  actors: Schema.Person<D> | undefined;
  director: Schema.Person<D> | undefined;
  directors: Schema.Person<D> | undefined;
  duration: Schema.Duration<D> | undefined;
  episodeNumber: number | string | undefined;
  musicBy: Schema.MusicGroup<D> | Schema.Person<D> | undefined;
  partOfSeason: Schema.CreativeWorkSeason<D> | undefined;
  partOfSeries: Schema.CreativeWorkSeries<D> | undefined;
  productionCompany: Schema.Organization<D> | undefined;
  trailer: Schema.VideoObject<D> | undefined;
}

export function EpisodeMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Episode & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class EpisodeClass extends CreativeWorkMixin(Resource) {
    @rdfine.property.resource()
    actor: Schema.Person | undefined;
    @rdfine.property.resource()
    actors: Schema.Person | undefined;
    @rdfine.property.resource()
    director: Schema.Person | undefined;
    @rdfine.property.resource()
    directors: Schema.Person | undefined;
    @rdfine.property.resource()
    duration: Schema.Duration | undefined;
    @rdfine.property.literal()
    episodeNumber: number | string | undefined;
    @rdfine.property.resource()
    musicBy: Schema.MusicGroup | Schema.Person | undefined;
    @rdfine.property.resource()
    partOfSeason: Schema.CreativeWorkSeason | undefined;
    @rdfine.property.resource()
    partOfSeries: Schema.CreativeWorkSeries | undefined;
    @rdfine.property.resource()
    productionCompany: Schema.Organization | undefined;
    @rdfine.property.resource()
    trailer: Schema.VideoObject | undefined;
  }
  return EpisodeClass as any
}
EpisodeMixin.appliesTo = schema.Episode
EpisodeMixin.createFactory = (env: RdfineEnvironment) => createFactory<Episode>([CreativeWorkMixin, EpisodeMixin], { types: [schema.Episode] }, env)
