import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { dash } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Dash from '../index.js';
import { ValidationTestCaseMixin } from './ValidationTestCase.js';

export interface GraphValidationTestCase<D extends RDF.DatasetCore = RDF.DatasetCore> extends Dash.ValidationTestCase<D>, rdfine.RdfResource<D> {
  validateShapes: boolean | undefined;
}

export function GraphValidationTestCaseMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<GraphValidationTestCase & RdfResourceCore> & Base {
  @rdfine.namespace(dash)
  class GraphValidationTestCaseClass extends ValidationTestCaseMixin(Resource) {
    @rdfine.property.literal({ type: Boolean })
    validateShapes: boolean | undefined;
  }
  return GraphValidationTestCaseClass as any
}
GraphValidationTestCaseMixin.appliesTo = dash.GraphValidationTestCase
GraphValidationTestCaseMixin.createFactory = (env: RdfineEnvironment) => createFactory<GraphValidationTestCase>([ValidationTestCaseMixin, GraphValidationTestCaseMixin], { types: [dash.GraphValidationTestCase] }, env)
