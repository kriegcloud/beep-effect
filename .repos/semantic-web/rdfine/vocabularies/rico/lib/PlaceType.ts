import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { TypeMixin } from './Type.js';

export interface PlaceType<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.Type<D>, rdfine.RdfResource<D> {
  isOrWasPlaceTypeOf: Rico.Place<D> | undefined;
}

export function PlaceTypeMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<PlaceType & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class PlaceTypeClass extends TypeMixin(Resource) {
    @rdfine.property.resource({ implicitTypes: [rico.Place] })
    isOrWasPlaceTypeOf: Rico.Place | undefined;
  }
  return PlaceTypeClass as any
}
PlaceTypeMixin.appliesTo = rico.PlaceType
PlaceTypeMixin.createFactory = (env: RdfineEnvironment) => createFactory<PlaceType>([TypeMixin, PlaceTypeMixin], { types: [rico.PlaceType] }, env)
