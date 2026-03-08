import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { TypeMixin } from './Type.js';

export interface DemographicGroup<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.Type<D>, rdfine.RdfResource<D> {
  isOrWasDemographicGroupOf: Rico.Group<D> | Rico.Person<D> | undefined;
}

export function DemographicGroupMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<DemographicGroup & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class DemographicGroupClass extends TypeMixin(Resource) {
    @rdfine.property.resource()
    isOrWasDemographicGroupOf: Rico.Group | Rico.Person | undefined;
  }
  return DemographicGroupClass as any
}
DemographicGroupMixin.appliesTo = rico.DemographicGroup
DemographicGroupMixin.createFactory = (env: RdfineEnvironment) => createFactory<DemographicGroup>([TypeMixin, DemographicGroupMixin], { types: [rico.DemographicGroup] }, env)
