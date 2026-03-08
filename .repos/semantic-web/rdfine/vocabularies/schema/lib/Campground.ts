import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CivicStructureMixin } from './CivicStructure.js';
import { LodgingBusinessMixin } from './LodgingBusiness.js';

export interface Campground<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CivicStructure<D>, Schema.LodgingBusiness<D>, rdfine.RdfResource<D> {
}

export function CampgroundMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Campground & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class CampgroundClass extends LodgingBusinessMixin(CivicStructureMixin(Resource)) {
  }
  return CampgroundClass as any
}
CampgroundMixin.appliesTo = schema.Campground
CampgroundMixin.createFactory = (env: RdfineEnvironment) => createFactory<Campground>([LodgingBusinessMixin, CivicStructureMixin, CampgroundMixin], { types: [schema.Campground] }, env)
