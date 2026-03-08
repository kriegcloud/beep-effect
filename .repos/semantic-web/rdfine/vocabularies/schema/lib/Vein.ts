import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { VesselMixin } from './Vessel.js';

export interface Vein<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Vessel<D>, rdfine.RdfResource<D> {
  drainsTo: Schema.Vessel<D> | undefined;
  regionDrained: Schema.AnatomicalStructure<D> | Schema.AnatomicalSystem<D> | undefined;
  tributary: Schema.AnatomicalStructure<D> | undefined;
}

export function VeinMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Vein & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class VeinClass extends VesselMixin(Resource) {
    @rdfine.property.resource()
    drainsTo: Schema.Vessel | undefined;
    @rdfine.property.resource()
    regionDrained: Schema.AnatomicalStructure | Schema.AnatomicalSystem | undefined;
    @rdfine.property.resource()
    tributary: Schema.AnatomicalStructure | undefined;
  }
  return VeinClass as any
}
VeinMixin.appliesTo = schema.Vein
VeinMixin.createFactory = (env: RdfineEnvironment) => createFactory<Vein>([VesselMixin, VeinMixin], { types: [schema.Vein] }, env)
