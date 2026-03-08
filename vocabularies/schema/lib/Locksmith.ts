import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { HomeAndConstructionBusinessMixin } from './HomeAndConstructionBusiness.js';

export interface Locksmith<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.HomeAndConstructionBusiness<D>, rdfine.RdfResource<D> {
}

export function LocksmithMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Locksmith & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class LocksmithClass extends HomeAndConstructionBusinessMixin(Resource) {
  }
  return LocksmithClass as any
}
LocksmithMixin.appliesTo = schema.Locksmith
LocksmithMixin.createFactory = (env: RdfineEnvironment) => createFactory<Locksmith>([HomeAndConstructionBusinessMixin, LocksmithMixin], { types: [schema.Locksmith] }, env)
