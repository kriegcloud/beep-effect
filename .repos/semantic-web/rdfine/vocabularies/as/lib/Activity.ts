import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { as } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as As from '../index.js';
import { ObjectMixin } from './Object.js';

export interface Activity<D extends RDF.DatasetCore = RDF.DatasetCore> extends As.Object<D>, rdfine.RdfResource<D> {
  actor: As.Link<D> | As.Object<D> | undefined;
  instrument: As.Link<D> | As.Object<D> | undefined;
  object: As.Link<D> | As.Object<D> | undefined;
  origin: As.Link<D> | As.Object<D> | undefined;
  result: As.Link<D> | As.Object<D> | undefined;
  target: As.Link<D> | As.Object<D> | undefined;
  verb: string | undefined;
}

export function ActivityMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Activity & RdfResourceCore> & Base {
  @rdfine.namespace(as)
  class ActivityClass extends ObjectMixin(Resource) {
    @rdfine.property.resource()
    actor: As.Link | As.Object | undefined;
    @rdfine.property.resource()
    instrument: As.Link | As.Object | undefined;
    @rdfine.property.resource()
    object: As.Link | As.Object | undefined;
    @rdfine.property.resource()
    origin: As.Link | As.Object | undefined;
    @rdfine.property.resource()
    result: As.Link | As.Object | undefined;
    @rdfine.property.resource()
    target: As.Link | As.Object | undefined;
    @rdfine.property.literal()
    verb: string | undefined;
  }
  return ActivityClass as any
}
ActivityMixin.appliesTo = as.Activity
ActivityMixin.createFactory = (env: RdfineEnvironment) => createFactory<Activity>([ObjectMixin, ActivityMixin], { types: [as.Activity] }, env)
