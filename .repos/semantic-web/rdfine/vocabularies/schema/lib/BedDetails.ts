import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { IntangibleMixin } from './Intangible.js';

export interface BedDetails<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Intangible<D>, rdfine.RdfResource<D> {
  numberOfBeds: number | undefined;
  typeOfBed: string | undefined;
  typeOfBedTerm: Schema.BedType | undefined;
}

export function BedDetailsMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<BedDetails & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class BedDetailsClass extends IntangibleMixin(Resource) {
    @rdfine.property.literal({ type: Number })
    numberOfBeds: number | undefined;
    @rdfine.property.literal()
    typeOfBed: string | undefined;
    @rdfine.property({ path: schema.typeOfBed })
    typeOfBedTerm: Schema.BedType | undefined;
  }
  return BedDetailsClass as any
}
BedDetailsMixin.appliesTo = schema.BedDetails
BedDetailsMixin.createFactory = (env: RdfineEnvironment) => createFactory<BedDetails>([IntangibleMixin, BedDetailsMixin], { types: [schema.BedDetails] }, env)
