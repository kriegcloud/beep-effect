/* Stream Interfaces */
/* https://rdf.js.org/stream-spec/ */

import * as stream from "stream";
import { EventEmitter } from "events";

import { BaseQuad, Quad, Term } from './data-model';

// TODO: merge this with ResultStream upon the next major change
/**
 * A quad stream.
 * This stream is only readable, not writable.
 *
 * Events:
 * * `readable()`:           When a quad can be read from the stream, it will emit this event.
 * * `end()`:                This event fires when there will be no more quads to read.
 * * `error(error: Error)`:  This event fires if any error occurs. The `message` describes the error.
 * * `data(quad: RDF.Quad)`: This event is emitted for every quad that can be read from the stream.
 *                           The quad is the content of the data.
 * Optional events:
 * * prefix(prefix: string, iri: RDF.NamedNode): This event is emitted every time a prefix is mapped to some IRI.
 */
export interface Stream<Q extends BaseQuad = Quad> extends EventEmitter {
    /**
     * This method pulls a quad out of the internal buffer and returns it.
     * If there is no quad available, then it will return null.
     *
     * @return A quad from the internal buffer, or null if none is available.
     */
    read(): Q | null;
}

/**
 * A Source is an object that emits quads.
 *
 * It can contain quads but also generate them on the fly.
 *
 * For example, parsers and transformations which generate quads can implement the Source interface.
 */
export interface Source<Q extends BaseQuad = Quad> {
    /**
     * Returns a stream that processes all quads matching the pattern.
     *
     * @param subject   The optional subject.
     * @param predicate The optional predicate.
     * @param object    The optional object.
     * @param graph     The optional graph.
     * @return The resulting quad stream.
     */
    match(subject?: Term | null, predicate?: Term | null, object?: Term | null, graph?: Term | null): Stream<Q>;
}

/**
 * A Sink is an object that consumes data from different kinds of streams.
 *
 * It can store the content of the stream or do some further processing.
 *
 * For example parsers, serializers, transformations and stores can implement the Sink interface.
 */
export interface Sink<InputStream extends EventEmitter, OutputStream extends EventEmitter> {
    /**
     * Consumes the given stream.
     *
     * The `end` and `error` events are used like described in the Stream interface.
     * Depending on the use case, subtypes of EventEmitter or Stream are used.
     * @see Stream
     *
     * @param stream The stream that will be consumed.
     * @return The resulting event emitter.
     */
    import(stream: InputStream): OutputStream;
}

/**
 * A Store is an object that usually used to persist quads.
 *
 * The interface allows removing quads, beside read and write access.
 * The quads can be stored locally or remotely.
 *
 * Access to stores LDP or SPARQL endpoints can be implemented with a Store inteface.
 */
export interface Store<Q extends BaseQuad = Quad> extends Source<Q>, Sink<Stream<Q>, EventEmitter> {
    /**
     * Removes all streamed quads.
     *
     * The end and error events are used like described in the Stream interface.
     * @see Stream
     *
     * @param stream The stream that will be consumed.
     * @return The resulting event emitter.
     */
    remove(stream: Stream<Q>): EventEmitter;

    /**
     * All quads matching the pattern will be removed.
     *
     * The `end` and `error` events are used like described in the Stream interface.
     * @see Stream
     *
     * @param subject   The optional subject.
     * @param predicate The optional predicate.
     * @param object    The optional object.
     * @param graph     The optional graph.
     * @return The resulting event emitter.
     */
    removeMatches(subject?: Term | null, predicate?: Term | null, object?: Term | null, graph?: Term | null)
        : EventEmitter;

    /**
     * Deletes the given named graph.
     *
     * The `end` and `error` events are used like described in the Stream interface.
     * @see Stream
     *
     * @param graph The graph term or string to match.
     * @return The resulting event emitter.
     */
    deleteGraph(graph: Q['graph'] | string): EventEmitter;
}
