import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { InteractActionMixin } from './InteractAction.js';

export interface BefriendAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.InteractAction<D>, rdfine.RdfResource<D> {
}

export function BefriendActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<BefriendAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class BefriendActionClass extends InteractActionMixin(Resource) {
  }
  return BefriendActionClass as any
}
BefriendActionMixin.appliesTo = schema.BefriendAction
BefriendActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<BefriendAction>([InteractActionMixin, BefriendActionMixin], { types: [schema.BefriendAction] }, env)
