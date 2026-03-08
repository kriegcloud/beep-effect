import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { prov } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Prov from '../index.js';

export interface InstantaneousEvent<D extends RDF.DatasetCore = RDF.DatasetCore> extends rdfine.RdfResource<D> {
  atLocation: Prov.Location<D> | undefined;
  atTime: Date | undefined;
  hadRole: Prov.Role<D> | undefined;
}

export function InstantaneousEventMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<InstantaneousEvent & RdfResourceCore> & Base {
  @rdfine.namespace(prov)
  class InstantaneousEventClass extends Resource {
    @rdfine.property.resource({ implicitTypes: [prov.Location] })
    atLocation: Prov.Location | undefined;
    @rdfine.property.literal({ type: Date })
    atTime: Date | undefined;
    @rdfine.property.resource({ implicitTypes: [prov.Role] })
    hadRole: Prov.Role | undefined;
  }
  return InstantaneousEventClass as any
}
InstantaneousEventMixin.appliesTo = prov.InstantaneousEvent
InstantaneousEventMixin.createFactory = (env: RdfineEnvironment) => createFactory<InstantaneousEvent>([InstantaneousEventMixin], { types: [prov.InstantaneousEvent] }, env)
