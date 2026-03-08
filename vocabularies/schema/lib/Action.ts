import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ThingMixin } from './Thing.js';

export interface Action<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Thing<D>, rdfine.RdfResource<D> {
  actionStatus: Schema.ActionStatusType | undefined;
  agent: Schema.Organization<D> | Schema.Person<D> | undefined;
  endTime: Date | undefined;
  error: Schema.Thing<D> | undefined;
  instrument: Schema.Thing<D> | undefined;
  location: Schema.Place<D> | Schema.PostalAddress<D> | undefined;
  locationLiteral: string | undefined;
  object: Schema.Thing<D> | undefined;
  participant: Schema.Organization<D> | Schema.Person<D> | undefined;
  provider: Schema.Organization<D> | Schema.Person<D> | undefined;
  result: Schema.Thing<D> | undefined;
  startTime: Date | undefined;
  target: Schema.EntryPoint<D> | undefined;
}

export function ActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Action & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ActionClass extends ThingMixin(Resource) {
    @rdfine.property()
    actionStatus: Schema.ActionStatusType | undefined;
    @rdfine.property.resource()
    agent: Schema.Organization | Schema.Person | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#time') })
    endTime: Date | undefined;
    @rdfine.property.resource()
    error: Schema.Thing | undefined;
    @rdfine.property.resource()
    instrument: Schema.Thing | undefined;
    @rdfine.property.resource()
    location: Schema.Place | Schema.PostalAddress | undefined;
    @rdfine.property.literal({ path: schema.location })
    locationLiteral: string | undefined;
    @rdfine.property.resource()
    object: Schema.Thing | undefined;
    @rdfine.property.resource()
    participant: Schema.Organization | Schema.Person | undefined;
    @rdfine.property.resource()
    provider: Schema.Organization | Schema.Person | undefined;
    @rdfine.property.resource()
    result: Schema.Thing | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#time') })
    startTime: Date | undefined;
    @rdfine.property.resource()
    target: Schema.EntryPoint | undefined;
  }
  return ActionClass as any
}
ActionMixin.appliesTo = schema.Action
ActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<Action>([ThingMixin, ActionMixin], { types: [schema.Action] }, env)
