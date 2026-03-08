import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { prov } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Prov from '../index.js';
import { RoleMixin } from './Role.js';

export interface Contributor<D extends RDF.DatasetCore = RDF.DatasetCore> extends Prov.Role<D>, rdfine.RdfResource<D> {
}

export function ContributorMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Contributor & RdfResourceCore> & Base {
  @rdfine.namespace(prov)
  class ContributorClass extends RoleMixin(Resource) {
  }
  return ContributorClass as any
}
ContributorMixin.appliesTo = prov.Contributor
ContributorMixin.createFactory = (env: RdfineEnvironment) => createFactory<Contributor>([RoleMixin, ContributorMixin], { types: [prov.Contributor] }, env)
