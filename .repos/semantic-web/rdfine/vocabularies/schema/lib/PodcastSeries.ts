import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreativeWorkSeriesMixin } from './CreativeWorkSeries.js';

export interface PodcastSeries<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreativeWorkSeries<D>, rdfine.RdfResource<D> {
  actor: Schema.Person<D> | undefined;
  webFeed: Schema.DataFeed<D> | undefined;
}

export function PodcastSeriesMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<PodcastSeries & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class PodcastSeriesClass extends CreativeWorkSeriesMixin(Resource) {
    @rdfine.property.resource()
    actor: Schema.Person | undefined;
    @rdfine.property.resource()
    webFeed: Schema.DataFeed | undefined;
  }
  return PodcastSeriesClass as any
}
PodcastSeriesMixin.appliesTo = schema.PodcastSeries
PodcastSeriesMixin.createFactory = (env: RdfineEnvironment) => createFactory<PodcastSeries>([CreativeWorkSeriesMixin, PodcastSeriesMixin], { types: [schema.PodcastSeries] }, env)
