import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { doap } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Doap from '../index.js';
import { RepositoryMixin } from './Repository.js';

export interface BazaarBranch<D extends RDF.DatasetCore = RDF.DatasetCore> extends Doap.Repository<D>, rdfine.RdfResource<D> {
}

export function BazaarBranchMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<BazaarBranch & RdfResourceCore> & Base {
  @rdfine.namespace(doap)
  class BazaarBranchClass extends RepositoryMixin(Resource) {
  }
  return BazaarBranchClass as any
}
BazaarBranchMixin.appliesTo = doap.BazaarBranch
BazaarBranchMixin.createFactory = (env: RdfineEnvironment) => createFactory<BazaarBranch>([RepositoryMixin, BazaarBranchMixin], { types: [doap.BazaarBranch] }, env)
