import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { as } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as As from '../index.js';
import { ObjectMixin } from './Object.js';

export interface Organization<D extends RDF.DatasetCore = RDF.DatasetCore> extends As.Object<D>, rdfine.RdfResource<D> {
}

export function OrganizationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Organization & RdfResourceCore> & Base {
  @rdfine.namespace(as)
  class OrganizationClass extends ObjectMixin(Resource) {
  }
  return OrganizationClass as any
}
OrganizationMixin.appliesTo = as.Organization
OrganizationMixin.createFactory = (env: RdfineEnvironment) => createFactory<Organization>([ObjectMixin, OrganizationMixin], { types: [as.Organization] }, env)
