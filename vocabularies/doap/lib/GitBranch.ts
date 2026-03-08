import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { doap } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Doap from '../index.js';
import { RepositoryMixin } from './Repository.js';

export interface GitBranch<D extends RDF.DatasetCore = RDF.DatasetCore> extends Doap.Repository<D>, rdfine.RdfResource<D> {
}

export function GitBranchMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<GitBranch & RdfResourceCore> & Base {
  @rdfine.namespace(doap)
  class GitBranchClass extends RepositoryMixin(Resource) {
  }
  return GitBranchClass as any
}
GitBranchMixin.appliesTo = doap.GitBranch
GitBranchMixin.createFactory = (env: RdfineEnvironment) => createFactory<GitBranch>([RepositoryMixin, GitBranchMixin], { types: [doap.GitBranch] }, env)
