import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ResidenceMixin } from './Residence.js';

export interface GatedResidenceCommunity<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Residence<D>, rdfine.RdfResource<D> {
}

export function GatedResidenceCommunityMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<GatedResidenceCommunity & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class GatedResidenceCommunityClass extends ResidenceMixin(Resource) {
  }
  return GatedResidenceCommunityClass as any
}
GatedResidenceCommunityMixin.appliesTo = schema.GatedResidenceCommunity
GatedResidenceCommunityMixin.createFactory = (env: RdfineEnvironment) => createFactory<GatedResidenceCommunity>([ResidenceMixin, GatedResidenceCommunityMixin], { types: [schema.GatedResidenceCommunity] }, env)
