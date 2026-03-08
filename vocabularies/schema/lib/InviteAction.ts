import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CommunicateActionMixin } from './CommunicateAction.js';

export interface InviteAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CommunicateAction<D>, rdfine.RdfResource<D> {
  event: Schema.Event<D> | undefined;
}

export function InviteActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<InviteAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class InviteActionClass extends CommunicateActionMixin(Resource) {
    @rdfine.property.resource()
    event: Schema.Event | undefined;
  }
  return InviteActionClass as any
}
InviteActionMixin.appliesTo = schema.InviteAction
InviteActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<InviteAction>([CommunicateActionMixin, InviteActionMixin], { types: [schema.InviteAction] }, env)
