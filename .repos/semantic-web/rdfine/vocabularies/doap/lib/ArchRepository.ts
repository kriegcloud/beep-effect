import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { doap } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Doap from '../index.js';
import { RepositoryMixin } from './Repository.js';

export interface ArchRepository<D extends RDF.DatasetCore = RDF.DatasetCore> extends Doap.Repository<D>, rdfine.RdfResource<D> {
  module: RDF.Term | undefined;
}

export function ArchRepositoryMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ArchRepository & RdfResourceCore> & Base {
  @rdfine.namespace(doap)
  class ArchRepositoryClass extends RepositoryMixin(Resource) {
    @rdfine.property()
    module: RDF.Term | undefined;
  }
  return ArchRepositoryClass as any
}
ArchRepositoryMixin.appliesTo = doap.ArchRepository
ArchRepositoryMixin.createFactory = (env: RdfineEnvironment) => createFactory<ArchRepository>([RepositoryMixin, ArchRepositoryMixin], { types: [doap.ArchRepository] }, env)
