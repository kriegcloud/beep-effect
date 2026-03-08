import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { doap } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Doap from '../index.js';
import { RepositoryMixin } from './Repository.js';

export interface BKRepository<D extends RDF.DatasetCore = RDF.DatasetCore> extends Doap.Repository<D>, rdfine.RdfResource<D> {
  module: RDF.Term | undefined;
}

export function BKRepositoryMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<BKRepository & RdfResourceCore> & Base {
  @rdfine.namespace(doap)
  class BKRepositoryClass extends RepositoryMixin(Resource) {
    @rdfine.property()
    module: RDF.Term | undefined;
  }
  return BKRepositoryClass as any
}
BKRepositoryMixin.appliesTo = doap.BKRepository
BKRepositoryMixin.createFactory = (env: RdfineEnvironment) => createFactory<BKRepository>([RepositoryMixin, BKRepositoryMixin], { types: [doap.BKRepository] }, env)
