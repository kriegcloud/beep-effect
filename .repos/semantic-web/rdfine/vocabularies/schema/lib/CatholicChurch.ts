import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ChurchMixin } from './Church.js';

export interface CatholicChurch<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Church<D>, rdfine.RdfResource<D> {
}

export function CatholicChurchMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<CatholicChurch & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class CatholicChurchClass extends ChurchMixin(Resource) {
  }
  return CatholicChurchClass as any
}
CatholicChurchMixin.appliesTo = schema.CatholicChurch
CatholicChurchMixin.createFactory = (env: RdfineEnvironment) => createFactory<CatholicChurch>([ChurchMixin, CatholicChurchMixin], { types: [schema.CatholicChurch] }, env)
