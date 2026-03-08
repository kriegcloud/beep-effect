import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { prov } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Prov from '../index.js';
import { DerivationMixin } from './Derivation.js';

export interface Revision<D extends RDF.DatasetCore = RDF.DatasetCore> extends Prov.Derivation<D>, rdfine.RdfResource<D> {
}

export function RevisionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Revision & RdfResourceCore> & Base {
  @rdfine.namespace(prov)
  class RevisionClass extends DerivationMixin(Resource) {
  }
  return RevisionClass as any
}
RevisionMixin.appliesTo = prov.Revision
RevisionMixin.createFactory = (env: RdfineEnvironment) => createFactory<Revision>([DerivationMixin, RevisionMixin], { types: [prov.Revision] }, env)
