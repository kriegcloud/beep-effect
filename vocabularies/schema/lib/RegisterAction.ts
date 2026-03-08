import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { InteractActionMixin } from './InteractAction.js';

export interface RegisterAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.InteractAction<D>, rdfine.RdfResource<D> {
}

export function RegisterActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<RegisterAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class RegisterActionClass extends InteractActionMixin(Resource) {
  }
  return RegisterActionClass as any
}
RegisterActionMixin.appliesTo = schema.RegisterAction
RegisterActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<RegisterAction>([InteractActionMixin, RegisterActionMixin], { types: [schema.RegisterAction] }, env)
