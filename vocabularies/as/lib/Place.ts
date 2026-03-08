import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { as } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as As from '../index.js';
import { ObjectMixin } from './Object.js';

export interface Place<D extends RDF.DatasetCore = RDF.DatasetCore> extends As.Object<D>, rdfine.RdfResource<D> {
  accuracy: number | undefined;
  altitude: number | undefined;
  latitude: number | undefined;
  longitude: number | undefined;
  radius: number | undefined;
  units: 'cm' | 'feet' | 'inches' | 'km' | 'm' | 'miles' | string | undefined;
}

export function PlaceMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Place & RdfResourceCore> & Base {
  @rdfine.namespace(as)
  class PlaceClass extends ObjectMixin(Resource) {
    @rdfine.property.literal({ type: Number })
    accuracy: number | undefined;
    @rdfine.property.literal({ type: Number })
    altitude: number | undefined;
    @rdfine.property.literal({ type: Number })
    latitude: number | undefined;
    @rdfine.property.literal({ type: Number })
    longitude: number | undefined;
    @rdfine.property.literal({ type: Number })
    radius: number | undefined;
    @rdfine.property.literal()
    units: 'cm' | 'feet' | 'inches' | 'km' | 'm' | 'miles' | string | undefined;
  }
  return PlaceClass as any
}
PlaceMixin.appliesTo = as.Place
PlaceMixin.createFactory = (env: RdfineEnvironment) => createFactory<Place>([ObjectMixin, PlaceMixin], { types: [as.Place] }, env)
