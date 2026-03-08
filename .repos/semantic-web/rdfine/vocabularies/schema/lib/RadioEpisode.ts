import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { EpisodeMixin } from './Episode.js';

export interface RadioEpisode<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Episode<D>, rdfine.RdfResource<D> {
}

export function RadioEpisodeMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<RadioEpisode & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class RadioEpisodeClass extends EpisodeMixin(Resource) {
  }
  return RadioEpisodeClass as any
}
RadioEpisodeMixin.appliesTo = schema.RadioEpisode
RadioEpisodeMixin.createFactory = (env: RdfineEnvironment) => createFactory<RadioEpisode>([EpisodeMixin, RadioEpisodeMixin], { types: [schema.RadioEpisode] }, env)
