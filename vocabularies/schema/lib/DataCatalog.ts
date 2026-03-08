import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreativeWorkMixin } from './CreativeWork.js';

export interface DataCatalog<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreativeWork<D>, rdfine.RdfResource<D> {
  dataset: Schema.Dataset<D> | undefined;
  measurementTechnique: string | undefined;
  measurementTechniqueTerm: RDF.NamedNode | undefined;
}

export function DataCatalogMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<DataCatalog & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class DataCatalogClass extends CreativeWorkMixin(Resource) {
    @rdfine.property.resource()
    dataset: Schema.Dataset | undefined;
    @rdfine.property.literal()
    measurementTechnique: string | undefined;
    @rdfine.property({ path: schema.measurementTechnique })
    measurementTechniqueTerm: RDF.NamedNode | undefined;
  }
  return DataCatalogClass as any
}
DataCatalogMixin.appliesTo = schema.DataCatalog
DataCatalogMixin.createFactory = (env: RdfineEnvironment) => createFactory<DataCatalog>([CreativeWorkMixin, DataCatalogMixin], { types: [schema.DataCatalog] }, env)
