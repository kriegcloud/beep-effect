import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreativeWorkMixin } from './CreativeWork.js';
import { CreativeWorkSeriesMixin } from './CreativeWorkSeries.js';

export interface TVSeries<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreativeWork<D>, Schema.CreativeWorkSeries<D>, rdfine.RdfResource<D> {
  actor: Schema.Person<D> | undefined;
  actors: Schema.Person<D> | undefined;
  containsSeason: Schema.CreativeWorkSeason<D> | undefined;
  countryOfOrigin: Schema.Country<D> | undefined;
  director: Schema.Person<D> | undefined;
  directors: Schema.Person<D> | undefined;
  episode: Schema.Episode<D> | undefined;
  episodes: Schema.Episode<D> | undefined;
  musicBy: Schema.MusicGroup<D> | Schema.Person<D> | undefined;
  numberOfEpisodes: number | undefined;
  numberOfSeasons: number | undefined;
  productionCompany: Schema.Organization<D> | undefined;
  season: Schema.CreativeWorkSeason<D> | undefined;
  seasons: Schema.CreativeWorkSeason<D> | undefined;
  trailer: Schema.VideoObject<D> | undefined;
}

export function TVSeriesMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<TVSeries & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class TVSeriesClass extends CreativeWorkSeriesMixin(CreativeWorkMixin(Resource)) {
    @rdfine.property.resource()
    actor: Schema.Person | undefined;
    @rdfine.property.resource()
    actors: Schema.Person | undefined;
    @rdfine.property.resource()
    containsSeason: Schema.CreativeWorkSeason | undefined;
    @rdfine.property.resource()
    countryOfOrigin: Schema.Country | undefined;
    @rdfine.property.resource()
    director: Schema.Person | undefined;
    @rdfine.property.resource()
    directors: Schema.Person | undefined;
    @rdfine.property.resource()
    episode: Schema.Episode | undefined;
    @rdfine.property.resource()
    episodes: Schema.Episode | undefined;
    @rdfine.property.resource()
    musicBy: Schema.MusicGroup | Schema.Person | undefined;
    @rdfine.property.literal({ type: Number })
    numberOfEpisodes: number | undefined;
    @rdfine.property.literal({ type: Number })
    numberOfSeasons: number | undefined;
    @rdfine.property.resource()
    productionCompany: Schema.Organization | undefined;
    @rdfine.property.resource()
    season: Schema.CreativeWorkSeason | undefined;
    @rdfine.property.resource()
    seasons: Schema.CreativeWorkSeason | undefined;
    @rdfine.property.resource()
    trailer: Schema.VideoObject | undefined;
  }
  return TVSeriesClass as any
}
TVSeriesMixin.appliesTo = schema.TVSeries
TVSeriesMixin.createFactory = (env: RdfineEnvironment) => createFactory<TVSeries>([CreativeWorkSeriesMixin, CreativeWorkMixin, TVSeriesMixin], { types: [schema.TVSeries] }, env)
