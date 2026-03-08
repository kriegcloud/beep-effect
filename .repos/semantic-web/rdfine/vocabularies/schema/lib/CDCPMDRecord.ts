import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { StructuredValueMixin } from './StructuredValue.js';

export interface CDCPMDRecord<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.StructuredValue<D>, rdfine.RdfResource<D> {
  cvdCollectionDate: Date | string | undefined;
  cvdFacilityCounty: string | undefined;
  cvdFacilityId: string | undefined;
  cvdNumBeds: number | undefined;
  cvdNumBedsOcc: number | undefined;
  'cvdNumC19Died': number | undefined;
  'cvdNumC19HOPats': number | undefined;
  'cvdNumC19HospPats': number | undefined;
  'cvdNumC19MechVentPats': number | undefined;
  'cvdNumC19OFMechVentPats': number | undefined;
  'cvdNumC19OverflowPats': number | undefined;
  cvdNumICUBeds: number | undefined;
  cvdNumICUBedsOcc: number | undefined;
  cvdNumTotBeds: number | undefined;
  cvdNumVent: number | undefined;
  cvdNumVentUse: number | undefined;
  datePosted: Date | undefined;
}

export function CDCPMDRecordMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<CDCPMDRecord & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class CDCPMDRecordClass extends StructuredValueMixin(Resource) {
    @rdfine.property.literal()
    cvdCollectionDate: Date | string | undefined;
    @rdfine.property.literal()
    cvdFacilityCounty: string | undefined;
    @rdfine.property.literal()
    cvdFacilityId: string | undefined;
    @rdfine.property.literal({ type: Number })
    cvdNumBeds: number | undefined;
    @rdfine.property.literal({ type: Number })
    cvdNumBedsOcc: number | undefined;
    @rdfine.property.literal({ type: Number })
    'cvdNumC19Died': number | undefined;
    @rdfine.property.literal({ type: Number })
    'cvdNumC19HOPats': number | undefined;
    @rdfine.property.literal({ type: Number })
    'cvdNumC19HospPats': number | undefined;
    @rdfine.property.literal({ type: Number })
    'cvdNumC19MechVentPats': number | undefined;
    @rdfine.property.literal({ type: Number })
    'cvdNumC19OFMechVentPats': number | undefined;
    @rdfine.property.literal({ type: Number })
    'cvdNumC19OverflowPats': number | undefined;
    @rdfine.property.literal({ type: Number })
    cvdNumICUBeds: number | undefined;
    @rdfine.property.literal({ type: Number })
    cvdNumICUBedsOcc: number | undefined;
    @rdfine.property.literal({ type: Number })
    cvdNumTotBeds: number | undefined;
    @rdfine.property.literal({ type: Number })
    cvdNumVent: number | undefined;
    @rdfine.property.literal({ type: Number })
    cvdNumVentUse: number | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    datePosted: Date | undefined;
  }
  return CDCPMDRecordClass as any
}
CDCPMDRecordMixin.appliesTo = schema.CDCPMDRecord
CDCPMDRecordMixin.createFactory = (env: RdfineEnvironment) => createFactory<CDCPMDRecord>([StructuredValueMixin, CDCPMDRecordMixin], { types: [schema.CDCPMDRecord] }, env)
