import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreativeWorkMixin } from './CreativeWork.js';
import { LearningResourceMixin } from './LearningResource.js';

export interface Course<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreativeWork<D>, Schema.LearningResource<D>, rdfine.RdfResource<D> {
  courseCode: string | undefined;
  coursePrerequisites: Schema.AlignmentObject<D> | Schema.Course<D> | undefined;
  coursePrerequisitesLiteral: string | undefined;
  educationalCredentialAwarded: string | undefined;
  educationalCredentialAwardedTerm: RDF.NamedNode | undefined;
  hasCourseInstance: Schema.CourseInstance<D> | undefined;
  numberOfCredits: Schema.StructuredValue<D> | undefined;
  numberOfCreditsLiteral: number | undefined;
  occupationalCredentialAwarded: string | undefined;
  occupationalCredentialAwardedTerm: RDF.NamedNode | undefined;
}

export function CourseMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Course & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class CourseClass extends LearningResourceMixin(CreativeWorkMixin(Resource)) {
    @rdfine.property.literal()
    courseCode: string | undefined;
    @rdfine.property.resource()
    coursePrerequisites: Schema.AlignmentObject | Schema.Course | undefined;
    @rdfine.property.literal({ path: schema.coursePrerequisites })
    coursePrerequisitesLiteral: string | undefined;
    @rdfine.property.literal()
    educationalCredentialAwarded: string | undefined;
    @rdfine.property({ path: schema.educationalCredentialAwarded })
    educationalCredentialAwardedTerm: RDF.NamedNode | undefined;
    @rdfine.property.resource()
    hasCourseInstance: Schema.CourseInstance | undefined;
    @rdfine.property.resource()
    numberOfCredits: Schema.StructuredValue | undefined;
    @rdfine.property.literal({ path: schema.numberOfCredits, type: Number })
    numberOfCreditsLiteral: number | undefined;
    @rdfine.property.literal()
    occupationalCredentialAwarded: string | undefined;
    @rdfine.property({ path: schema.occupationalCredentialAwarded })
    occupationalCredentialAwardedTerm: RDF.NamedNode | undefined;
  }
  return CourseClass as any
}
CourseMixin.appliesTo = schema.Course
CourseMixin.createFactory = (env: RdfineEnvironment) => createFactory<Course>([LearningResourceMixin, CreativeWorkMixin, CourseMixin], { types: [schema.Course] }, env)
