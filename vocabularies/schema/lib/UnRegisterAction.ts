import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { InteractActionMixin } from './InteractAction.js';

export interface UnRegisterAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.InteractAction<D>, rdfine.RdfResource<D> {
}

export function UnRegisterActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<UnRegisterAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class UnRegisterActionClass extends InteractActionMixin(Resource) {
  }
  return UnRegisterActionClass as any
}
UnRegisterActionMixin.appliesTo = schema.UnRegisterAction
UnRegisterActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<UnRegisterAction>([InteractActionMixin, UnRegisterActionMixin], { types: [schema.UnRegisterAction] }, env)
