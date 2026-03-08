import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { EpisodeMixin } from './Episode.js';

export interface TVEpisode<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Episode<D>, rdfine.RdfResource<D> {
  countryOfOrigin: Schema.Country<D> | undefined;
  partOfTVSeries: Schema.TVSeries<D> | undefined;
  subtitleLanguage: Schema.Language<D> | undefined;
  subtitleLanguageLiteral: string | undefined;
  titleEIDR: string | undefined;
  titleEIDRTerm: RDF.NamedNode | undefined;
}

export function TVEpisodeMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<TVEpisode & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class TVEpisodeClass extends EpisodeMixin(Resource) {
    @rdfine.property.resource()
    countryOfOrigin: Schema.Country | undefined;
    @rdfine.property.resource()
    partOfTVSeries: Schema.TVSeries | undefined;
    @rdfine.property.resource()
    subtitleLanguage: Schema.Language | undefined;
    @rdfine.property.literal({ path: schema.subtitleLanguage })
    subtitleLanguageLiteral: string | undefined;
    @rdfine.property.literal()
    titleEIDR: string | undefined;
    @rdfine.property({ path: schema.titleEIDR })
    titleEIDRTerm: RDF.NamedNode | undefined;
  }
  return TVEpisodeClass as any
}
TVEpisodeMixin.appliesTo = schema.TVEpisode
TVEpisodeMixin.createFactory = (env: RdfineEnvironment) => createFactory<TVEpisode>([EpisodeMixin, TVEpisodeMixin], { types: [schema.TVEpisode] }, env)
