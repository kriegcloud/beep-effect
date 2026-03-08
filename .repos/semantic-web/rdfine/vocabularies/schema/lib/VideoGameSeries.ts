import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreativeWorkSeriesMixin } from './CreativeWorkSeries.js';

export interface VideoGameSeries<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreativeWorkSeries<D>, rdfine.RdfResource<D> {
  actor: Schema.Person<D> | undefined;
  actors: Schema.Person<D> | undefined;
  characterAttribute: Schema.Thing<D> | undefined;
  cheatCode: Schema.CreativeWork<D> | undefined;
  containsSeason: Schema.CreativeWorkSeason<D> | undefined;
  director: Schema.Person<D> | undefined;
  directors: Schema.Person<D> | undefined;
  episode: Schema.Episode<D> | undefined;
  episodes: Schema.Episode<D> | undefined;
  gameItem: Schema.Thing<D> | undefined;
  gameLocation: Schema.Place<D> | Schema.PostalAddress<D> | undefined;
  gamePlatform: Schema.Thing<D> | undefined;
  gamePlatformLiteral: string | undefined;
  musicBy: Schema.MusicGroup<D> | Schema.Person<D> | undefined;
  numberOfEpisodes: number | undefined;
  numberOfPlayers: Schema.QuantitativeValue<D> | undefined;
  numberOfSeasons: number | undefined;
  playMode: Schema.GamePlayMode | undefined;
  productionCompany: Schema.Organization<D> | undefined;
  quest: Schema.Thing<D> | undefined;
  season: Schema.CreativeWorkSeason<D> | undefined;
  seasons: Schema.CreativeWorkSeason<D> | undefined;
  trailer: Schema.VideoObject<D> | undefined;
}

export function VideoGameSeriesMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<VideoGameSeries & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class VideoGameSeriesClass extends CreativeWorkSeriesMixin(Resource) {
    @rdfine.property.resource()
    actor: Schema.Person | undefined;
    @rdfine.property.resource()
    actors: Schema.Person | undefined;
    @rdfine.property.resource()
    characterAttribute: Schema.Thing | undefined;
    @rdfine.property.resource()
    cheatCode: Schema.CreativeWork | undefined;
    @rdfine.property.resource()
    containsSeason: Schema.CreativeWorkSeason | undefined;
    @rdfine.property.resource()
    director: Schema.Person | undefined;
    @rdfine.property.resource()
    directors: Schema.Person | undefined;
    @rdfine.property.resource()
    episode: Schema.Episode | undefined;
    @rdfine.property.resource()
    episodes: Schema.Episode | undefined;
    @rdfine.property.resource()
    gameItem: Schema.Thing | undefined;
    @rdfine.property.resource()
    gameLocation: Schema.Place | Schema.PostalAddress | undefined;
    @rdfine.property.resource()
    gamePlatform: Schema.Thing | undefined;
    @rdfine.property.literal({ path: schema.gamePlatform })
    gamePlatformLiteral: string | undefined;
    @rdfine.property.resource()
    musicBy: Schema.MusicGroup | Schema.Person | undefined;
    @rdfine.property.literal({ type: Number })
    numberOfEpisodes: number | undefined;
    @rdfine.property.resource()
    numberOfPlayers: Schema.QuantitativeValue | undefined;
    @rdfine.property.literal({ type: Number })
    numberOfSeasons: number | undefined;
    @rdfine.property()
    playMode: Schema.GamePlayMode | undefined;
    @rdfine.property.resource()
    productionCompany: Schema.Organization | undefined;
    @rdfine.property.resource()
    quest: Schema.Thing | undefined;
    @rdfine.property.resource()
    season: Schema.CreativeWorkSeason | undefined;
    @rdfine.property.resource()
    seasons: Schema.CreativeWorkSeason | undefined;
    @rdfine.property.resource()
    trailer: Schema.VideoObject | undefined;
  }
  return VideoGameSeriesClass as any
}
VideoGameSeriesMixin.appliesTo = schema.VideoGameSeries
VideoGameSeriesMixin.createFactory = (env: RdfineEnvironment) => createFactory<VideoGameSeries>([CreativeWorkSeriesMixin, VideoGameSeriesMixin], { types: [schema.VideoGameSeries] }, env)
