import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { as } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as As from '../index.js';

export interface Object<D extends RDF.DatasetCore = RDF.DatasetCore> extends rdfine.RdfResource<D> {
  attachment: As.Link<D> | As.Object<D> | undefined;
  attachments: As.Link<D> | As.Object<D> | undefined;
  attributedTo: As.Link<D> | As.Object<D> | undefined;
  audience: As.Link<D> | As.Object<D> | undefined;
  author: As.Link<D> | As.Object<D> | undefined;
  bcc: As.Link<D> | As.Object<D> | undefined;
  bto: As.Link<D> | As.Object<D> | undefined;
  cc: As.Link<D> | As.Object<D> | undefined;
  content: string | undefined;
  context: As.Link<D> | As.Object<D> | undefined;
  downstreamDuplicates: string | undefined;
  duration: string | undefined;
  endTime: Date | undefined;
  generator: As.Link<D> | As.Object<D> | undefined;
  icon: As.Image<D> | As.Link<D> | undefined;
  image: As.Image<D> | As.Link<D> | undefined;
  inReplyTo: As.Link<D> | As.Object<D> | undefined;
  location: As.Link<D> | As.Object<D> | undefined;
  mediaType: string | undefined;
  name: string | undefined;
  objectType: string | undefined;
  preview: As.Link<D> | As.Object<D> | undefined;
  provider: As.Link<D> | As.Object<D> | undefined;
  published: Date | undefined;
  rating: number | undefined;
  replies: As.Collection<D> | undefined;
  startTime: Date | undefined;
  summary: string | undefined;
  tag: As.Link<D> | As.Object<D> | undefined;
  tags: As.Link<D> | As.Object<D> | undefined;
  to: As.Link<D> | As.Object<D> | undefined;
  updated: Date | undefined;
  upstreamDuplicates: string | undefined;
  url: As.Link<D> | undefined;
}

export function ObjectMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Object & RdfResourceCore> & Base {
  @rdfine.namespace(as)
  class ObjectClass extends Resource {
    @rdfine.property.resource()
    attachment: As.Link | As.Object | undefined;
    @rdfine.property.resource()
    attachments: As.Link | As.Object | undefined;
    @rdfine.property.resource()
    attributedTo: As.Link | As.Object | undefined;
    @rdfine.property.resource()
    audience: As.Link | As.Object | undefined;
    @rdfine.property.resource()
    author: As.Link | As.Object | undefined;
    @rdfine.property.resource()
    bcc: As.Link | As.Object | undefined;
    @rdfine.property.resource()
    bto: As.Link | As.Object | undefined;
    @rdfine.property.resource()
    cc: As.Link | As.Object | undefined;
    @rdfine.property.literal({ datatype: $rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#langString') })
    content: string | undefined;
    @rdfine.property.resource()
    context: As.Link | As.Object | undefined;
    @rdfine.property.literal()
    downstreamDuplicates: string | undefined;
    @rdfine.property.literal({ datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#duration') })
    duration: string | undefined;
    @rdfine.property.literal({ type: Date })
    endTime: Date | undefined;
    @rdfine.property.resource()
    generator: As.Link | As.Object | undefined;
    @rdfine.property.resource()
    icon: As.Image | As.Link | undefined;
    @rdfine.property.resource()
    image: As.Image | As.Link | undefined;
    @rdfine.property.resource()
    inReplyTo: As.Link | As.Object | undefined;
    @rdfine.property.resource()
    location: As.Link | As.Object | undefined;
    @rdfine.property.literal()
    mediaType: string | undefined;
    @rdfine.property.literal({ datatype: $rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#langString') })
    name: string | undefined;
    @rdfine.property.literal()
    objectType: string | undefined;
    @rdfine.property.resource()
    preview: As.Link | As.Object | undefined;
    @rdfine.property.resource()
    provider: As.Link | As.Object | undefined;
    @rdfine.property.literal({ type: Date })
    published: Date | undefined;
    @rdfine.property.literal({ type: Number })
    rating: number | undefined;
    @rdfine.property.resource({ implicitTypes: [as.Collection] })
    replies: As.Collection | undefined;
    @rdfine.property.literal({ type: Date })
    startTime: Date | undefined;
    @rdfine.property.literal({ datatype: $rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#langString') })
    summary: string | undefined;
    @rdfine.property.resource()
    tag: As.Link | As.Object | undefined;
    @rdfine.property.resource()
    tags: As.Link | As.Object | undefined;
    @rdfine.property.resource()
    to: As.Link | As.Object | undefined;
    @rdfine.property.literal({ type: Date })
    updated: Date | undefined;
    @rdfine.property.literal()
    upstreamDuplicates: string | undefined;
    @rdfine.property.resource({ implicitTypes: [as.Link] })
    url: As.Link | undefined;
  }
  return ObjectClass as any
}
ObjectMixin.appliesTo = as.Object
ObjectMixin.createFactory = (env: RdfineEnvironment) => createFactory<Object>([ObjectMixin], { types: [as.Object] }, env)
