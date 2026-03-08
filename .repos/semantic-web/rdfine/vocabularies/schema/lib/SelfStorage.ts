import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { LocalBusinessMixin } from './LocalBusiness.js';

export interface SelfStorage<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.LocalBusiness<D>, rdfine.RdfResource<D> {
}

export function SelfStorageMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<SelfStorage & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class SelfStorageClass extends LocalBusinessMixin(Resource) {
  }
  return SelfStorageClass as any
}
SelfStorageMixin.appliesTo = schema.SelfStorage
SelfStorageMixin.createFactory = (env: RdfineEnvironment) => createFactory<SelfStorage>([LocalBusinessMixin, SelfStorageMixin], { types: [schema.SelfStorage] }, env)
