import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { sh } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Sh from '../index.js';
import { SPARQLExecutableMixin } from './SPARQLExecutable.js';

export interface SPARQLUpdateExecutable<D extends RDF.DatasetCore = RDF.DatasetCore> extends Sh.SPARQLExecutable<D>, rdfine.RdfResource<D> {
  update: string | undefined;
}

export function SPARQLUpdateExecutableMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<SPARQLUpdateExecutable & RdfResourceCore> & Base {
  @rdfine.namespace(sh)
  class SPARQLUpdateExecutableClass extends SPARQLExecutableMixin(Resource) {
    @rdfine.property.literal()
    update: string | undefined;
  }
  return SPARQLUpdateExecutableClass as any
}
SPARQLUpdateExecutableMixin.appliesTo = sh.SPARQLUpdateExecutable
SPARQLUpdateExecutableMixin.createFactory = (env: RdfineEnvironment) => createFactory<SPARQLUpdateExecutable>([SPARQLExecutableMixin, SPARQLUpdateExecutableMixin], { types: [sh.SPARQLUpdateExecutable] }, env)
