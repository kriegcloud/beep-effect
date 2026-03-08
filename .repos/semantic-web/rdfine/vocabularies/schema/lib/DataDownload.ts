import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { MediaObjectMixin } from './MediaObject.js';

export interface DataDownload<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.MediaObject<D>, rdfine.RdfResource<D> {
  measurementTechnique: string | undefined;
  measurementTechniqueTerm: RDF.NamedNode | undefined;
}

export function DataDownloadMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<DataDownload & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class DataDownloadClass extends MediaObjectMixin(Resource) {
    @rdfine.property.literal()
    measurementTechnique: string | undefined;
    @rdfine.property({ path: schema.measurementTechnique })
    measurementTechniqueTerm: RDF.NamedNode | undefined;
  }
  return DataDownloadClass as any
}
DataDownloadMixin.appliesTo = schema.DataDownload
DataDownloadMixin.createFactory = (env: RdfineEnvironment) => createFactory<DataDownload>([MediaObjectMixin, DataDownloadMixin], { types: [schema.DataDownload] }, env)
