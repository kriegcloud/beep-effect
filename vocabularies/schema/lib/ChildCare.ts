import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { LocalBusinessMixin } from './LocalBusiness.js';

export interface ChildCare<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.LocalBusiness<D>, rdfine.RdfResource<D> {
}

export function ChildCareMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ChildCare & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ChildCareClass extends LocalBusinessMixin(Resource) {
  }
  return ChildCareClass as any
}
ChildCareMixin.appliesTo = schema.ChildCare
ChildCareMixin.createFactory = (env: RdfineEnvironment) => createFactory<ChildCare>([LocalBusinessMixin, ChildCareMixin], { types: [schema.ChildCare] }, env)
