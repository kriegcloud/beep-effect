import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { ActivityTypeMixin } from './ActivityType.js';
import { DemographicGroupMixin } from './DemographicGroup.js';

export interface OccupationType<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.ActivityType<D>, Rico.DemographicGroup<D>, rdfine.RdfResource<D> {
  isOrWasOccupationTypeOf: Rico.Person<D> | undefined;
}

export function OccupationTypeMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<OccupationType & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class OccupationTypeClass extends DemographicGroupMixin(ActivityTypeMixin(Resource)) {
    @rdfine.property.resource({ implicitTypes: [rico.Person] })
    isOrWasOccupationTypeOf: Rico.Person | undefined;
  }
  return OccupationTypeClass as any
}
OccupationTypeMixin.appliesTo = rico.OccupationType
OccupationTypeMixin.createFactory = (env: RdfineEnvironment) => createFactory<OccupationType>([DemographicGroupMixin, ActivityTypeMixin, OccupationTypeMixin], { types: [rico.OccupationType] }, env)
