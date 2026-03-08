import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { LegislationMixin } from './Legislation.js';
import { MediaObjectMixin } from './MediaObject.js';

export interface LegislationObject<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Legislation<D>, Schema.MediaObject<D>, rdfine.RdfResource<D> {
  legislationLegalValue: Schema.LegalValueLevel | undefined;
}

export function LegislationObjectMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<LegislationObject & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class LegislationObjectClass extends MediaObjectMixin(LegislationMixin(Resource)) {
    @rdfine.property()
    legislationLegalValue: Schema.LegalValueLevel | undefined;
  }
  return LegislationObjectClass as any
}
LegislationObjectMixin.appliesTo = schema.LegislationObject
LegislationObjectMixin.createFactory = (env: RdfineEnvironment) => createFactory<LegislationObject>([MediaObjectMixin, LegislationMixin, LegislationObjectMixin], { types: [schema.LegislationObject] }, env)
