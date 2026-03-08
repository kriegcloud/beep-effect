import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreativeWorkMixin } from './CreativeWork.js';

export interface CreativeWorkSeason<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreativeWork<D>, rdfine.RdfResource<D> {
  actor: Schema.Person<D> | undefined;
  director: Schema.Person<D> | undefined;
  endDate: Date | undefined;
  episode: Schema.Episode<D> | undefined;
  episodes: Schema.Episode<D> | undefined;
  numberOfEpisodes: number | undefined;
  partOfSeries: Schema.CreativeWorkSeries<D> | undefined;
  productionCompany: Schema.Organization<D> | undefined;
  seasonNumber: number | string | undefined;
  startDate: Date | undefined;
  trailer: Schema.VideoObject<D> | undefined;
}

export function CreativeWorkSeasonMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<CreativeWorkSeason & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class CreativeWorkSeasonClass extends CreativeWorkMixin(Resource) {
    @rdfine.property.resource()
    actor: Schema.Person | undefined;
    @rdfine.property.resource()
    director: Schema.Person | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    endDate: Date | undefined;
    @rdfine.property.resource()
    episode: Schema.Episode | undefined;
    @rdfine.property.resource()
    episodes: Schema.Episode | undefined;
    @rdfine.property.literal({ type: Number })
    numberOfEpisodes: number | undefined;
    @rdfine.property.resource()
    partOfSeries: Schema.CreativeWorkSeries | undefined;
    @rdfine.property.resource()
    productionCompany: Schema.Organization | undefined;
    @rdfine.property.literal()
    seasonNumber: number | string | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    startDate: Date | undefined;
    @rdfine.property.resource()
    trailer: Schema.VideoObject | undefined;
  }
  return CreativeWorkSeasonClass as any
}
CreativeWorkSeasonMixin.appliesTo = schema.CreativeWorkSeason
CreativeWorkSeasonMixin.createFactory = (env: RdfineEnvironment) => createFactory<CreativeWorkSeason>([CreativeWorkMixin, CreativeWorkSeasonMixin], { types: [schema.CreativeWorkSeason] }, env)
