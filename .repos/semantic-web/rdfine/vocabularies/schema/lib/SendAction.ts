import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { TransferActionMixin } from './TransferAction.js';

export interface SendAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.TransferAction<D>, rdfine.RdfResource<D> {
  deliveryMethod: Schema.DeliveryMethod | undefined;
  recipient: Schema.Audience<D> | Schema.ContactPoint<D> | Schema.Organization<D> | Schema.Person<D> | undefined;
}

export function SendActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<SendAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class SendActionClass extends TransferActionMixin(Resource) {
    @rdfine.property()
    deliveryMethod: Schema.DeliveryMethod | undefined;
    @rdfine.property.resource()
    recipient: Schema.Audience | Schema.ContactPoint | Schema.Organization | Schema.Person | undefined;
  }
  return SendActionClass as any
}
SendActionMixin.appliesTo = schema.SendAction
SendActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<SendAction>([TransferActionMixin, SendActionMixin], { types: [schema.SendAction] }, env)
