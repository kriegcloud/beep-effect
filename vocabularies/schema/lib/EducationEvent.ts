import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { EventMixin } from './Event.js';

export interface EducationEvent<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Event<D>, rdfine.RdfResource<D> {
  assesses: string | undefined;
  educationalLevel: string | undefined;
  educationalLevelTerm: RDF.NamedNode | undefined;
  teaches: string | undefined;
}

export function EducationEventMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<EducationEvent & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class EducationEventClass extends EventMixin(Resource) {
    @rdfine.property.literal()
    assesses: string | undefined;
    @rdfine.property.literal()
    educationalLevel: string | undefined;
    @rdfine.property({ path: schema.educationalLevel })
    educationalLevelTerm: RDF.NamedNode | undefined;
    @rdfine.property.literal()
    teaches: string | undefined;
  }
  return EducationEventClass as any
}
EducationEventMixin.appliesTo = schema.EducationEvent
EducationEventMixin.createFactory = (env: RdfineEnvironment) => createFactory<EducationEvent>([EventMixin, EducationEventMixin], { types: [schema.EducationEvent] }, env)
