import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { IntangibleMixin } from './Intangible.js';

export interface MediaSubscription<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Intangible<D>, rdfine.RdfResource<D> {
  authenticator: Schema.Organization<D> | undefined;
  expectsAcceptanceOf: Schema.Offer<D> | undefined;
}

export function MediaSubscriptionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<MediaSubscription & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MediaSubscriptionClass extends IntangibleMixin(Resource) {
    @rdfine.property.resource()
    authenticator: Schema.Organization | undefined;
    @rdfine.property.resource()
    expectsAcceptanceOf: Schema.Offer | undefined;
  }
  return MediaSubscriptionClass as any
}
MediaSubscriptionMixin.appliesTo = schema.MediaSubscription
MediaSubscriptionMixin.createFactory = (env: RdfineEnvironment) => createFactory<MediaSubscription>([IntangibleMixin, MediaSubscriptionMixin], { types: [schema.MediaSubscription] }, env)
