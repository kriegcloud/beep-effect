import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { EducationalOccupationalProgramMixin } from './EducationalOccupationalProgram.js';

export interface WorkBasedProgram<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.EducationalOccupationalProgram<D>, rdfine.RdfResource<D> {
  occupationalCategory: Schema.CategoryCode<D> | undefined;
  occupationalCategoryLiteral: string | undefined;
  trainingSalary: Schema.MonetaryAmountDistribution<D> | undefined;
}

export function WorkBasedProgramMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<WorkBasedProgram & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class WorkBasedProgramClass extends EducationalOccupationalProgramMixin(Resource) {
    @rdfine.property.resource()
    occupationalCategory: Schema.CategoryCode | undefined;
    @rdfine.property.literal({ path: schema.occupationalCategory })
    occupationalCategoryLiteral: string | undefined;
    @rdfine.property.resource()
    trainingSalary: Schema.MonetaryAmountDistribution | undefined;
  }
  return WorkBasedProgramClass as any
}
WorkBasedProgramMixin.appliesTo = schema.WorkBasedProgram
WorkBasedProgramMixin.createFactory = (env: RdfineEnvironment) => createFactory<WorkBasedProgram>([EducationalOccupationalProgramMixin, WorkBasedProgramMixin], { types: [schema.WorkBasedProgram] }, env)
