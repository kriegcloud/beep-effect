import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { sh } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Sh from '../index.js';
import { SPARQLExecutableMixin } from './SPARQLExecutable.js';

export interface SPARQLConstructExecutable<D extends RDF.DatasetCore = RDF.DatasetCore> extends Sh.SPARQLExecutable<D>, rdfine.RdfResource<D> {
  construct: string | undefined;
}

export function SPARQLConstructExecutableMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<SPARQLConstructExecutable & RdfResourceCore> & Base {
  @rdfine.namespace(sh)
  class SPARQLConstructExecutableClass extends SPARQLExecutableMixin(Resource) {
    @rdfine.property.literal()
    construct: string | undefined;
  }
  return SPARQLConstructExecutableClass as any
}
SPARQLConstructExecutableMixin.appliesTo = sh.SPARQLConstructExecutable
SPARQLConstructExecutableMixin.createFactory = (env: RdfineEnvironment) => createFactory<SPARQLConstructExecutable>([SPARQLExecutableMixin, SPARQLConstructExecutableMixin], { types: [sh.SPARQLConstructExecutable] }, env)
