import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { sh } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Sh from '../index.js';
import { SPARQLExecutableMixin } from './SPARQLExecutable.js';

export interface SPARQLSelectExecutable<D extends RDF.DatasetCore = RDF.DatasetCore> extends Sh.SPARQLExecutable<D>, rdfine.RdfResource<D> {
  select: string | undefined;
}

export function SPARQLSelectExecutableMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<SPARQLSelectExecutable & RdfResourceCore> & Base {
  @rdfine.namespace(sh)
  class SPARQLSelectExecutableClass extends SPARQLExecutableMixin(Resource) {
    @rdfine.property.literal()
    select: string | undefined;
  }
  return SPARQLSelectExecutableClass as any
}
SPARQLSelectExecutableMixin.appliesTo = sh.SPARQLSelectExecutable
SPARQLSelectExecutableMixin.createFactory = (env: RdfineEnvironment) => createFactory<SPARQLSelectExecutable>([SPARQLExecutableMixin, SPARQLSelectExecutableMixin], { types: [sh.SPARQLSelectExecutable] }, env)
