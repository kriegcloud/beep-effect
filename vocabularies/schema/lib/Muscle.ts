import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { AnatomicalStructureMixin } from './AnatomicalStructure.js';

export interface Muscle<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.AnatomicalStructure<D>, rdfine.RdfResource<D> {
  antagonist: Schema.Muscle<D> | undefined;
  bloodSupply: Schema.Vessel<D> | undefined;
  insertion: Schema.AnatomicalStructure<D> | undefined;
  muscleAction: string | undefined;
  nerve: Schema.Nerve<D> | undefined;
}

export function MuscleMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Muscle & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MuscleClass extends AnatomicalStructureMixin(Resource) {
    @rdfine.property.resource()
    antagonist: Schema.Muscle | undefined;
    @rdfine.property.resource()
    bloodSupply: Schema.Vessel | undefined;
    @rdfine.property.resource()
    insertion: Schema.AnatomicalStructure | undefined;
    @rdfine.property.literal()
    muscleAction: string | undefined;
    @rdfine.property.resource()
    nerve: Schema.Nerve | undefined;
  }
  return MuscleClass as any
}
MuscleMixin.appliesTo = schema.Muscle
MuscleMixin.createFactory = (env: RdfineEnvironment) => createFactory<Muscle>([AnatomicalStructureMixin, MuscleMixin], { types: [schema.Muscle] }, env)
