import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { MedicalEntityMixin } from './MedicalEntity.js';

export interface Substance<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.MedicalEntity<D>, rdfine.RdfResource<D> {
  activeIngredient: string | undefined;
  maximumIntake: Schema.MaximumDoseSchedule<D> | undefined;
}

export function SubstanceMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Substance & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class SubstanceClass extends MedicalEntityMixin(Resource) {
    @rdfine.property.literal()
    activeIngredient: string | undefined;
    @rdfine.property.resource()
    maximumIntake: Schema.MaximumDoseSchedule | undefined;
  }
  return SubstanceClass as any
}
SubstanceMixin.appliesTo = schema.Substance
SubstanceMixin.createFactory = (env: RdfineEnvironment) => createFactory<Substance>([MedicalEntityMixin, SubstanceMixin], { types: [schema.Substance] }, env)
