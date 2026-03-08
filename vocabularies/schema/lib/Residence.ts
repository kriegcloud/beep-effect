import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { PlaceMixin } from './Place.js';

export interface Residence<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Place<D>, rdfine.RdfResource<D> {
  accommodationFloorPlan: Schema.FloorPlan<D> | undefined;
}

export function ResidenceMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Residence & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ResidenceClass extends PlaceMixin(Resource) {
    @rdfine.property.resource()
    accommodationFloorPlan: Schema.FloorPlan | undefined;
  }
  return ResidenceClass as any
}
ResidenceMixin.appliesTo = schema.Residence
ResidenceMixin.createFactory = (env: RdfineEnvironment) => createFactory<Residence>([PlaceMixin, ResidenceMixin], { types: [schema.Residence] }, env)
