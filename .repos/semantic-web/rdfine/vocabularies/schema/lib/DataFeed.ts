import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { DatasetMixin } from './Dataset.js';

export interface DataFeed<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Dataset<D>, rdfine.RdfResource<D> {
  dataFeedElement: Schema.DataFeedItem<D> | Schema.Thing<D> | undefined;
  dataFeedElementLiteral: string | undefined;
}

export function DataFeedMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<DataFeed & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class DataFeedClass extends DatasetMixin(Resource) {
    @rdfine.property.resource()
    dataFeedElement: Schema.DataFeedItem | Schema.Thing | undefined;
    @rdfine.property.literal({ path: schema.dataFeedElement })
    dataFeedElementLiteral: string | undefined;
  }
  return DataFeedClass as any
}
DataFeedMixin.appliesTo = schema.DataFeed
DataFeedMixin.createFactory = (env: RdfineEnvironment) => createFactory<DataFeed>([DatasetMixin, DataFeedMixin], { types: [schema.DataFeed] }, env)
