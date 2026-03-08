import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { prov } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Prov from '../index.js';
import { DerivationMixin } from './Derivation.js';

export interface Removal<D extends RDF.DatasetCore = RDF.DatasetCore> extends Prov.Derivation<D>, rdfine.RdfResource<D> {
  dictionary: Prov.Dictionary<D> | undefined;
  removedKey: RDF.Literal | undefined;
}

export function RemovalMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Removal & RdfResourceCore> & Base {
  @rdfine.namespace(prov)
  class RemovalClass extends DerivationMixin(Resource) {
    @rdfine.property.resource({ implicitTypes: [prov.Dictionary] })
    dictionary: Prov.Dictionary | undefined;
    @rdfine.property()
    removedKey: RDF.Literal | undefined;
  }
  return RemovalClass as any
}
RemovalMixin.appliesTo = prov.Removal
RemovalMixin.createFactory = (env: RdfineEnvironment) => createFactory<Removal>([DerivationMixin, RemovalMixin], { types: [prov.Removal] }, env)
