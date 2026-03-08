import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { TransferActionMixin } from './TransferAction.js';

export interface ReceiveAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.TransferAction<D>, rdfine.RdfResource<D> {
  deliveryMethod: Schema.DeliveryMethod | undefined;
  sender: Schema.Audience<D> | Schema.Organization<D> | Schema.Person<D> | undefined;
}

export function ReceiveActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ReceiveAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ReceiveActionClass extends TransferActionMixin(Resource) {
    @rdfine.property()
    deliveryMethod: Schema.DeliveryMethod | undefined;
    @rdfine.property.resource()
    sender: Schema.Audience | Schema.Organization | Schema.Person | undefined;
  }
  return ReceiveActionClass as any
}
ReceiveActionMixin.appliesTo = schema.ReceiveAction
ReceiveActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<ReceiveAction>([TransferActionMixin, ReceiveActionMixin], { types: [schema.ReceiveAction] }, env)
