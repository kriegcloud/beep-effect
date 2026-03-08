import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { prov } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Prov from '../index.js';
import { EntityMixin } from './Entity.js';

export interface Bundle<D extends RDF.DatasetCore = RDF.DatasetCore> extends Prov.Entity<D>, rdfine.RdfResource<D> {
}

export function BundleMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Bundle & RdfResourceCore> & Base {
  @rdfine.namespace(prov)
  class BundleClass extends EntityMixin(Resource) {
  }
  return BundleClass as any
}
BundleMixin.appliesTo = prov.Bundle
BundleMixin.createFactory = (env: RdfineEnvironment) => createFactory<Bundle>([EntityMixin, BundleMixin], { types: [prov.Bundle] }, env)
