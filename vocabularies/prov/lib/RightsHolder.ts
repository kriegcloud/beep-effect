import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { prov } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Prov from '../index.js';
import { RoleMixin } from './Role.js';

export interface RightsHolder<D extends RDF.DatasetCore = RDF.DatasetCore> extends Prov.Role<D>, rdfine.RdfResource<D> {
}

export function RightsHolderMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<RightsHolder & RdfResourceCore> & Base {
  @rdfine.namespace(prov)
  class RightsHolderClass extends RoleMixin(Resource) {
  }
  return RightsHolderClass as any
}
RightsHolderMixin.appliesTo = prov.RightsHolder
RightsHolderMixin.createFactory = (env: RdfineEnvironment) => createFactory<RightsHolder>([RoleMixin, RightsHolderMixin], { types: [prov.RightsHolder] }, env)
