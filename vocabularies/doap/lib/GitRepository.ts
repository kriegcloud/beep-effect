import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { doap } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Doap from '../index.js';
import { RepositoryMixin } from './Repository.js';

export interface GitRepository<D extends RDF.DatasetCore = RDF.DatasetCore> extends Doap.Repository<D>, rdfine.RdfResource<D> {
}

export function GitRepositoryMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<GitRepository & RdfResourceCore> & Base {
  @rdfine.namespace(doap)
  class GitRepositoryClass extends RepositoryMixin(Resource) {
  }
  return GitRepositoryClass as any
}
GitRepositoryMixin.appliesTo = doap.GitRepository
GitRepositoryMixin.createFactory = (env: RdfineEnvironment) => createFactory<GitRepository>([RepositoryMixin, GitRepositoryMixin], { types: [doap.GitRepository] }, env)
