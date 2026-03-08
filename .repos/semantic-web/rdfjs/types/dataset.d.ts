/* Dataset Interfaces */
/* https://rdf.js.org/dataset-spec/ */

import { Quad, BaseQuad, Term } from './data-model';
import { Stream } from './stream';

export interface DatasetCore<OutQuad extends BaseQuad = Quad, InQuad extends BaseQuad = OutQuad> {
    /**
     * A non-negative integer that specifies the number of quads in the set.
     */
    readonly size: number;

    /**
     * Adds the specified quad to the dataset.
     *
     * Existing quads, as defined in `Quad.equals`, will be ignored.
     */
    add(quad: InQuad): this;

    /**
     * Removes the specified quad from the dataset.
     */
    delete(quad: InQuad): this;

    /**
     * Determines whether a dataset includes a certain quad.
     */
    has(quad: InQuad): boolean;

    /**
     * Returns a new dataset that is comprised of all quads in the current instance matching the given arguments.
     *
     * The logic described in {@link https://rdf.js.org/dataset-spec/#quad-matching|Quad Matching} is applied for each
     * quad in this dataset to check if it should be included in the output dataset.
     *
     * This method always returns a new DatasetCore, even if that dataset contains no quads.
     *
     * Since a `DatasetCore` is an unordered set, the order of the quads within the returned sequence is arbitrary.
     *
     * @param subject   The optional exact subject to match.
     * @param predicate The optional exact predicate to match.
     * @param object    The optional exact object to match.
     * @param graph     The optional exact graph to match.
     */
    match(subject?: Term | null, predicate?: Term | null, object?: Term | null, graph?: Term | null): DatasetCore<OutQuad, InQuad>;

    [Symbol.iterator](): Iterator<OutQuad>;
}

export interface DatasetCoreFactory<OutQuad extends BaseQuad = Quad, InQuad extends BaseQuad = OutQuad, D extends DatasetCore<OutQuad, InQuad> = DatasetCore<OutQuad, InQuad>> {
    /**
     * Returns a new dataset and imports all quads, if given.
     */
    dataset(quads?: InQuad[]): D;
}

export interface Dataset<OutQuad extends BaseQuad = Quad, InQuad extends BaseQuad = OutQuad> extends DatasetCore<OutQuad, InQuad> {
    /**
     * Imports the quads into this dataset.
     *
     * This method differs from `Dataset.union` in that it adds all `quads` to the current instance, rather than
     * combining `quads` and the current instance to create a new instance.
     */
    addAll(quads: Dataset<InQuad>|InQuad[]): this;

    /**
     * Returns `true` if the current instance is a superset of the given dataset; differently put: if the given dataset
     * is a subset of, is contained in the current dataset.
     *
     * Blank Nodes will be normalized.
     */
    contains(other: Dataset<InQuad>): boolean;

    /**
     * This method removes the quads in the current instance that match the given arguments.
     *
     * The logic described in {@link https://rdf.js.org/dataset-spec/#quad-matching|Quad Matching} is applied for each
     * quad in this dataset to select the quads which will be deleted.
     *
     * @param subject   The optional exact subject to match.
     * @param predicate The optional exact predicate to match.
     * @param object    The optional exact object to match.
     * @param graph     The optional exact graph to match.
     */
    deleteMatches(subject?: Term, predicate?: Term, object?: Term, graph?: Term): this;

    /**
     * Returns a new dataset that contains all quads from the current dataset, not included in the given dataset.
     */
    difference(other: Dataset<InQuad>): Dataset<OutQuad, InQuad>;

    /**
     * Returns true if the current instance contains the same graph structure as the given dataset.
     *
     * Blank Nodes will be normalized.
     */
    equals(other: Dataset<InQuad>): boolean;

    /**
     * Universal quantification method, tests whether every quad in the dataset passes the test implemented by the
     * provided `iteratee`.
     *
     * This method immediately returns boolean `false` once a quad that does not pass the test is found.
     *
     * This method always returns boolean `true` on an empty dataset.
     *
     * This method is aligned with `Array.prototype.every()` in ECMAScript-262.
     */
    every(iteratee: (quad: OutQuad, dataset: this) => boolean): boolean;

    /**
     * Creates a new dataset with all the quads that pass the test implemented by the provided `iteratee`.
     *
     * This method is aligned with Array.prototype.filter() in ECMAScript-262.
     */
    filter(iteratee: (quad: OutQuad, dataset: this) => boolean): Dataset<OutQuad, InQuad>;

    /**
     * Executes the provided `iteratee` once on each quad in the dataset.
     *
     * This method is aligned with `Array.prototype.forEach()` in ECMAScript-262.
     */
    forEach(callback: (quad: OutQuad, dataset: this) => void): void;

    /**
     * Imports all quads from the given stream into the dataset.
     *
     * The stream events `end` and `error` are wrapped in a Promise.
     */
    import(stream: Stream<InQuad>): Promise<this>;

    /**
     * Returns a new dataset containing alls quads from the current dataset that are also included in the given dataset.
     */
    intersection(other: Dataset<InQuad>): Dataset<OutQuad, InQuad>;

    /**
     * Returns a new dataset containing all quads returned by applying `iteratee` to each quad in the current dataset.
     */
    map(iteratee: (quad: OutQuad, dataset: Dataset<OutQuad>) => OutQuad): Dataset<OutQuad, InQuad>;

    /**
     * This method calls the `iteratee` on each `quad` of the `Dataset`. The first time the `iteratee` is called, the
     * `accumulator` value is the `initialValue` or, if not given, equals to the first quad of the `Dataset`. The return
     * value of the `iteratee` is used as `accumulator` value for the next calls.
     *
     * This method returns the return value of the last `iteratee` call.
     *
     * This method is aligned with `Array.prototype.reduce()` in ECMAScript-262.
     */
    reduce<A = any>(callback: (accumulator: A, quad: OutQuad, dataset: this) => A, initialValue?: A): A;

    /**
     * Existential quantification method, tests whether some quads in the dataset pass the test implemented by the
     * provided `iteratee`.
     *
     * This method immediately returns boolean `true` once a quad that passes the test is found.
     *
     * This method is aligned with `Array.prototype.some()` in ECMAScript-262.
     */
    some(iteratee: (quad: OutQuad, dataset: this) => boolean): boolean;

    /**
     * Returns the set of quads within the dataset as a host language native sequence, for example an `Array` in
     * ECMAScript-262.
     *
     * Since a `Dataset` is an unordered set, the order of the quads within the returned sequence is arbitrary.
     */
    toArray(): OutQuad[];

    /**
     * Returns an N-Quads string representation of the dataset, preprocessed with
     * {@link https://json-ld.github.io/normalization/spec/|RDF Dataset Normalization} algorithm.
     */
    toCanonical(): string;

    /**
     * Returns a stream that contains all quads of the dataset.
     */
    toStream(): Stream<OutQuad>;

    /**
     * Returns an N-Quads string representation of the dataset.
     *
     * No prior normalization is required, therefore the results for the same quads may vary depending on the `Dataset`
     * implementation.
     */
    toString(): string;

    /**
     * Returns a new `Dataset` that is a concatenation of this dataset and the quads given as an argument.
     */
    union(quads: Dataset<InQuad>): Dataset<OutQuad, InQuad>;

    match(subject?: Term | null, predicate?: Term | null, object?: Term | null, graph?: Term | null): Dataset<OutQuad, InQuad>;
}

export interface DatasetFactory<OutQuad extends BaseQuad = Quad, InQuad extends BaseQuad = OutQuad, D extends Dataset<OutQuad, InQuad> = Dataset<OutQuad, InQuad>>
    extends DatasetCoreFactory<OutQuad, InQuad, D> {
    /**
     * Returns a new dataset and imports all quads, if given.
     */
    dataset(quads?: Dataset<InQuad>|InQuad[]): D;
}
