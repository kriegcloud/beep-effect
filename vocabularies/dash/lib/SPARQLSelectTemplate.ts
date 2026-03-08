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
import { SPARQLSelectExecutableMixin as ShaclSPARQLSelectExecutableMixin } from '@rdfine/shacl/lib/SPARQLSelectExecutable';

export interface SPARQLSelectTemplate<D extends RDF.DatasetCore = RDF.DatasetCore> extends Shacl.Parameterizable<D>, Shacl.SPARQLSelectExecutable<D>, rdfine.RdfResource<D> {
}

export function SPARQLSelectTemplateMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<SPARQLSelectTemplate & RdfResourceCore> & Base {
  @rdfine.namespace(dash)
  class SPARQLSelectTemplateClass extends ShaclSPARQLSelectExecutableMixin(ShaclParameterizableMixin(Resource)) {
  }
  return SPARQLSelectTemplateClass as any
}
SPARQLSelectTemplateMixin.appliesTo = dash.SPARQLSelectTemplate
SPARQLSelectTemplateMixin.createFactory = (env: RdfineEnvironment) => createFactory<SPARQLSelectTemplate>([ShaclSPARQLSelectExecutableMixin, ShaclParameterizableMixin, SPARQLSelectTemplateMixin], { types: [dash.SPARQLSelectTemplate] }, env)
