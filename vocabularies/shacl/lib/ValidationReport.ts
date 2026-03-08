import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { sh } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Sh from '../index.js';
import type * as Rdfs from '@rdfine/rdfs';
import { ResourceMixin as RdfsResourceMixin } from '@rdfine/rdfs/lib/Resource';

export interface ValidationReport<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rdfs.Resource<D>, rdfine.RdfResource<D> {
  conforms: boolean | undefined;
  result: Array<Sh.ValidationResult<D>>;
  shapesGraphWellFormed: boolean | undefined;
}

export function ValidationReportMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ValidationReport & RdfResourceCore> & Base {
  @rdfine.namespace(sh)
  class ValidationReportClass extends RdfsResourceMixin(Resource) {
    @rdfine.property.literal({ type: Boolean })
    conforms: boolean | undefined;
    @rdfine.property.resource({ values: 'array', implicitTypes: [sh.ValidationResult] })
    result!: Array<Sh.ValidationResult>;
    @rdfine.property.literal({ type: Boolean })
    shapesGraphWellFormed: boolean | undefined;
  }
  return ValidationReportClass as any
}
ValidationReportMixin.appliesTo = sh.ValidationReport
ValidationReportMixin.createFactory = (env: RdfineEnvironment) => createFactory<ValidationReport>([RdfsResourceMixin, ValidationReportMixin], { types: [sh.ValidationReport] }, env)
