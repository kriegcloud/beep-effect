import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { EventMixin } from './Event.js';

export interface CourseInstance<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Event<D>, rdfine.RdfResource<D> {
  courseMode: string | undefined;
  courseModeTerm: RDF.NamedNode | undefined;
  courseWorkload: string | undefined;
  instructor: Schema.Person<D> | undefined;
}

export function CourseInstanceMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<CourseInstance & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class CourseInstanceClass extends EventMixin(Resource) {
    @rdfine.property.literal()
    courseMode: string | undefined;
    @rdfine.property({ path: schema.courseMode })
    courseModeTerm: RDF.NamedNode | undefined;
    @rdfine.property.literal()
    courseWorkload: string | undefined;
    @rdfine.property.resource()
    instructor: Schema.Person | undefined;
  }
  return CourseInstanceClass as any
}
CourseInstanceMixin.appliesTo = schema.CourseInstance
CourseInstanceMixin.createFactory = (env: RdfineEnvironment) => createFactory<CourseInstance>([EventMixin, CourseInstanceMixin], { types: [schema.CourseInstance] }, env)
