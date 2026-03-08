import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { sh } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Sh from '../index.js';
import { SPARQLExecutableMixin } from './SPARQLExecutable.js';

export interface SPARQLAskExecutable<D extends RDF.DatasetCore = RDF.DatasetCore> extends Sh.SPARQLExecutable<D>, rdfine.RdfResource<D> {
  ask: string | undefined;
}

export function SPARQLAskExecutableMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<SPARQLAskExecutable & RdfResourceCore> & Base {
  @rdfine.namespace(sh)
  class SPARQLAskExecutableClass extends SPARQLExecutableMixin(Resource) {
    @rdfine.property.literal()
    ask: string | undefined;
  }
  return SPARQLAskExecutableClass as any
}
SPARQLAskExecutableMixin.appliesTo = sh.SPARQLAskExecutable
SPARQLAskExecutableMixin.createFactory = (env: RdfineEnvironment) => createFactory<SPARQLAskExecutable>([SPARQLExecutableMixin, SPARQLAskExecutableMixin], { types: [sh.SPARQLAskExecutable] }, env)
