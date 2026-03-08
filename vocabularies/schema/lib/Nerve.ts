import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { AnatomicalStructureMixin } from './AnatomicalStructure.js';

export interface Nerve<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.AnatomicalStructure<D>, rdfine.RdfResource<D> {
  branch: Schema.AnatomicalStructure<D> | undefined;
  nerveMotor: Schema.Muscle<D> | undefined;
  sensoryUnit: Schema.AnatomicalStructure<D> | Schema.SuperficialAnatomy<D> | undefined;
  sourcedFrom: Schema.BrainStructure<D> | undefined;
}

export function NerveMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Nerve & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class NerveClass extends AnatomicalStructureMixin(Resource) {
    @rdfine.property.resource()
    branch: Schema.AnatomicalStructure | undefined;
    @rdfine.property.resource()
    nerveMotor: Schema.Muscle | undefined;
    @rdfine.property.resource()
    sensoryUnit: Schema.AnatomicalStructure | Schema.SuperficialAnatomy | undefined;
    @rdfine.property.resource()
    sourcedFrom: Schema.BrainStructure | undefined;
  }
  return NerveClass as any
}
NerveMixin.appliesTo = schema.Nerve
NerveMixin.createFactory = (env: RdfineEnvironment) => createFactory<Nerve>([AnatomicalStructureMixin, NerveMixin], { types: [schema.Nerve] }, env)
