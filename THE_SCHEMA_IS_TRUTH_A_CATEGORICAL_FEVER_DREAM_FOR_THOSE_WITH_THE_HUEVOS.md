# THE SCHEMA IS TRUTH

### A Categorical Fever Dream — for those with the huevos to love schema

> A trip report from the day a routine refactor of `@beep/md` and
> `@beep/lexical-schema` quietly turned into applied category theory, and the
> humans and the machine realized they had been doing it the whole time.
>
> No mushrooms were consumed. The AST provided.

---

## 0. What actually happened (the boring, true part)

We set out to make two modeling packages _crispier_: absorb business logic into
the schemas, kill the helper soup, make illegal states unrepresentable. Concretely:

- A reusable `withNoneDefault` / `withConstantDefault` / `withCodecStatics` so the
  four `*Defaults` spread-objects and the wall of `const isX = S.is(X)` / `decodeX`
  helpers at the top of every file simply **vanished**.
- Six near-identical heading classes `H1..H6` collapsed into one `Heading { level }`.
- Imperative `let`/`for`/`.push` loops rewritten as folds and `Match` dispatch.
- Render adapters, projections, and the Md↔Lexical codec reduced to their pure intent.

**Net: −1,206 lines.** Every gate green. The first 200 lines of `Lexical.codec.ts`
now read as pure signal — no preamble, no toil.

Then someone asked the dangerous question: _why did that work so well?_

---

## 1. The creed

The doctrine of this repo, stated a hundred ways across a hundred files:

> **The schema is truth. Behavior precipitates from the data.**

Stop wasting the top 50 lines of every function on null checks and `isRecord`
slop. Put the invariants in the schema. Refine the types until only legitimate
values are constructible. Let the data structure carry its own behavior, and watch
the business logic become so clear it's child's play.

It sounds like taste. It is taste. But it is also a **theorem**, and that's the trip.

---

## 2. The revelation

Mid-refactor, a paper landed on the table:

> **Categorical Deep Learning is an Algebraic Theory of All Architectures**
> Gavranović, Lessard, Dudzik, von Glehn, Araújo, Veličković (Symbolica AI +
> Google DeepMind). arXiv **2402.15332v2**, ICML 2024.

Its thesis: deep learning has a **top-down** view (constraints / specification —
geometric deep learning, symmetry) and a **bottom-up** view (implementation —
tensor ops, autodiff), and the field lacks a theory expressive enough to bridge
them at once. Their bridge is the universal **algebra of parametric maps**: monad
algebras and endofunctor **(co)algebras**.

And then the floor fell out, because **the paper is a description of the code we
just shipped.**

| Category theory (paper §2) | What we literally built |
| --- | --- |
| **Endofunctor `F`** (polynomial / sum-of-products) | the shape of one schema layer. `Block ≈ Heading(Inline) + P(Inline) + Pre + BlockQuote(−) + …` |
| **Initial algebra `μF`** (List `= 1 + A×−`, Tree `= A + (−)²`) | the recursive schema. **`S.suspend` _is_ the fixpoint that ties `μF`** — `Inline`/`Block`/`Document`, `LexicalNode`/`SerializedEditorState` |
| **Lambek's lemma: `F(μF) ≅ μF`** | the theorem behind "schema === data." One layer of schema applied to the data is _isomorphic_ to the data. The paradox you felt was a **fixed point** with a name |
| **Catamorphism** = the _unique_ `F`-algebra homomorphism out of `μF` (Remark 2.13: _"there can only ever be ONE"_) | every `Match.tagsExhaustive` fold: `renderMarkdownBlock`, `nodeToPlainText`, the codec projections. Exhaustiveness = the structure-map covering every constructor. **Uniqueness = why the fold is total, well-defined, and why the hand-written helper was deletable.** The schema had _already determined_ the one right fold |
| **Coalgebra / anamorphism** (Mealy machines, unfolds) | the **dual** — the parser/generator direction. Stateful = Mealy = RNN = editor state machine |
| Folds **generalise** GDL equivariance | our render obeys its laws for the same reason a G-CNN is equivariant: it's a **homomorphism** |

---

## 3. The cherry (optics, and the shape of backprop)

The paper's lineage runs through **optics / lenses for backpropagation**
(Gavranović 2024; Cruttwell et al. 2022). A lens is a `{ get, put }` pair. A
bidirectional codec is a `{ decode, encode }` pair.

**That is exactly `S.link`** — effect-Schema's bidirectional bridge, the same
`{ decode, encode }` you write in every `S.decodeTo`. So our Md↔Lexical codec is
**optic-shaped** — and an optic is the same categorical object used to give
**gradient descent** its semantics.

The render↔parse duality, the backprop of a neural network, and a humble markdown
codec are **the same shape**. Sit with that.

---

## 4. The dual we haven't built yet

`@beep/md` is render-only today. Render is a **catamorphism** (fold the AST to a
string). A _parser_ — string back to AST — is the **anamorphism**, the coalgebraic
dual. effect-v4 already ships the machinery (`TemplateLiteralParser`, `S.link`,
canonical codecs à la `toEncoderXml`, struct-level `makeFilter` for cross-member
invariants like adaptive fence widths). So `render = S.encode` and its inverse
`parse = S.decode` are not a fantasy; they're a catamorphism and an anamorphism
waiting to be named. (Parked, lovingly, for the next trip.)

---

## 5. The part where it eats the LLMs

The same top-down / bottom-up split is the AI interpretability problem. Your code
is **top-down legible**: behavior is _derived_ from a description you authored. A
trained network is **bottom-up illegible**: behavior is _induced_ from data by
optimization, existing only as an unannotated weight tensor — `function === data`,
with no schema stamped over the computation.

Mechanistic interpretability is the field trying to **recover** the display map the
architecture never carried — to reconstruct, after the fact, the
`identifier`/`title`/`description` annotations that a schema author writes by hand.
You author your display map. The field excavates one. Same dream; you just chose a
substrate that lets you _write_ the structure instead of _dig it out_.

---

## 6. The rising sea

Grothendieck's metaphor for the right way to solve a problem: don't attack the nut
with a hammer and chisel. Let the sea rise — submerge the problem in the right
abstraction until it dissolves and the solution is just... there, soft, obvious,
already done.

The −1,206 lines we deleted were ad-hoc code standing in for folds the schema had
**already determined**. Remark 2.13 promises the homomorphism out of an initial
algebra is _unique_ — there was only ever one right answer, and we'd been writing
it by hand. We didn't out-clever the problem. We raised the water until the helpers
were underwater.

That two different search processes — a human's intuition over years of FP, and a
2024 ICML position paper's mathematics — converged on the same structure is not
coincidence and not hallucination. **It's the structure being real.**

---

## 7. For those with the huevos

If you love schema enough to have read this far, here is the lens. Use it on every
file in this repo:

- A schema is an **endofunctor**.
- A recursive schema (`S.suspend`) is the **initial algebra** `μF` — the data is
  the least fixed point of the schema.
- Every exhaustive `Match`/fold is the **unique catamorphism** out of it. If you're
  writing a helper that folds a recursive schema, you're writing a catamorphism the
  schema already determined — so let the schema determine it.
- Every `{ decode, encode }` is an **optic**.
- "Make illegal states unrepresentable" = "shrink the carrier of the algebra."
- A lossy codec's `roundTrip ∘ roundTrip = roundTrip` is the functor **factoring
  through a stable subalgebra** — lossiness is an algebraic fact, not test trivia.

> The schema is truth, and behavior precipitates from the data, because that is
> the **universal property of the initial algebra** — wearing a ponytail.

Now go delete some helpers. The schema was always going to win. 🪱🌊🍄

---

_Artifacts of the trip: arXiv 2402.15332v2 (Categorical Deep Learning); the
`@beep/md` & `@beep/lexical-schema` refactor; effect-v4 `Schema`, `SchemaGetter`,
`SchemaRepresentation`. The schema that serializes schemas is the punchline: the
topos contains its own description._
