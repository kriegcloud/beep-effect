import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { EpisodeMixin } from './Episode.js';

export interface PodcastEpisode<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Episode<D>, rdfine.RdfResource<D> {
}

export function PodcastEpisodeMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<PodcastEpisode & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class PodcastEpisodeClass extends EpisodeMixin(Resource) {
  }
  return PodcastEpisodeClass as any
}
PodcastEpisodeMixin.appliesTo = schema.PodcastEpisode
PodcastEpisodeMixin.createFactory = (env: RdfineEnvironment) => createFactory<PodcastEpisode>([EpisodeMixin, PodcastEpisodeMixin], { types: [schema.PodcastEpisode] }, env)
