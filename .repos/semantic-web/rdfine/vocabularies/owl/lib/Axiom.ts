import '../extensions/rdfs/Resource.js';
import { ResourceMixinEx } from '../extensions/rdfs/Resource.js';
import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { owl } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Owl from '../index.js';
import type * as Rdfs from '@rdfine/rdfs';
import { ResourceMixin as RdfsResourceMixin } from '@rdfine/rdfs/lib/Resource';

export interface Axiom<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rdfs.Resource<D>, rdfine.RdfResource<D> {
}

export function AxiomMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Axiom & RdfResourceCore> & Base {
  @rdfine.namespace(owl)
  class AxiomClass extends ResourceMixinEx(RdfsResourceMixin(Resource)) {
  }
  return AxiomClass as any
}
AxiomMixin.appliesTo = owl.Axiom
AxiomMixin.createFactory = (env: RdfineEnvironment) => createFactory<Axiom>([RdfsResourceMixin, AxiomMixin], { types: [owl.Axiom] }, env)
