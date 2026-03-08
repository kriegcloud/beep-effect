import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { prov } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Prov from '../index.js';
import { DerivationMixin } from './Derivation.js';

export interface PrimarySource<D extends RDF.DatasetCore = RDF.DatasetCore> extends Prov.Derivation<D>, rdfine.RdfResource<D> {
}

export function PrimarySourceMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<PrimarySource & RdfResourceCore> & Base {
  @rdfine.namespace(prov)
  class PrimarySourceClass extends DerivationMixin(Resource) {
  }
  return PrimarySourceClass as any
}
PrimarySourceMixin.appliesTo = prov.PrimarySource
PrimarySourceMixin.createFactory = (env: RdfineEnvironment) => createFactory<PrimarySource>([DerivationMixin, PrimarySourceMixin], { types: [prov.PrimarySource] }, env)
