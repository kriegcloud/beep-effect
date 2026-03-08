import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { dash } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Dash from '../index.js';
import type * as Shacl from '@rdfine/shacl';
import { MultiFunctionMixin } from './MultiFunction.js';
import { SPARQLSelectExecutableMixin as ShaclSPARQLSelectExecutableMixin } from '@rdfine/shacl/lib/SPARQLSelectExecutable';

export interface SPARQLMultiFunction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Dash.MultiFunction<D>, Shacl.SPARQLSelectExecutable<D>, rdfine.RdfResource<D> {
}

export function SPARQLMultiFunctionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<SPARQLMultiFunction & RdfResourceCore> & Base {
  @rdfine.namespace(dash)
  class SPARQLMultiFunctionClass extends ShaclSPARQLSelectExecutableMixin(MultiFunctionMixin(Resource)) {
  }
  return SPARQLMultiFunctionClass as any
}
SPARQLMultiFunctionMixin.appliesTo = dash.SPARQLMultiFunction
SPARQLMultiFunctionMixin.createFactory = (env: RdfineEnvironment) => createFactory<SPARQLMultiFunction>([ShaclSPARQLSelectExecutableMixin, MultiFunctionMixin, SPARQLMultiFunctionMixin], { types: [dash.SPARQLMultiFunction] }, env)
