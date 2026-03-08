import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { IntangibleMixin } from './Intangible.js';

export interface AlignmentObject<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Intangible<D>, rdfine.RdfResource<D> {
  alignmentType: string | undefined;
  educationalFramework: string | undefined;
  targetDescription: string | undefined;
  targetName: string | undefined;
  targetUrl: RDF.NamedNode | undefined;
}

export function AlignmentObjectMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<AlignmentObject & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class AlignmentObjectClass extends IntangibleMixin(Resource) {
    @rdfine.property.literal()
    alignmentType: string | undefined;
    @rdfine.property.literal()
    educationalFramework: string | undefined;
    @rdfine.property.literal()
    targetDescription: string | undefined;
    @rdfine.property.literal()
    targetName: string | undefined;
    @rdfine.property()
    targetUrl: RDF.NamedNode | undefined;
  }
  return AlignmentObjectClass as any
}
AlignmentObjectMixin.appliesTo = schema.AlignmentObject
AlignmentObjectMixin.createFactory = (env: RdfineEnvironment) => createFactory<AlignmentObject>([IntangibleMixin, AlignmentObjectMixin], { types: [schema.AlignmentObject] }, env)
