import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { InformActionMixin } from './InformAction.js';

export interface ConfirmAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.InformAction<D>, rdfine.RdfResource<D> {
}

export function ConfirmActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ConfirmAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ConfirmActionClass extends InformActionMixin(Resource) {
  }
  return ConfirmActionClass as any
}
ConfirmActionMixin.appliesTo = schema.ConfirmAction
ConfirmActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<ConfirmAction>([InformActionMixin, ConfirmActionMixin], { types: [schema.ConfirmAction] }, env)
