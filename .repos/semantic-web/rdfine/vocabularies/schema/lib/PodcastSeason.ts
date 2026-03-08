import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreativeWorkSeasonMixin } from './CreativeWorkSeason.js';

export interface PodcastSeason<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreativeWorkSeason<D>, rdfine.RdfResource<D> {
}

export function PodcastSeasonMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<PodcastSeason & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class PodcastSeasonClass extends CreativeWorkSeasonMixin(Resource) {
  }
  return PodcastSeasonClass as any
}
PodcastSeasonMixin.appliesTo = schema.PodcastSeason
PodcastSeasonMixin.createFactory = (env: RdfineEnvironment) => createFactory<PodcastSeason>([CreativeWorkSeasonMixin, PodcastSeasonMixin], { types: [schema.PodcastSeason] }, env)
