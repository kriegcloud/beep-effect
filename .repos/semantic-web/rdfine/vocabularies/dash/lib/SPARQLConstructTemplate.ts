import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { dash } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Dash from '../index.js';
import type * as Shacl from '@rdfine/shacl';
import { ParameterizableMixin as ShaclParameterizableMixin } from '@rdfine/shacl/lib/Parameterizable';
import { SPARQLConstructExecutableMixin as ShaclSPARQLConstructExecutableMixin } from '@rdfine/shacl/lib/SPARQLConstructExecutable';

export interface SPARQLConstructTemplate<D extends RDF.DatasetCore = RDF.DatasetCore> extends Shacl.Parameterizable<D>, Shacl.SPARQLConstructExecutable<D>, rdfine.RdfResource<D> {
}

export function SPARQLConstructTemplateMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<SPARQLConstructTemplate & RdfResourceCore> & Base {
  @rdfine.namespace(dash)
  class SPARQLConstructTemplateClass extends ShaclSPARQLConstructExecutableMixin(ShaclParameterizableMixin(Resource)) {
  }
  return SPARQLConstructTemplateClass as any
}
SPARQLConstructTemplateMixin.appliesTo = dash.SPARQLConstructTemplate
SPARQLConstructTemplateMixin.createFactory = (env: RdfineEnvironment) => createFactory<SPARQLConstructTemplate>([ShaclSPARQLConstructExecutableMixin, ShaclParameterizableMixin, SPARQLConstructTemplateMixin], { types: [dash.SPARQLConstructTemplate] }, env)
