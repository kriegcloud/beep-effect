import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { DataFeedMixin } from './DataFeed.js';

export interface CompleteDataFeed<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.DataFeed<D>, rdfine.RdfResource<D> {
}

export function CompleteDataFeedMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<CompleteDataFeed & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class CompleteDataFeedClass extends DataFeedMixin(Resource) {
  }
  return CompleteDataFeedClass as any
}
CompleteDataFeedMixin.appliesTo = schema.CompleteDataFeed
CompleteDataFeedMixin.createFactory = (env: RdfineEnvironment) => createFactory<CompleteDataFeed>([DataFeedMixin, CompleteDataFeedMixin], { types: [schema.CompleteDataFeed] }, env)
