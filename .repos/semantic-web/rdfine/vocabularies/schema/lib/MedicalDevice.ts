import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { MedicalEntityMixin } from './MedicalEntity.js';

export interface MedicalDevice<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.MedicalEntity<D>, rdfine.RdfResource<D> {
  adverseOutcome: Schema.MedicalEntity<D> | undefined;
  contraindication: Schema.MedicalContraindication<D> | undefined;
  contraindicationLiteral: string | undefined;
  postOp: string | undefined;
  preOp: string | undefined;
  procedure: string | undefined;
  seriousAdverseOutcome: Schema.MedicalEntity<D> | undefined;
}

export function MedicalDeviceMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<MedicalDevice & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MedicalDeviceClass extends MedicalEntityMixin(Resource) {
    @rdfine.property.resource()
    adverseOutcome: Schema.MedicalEntity | undefined;
    @rdfine.property.resource()
    contraindication: Schema.MedicalContraindication | undefined;
    @rdfine.property.literal({ path: schema.contraindication })
    contraindicationLiteral: string | undefined;
    @rdfine.property.literal()
    postOp: string | undefined;
    @rdfine.property.literal()
    preOp: string | undefined;
    @rdfine.property.literal()
    procedure: string | undefined;
    @rdfine.property.resource()
    seriousAdverseOutcome: Schema.MedicalEntity | undefined;
  }
  return MedicalDeviceClass as any
}
MedicalDeviceMixin.appliesTo = schema.MedicalDevice
MedicalDeviceMixin.createFactory = (env: RdfineEnvironment) => createFactory<MedicalDevice>([MedicalEntityMixin, MedicalDeviceMixin], { types: [schema.MedicalDevice] }, env)
