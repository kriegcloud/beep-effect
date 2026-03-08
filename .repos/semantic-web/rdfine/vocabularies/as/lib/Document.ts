import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { as } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as As from '../index.js';
import { ObjectMixin } from './Object.js';

export interface Document<D extends RDF.DatasetCore = RDF.DatasetCore> extends As.Object<D>, rdfine.RdfResource<D> {
}

export function DocumentMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Document & RdfResourceCore> & Base {
  @rdfine.namespace(as)
  class DocumentClass extends ObjectMixin(Resource) {
  }
  return DocumentClass as any
}
DocumentMixin.appliesTo = as.Document
DocumentMixin.createFactory = (env: RdfineEnvironment) => createFactory<Document>([ObjectMixin, DocumentMixin], { types: [as.Document] }, env)
