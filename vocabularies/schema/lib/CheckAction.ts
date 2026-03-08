import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { FindActionMixin } from './FindAction.js';

export interface CheckAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.FindAction<D>, rdfine.RdfResource<D> {
}

export function CheckActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<CheckAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class CheckActionClass extends FindActionMixin(Resource) {
  }
  return CheckActionClass as any
}
CheckActionMixin.appliesTo = schema.CheckAction
CheckActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<CheckAction>([FindActionMixin, CheckActionMixin], { types: [schema.CheckAction] }, env)
