import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { MedicalTherapyMixin } from './MedicalTherapy.js';

export interface OccupationalTherapy<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.MedicalTherapy<D>, rdfine.RdfResource<D> {
}

export function OccupationalTherapyMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<OccupationalTherapy & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class OccupationalTherapyClass extends MedicalTherapyMixin(Resource) {
  }
  return OccupationalTherapyClass as any
}
OccupationalTherapyMixin.appliesTo = schema.OccupationalTherapy
OccupationalTherapyMixin.createFactory = (env: RdfineEnvironment) => createFactory<OccupationalTherapy>([MedicalTherapyMixin, OccupationalTherapyMixin], { types: [schema.OccupationalTherapy] }, env)
