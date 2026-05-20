# A Toolkit for Generating Code Knowledge Graphs

Source: https://arxiv.org/pdf/2002.09440

## 1
1
2
0
2

p
e
S
8
2

]

B
D
.
s
c
[

3
v
0
4
4
9
0
.
2
0
0
2
:
v
i
X
r
a

A Toolkit for Generating Code Knowledge Graphs

Ibrahim Abdelaziz1, Julian Dolby1, Jamie McCusker2, and Kavitha Srinivas1

1IBM Research, T.J. Watson Research Center, Yorktown Heights, NY, USA,
{ibrahim.abdelaziz1, kavitha.srinivas}@ibm.com, dolby@us.ibm.com
2Rensselaer Polytechnic Institute (RPI), Troy, NY, USA
mccusj2@rpi.edu

Abstract
Knowledge graphs have been proven extremely useful in powering diverse applications in semantic search and
natural language understanding. In this work, we present GraphGen4Code, a toolkit to build code knowledge
graphs that can similarly power various applications such as program search, code understanding, bug detection,
and code automation. GraphGen4Code uses generic techniques to capture code semantics with the key nodes
in the graph representing classes, functions and methods. Edges indicate function usage (e.g., how data ﬂows
through function calls, as derived from program analysis of real code), and documentation about functions (e.g.,
code documentation, usage documentation, or forum discussions such as StackOverﬂow). Our toolkit uses
named graphs in RDF to model graphs per program, or can output graphs as JSON. We show the scalability of
the toolkit by applying it to 1.3 million Python ﬁles drawn from GitHub, 2,300 Python modules, and 47 million
forum posts. This results in an integrated code graph with over 2 billion triples. We make the toolkit to build
such graphs as well as the sample extraction of the 2 billion triples graph publicly available to the community
for use.

1 Introduction

A number of diﬀerent knowledge graphs have been constructed
in recent years such as DBpedia [27], Wikidata [35], Freebase
[9], YAGO [33] and NELL [12]. These knowledge graphs have
provided signiﬁcant advantages in a number of diﬀerent appli-
cation areas, such as semantic parsing [20], recommendation
systems [13], information retrieval [14], and question answer-
ing [1, 34, 36]. Inspired by the value of these knowledge graphs
for a variety of applications, we asked how one might build a
knowledge graph in the domain of program code. There are
a number of applications around code that could potentially
beneﬁt from such knowledge graphs, such as code search, code
automation, refactoring, bug detection, and code optimization
[4, 2].
In 2019-2021 alone, there have been over 150 papers1 using
machine learning for problems that involve code, including
problems that span natural language and code (e.g., summariz-
ing code in natural language [6]). Yet there are two problems
with existing work on code representation: (a) they rely on local
representations of code such as Abstract Syntax Trees, or lines
of source text (see [4] for a comprehensive survey on the topic).
Few works have used data and control ﬂow based representa-
tions of code as input to drive various applications although
these representations capture locality in program code which is
highly non-local, (b) they rarely include any natural language
associated with code unless it is for a speciﬁc task such as code
search [17]. As humans, we understand code by understanding
documentation of individual API calls, but also its ﬂow as ob-
jects get created and passed through program sections that are
often non-local. Our goal therefore was to build a toolkit that
can construct code representations that represent actual program
ﬂow along with natural language descriptions of API calls when
they exist to enhance code representations.

1https://ml4code.github.io/papers.html

We ﬁrst illustrate the value of such a toolkit with Figure 1, which
shows an example of code search: a developer searches for
StackOverﬂow posts relevant to the Python code from GitHub
in the left panel. That code creates an SVC model (svm.SVC)
to train on the dataset (model.fit). On the right is a real
post from StackOverﬂow relevant to this code, in that the code
performs similar operations. However, treating program code as
text or as an Abstract Syntax Tree (AST) makes this similarity
extremely hard to detect. For instance, there is no easy way to
tell that model and clf_SVM_radial_basis refer to the same
type of object. They look diﬀerent as a token level unless one
performs data ﬂow analysis, which would have an edge from
svm.SVC to the svm.SVC.fit call in both programs, and would
abstract out variable names. Furthermore, one can use natural
language descriptions of SVC for instance, to realize it is similar
to linear_model.SGDClassifier, and the usage guide, or
forum posts often suggest using the latter for larger datasets.
By building a toolkit to build richer representations of code, it
is possible to generate more abstract code representations than
token or AST level, and these representations in turn can greatly
augment code representation learning.
GraphGen4Code is therefore designed as a toolkit to build
knowledge graphs for program code. We deploy state-of-the-art
program analysis techniques that generalize across programming
languages to build inter-procedural data and control ﬂow. In
general, applying these techniques on a large scale to millions
of API libraries is diﬃcult because of the modeling of the se-
mantics of individual API libraries. In this paper, we build a set
of abstractions over APIs that allow us to scale such analysis to
millions of programs. We target Python for our demonstration
of scalability, because Python poses particularly diﬃcult chal-
lenges as a dynamic language, although our techniques can be
extended easily to Javascript and Java. To demonstrate Graph-
Gen4Code’s scalability, we build graphs for 1.3 million Python
programs (where program refers to a single Python script) on
GitHub, each analyzed into its own separate graph. We also

2

Figure 1: Code search example: Program (left) and a relevant forum discussion (right)

use the toolkit to link library calls to documentation and forum
discussions, by identifying the most commonly used modules
in code, and trying to connect their classes, methods or func-
tions to relevant documentation or posts. For forum posts, we
used information retrieval techniques to connect it to method
or the class (an example of which is shown in Figure 1 for the
sklearn.svm.SVC.fit method). We performed this linking
for 257K classes, 5.8M methods, and 278K functions, and pro-
cessed 47M posts from StackOverﬂow and StackExchange to
show the feasibility of using the GraphGen4Codetoolkit for
building knowledge graphs for code.

In summary, our key contributions are as follows:

• A scalable toolkit for building knowledge graphs for

code

• A model to represent code and its natural language

artifacts (Section 2)

• A language neutral approach to mine common code

patterns (Section 3)

• A demonstration of the toolkit’s scalability by applying
it to 1.3 million Python programs and 47 million posts
to generate a code knowledge graph with over 2 billion
facts about code (Section 4)

All artifacts associated with GraphGen4Code, along with de-
tailed descriptions of the modeling, use cases, query templates
and sample queries for use cases are publicly available at
https://wala.github.io/graph4code/.

2 Modeling

In modeling code graphs, a key design point is extensibility,
which means loose coupling between multiple programs, and
loose coupling to related bits of information about classes and
functions. To achieve this, we modeled each program as a
separate graph, ensuring a unique node in the graph for every in-
vocation of a call, or the read of any data structures such as lists,
dictionaries, ﬁelds of an object, etc. Each node is connected
to its actual method or function name by an edge to a label
node. For instance, the function call for pandas.read_csv in
Figure 1 would have a node that linked to its label which is

python:pandas.read_csv. Two diﬀerent invocations of the
exact same function therefore only link to each other through
their label, which would be python:pandas.read_csv, as
shown in Figure 2. However, since the return types of func-
tions are often unknown in Python, this linkage between ac-
tual functions and the name for a particular invocation of
the function is not always predictable. For instance, in the
right panel of Figure 1, the call df.fillna will reﬂect the
analysis to that point as shown in Figure 2, its label would
be pandas.read_csv.fillna, since the return value of a
pandas.read_csv call is unknown in dynamic languages such
as Python and Javascript. Modeling of code analysis is detailed
in Section 3; Figure 2 demonstrates loose coupling across pro-
grams, and shows how code that looks diﬀerent at a token level
look similar at the data ﬂow level.

Similarly, each forum post has its own node, which describes
the question, the answer (in terms of posts), any code mentioned
in the posts (see Figure 3). For documentation, once again the
data is structured so a node representing documentation of a
function would contain connections to the arguments and return
types of that function (see Figure 4). Loose coupling to program
graphs is once again achieved by labels. Posts with mentions of
speciﬁc Python classes, modules, and functions (such as SVC)
in the forum posts are linked to class and function labels in
exactly the same manner as call invocations, i.e. with a link
to a label node. Similarly, documentation is connected to its
class or function label. Any new module’s documentation, new
program graphs, or new posts can be added to an existing graph,
and the extraction process ensures that links to labels stitch new
information in seamlessly. For instance, a new forum post about
read_csv would link to the same label node as documentation
of read_csv. The resulting graph allows the querying of usage
patterns and natural language descriptions for python functions
and classes directly by their fully qualiﬁed name (see Section 5).
GraphGen4Code produces output as RDF or JSON. For the
RDF version, to facilitate integration with other ontologies, we
re-used properties from relevant existing ones such as the Se-
manticscience Integrated Ontology (SIO) [16], and Schema.org,
whenever possible. We, however, needed to add a number of
our own properties and classes, since we found no single on-
tology that covers the concepts needed for modeling programs.

3

Figure 2: Code analysis schema example for the code snippets in Figure 1 with gray and blue nodes corresponding to the code on
the left and right, respectively.

Figure 3: StackOverﬂow Graph Example

While we have found this representation useful, we do provide a
JSON representation that can be adapted to whatever ontology
is required for a given application if the current modeling is
incompatible with a speciﬁc application’s needs. Details are
available on the GraphGen4Code’s website.

3 Mining Code Patterns

3.1 Code Analysis

Although WALA is a well known library with extensive work
(e.g.
[15, 26, 32, 37, 19]) on interprocedural data ﬂow and
control ﬂow analysis for Java, Javascript and Python, we needed
to extend the WALA analysis framework to make it work for
millions of Python programs with many popular API uses. At the
core is the issue of how to model the semantics of API functions.
There have been two basic options to it: (a) use the analysis
framework to trace data and control ﬂow into the code of the
API function, (b) abstract it by using manually deﬁned templates
that makes the semantics of the call explicit. The ﬁrst approach
is not feasible for Python because a vast portion of Python code

Figure 4: Docstrings Graph Example

Figure 5: Illustrative code example from GitHub

pandas.read_csv.fillnasklearn.SVC.fitpandas.read_csv.train_test_splitpandas.read_csvsklearn.SVC….….labelflowsToaboutHow to run SVC classifier ...nameI'm relatively new to machine learning ... textsuggestedAns.Build your classifier … contentTrueacceptedsklearn.SVClabelcodecodeRead a comma separated values (csv) …py:pandasDelimeterto use ..sep1A comma separated ..1doc.partOfparamreturnlabellabeldocidxdocidxpandas.read_csvlabelpy:pandas.DataFramelabelreturnTypepy:strlabelInf. type1235674a4bwraps code written in a completely diﬀerent language (e.g. C).
Moreover, given millions of lines of code in libraries behind the
API calls, it is unlikely that the analysis can scale with adequate
precision. The second approach is tedious and can only work for
a very small number of API calls. In analyzing large numbers
of programs with thousands of programs, this approach will not
scale.

To scale analysis to a large number of programs, we adopt a sim-
ple, common abstraction for all APIs; as with any static model
of code [28]. This abstraction is neither sound nor complete,
but it captures the essence of how APIs impact user code: (a)
We assume any call to an imported function simply returns a
new object, with no side eﬀects. Of course this may not be true
in practice, but it allows us to scale without delving into the
analysis of libraries, which may be huge and, in languages like
Python, are often written in C. In other words, this is indeed a
simplifying assumption that adds imprecision in the analysis,
but there is no method to scale analysis to millions of programs
without this assumption. (b) We assume that any read of a ﬁeld
of an object created from an imported function returns itself.
Again, the ﬁeld of an object is certainly not the same as the
object itself, but it once again helps us scale analysis to large
numbers of API types without having to capture the semantics
of each of their ﬁelds, which may not be feasible in dynamic
languages like Python. (c) These new objects returned by the
model may have methods called on them or ﬁelds read. Such
calls or reads on these objects are handled just like those on the
imported API itself. This allows calls like read_csv.where to
return new objects.

This extension to WALA’s modeling framework is available
only for Python at the moment, but a similar mechanism can be
applied to other dynamic programming languages like Javascript.
Java has less need of this extension since it is a strongly typed
language.

Figure 5 extends the code in our running example (Figure 1) to
illustrate how we construct the analysis graph. In this example,
a CSV ﬁle is ﬁrst read using the Pandas library with a call to
pandas.read_csv, with the call being represented as 1 on the
right of the program. The object returned by the call has an
unknown type, since most code in Python is not typed. Some
ﬁltering is performed on this object by ﬁlling in the missing
values with a median with a call to where, which is call 2. The
object returned by 2 is then split into train and test with a call to
train_test_split, which is call 3. Two subsets of the train
data are created (4) which are then used as arguments to the
fit call (6), after creating the SVC object in call (5). The test
data is similarly split into its X and Y components and used as
arguments to the predict call (7).

Figure 6 illustrates the output of analysis, with control ﬂow (de-
picted as green edges) and data ﬂow (depicted as cyan edges)
for the analyzed program. The control ﬂow edges are straight-
forward in this example and capture the order of calls, this is
particularly useful when data ﬂow is not explicit, such as when
a fit call (labeled 6) must precede a predict call (labeled 7)
for the sklearn library.

We discuss the data ﬂow shown in Figure 6 in more detail to
provide an intuition of assumptions we made in our modeling to
allow scalability to millions of programs. This ﬁgure is a subset

4

Figure 6: Dataﬂow graph for the running example

of the actual model, but we show all the key relations at least
once. This graph shows two key relations that capture the ﬂow
through the code:

ﬂowsTo (blue edges) captures the notion of data ﬂow from one
node to another, abstracting away details like argument
numbers or names.

immediatelyPrecedes (green edges) captures code order.

In Figure 6, nodes are labeled with numbers corresponding to
the right hand side of Figure 6, and the nodes are connected
with edges that indicate control- and data-ﬂow, as well as other
properties. Node 1 in Figure 6 corresponds to the execution
of read_csv. Our graph captures arguments, which are the
ﬁlename and the low_memory option. Since these are literals,
the edges are in some sense backwards with respect to dataﬂow,
since RDF does not allow edges from literals.

Node 2 corresponds to the where call, so it has both
immediatelyPrecedes and flowsTo edges from node 1,
since it follows 1 in program order and gets data from it. The
flowsTo edge is annotated with a hasOrdinalPosition edge
to 0, indicating it is the receiver of the where call2.

Node 3 for test_train_split is similarly related to node 2:
it follows in program order, but data is passed as argument 1,
so it is actually the ﬁrst parameter to test_train_split. The
call to test_train_split returns a tuple, which is split into
train and test. This is captured in the ﬁrst boxes labeled
4a,b, which have labels denoting which value they receive.

Then, in the code, each of train and test are split into their X
and Y components for learning, which is shown in the italicized
4a,b. The train node is 4a which is used for fit, and test
4b node shows the read from Dataset. The 4b nodes ﬂow to
the predict call; the X ﬁeld is a slice and so does not have a
speciﬁc ﬁeld. Note that this example does not have dataﬂow
directly from fit to predict, but this graph also captures the

2In other words, its the object on which the call is made.

pandas.read_csvpandas.read_csv.where3sklearn.model_selection.train_test_splitsklearn.svm.SVC6sklearn.svm.SVC.ﬁtsklearn.svm.SVC.predictrdfs:labelsio:immediatelyPrecedesgraph4code:ﬂowsTograph4code:reads14a257Dataset4a4b4bsio:hasInput123445670…/input/indian_liver_patient.csv1False1low_memory10rdf:Aboutsio:namesio:hasOrdinalPositionordering constraint between them as shown in Figure 6. Nodes
5,6,7 similarly show control- and data-ﬂow of the use of SVC.

languages, and so any extension to a new language requires
language speciﬁc code for this part.

Figure 7 shows the schema of each node in the analysis graph.
Apart from edges described in the running example, each node
comes with a deﬁnition of corresponding sourceLocation in
the original code, its value_names which describes the local
variables that a corresponding call got written to, in case an
application needs it, whether the node reﬂects an import call, if
the node reads from or writes to some object returned by a
speciﬁc call.

This step yielded 6.3M pieces of documentation for functions,
classes and methods in 2300+ modules (introspection of each
module brought in its dependencies). The extracted documen-
tation is added to our code knowledge graph where, for each
class or function, we store its documentation string, base classes,
parameter names and types, return types and so on. An example
of such extracted information is shown in Figure 4. The full
RDF version of this 6.3M edges graph is available in Graph-
Gen4Code’s website.

5

4.2 Extraction of StackOverﬂow and StackExchange Posts

User forums such as Stackoverﬂow4 provide a lot of information
in the form of questions and answers about code. Moreover,
user votes on questions and answers can indicate the value of the
question and the correctness of the answer. While Stackoverﬂow
is geared towards programming, StackExchange5 provides a
network of sites around many other topics such as data science,
statistics, mathematics, and artiﬁcial intelligence.

To further enrich our knowledge graph with natural language
posts about code and other documentation, we linked each func-
tion, class and method to its relevant posts in Stackoverﬂow and
StackExchange. In particular, we extracted 45M posts (ques-
tion and answers) from StackOverﬂow and 2.7M posts from
StackExchange in Statistical Analysis, Artiﬁcial Intelligence,
Mathematics and Data Science forums. Each question is linked
to all its answers and to all its metadata information like tags,
votes, comments, codes, etc.

We then built an elastic search index across these sources, where
each document is a single question with all its answers. The
documents were indexed using a custom analyzer tailored for
natural language as well as code snippets. Then, for each func-
tion, class and method, we perform a multi-match search6 over
this index to retrieve the most relevant posts (a limit of 5K
matches per query is imposed) and link it to the corresponding
node in the knowledge graph. This step generalizes nicely across
languages since all we do here is gear the analyzer and search
queries to the idiosyncracies of code. Figure 3 shows an exam-
ple of how these information is structured in GraphGen4Code
and how it links to docstrings and code analysis through label
(green) nodes. The full RDF version of this graph can be found
in https://wala.github.io/graph4code/.

With this extraction and linking mechanism, one can leverage
the plethora of links we have from posts to diﬀerent classes
for code recommendation. For example, the post in Figure 1
discusses the usage of sklearn.SVC class for a machine learning
problem. Similarly, the post https://stackoverflow.com/
questions/33840569/ talks about sklearn.SVC and how it
suﬀers from memory issues when handling larger datasets. It
also mentions linear_model.SGDClassiﬁer as a solution to this
problem. With GraphGen4Code, the two posts will have a link
to sklearn.SVC while the second post will have an extra link

4https://stackoverflow.com/
5https://data.stackexchange.com/
6https://github.com/wala/graph4code/blob/master/

Figure 7: Code Analysis Schema

3.2 Extraction of Python Files from GitHub
To test the scalability of GraphGen4Code, we ran the toolkit on
1.38 million code ﬁles from GitHub. To extract this dataset, we
ran a SQL query on Google BigQuery dataset3. The query looks
for all Python ﬁles and Python notebooks from repositories that
had at least two watch events associated with it, and excludes
large ﬁles. Duplicate ﬁles were eliminated, where a duplicate
was deﬁned as having the same MD5 hash as another ﬁle in
the dataset. All the ﬁles were then analyzed to produce data
ﬂow and control ﬂow graphs for each script. For each script to
provide maximal coverage of the code, we added entry points
for each deﬁned function in each script, as well as the main
body.

4 Linking Code to Documentation and Forum

Posts

4.1 Extracting Documentation into the Graph

To generate documentation for all functions and classes used
in the 1.3 million ﬁles, we ﬁrst processed from the analysis
step above all the import statements to gather popular libraries
(libraries with more than 1000 imports across ﬁles). 506 such
libraries were identiﬁed, of which many were part of Python
language itself.

For these libraries, we used Python introspection techniques
to created a virtual environment, install the library, and used
inspect to gather the documentation. Clearly this step is lan-
guage speciﬁc - the toolkit code currently only has code to
perform extraction from Python code. However, we note that
extraction of documentation for code is supported in multiple

3https://github.com/wala/graph4code/blob/master/

extraction_queries/bigquery.sql

extraction_queries/elastic_search.q

sourceLinesimmediatelyProceedsflowsToaboutreadwritevalueNamessourceLocationfirstCollastOffsetlastColfirstOffsetfirstLineImportedtypehasOrdinalPositionhasInputhasOrdinalPositionnameDocstrings
Web Forums Links
Static Analysis Links

Functions(K) Classes(K) Methods(K)
257
88
2,132

5,809
742
959

278
106
4,230

Table 1: Number of functions, classes and methods in docstrings
and the links connected to them from user forums and static
analysis. This results in a knowledge graph with 2.09 billion
edges in total

select ?doc ?param ?return where {
graph <http://purl.org/twc/graph4code/docstrings>

6

?s

rdfs:label
skos:definition

"pandas.read_csv" ;
?doc .

optional { ?s graph4code:param
optional { ?s graph4code:return

?param . }
?return . }

{

}

}

to linear_model.SGDClassiﬁer which one could use for code
recommendation.

4.3 Extracting Class Hierarchies

In addition to the documentation of pandas.read_csv, we
can also get the forum posts that mention this function by ap-
pending the following to the query above. This will return all
questions in StackOverﬂow and StackExchange forums about
pandas.read_csv along with its answers.

As in the case of extracting documentation embedded in code,
extraction of class hierarchies was based on Python introspection
of the 2300+ modules. For example, the below triples list some
of the subclasses of BaseSVC:

graph ?g2 {
?ques

schema:about
schema:name
schema:suggestedAnswer

?s ;
?q_title ;
?a .

py:sklearn.svm.SVC rdfs:subClassOf

py:sklearn.svm._base.BaseSVC .

?a sioc:content ?answer.

}

py:sklearn.svm.NuSVC rdfs:subClassOf

py:sklearn.svm._base.BaseSVC .

This step again like the extraction of documentation need some
customization for each new language that GraphGen4Code can
support over time.

5 Extracted Code Knowledge Graph: Properties

and Uses

5.1 Graph Statistics

Table 1 shows the number of unique methods, classes, and
functions in docstrings for our sample extraction (embedded
documentation in code). These correspond to all documentation
pieces we found embedded in the code ﬁles or obtained through
introspection. Overall, we extracted documentation for 278K
functions, 257K classes and 5.8M methods. Table 1 also shows
the number of links made from other sources to docstrings doc-
umentation. Static analysis of the 1.3M code ﬁles created a
total of 7.3M links (4.2M functions, 2.1M class and 959K meth-
ods). We also created links to web forums in Stackoverﬂow and
StackExchange: GraphGen4Code has currently 106K, 88K and
742K links from web forums to functions, classes and methods,
respectively. This results in a knowledge graph with a total of
2.09 billion edges; 75M triples from docstrings, 246M from web
forums and 1.77 billion from static analysis.

5.2 Querying RDF output of GraphGen4Code

This section shows basic queries for retrieving information from
RDF generated by GraphGen4Code again purely for illustrative
purposes on what is represented in the code graph.

The ﬁrst query returns the documentation of a class or function,
in this case pandas.read_csv. It also returns parameter and
return types, when known. One can expand these parameters
(?param) further to get their labels, documentation, inferred
types, and check if they are optional.

Another use of a code knowledge graph produced by Graph-
Gen4Code is to understand how people use functions such as
pandas.read_csv. In particular, the query below shows when
pandas.read_csv is used, what are the fit functions that are
typically applied on its output.

select distinct ?label where {

graph ?g {
?read
?fit
?read
?fit

rdfs:label
schema:about
graph4code:flowsTo+ ?fit .
rdfs:label

?label .

"pandas.read_csv" .
"fit" .

}

}

5.3 Assessing the Quality of the Sample Extraction

To assess the validity of the control ﬂow and data ﬂow graphs
produced by GraphGen4Code with the speciﬁc additions we
made to WALA to analyze a large number of Python programs,
we analyzed the ASTs of 441 Python programs. The graphs
produced by WALA abstract away variables, and track the ﬂow
of objects through function calls. Therefore, we wanted to assess
to what degree WALA captures function calls present in the
program code in its analysis graphs. For the ASTs, we recorded
all the locations of call nodes in the program code, because
they record function calls in the program. For these call nodes,
we tracked whether the speciﬁc call was covered in our WALA
graphs, at the same source location. Across 441 programs,
WALA generated dataﬂow and control ﬂow graphs that covered
an average of 86% of calls (standard deviation was 13%). Given
that static analysis is neither sound nor complete [28], the graphs
seem to capture most of the calls.
We also wanted to assess the quality of the links Graph-
Gen4Code produced for forum posts7. To do so, we extracted a

7There was less need to assess the quality of documentation since

that was generated by Python introspection techniques

sample of 100 links between classes, functions and methods and
their associated forum posts. We then asked two human annota-
tors to judge the quality of these links as being relevant or not. A
relevant link would mandate that the post is discussing the same
exact module, class, and function, otherwise it is considered
irrelevant. The two annotators had a 100% agreement and both
measured a 79% linking accuracy. Analyzing the irrelevant links
showed that it typically happens across languages where the
same class appears in multiple languages or in generic classes
or builtin types. Examples of such cases include like Formatter
and AssertionError classes in Python and Java respectively.

6 Related Work
To our knowledge, there is no comprehensive knowledge graph
for code that integrates semantic analysis of code along with
textual artifacts about code. Here we review related work around
issues of how code has been typically represented in the liter-
ature, what sorts of datasets have been available for code, and
ontologies or semantic models for code.

6.1 Code Representation

A vast majority of work in the literature has used either tokens
or abstract syntax trees as input representations of code (see
[4] for a comprehensive survey on the topic). When these in-
put code representations are used for a speciﬁc application, the
target is usually a distributed representation of code (see again
[4] for a breakdown of prior work), with a few that build var-
ious types of probabilistic graphical models from code. Few
works have used data and control ﬂow based representations of
code as input to drive various applications. As an example, [21]
used a program dependence graph to detect code duplication
on Javascript programs, but the dependence is computed in an
intra-procedural manner. Similarly, [5] augments an AST based
representation of code along with local data ﬂow and control
ﬂow edges to predict variable names or ﬁnd the misuse of vari-
ables in code. [18] combines token based representations of
code with edges based on object uses, and AST nodes to predict
the documentation of a method. [10, 31] includes partial object
use information from WALA for code completion tasks, but the
primary abstraction in that work is (a) a vector representation
of APIs for Java SWT, that they used in machine learning al-
gorithms such as best matching neighbors to ﬁnd the next best
API for completion [10], or (b) as a Bayesian network which
reﬂects the likelihood of a speciﬁc method call given the other
method calls that have been observed [31]. [29, 30] employs
a mostly intra-procedural analysis to mine a large number of
graphs augmented with control and data ﬂow, for the purposes
of code completion for Java API calls. This work is interesting
because, like us, [29] it creates a large program graph database
which models dependencies between parent and child graphs,
from which a Bayesian model is constructed to predict the next
set of API calls based on the current one.

Our work can be distinguished from prior work in this area
in two key ways: (a) our work targets inter-procedural data
and control ﬂow, in the presence of ﬁrst class functions and no
typing, to create a more comprehensive representation of code,
and (b) we use this representation to drive the construction of a
multi-purpose knowledge graph of code that is connected to its
textual artifacts.

7

6.2 Code Datasets
Several research eﬀorts started recently to focus on using
machine learning for code summarization [3, 23, 7], code
search [22] and models such as CodeBERT [17]. The datasets
used by these approaches tend to be code- and task-speciﬁc. To
the best of our knowledge, there is no work that tries to build
a general knowledge graph for code and we believe that these
approaches can directly beneﬁt from GraphGen4Code. We,
however, leave this for future work.

6.3

Semantic Models of Code

SemanGit [25] is a linked data version based on Github activi-
ties. Unlike GraphGen4Code, SemanGit focus on modeling user
activities on Github and not on understanding the code itself as
in GraphGen4Code. CodeOntology [8] in an ontology designed
for modeling code written in Java. The ontology is similar to
ours when it comes to modeling relationships among classes
and methods. A crucial diﬀerence, however, is how the code
itself is parsed and hence how it gets modeled. CodeOntology’s
parser relies on Abstract Syntax Trees (AST) for understanding
the semantics of the code while GraphGen4Code represents
programs as data ﬂow and control ﬂow which is crucial because
programs that behave similarly can look arbitrarily diﬀerent at
a token or AST level due to syntactic structure or choices of
variable names. [24] proposed an approach for learning ontol-
ogy from Java code using Hidden Markov Models. Unlike this
approach, GraphGen4Code relies on a standard static analysis
library (WALA) for code understanding which is then modeled
using our ontology proposed earlier. [11] aims to construct
knowledge graph of scientiﬁc concepts expressed in text books
to link it to code artifacts such as function or variable names. In
their work, text sentences are converted into triples and linked
to source code based on token matches. This is diﬀerent from
GraphGen4Code’s approach where the focus is on modeling
control and data ﬂow of code and then linking classes and meth-
ods to their documentation. Augmenting GraphGen4Code with
an approach speciﬁed in [11] is an interesting idea for future
work.

References

[1] Ibrahim Abdelaziz, Srinivas Ravishankar, Pavan Kapani-
pathi, Salim Roukos, and Alexander Gray. 2021. A seman-
tic parsing and reasoning-based approach to knowledge
base question answering. In Proceedings of the AAAI Con-
ference on Artiﬁcial Intelligence, Vol. 35. 15985–15987.

[2] Ibrahim Abdelaziz, Kavitha Srinivas, Julian Dolby, and
James McCusker. 2020. A Demonstration of CodeBreaker:
A Machine Interpretable Knowledge Graph for Code. In
Proceedings of the 19th International Semantic Web Con-
ference (ISWC2020) (Demonstration Track).

[3] Wasi Uddin Ahmad, Saikat Chakraborty, Baishakhi Ray,
and Kai-Wei Chang. 2020. A Transformer-based Ap-
proach for Source Code Summarization. arXiv preprint
arXiv:2005.00653 (2020).

[4] Miltiadis Allamanis, Earl T. Barr, Premkumar Devanbu,
and Charles Sutton. 2018. A Survey of Machine Learning
for Big Code and Naturalness. ACM Comput. Surv. 51,

8

4, Article 81 (July 2018), 37 pages. https://doi.org/
10.1145/3212695

[5] Miltiadis Allamanis, Marc Brockschmidt, and Mahmoud
Khademi. 2018. Learning to Represent Programs with
Graphs. In ICLR. OpenReview.net.

[6] Uri Alon, Omer Levy, and Eran Yahav. 2019. code2seq:
Generating Sequences from Structured Representations
of Code. In International Conference on Learning Rep-
resentations. https://openreview.net/forum?id=
H1gKYo09tX

[7] Uri Alon, Meital Zilberstein, Omer Levy, and Eran Yahav.
2019. Code2Vec: Learning Distributed Representations
of Code. Proc. ACM Program. Lang. 3, POPL, Article
40 (Jan. 2019), 29 pages. https://doi.org/10.1145/
3290353

[8] Mattia Atzeni and Maurizio Atzori. 2017. CodeOntology:
RDF-ization of source code. In International Semantic
Web Conference. Springer, 20–28.

[9] Kurt Bollacker, Colin Evans, Praveen Paritosh, Tim Sturge,
and Jamie Taylor. 2008. Freebase: a collaboratively created
graph database for structuring human knowledge. In In
SIGMOD Conference. 1247–1250.

[10] Marcel Bruch, Martin Monperrus, and Mira Mezini. 2009.
Learning from Examples to Improve Code Completion
Systems. In Proceedings of the the 7th Joint Meeting of the
European Software Engineering Conference and the ACM
SIGSOFT Symposium on The Foundations of Software
Engineering (Amsterdam, The Netherlands) (ESEC/FSE
’09). ACM, New York, NY, USA, 213–222. https://
doi.org/10.1145/1595696.1595728

[11] Kun Cao and James Fairbanks. 2019. Unsupervised Con-
struction of Knowledge Graphs From Text and Code. arXiv
preprint arXiv:1908.09354 (2019).

[12] Andrew Carlson, Justin Betteridge, Bryan Kisiel, Burr
Settles, Estevam R. Hruschka, Jr., and Tom M. Mitchell.
2010. Toward an Architecture for Never-ending Lan-
guage Learning. In Proceedings of the Twenty-Fourth AAAI
Conference on Artiﬁcial Intelligence (Atlanta, Georgia)
(AAAI’10). AAAI Press, 1306–1313. http://dl.acm.
org/citation.cfm?id=2898607.2898816

[13] Rose Catherine and William Cohen. 2016. Personalized
recommendations using knowledge graphs: A probabilistic
logic programming approach. In Proceedings of the 10th
ACM Conference on Recommender Systems. ACM, 325–
332.

[14] Laura Dietz, Alexander Kotov, and Edgar Meij. 2018.
Utilizing knowledge graphs for text-centric information
retrieval. In The 41st International ACM SIGIR Confer-
ence on Research & Development in Information Retrieval.
ACM, 1387–1390.

[15] Julian Dolby, Avraham Shinnar, Allison Allain, and
Jenna M. Reinen. 2018. Ariadne: analysis for machine
learning programs. In Proceedings of the 2nd ACM SIG-
PLAN International Workshop on Machine Learning and
Programming Languages, MAPL@PLDI 2018, Philadel-
phia, PA, USA, June 18-22, 2018, Justin Gottschlich and
Alvin Cheung (Eds.). ACM, 1–10. https://doi.org/
10.1145/3211346.3211349

[16] Michel Dumontier, Christopher JO Baker, Joachim Baran,
Alison Callahan, Leonid Chepelev, José Cruz-Toledo,
Nicholas R Del Rio, Geraint Duck, Laura I Furlong,
Nichealla Keath, et al. 2014. The Semanticscience Inte-
grated Ontology (SIO) for biomedical research and knowl-
edge discovery. Journal of biomedical semantics 5, 1
(2014), 14.

[17] Zhangyin Feng, Daya Guo, Duyu Tang, Nan Duan, Xi-
aocheng Feng, Ming Gong, Linjun Shou, Bing Qin, Ting
Liu, Daxin Jiang, et al. 2020. Codebert: A pre-trained
model for programming and natural languages. arXiv
preprint arXiv:2002.08155 (2020).

[18] Patrick Fernandes, Miltiadis Allamanis, and Marc
Brockschmidt. 2018. Structured Neural Summarization.
CoRR abs/1811.01824 (2018).

[19] Jurgen Graf. 2010. Speeding Up Context-, Object- and
Field-Sensitive SDG Generation. In 2010 10th IEEE Work-
ing Conference on Source Code Analysis and Manipu-
lation. 105–114.
https://doi.org/10.1109/SCAM.
2010.9

[20] Larry Heck, Dilek Hakkani-Tür, and Gokhan Tur. 2013.
Leveraging knowledge graphs for web-scale unsupervised
semantic parsing. (2013).

[21] Chun-Hung Hsiao, Michael J. Cafarella, and Satish
Narayanasamy. 2014. Reducing MapReduce Abstrac-
tion Costs for Text-centric Applications. In 43rd Inter-
national Conference on Parallel Processing, ICPP 2014,
Minneapolis, MN, USA, September 9-12, 2014. 40–49.
https://doi.org/10.1109/ICPP.2014.13

[22] Hamel Husain, Ho-Hsiang Wu, Tiferet Gazit, Miltiadis
Allamanis, and Marc Brockschmidt. 2019. Codesearchnet
challenge: Evaluating the state of semantic code search.
arXiv preprint arXiv:1909.09436 (2019).

[23] Srinivasan Iyer, Ioannis Konstas, Alvin Cheung, and Luke
Zettlemoyer. 2016. Summarizing source code using a
neural attention model. In Proceedings of the 54th Annual
Meeting of the Association for Computational Linguistics
(Volume 1: Long Papers). 2073–2083.

[24] Azanzi Jiomekong, Gaoussou Camara, and Maurice
Tchuente. 2019. Extracting ontological knowledge from
Java source code using Hidden Markov Models. Open
Computer Science 9, 1 (2019), 181–199.

[25] Dennis Oliver Kubitza, Matthias Böckmann, and Damien
Graux. 2019. SemanGit: A linked dataset from git. In
International Semantic Web Conference. Springer, 215–
228.

[26] Sungho Lee, Julian Dolby, and Sukyoung Ryu. 2016. Hy-
briDroid: static analysis framework for Android hybrid
applications. In Proceedings of the 31st IEEE/ACM Inter-
national Conference on Automated Software Engineering,
ASE 2016, Singapore, September 3-7, 2016, David Lo,
Sven Apel, and Sarfraz Khurshid (Eds.). ACM, 250–261.
https://doi.org/10.1145/2970276.2970368

[27] Jens Lehmann, Robert Isele, Max Jakob, Anja Jentzsch,
Dimitris Kontokostas, Pablo N. Mendes, Sebastian Hell-
mann, Mohamed Morsey, Patrick van Kleef, Sören Auer,

9

knowledge in the science questions domain. In Proceed-
ings of the AAAI Conference on Artiﬁcial Intelligence,
Vol. 33. 7208–7215.

[37] Yinxing Xue, Zhenchang Xing, and Stan Jarzabek. 2011.
CloneDiﬀ: Semantic Diﬀerencing of Clones. In Proceed-
ings of the 5th International Workshop on Software Clones
(Waikiki, Honolulu, HI, USA) (IWSC ’11). Association
for Computing Machinery, New York, NY, USA, 83–84.
https://doi.org/10.1145/1985404.1985428

and Christian Bizer. 2015. DBpedia - A Large-scale, Mul-
tilingual Knowledge Base Extracted from Wikipedia. Se-
mantic Web Journal 6, 2 (2015), 167–195.
http://
jens-lehmann.org/files/2015/swj_dbpedia.pdf

[28] Benjamin Livshits, Manu Sridharan, Yannis Smaragdakis,
Ondˇrej Lhoták, J. Nelson Amaral, Bor-Yuh Evan Chang,
Samuel Z. Guyer, Uday P. Khedker, Anders Møller, and
Dimitrios Vardoulakis. 2015. In Defense of Soundiness:
A Manifesto. Commun. ACM 58, 2 (Jan. 2015), 44–46.
https://doi.org/10.1145/2644805

[29] Anh Tuan Nguyen and Tien N. Nguyen. 2015. Graph-
based Statistical Language Model for Code. In Proceed-
ings of the 37th International Conference on Software
Engineering - Volume 1 (Florence, Italy) (ICSE ’15). IEEE
Press, Piscataway, NJ, USA, 858–868. http://dl.acm.
org/citation.cfm?id=2818754.2818858

[30] Tung Thanh Nguyen, Hoan Anh Nguyen, Nam H. Pham,
Jafar M. Al-Kofahi, and Tien N. Nguyen. 2009. Graph-
based Mining of Multiple Object Usage Patterns. In Pro-
ceedings of the the 7th Joint Meeting of the European
Software Engineering Conference and the ACM SIGSOFT
Symposium on The Foundations of Software Engineering
(Amsterdam, The Netherlands) (ESEC/FSE ’09). ACM,
New York, NY, USA, 383–392. https://doi.org/10.
1145/1595696.1595767

[31] Sebastian Proksch, Johannes Lerch, and Mira Mezini.
2015. Intelligent Code Completion with Bayesian Net-
works. ACM Trans. Softw. Eng. Methodol. 25, 1, Article
3 (Dec. 2015), 31 pages. https://doi.org/10.1145/
2744200

[32] Manu Sridharan, Julian Dolby, Satish Chandra, Max
Schäfer, and Frank Tip. 2012. Correlation Tracking
for Points-To Analysis of JavaScript. In ECOOP 2012
- Object-Oriented Programming - 26th European Confer-
ence, Beijing, China, June 11-16, 2012. Proceedings (Lec-
ture Notes in Computer Science, Vol. 7313), James Noble
(Ed.). Springer, 435–458. https://doi.org/10.1007/
978-3-642-31057-7_20

[33] Fabian M. Suchanek, Gjergji Kasneci, and Gerhard
Weikum. 2007. Yago: A Core of Semantic Knowledge.
In Proceedings of the 16th International Conference on
World Wide Web (Banﬀ, Alberta, Canada) (WWW ’07).
ACM, New York, NY, USA, 697–706. https://doi.
org/10.1145/1242572.1242667

[34] Haitian Sun, Bhuwan Dhingra, Manzil Zaheer, Kathryn
Mazaitis, Ruslan Salakhutdinov, and William W Cohen.
2018. Open domain question answering using early
arXiv preprint
fusion of knowledge bases and text.
arXiv:1809.00782 (2018).

[35] Denny Vrandeˇci´c and Markus Krötzsch. 2014. Wikidata:
A Free Collaborative Knowledgebase. Commun. ACM 57,
10 (Sept. 2014), 78–85. https://doi.org/10.1145/
2629489

[36] Xiaoyan Wang, Pavan Kapanipathi, Ryan Musa, Mo Yu,
Kartik Talamadupula, Ibrahim Abdelaziz, Maria Chang,
Achille Fokoue, Bassem Makni, Nicholas Mattei, et al.
2019. Improving natural language inference using external
