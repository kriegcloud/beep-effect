import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { IntangibleMixin } from './Intangible.js';

export interface OccupationalExperienceRequirements<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Intangible<D>, rdfine.RdfResource<D> {
  monthsOfExperience: number | undefined;
}

export function OccupationalExperienceRequirementsMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<OccupationalExperienceRequirements & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class OccupationalExperienceRequirementsClass extends IntangibleMixin(Resource) {
    @rdfine.property.literal({ type: Number })
    monthsOfExperience: number | undefined;
  }
  return OccupationalExperienceRequirementsClass as any
}
OccupationalExperienceRequirementsMixin.appliesTo = schema.OccupationalExperienceRequirements
OccupationalExperienceRequirementsMixin.createFactory = (env: RdfineEnvironment) => createFactory<OccupationalExperienceRequirements>([IntangibleMixin, OccupationalExperienceRequirementsMixin], { types: [schema.OccupationalExperienceRequirements] }, env)
