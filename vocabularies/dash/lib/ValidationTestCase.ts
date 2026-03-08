import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { dash } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Dash from '../index.js';
import { TestCaseMixin } from './TestCase.js';

export interface ValidationTestCase<D extends RDF.DatasetCore = RDF.DatasetCore> extends Dash.TestCase<D>, rdfine.RdfResource<D> {
}

export function ValidationTestCaseMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ValidationTestCase & RdfResourceCore> & Base {
  @rdfine.namespace(dash)
  class ValidationTestCaseClass extends TestCaseMixin(Resource) {
  }
  return ValidationTestCaseClass as any
}
ValidationTestCaseMixin.appliesTo = dash.ValidationTestCase
ValidationTestCaseMixin.createFactory = (env: RdfineEnvironment) => createFactory<ValidationTestCase>([TestCaseMixin, ValidationTestCaseMixin], { types: [dash.ValidationTestCase] }, env)
