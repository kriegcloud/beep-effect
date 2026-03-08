import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { VesselMixin } from './Vessel.js';

export interface Artery<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Vessel<D>, rdfine.RdfResource<D> {
  arterialBranch: Schema.AnatomicalStructure<D> | undefined;
  supplyTo: Schema.AnatomicalStructure<D> | undefined;
}

export function ArteryMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Artery & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ArteryClass extends VesselMixin(Resource) {
    @rdfine.property.resource()
    arterialBranch: Schema.AnatomicalStructure | undefined;
    @rdfine.property.resource()
    supplyTo: Schema.AnatomicalStructure | undefined;
  }
  return ArteryClass as any
}
ArteryMixin.appliesTo = schema.Artery
ArteryMixin.createFactory = (env: RdfineEnvironment) => createFactory<Artery>([VesselMixin, ArteryMixin], { types: [schema.Artery] }, env)
