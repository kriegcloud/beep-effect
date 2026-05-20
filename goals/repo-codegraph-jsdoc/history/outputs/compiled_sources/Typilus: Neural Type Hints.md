# Typilus: Neural Type Hints

Source: https://arxiv.org/pdf/2004.10657

0
2
0
2

r
p
A
6

]
L
P
.
s
c
[

1
v
7
5
6
0
1
.
4
0
0
2
:
v
i
X
r
a

Miltiadis Allamanis
miallama@micosoft.com
Microsoft Research
Cambridge, United Kingdom

Soline Ducousso∗
soline.ducousso@ensta-paristech.fr
École Nationale Supérieure de Techniques Avancées
Paris, France

Abstract
Type inference over partial contexts in dynamically typed
languages is challenging. In this work, we present a graph
neural network model that predicts types by probabilisti-
cally reasoning over a program’s structure, names, and pat-
terns. The network uses deep similarity learning to learn a
TypeSpace— a continuous relaxation of the discrete space of
types — and how to embed the type properties of a symbol
(i.e. identifier) into it. Importantly, our model can employ
one-shot learning to predict an open vocabulary of types, in-
cluding rare and user-defined ones. We realise our approach
in Typilus for Python that combines the TypeSpace with an
optional type checker. We show that Typilus accurately pre-
dicts types. Typilus confidently predicts types for 70% of
all annotatable symbols; when it predicts a type, that type
optionally type checks 95% of the time. Typilus can also find
incorrect type annotations; two important and popular open
source libraries, fairseq and allennlp, accepted our pull
requests that fixed the annotation errors Typilus discovered.

CCS Concepts: • Computing methodologies → Machine
learning; • Software and its engineering → Language
features.

Keywords: type inference, structured learning, deep learn-
ing, graph neural networks, meta-learning

1 Introduction
Automatic reasoning over partial contexts is critical, since
software development necessarily involves moving code
from an incomplete state — relative to the specification — to
a complete state. It facilitates scaling analyses to large, in-
dustrial code bases. For example, it allows quickly building a
file-specific call graph when editing a single file instead of re-
quiring a project-level call graph. Traditional static analyses
tackle partial contexts via abstraction. They achieve sound-
ness (or soundiness [43]) at the cost of imprecision. As the
target language becomes more dynamic [54] (e.g. reflection
or eval), analysis precision tends to deteriorate.

∗Work done during an internship at UCL.

Earl T. Barr
e.barr@ucl.ac.uk
University College London
London, United Kingdom

Zheng Gao
z.gao.12@ucl.ac.uk
University College London
London, United Kingdom

Optional type systems [14] feature omittable type anno-
tations that have no runtime effects; they permit reasoning
about the types over a partial program that does not contain
enough information to be fully typed. In the limit, optional
typing reaches traditional static typing when all types are
annotated or can be inferred. Recent years have witnessed
growing support of optional typing in dynamically typed
languages. Notable examples include flow for JavaScript and
mypy for Python. This trend indicates that the dynamic typ-
ing community increasingly acknowledges the benefits of
types, such as early bug detection [26], better performance,
and accurate code completion and navigation.

Optional typing, however, comes with a cost. Developers
who wish to use it need to migrate an unannotated codebase
to an (at least partially) annotated one. When the codebase
is large, manually adding type annotations is a monumental
effort. Type inference can automatically and statically de-
termine the most general type of a program expression, but
it offers little help here, because it cannot soundly deduce
the types of many expressions in a dynamic language, like
JavaScript or Python.

In this work, we present Typilus, a machine learning ap-
proach that suggests type predictions to a developer. De-
velopers introduce a rich set of patterns into source code,
including the natural language elements, such as variable
names, and structural idioms in a program’s control and data
flows. Typilus exploits these noisy and uncertain data, which
traditional analysis ignores or conservatively abstracts, to
probabilistically suggest types. Any suggestions the devel-
oper accepts increase the number of typed terms in a pro-
gram and enhance the reasoning power of optional typing.
Our goal is to help developers move to fully typed programs
and return to the safe haven of the guarantees that tradi-
tional static typing affords. Our work rests on the idea that
verifying a type suggestion helps a developer more quickly
find the correct type than coming up with the correct type
from scratch.

Research has shown that machine learning methods can
effectively predict types [31, 51]. This pioneering work, how-
ever, treats this task as a classification problem and, therefore,
have a fixed set of categories, or types in our setting. In other

words, they target a closed type vocabulary. However, the
types in our corpus generally follow a fat-tailed Zipfian dis-
tribution and 32% of them are rare (Sec. 6). Type prediction
for closed type vocabularies does not handle rare types and,
thus, faces a performance ceiling.

Typilus advances the state of the art by formulating prob-
abilistic type inference as a metric-based meta-learning prob-
lem, instead of a classification problem. Meta-learning (or
“learning-to-learn”) allows trained machine learning models
to adapt to new settings with just a single example and
no additional training. Metric-based meta-learning mod-
els learn to embed a (possibly) discrete input into a real
D-dimensional latent space preserving its properties. Specif-
ically, Typilus learns to embed symbols (identifiers like vari-
able names, parameter names, function names etc.) capturing
their type properties. We call these embeddings type embed-
dings. Typilus strives to preserve the type equality relations
among type embeddings and establish, through training, a
TypeSpace that keeps the type embeddings of symbols that
share a type close and those of different types apart. Typilus
predicts types for identifiers that lack type annotations be-
cause they cannot be inferred and have not been provided,
so it does not explicitly embed type annotations.

In contrast to classification-based methods, Typilus can
efficiently predict types unseen during training. Once we
have a trained model, we can use it to compute rs , the type
embedding of the symbol s of a new type τ in the TypeSpace.
Typilus maintains a type map from representative embed-
dings to their type. This type map implicitly defines “typed”
regions in the TypeSpace. To allow Typilus to predict τ ,
we update this type map with rs (cid:55)→ τ . Now Typilus can
predict type τ for symbols whose embeddings fall into a
neighbourhood around rs in its TypeSpace. Thus, Typilus
can support an open type vocabulary, without retraining. To
bootstrap the process, we seed the TypeSpace and the type
map with the type embeddings of symbols with known types.
A type checker removes false positives. Our results show
that Typilus makes a substantial advance, improving the
state-of-the-art from 4.1% to 22.4%, when predicting an exact
match for rare types.

We realise Typilus in a graph neural network (GNN). Most
existing neural approaches treat programs as sequences of
tokens, missing the opportunity to model and learn from
the complex dependencies among the tokens in a program.
Our experiment reveals that using a graph-based model, in-
stead of a sequence-based model, produces 7.6% more exact
matches for common types (Table 2). We implement Typilus
to predict types for variables, parameters, and function re-
turns in a Python program. For a given symbol, two types
are neutral under an optional type system when replacing
one with the other does not yield a type error. We show
that, given an appropriate confidence threshold that allows
each model to predict types for 70% of the symbols in our
corpus, Typilus’ predictions achieve type neutrality with

Allamanis, et al.

the human-provided ones 95% of the time, compared to 60%
for the baseline model.

Human-written optional type annotations can fail to trig-
ger a type error even when they are incorrect. Typilus can
find these errors. In PyTorch/fairseq, a popular sequence-
to-sequence modelling toolkit, Typilus predicted int when
the existing annotation was float; in allenai/allennlp,
a popular natural language processing library, Typilus pre-
dicted Dict[str,ADT] when the existing annotation was
ADT. We submitted two pull requests for these errors; both
were accepted (Sec. 7). Typilus and the evaluation artefacts
can be found at https://github.com/typilus/typilus.

Contributions.

1. We adapt a graph-based deep neural network to the
type prediction problem by considering source code
syntax and semantics;

2. We use a novel training loss — based on deep similar-
ity learning — to train a model that embeds the type
properties of symbols into a TypeSpace and is adaptive:
without retraining, it can accurately predict types that
were rare, or even unseen, during training;

3. We realise our approach in Typilus for Python and
demonstrate its effectiveness in predicting types in an
extensive evaluation.

2 Overview
In this work, we aim to predict types for symbols in an
optionally typed language. This task takes two forms, open
or closed, depending on whether one aims to predict from
a set of types that is finite and closed or unbounded and
open. Early work for this task has targeted a closed type
vocabulary; DeepTyper considers 11.8k types found in a
large TypeScript corpus where JSNice considers a smaller
set [31, 51]. However, most real-life code introduces new,
domain-specific types. In our data (Sec. 6), only 158 types
(out of 49k) appear more than 100 times, following a Zipfian
distribution, similar to other code artefacts [6]. Nevertheless,
given the fat-tailed distribution of types, about 32% of the
type annotations are rare in our corpus. Thus, predicting
from a closed type vocabulary faces a performance ceiling.
We present Typilus, a method targeting an open type vo-
cabulary that can predict types unseen during training. Sec. 6
shows that many of these predictions are useful because an
type checker can efficiently verify them; when they are not
type checkable, we hope they at least speed a developer’s
selection of the correct type. Fig. 1 depicts the high-level
architecture of Typilus.

Learning a Type Space (Fig. 1, left, blue) Central to
Typilus is its TypeSpace, a continuous projection of the type
context and properties of code elements into a real multidi-
mensional space. We do not explicitly design this space, but
instead learn it from data. To achieve this, we train a neural
network e(·) that takes a code snippet S and learns to map the

Typilus: Neural Type Hints

Figure 1. Overview of Typilus. Training (left, blue): A graph neural network (GNN) learns to map variables, parameters, and
function returns to a type embedding in an RD type space using deep similarity learning. Inference (right, red): Using the type
map, Typilus accepts unannotated code, computes type embeddings with the trained GNN and finds the concrete k nearest
neighbours types as the candidate predictions. Finally, a type checker checks all predictions and filters incorrect ones.

variables, parameters and functions of S into the TypeSpace.
For each symbol s ∈ S, e(S)[s] = rs ∈ RD . Typilus uses deep
similarity learning, which needs sets of positive and nega-
tive examples for training. To define these sets, we leverage
existing type annotations in Python programs: like str and
Foo in Fig. 1. To capture both semantic and lexical properties
of code, Typilus employs a graph neural network (GNN).
The GNN learns and integrates information from multiple
sources, including identifiers, syntactic constraints, syntactic
patterns, and semantic properties like control and data flow.
Predicting Types (Fig. 1, right, red) Typilus’s e alone
cannot directly predict a type, since it maps symbols to their
type embeddings in RD . Instead, its output, the TypeSpace,
acts as an intermediate representation between a program’s
symbols and their concrete types. To make type predictions,
Typilus builds τmap to map a symbol’s type embedding to
its type. This implicitly maps each type to a set of type em-
beddings. First, given a corpus of code — not necessarily
the training corpus — we map all known type annotations
τi into points in the TypeSpace. In Fig. 1, int is an exam-
ple τi . Given the τmap and a query symbol sq (the black
square in Fig. 1), whose type properties e embeds at rsq (i.e.
e(S)[sq] = rsq ), Typilus returns a probability distribution
over candidate type predictions in the neighbour around
rsq in the TypeSpace. Typilus uses k nearest neighbours to
define this neighbourhood. Finally, a type checker checks the
highest-probability type predictions and, if no type errors
are found, Typilus suggests them to the developer.

Key Aspects. The key aspects of Typilus are

• A graph-based deep neural network that learns from
the rich set of patterns and can predict types without
the need to have a fully resolved type environment.
• The ability to embed the type properties of any symbol,
including symbols whose types were unseen during

training, thereby tackling the problem of type predic-
tion for an open vocabulary.

• A type checking module that filters false positive type
predictions, returning only type-correct predictions.

3 Background
Machine learning has been recently used for predicting type
annotations in dynamic languages. Although traditional type
inference is a well-studied problem, commonly it cannot han-
dle uncertainty as soundness is an important requirement.
In contrast, probabilistic machine learning-based type in-
ference employs probabilistic reasoning to assign types to
a program. For example, a free (untyped) variable named
counter will never be assigned a type by traditional type
inference, whereas a probabilistic method may infer that
given the name of the variable an int type is highly likely.
Raychev et al. [51] first introduced probabilistic type in-
ference using statistical learning method for JavaScript code
in their tool JSNice. JSNice converts a JavaScript file into a
graph representation encoding some relationships that are
relevant to type inference, such as relations among expres-
sions and aliasing. Then a conditional random field (CRF)
learns to predict the type of a variable. Thanks to the CRF,
JSNice captures constraints that can be statically inferred.
Like all good pioneering work, JSNice poses new research
challenges. JSNice targets JavaScript and a closed vocabulary
of types, so predicting types for other languages and an open
type vocabulary are two key challenges it poses. Typilus
tackles these challenges. Typilus targets Python. To handle
an open vocabulary, Typilus exploits subtokens, while JS-
Nice considers tokens atomic. Typilus replaces the CRF with
a graph neural network and constructs a TypeSpace.

Later, Hellendoorn et al. [31] employed deep learning to
solve this problem. The authors presented DeepTyper, a deep
learning model that represents the source code as a sequence

.pyCode with Type AnnotationsType  Spaceℝ!.pyPartially Annotated CodeType PredictionsTYPILUSLossstrstrGNNintint𝑘-Nearest NeighboursType CheckerGNNFooTrainingInferenceof tokens and uses a sequence-level model (a biLSTM) to
predict the types within the code. In contrast to Raychev
et al. [51], this model does not explicitly extract or repre-
sent the relationships among variables, but tries to learn
these relationships directly from the token sequence. Deep-
Typer performs well and can predict the types with good
precision. Interestingly, Hellendoorn et al. [31] showed that
combining DeepTyper with JSNice improves the overall per-
formance, which suggests that the token-level patterns and
the extracted relationships of Raychev et al. [51] are comple-
mentary. Our work incorporates these two ideas in a Graph
Neural Network. Similar to Raychev et al. [51], DeepTyper
cannot predict rare or previously unseen types and its im-
plementation does not subtokenise identifiers.

Malik et al. [46] learn to predict types for JavaScript code
just from the documentation comments. They find that (good)
documentation comments (e.g. docstrings in Python) contain
valuable information about types. Again, this is an “uncon-
ventional” channel of information that traditional type in-
ference methods would discard, but a probabilistic machine
learning-based method can exploit. Like other prior work,
Malik et al. [46]’s approach suffers from the rare type prob-
lem. It is orthogonal to Typilus, since Typilus could exploit
such sources of information in the future.

Within the broader area — not directly relevant to this
work — research has addressed other problems that combine
machine learning and types. Dash et al. [21] showed that, by
exploiting the natural language within the names of variables
and functions, along with static interprocedural data flow
information, existing typed variables (such as strings) can
be nominally refined. For example, they automatically refine
string variables into some that represent passwords, some
that represents file system paths, etc. Similarly, Kate et al.
[37] use probabilistic inference to predict physical units in
scientific code. While they use probabilistic reasoning to
perform this task, no learning is employed.

4 The Deep Learning Model
We build our type space model using deep learning, a versa-
tile family of learnable function approximator methods that
is widely used for pattern recognition in computer vision
and natural language processing [28]. Deep learning models
have three basic ingredients: (a) a deep learning architec-
ture tailored for learning task data (Sec. 4.3); (b) a way to
transform that data into a format that the neural network ar-
chitecture can consume (Sec. 5); and (c) an objective function
for training the neural network (Sec. 4.1). Here, we detail a
deep learning model that solves the type prediction task for
an open type vocabulary, starting from (c) — our objective
function. By appropriately selecting our objective function
we are able to learn the type space, which is the central
novelty of Typilus.

Allamanis, et al.

4.1 Learning a Type Space

Commonly, neural networks represent their elements as “dis-
tributed vector representations”, which distribute the “mean-
ing” across vector components. A neural network may com-
pute these vectors. For the purpose of explanation, assume
a neural network e(·), parameterised by some learnable pa-
rameters θ , accepts as input some representation of a code
snippet S and returns a vector representation rs ∈ RD for
each symbol s ∈ S. We call this vector representation a type
embedding; it captures the relevant type properties of a sym-
bol in S. Below, we treat e as a map and write e(S)[s] = rs to
denote s’s type embedding under e in S. The type prediction
problem is then to use type embeddings to predict the type
of a symbol. In Sec. 4.3, we realise e(·) as a GNN.

A common choice is to use type embeddings for classifi-
cation. For this purpose, we need a finite set of well-known
types T = {τi }. For each of these types, we must learn a
“prototype” vector representation ˜rτi and a scalar bias term
bτi . Then, given a ground truth type τ for a symbol s with
computed type embedding rs = e(s) we seek to maximise
the probability P(s : τ ), i.e. minimise the classification loss

LClass (rs , τ ) = − log

exp

(cid:17)

+ bτ

(cid:16)
rs ˜rT
τ
(cid:16)
rs ˜rT
+ bτj
τj
(cid:32)(cid:32)(cid:32)(cid:32)(cid:32)(cid:32)(cid:32)(cid:32)(cid:32)(cid:32)(cid:32)(cid:32)(cid:32)(cid:32)(cid:32)(cid:32)(cid:32)(cid:32)(cid:32)(cid:32)(cid:32)(cid:32)(cid:32)(cid:32)(cid:32)(cid:32)(cid:32)(cid:32)(cid:32)(cid:32)(cid:32)(cid:32)

(cid:125)

(cid:205)
(cid:32)(cid:32)(cid:32)(cid:32)(cid:32)(cid:32)(cid:32)(cid:32)(cid:32)(cid:32)(cid:32)(cid:32)(cid:32)(cid:32)(cid:32)(cid:32)(cid:32)(cid:32)(cid:32)(cid:32)(cid:32)(cid:32)(cid:32)(cid:32)(cid:32)(cid:32)(cid:32)(cid:32)(cid:32)(cid:32)(cid:32)(cid:32)

τj ∈ T exp
(cid:123)(cid:122)
− log P (s:τ )

(cid:124)

.

(cid:17)

(1)

As the reader can observe, Eq. 1 partitions the space of the
type embeddings into the set of well-known types via the
prototype vector representations ˜rτi . This limits the model
to a closed vocabulary setting, where it can predict only over
a fixed set of types T . Treating type suggestion as classifi-
cation misses the opportunity for the model to learn about
types that are rare or previously unseen, e.g. in a new project.
In this work, we focus on “open vocabulary” methods, i.e.
methods that allow us to arbitrarily expand the set of candi-
date type that we can predict at test-time. We achieve this
through similarity learning, detailed next.

Deep Similarity Learning. We treat the creation of a
type space as a weakly-supervised similarity learning prob-
lem [19, 29]. This process projects the discrete (and possibly
infinite) set of types into a multidimensional real space. Un-
like classification, this process does not explicitly partition
the space in a small set. Instead, e(·) learns to represent an
open vocabulary of types, since it suffices to map any new,
previously unseen, symbol (and its type) into some point in
the real space. Predicting types for these symbols becomes a
similarity computation between the queried symbol’s type
embedding and nearby embeddings in the type space; it does
not reduce to determining into which partition a symbol
maps, as in classification.

To achieve this, we adapt a deep similarity learning method
called triplet loss [16]. The standard formulation of triplet

Typilus: Neural Type Hints

+
max

d

+ m

d −
min

− m

Figure 2. Graphic depiction of the two terms of the similarity
objective in Eq. 3. Left: all dissimilar points (red squares), i.e.
P− within distance d +
+ m of the query point are pushed
away. Right: all similar points (black circles) that are further
than d −
min −m from the query point, i.e. P+, are pulled towards
it. The margin distance m is shaded.

max

loss accepts a type embedding rs of a symbol s, an embedding
rs + of a symbol s+ of the same type as s and an embedding
rs − of a symbol s− of a different type than s. Then, given a
positive scalar margin m, the triplet loss is

(2)

i than to the embedding of s−

LTriplet(rs , rs −, rs +) = h (||rs − rs − || − ||rs − rs + || , m) ,
where h(x, m) = max(x + m, 0) is the hinge loss. This objec-
tive aims to make si ’s embedding closer to the embedding
of the “similar” example s+
i , up
to the margin m. In this work, we use the L1 (Manhattan)
distance, but other distances can be used. Learning over a
similarity loss can be thought of as loosely analogous to a
physics simulation where each point exerts an attraction
force on similar points (proportional to the distance) and
a repelling force (inversely proportional to the distance) to
dissimilar points. Triplet loss has been used for many appli-
cations such as the computer vision problem of recognising
if two hand-written signatures were signed by the same per-
son and for face recognition [16]. As Eq. 2 shows, triplet loss
merely requires that we define the pairwise (dis)similarity
relationship among any two samples, but does not require
any concrete labels.

Typilus Loss. Typilus adapts triplet loss (Eq. 2) for the
neural type representations to facilitate learning and com-
bines it with a classification-like loss. Fig. 2 depicts the sim-
ilarity loss conceptually. Typilus’ similarity loss considers
more than three samples each time. Given a symbol s and
a set of similar S +
i (s) symbols
drawn randomly from the dataset, let
(cid:12)
(cid:12)
(cid:12)
(cid:12)
(cid:12)rs − rs +
(cid:12)

i (s) and a set of dissimilar S −

(cid:12)
(cid:12)
(cid:12)rs − rs −
(cid:12)

d −
min(s) = min
i ∈S −
s −
i (s)

+
max(s) = max
i ∈S +
s +
i (s)

(cid:12)
(cid:12)
(cid:12)
(cid:12)
(cid:12) ,
(cid:12)

(cid:12)
(cid:12)
(cid:12) ,
(cid:12)

d

i

i

i.e. the maximum (resp. minimum) distance among identi-
cally (resp. differently) typed symbols. Then, let
(cid:12)
(cid:12)
(cid:111)
(cid:12)
(cid:12)
:
(cid:12)rs +
(cid:12)
(cid:12)
: (cid:12)
(cid:12)rs −
(cid:12)

P+(s) = (cid:110)
+
x
i
P−(s) = (cid:8)x −
i

min(s) − m
max(s) + m(cid:9)
+

(cid:12)
(cid:12)
(cid:12) > d −
(cid:12)
(cid:12)
(cid:12)
(cid:12)
(cid:12)
(cid:12) < d
(cid:12)

− rs

− rs

,

i

i

i.e. the sets of same and differently typed symbols that are
within a margin of d +
max and d −
min. Then, we define the simi-
larity loss over the type space as
(cid:12)
(cid:12)
(cid:12)
(cid:12)
(cid:12)
(cid:12)

− rs

(cid:12)
(cid:12)
(cid:12)
(cid:12)

(cid:213)

(cid:12)
(cid:12)
(cid:12)

(cid:12)
(cid:12)
− rs
(cid:12)rs −
(cid:12)
|P−(s)|

i

,

(3)

−

s −
i ∈P−(s)

LSpace(s) = (cid:213)
s +
i ∈P+(s)

(cid:12)
(cid:12)
(cid:12)rs +
i
|P+(s)|

which generalises Eq. 2 to multiple symbols. Because we can
efficiently batch the above equation in a GPU, it provides an
alternative to Eq. 2 that converges faster, by reducing the
sparsity of the objective. In all our experiments, we set S +(s)
(resp. S −(s)) to the set of symbols in the minibatch that have
the same (resp. different) type as s.

LClass and LSpace have different advantages and disadvan-
tages. LClass’s prototype embeddings ˜rτi provide a central
point of reference during learning, but cannot be learnt for
rare or previously unseen types. LSpace, in contrast, explic-
itly handles pairwise relationships even among rare types
albeit at the cost of potentially reducing accuracy across all
types: due to the sparsity of the pairwise relationships, the
TypeSpace may map the same type to different regions. To
construct more robust type embeddings, Typilus combines
both losses in its learning objective:

LTypilus(s, τ ) = LSpace(s) + λLClass (W rs , Er (τ )) ,
(4)
where λ = 1 in all our experiments, W rs is the type embed-
ding of s in a linear projection of Typilus’s TypeSpace, and
Er(·) erases all type parameters.

Typilus employs type erasure in Eq. 4 on parametric types
to combat sparsity. When querying Er(τ ), applying LClass di-
rectly to rs would risk collapsing generic types into their base
parametric type, mapping them in same location. W coun-
teracts this tendency; it is a learned matrix (linear layer) that
can be thought as a function that projects the TypeSpace into
a new latent space with no type parameters. This parameter-
erased space provides coarse information about type rela-
tions among parametric types by imposing a linear relation-
ship between their type embeddings and their base paramet-
ric type; W learns, for instance, a linear relationship from
List[int] and List[str] to List.

At inference time, Typilus discards the prototype embed-
dings ˜rτi and W . Typilus uses these components of LClass
to learn the TypeSpace, which retains them implicitly in its
structure. Table 2 in Sec. 6 presents and compares the per-
formance of all the loss functions discussed here.

4.2 Adaptive Type Prediction
Once trained, e(·) has implicitly learned a type space. How-
ever, the type space does not explicitly contain types, so,
for a set of symbols whose types we know, we construct a
map from their type embeddings to their types. Formally,
for every symbol s with known type τ , we use the trained
e(·) and add type markers to the type space, creating a map
τmap[e(S)[s]] (cid:55)→ τ .

To predict a type for a query symbol sq in the code snip-
= e(S)[sq],
pet S, Typilus computes sq’s type embedding rsq
then finds the k nearest neighbours (kNN) over τmap’s keys,
which are type embeddings. Given the k nearest neighbour
markers τi with a distance of di from the query type embed-
ding rsq , the probability of sq having a type τ ′ is

P(sq : τ ′) = 1
Z

(cid:213)

i

I (τi = τ ′) d

−p
i

(5)

where I is the indicator function and Z a normalising con-
stant. p−1 acts as a temperature with p → 0 yielding a uni-
form distribution over the k nearest neighbours and p → ∞
yielding the k = 1 nearest neighbour algorithm.

Though e(·) is fixed, τmap is adaptive: it can accept bind-
ings from type embeddings to actual types. Notably, it can
accept bindings for previously unseen symbols, since e(·) can
compute an embedding for a previously unseen s. Typilus’
use of τmap, therefore, allows it to adapt and learn to predict
new types without retraining e. A developer or a type infer-
ence engine can add them to τmap before test time. Typilus
handles an open type vocabulary thanks to the adaptability
that τmap affords.

Practical Concerns. The kNN algorithm is costly if naïvely

implemented. Thankfully, there is a rich literature for spatial
indexes that reduce the time complexity of the kNN from
linear to constant. We create a spatial index of the type space
and the relevant markers. Typilus then efficiently performs
nearest-neighbour queries by employing the spatial index.
In this work, we employ Annoy [56] with L1 distance.

4.3 Graph Neural Network Architectures
So far, we have assumed that some neural network e(·) can
compute a type embedding rs , but we have not defined this
network yet. A large set of options is available; here, we
focus on graph-based models. In Sec. 6, we consider also
token- and AST-level models as baselines.

Graph Neural Networks [39, 42] (GNN) are a form of neu-
ral network that operates over graph structures. The goal of a
GNN is to recognise patterns in graph data, based both on the
data within the nodes and the inter-connectivity. There are
many GNN variants. Here, we describe the broad category of
message-passing neural networks [27]. We then discuss the
specific design of the GNN that we employ in this work. Note
that GNNs should not be confused with Bayesian networks
or factor graphs, which are methods commonly used for
representing probability distributions and energy functions.
Let a graph G = (N , E) where N = {ni } is a set of nodes
k
→ nj where k
and E is a set of directed edges of the form ni
is the edge label. The nodes and edges of the graph are an
input to a GNN. In neural message-passing GNNs, each node
ni is endowed with vector representation ht
ni indexed over a

timestep t. All node states are updated as

Allamanis, et al.

(cid:17)(cid:170)
(cid:174)
(cid:174)
(cid:172)

(cid:169)
ht
(cid:173)
ni
(cid:173)
(cid:171)

ht +1
ni

= ft

(cid:202)

,

(cid:16)
mt (ht
ni

, k, ht
nj

)

,

(6)

∀nj :ni

k
→nj
where mt (·) is a function that computes a “message” (com-
monly a vector) based on the edge label k, (cid:201) is a commuta-
tive (message) aggregation operator that summarises all the
messages that ni receives from its direct neighbours, and ft
is an update function that updates the state of node ni . We
use parallel edges with different labels between two nodes
that share multiple properties. The ft , (cid:201) and qt functions
contain all trainable graph neural network parameters. Mul-
tiple options are possible for ft , (cid:201) and qt s. The initial state
of each node h0
ni set from node-level information. Eq. 6 up-
dates all node states T times recursively. At the end of this
process, each hT
ni represents information about the node and
how it “belongs” within the context of the graph.

, k, ht
nj

In this work, we use the gated graph neural network
(GGNN) variant [42] that has been widely used in machine
learning models of source code. Although other GNN archi-
tectures have been tested, we do not test them here. GGNNs
use a single GRU cell [18] for all ft , i.e. ft = Gru(·, ·), (cid:201) is
implemented as a summation operator and mt (ht
) =
ni
Ekht
nj , where Ek is a learned matrix i.e. mt is a linear layer
that does not depend on t or ht
ni .
Overall, we follow the architecture and hyperparameters
used in Allamanis et al. [5], Brockschmidt et al. [15]. e.g. set
T = 8. In contrast to previous work, we use max pooling
(elementwise maximum) as the message aggregation oper-
ator (cid:201). In early experiments, we found that max pooling
performs somewhat better and is conceptually better fitted
to our setting since max pooling can be seen as a meet-like
operator over a lattice defined in RN . Similar to previous
work, h0
ni is defined as the average of the (learned) subtoken
representations of each node, i.e.

h0
ni

=

1
|SubTok(ni )|

(cid:213)

es ,

s ∈SubTok(ni )

(7)

where SubTok(·) deterministically splits the identifier infor-
mation of ni into subtokens on CamelCase and under_scores
and es is an embedding of the subtoken s, which is learned
along with the rest of the model parameters.

5 Typilus: A Python Implementation
We implement Typilus for Python, a popular dynamically
typed language. We first introduce Python’s type hints (i.e.
annotations), then describe how we convert Python code
into a graph format. Python was originally designed with-
out a type annotation syntax. But starting from version 3.5,
it has gradually introduced language features that support
(optional) type annotations (PEP 484 and PEP 526). Devel-
opers can now optionally annotate variable assignments,

Typilus: Neural Type Hints

Figure 3. Sample graph for foo=get_foo(i, i+1) showing
different node categories and edge labels.

function arguments, and returns. These type annotations are
not checked by the language (i.e. Python remains dynami-
cally typed), but by a standalone type checker. The built-in
typing module provides some basic types, such as List,
and utilities, like type aliasing. We refer the reader to the
documentation [25] for more information.

5.1 Python Files to Graphs

Representing code in graphs involves multiple design deci-
sions. Inspired by previous work [5, 9, 15, 20, 51], our graph
encodes the tokens, syntax tree, data flow, and symbol table
of each Python program and can be thought as a form of
feature extraction. As such, the graph construction is nei-
ther unique nor “optimal”; it encapsulates design decisions
and trade-offs. We adopt this construction since it has been
successfully used in existing machine learning-based work.
Traditionally, formal methods discard many elements of our
graph. However, these elements are a valuable source of in-
formation, containing rich patterns that a machine learning
model can learn to detect and employ when making predic-
tions, as our results demonstrate.

Our graphs are extracted per-file, excluding all comments,
using the typed_ast and symtable Python packages by per-
forming a dataflow analysis. Fig. 3 illustrates such a graph.
Our graph consists of four categories of nodes:

• token nodes represent the raw lexemes in the program.
• non-terminal nodes of the syntax tree.
• vocabulary nodes that represents a subtoken [20], i.e.
a word-like element which is retrieved by splitting an
identifier into parts on camelCase or pascal_case.
• symbol nodes that represent a unique symbol in the
symbol table, such as a variable or function parameter.
For a symbol s, we set its type embeddings to r s = ht =T
ns
where ns is s’s symbol node. Symbol nodes are similar to
Gilmer et al. [27]’s “supernode”. For functions, we introduce a
symbol node for each parameter and a separate symbol node
for their return. We combine these to retrieve its signature.
We use edges to codify relationships among nodes, which
the GNN uses in the output representations. As is usual in

deep learning, we do not know the fine-grained impact of
different edges, but we do know and report (Sec. 6.2) the
impact of their ablation on the overall performance. Table 1
details our edge labels. Though some labels appear irrele-
vant from the perspective of traditional program analysis,
previous work has demonstrated that they are useful in cap-
turing code patterns indicative of code properties. In Table 1,
we cite the work that inspired us to use each edge label.
For example, NEXT_TOKEN is redundant in program analysis
(and would be discarded after parsing) but is quite predic-
tive [5, 31]. Particularly important to our approach are the
OCCURRENCE_OF edges. For example, a variable-bound token
node x will be connected to its variable symbol node, or a
member access AST node self.y will be connected to the
relevant symbol node. This edge label allows different uses
of the same symbol to exchange information in the GNN.

The AST encodes syntactic information that is tradition-
ally used in type inference (e.g. assignment and operators) so
the GNN learns about these relationships. Function invoca-
tions are not treated specially (i.e. linked to their definitions),
since, in a partially annotated codebase, statically resolving
the receiver object and thence the function is often too impre-
cise. Instead, the GNN incorporates the name of the invoked
function and the names of all its keyword arguments, which
in Python take the form of foo(arg_name=value).

Finally, SUBTOKEN_OF connects all identifiers that contain
a subtoken to a unique vocabulary node representing the
subtoken. As Cvitkovic et al. [20] found, this category of
edges significantly improves a model’s performance on the
task of detecting variable misuses and suggesting variable
names. It represents textual similarities among names of
variables and functions, even if these names are previously
unseen. For example, a variable name numNodes and a func-
tion name getNodes, share the same subtoken nodes. By
adding this edge, the GNN learns about the textual similarity
of the different elements of the program, capturing patterns
that depend on the words used by the developer.

6 Quantitative Evaluation
Typilus predicts types where traditional type inference can-
not. However, some of its predictions may be incorrect, ham-
pering Typilus’ utility. In this section, we quantitatively
evaluate the types Typilus predicts against two forms of
ground-truth: (a) how often the predictions match existing
type annotations (Sec. 6.1, Sec. 6.2) and (b) how often the
predictions pass optional type checking (Sec. 6.3).

Data. We select real-world Python projects that care about
types; these are the projects likely to adopt Typilus. As a
proxy, we use regular expressions to collect 600 Python repos-
itories from GitHub that contain at least one type annotation.
We then clone those repositories and run pytype to augment
our corpus with type annotations that can be inferred from
a static analysis tool. To allow pytype to infer types from

foo=get_foo(i,i+1)fooiBinOpCallAssignargumentsfoogetiNEXT_TOKENCHILDOCCURRENCE_OFSUBTOKEN_OFNEXT_MAY_USENEXT_LEXICAL_USEASSIGNED_FROMtokennon-terminalsymbolvocabularyEdge

This edge connects ...

two consecutive token nodes.
syntax nodes to their children nodes and tokens.
each token that is bound to a variable to all potential next uses of the variable.

NEXT_TOKEN
CHILD
NEXT_MAY_USE
NEXT_LEXICAL_USE each token that is bound to a variable to its next lexical use.
ASSIGNED_FROM
RETURNS_TO
OCCURRENCE_OF
SUBTOKEN_OF

the right hand side of an assignment expression to its left hand-side.
all return/ yield statements to the function declaration node where control returns.
all token and syntax nodes that bind to a symbol to the respective symbol node.
each identifier token node to the vocabulary nodes of its subtokens.

Allamanis, et al.

[5, 31]
[5, 9, 51]
[5]
[5]
[5]
[5]
[20, 27]
[20]

Table 1. Description of edge labels used in our graph representation of Python. Fig. 3 shows a sample graph.

imported libraries, we add to the Python environment the
top 175 most downloaded libraries1.

Then, we run the deduplication tool of Allamanis [1]. Sim-
ilar to the observations of Lopes et al. [44], we find a sub-
stantial number of (near) code duplicates in our corpus —
more than 133k files. We remove all these duplicate files
keeping only one exemplar per cluster of duplicates. As dis-
cussed in Allamanis [1], failing to remove those files would
significantly bias our results. We provide a Docker container
that replicates corpus construction and a list of the cloned
projects (and SHAs) at https://github.com/typilus/typilus.

The collected dataset is made of 118 440 files with a total
5 997 459 symbols of which 252 470 have a non-Any non-None
type annotation2. The annotated types are quite diverse, and
follow a heavy-tailed distribution. There are about 24.7k dis-
tinct non-Any types, but the top 10 types are about half of
the dataset. Unsurprisingly, the most common types are str,
bool and int appearing 86k times in total. Additionally, we
find only 158 types with more than 100 type annotations,
where each one of the rest 25k types are used within an
annotation less than 100 times per type, but still amount
to 32% of the dataset. This skew in how type annotations
are used illustrates the importance of correctly predicting
annotations not just for the most frequent types but for the
long tail of rarer types. The long-tail of types, consist of
user-defined types and generic types with different combi-
nations of type arguments. Finally, we split our data into
train-validation-test set in 70-10-20 proportions.

6.1 Quantitative Evaluation

Next, we look at the ability of our model to predict ground-
truth types. To achieve this, we take existing code, erase all
type annotations and aim to retrieve the original annotations.
Measures. Measuring the ability of a probabilistic system
that predicts types is a relatively new domain. For a type
prediction τp and the ground truth type τд, we propose three
criteria and measure the performance of a type predicting

1Retrieved from https://hugovk.github.io/top-pypi-packages/. Few of pack-
ages are removed to avoid dependency conflicts.
2We exclude Any and None type annotations from our dataset.

system by computing the ratio of predictions, over all pre-
dictions, that satisfy each criterion:

Exact Match τp and τд match exactly.
Match up to Parametric Type Exact match when ignor-

ing all type parameters (outermost []).

Type Neutral τp and τд are neutral, or interchangeable, un-

der optional typing.

In Sec. 6.1 and Sec. 6.2, we approximate type neutrality. We
preprocess all types seen in the corpus, rewriting compo-
nents of a parametric type whose nested level is greater than
2 to Any. For example, we rewrite List[List[List[int]]]
to List[List[Any]]. We then build a type hierarchy for
the preprocessed types. Assuming universal covariance, this
type hierarchy is a lattice ordered by subtyping :<. We heuris-
tically define a prediction τp to be neutral with the ground-
truth τд if τд :< τp ∧τp (cid:44) ⊤ in the hierarchy. This approxima-
tion is unsound, but fast and scalable. Despite being unsound,
the supertype still conveys useful information, facilitating
program comprehension and searching for τд. In Sec. 6.3, we
assess type neutrality by running an optional type checker.
We replace τд in a partially annotated program P with τp ,
creating a new program P ′, and optionally type check P ′ to
observe whether the replacement triggers a type error. Note
that an optional type checker’s assessment of type neutrality
may change as P becomes more fully annotated.

Baselines. The first set of baselines — prefixed with “Seq”
— are based on DeepTyper [31]. Exactly as in DeepTyper,
we use 2-layer biGRUs [10] and a consistency module in
between layers. The consistency module computes a sin-
gle representation for each variable by averaging the vector
representations of the tokens that are bound to the same
variable. Our models are identical to DeepTyper with the
following exceptions (a) we use subtoken-based embeddings
which tend to help generalisation (b) we add the consistency
module to the output biGRU layer, retrieving a single repre-
sentation per variable. Using this method, we compute the
type embedding of each variable.

The second set of baselines (denoted as *Path) are based
on code2seq [8]. We adapt code2seq from its original task of

Typilus: Neural Type Hints

predicting sequences to predicting a single vector by using
a self-weighted average of the path encodings similar to
Gilmer et al. [27]. For each symbol, we sample paths that
involve that tokens of that symbol and other leaf identifier
nodes. We use the hyperparameters of Alon et al. [8].

We test three variations for the Seq-based, Path-based,
and graph-based models. The models suffixed with Class
use the classification-based loss (Eq. 1), those suffixed with
Space use similarity learning and produce a type space (Eq. 3).
Finally, models suffixed with Typilus use the full loss (Eq. 4).
The *Space and *Typilus models differ only in the training
objective, but are otherwise identical.

Results. Table 2 shows the results of the various methods
and variations. First, it shows that the graph-based models
outperform the sequence-based and path-based models on
most metrics, but not by a wide margin. This suggests that
graphs capture the structural constraints of the code some-
what better than sequence models. When we break down
the results into the types that are often seen in our test set
(we arbitrarily define types seen fewer than 100 times to
be rare), we see that the meta-learning learning methods
are significantly better at predicting the rare types and per-
form only slightly worse than classification-based models
on the more common types. Combining meta-learning and
classification (Typilus loss in Eq. 4) yields the best results.
The Path-based methods [8] perform slightly worse to the
sequence-based methods. We believe that this is because
sequence models treat the problem as structured prediction
(predicting the type of multiple symbols simultaneously),
whereas path-based models make independent predictions.
Fig. 5 breaks down the performance of Typilus by the
number of times each type is seen in an annotation. Although
performance drops for rare annotations the top prediction is
often valid. Since a type checker can eliminate false positives,
the valid predictions will improve Typilus’s performance.
The precision-recall curve of Typilus in Fig. 4 shows that it
achieves high type neutrality for high-confidence predictions
compared to the baselines. This suggests that, if we threshold
on the prediction’s confidence, we can vary the precision-
recall trade-off. In particular, the curve shows that Typilus
achieves a type neutrality of about 95% when predicting
types for 70% of the symbols, implying that this method
works well enough for eventual integration into a useful
tool. As we discuss in Sec. 6.3, we further eliminate false
positives by filtering the suggestions through a type checker,
which removes “obviously incorrect” predictions. Table 3
shows the breakdown of the performance of Typilus over
different kinds of symbols. Typilus seems to perform worse
on variables compared to other symbols on exact match, but
not on match up to the parametric type. We believe that
this is because in our data variable annotations are more
likely to involve generics compared to parameter or return
annotations.

Relating Results to JavaScript. The results presented
here are numerically worse than those for JavaScript corpora
presented in JSNice [51] and DeepTyper [31]. We posit three
reasons for this difference. First, Typilus’s Python dataset
and the previous work’s JavaScript datasets differ signifi-
cantly in the targeted application domains. Second, code
duplicated, or shared, across the training and test corpora
of the previous work may have affected the reported re-
sults [1]. Third, the dynamic type systems of Python and
JavaScript are fundamentally different. Python features a
type system that supports many type constructors and en-
forces strict dynamic type checking. This has encouraged
developers to define type hierarchies that exploit the error
checking it offers. In contrast, JavaScript’s dynamic type
system is less expressive and more permissive. The detailed,
and sparse, type hierarchies that Python programs tend to
have makes predicting type annotations harder in Python
than in JavaScript.

Computational Speed. The GNN-based models are sig-
nificantly faster compared to RNN-based models. On a Nvidia
K80 GPU, a single training epoch takes 86sec for the GNN
model, whereas it takes 5 255sec for the biRNN model. Simi-
larly, during inference the GNN model is about 29 times faster
taking only 7.3sec per epoch (i.e. less than 1ms per graph
on average). This is due to the fact that the biRNN-based
models cannot parallelise the computation across the length
of the sequence and thus computation time is proportional
to the length of the sequence, whereas GNNs parallelise the
computation but at the cost of using information that is only
a few hops away in the graph. However, since the graph (by
construction) records long-range information explicitly (e.g.
data flow) this does not impact the quality of predictions.

Transformers. An alternative to RNN-based models are
transformers [60], which have recently shown exceptional
performance in natural language processing. Although trans-
formers can be parallelised efficiently, their memory require-
ments are quadratic to the sequence length. This is prohib-
itive for even moderate Python files. We test small trans-
formers (replacing the biGRU of our DeepTyper) and remove
sequences with more than 5k tokens, using a mini-batch size
of 2. The results did not improve on DeepTyper. This may
be because transformers often require substantially larger
quantities of data to outperform other models.

6.2 Ablation Analysis

Now, we test Typilus’s performance when varying different
elements of its architecture. Our goal is not to be exhaustive,
but to illustrate how different aspects affect type prediction.
Table 4 shows the results of the ablation study, where we
remove some edge labels from the graph at a time and re-
train our neural network from scratch. The results illustrate
the (un)importance of each aspect of the graph construction,
which Sec. 5 detailed. First, if we simply use the names of

Allamanis, et al.

Loss

Eq. 1
Eq. 3
Eq. 4
Eq. 1
Eq. 3
Eq. 4
Eq. 1
Eq. 3
Eq. 4

Seq2Class
Seq2Space
Seq-Typilus
Path2Class
Path2Space
Path-Typilus
Graph2Class
Graph2Space
Typilus

% Exact Match

% Match up to Parametric Type % Type

All Common Rare

All Common

Rare Neutral

39.6
47.4
52.4
37.5
42.3
43.2
46.1
50.5
54.6

63.8
62.2
71.7
60.5
61.9
63.8
74.5
69.7
77.2

4.6
24.5
24.9
5.2
14.5
13.8
5.9
23.1
22.5

41.2
51.8
59.7
39.0
47.4
49.2
48.8
58.4
64.1

64.6
63.7
74.2
61.1
63.6
65.8
75.4
72.5
80.3

7.6
32.2
39.3
7.9
24.8
25.7
11.2
38.4
41.2

30.4
48.9
53.9
34.0
43.7
44.7
46.9
51.9
56.3

Table 2. Quantitative evaluation of models measuring their ability to predict ground truth type annotations. Breakdown for
common (seen ≥ 100 times) and rare types (seen < 100 times). Results averaged over two randomly initialised trainings.

(a) Graph2Class

(b) Graph2Space

(c) Typilus

Figure 4. Precision-recall Curves. When filtering by confidence, Typilus makes precise predictions; compared to the baselines,
95% of the predictions are type neutral, when Typilus predicts a type to 60% of all symbols (i.e. 60% recall).

% Exact Match
% Match up to Parametric Type
% Type Neutral

Var

43.5
61.8
45.5

Func

Para

53.8
57.9
55.1

Ret

56.9
69.5
58.9

Proportion of testset

9.4%

41.5% 49.1%

Table 3. Typilus’s performance by the kind of symbol.

the symbol nodes the performance drops significantly and
the model achieves an exact match of 37.6%. Nevertheless,
this is a significant percentage and attests to the importance
of the noisy, but useful, information that identifiers contain.
Removing the syntactic edges, NEXT_TOKEN and CHILD, also
reduces the model’s performance, showing that our model
can find patterns within these edges. Interestingly, if we
just remove NEXT_TOKEN edges, we still see a performance
reduction, indicating that tokens — traditionally discarded
in formal analyses, since they are redundant — can be ex-
ploited to facilitate type prediction. Finally, the data-flow
related edges, NEXT_LEXICAL_USE and NEXT_MAY_USE, have
negligible impact on the overall performance. The reason
is that for type prediction, the order of a symbol’s different
uses does not matter. Therefore, representing these uses in

Figure 5. Typilus’s performance bucketed by the number
of annotations of a given type in our dataset.

a sequence (NEXT_LEXICAL_USE) or a tree (NEXT_MAY_USE)
offers no additional benefits. Simply put, OCCURRENCE_OF
subsumes NEXT_*USE in our problem setting.

Table 4 also shows how the performance of Typilus varies
with different token representations for the initial node states
of the GNN. We test two variations: Token-level represen-
tations, where each lexeme gets a single embedding as in
Hellendoorn et al. [31], and character-level representations

0.00.20.40.60.81.0Recall0.00.20.40.60.81.0PrecisionExactMatchMatchUptoParametricTypeTypeNeutral0.00.20.40.60.81.0Recall0.00.20.40.60.81.0PrecisionExactMatchMatchUptoParametricTypeTypeNeutral0.00.20.40.60.81.0Recall0.00.20.40.60.81.0PrecisionExactMatchMatchUptoParametricTypeTypeNeutral25102050100200500100010000AnnotationCount020406080ExactMatch(%)25102050100200500100010000AnnotationCountMatchuptoParametric(%)Typilus: Neural Type Hints

Figure 6. Absolute difference in match up to parametric type
for Typilus w.r.t. median for various k and p in eq. (5).

Ablation

Exact Match Type Neutral

Only Names (No GNN)
No Syntactic Edges
No NEXT_TOKEN
No CHILD
No NEXT_*USE
Full Model – Tokens
Full Model – Character
Full Model – Subtokens

38.8%
53.7%
54.7%
48.4%
54.7%
53.7%
53.4%
54.6%

40.4%
55.6%
56.3%
50.2%
56.4%
55.4%
55.0%
56.3%

Table 4. Ablations of Typilus when removing edges from
the graph or varying the initial node representation.

that use a 1D convolutional neural network [38] to com-
pute a node representation from its characters. The results
suggest that the initial representation does not have a big
difference, with Typilus’s subtoken-level models having a
small advantage, whereas the character-level CNN models
performing the worst, but with a small difference.

Finally, Fig. 6 shows Typilus’s performance when varying
k and p of Eq. 5. The results suggest that larger values for
k give better results and a larger p also helps, suggesting
that looking at a wider neighbourhood in the type map but
accounting for distance can yield more accurate results.

6.3 Correctness Modulo Type Checker

So far, we treated existing type annotations — those manu-
ally added by the developers or those inferred by pytype —
as the ground-truth. However, as we discuss in Sec. 7, some
annotations can be wrong, e.g. because developers may not

be invoking a type checker and many symbols are not anno-
tated. To thoroughly evaluate Typilus, we now switch to a
different ground truth: optional type checkers. Though op-
tional type checkers reason over only a partial context with
respect to a fully-typed program and are generally unsound,
their best-effort is reasonably effective in practice [26]. Thus,
we take their output as the ground-truth here.

Specifically, we test one type prediction at a time and pick
the top prediction for each symbol. For each prediction τ
for a symbol s in an annotated program P, we add τ to P if
s is not annotated, or replace the existing annotation for s
with τ , retaining all other annotations in P. Then, we run the
optional type checker and check if τ causes a type error. We
repeat this process for all the top predictions and aggregate
the results. This experiment reflects the ultimate goal of
Typilus: helping developers gradually move an unannotated
or partially annotated program to a fully annotated program
by adding a type prediction at a time.

We consider two optional type checkers: mypy and pytype.
In 2012, mypy introduced optional typing for Python and
strongly inspires Python’s annotation syntax. Among other
tools, pytype stands out because it employs more powerful
type inference and more closely reflects Python’s semantics,
i.e. it is less strict in type checking than a traditional type
checker, like mypy. Both type checkers are popular and ac-
tively maintained, but differ in design mindset, so we include
both to cover different philosophies on optional typing.

To determine how often Typilus’s type predictions are
correct, we first discard any programs which fail to type
check before using Typilus, since they will also fail even
when Typilus’s type predictions are correct. Since mypy
and pytype also perform other static analyses, such as lint-
ing and scope analysis, we need to isolate the type-related
errors. To achieve this, we comb through all error classes of
mypy and pytype and, based on their description and from
first principles, decide which errors relate to types. We then
use these type-related error classes to filter the programs
in our corpus. This filter is imperfect: some error classes,
like “[misc]” in mypy, mix type errors with other errors.
To resolve this, we sample the filtered programs and man-
ually determine whether the sampled programs have type
errors. This process removes 229 programs for mypy and
10 programs for pytype that escaped the automated filter-
ing based on error classes. We provide more information at
https://github.com/typilus/typilus. After preprocessing the
corpus, we run mypy and pytype on the remaining programs,
testing one prediction at a time. We skip type predictions
which are Any, or on which mypy or pytype crashes or spends
more than 20 seconds. In total, we assess 350,374 type pre-
dictions using mypy and 85,732 using pytype.

Table 5 presents the results of applying mypy and py-
type to the top type predictions. In general, 89% and 83% of
Typilus’s predictions do not cause a type error in mypy and

0.010.050.10.250.50.7511.5235p12345791113161925k-3.4-3.4-3.4-3.4-3.4-3.4-3.4-3.4-3.4-3.4-3.4-3.2-3.2-3.2-3.2-3.2-3.2-3.2-3.2-3.2-3.2-3.2-2.0-2.0-1.9-1.9-1.8-1.7-1.6-1.6-1.6-1.6-1.7-1.4-1.4-1.40.10.30.40.50.60.70.70.5-0.0-0.0-0.00.10.40.60.70.91.01.00.9-0.0-0.0-0.00.10.50.60.71.21.31.00.9-0.1-0.1-0.10.00.40.81.01.41.61.71.6-0.2-0.2-0.2-0.10.30.71.01.41.61.81.9-0.3-0.3-0.3-0.10.30.71.01.41.72.02.1-0.4-0.4-0.4-0.30.20.60.91.41.82.12.2-0.6-0.6-0.5-0.40.00.40.81.41.72.12.3-0.8-0.8-0.7-0.6-0.20.30.71.31.72.12.4−3−2−1012Annotation

mypy

pytype

Original Predicted

Prop. Acc.

Prop. Acc.

ϵ
τ
τ

τ
τ ′
τ

89%
95%
85%
3%
2% 100%

83%
94%
63%
3%
3% 100%

Overall

100%

89%

100%

83%

Table 5. Type checking accuracy of Typilus modulo mypy
and pytype. A prediction is incorrect if it causes a type error.
Mypy and pytype experience timeouts on different programs,
hence the discrepancy between the proportion of each case.

Figure 7. Precision-recall curve for the type checking ex-
periment. We deem Typilus unable to suggest a type if the
probability of a type prediction is below a threshold.

pytype, respectively. This demonstrates that the type predic-
tions are commonly correct with respect to optional typing.
We then group the predictions into three categories: ϵ → τ
where Typilus suggests a type to a previously unannotated
symbol, τ → τ ′ where it suggests a type that is different from
the original annotation, and τ → τ where the suggested type
is identical with the original annotation. As the ϵ → τ row
illustrates, most of the symbols, whose types Typilus is able
to predict, are untyped even after pytype’s type inference.
This indicates that Typilus has a wide application domain.
For mypy, 3% of Typilus’s predictions differ from the orig-
inal annotations. Though different, some of these predictions
might actually be correct (Sec. 7). Further analysis reveals
that 33% of these predictions are a supertype of the origi-
nal one (less precise but interchangeable) and 2% are more
specific (and potentially but not certainly incorrect). Mypy
produces a type error for 22% of them, which shows that
optional type checkers can effectively improve the quality
Typilus’s suggestion, by filtering false positives. The τ → τ
case is a sanity check: the input programs do not have type
errors, by construction of this experiment, so when Typilus
predicts the same annotations, they pass type checking.

Finally, Fig. 7 investigates Typilus’ precision and recall. By
varying the confidence threshold on the predictions, we can
trade precision for recall. Typilus maintains a good trade-off

Allamanis, et al.

between precision and recall. For example, when it predicts a
type for 80% of all symbols, 90% of the predictions are correct
with respect to mypy.

7 Qualitative Evaluation
To better understand the performance of Typilus and the
expressivity of the types it can infer, we manually analyse
its predictions, before a type checker filters them. Our goal
is not to be exhaustive but to convey cases that indicate
opportunities for future research.

We begin by exploring how complex a type expression
Typilus can reliably infer. By complex, we mean a deeply
nested parametric type such as Set[Tuple[bool, Tuple[UDT,
...]]], where UDT denotes a user-defined type. In princi-
ple, Typilus can learn to predict these types. However, such
types are extremely rare in our dataset: about 30% of our
annotations are parametric and, of them, 80% have depth
one and 19% have depth two, with more deeply nested types
mostly appearing once. For our evaluation, we built the type
map over the training and the validation sets. Since these
complex types appear once (and only in our test set), they do
not appear in the type map and Typilus cannot predict them.
We believe that deeply nested parametric types are so rare be-
cause developers prefer to define and annotate UDTs rather
than deeply nested types which are hard-to-understand. Un-
fortunately, Typilus finds UDTs hard to predict. Improved
performance on the task will require machine learning meth-
ods that better understand the structure of UDTs and the
semantics of their names.

We now look at the most confident errors, i.e. cases where
Typilus confidently predicts a non-type neutral type. Typilus
commonly confuses variables with collections whose el-
ements have the same type as the variables, confusing T
and Optional[T], for various concrete T, and predicts the
wrong type3. Similarly, when the ground truth type is a
Union, Typilus often predicts a subset of the types in the
union. This suggests that the type space is not learning to
represent union types. For example, in rembo10/headphones,
Typilus predicts Optional[int] where the ground truth is
Optional[Union[float, int, str]]. Adding intraproce-
dural relationships to Typilus, especially among different
code files, may help resolve such issues.

We also identified a few cases where the human type
annotation is wrong. For example, in PyTorch/fairseq, a
sequence-to-sequence modelling toolkit that attracts more
than 7.3k stars on GitHub, we found three parameters rep-
resenting tensor dimensions annotated as float. Typilus,
having seen similar code and similarly named variables, pre-
dicts with 99.8% confidence that these parameters should

3Optional[T] conveys a nullable variable, i.e. Union[T, None].

0.00.20.40.60.81.0Recall0.00.20.40.60.81.0PrecisionCorrectagainstmypyCorrectagainstpytypeTypilus: Neural Type Hints

be annotated as int. We submitted two pull requests cov-
ering such cases: one4 to PyTorch/fairseq and one5 to
allenai/allennlp, a natural language processing library
with more than 8.2k stars. Both have been merged. Why
did the type checker fail to catch these errors? The problem
lies with the nature of optional typing. It can only reason
locally about type correctness; it only reports an error if it
finds a local type inconsistency. When a function invokes
an unannotated API, an optional type checker can disprove
very few type assignments involving that call. This is an
important use-case of Typilus, where, due to the sparsely
annotated nature of Python code, incorrect annotations can
go undetected by type checkers.

In some cases, Typilus predicts a correct, but more specific
type, than the original type annotation or the one inferred
by pytype. For example, in an Ansible function, pytype in-
ferred dict, whereas Typilus predicted the more precise
Dict[str, Any]. We believe that this problem arises due to
pytype’s design, such as preferring conservative approxima-
tions, which allow it to be a practical type inference engine.
A third source of disagreement with the ground truth is
confusing str and bytes. These two types are conceptually
related: bytes are raw while str is “cooked” Unicode. In-
deed, one can always encode a str into its bytes and decode
it back to a str, given some encoding such as ASCII or UTF-
8. Python developers also commonly confuse them [49], so
it is not surprising that Typilus does too. We believe that
this confusion is due to the fact that variables and parame-
ters of the two types have a very similar interface and they
usually share names. Resolving this will require a wider un-
derstanding how the underlying object is used, perhaps via
an approximate intraprocedural analysis.

Finally, Typilus confuses some user-defined types. Given
the sparsity of these types, this is unsurprising. Often, the
confusion is in conceptually related types. For example, in
awslabs/sockeye, a variable annotated with mx.nd.NDArray
is predicted to be torch.Tensor. Interestingly, these two
types represent tensors but in different machine learning
frameworks (MxNet and PyTorch).

8 Related Work
Recently, researchers have been exploring the application
of machine learning to code [4]. This stream of work fo-
cuses on capturing (fuzzy) patterns in code to perform tasks
that would not be possible with using only formal methods.
Code completion [32, 34, 36, 52] is one of the most widely ex-
plored topics. Machine learning models of code are also used
to predict names of variables and functions [2, 3, 8, 9, 12],
with applications to deobfuscation [51, 59] and decompila-
tion [22, 30, 41]. Significant effort has been made towards
automatically generating documentation from code or vice

4https://github.com/pytorch/fairseq/pull/1268
5https://github.com/allenai/allennlp/pull/3376

versa [8, 11, 24, 35]. These works demonstrate that machine
learning can effectively capture patterns in code.

Program Analysis and Machine Learning. Within the
broader area of program analysis, machine learning has been
utilised in a variety of settings. Recent work has focused on
detecting specific kinds of bugs, such as variable misuses and
argument swappings [5, 20, 50, 53, 58] showing that “soft”
patterns contain valuable information that can catch many
real-life bugs that would not be otherwise easy to catch with
formal program analysis. Work also exists in a variety of
program analysis domains. Si et al. [55] learn to predict loop
invariants, Mangal et al. [47] and Heo et al. [33] use machine
learning methods to filter false positives from program anal-
yses by learning from user feedback. Chibotaru et al. [17]
use weakly supervised learning to learn taint specifications
and DeFreez et al. [23] mine API call sequence specifications.
Code Representation in Machine Learning. Represent-
ing code for consumption in machine learning is a central
research problem. Initial work viewed code as a sequence
of tokens [32, 34]. The simplicity of this representation has
allowed great progress, but it misses the opportunity to learn
from code’s known and formal structure. Other work based
their representation on ASTs [7–9, 13, 45] — a crucial step to-
wards exploitation of code’s structure. Finally, graphs, which
Typilus employs, encode a variety of complex relationships
among the elements of code. Examples of include the early
works of Kremenek et al. [40] and Raychev et al. [51] and
variations of GNNs [5, 20, 33].

Optional Typing. At the core of optional typing [14] lie
optional type annotations and pluggable type checking, com-
bining static and dynamic typing, but without providing
soundness guarantees. Therefore, it is often called “unsound
gradual typing” [48, 57]. Optional typing has not been for-
malised and its realisation varies across languages and type
checkers. For example, TypeScript checks and then erases
type annotations, whereas Python’s type annotations simply
decorate the code, and are used by external type checkers.

9 Conclusion
We presented a machine learning method for predicting
types in dynamically typed languages with optional anno-
tations and realised it for Python. Type inference for many
dynamic languages, like Python, must often resort to the Any
type. Machine learning methods, like the one presented here,
that learn from the rich patterns within the code, including
identifiers and coding idioms, can provide an approximate,
high-precision and useful alternative.

Acknowledgments
We thank the reviewers for their useful feedback, and M.
Brockschmidt, J.V. Franco for useful discussions. This work
was partially supported by EPSRC grant EP/J017515/1.

References
[1] Miltiadis Allamanis. 2019. The Adverse Effects of Code Duplication in

Machine Learning Models of Code. In SPLASH Onward!

[2] Miltiadis Allamanis, Earl T Barr, Christian Bird, and Charles Sutton.
2014. Learning Natural Coding Conventions. In Proceedings of the
International Symposium on Foundations of Software Engineering (FSE).
[3] Miltiadis Allamanis, Earl T Barr, Christian Bird, and Charles Sutton.
2015. Suggesting accurate method and class names. In Proceedings of
the Joint Meeting of the European Software Engineering Conference and
the Symposium on the Foundations of Software Engineering (ESEC/FSE).
[4] Miltiadis Allamanis, Earl T Barr, Premkumar Devanbu, and Charles
Sutton. 2018. A survey of machine learning for big code and natural-
ness. ACM Computing Surveys (CSUR) 51, 4 (2018), 81.

[5] Miltiadis Allamanis, Marc Brockschmidt, and Mahmoud Khademi.
2018. Learning to Represent Programs with Graphs. In Proceedings of
the International Conference on Learning Representations (ICLR).
[6] Miltiadis Allamanis and Charles Sutton. 2013. Mining source code
repositories at massive scale using language modeling. In Proceedings
of the Working Conference on Mining Software Repositories (MSR). IEEE
Press, 207–216.

[7] Miltiadis Allamanis, Daniel Tarlow, Andrew Gordon, and Yi Wei. 2015.
Bimodal modelling of source code and natural language. In Proceedings
of the International Conference on Machine Learning (ICML).

[8] Uri Alon, Omer Levy, and Eran Yahav. 2010. code2seq: Generating
Sequences from Structured Representations of Code. In Proceedings of
the International Conference on Learning Representations (ICLR).
[9] Uri Alon, Meital Zilberstein, Omer Levy, and Eran Yahav. 2019.
code2vec: Learning distributed representations of code. Proceedings of
the ACM on Programming Languages 3, POPL (2019), 40.

[10] Dzmitry Bahdanau, Kyunghyun Cho, and Yoshua Bengio. 2015. Neu-
ral machine translation by jointly learning to align and translate. In
Proceedings of the International Conference on Learning Representations
(ICLR).

[11] Antonio Valerio Miceli Barone and Rico Sennrich. 2017. A Parallel Cor-
pus of Python Functions and Documentation Strings for Automated
Code Documentation and Code Generation. In Proceedings of the Eighth
International Joint Conference on Natural Language Processing (Volume
2: Short Papers), Vol. 2. 314–319.

[12] Rohan Bavishi, Michael Pradel, and Koushik Sen. 2018. Context2Name:
A deep learning-based approach to infer natural variable names from
usage contexts. arXiv preprint arXiv:1809.05193 (2018).

[13] Pavol Bielik, Veselin Raychev, and Martin Vechev. 2016. PHOG: Proba-
bilistic Model for Code. In Proceedings of the International Conference
on Machine Learning (ICML). 2933–2942.

[14] Gilad Bracha. 2004. Pluggable type systems. In OOPSLA workshop on

revival of dynamic languages, Vol. 4.

[15] Marc Brockschmidt, Miltiadis Allamanis, Alexander L Gaunt, and
Oleksandr Polozov. 2019. Generative code modeling with graphs. In
International Conference in Learning Representations.

[16] De Cheng, Yihong Gong, Sanping Zhou, Jinjun Wang, and Nanning
Zheng. 2016. Person re-identification by multi-channel parts-based
CNN with improved triplet loss function. In Proceedings of the IEEE
conference on computer vision and pattern recognition. 1335–1344.
[17] Victor Chibotaru, Benjamin Bichsel, Veselin Raychev, and Martin
Vechev. 2019. Scalable taint specification inference with big code.
In Proceedings of the 40th ACM SIGPLAN Conference on Programming
Language Design and Implementation. ACM, 760–774.

[18] Kyunghyun Cho, Bart van Merriënboer, Dzmitry Bahdanau, and
Yoshua Bengio. 2014. On the Properties of Neural Machine Trans-
lation: Encoder–Decoder Approaches. Syntax, Semantics and Structure
in Statistical Translation (2014).

[19] Sumit Chopra, Raia Hadsell, and Yann LeCun. 2005. Learning a simi-
larity metric discriminatively, with application to face verification. In
CVPR.

Allamanis, et al.

[20] Milan Cvitkovic, Badal Singh, and Anima Anandkumar. 2019. Open
Vocabulary Learning on Source Code with a Graph-Structured Cache.
In Proceedings of the International Conference on Machine Learning
(ICML).

[21] Santanu Kumar Dash, Miltiadis Allamanis, and Earl T Barr. 2018. Re-
fiNym: using names to refine types. In Proceedings of the 2018 26th
ACM Joint Meeting on European Software Engineering Conference and
Symposium on the Foundations of Software Engineering. ACM, 107–117.
[22] Yaniv David, Uri Alon, and Eran Yahav. 2019. Neural Reverse Engi-

neering of Stripped Binaries. arXiv preprint arXiv:1902.09122 (2019).

[23] Daniel DeFreez, Aditya V Thakur, and Cindy Rubio-González. 2018.
Path-based function embedding and its application to specification
mining. arXiv preprint arXiv:1802.07779 (2018).

[24] Patrick Fernandes, Miltiadis Allamanis, and Marc Brockschmidt. 2019.

Structured neural summarization.

[25] Python Software Foundation. 2020. typing – Support for type hints.

https://docs.python.org/3/library/typing.html. Visited March 2020.

[26] Zheng Gao, Christian Bird, and Earl T Barr. 2017. To type or not to
type: quantifying detectable bugs in JavaScript. In Proceedings of the
International Conference on Software Engineering (ICSE).

[27] Justin Gilmer, Samuel S Schoenholz, Patrick F Riley, Oriol Vinyals, and
George E Dahl. 2017. Neural message passing for quantum chemistry.
In Proceedings of the 34th International Conference on Machine Learning-
Volume 70. JMLR. org, 1263–1272.

[28] Ian Goodfellow, Yoshua Bengio, and Aaron Courville. 2016. Deep

Learning. MIT Press. www.deeplearningbook.org.

[29] Raia Hadsell, Sumit Chopra, and Yann LeCun. 2006. Dimensionality
reduction by learning an invariant mapping. In 2006 IEEE Computer So-
ciety Conference on Computer Vision and Pattern Recognition (CVPR’06),
Vol. 2. IEEE, 1735–1742.

[30] Jingxuan He, Pesho Ivanov, Petar Tsankov, Veselin Raychev, and Martin
Vechev. 2018. Debin: Predicting debug information in stripped binaries.
In Proceedings of the 2018 ACM SIGSAC Conference on Computer and
Communications Security. ACM, 1667–1680.

[31] Vincent J Hellendoorn, Christian Bird, Earl T Barr, and Miltiadis Al-
lamanis. 2018. Deep learning type inference. In Proceedings of the
2018 26th ACM Joint Meeting on European Software Engineering Confer-
ence and Symposium on the Foundations of Software Engineering. ACM,
152–162.

[32] Vincent J Hellendoorn and Premkumar Devanbu. 2017. Are deep neural
networks the best choice for modeling source code?. In Proceedings
of the 2017 11th Joint Meeting on Foundations of Software Engineering.
ACM, 763–773.

[33] Kihong Heo, Mukund Raghothaman, Xujie Si, and Mayur Naik. 2019.
Continuously reasoning about programs using differential Bayesian
inference. In Proceedings of the 40th ACM SIGPLAN Conference on
Programming Language Design and Implementation. ACM, 561–575.

[34] Abram Hindle, Earl T Barr, Zhendong Su, Mark Gabel, and Premkumar
Devanbu. 2012. On the naturalness of software. In Software Engineering
(ICSE), 2012 34th International Conference on. IEEE, 837–847.

[35] Srinivasan Iyer, Ioannis Konstas, Alvin Cheung, and Luke Zettlemoyer.
2016. Summarizing source code using a neural attention model. In Pro-
ceedings of the 54th Annual Meeting of the Association for Computational
Linguistics (Volume 1: Long Papers), Vol. 1. 2073–2083.

[36] Rafael-Michael Karampatsis and Charles Sutton. 2019. Maybe Deep
Neural Networks are the Best Choice for Modeling Source Code. arXiv
preprint arXiv:1903.05734 (2019).

[37] Sayali Kate, John-Paul Ore, Xiangyu Zhang, Sebastian Elbaum, and
Zhaogui Xu. 2018. Phys: probabilistic physical unit assignment and
inconsistency detection. In Proceedings of the 2018 26th ACM Joint
Meeting on European Software Engineering Conference and Symposium
on the Foundations of Software Engineering. ACM, 563–573.

[38] Yoon Kim, Yacine Jernite, David Sontag, and Alexander M Rush. 2016.
Character-aware neural language models. In Thirtieth AAAI Conference

Typilus: Neural Type Hints

on Artificial Intelligence.

Nov 2019.

[39] Thomas N Kipf and Max Welling. 2016. Semi-supervised classification
with graph convolutional networks. arXiv preprint arXiv:1609.02907
(2016).

[40] Ted Kremenek, Andrew Y Ng, and Dawson R Engler. 2007. A Factor
Graph Model for Software Bug Finding. In Proceedings of the Interna-
tional Joint Conference on Artifical intelligence (IJCAI).

[41] Jeremy Lacomis, Pengcheng Yin, Edward J Schwartz, Miltiadis Alla-
manis, Claire Le Goues, Graham Neubig, and Bogdan Vasilescu. 2019.
DIRE: A Neural Approach to Decompiled Identifier Naming. In Proceed-
ings of the International Conference on Automated Software Engineering
(ASE).

[42] Yujia Li, Daniel Tarlow, Marc Brockschmidt, and Richard Zemel. 2016.
Gated Graph Sequence Neural Networks. Proceedings of the Interna-
tional Conference on Learning Representations (ICLR) (2016).

[43] Benjamin Livshits, Manu Sridharan, Yannis Smaragdakis, Ondřej
Lhoták, J Nelson Amaral, Bor-Yuh Evan Chang, Samuel Z Guyer,
Uday P Khedker, Anders Møller, and Dimitrios Vardoulakis. 2015. In
defense of soundiness: a manifesto. Commun. ACM 58, 2 (2015), 44–46.
[44] Cristina V Lopes, Petr Maj, Pedro Martins, Vaibhav Saini, Di Yang,
Jakub Zitny, Hitesh Sajnani, and Jan Vitek. 2017. DéjàVu: a map of
code duplicates on GitHub. Proceedings of the ACM on Programming
Languages 1, OOPSLA (2017), 84.

[45] Chris Maddison and Daniel Tarlow. 2014. Structured generative models
of natural source code. In Proceedings of the International Conference
on Machine Learning (ICML). 649–657.

[46] Rabee Sohail Malik, Jibesh Patra, and Michael Pradel. 2019. NL2Type:
inferring JavaScript function types from natural language informa-
tion. In Proceedings of the 41st International Conference on Software
Engineering. IEEE Press, 304–315.

[47] Ravi Mangal, Xin Zhang, Aditya V Nori, and Mayur Naik. 2015. A user-
guided approach to program analysis. In Proceedings of the International
Symposium on Foundations of Software Engineering (FSE).

[48] Fabian Muehlboeck and Ross Tate. 2017. Sound gradual typing is
nominally alive and well. Proceedings of the ACM on Programming
Languages 1, OOPSLA (2017), 56.

[49] Stack Overflow. 2011. What is the difference between a string and a
byte string? https://stackoverflow.com/questions/6224052. Visited

[50] Michael Pradel and Koushik Sen. 2017. Deep Learning to Find Bugs.

(2017).

[51] Veselin Raychev, Martin Vechev, and Andreas Krause. 2015. Predicting
program properties from Big Code. In Proceedings of the Symposium on
Principles of Programming Languages (POPL), Vol. 50. ACM, 111–124.
[52] Veselin Raychev, Martin Vechev, and Eran Yahav. 2014. Code comple-
tion with statistical language models. In Proceedings of the Symposium
on Programming Language Design and Implementation (PLDI), Vol. 49.
ACM, 419–428.

[53] Andrew Rice, Edward Aftandilian, Ciera Jaspan, Emily Johnston,
Michael Pradel, and Yulissa Arroyo-Paredes. 2017. Detecting argument
selection defects. Proceedings of the ACM on Programming Languages
1, OOPSLA (2017), 104.

[54] Gregor Richards, Sylvain Lebresne, Brian Burg, and Jan Vitek. 2010.
An Analysis of the Dynamic Behavior of JavaScript Programs. In
Proceedings of the 31st ACM SIGPLAN Conference on Programming
Language Design and Implementation (Toronto, Ontario, Canada) (PLDI
’10). ACM, New York, NY, USA, 1–12. https://doi.org/10.1145/1806596.
1806598

[55] Xujie Si, Hanjun Dai, Mukund Raghothaman, Mayur Naik, and Le Song.
2018. Learning loop invariants for program verification. In Advances
in Neural Information Processing Systems. 7751–7762.

[56] Spotify and Contributors. 2019. Annoy: Approximate Nearest Neigh-

bors. https://github.com/spotify/annoy.

[57] Asumu Takikawa, Daniel Feltey, Ben Greenman, Max S New, Jan Vitek,
and Matthias Felleisen. 2016. Is sound gradual typing dead?. In ACM
SIGPLAN Notices, Vol. 51. ACM, 456–468.

[58] Marko Vasic, Aditya Kanade, Petros Maniatis, David Bieber, and
Rishabh Singh. 2019. Neural Program Repair by Jointly Learning
to Localize and Repair. arXiv preprint arXiv:1904.01720 (2019).
[59] Bogdan Vasilescu, Casey Casalnuovo, and Premkumar Devanbu. 2017.
Recovering clear, natural identifiers from obfuscated JS names. In
Proceedings of the International Symposium on Foundations of Software
Engineering (FSE).

[60] Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion
Jones, Aidan N Gomez, Łukasz Kaiser, and Illia Polosukhin. 2017. At-
tention is all you need. In Advances in neural information processing
systems. 5998–6008.
