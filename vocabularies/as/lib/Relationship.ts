import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { as } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as As from '../index.js';
import type * as Rdf from '@rdfine/rdf';
import { ObjectMixin } from './Object.js';
import { PropertyMixin as RdfPropertyMixin } from '@rdfine/rdf/lib/Property';

export interface Relationship<D extends RDF.DatasetCore = RDF.DatasetCore> extends As.Object<D>, rdfine.RdfResource<D> {
  object: As.Link<D> | As.Object<D> | undefined;
  relationship: Rdf.Property<D> | undefined;
  subject: As.Link<D> | As.Object<D> | undefined;
}

export function RelationshipMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Relationship & RdfResourceCore> & Base {
  @rdfine.namespace(as)
  class RelationshipClass extends ObjectMixin(Resource) {
    @rdfine.property.resource()
    object: As.Link | As.Object | undefined;
    @rdfine.property.resource({ as: [RdfPropertyMixin] })
    relationship: Rdf.Property | undefined;
    @rdfine.property.resource()
    subject: As.Link | As.Object | undefined;
  }
  return RelationshipClass as any
}
RelationshipMixin.appliesTo = as.Relationship
RelationshipMixin.createFactory = (env: RdfineEnvironment) => createFactory<Relationship>([ObjectMixin, RelationshipMixin], { types: [as.Relationship] }, env)
