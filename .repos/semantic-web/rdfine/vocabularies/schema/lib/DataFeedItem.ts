import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { IntangibleMixin } from './Intangible.js';

export interface DataFeedItem<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Intangible<D>, rdfine.RdfResource<D> {
  dateCreated: Date | undefined;
  dateDeleted: Date | undefined;
  dateModified: Date | undefined;
  item: Schema.Thing<D> | undefined;
}

export function DataFeedItemMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<DataFeedItem & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class DataFeedItemClass extends IntangibleMixin(Resource) {
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    dateCreated: Date | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    dateDeleted: Date | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    dateModified: Date | undefined;
    @rdfine.property.resource()
    item: Schema.Thing | undefined;
  }
  return DataFeedItemClass as any
}
DataFeedItemMixin.appliesTo = schema.DataFeedItem
DataFeedItemMixin.createFactory = (env: RdfineEnvironment) => createFactory<DataFeedItem>([IntangibleMixin, DataFeedItemMixin], { types: [schema.DataFeedItem] }, env)
