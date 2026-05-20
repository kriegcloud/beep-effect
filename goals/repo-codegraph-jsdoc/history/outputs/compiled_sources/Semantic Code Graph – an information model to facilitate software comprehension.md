# Semantic Code Graph – an information model to facilitate software comprehension

Source: https://arxiv.org/html/2310.02128v2/#S1

Krzysztof Borowski AGH University of Krakow and VirtusLab, Virtus Lab Spolka z o.o., Poland (e-mail: kborowski@agh.edu.pl, kborowski@virtuslab.com)    Bartosz Balis Institute of Computer Science, AGH University of Krakow, Krakow, Poland (e-mail: balis@agh.edu.pl)    Tomasz Orzechowski R&D Department, Virtus Lab Spolka z o.o., Krakow, Poland (e-mail: torzechowski@virtuslab.com)

###### Abstract

Software comprehension can be extremely time-consuming due to the ever-growing size of codebases. Consequently, there is an increasing need to accelerate the code comprehension process to facilitate maintenance and reduce associated costs. A crucial aspect of this process is understanding and preserving the high quality of the code dependency structure. While a variety of code structure models already exist, there is a surprising lack of models that closely represent the source code and focus on software comprehension. As a result, there are no readily available and easy-to-use tools to assist with dependency comprehension, refactoring, and quality monitoring of code. To address this gap, we propose the Semantic Code Graph (SCG), an information model that offers a detailed abstract representation of code dependencies with a close relationship to the source code. We establish the critical properties of the SCG model and demonstrate its implementation for Java and Scala languages. To validate the SCG model’s usefulness in software comprehension, we compare it to nine other source code representation models. Additionally, we select 11 well-known and widely-used open-source projects developed in Java and Scala and perform a range of software comprehension activities on them using three different code representation models: the proposed SCG, the Call Graph, and the Class Collaboration Network. We then qualitatively analyze the results to compare the performance of these models in terms of software comprehension capabilities. These activities encompass project structure comprehension, identifying critical project entities, interactive visualization of code dependencies, and uncovering code similarities through software mining. Our findings demonstrate that the SCG enhances software comprehension capabilities compared to the prevailing Class Collaboration Network and Call Graph models. Moreover, the SCG-based data analysis yields actionable software comprehension insights. We also release an open-source tool, scg-cli, to assist with result reproduction and further research. We believe that the work described is a step towards the next generation of tools that streamline code dependency comprehension and management.

Keywords: Software Comprehension, Software Maintenance, Semantic Code Graph, Call Graph, Class Collaboration Network, Software Network, Java

## 1 Introduction

Software is becoming increasingly complex and larger, driven by fast-changing business requirements and advances in programming languages, libraries, and runtime infrastructure. At the same time, the quality of software architecture, especially in such a dynamic environment, deteriorates over time \[[20](/html/2310.02128v2/#bib.bib20)\], so programmers need to put growing amount of effort into understanding the source code \[[2](/html/2310.02128v2/#bib.bib2)\] in order to make required changes or introduce new features important from a product or service perspective.

Multiple measures are applied to facilitate software comprehension by both keeping the code clean and speeding up the code-understanding process. Performing code reviews \[[51](/html/2310.02128v2/#bib.bib51)\], following a written set of conventions \[[79](/html/2310.02128v2/#bib.bib79)\], measuring various software quality metrics \[[35](/html/2310.02128v2/#bib.bib35)\], or linting the source code \[[66](/html/2310.02128v2/#bib.bib66)\] (e.g. guarding against common anti-patterns) have a positive impact on written code quality. Additionally, Integrated Development Environments (IDEs) help programmers browse, read, comprehend, and maintain code efficiently through common IDE features such as syntax highlighting, code navigation, or advanced refactoring capabilities. Nevertheless, Xia at al. \[[91](/html/2310.02128v2/#bib.bib91)\] argue that up to 58 percent of software maintenance activities are related to software comprehension \[[78](/html/2310.02128v2/#bib.bib78), [81](/html/2310.02128v2/#bib.bib81)\] and claim that we need more advanced software comprehension tools. With the ever greater importance of software and rapidly growing code bases, even small reduction of time spent on software related activities will bring significant cost savings.

One of the major code comprehension challenges is understanding and managing dependencies of software entities. Understanding code dependencies may comprise finding key code entities\[[46](/html/2310.02128v2/#bib.bib46)\], localizing connected elements\[[2](/html/2310.02128v2/#bib.bib2), [3](/html/2310.02128v2/#bib.bib3)\], answering different reachability questions \[[42](/html/2310.02128v2/#bib.bib42)\], reasoning about entire software structure including software architecture understanding \[[75](/html/2310.02128v2/#bib.bib75), [47](/html/2310.02128v2/#bib.bib47), [21](/html/2310.02128v2/#bib.bib21)\]. Managing code dependencies denotes introducing required bug fixes or new features and, at the same time, guarding the project structure against decay signs, such as high coupling between modules or classes \[[19](/html/2310.02128v2/#bib.bib19)\], data abstraction coupling or message passing coupling \[[67](/html/2310.02128v2/#bib.bib67)\], forming god objects \[[87](/html/2310.02128v2/#bib.bib87)\], introducing unintended dependencies between code entities, etc. \[[9](/html/2310.02128v2/#bib.bib9)\]. Understanding and managing code dependencies is less time consuming if the source code structure is of high quality. To maintain a high quality code dependency structure, we can either prevent the erosion process or reorganize the already affected code \[[61](/html/2310.02128v2/#bib.bib61)\]. Preventing harmful dependencies requires constant code dependency and structure monitoring which, although important from a project cost and maintainability perspective, is not something widely applied. Quality metrics most frequently used in projects, e.g., cyclomatic complexity \[[50](/html/2310.02128v2/#bib.bib50)\] or Lines of Code, focus on a particular method or class and do not asses the quality of code dependency structure. Consequently, proper methods and tools are required to discover, understand, and improve the structure of existing code.

Regarding research on models for code dependency structure, there exists a body of work demonstrating the utility of software network analysis on various theoretical models \[[75](/html/2310.02128v2/#bib.bib75), [46](/html/2310.02128v2/#bib.bib46), [69](/html/2310.02128v2/#bib.bib69), [3](/html/2310.02128v2/#bib.bib3), [24](/html/2310.02128v2/#bib.bib24), [5](/html/2310.02128v2/#bib.bib5), [48](/html/2310.02128v2/#bib.bib48), [63](/html/2310.02128v2/#bib.bib63), [6](/html/2310.02128v2/#bib.bib6), [85](/html/2310.02128v2/#bib.bib85), [74](/html/2310.02128v2/#bib.bib74), [33](/html/2310.02128v2/#bib.bib33), [31](/html/2310.02128v2/#bib.bib31), [89](/html/2310.02128v2/#bib.bib89), [56](/html/2310.02128v2/#bib.bib56)\]. However, even in the case of widely researched models, such as Call Graph (CG) \[[72](/html/2310.02128v2/#bib.bib72), [42](/html/2310.02128v2/#bib.bib42), [39](/html/2310.02128v2/#bib.bib39), [28](/html/2310.02128v2/#bib.bib28), [3](/html/2310.02128v2/#bib.bib3)\] or Class Collaboration Network (CCN) \[[89](/html/2310.02128v2/#bib.bib89), [46](/html/2310.02128v2/#bib.bib46), [10](/html/2310.02128v2/#bib.bib10), [18](/html/2310.02128v2/#bib.bib18)\], the underlying implementations, developed by the researchers to extract and analyze these software models, are rarely published. Consequently, it is very difficult to reproduce the results or pursue further research in the code dependency comprehension field, especially leveraging new or commercial projects. Such a lack of high quality tools for extracting and analyzing the software dependency structure forces researchers to start from scratch every time. This not only hampers research and efforts, but also makes it impossible to effectively compare different results. Perhaps for this reason we have found no research devoted to comparative empirical evaluation of different code representation models. Furthermore, due to the low emphasis on the practical aspects of previously conducted research, there is little to no impact on software comprehension from the code dependency angle in the commercial software development process. We argue that this is mostly due to the lack of high-quality and well-established stable abstract code dependency model focused on practical usability aspects and, in consequence, tools leveraging such a model to speed up software comprehension and code refactoring process. Code dependency analysis should not only be confined to a theoretical level but, equally importantly, should be geared towards practical applications, reproduction of results, and further research.

To address the research gap between theoretical code dependency models and their applications, we present Semantic Code Graph (SCG), a code dependency information model which captures the structure and semantics of code dependencies in a software project while preserving the direct relation of the representation to the source code. The main objective of our research is to evaluate the effectiveness of the SCG for software comprehension activities. To this end, we formulate the following two research questions:

- •
  RQ1: Does the SCG model enhance software comprehension capabilities in comparison with the Class Collaboration Network and the Call Graph models?
- •
  RQ2: Does SCG-based data analysis enable actionable software comprehension insights?

To asses the theoretical suitability of the SCG model in software comprehension, we are comparing it to nine other source code representation models. Then, we conduct an empirical study involving eleven popular open source projects. We utilize these models to comprehend project structures, identify critical project entities along with their dependencies, and uncover code similarities. We demonstrate that both CCN and CG can be effectively extracted from SCG model. Furthermore, while each of these models provides a distinct perspective on the project, the SCG stands out as the most comprehensive, enabling analyses that surpass the capabilities of the other two.

## The contributions of this work can be summarized as follows:

- •
  We define and describe the abstract Semantic Code Graph model and its concrete representations for Java and Scala languages. SCG for Java and Scala is able to describe various types of dependencies between software entities at different levels – from classes and methods, down to local value definitions and type declarations.
- •
  We define and implement SCG intermediate representation and storage format to facilitate code dependency data analysis with external tools and support effective model extraction for new languages.
- •
  We conduct an empirical analysis of the SCG model’s performance concerning its software comprehension capabilities in comparison to the CCN and CG, and qualitatively analyze its results.
- •
  To enable reproducibility and further research, we publish tools and data used in our research. These include the extracted SCG data for the eleven open-source projects used in the empirical study, and the open-source tool scg-cli ¹¹1[https://github.com/VirtusLab/scg-cli](https://github.com/VirtusLab/scg-cli). The tool is capable of extracting the SCG data for Java projects. It also supports SCG-based data analysis capabilities, and exporting SCG data for usage in external analysis tools, such as Jupyter Notebook or Gephi.

The remainder of this paper is structured as follows. Section [2](/html/2310.02128v2/#S2 "2 Related work ‣ Semantic Code Graph – an information model to facilitate software comprehension") presents related work. Section [3](/html/2310.02128v2/#S3 "3 Semantic Code Graph ‣ Semantic Code Graph – an information model to facilitate software comprehension") discusses model requirements and presents SCG formal definition with details for Java and Scala languages. In section [4](/html/2310.02128v2/#S4 "4 Semantic Code Graph extraction process ‣ Semantic Code Graph – an information model to facilitate software comprehension"), details of the extraction process and the proposed SCG storage format are presented. In section [5](/html/2310.02128v2/#S5 "5 Software Comprehension capabilities: comparison of SCG and other graph-based code representations ‣ Semantic Code Graph – an information model to facilitate software comprehension") we conduct detailed comparison of SCG model to other established graph software representations. Section [6](/html/2310.02128v2/#S6 "6 Empirical Software Comprehension with Semantic Code Graph ‣ Semantic Code Graph – an information model to facilitate software comprehension") contains a comprehensive evaluation of the proposed approach by demonstrating diverse software comprehension activities for eleven open-source projects and answers research questions. Section [7](/html/2310.02128v2/#S7 "7 Impact of results ‣ Semantic Code Graph – an information model to facilitate software comprehension") present practical implications from our empirical study and section [8](/html/2310.02128v2/#S8 "8 Conclusions ‣ Semantic Code Graph – an information model to facilitate software comprehension") concludes the paper.

## 2 Related work

In this section we review related work, first focusing on existing code dependency representations and subsequently on tools capable of extracting and analyzing various code dependency models.

### 2.1 Code dependency representations

Early graph representations of programs were focused on program execution and dependencies between code segments. One of the first commonly analyzed code graph models is Control Flow Graph (CFG) \[[4](/html/2310.02128v2/#bib.bib4)\] – a directed graph where nodes are basic program blocks and edges represent control flow paths. CFG allows determining the exact execution order of a program including different program paths implied by control conditions (like if statements). CFG can be successfully applied to program analysis, such as finding unreachable code, compiler optimizations, code generation, code debugging and others \[[57](/html/2310.02128v2/#bib.bib57)\]. CFG focuses on block’s execution paths and does not represent dependencies on the statement level. To that end, Ferrante at al. \[[22](/html/2310.02128v2/#bib.bib22)\] introduced the concept of Program Dependence Graph (PDG) which focuses on single statement dependencies. In PDG code statements are represented as nodes, and edges express two main relations between them:

- •
  data dependency (execution of one statement requires data produced by another statement),
- •
  control flow (execution of one statement depends on a control condition evaluated by another statement).

Control dependencies in PDG are commonly extracted from the Control Flow graph but represent a dependency tree of statements rather than an exact execution path. The PDG was initially used in various code optimizations, such as parallelism detection \[[34](/html/2310.02128v2/#bib.bib34)\], code movement, or program slicing \[[83](/html/2310.02128v2/#bib.bib83)\]. This representation can also support program comprehension and maintenance by depicting statement dependency trees in order to assess change impact \[[1](/html/2310.02128v2/#bib.bib1)\], find code similarities \[[40](/html/2310.02128v2/#bib.bib40), [38](/html/2310.02128v2/#bib.bib38), [52](/html/2310.02128v2/#bib.bib52), [94](/html/2310.02128v2/#bib.bib94)\], measure code coverage, or reduce the test set for programs. Another graph-based code model that combines the Control Flow Graph (CFG) and Program Dependence Graph (PDG), along with an Abstract Syntax Tree, is known as the Code Property Graph (CPG) \[[92](/html/2310.02128v2/#bib.bib92)\]. This comprehensive model has been effectively employed in the detection of various vulnerabilities \[[8](/html/2310.02128v2/#bib.bib8), [82](/html/2310.02128v2/#bib.bib82)\].

Program Dependence Graph, Control Flow Graph and derivative Code Property Graph, are limited to monolithic programs which means that analysis cannot cross the boundary of procedures. To overcome this drawback, Horwitz et al. \[[29](/html/2310.02128v2/#bib.bib29)\] introduced the System Dependence Graph (SDG), augmenting the previous PDG model with edges representing dependencies between a call site and the called procedure, along with handling passed values via "procedure linkages." Tracking values is not trivial to represent as a graph and requires defining several new abstract vertices \[[53](/html/2310.02128v2/#bib.bib53)\]. The SDG allows for interprocedural code analysis, such as interprocedural slicing \[[29](/html/2310.02128v2/#bib.bib29)\] or test case generation \[[36](/html/2310.02128v2/#bib.bib36)\].

Over the years, object-oriented programming and other high-level programming languages have been popularized. Object-oriented programming introduced new concepts such as classes, methods, inheritance, and related abstract dependencies that are not represented in the basic System Dependence Graph. Researchers attempted to address this issue through SDG model extensions, as presented by Walkinshaw et al. \[[88](/html/2310.02128v2/#bib.bib88)\] in the Java System Dependence Graph (JSysDG). JSysDG is a multigraph that represents both the structure of the program (method headers, classes, interfaces, and packages) and program behavior through SDG. Later, JSysDG was extended with object-flow dependence by Galindo et al. \[[24](/html/2310.02128v2/#bib.bib24)\] to better facilitate program slicing. Shu et al. \[[77](/html/2310.02128v2/#bib.bib77)\] proposed a practical implementation of the JSysDG model in JavaPDG—a platform for program dependence analysis along with a graphical viewer. However, the software solution was not open-sourced, and it is currently impossible to find and use it for pursuing new software dependency research. It is also worth mentioning that JSysDG builds on a similar concept to the Java Software Dependence Graph researched by Zhao \[[95](/html/2310.02128v2/#bib.bib95)\].

Arora et al. \[[7](/html/2310.02128v2/#bib.bib7)\] summarize various variations of Control Flow Graphs and Program Dependence Graphs. These models primarily aim to represent program execution flow or statement dependencies. The structure of the program, including abstract code elements like classes, is added on top of these graphs to facilitate more detailed program execution analysis and adapt to higher-level programming languages. This implies that software is analyzed at a very detailed level of statements, with a focus on understanding and optimizing program execution. However, for programmer, this level of detail may not be as critical with modern languages. Many sophisticated optimizations are handled directly by compilers or interpreters, reducing the programmer’s responsibility. Moreover, modern languages operate at higher abstraction levels, introducing abstract components and focusing on language expressiveness, better ways of structuring growing software, enabling component reuse, facilitating implementation replacements, and simplifying local refactoring activities. This shift in focus towards higher abstraction levels allows for faster program development, reduces the occurrence of certain errors, and enhances maintainability. Changing requirements, increasing software criticality, and the significant growth in codebase sizes have driven research efforts towards software structure comprehension and maintainability. The aim is to reduce the time and cost associated with software development.

The Call Graph \[[72](/html/2310.02128v2/#bib.bib72)\] is another popular approach wherein the graph of caller-callee relationships is extracted from the source code. The main goal of the Call Graph is to support static and dynamic analysis of the code call dependency flow without concerning the detailed code structure. Grove et al. \[[26](/html/2310.02128v2/#bib.bib26)\] distinguish two types of the Call Graph – the context-insensitive one, in which one node uniquely represents one procedure, and the context-sensitive one, in which each procedure call is represented as a separate node. For code navigation and depicting the graph structure, the context-insensitive approach is more natural, as each definition in the code has precisely one unique node representation, similar to the source code definition in the file. Various papers use call graphs for code analysis \[[42](/html/2310.02128v2/#bib.bib42), [39](/html/2310.02128v2/#bib.bib39), [28](/html/2310.02128v2/#bib.bib28), [3](/html/2310.02128v2/#bib.bib3)\]. Although proven useful, the Call Graph is not a complete representation of the code dependencies as it contains only information about chains of calls.

Software networks, also referred to as Artifact Dependency Graphs (ADG) \[[32](/html/2310.02128v2/#bib.bib32)\], software collaboration graphs \[[56](/html/2310.02128v2/#bib.bib56)\], or software architecture graphs \[[33](/html/2310.02128v2/#bib.bib33)\], are general terms for abstract source code models that focus on code entities and their dependencies. They are not intended to depict program execution but rather to describe the abstract graph model of the program’s structure and dependencies. Myers \[[56](/html/2310.02128v2/#bib.bib56)\] demonstrates that such graphs form scale-free, small-world networks and can be analyzed using a set of algorithms and metrics known from other complex network analyses \[[33](/html/2310.02128v2/#bib.bib33), [25](/html/2310.02128v2/#bib.bib25)\].

For object-oriented programming languages, software networks can consist of multiple levels of networks, such as file-level, package-level, class-level, or function-level collaboration networks \[[74](/html/2310.02128v2/#bib.bib74)\]. The Class Collaboration Network (CCN) is particularly interesting to analyze \[[89](/html/2310.02128v2/#bib.bib89), [46](/html/2310.02128v2/#bib.bib46), [10](/html/2310.02128v2/#bib.bib10), [18](/html/2310.02128v2/#bib.bib18)\] because classes are the main building blocks in OOP. Arora and Goel \[[5](/html/2310.02128v2/#bib.bib5), [6](/html/2310.02128v2/#bib.bib6)\] proposed JavaRelationshipGraphs (JRG) — a software network model specialized for the Java language. JRG is a directed graph that captures various relations between different code elements in Java programs. In this graph, nodes represent packages, classes, interfaces, methods, attributes, and edges represent class extensions, implementations and aggregations, imports, ownership, and method calls. There is not one definitive guide on how to create such a software network for a particular language, but there is an attempt made by Savic et al. \[[74](/html/2310.02128v2/#bib.bib74)\] to create a language-independent model of dependencies between source code entities and establish a General Dependency Network (GDN). While this is a promising direction, it may miss some language-specific details and GDN is extracted from yet another custom model — the extended abstract syntax tree (eCST), which complicates model adoption and potential implementations.

Software networks are extensively used to facilitate software comprehension and maintenance through software architecture recovery \[[75](/html/2310.02128v2/#bib.bib75), [48](/html/2310.02128v2/#bib.bib48)\], finding key entities \[[54](/html/2310.02128v2/#bib.bib54), [62](/html/2310.02128v2/#bib.bib62), [46](/html/2310.02128v2/#bib.bib46), [18](/html/2310.02128v2/#bib.bib18)\], code modularization \[[80](/html/2310.02128v2/#bib.bib80), [32](/html/2310.02128v2/#bib.bib32), [65](/html/2310.02128v2/#bib.bib65)\], finding code similarities \[[84](/html/2310.02128v2/#bib.bib84)\], code visualization \[[49](/html/2310.02128v2/#bib.bib49), [64](/html/2310.02128v2/#bib.bib64), [13](/html/2310.02128v2/#bib.bib13)\], and tracking code evolution \[[11](/html/2310.02128v2/#bib.bib11)\].

### 2.2 Tools for extracting and analyzing code dependencies

To leverage the progress made in software comprehension research related to program graph representation, the utilization of readily available code dependency graph representation tools is essential. Furthermore, to facilitate ongoing research and establish persuasive comparisons, the importance of publicly accessible graph extraction solutions is crucial. These solutions should export graph models in an easily digestible intermediate data representation. It is rather surprising that, even for widely used languages such as Java, a shortage of such tools is evident. For the Java language, Scoot \[[86](/html/2310.02128v2/#bib.bib86), [41](/html/2310.02128v2/#bib.bib41)\], and its successor SootUp²²2[https://soot-oss.github.io/SootUp/](https://soot-oss.github.io/SootUp/), although primarily created for introducing bytecode optimizations, can generate Control Flow Graphs (for particular methods or classes) and extract Call Graphs for the project through the Java API.

JDepend³³3[https://github.com/clarkware/jdepend](https://github.com/clarkware/jdepend) can generate predefined design quality metrics, but it does not expose an internal model that could be used for other software comprehension activities.

Dependency Finder⁴⁴4[https://depfind.sourceforge.io/](https://depfind.sourceforge.io/) can find and export Java simplified dependencies from bytecode representation, but it can only extract three types of dependencies: class-to-class, feature-to-class, and class-to-feature (where feature represents everything but a class). Dependency Finder can export dependencies to TXT or XML format. However, aside from the fully qualified name of the entity, no other details are stored in this model.

jdeps⁵⁵5[https://docs.oracle.com/en/java/javase/11/tools/jdeps.html](https://docs.oracle.com/en/java/javase/11/tools/jdeps.html) is another tool capable of presenting Java dependencies extracted from bytecode. However, these dependencies are limited to only package and class levels and do not consider other code entities or precise relations between them.

Scitools Understand⁶⁶6[https://scitools.com/](https://scitools.com/) allows for various static code analyses, code dependency visualization, and advanced code browsing. However, Scitools Understand is a paid tool for commercial usage and can only export basic class-level and file-level software networks.

Code Compass \[[64](/html/2310.02128v2/#bib.bib64)\] is an open-source LLVM/Clang-based tool developed to augment the understanding of large legacy systems. It supports call graph and class collaboration networks visualization and has some browsing capabilities but does not support any software network export capabilities.

Wheeldon and Counsell \[[89](/html/2310.02128v2/#bib.bib89)\] in their work extract a detailed class collaboration network with AutoCode software, but its actual implementation is not available.

Based on our current knowledge, there is no publicly available and free to use tool to extract a rich System Dependence Graph or Software Network Graph for the Java or Scala languages.

Additionally we conduct a detailed comparison of existing model with SCG in section [5](/html/2310.02128v2/#S5 "5 Software Comprehension capabilities: comparison of SCG and other graph-based code representations ‣ Semantic Code Graph – an information model to facilitate software comprehension"). We also point out in details shortcomings of existing models from the software comprehension perspective. To the best of our knowledge, there has been no comparative study focusing on graph code representations in the context of software comprehension.

## 3 Semantic Code Graph

### 3.1 Source code dependency model requirements

The goal of the Semantic Code Graph information model is to preserve the direct relation to the source code (syntax) while also capturing the meaning (semantics) of the source code elements and dependencies between them. An information model that meets such requirements will facilitate source code analysis in various areas. Here we particularly focus on three of them:

- •
  Software comprehension, e.g., learning code structure by interactive code visualization and browsing, applying data analysis to find the most important code elements, answering reachability questions \[[42](/html/2310.02128v2/#bib.bib42)\], or facilitating semantic code search \[[30](/html/2310.02128v2/#bib.bib30)\].
- •
  Software quality assessment, e.g., measuring software metrics through graph properties \[[21](/html/2310.02128v2/#bib.bib21), [33](/html/2310.02128v2/#bib.bib33), [70](/html/2310.02128v2/#bib.bib70), [66](/html/2310.02128v2/#bib.bib66)\].
- •
  Software refactoring, e.g., supporting software modularization through suggested code partitioning, suggesting method movements, or code structure improvements \[[19](/html/2310.02128v2/#bib.bib19), [61](/html/2310.02128v2/#bib.bib61), [16](/html/2310.02128v2/#bib.bib16)\].

The important ‘direct relation to source code’ requirement simply denotes that the entities seen by the developer while working with the source code are represented in the model as closely as possible. Consequently, the SCG model should be extracted either directly from the source code, or another representation that closely matches the source code, e.g. the Abstract Syntax Tree (AST). Extraction from an intermediate representation, such as bytecode – while tempting for various reasons – would not be appropriate since such a representation contains entities generated by the compiler (see section [4.5](/html/2310.02128v2/#S4.SS5 "4.5 Challenges in extracting SCG from Bytecode ‣ 4 Semantic Code Graph extraction process ‣ Semantic Code Graph – an information model to facilitate software comprehension") for more in-depth analysis of this). Moreover, all entities and relations between entities should have the location property associated with them. This is a crucial property for building interactive visualization, or for pointing the developer to the exact place in the source code when performing static analysis or preparing any potential code manipulations. Any advice presented by a tool – like presenting visual structure, found problems, extracted knowledge, or improvement suggestions – should always precisely point the user to an appropriate place in the source code.

In addition, each extracted entity and relation should retain as much semantic information as possible. For example, an entity representing a method should also contain its scope (private, public), modifiers (abstract, override, etc.), the number of arguments and their types, return types, etc. This will allow for precise, close-to-source-code model analysis focused on dependencies between source code entities, at the same time leveraging most of details available in the AST code representation.

### 3.2 Semantic Code Graph base model

Semantic Code Graph (SCG) is a source code information model aimed at representing diverse dependencies present in the source code, with the objective of fulfilling the requirements outlined in Section [3.1](/html/2310.02128v2/#S3.SS1 "3.1 Source code dependency model requirements ‣ 3 Semantic Code Graph ‣ Semantic Code Graph – an information model to facilitate software comprehension"). The SCG data structure is a graph where nodes denote code declarations and definitions, while the edges represent various dependencies between them. The SCG is formally defined as a pair $`G_{SCG} = {(V_{D},E_{R})}`$ comprising:

- •
  $`V_{D} = {\{ v_{1},v_{2},\ldots,v_{n}\}}`$, a set of vertices (nodes), where $`v_{i}`$ represents a code entity of type CLASS, OBJECT, TRAIT, INTERFACE, METHOD, PARAM, TYPE_PARAM, VALUE, VARIABLE, TYPE, ENUM. This list of node types is flexible and can be extended with other entities specific for given language; $`n`$ is the total number of entities;
- •
  $`E_{R} = {\{{(v_{i},v_{j})}\mid{{v_{i},v_{j}} \in V_{D}}\}}`$, a set of directed edges comprising ordered pairs of nodes, and representing relations between these nodes. The possible types of edges include CALL, DECLARATION, EXTEND, OVERRIDE, PARAMETER, RETURN_TYPE, TYPE_PARAMETER. Similar to nodes, new edge types can be added if required to capture specific code dependency relations occurring in a language.

The basic data structures of the SCG graph, as a foundation for diverse semantic information about source code dependencies, are rather simple. In particular, each node has to contain the following:

- •
  id – unique node identifier,
- •
  kind – type of the node (one of the node types mentioned in the $`V_{D}`$ definition above),
- •
  location – place in the source code where the entity represented by this node is defined,
- •
  displayName – node name meaningful to the end user,
- •
  edges – set of outgoing edges.

## The edges in the SCG graph are described by the following properties:

- •
  to – node identifier to which this edge is pointing to,
- •
  location – place in the source code where the relation represented by this edge can be observed,
- •
  type – the type of the edge (its label); type is one of the edge types mentioned in the $`E_{R}`$ definition above.

The location property has its own structure that provides precise information about the position of a node or edge in the source code file. It comprises the following fields:

- •
  uri – the relative path to the source code file,
- •
  startLine – indicates the starting line number for the position of the node or edge in the file,
- •
  startCharacter – specifies the starting character position for that node or edge,
- •
  endLine – indicates the end line number for the position of that node or edge in the file,
- •
  endCharacter – specifies the ending character position for that node or edge.

The SCG nodes represent all concrete entities that describe the essential code structure. In particular, nodes do not represent abstract or arbitrary code organization entities, such as packages, files, or modules. The information about these aspects (e.g. that a class belongs to a package or is defined in a certain file) is very useful, but it is better to provide it as additional node or edge properties, rather than essential code structural elements, as it would disrupt the representation of the software structure and quality analysis of the code.

In addition to essential properties, each node and edge can contain various additional properties encapsulated in the properties map field. These properties may encompass information such as the number of lines of code (LOC), the package to which the entity belongs, its visibility scope, various modifiers, or any language-specific details that prove useful for subsequent analysis. Furthermore, properties can be extracted from sources other than the source code itself, for example, from the source control version system, to acquire details such as the last edit timestamp, the primary author, the latest commit message, and so forth. However, it should be noted that mapping certain source control version information into SCG nodes is not straightforward because most source control versions operate at the level of entire lines. When dealing with classes, extracting the author of the most recent changes becomes feasible by utilizing the class declaration location and the property indicating the number of lines of code within the class. This allows us to search for the last change within the class’s defined scope. For one-line definitions such as variables or parameters, we can take advantage of the token-based git history approach introduced by the Context Buddy tool⁷⁷7[https://github.com/VirtusLab/contextbuddy/tree/master/intellij](https://github.com/VirtusLab/contextbuddy/tree/master/intellij). This tool explores the git history from the project’s inception and, among other things, extracts and tracks the introduced tokens, token history, and the original authors of the tokens. Token history can be easily matched with a specific node, thanks to the node’s location property.

The specific node kinds and edge types, along with their connections, are language-specific details that should be implemented in a manner natural and most suitable for each programming language. In the following sections, we describe specific implementations of the SCG model for the Scala and Java languages.

### 3.3 Semantic Code Graph for Scala and Java

Scala \[[59](/html/2310.02128v2/#bib.bib59)\] is a hybrid language that combines constructs known from object-oriented and functional programming. Scala 2 and its next iteration Scala 3, themselves based on JVM, were designed to supersede the Java language in its capabilities, extending and improving on already proven useful features rather than completely changing the paradigm. As a result, Java and Scala share similar entity types and relations in terms of the Semantic Code Graph, as presented in Table [1](/html/2310.02128v2/#S3.T1 "Table 1 ‣ 3.3 Semantic Code Graph for Scala and Java ‣ 3 Semantic Code Graph ‣ Semantic Code Graph – an information model to facilitate software comprehension").

|  |  |  |  |
|----|----|----|----|
| Java/ Scala | Node kind | Description | Example |
| J,S | CLASS | a class | class A |
| S | OBJECT | an object | object A |
| S | TRAIT | a trait | trait B |
| J | INTERFACE | an interface | interface B |
| J,S | METHOD | a method | def m(): A |
| J,S | PARAM | method, constructor or trait parameter | a in def m(a: A) |
| J,S | TYPE_PARAM | a type parameter | T in def m\[T\](t: T) |
| J,S | VALUE | value in Scala or final variable in Java | val a: A |
| J,S | VARIABLE | a variable (non-final field) | var a: A |
| S | TYPE | type member | type T $`<`$: A |
| J,S | ENUM | enumerated type | enum E { case A } |
| Java/ Scala | Edge type | Description | Example |
| J,S | CALL | call to method, constructor; usage of parameter or field | def m1()=m2() $`\Rightarrow`$ $`{m1}\overset{C⁢A⁢L⁢L}{\rightarrow}{m2}`$ |
| J,S | DECLARATION | relation between parent and declared entity | class A { def m()=() } $`\Rightarrow`$ $`A\overset{D⁢E⁢C⁢L⁢A⁢R⁢A⁢T⁢I⁢O⁢N}{\rightarrow}m`$ |
| J,S | EXTEND | extend relation between entities | class A extends B $`\Rightarrow`$ $`A\overset{E⁢X⁢T⁢E⁢N⁢D}{\rightarrow}B`$ |
| J,S | OVERRIDE | edge from (implementation) method to its overridden method | override def m() $`\Rightarrow`$ $`{A\# m}\overset{O⁢V⁢E⁢R⁢R⁢I⁢D⁢E}{\rightarrow}{B\# m}`$ |
| J,S | PARAMETER | edge from entity to its parameter | def m(a: A) $`\Rightarrow`$ $`m\overset{P⁢A⁢R⁢A⁢M⁢E⁢T⁢E⁢R}{\rightarrow}a`$ |
| J,S | RETURN_TYPE | edge from method to its return type | def m(): B $`\Rightarrow`$ $`m\overset{R⁢E⁢T⁢U⁢R⁢N⁢\_ ⁢T⁢Y⁢P⁢E}{\rightarrow}B`$ |
| J,S | TYPE | type relation e.g. between variable definition and its type | val a: A $`\Rightarrow`$ $`a\overset{T⁢Y⁢P⁢E}{\rightarrow}A`$ |
| J,S | TYPE_PARAMETER | type parameter | T in def m\[T\](t: T) $`\Rightarrow`$ $`m\overset{T⁢Y⁢P⁢E⁢\_ ⁢P⁢A⁢R⁢A⁢M⁢E⁢T⁢E⁢R}{\rightarrow}T`$ |

## Table 1: List of nodes and edges present in SCG model for Java and Scala

Fig. [1](/html/2310.02128v2/#S3.F1 "Figure 1 ‣ 3.3 Semantic Code Graph for Scala and Java ‣ 3 Semantic Code Graph ‣ Semantic Code Graph – an information model to facilitate software comprehension") and Fig. [2](/html/2310.02128v2/#S3.F2 "Figure 2 ‣ 3.3 Semantic Code Graph for Scala and Java ‣ 3 Semantic Code Graph ‣ Semantic Code Graph – an information model to facilitate software comprehension") show source code samples and their respective SCG representations. Fig. [1](/html/2310.02128v2/#S3.F1 "Figure 1 ‣ 3.3 Semantic Code Graph for Scala and Java ‣ 3 Semantic Code Graph ‣ Semantic Code Graph – an information model to facilitate software comprehension") presents two top-level declarations of class B and trait A. The respective SCG graph captures various dependencies in this piece of code depicting each declared entity – class B with method bar(), trait B with method foo(), and existing dependencies between them of type DECLARATION, EXTEND and CALL.

trait A {

  def foo(): Unit = ()

}

class B extends A {

  def bar(): Unit = foo()

}

(a) Scala simple inheritance example.

(b) Semantic Code Graph visualized.

Figure 1: SCG visualization for a simple inheritance example.

Fig. [2](/html/2310.02128v2/#S3.F2 "Figure 2 ‣ 3.3 Semantic Code Graph for Scala and Java ‣ 3 Semantic Code Graph ‣ Semantic Code Graph – an information model to facilitate software comprehension") shows method triple with one parameter n and local value t which is computed as $`n*n*n`$. Consequently, the n parameter of method triple is called by this method 3 times. The t parameter is then called and returned in line 3. Type Int is deliberately not represented in the SCG as its definition exists only in an external library. SCG represents only entities defined within the code base of the analyzed project.

## 1 def triple(n: Int): Int = {

## 2 val t = n \* n \* n

## 3 t

## 4 }

(a) Simple method with local value and method parameter called multiple times.

(b) Semantic Code Graph visualized.

Figure 2: SCG visualization of method with local calls and local value t definition.

## 4 Semantic Code Graph extraction process

### 4.1 Implementation Overview

A common way of extracting the structure of the source code is by parsing it into an Abstract Syntax Tree (AST). However, the AST represents only syntax, lacking the semantic information about relations between code entities, required by the SCG ([3.2](/html/2310.02128v2/#S3.SS2 "3.2 Semantic Code Graph base model ‣ 3 Semantic Code Graph ‣ Semantic Code Graph – an information model to facilitate software comprehension")). Also, the AST describes entities not important from the semantic code dependency point of view, such as braces, keywords, and comments. To build a comprehensive SCG model from an AST, we therefore need to drop unnecessary information from the AST graph and augment the remaining nodes with semantic information. Adding relations between entities will create a graph of semantic and structural dependencies.

Semantic analysis is one of the crucial steps in the compilation process \[[27](/html/2310.02128v2/#bib.bib27)\]. Consequently, useful semantic information required by the Semantic Code Graph can be extracted from the information generated during the semantic analysis performed by the compiler in the front-end analysis phase of the compilation. All steps of the front-end analysis are schematically depicted in Fig. [3](/html/2310.02128v2/#S4.F3 "Figure 3 ‣ 4.1 Implementation Overview ‣ 4 Semantic Code Graph extraction process ‣ Semantic Code Graph – an information model to facilitate software comprehension"). In the Hierarchical Analysis step, the parser consumes code tokens and produces an Abstract Syntax Tree, a lossless representation of the source code, preserving all its syntactical details. In the next step, the semantic analyzer augments the AST with additional semantic and contextual information with the help of Symbol Tables. Symbol Tables facilitate efficient insertion and lookup of code elements by name, reflecting code dependencies, e.g., linking references to their corresponding declarations. Semantic Analysis (also known as context-sensitive analysis) annotates the AST with types, references, scopes, and other semantic attributes. Such an AST, with all types and symbols resolved, is a sufficiently detailed abstraction for generating SCG.

## Figure 3: Front-end analysis steps in a compiler

### 4.2 Extracting SCG for the Scala2 language

The Scala 2 compilation process consists of 24 phases (Fig. [4](/html/2310.02128v2/#S4.F4 "Figure 4 ‣ 4.2 Extracting SCG for the Scala2 language ‣ 4 Semantic Code Graph extraction process ‣ Semantic Code Graph – an information model to facilitate software comprehension")), of which only the first four (parse, namer, packeobjects and typer) are required to extract information useful for the SCG. To this end, we can create a compiler plugin and work directly with the compiler internal structures. However, compilation is a complex process, so dealing with compiler internal structures can be challenging. An alternative solution is to use other meta-tools implemented to facilitate Scala 2 syntactic and semantic analysis. An untyped AST can be generated with the scalameta Trees⁸⁸8[https://scalameta.org/docs/trees/guide.html](https://scalameta.org/docs/trees/guide.html) library and then annotated with semantic information available through the SemanticDB⁹⁹9[https://scalameta.org/docs/semanticdb/guide.html](https://scalameta.org/docs/semanticdb/guide.html) library, which exposes symbols and types defined in the source code. SemanticDB is a compiler plugin that is attached after the typer phase. We can use these two libraries and create our own Scala plugin¹⁰¹⁰10[https://github.com/VirtusLab/scg-scala](https://github.com/VirtusLab/scg-scala) capable of extracting SCG, also invoked after the typer compilation phase.

``` ltx_verbatim
$ scalac -Xshow-phases
    phase name  id  description
    ----------  --  -----------
        parser   1  parse source into ASTs,
                    perform simple desugaring
         namer   2  resolve names,
                    attach symbols to named trees
packageobjects   3  load package objects
         typer   4  the meat and potatoes:
                    type the trees
         ...
           jvm  23  generate JVM bytecode
      terminal  24  the last phase
                    during a compilation run
```

Figure 4: Scala 2 compiler phases. All type related information are available after the typer phase.

### 4.3 Extracting SCG for the Scala3 language

The Scala 3 compiler introduces the Typed Abstract Syntax Tree (TASTy) \[[60](/html/2310.02128v2/#bib.bib60)\], an annotated AST serving as an intermediate code between the front and back end of the compiler. TASTy contains a complete source code syntax and resolved semantic details (such as types, references, and others). The TASTy trees are stored as binary files \*.tasty during the pickler compilation phase (Fig. [5](/html/2310.02128v2/#S4.F5 "Figure 5 ‣ 4.3 Extracting SCG for the Scala3 language ‣ 4 Semantic Code Graph extraction process ‣ Semantic Code Graph – an information model to facilitate software comprehension")). Instead of writing our own compiler plugin, we can read these files from the compiled project and generate the SCG in an external process.

``` ltx_verbatim
phase name  description
----------  -----------
    parser  scan and parse sources
     typer  type the trees
       ...
   pickler  generates TASTy info
       ...
  genBCode  generate JVM bytecode
```

Figure 5: Scala 3 compiler phases, with pickler phase for storing TASTy binary files.

### 4.4 Extracting SCG for the Java language

The extension mechanism for the javac compiler was introduced in Java 8. Over the years, writing compiler plugins and dealing with compiler internals has proven to be challenging and subject to internal API changes. To facilitate code analysis that does not require full features of the compiler, the JavaParser¹¹¹¹11[http://javaparser.org/](http://javaparser.org/) library was created. JavaParser not only produces the AST, but also (since version 3.5.0) resolves semantic dependencies through a special module called SymbolSolver. This feature can be utilized to extract the SCG from the Java source code. The library supports all language constructs from Java 1 to Java 15 and is actively developed, which gives us great coverage of language features with minimal effort. We have enhanced our SCG command line tool, scg-cli (introduced in Section [6.1](/html/2310.02128v2/#S6.SS1 "6.1 The scg-cli tool ‣ 6 Empirical Software Comprehension with Semantic Code Graph ‣ Semantic Code Graph – an information model to facilitate software comprehension")), with the functionality to extract SCG data for Java projects. This feature can be accessed using the command scg-cli generate \.

### 4.5 Challenges in extracting SCG from Bytecode

Sections [4.2](/html/2310.02128v2/#S4.SS2 "4.2 Extracting SCG for the Scala2 language ‣ 4 Semantic Code Graph extraction process ‣ Semantic Code Graph – an information model to facilitate software comprehension")-[4.4](/html/2310.02128v2/#S4.SS4 "4.4 Extracting SCG for the Java language ‣ 4 Semantic Code Graph extraction process ‣ Semantic Code Graph – an information model to facilitate software comprehension") described the implementation of the SCG extraction for three different languages: Scala 2, Scala 3 and Java. All three of them, with the help of compilers during the back-end analysis, are translated to the bytecode – the Intermediate Code representation for the Java Virtual Machine. Consequently, it would be beneficial from the implementation point of view to extract SCG from the JVM bytecode as this would automatically support any JVM-based language. In section [4.1](/html/2310.02128v2/#S4.SS1 "4.1 Implementation Overview ‣ 4 Semantic Code Graph extraction process ‣ Semantic Code Graph – an information model to facilitate software comprehension"), we discussed how the compiler front-end provides the most convenient and accurate representation of the source code for our objectives. On the contrary, bytecode is an output from the compiler back-end process which involves various optimizations and simplifications applied to generate an output optimized for the JVM interpreter. Indeed, the accuracy of the model extracted from bytecode suffers from representation mismatch. Let us consider a few notable examples:

- •
  Missing information on precise element location in the source code.
- •
  Missing type information due to the type erasure mechanism.
- •
  Additional JVM bytecode generated to cover specific language features not represented in bytecode.
- •
  Various compiler optimizations.

#### 4.5.1 Missing location data

Java programs are compiled with the javac compiler. The resulting bytecode contains only limited information on the location of the software entities. Even with the -g parameter, the generated bytecode does not contain location for non-executable code such as abstract methods (Fig. [6](/html/2310.02128v2/#S4.F6 "Figure 6 ‣ 4.5.1 Missing location data ‣ 4.5 Challenges in extracting SCG from Bytecode ‣ 4 Semantic Code Graph extraction process ‣ Semantic Code Graph – an information model to facilitate software comprehension")).

//A.java

## 1 public interface A {

## 2 void f1();

## 3 }

4.

## 5 class B implements A {

## 6 public void f1() {

## 7 }

## 8 }

(a) Java A interface with f1 method and its class B implementation.

\$ javac -g A.java

\$ javap -l A

Compiled from "A.java"

public interface A {

  public abstract void f1();

}

\$ javap -l B

Compiled from "A.java"

class B implements A {

  B();

## LineNumberTable:

      line 5: 0

    …

  public void f1();

## LineNumberTable:

      line 7: 0

    …

(b) Decompiled bytecode – missing location for the interface and its methods; line number only generated for constructor B and method f1().

Figure 6: Java bytecode does not contain the source code location of non-runtime code elements even with the javac -g flag. For other elements only the line number can be recorded.

#### 4.5.2 Missing type data

In Java, we can define generic types, such as TypeErasure$``$, but the actual type will be lost in the compilation due to type erasure mechanism¹²¹²12[https://docs.oracle.com/javase/tutorial/java/generics/erasure.html](https://docs.oracle.com/javase/tutorial/java/generics/erasure.html) (Fig.[7](/html/2310.02128v2/#S4.F7 "Figure 7 ‣ 4.5.2 Missing type data ‣ 4.5 Challenges in extracting SCG from Bytecode ‣ 4 Semantic Code Graph extraction process ‣ Semantic Code Graph – an information model to facilitate software comprehension")).

//TypeErasure.java

class TypeErasure\ {

    public A a;

    public TypeErasure(A a){

        this.a = a;

    }

}

//M.java

public class M {

    void main(String\[\] args) {

        TypeErasure\ a =

            new TypeErasure\(1);

        System.out.println(a.a + 1);

    }

}

(a) TypeErasure$``$ generic type

//TypeErasure.class

class TypeErasure\ {

    public A a;

    public TypeErasure(A var1) {

        this.a = var1;

    }

}

//M.class

public class M {

    public M() {

    }

    public void main(String\[\] var0) {

        TypeErasure var1 = new TypeErasure(1);

        System.out.println(

            (Integer)var1.a + 1

        );

    }

}

(b) Decompiled bytecode

Figure 7: Java source code: The Integer type for the generic TypeErasure class will not be represented in bytecode for the local variable a.

#### 4.5.3 Extra compiler-generated bytecode

The problem of inadequate JVM bytecode is especially visible for languages other than Java. For example, Scala has a trait¹³¹³13[https://docs.scala-lang.org/tour/traits.html](https://docs.scala-lang.org/tour/traits.html) code structure that is similar to a Java interface, but it can have concrete fields and methods, and provides the multiple inheritance capability with the help of the Scala trait linearization algorithm (Fig. [8](/html/2310.02128v2/#S4.F8 "Figure 8 ‣ 4.5.3 Extra compiler-generated bytecode ‣ 4.5 Challenges in extracting SCG from Bytecode ‣ 4 Semantic Code Graph extraction process ‣ Semantic Code Graph – an information model to facilitate software comprehension")).

trait A {

  def foo(): Unit = ()

}

class B extends A {

  def bar(): Unit = foo()

}

(a) Scala source code: class B extends trait A.

// A.class

public interface A {

   static void foo\$(final A a) {a.foo();}

   default void foo() {}

   static void \$init\$(final A a) {}

}

// B.class

public class B implements A {

   public void foo() { A.foo\$(this); }

   public void bar() {this.foo();}

   public B() {A.\$init\$(this);}

}

(b) Decompiled compiler-generated bytecode.

Figure 8: The Scala compiler generates the B#foo() method with reference to the generated static method A#foo\$(a).

Even in very simple cases, the call graph generated from the Scala bytecode can be very different from one that actually occurs in the source code, as presented in Fig. [9](/html/2310.02128v2/#S4.F9 "Figure 9 ‣ 4.5.3 Extra compiler-generated bytecode ‣ 4.5 Challenges in extracting SCG from Bytecode ‣ 4 Semantic Code Graph extraction process ‣ Semantic Code Graph – an information model to facilitate software comprehension").

Figure 9: Comparison of a call graph generated from bytecode and from the source code – B#foo() and A#foo\$(a) methods do not exist in the source code.

Such extensive changes to the generated bytecode result in a mismatch between the source code and its representation in the bytecode. Consequently, accurate information about code dependencies can only be extracted directly from the source code rather than using an intermediate code representation such as bytecode.

### 4.6 Stable symbol identifiers for a multi-language SCG model

To create bindings between references and definitions, and reflect them in a graph structure, we need to adopt conventions for constructing global stable identifiers for code entities. The same identifier has to be generated when analyzing a definition and when analyzing a reference to this definition. The unique symbol identifier can also be used as a node identifier and to construct appropriate relations between nodes in the SCG. Symbol names are unique only within a given context, and some names might be shadowed in an inner context. To create unique identifiers, we need to combine the symbol name with that symbol’s owner identifier. In this way, we can ensure the uniqueness of each symbol identifier. We propose a set of rules¹⁴¹⁴14partially adopted from [https://scalameta.org/docs/semanticdb/specification.html#symbolinformation-1](https://scalameta.org/docs/semanticdb/specification.html#symbolinformation-1). Access 22.05.2023. presented in Table [2](/html/2310.02128v2/#S4.T2 "Table 2 ‣ 4.6 Stable symbol identifiers for a multi-language SCG model ‣ 4 Semantic Code Graph extraction process ‣ Semantic Code Graph – an information model to facilitate software comprehension"), using which we can construct a stable identifier for any language symbol.

| Lang | Symbol type | Rule                 | ID              |
|------|-------------|----------------------|-----------------|
| J,S  | PACKAGE     | name + /             | p/              |
| J,S  | CLASS       | Owner ID + \#        | p/A#            |
| S    | OBJECT      | O. ID + .            | p/B.            |
| S    | TRAIT       | O. ID + \#           | p/T#            |
| J,S  | METHOD      | O. ID + name + ().   | p/B.mB().       |
| J,S  | METHOD\*    | O. ID + name + (+n). | p/B.mB(+1).     |
| J,S  | PARAM       | O. ID + (name)       | p/A#mA().(a)    |
| J,S  | TYPE_PARAM  | O. ID+ \[name\]      | p/A#mT().\[T2\] |
| J,S  | VALUE       | O. ID + name + .     | p/B.b.          |
| J,S  | VARIABLE    | O. ID + name + ().   | p/B.c().        |
| S    | TYPE        | O. ID + name + \#    | p/B.T#          |

Table 2: Rules for creating stable identifiers in the Java and Scala languages (related code containing all symbol types is presented in Listing [1](/html/2310.02128v2/#LST1 "Listing 1 ‣ 4.6 Stable symbol identifiers for a multi-language SCG model ‣ 4 Semantic Code Graph extraction process ‣ Semantic Code Graph – an information model to facilitate software comprehension")). \*Note that overloaded methods are tagged with a position number.

// A.java

package p

class A {

  def mA(a: String): String = a

  def mT\[T2\](t: T2): Unit = {}

}

// B.scala

package p

object B {

  type T = String

  val b = "b"

  var c = "c"

  def mB(a: A): String = {

    a.mA(b)

  }

  def mB(a: String): String = {

    ""

  }

}

Listing 1: Scala code reflecting stable identifiers presented in Table [2](/html/2310.02128v2/#S4.T2 "Table 2 ‣ 4.6 Stable symbol identifiers for a multi-language SCG model ‣ 4 Semantic Code Graph extraction process ‣ Semantic Code Graph – an information model to facilitate software comprehension")

### 4.7 SCG storage format

It is essential to store the SCG data in a format optimized for performance, both during data generation and analysis. We have identified key attributes that such a format should support:

1.  1.
    *Incremental builds* – some software projects may contain millions lines of code, therefore the format has to allow building the graph incrementally during the generation process \[[17](/html/2310.02128v2/#bib.bib17)\].
2.  2.
    *Partial graph loading* – exported graphs may contain hundreds of thousands of vertices, so it would be inefficient to load the entire graph in the case the user needs to perform analysis only on a particular module.
3.  3.
    *Minimum disc space usage* – disk usage is important as it will be desirable to distribute graph files in the control version system or as an attachment to the particular code base.
4.  4.
    *Extensibility* – To support various programming languages, we need to be able to add different properties to the graph, so the format needs to be easily expandable.
5.  5.
    *Libraries in multiple programming languages* – Code generating the SCG data for a given language will typically be written in the same language. On the other hand, the code to analyze the SCG data may be written in different suitable languages, such as Python or R. Consequently, it is crucial to provide APIs to write and read the format in multiple programming languages.
6.  6.
    *Conversion to other data formats* – for more advanced data analysis we need to be able to convert the SCG representation to other data formats, such as data frames, or graph file formats specific for existing tools, e.g., as GDF¹⁵¹⁵15[https://www.iso.org/standard/54610.html](https://www.iso.org/standard/54610.html) or DOT¹⁶¹⁶16[https://graphviz.org/doc/info/lang.html](https://graphviz.org/doc/info/lang.html)).

Many different graph formats were proposed for exporting huge graph structures \[[93](/html/2310.02128v2/#bib.bib93)\], but none of them satisfies all our requirements. Consequently, we propose a new graph format based on the Protocol Buffers¹⁷¹⁷17[https://developers.google.com/protocol-buffers](https://developers.google.com/protocol-buffers). For the Semantic Code Graph this format can be treated as an intermediate data exchange format between the source code and a data analysis tool, or a target graph format file. To address the above requirements, we made the following design choices:

- •
  store one graph file per source file in the project (requirements 1 and 2),
- •
  adopt protobuf as the base format having a small footprint (requirement 3), and being supported by many languages (requirement 5),
- •
  schema definition contains a flexible property map with any number of arguments (requirement 4).

Requirement 6 (conversion to other data formats) can easily be fulfilled by writing dedicated converters which is facilitated by utilizing Protocol Buffers, supported by all major languages¹⁸¹⁸18[https://protobuf.dev/reference/other/](https://protobuf.dev/reference/other/).

The complete schema for the proposed format is presented in Listing [2](/html/2310.02128v2/#LST2 "Listing 2 ‣ 4.7 SCG storage format ‣ 4 Semantic Code Graph extraction process ‣ Semantic Code Graph – an information model to facilitate software comprehension"). The format defines data structures for graph nodes, edges and location in the code, grouped together under one structure representing the entire source code file. Properties of the SCG, as defined in section [3.2](/html/2310.02128v2/#S3.SS2 "3.2 Semantic Code Graph base model ‣ 3 Semantic Code Graph ‣ Semantic Code Graph – an information model to facilitate software comprehension"), are mapped to individual fields of these structures. Additional dynamic node and edge properties can be placed in the dictionary structure properties – it is a single format extension point for any additional, often language-specific, properties.

The files are saved with the .semanticgraph extension.

syntax = "proto3";

message Location {

    string uri = 1;

    int32 startLine = 2;

    int32 startCharacter = 3;

    int32 endLine = 4;

    int32 endCharacter = 5;

}

message Edge {

    string to = 1;

    string type = 2;

    Location location = 3;

    map\ properties = 4;

}

message GraphNode {

    string id = 1;

    string kind = 2;

    Location location = 3;

    map\ properties = 4;

    string displayName = 5;

    repeated Edge edges = 6;

}

message SemanticGraphFile {

    string uri = 1;

    repeated GraphNode nodes = 2;

}

Listing 2: Protobuf Semantic Code Graph schema definition.

## 5 Software Comprehension capabilities: comparison of SCG and other graph-based code representations

In this section, we conduct a comparative analysis of various models as outlined in Section [2](/html/2310.02128v2/#S2 "2 Related work ‣ Semantic Code Graph – an information model to facilitate software comprehension"), contrasting them with the SCG model within the context of software comprehension. We consider nine different code graph models in addition to the Semantic Code Graph (SCG): Control Flow Graph (CFG) \[[4](/html/2310.02128v2/#bib.bib4)\], Program Dependence Graph (PDG) \[[22](/html/2310.02128v2/#bib.bib22)\], Code Property Graph (CPG) \[[92](/html/2310.02128v2/#bib.bib92)\], System Dependence Graph (SDG) \[[29](/html/2310.02128v2/#bib.bib29)\], Java System Dependency Graph (JSysDG) \[[88](/html/2310.02128v2/#bib.bib88)\], Call Graph (CG) \[[72](/html/2310.02128v2/#bib.bib72)\], Class Collaboration Network (CCN) \[[89](/html/2310.02128v2/#bib.bib89)\], Java Relationship Graphs (JRG) \[[5](/html/2310.02128v2/#bib.bib5)\], and General Dependency Network (GDN) \[[74](/html/2310.02128v2/#bib.bib74)\].

Our evaluation focuses on two key aspects: the models’ suitability in representing crucial features from the perspective of code dependency software comprehension and their readiness for practical adoption in commercial settings. We break down the analysis into three categories. The first category addresses the general capabilities of each model, the second contains specific use cases vital for comprehending dependencies in modern programming languages, and the third concerns the readiness of these models for integration into tools and for conducting further research. While the evaluation criteria may have some subjectivity, we believe they effectively capture the essential functional and non-functional requirements necessary for a comprehensive and practical code structure representation model. A summarized comparison of the results is presented in Table [3](/html/2310.02128v2/#S5.T3 "Table 3 ‣ 5 Software Comprehension capabilities: comparison of SCG and other graph-based code representations ‣ Semantic Code Graph – an information model to facilitate software comprehension").

|  |  |  |  |  |  |  |  |  |  |  |
|----|----|----|----|----|----|----|----|----|----|----|
|  | Program execution focus |  |  |  |  | Software dependency focus |  |  |  |  |
|  | CFG | PDG | CPG | SDG | JSysDG | CG | CCN | JRG | GDN | SCG |
| General model capabilities |  |  |  |  |  |  |  |  |  |  |
| \cdashline1-11 1. Language independent | \+ | \+ | \+ | \+ | \- | \+ | \+ | \- | \+ | \+ |
| 2\. Captures interprocedural dependencies | \- | \- | \- | \+ | \+ | \+ | \+ | \+ | \+ | \+ |
| 3\. Captures abstract code entities | \- | \- | \- | \- | \+ | \- | \+ | \+ | \+ | \+ |
| 4\. Captures language specific dependencies | \- | \- | \- | \- | \+ | \- | \- | \+ | \- | \+ |
| 5\. Preserves direct relation to the source code | \- | \- | \- | \- | \- | \- | \- | \- | \- | \+ |
|  | 1 | 1 | 1 | 2 | 3 | 2 | 3 | 3 | 3 | 5 |
| Support for software comprehension use cases |  |  |  |  |  |  |  |  |  |  |
| \cdashline1-11 1. General focus on supporting software comprehension | \- | \- | \- | \- | \- | \- | \+ | \+ | \+ | \+ |
| 2\. Can generate method Call Hierarchy | \- | \- | \- | \+ | \+ | \+ | \- | \+ | \+ | \+ |
| 3\. Can represent OOP entity relations | \- | \- | \- | \- | \+ | \- | \+ | \+ | \+ | \+ |
| 4\. Can be used for software structure analysis | \- | \- | \- | \- | \+ | \- | \+ | \+ | \+ | \+ |
| 5\. Suitability for interactive source code visualizations | \- | \- | \- | \- | \- | \- | \- | \- | \- | \+ |
|  | 0 | 0 | 0 | 1 | 3 | 1 | 3 | 4 | 4 | 5 |
| Tool adoption readiness |  |  |  |  |  |  |  |  |  |  |
| \cdashline1-11 1. Extraction program is publicly available for Java language | \+ | \- | \+ | \- | \- | \+ | \+ | \- | \- | \+ |
| 2\. The model defines data intermediate representation | \- | \- | \+ | \- | \- | \- | \- | \- | \- | \+ |
| 3\. It is possible to persist extracted model | \- | \- | \+ | \- | \- | \- | \- | \- | \- | \+ |
| 4\. It is possible to integrate 3rd party analysis tools | \- | \- | \+ | \- | \- | \- | \- | \- | \- | \+ |
|  | 1 | 0 | 4 | 0 | 0 | 1 | 1 | 0 | 0 | 4 |
| Readiness for practical software structure comprehension | 14% | 7% | 35% | 21% | 42% | 28% | 50% | 50% | 50% | 100% |

Table 3: Different code graph representations and their capabilities. (CFG = Control Flow Graph; PDG = Program Dependence Graph; CPG = Code Property Graph; SDG = System Dependence Graph; JSysDG = Java System Dependency Graph; CG = Call Graph; CCN = Class Collaboration Network; GDN = General Dependency Network; SCG = Semantic Code Graph)

## For the general model capabilities category we specify the following traits:

1.  1.
    Language independent – capability of representing code written in different programming languages. This implies that the analysis of SCG data should function seamlessly irrespective of the programming language employed in a project (except in cases where the analysis relies on language-specific extended properties).
2.  2.
    Captures interprocedural dependencies – capability of representing dependencies between different procedures, so the model can be used to analyze the entire project.
3.  3.
    Captures abstract code entities – capability of representing entities which do not directly impact program execution (such as Java interfaces) yet are essential components of code structure.
4.  4.
    Captures language specific dependencies – ability to depict language-specific dependencies (such as inheritance for OOP languages, or extensions from the Scala language).
5.  5.
    Preserves direct relation to the source code – ability to represent all entities found in the source code and point to concrete place in the source code where the entity or relation can be found (see Section [3.1](/html/2310.02128v2/#S3.SS1 "3.1 Source code dependency model requirements ‣ 3 Semantic Code Graph ‣ Semantic Code Graph – an information model to facilitate software comprehension")).

In this category, we evaluate the model’s ability to comprehend the complete software landscape. Models solely focused on specific monolithic programs, such as CFG, PDG, or related CPG, do not support dependencies between different procedures and also fall short when it comes to handling higher-level dependencies among abstract units. Models that emphasize relationships between code entities prove to be a better fit for software comprehension. Most of these models are versatile and can be applied to analyze various programming languages, with the exception of JSysDG and JRG, which are specifically designed for the Java language. It is noteworthy that only SCG ensures a direct connection to the source code through the location property. Besides SCG, JSysDG and JRG stand out as the most suitable representations of code, capable of illustrating even language-specific code dependencies within the entire program. Conversely, GDN is constructed on a generic extended concrete syntax tree (eCST), resulting in the loss of specific information, such as distinct node types. For instance, both enum and class are represented with the same node type referred to as CONCRETE_UNIT_DECL.

To further assess the readiness of the model for software comprehension, we evaluate concrete use cases in the context of the given model:

1.  1.
    General focus on supporting software comprehension – is the model primarily focused on improving software comprehension rather than, for example, prioritizing program optimization.
2.  2.
    Can generate method Call Hierarchy – the ability to generate a call graph and its associated call hierarchy is a widely used representation when understanding software dependencies.
3.  3.
    Can represent OOP entities and relations – can the model effectively represent OOP elements such as objects and classes, as well as relationships such as polymorphism.
4.  4.
    Can be used for software structure analysis – is the model robust and detailed enough to support in-depth analysis for a better understanding of software structures.
5.  5.
    Can facilitate source code visualizations – when examining the graph, can users seamlessly navigate between the graph and the source code? The graph should closely align with the written source code and should be easy to comprehend without introducing unnecessary abstract graph nodes that may clutter the visualization.

Supporting software comprehension is not the primary focus of statement-based program execution models. Consequently, Control Flow Graph (CFG), Program Dependence Graph (PDG), and Code Property Graph (CPG) models are limited to representing single procedures and are inadequate for various defined use cases. The System Dependency Graph (SDG) includes interprocedural call edges, which can assist in illustrating the Call Hierarchy. However, for understanding of software call chains, the Call Graph (CG) is the preferred choice, particularly popular among researchers. JSysDG builds upon the SDG and can accurately represent Object-Oriented Programming (OOP) features for the Java language. Class Collaboration Network (CCN) is also widely employed in software comprehension analysis. This model describes dependencies between classes, which are essential code entities in OOP. CCN is known for its simplicity, producing a manageable number of nodes what facilitates wide range of graph analysis. Models based on code entities offer more direct support for comprehending code dependencies and code structure, making them suitable representations for in-depth software structure analysis. However, interactive source code visualization requires an extremely accurate representation of the source code, complete with information on direct location pointers, a requirement uniquely fulfilled by the Semantic Code Graph (SCG) model.

## Concerning the readiness for tool adoption, we assessed the following criteria:

1.  1.
    Extraction tool is publicly available for Java language – at least for the Java language (as an established and widely popular language) there is a publicly available tool to generate a representation of a source code.
2.  2.
    The model defines data intermediate representation – a well-designed intermediate representation facilitates adding support for new languages; moreover, analysis tools relying on a common intermediate representation are more versatile and language-agnostic.
3.  3.
    It is possible to persist the extracted model – it is inefficient to extract the model from the source code each time an analysis is made. The ability to persist the model is therefore crucial.
4.  4.
    It is possible to integrate 3rd party analysis tools – there should be a means to export the extracted model for analysis with external tools commonly used by researchers, such as Jupyter Notebooks or the Gephi visualization software.

In Section [2](/html/2310.02128v2/#S2 "2 Related work ‣ Semantic Code Graph – an information model to facilitate software comprehension"), we discussed various graph source code models, whose utility on both theoretical and practical levels has been demonstrated by developing experimental extraction tools. Unfortunately, few of these tools are publicly shared, making it challenging for other researchers to reproduce results, or enhance existing implementations, and conduct further analyses. For Java, the Control Flow Graph (CFG) and Call Graph (CG) can be extracted using the ScootUp¹⁹¹⁹19[https://github.com/soot-oss/SootUp/](https://github.com/soot-oss/SootUp/) tool \[[41](/html/2310.02128v2/#bib.bib41)\]. The Code Property Graph (CPG) can be generated using the joern²⁰²⁰20[https://github.com/joernio/joern](https://github.com/joernio/joern) platform, which extracts CPGs for various languages (with stable implementation for C/C++ and experimental for Java/Kotlin/Javascript/Python) into an embedded database and provides a custom Scala DSL for database queries. CPG provides a specification of an intermediate representation²¹²¹21[https://cpg.joern.io/](https://cpg.joern.io/), and it supports the storage of extracted CPG models for future use. Furthermore, it offers seamless integration with third-party software through direct Scala API or export to formats such as GraphML, DOT, or other graph formats. The joern platform generates Program Dependency Graphs (PDG) and Control Flow Graphs (CFG) for C/C++ languages but it has a potential to support other languages in the future. Shu et al. \[[77](/html/2310.02128v2/#bib.bib77)\] describe the JavaPDG tool capable of extracting Java PDG graphs. However, the link to the tool is outdated, and the actual implementation is currently unavailable. In terms of entity relations, basic networks, such as Class Collaboration Networks, can be extracted using DependencyFinder. Extraction programs for PDG, JSysDG, JRG, and GDN for Java language do not currently exist. For the Semantic Code Graph (SCG), we created a command line tool called scg-cli²²²²22[https://github.com/VirtusLab/scg-cli](https://github.com/VirtusLab/scg-cli). This tool is described in more detail in section [6.1](/html/2310.02128v2/#S6.SS1 "6.1 The scg-cli tool ‣ 6 Empirical Software Comprehension with Semantic Code Graph ‣ Semantic Code Graph – an information model to facilitate software comprehension").

In summary, the SCG model fulfills all proposed criteria, while GDN, JRG, and CCN achieved the readiness for software comprehension score of $`50\%`$. The main shortcomings of these models were related to the lack of direct code relationships, readiness for code visualization, and tool adoption capabilities. Despite its primary focus on comprehensive program execution analysis, JSysDG achieved a score of 42%. Its limitations were mainly attributed to practical constraints within the model and the absence of a comprehensive extraction program. CPG exhibited robust tooling support, primarily due to its extensive utilization in identifying vulnerabilities within C/C++ programs. Although CPG also offers support for the Java language, it remains in an experimental phase, still lacking in terms of feature completeness and model implementation precision. On the other hand, our proposed SCG model maintains excellent software comprehension capabilities with strong practical support for additional tool integration.

## 6 Empirical Software Comprehension with Semantic Code Graph

In this section, we conduct several experimental software comprehension activities on selected projects, in order to answer research questions stated earlier:

- •
  RQ1: Does the SCG model enhance software comprehension capabilities in comparison with the Class Collaboration Network and the Call Graph models?
- •
  RQ2: Does SCG-based data analysis enable actionable software comprehension insights?

Consequently, we extract three graph models – the SCG, the CCN and the CG – from eleven well-known Java and Scala open source projects and analyze the collected data using various techniques, such as complex network analysis \[[58](/html/2310.02128v2/#bib.bib58)\] and the split-apply-combine data analysis methods \[[90](/html/2310.02128v2/#bib.bib90)\].

## The eleven open source projects used in this study are as follows:

- •
  retrofit²³²³23[https://github.com/square/retrofit](https://github.com/square/retrofit) – a type-safe HTTP client for Android and Java,
- •
  commons-io²⁴²⁴24[https://github.com/apache/commons-io](https://github.com/apache/commons-io) – the Apache Commons IO library containing utility classes, stream implementations, file filters, file comparators, endian transformation classes,
- •
  playframework²⁵²⁵25[https://github.com/playframework/playframework](https://github.com/playframework/playframework) – high velocity web framework for building web applications with Java & Scala,
- •
  metals²⁶²⁶26[https://github.com/scalameta/metals](https://github.com/scalameta/metals) – Scala language server with rich IDE features,
- •
  glide²⁷²⁷27[https://github.com/bumptech/glide](https://github.com/bumptech/glide) – media management and image loading framework for Android that wraps media decoding, memory and disk caching, and resource pooling into a simple and easy to use interface,
- •
  vert.x²⁸²⁸28[https://github.com/eclipse-vertx/vert.x](https://github.com/eclipse-vertx/vert.x) – toolkit to build reactive applications on JVM; Vert.x Core library containing low-level functionalities including support for HTTP, TCP and file system access,
- •
  RxJava²⁹²⁹29[https://github.com/ReactiveX/RxJava](https://github.com/ReactiveX/RxJava) – Reactive Extensions for the JVM; a library for composing asynchronous and event-based programs by using observable sequences,
- •
  dubbo³⁰³⁰30[https://github.com/apache/dubbo](https://github.com/apache/dubbo) – Apache Dubbo is a high-performance, Java-based open-source RPC framework,
- •
  spring-boot³¹³¹31[https://github.com/spring-projects/spring-boot](https://github.com/spring-projects/spring-boot) – popular library to help with creating Spring applications,
- •
  Akka³²³²32[https://github.com/akka/akka](https://github.com/akka/akka) – a toolkit for building highly concurrent, distributed, and resilient message-driven applications for Java and Scala,
- •
  Spark³³³³33[https://github.com/apache/spark](https://github.com/apache/spark) – a well-known engine for large-scale data analytics.

The selected projects are very popular among programmers – nine out of eleven have more than 10k stars on GitHub repository.

We have conducted the experiments with the help of the scg-cli tool. From a practitioner’s standpoint, our objective is to provide developers with an introduction to the SCG software. To facilitate reproducibility of our results, we have published all the extracted SCG data used in this study in the form of protobuf files, available in the data folder of the scgi-cli github repository³⁴³⁴34https://github.com/VirtusLab/scg-cli/tree/main/data.

For each project, we build and analyze the full SCG graph, and then extract the Class Collaboration Network and the Call Graph from the SCG data. We have chosen these two models in addition to SCG, as both the Call Graph \[[72](/html/2310.02128v2/#bib.bib72), [43](/html/2310.02128v2/#bib.bib43), [28](/html/2310.02128v2/#bib.bib28), [76](/html/2310.02128v2/#bib.bib76), [21](/html/2310.02128v2/#bib.bib21), [3](/html/2310.02128v2/#bib.bib3)\] and the Class Collaboration Network \[[73](/html/2310.02128v2/#bib.bib73), [54](/html/2310.02128v2/#bib.bib54), [62](/html/2310.02128v2/#bib.bib62), [46](/html/2310.02128v2/#bib.bib46), [18](/html/2310.02128v2/#bib.bib18)\] are models that are popular among researchers and have been used for software comprehension.

Our definition of the Class Collaboration Network is akin to the one presented by Wheeldon and Counsell \[[89](/html/2310.02128v2/#bib.bib89)\]. Figure [10](/html/2310.02128v2/#S6.F10 "Figure 10 ‣ 6 Empirical Software Comprehension with Semantic Code Graph ‣ Semantic Code Graph – an information model to facilitate software comprehension") illustrates the concept of CCN with three distinct class coupling types: inheritance, aggregation, and reference through parameter and return types. A CCN model is extracted from the SCG data by iteratively traversing relevant nodes, and creating a new graph comprising nodes of types OBJECT, CLASS, TRAIT, INTERFACE, and their associated edges: INHERITANCE, AGGREGATION, and REFERENCE.

class D

class C

trait A

class B extends A {

  var d: D

  def bar(c: C): D = d

}

(a) Scala inheritance and aggregation example.

(b) Class Collaboration Network example visualization.

Figure 10: Class Collaboration Network example with INHERITANCE dependencies between class B and class A, AGGREGATION representing variable D and REFERENCE representing method param and return type coupling.

The Call Grah is obtained as a SCG subgraph with edges limited to type CALL and vertices of types METHOD, CONSTRUCTOR, VALUE and VARIABLE.

The remainder of this section is organized as follows. Section [6.1](/html/2310.02128v2/#S6.SS1 "6.1 The scg-cli tool ‣ 6 Empirical Software Comprehension with Semantic Code Graph ‣ Semantic Code Graph – an information model to facilitate software comprehension") briefly describes the scg-cli tool. Section [6.2](/html/2310.02128v2/#S6.SS2 "6.2 Project overview ‣ 6 Empirical Software Comprehension with Semantic Code Graph ‣ Semantic Code Graph – an information model to facilitate software comprehension") presents the first case of software comprehension, where we show how simple analysis of project metrics, followed by more complex software mining, can lead to interesting insights. Section [6.3](/html/2310.02128v2/#S6.SS3 "6.3 Project structure comprehension ‣ 6 Empirical Software Comprehension with Semantic Code Graph ‣ Semantic Code Graph – an information model to facilitate software comprehension") provides an examination of the projects’ structural characteristics. Section [6.4](/html/2310.02128v2/#S6.SS4 "6.4 Discovering critical project entities ‣ 6 Empirical Software Comprehension with Semantic Code Graph ‣ Semantic Code Graph – an information model to facilitate software comprehension") continues with identification of critical code entities which typically serve as excellent starting points for comprehending the source code. Exploration of project structure can be further enhanced using interactive visualization with the Graph Buddy tool, briefly described in Section [6.5](/html/2310.02128v2/#S6.SS5 "6.5 Interactive visualizations and answering reachability questions ‣ 6 Empirical Software Comprehension with Semantic Code Graph ‣ Semantic Code Graph – an information model to facilitate software comprehension"). Section [6.6](/html/2310.02128v2/#S6.SS6 "6.6 Finding code similarities ‣ 6 Empirical Software Comprehension with Semantic Code Graph ‣ Semantic Code Graph – an information model to facilitate software comprehension") demonstrates the capabilities of custom software mining analysis, specifically the identification of code similarities, made feasible by applying data analysis methods to the the rich SCG model. Finally, we conclude the empirical evaluation by addressing our research questions in Section [6.7](/html/2310.02128v2/#S6.SS7 "6.7 Answering research questions ‣ 6 Empirical Software Comprehension with Semantic Code Graph ‣ Semantic Code Graph – an information model to facilitate software comprehension").

### 6.1 The scg-cli tool

To facilitate software comprehension using the SCG model, we have created and open-sourced the scg-cli³⁵³⁵35[https://github.com/VirtusLab/scg-cli](https://github.com/VirtusLab/scg-cli) tool. Ready-to-use binaries can be downloaded from the github release page³⁶³⁶36[https://github.com/VirtusLab/scg-cli/releases](https://github.com/VirtusLab/scg-cli/releases).

The scg-cli tool offers several functionalities, including extraction of the SCG data from Java projects, storage of the SCG data in a compressed protobuf format with a publicly known schema, and exporting to popular graph formats. It also provides a Jupyter environment wherein the SCG data can be analyzed using Python Pandas dataframes. Moreover, scg-cli can generate CCN and CG graphs from the collected SCG data using command arguments –graph CCN,CG.

## Additionally, the scg-cli command-line tool directly empowers software comprehension through following capabilities:

- •
  Generating project summary to give the programmer a high level overview of the project.
- •
  Finding critical entities in the source code that are usually good starting points for reading the project.
- •
  Discovering and suggesting software partitioning to expose module boundaries or support refactoring efforts.

Software comprehension activities, such as identifying critical entities, software partitioning, or exporting results to .GDF or graphml output formats, can operate on all three supported software networks: SCG, CCN, and CG. All aforementioned capabilities were extensively utilized in our empirical research, which demonstrates the usefulness of this tool, and facilitates reproducibility of the presented results.

### 6.2 Project overview

We start the software comprehension experiment with analysis of the simplest properties: the distribution of nodes (Fig. [11](/html/2310.02128v2/#S6.F11 "Figure 11 ‣ 6.2 Project overview ‣ 6 Empirical Software Comprehension with Semantic Code Graph ‣ Semantic Code Graph – an information model to facilitate software comprehension")) and edges (Fig. [12](/html/2310.02128v2/#S6.F12 "Figure 12 ‣ 6.2 Project overview ‣ 6 Empirical Software Comprehension with Semantic Code Graph ‣ Semantic Code Graph – an information model to facilitate software comprehension")) in the SCG graphs of the investigated projects. Looking at the node distribution, we can immediately observe that all Java projects, except for commons-io, have a relatively high fraction of variables, reaching 22.5% for spring-boot, compared to only 6.3% in the case of common-io, and less than 4% for Scala projects. Since excessive use of variables can be harmful, we decide to use software mining techniques to investigate this further. First, for the spring-boot project, we find top files in terms of the number of variables in the project. With the help of the scg-cli tool, we export the project SCG metadata into Jupyter notebook for closer inspection. The notebook provides a python environment with a helper API to read the SCG protobuf data into Pandas³⁷³⁷37[https://pandas.pydata.org](https://pandas.pydata.org) data frames. Next, we use a standard split-apply-combine data analysis strategy, as shown in Listing [3](/html/2310.02128v2/#LST3 "Listing 3 ‣ 6.2 Project overview ‣ 6 Empirical Software Comprehension with Semantic Code Graph ‣ Semantic Code Graph – an information model to facilitate software comprehension"). With this short program we can find 11807 local variables and discover the files with the highest number of them, e.g., ConfigurationPropertyName.java, PaketoBuilderTests.java, JarIntegrationTests.java, OnBeanCondition.java and TomcatWebServerFactoryCustomizer.java.

import scg

scg_files = scg.read_scg("data/spring-boot")

df = scg.create_nodes_df(scg_files)

variables_df = df\[df\[’kind’\]=="VARIABLE"\]

variables_df.filter(items=\[’id’, ’isLocal’\]) \\

    .groupby(’isLocal’).count()

\#             id

\# isLocal

\# false     2639

\# true     11807

variables_df\[variables_df\[’isLocal’\]==True\] \\

  .filter(items=\[’id’, ’file’\]) \\

  .groupby(’file’) \\

  .agg(count=(’id’, ’count’)) \\

  .sort_values(by=’count’, ascending=False)

\#                                          count

\# file

\# ConfigurationPropertyName.java             102

\# PaketoBuilderTests.java                    101

\# JarIntegrationTests.java                    86

\# OnBeanCondition.java                        80

\# TomcatWebServerFactoryCustomizer.java       72

variables_df\[variables_df\[’isLocal’\]==False\] \\

  .filter(items=\[’id’, ’file’\]) \\

  .groupby(’file’) \\

  .agg(count=(’id’, ’count’)) \\

  .sort_values(by=’count’, ascending=False)

\#                                        count

\# file

\# ServerProperties.java                    104

\# KafkaProperties.java                      76

\# RabbitProperties.java                     68

\# FlywayProperties.java                     60

\# WebProperties.java                        31

## Listing 3: Dataframe-based analysis of the spring-boot SCG data

Looking at the source code of ConfigurationPropertyName.java, we can find many examples of mutable variables as presented in Listing [4](/html/2310.02128v2/#LST4 "Listing 4 ‣ 6.2 Project overview ‣ 6 Empirical Software Comprehension with Semantic Code Graph ‣ Semantic Code Graph – an information model to facilitate software comprehension") (e.g., int start) or immutable variables missing the final modifier (e.g., int length). It can be observed that many cases of the latter particularly contribute to the large number of variables. In comparison, the common-io project correctly uses the final keyword for each immutable local variable (see Listing [5](/html/2310.02128v2/#LST5 "Listing 5 ‣ 6.2 Project overview ‣ 6 Empirical Software Comprehension with Semantic Code Graph ‣ Semantic Code Graph – an information model to facilitate software comprehension")), a good practice in the Java code, effectively transforming such variables into immutable VALUEs. Consequently, we can conclude that the quality of the source code of the spring-boot project could be improved by eliminating the excessive number of local mutable variables.

Elements parse(Function\<CharSequence,

               CharSequence\> valueProcessor) {

    int length = this.source.length();

    int openBracketCount = 0;

    int start = 0;

    ElementType type = ElementType.EMPTY;

    …

}

Listing 4: Example of local variables’ definitions in spring-boot ConfigurationPropertyName.java file

public static void copy(

        final String input,

        final OutputStream output,

        final String encoding)

            throws IOException {

    final StringReader in =

        new StringReader(input);

    final OutputStreamWriter out =

        new OutputStreamWriter(output, encoding);

    copy(in, out);

    out.flush();

}

## Listing 5: Example of final local variables definition in commons-io project

A different case of using variables that we have found are non-local variables present in spring-boot property files, such as ServerProperties.java, KafkaProperties.java, RabbitProperties.java, FlywayProperties.java. These files contain different configuration settings, such as the defined port field presented in Listing [6](/html/2310.02128v2/#LST6 "Listing 6 ‣ 6.2 Project overview ‣ 6 Empirical Software Comprehension with Semantic Code Graph ‣ Semantic Code Graph – an information model to facilitate software comprehension"), which are accessed through global accessors. While this has been a standard Java approach for classes representing some internal state, currently the recommended practice is to introduce specialized constructors and add final modifiers for global private fields to eliminate accidental mutability. Performing such refactoring is another example of recommendation that we can formulate in order to increase the quality of the project source code.

/\*\*

\* Server HTTP port.

\*/

private Integer port;

public Integer getPort() {

    return this.port;

}

public void setPort(Integer port) {

    this.port = port;

}

Listing 6: Example of global variable definition in spring-boot ServerProperties.java file with accessors methods

Figure 11: Top 6 SCG nodes distribution in analyzed projects.

Figure 12: Top 5 SCG edges distribution in analyzed projects.

Conclusions. The SCG represents a variety of code entities and their relations, offering a much more detailed project overview compared to CCN or CG models. Visualization of the percentage distribution of main code entities and relations (Fig. [11](/html/2310.02128v2/#S6.F11 "Figure 11 ‣ 6.2 Project overview ‣ 6 Empirical Software Comprehension with Semantic Code Graph ‣ Semantic Code Graph – an information model to facilitate software comprehension") and Fig. [12](/html/2310.02128v2/#S6.F12 "Figure 12 ‣ 6.2 Project overview ‣ 6 Empirical Software Comprehension with Semantic Code Graph ‣ Semantic Code Graph – an information model to facilitate software comprehension")) has led us not only to identify an excessive number of variables in some Java projects, but also to distinguish between local and global variables. This enabled us to easily identify the most problematic files, draw conclusions, and suggest actionable insights. Thanks to the level of detail provided by the SCG model, where nodes can be augmented with additional contextual information (such as entity LOC size and entity code complexity), comprehensive overviews can be presented.

### 6.3 Project structure comprehension

In this example, we demonstrate how project structure discovery can be performed by looking at various graph metrics, described in Table [4](/html/2310.02128v2/#S6.T4 "Table 4 ‣ 6.3 Project structure comprehension ‣ 6 Empirical Software Comprehension with Semantic Code Graph ‣ Semantic Code Graph – an information model to facilitate software comprehension"). For each project, we computed all metrics for the full SCG, the Call Graph and the Class Collaboration Network. The results are presented in Table [5](/html/2310.02128v2/#S6.T5 "Table 5 ‣ 6.3 Project structure comprehension ‣ 6 Empirical Software Comprehension with Semantic Code Graph ‣ Semantic Code Graph – an information model to facilitate software comprehension").

| Property | Explanation |
|----|----|
| Density ($`D`$) | \|D\|=\|E\|\|V\|(\|V\|-1) |
|  | Density of the graph – measure of how closely connected the graph is. High SCG density can indicate higher code dependency complexity. $`D \in {\lbrack 0,1\rbrack}`$ |
| Average Node Degree ($`A_{D}`$) | A_D = \|E\|\|V\| |
|  | High average degree of nodes, especially combined with high density, suggests high project coupling; on the contrary, high node average degree with low density might imply a significant number of hubs. |
| Standard Deviation of incoming/outgoing node degree distribution ($`\sigma_{ID}`$/$`\sigma_{OD}`$) | σ= 1\|V\|∑\_i=1^\|V\| (d_i - A_D)^2 Where:  •  $`|V|`$ is number of nodes  •  $`d_{i}`$ is an incoming or outgoing degree of a node $`i`$ |
|  | A high standard deviation in the node degree distribution indicates significant variability in node degrees. This may suggest that certain entities exhibit considerably higher incoming or outgoing degrees than the average. Consequently, a high standard deviation might indicate greater code complexity and coupling. |
| Index of Dispersion of incoming/outgoing node degree distribution ($`IoD_{ID}`$/$`IoD_{OD}`$) | IoD = σ2AD Where:  •  $`\sigma^{2}`$ is the variance of the node degrees (incoming or outgoing) |
|  | Related to Standard Deviation. If the $`IoD`$ is greater than 1, it indicates that the node degrees are more variable (dispersed) than what one would expect from a Poisson distribution. A high $`IoD`$ suggests that the network may possess a scale-free structure, characterized by a few highly connected nodes (hubs) and numerous nodes with lower degrees. |
| Average Clustering Coefficient (ACC) | ACC = 1\|V\| ∑\_i=1^\|V\| 2Tidi(di- 1) Where:  •  $`T_{i}`$ represents the number of triangles (closed triplets) that node $`i`$ is part of.  •  $`d_{i}`$ represents the degree of node $`i`$ |
|  | The average clustering coefficient provides an average measure of how tightly interconnected nodes are in local neighborhoods across the entire network. $`{ACC} \in {\lbrack 0,1\rbrack}`$ |
| Global Clustering Coefficient (GCC) | GCC = 3 ×number_of_trianglesnumber_of_triplets |
|  | High value indicates that graph tends to create interconnected clusters, low value indicates the network being sparse or fragmented. For SCG high GCC value can indicate well-modularized software with high module cohesion and low coupling. $`{GCC} \in {\lbrack 0,1\rbrack}`$ |
| Degree Assortativity Coefficient (DAC) | DAC=∑i,j(Aij- dikj/2m)didj∑i,j(Ai,jdi2- didj2mdidj) where \[[58](/html/2310.02128v2/#bib.bib58)\]:  •  $`A`$ is the adjacency matrix  •  $`d_{i}`$ is the degree of the node $`i`$  •  $`m`$ is the total number of edges |
|  | Positive value indicates that nodes with the same degree tends to be connected, negative value suggest mostly connections between nodes of different degree, value close to zero suggest random network. For SCG low DAC can suggest additional tendency of the graph towards clustering and establishing hubs (connection between nodes with different degree). $`{DAC} \in {\lbrack{- 1},1\rbrack}`$ |

Table 4: Metrics calculated for the SCG, CCN and CG software networks.

|  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|
| Name | Version | \#LOC | $`|V|`$ | $`\frac{\# LOC}{|V|}`$ | $`|E|`$ | $`D`$ | $`A_{D}`$ | $`\sigma_{ID}`$ | $`IoD_{ID}`$ | $`\sigma_{OD}`$ | $`IoD_{OD}`$ | ACC | GCC | DAC |
| Semantic Code Graph |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| \cdashline1-15 retrofit | 2.9.0 | 13676 | 3035 | 4.51 | 10137 | 0.00110 | 3.3 | 6.2 | 11.7 | 13.8 | 57.4 | 0.16 | 0.03 | -0.05 |
| commons-io | 2.12.0 | 46526 | 7418 | 6.27 | 21257 | 0.00039 | 2.9 | 3.3 | 3.7 | 7.2 | 17.8 | 0.13 | 0.07 | -0.23 |
| playframework | 2.8.19 | 57592 | 23058 | 2.50 | 67080 | 0.00013 | 2.9 | 9.1 | 28.6 | 10.5 | 38.0 | 0.10 | 0.03 | -0.08 |
| metals | 0.10.3 | 58172 | 19511 | 2.98 | 53347 | 0.00014 | 2.7 | 3.2 | 3.8 | 10.5 | 40.7 | 0.08 | 0.03 | -0.14 |
| glide | 4.5.11 | 65397 | 15459 | 4.23 | 53211 | 0.00022 | 3.4 | 5.3 | 8.3 | 8.3 | 20.1 | 0.15 | 0.08 | -0.27 |
| vert.x | 4.4.4 | 102189 | 24498 | 4.17 | 86664 | 0.00014 | 3.5 | 12.5 | 44.1 | 10.8 | 33.2 | 0.13 | 0.03 | 0.17 |
| RxJava | 3.1.6 | 188189 | 37729 | 4.99 | 118788 | 0.00008 | 3.1 | 11.9 | 45.2 | 7.7 | 19.0 | 0.12 | 0.02 | -0.06 |
| dubbo | 3.2.4 | 247943 | 57601 | 4.30 | 203693 | 0.00006 | 3.5 | 11.2 | 35.5 | 9.3 | 24.5 | 0.14 | 0.04 | -0.04 |
| spring-boot | 2.7.5 | 330424 | 64190 | 5.15 | 186816 | 0.00005 | 2.9 | 4.0 | 5.4 | 6.0 | 12.3 | 0.16 | 0.09 | -0.12 |
| akka | 2.7.0 | 337559 | 122355 | 2.76 | 436691 | 0.00003 | 3.6 | 17.8 | 88.9 | 20.3 | 115.9 | 0.12 | 0.01 | -0.05 |
| akka (without tests) | 2.7.0 | 234445 | 90195 | 2.60 | 295957 | 0.00004 | 3.3 | 13.4 | 54.5 | 11.3 | 38.9 | 0.12 | 0.02 | -0.08 |
| spark | 3.3.0 | 527149 | 164772 | 3.20 | 561314 | 0.00002 | 3.4 | 16.9 | 84.0 | 16.7 | 81.9 | 0.09 | 0.01 | -0.03 |
| Class Collaboration Network |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| \cdashline1-15 retrofit | 2.9.0 | 13676 | 183 | 74.73 | 473 | 0.01420 | 2.6 | 12.2 | 57.5 | 2.0 | 1.5 | 0.23 | 0.08 | -0.61 |
| commons-io | 2.12.0 | 46526 | 174 | 267.39 | 438 | 0.01455 | 2.5 | 8.8 | 30.9 | 4.9 | 9.7 | 0.09 | 0.09 | -0.22 |
| playframework | 2.8.19 | 57592 | 1208 | 47.68 | 4935 | 0.00338 | 4.1 | 29.3 | 209.9 | 19.2 | 89.9 | 0.09 | 0.02 | 0.10 |
| metals | 0.10.3 | 58172 | 680 | 85.55 | 1427 | 0.00309 | 2.1 | 4.6 | 10.1 | 3.2 | 4.8 | 0.05 | 0.10 | -0.61 |
| glide | 4.5.11 | 65397 | 707 | 92.50 | 2597 | 0.00520 | 3.7 | 11.6 | 36.7 | 5.5 | 8.4 | 0.16 | 0.15 | -0.42 |
| vert.x | 4.4.4 | 102189 | 600 | 170.32 | 4960 | 0.01380 | 8.3 | 39.3 | 186.6 | 13.4 | 21.8 | 0.18 | 0.46 | -0.30 |
| RxJava | 3.1.6 | 188189 | 1564 | 120.33 | 6787 | 0.00278 | 4.3 | 36.1 | 299.7 | 11.0 | 28.1 | 0.16 | 0.84 | -0.40 |
| dubbo | 3.2.4 | 247943 | 2030 | 122.14 | 8641 | 0.00210 | 4.3 | 33.1 | 256.6 | 5.8 | 7.8 | 0.15 | 0.03 | -0.17 |
| spring-boot | 2.7.5 | 330424 | 3199 | 103.29 | 7096 | 0.00069 | 2.2 | 6.1 | 16.8 | 3.5 | 5.5 | 0.10 | 0.09 | -0.14 |
| akka | 2.7.0 | 337559 | 8107 | 41.64 | 27250 | 0.00041 | 3.4 | 30.4 | 274.4 | 12.9 | 49.9 | 0.06 | 0.19 | -0.09 |
| akka (without tests) | 2.7.0 | 234445 | 5477 | 42.81 | 21254 | 0.00071 | 3.9 | 31.4 | 253.7 | 15.5 | 62.2 | 0.07 | 0.25 | -0.05 |
| spark | 3.3.0 | 527149 | 6461 | 81.59 | 31742 | 0.00076 | 4.9 | 54.1 | 594.8 | 13.6 | 37.6 | 0.12 | 0.06 | -0.19 |
| Call Graph |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| \cdashline1-15 retrofit | 2.9.0 | 13676 | 1677 | 8.16 | 4151 | 0.00148 | 2.5 | 4.1 | 6.9 | 11.4 | 52.1 | 0.13 | 0.03 | -0.06 |
| commons-io | 2.12.0 | 46526 | 3604 | 12.91 | 7232 | 0.00056 | 2.0 | 3.2 | 5.0 | 4.9 | 12.0 | 0.08 | 0.06 | -0.22 |
| playframework | 2.8.19 | 57592 | 9469 | 6.08 | 16750 | 0.00019 | 1.8 | 5.9 | 19.9 | 6.5 | 24.0 | 0.01 | 0.01 | -0.05 |
| metals | 0.10.3 | 58172 | 10900 | 5.34 | 20638 | 0.00017 | 1.9 | 2.9 | 4.4 | 7.9 | 33.4 | 0.02 | 0.01 | -0.11 |
| glide | 4.5.11 | 65397 | 8863 | 7.38 | 24807 | 0.00032 | 2.8 | 5.0 | 8.9 | 7.2 | 18.4 | 0.12 | 0.06 | -0.22 |
| vert.x | 4.4.4 | 102189 | 13431 | 7.61 | 33828 | 0.00019 | 2.5 | 5.4 | 11.6 | 6.4 | 16.5 | 0.10 | 0.05 | -0.22 |
| RxJava | 3.1.6 | 188189 | 19348 | 9.73 | 43800 | 0.00012 | 2.3 | 5.3 | 12.5 | 5.9 | 15.2 | 0.10 | 0.04 | -0.14 |
| dubbo | 3.2.4 | 247943 | 33038 | 7.50 | 91100 | 0.00008 | 2.8 | 7.5 | 20.2 | 7.4 | 19.7 | 0.12 | 0.04 | -0.14 |
| spring-boot | 2.7.5 | 330424 | 36803 | 8.98 | 73727 | 0.00005 | 2.0 | 3.8 | 7.3 | 4.4 | 9.8 | 0.10 | 0.07 | 0.02 |
| akka | 2.7.0 | 337559 | 47621 | 7.09 | 107184 | 0.00005 | 2.3 | 12.5 | 69.8 | 7.0 | 21.8 | 0.01 | 0.01 | -0.05 |
| akka (without tests) | 2.7.0 | 234445 | 37916 | 6.18 | 87809 | 0.00006 | 2.3 | 11.9 | 61.5 | 7.3 | 23.3 | 0.01 | 0.01 | -0.05 |
| spark | 3.3.0 | 527149 | 90285 | 5.84 | 208191 | 0.00003 | 2.3 | 10.1 | 44.1 | 9.7 | 40.9 | 0.01 | 0.01 | -0.08 |

Table 5: Project characteristics extracted from the Semantic Code Graph, Class Collaboration Network and the Call Graph ($`D`$ = Density, $`A_{OD}`$ = Average out-degree, $`A_{ID}`$ = Average in-degree, $`\sigma`$ = Standard Degree Distribution Deviation, IoD = Degree Distribution Index of Dispersion, ACC = Average Clustering Coefficient, GCC = Global Clustering Coefficient, DAC = Degree Assortativity Coefficient)

The metrics show that for Java projects, there are on average more lines of code per graph node (code entity) than in Scala projects. This is expected as the Scala language is much more concise than Java. Nevertheless, the difference is quite significant with around 1.7 times as many code lines per node for Java projects. These metrics suggest that the Scala language can greatly contribute to lower code verbosity.

All projects have low density, although the SCG graph for the retrofit project is around 55 times denser than for the spark project. This metric is much higher also for CCN and CG models, possibly indicating a higher overall coupling level.

The incoming and outgoing degree distribution of SCG nodes, as presented in Figure [13](/html/2310.02128v2/#S6.F13 "Figure 13 ‣ 6.3 Project structure comprehension ‣ 6 Empirical Software Comprehension with Semantic Code Graph ‣ Semantic Code Graph – an information model to facilitate software comprehension"), follows a power-law distribution for each project, indicating that the network exhibits characteristics of a scale-free network \[[56](/html/2310.02128v2/#bib.bib56), [31](/html/2310.02128v2/#bib.bib31)\]. This is further supported by the low average node degree for each network, combined with a high standard deviation ($`\sigma`$) and a high index of dispersion ($`IoD`$) for both incoming and outgoing degree distributions. A scale-free network indicates the likely existence of highly connected code entities (hubs), which may represent core functionalities. Changes, removals, or vulnerabilities in relation to random low-level nodes are likely to have minimal effects on the software. Conversely, altering hubs can significantly impact the majority of the software in terms of structure, correctness and program execution performance. Upon examining all eleven analyzed projects, it becomes evident that the characteristics of node distribution are not correlated with either the project size or the project’s programming language. Additionally, although the average degree for each project is similar (approximately 3), the standard deviation and index of dispersion can vary significantly. A particularly high index of dispersion may signal the presence of outlier nodes with exceptionally high degree levels.

Figure 13: Nodes’ incoming and outgoing degree distribution for SCG model extracted for each analyzed project.

For example, the Retrofit project has an exceptionally high index of dispersion (third highest) for the outgoing node degree, observed both in SCG and CG networks, with values of 57.4 and 52.1, respectively. At the same time, this parameter is very small for the CCN network (the lowest), which is different to what we can observe for other projects. When examining the node degree distribution of the Retrofit project, as presented in Figure [14](/html/2310.02128v2/#S6.F14 "Figure 14 ‣ 6.3 Project structure comprehension ‣ 6 Empirical Software Comprehension with Semantic Code Graph ‣ Semantic Code Graph – an information model to facilitate software comprehension"), we observe an outlier node which corresponds to Builder#parseParameterAnnotation, a 455 lines-of-code method that has an extremely high outgoing node degree of 674. Degree and size of this method alone seems to indicate high method complexity and bad programming practices. Retrofit is an HTTP client that builds a client service based on a Java interface augmented by HTTP-related annotations. The Builder#parseParameterAnnotation method matches the annotations and builds the appropriate ParameterHandler. We recommend refactoring this method into smaller methods, with each method responsible for handling a particular annotation type and transforming it into a ParameterHandler. This will improve code readability, reduce the method’s complexity, and enhance the source code quality. It is worth noting that the outlier observed in the Builder#parseParameterAnnotation method could not be detected using the CCN model, as CCN operates at the abstract class level and does not consider method bodies or, in particular, local variables.

Figure 14: The incoming and outgoing degree distribution of nodes in the SCG, CCN, and CG models was extracted for the retrofit project, with a focus on identifying outlier nodes with high outgoing degrees in the SCG and CG networks.

For the SCG graph, the highest Index of Dispersion can be observed for akka project, with $`{IoD_{ID}} = 88.9`$ and $`{IoD_{OD}} = 115.9`$ which is much higher than in the case of all other projects. A detailed distribution of node degrees, presented in Fig. [13](/html/2310.02128v2/#S6.F13 "Figure 13 ‣ 6.3 Project structure comprehension ‣ 6 Empirical Software Comprehension with Semantic Code Graph ‣ Semantic Code Graph – an information model to facilitate software comprehension"), shows that a significant number of nodes have degrees above 100 and there are several nodes with outgoing and incoming degrees above 1000. Notable nodes include the method responsible for sending messages in the akka toolkit, ActorRef#! with an incoming degree of 2747, the ActorRef class representing actor references with a degree of 1898, and the GraphStageLogic#pull method responsible for pulling new messages in akka streams. Similar observations can be made for the CCN and CG networks. However, it is worth noting that CCN cannot identify critical methods, while CG falls short in identifying key class components. In this regard, the SCG information model provides the most comprehensive insight into important project outliers. Regarding $`IoD_{OD}`$, upon closer examination at node distribution presented at Fig. [15](/html/2310.02128v2/#S6.F15 "Figure 15 ‣ 6.3 Project structure comprehension ‣ 6 Empirical Software Comprehension with Semantic Code Graph ‣ Semantic Code Graph – an information model to facilitate software comprehension"), it appears to be primarily influenced by large test classes. Test cases implemented with the scalatest library reside within the test class body and contribute to the high outgoing node degree. Example include class ByteStringSpec with 2031 outgoing connections and class ORMapSpec with 1939 outgoing connections. We added also project characteristics computed for the akka project without tests, which confirms big influence of test files on project structure and node distribution – the value of $`IoD_{OD}`$ drops from 115.9 to 38.9. Interestingly, for CCN and CG models the network characteristics do not change much for akka whether with or without tests. It may be an interesting avenue for future research to investigate the impact of tests on the project structure.

Figure 15: The incoming and outgoing degree distribution of nodes in the SCG, CCN, and CG graphs extracted for the akka project. Nodes with high incoming degrees, such as the ActorRef class and the method ActorRef#!, serve as the primary building blocks for the akka project.

The low value of the Global Clustering Coefficient (GCC) indicates that the software forms a sparse network and does not manifest clustering tendency. A high GCC value would denote a high project clustering tendency, indicating that the network is well connected on the global level. On the other hand, the Average Clustering Coefficient (ACC) measures local clustering around individual nodes and places more weight on low-degree nodes. A high value of ACC would mean that the network is tightly connected, which violates good software practices and complicates software maintainability in the long run \[[11](/html/2310.02128v2/#bib.bib11)\]. All eleven analyzed projects have relatively low GCC and ACC values for both SCG and CG representations. Consequently, it should be expected that refactoring tasks related to software modularization should not be hindered by software structure. For CCN, the GCC values are higher, which is expected, as during CCN creation, the algorithm effectively applies path contraction to mark direct class dependencies and filter out entities other than classes. Class nodes contribute the most to the global structure and, hence, to clustering tendency. This naturally tightens the dependencies between entities and increases the clustering likelihood.

The RxJava project presents an interesting case, where we observe the largest spike of the GCC value (CCN model), reaching 0.84. High GCC and low ACC are typical characteristics of a small-world network, where most of the nodes are part of tightly-connected clusters, but there are a few hubs that bridge these clusters and shorten the path between otherwise distant nodes. A very high index of dispersion for incoming node degree equal to 299.7 might indicate that these hubs are nodes with particularly high incoming degree. Indeed, in Figure [16](/html/2310.02128v2/#S6.F16 "Figure 16 ‣ 6.3 Project structure comprehension ‣ 6 Empirical Software Comprehension with Semantic Code Graph ‣ Semantic Code Graph – an information model to facilitate software comprehension"), we can visually observe the project’s tendency for global clustering with a few hub nodes, such as Disposable, Observer, Function, and ObservableSource, being the top in-degree nodes. We can conclude that the CCN network, although extracted directly from the SCG model, provides an interesting perspective, showing the otherwise not visible clustering tendency of the RxJava project at the class-level granularity.

(a) Visualization of the CCN for the RxJava project reveals a clear tendency toward global clustering, confirmed by a high GCC value of 0.84. It also visually confirms the small-world network property. Low degree nodes on the outside contribute to an overall low ACC value.

(b) Degree Distribution for RxJava project with visible high degree outliers.

Figure 16: CCN visualization and degree distribution for the RxJava project confirming high tendency for global clustering.

These and similar metrics, apart from software comprehension activities, can also be used to assess the effort needed for certain refactoring activities or to measure the quality of the project structure throughout the evolution of the software. For example, increasing density and DAC with decreasing GCC can indicate project quality degradation.

Conclusions. When comparing the SCG with the CG and CCN in the context of metrics-driven project structure comprehension, we can conclude that the perspectives provided by all three models can be useful, depending on the particular case. The CCN model is noteworthy for its emphasis on critical building blocks in object-oriented programming, unveiling compelling details such as the clustering tendency of the RxJava class. Analysis of the CG graph, on the other hand, provides insights into the project structure from the perspective of project execution. However, being the superset of both CG and CCN, the SCG contains all these perspectives. Our experiments suggest that in order to gain a comprehensive insight, it might be useful to compute various graph metrics for both the full SCG and the SCG-extracted CCN and CG graphs.

### 6.4 Discovering critical project entities

The most important nodes in the project are usually the starting points that developers look at to comprehend the project completely from the beginning. An ordered list of the most influential entities can help with a more structured approach to reading the source code and learning about the project. Moreover, the most important nodes are those with the largest impact of change \[[45](/html/2310.02128v2/#bib.bib45)\]. In this case, the Semantic Code Graph representation, which is effectively the result of a static structural dependence program analysis, can act as an intermediate program representation used in the Change Impact Analysis \[[44](/html/2310.02128v2/#bib.bib44)\]. Due to a potential high impact of change, when adjusting the source code of the top entities during software maintenance, the code review process should be conducted thoroughly with extra care to preserve high source code quality for the most critical parts of the system.

We can assess the importance of project entities in a project by measuring the node size (in terms of the number of lines of code or by its outgoing/incoming degree), or by taking into account different metrics known in graph theory, such as graph centrality measures or node influence measures \[[25](/html/2310.02128v2/#bib.bib25)\]. For all nodes in the SCG graphs of the studied projects, we have computed nine different properties that can serve as different metrics to determine the top nodes:

1.  1.
    LOC – top nodes by Lines-of-Code metrics. Code entities that span a significant number of lines of code naturally have a greater impact on the project.
2.  2.
    Outgoing Degree – top nodes by the number of outgoing edges. Nodes with high degree suggest code entities aggregating big and likely important functionalities.
3.  3.
    Incoming Degree – top nodes by the number of incoming edges. Many incoming edges denote extensive direct usage of this node throughout the project.
4.  4.
    Eigenvector Centrality – top nodes computed by the Eigenvector Centrality \[[12](/html/2310.02128v2/#bib.bib12)\] algorithm. High value means that a node is connected to multiple nodes that themselves have a high EC score. This metric focuses on direct connections.
5.  5.
    Katz Centrality – top nodes computed by the Katz Centrality \[[37](/html/2310.02128v2/#bib.bib37)\] algorithm. High value of Katz Centrality metric is influenced not only by direct neighbors of a node but also by nodes connected indirectly.
6.  6.
    Page Rank – top nodes computed by Page Rank algorithm \[[15](/html/2310.02128v2/#bib.bib15)\]. Page Rank centrality is a variant of Eigenvector centrality which assigns a PR value to a node based on the number of nodes linking to this node and their PR values. This metric is affected by the importance of incoming links from highly ranked nodes.
7.  7.
    Betweenness Centrality – top nodes computed by the Betweenness Centrality aglorithm \[[14](/html/2310.02128v2/#bib.bib14)\]. High value of BC denotes that there are multiple shortest paths between other nodes going through this node. This metric indicates nodes crucial for the flow of information in the network.
8.  8.
    Harmonic Centrality – top nodes computed by the Harmonic Centrality algorithm \[[68](/html/2310.02128v2/#bib.bib68)\] (Closeness Centrality metric for disconnected graphs). A node with high value of Harmonic Centrality is one that is close to many other nodes in the network.

## Finally, we propose a combined importance metric that takes into account all metrics described above:

1.  9.
    Combined importance – the metric is computed as follows: for each metric 1-8, take 20 nodes with the highest value (top 20 nodes). Assign scores to all positions using a reverse scoring system (position 1 = 20 points, position 20 = 1 point). Rank the nodes based on the sum of their scores. In other words, the top nodes will be the ones that scored highly in multiple metrics.

The most important nodes in the full SCG, Class Collaboration Network and the Call Graph in terms of different centrality metrics are presented in the Tables [6](/html/2310.02128v2/#S6.T6 "Table 6 ‣ 6.4 Discovering critical project entities ‣ 6 Empirical Software Comprehension with Semantic Code Graph ‣ Semantic Code Graph – an information model to facilitate software comprehension"), [7](/html/2310.02128v2/#S6.T7 "Table 7 ‣ 6.4 Discovering critical project entities ‣ 6 Empirical Software Comprehension with Semantic Code Graph ‣ Semantic Code Graph – an information model to facilitate software comprehension"), and [8](/html/2310.02128v2/#S6.T8 "Table 8 ‣ 6.4 Discovering critical project entities ‣ 6 Empirical Software Comprehension with Semantic Code Graph ‣ Semantic Code Graph – an information model to facilitate software comprehension"). It should be noted that the resulting top nodes vary significantly for different metrics. In fact, metrics capture different aspects of potential node importance \[[25](/html/2310.02128v2/#bib.bib25)\]. For example, high out-degree points to hubs, which can represent a structure encapsulating bigger chunk of related functionalities (such as class nodes), whereas high in-degree reveals nodes which are referenced by many other nodes and can be treated as project main building blocks. Metrics such as Eigenvector, Katz, or PageRank Centrality measure the importance of the node, which is influenced by the importance of its neighbors. Such nodes can be the most important code units from the maintenance point of view, where the introduced changes can have a great project-wide impact. Metrics such as Betweenness Centrality or Harmonic Centrality take into account the topological position in the graph and show the distance-wise central nodes through which many shortest paths lead, or nodes which are the closest nodes to multiple other nodes in the graph. These metrics might be especially meaningful for the call graph, indicating frequently called nodes on different execution paths.

|  |  |  |  |  |  |  |
|----|----|----|----|----|----|----|
|  | 1. Lines of Code | \# | 2. Outgoing Degree | \# | 3. Incoming Degree | \# |
| Semantic Code Graph |  |  |  |  |  |  |
| \cdashline1-7 retrofit | RequestFactory | 800 | parseParameterAnnotation | 674 | Call | 147 |
| commons-io | IOUtils | 3608 | FileUtils | 176 | IOFileFilter | 131 |
| playframework | Multipart | 706 | PlayDocsValidation | 367 | Mapping | 882 |
| metals | MetalsLanguageServer | 2501 | updateWorkspaceDirectory | 503 | server | 157 |
| glide | BaseRequestOptions | 1398 | initializeDefaults | 261 | with | 183 |
| vert.x | HttpClientOptions | 1448 | MimeMapping | 990 | MimeMapping#m | 989 |
| RxJava | Flowable | 20738 | Flowable | 541 | Disposable | 1251 |
| dubbo | URL | 1714 | PojoUtils#realize1 | 390 | URL | 1891 |
| spring-boot | ServerProperties | 1757 | configureProperties | 300 | from | 330 |
| akka | Source | 3896 | ByteStringSpec | 2031 | ActorRef#! | 2747 |
| spark | functions | 5380 | ScalaUDF | 2677 | Expression | 3561 |
| Class Collaboration Network |  |  |  |  |  |  |
| \cdashline1-7 retrofit | RequestFactory | 800 | HttpServiceMethod | 12 | Converter | 115 |
| commons-io | IOUtils | 3608 | FileFilterUtils | 48 | IOFileFilter | 102 |
| playframework | Multipart | 706 | Forms | 582 | Mapping | 876 |
| metals | MetalsLanguageServer | 2501 | MetalsLanguageServer | 29 | MetalsLanguageClient | 37 |
| glide | BaseRequestOptions | 1398 | Engine | 60 | Options | 143 |
| vert.x | HttpClientOptions | 1448 | FileSystemImpl | 110 | Handler | 615 |
| RxJava | Flowable | 20738 | Observable | 317 | Disposable | 927 |
| dubbo | URL | 1714 | RegistryProtocol | 90 | URL | 1250 |
| spring-boot | ServerProperties | 1757 | Binder | 78 | ConfigurationPropertyName | 150 |
| akka | Source | 3896 | GraphApply | 853 | ActorRef | 1441 |
| spark | functions | 5380 | functions | 851 | Expression | 2922 |
| Call Graph |  |  |  |  |  |  |
| \cdashline1-7 retrofit | parseParameterAnnotation | 456 | parseParameterAnnotation | 417 | Builder#method | 77 |
| commons-io | FilenameUtils#doNormalize | 96 | FilenameUtils#doNormalize | 119 | CloseableURLConnection#urlConnection | 46 |
| playframework | webSocketProtocol | 349 | forwardsRouter#apply | 120 | unbindAndValidate | 257 |
| metals | updateWorkspaceDirectory | 419 | updateWorkspaceDirectory | 431 | XtensionJavaFuture#asScala | 101 |
| glide | initializeDefaults | 245 | initializeDefaults | 183 | Glide#with | 182 |
| vert.x | EventBusOptionsConverter#fromJson | 254 | TCPServerBase#listen | 170 | Future#onComplete | 170 |
| RxJava | MemoryPerf#main | 378 | ConcatMapEagerMainObserver#drain | 134 | Exceptions#throwIfFatal | 347 |
| dubbo | PojoUtils#realize1 | 249 | PojoUtils#realize1 | 229 | StringUtils#isEmpty | 418 |
| spring-boot | MavenBuild#execute | 73 | configureProperties | 233 | PropertyMapper#from | 329 |
| akka | UnzipWith22#createLogic | 476 | DistributedPubSubMediator#receive | 256 | GraphStageLogic#pull | 1501 |
| spark | prepareSubmitEnvironment | 641 | prepareSubmitEnvironment | 679 | Params#\$ | 1382 |

Table 6: Top nodes in the studied projects in terms of general properties (1. Lines of Code, 2. Outgoing Degree, 3. Incoming Degree);

|  |  |  |  |  |  |  |
|----|----|----|----|----|----|----|
|  | 4. Eigenvector Centrality | \# | 5. Katz Centrality | \# | 6. Page Rank | \# |
| Semantic Code Graph |  |  |  |  |  |  |
| \cdashline1-7 retrofit | Utils#toResolve | 0.6051 | Call | 2.5066 | Call | 0.0180 |
| commons-io | Tailer#tailable | 0.2603 | IOFileFilter | 2.3425 | IOFileFilter | 0.0131 |
| playframework | Request#\[A\] | 0.2977 | Mapping | 10.1967 | Mapping | 0.0105 |
| metals | Version#major. | 0.4237 | BaseLspSuite#server | 2.5840 | AnsiStateMachine#apply | 0.0038 |
| glide | TranscodeType | 0.3777 | Glide#with | 2.8629 | Key | 0.0069 |
| vert.x | HttpMethod | 0.4860 | MimeMapping#m | 10.8902 | HttpMethod | 0.0143 |
| RxJava | Flowable | 0.5522 | Disposable | 13.9548 | Disposable | 0.0370 |
| dubbo | URL#urlAddress | 0.3399 | URL | 20.9279 | URL | 0.0201 |
| spring-boot | Regex#group | 0.5066 | PropertyMapper#from | 4.3904 | DependencyVersion | 0.0050 |
| akka | Source | 0.4295 | ActorRef#! | 29.0573 | ReplicatedData | 0.0246 |
| spark | ConfigBuilder#version | 0.3444 | Expression | 37.9700 | Expression | 0.0158 |
| Class Collaboration Network |  |  |  |  |  |  |
| \cdashline1-7 retrofit | Converter | 0.8521 | Converter | 2.1933 | Callback | 0.2146 |
| commons-io | TailerListener | 0.8256 | IOFileFilter | 2.0228 | PathFilter | 0.0538 |
| playframework | Binding | 0.9392 | Mapping | 9.7610 | TypedEntry | 0.3800 |
| metals | Cancelable | 0.5952 | MetalsLanguageClient | 1.3770 | Cancelable | 0.0174 |
| glide | Transformation | 0.3522 | Options | 2.4766 | Editor | 0.0605 |
| vert.x | Handler | 0.7364 | Handler | 8.3021 | Buffer | 0.1275 |
| RxJava | Scheduler | 0.6571 | Disposable | 10.7265 | ParallelFlowable | 0.1242 |
| dubbo | ApplicationModel | 0.4460 | URL | 13.9248 | URLAddress | 0.2983 |
| spring-boot | ConditionMessage | 0.7171 | ConfigurationPropertyName | 2.5881 | Builder | 0.2276 |
| akka | ForwardOps | 0.4815 | Graph | 16.1818 | ActorRef | 0.1371 |
| spark | Column | 0.5824 | Expression | 31.2843 | Param | 0.1191 |
| Call Graph |  |  |  |  |  |  |
| \cdashline1-7 retrofit | Utils#resolve | 0.4450 | Builder#method | 1.7843 | Utils#getRawType | 0.0124 |
| commons-io | FileAlterationObserver#listFiles | 0.8323 | CloseableURLConnection#urlConnection | 1.4605 | AbstractFileFilter#accept | 0.0159 |
| playframework | Multipart#partStart | 0.3389 | Mapping#bind | 3.5704 | Configuration#underlying. | 0.0018 |
| metals | SemanticdbTreePrinter#printSymbol | 0.4449 | XtensionJavaFuture#asScala | 2.0247 | XtensionAbsolutePath#path | 0.0028 |
| glide | RequestBuilder#thumbnailBuilder | 0.4773 | Glide#with | 2.8308 | Preconditions#checkNotNull | 0.0040 |
| vert.x | JsonParserImpl#handleEvent | 0.4855 | Future#onComplete | 2.7083 | JsonObject#map | 0.0065 |
| RxJava | MergeObserver#observers | 0.5741 | Exceptions#throwIfFatal | 4.4854 | DISPOSED | 0.0040 |
| dubbo | JavaBeanDescriptor | 0.5246 | StringUtils#isEmpty | 5.3694 | URL#getParameter | 0.0068 |
| spring-boot | JSONTokener#pos | 0.7939 | PropertyMapper#from | 4.3362 | PropertiesConfigAdapter#properties | 0.0012 |
| akka | WorkPullingProducerControllerImpl#context. | 0.3596 | GraphStageLogic#pull | 16.4494 | ActorRef#! | 0.0021 |
| spark | StructField#name | 0.8183 | Params#\$ | 15.0390 | AnalysisException#\ | 0.0030 |

Table 7: Top nodes in the studied projects in terms of influence-based centrality metrics (4. Eigenvector Centrality, 5. Katz Centrality, 6. Page Rank);

|  |  |  |  |  |  |  |
|----|----|----|----|----|----|----|
|  | 7. Betweenness Centrality\* | \# | 8. Harmonic Centrality | \# | 9. Combined importance | \# |
| Semantic Code Graph |  |  |  |  |  |  |
| \cdashline1-7 retrofit | Retrofit | 537k | Builder#parseParameterAnnotation | 0.1023 | Retrofit | 5 |
| commons-io | IOStreams#forAll | 301k | FileUtils | 0.0924 | IOConsumer | 4 |
| playframework | RequestHeader | 3 434k | Forms | 0.0622 | RequestHeader | 5 |
| metals | Ammonite | 6 789k | MetalsLanguageServer | 0.1951 | MetalsLanguageServer | 4 |
| glide | Glide | 7 762k | Glide | 0.0854 | RequestBuilder | 6 |
| vert.x | VertxImpl | 45 953k | VertxImpl | 0.1208 | VertxImpl | 4 |
| RxJava | Flowable | 18 802k | Flowable | 0.0673 | Flowable | 7 |
| dubbo | URL | 79 424k | DubboBootstrap | 0.0450 | URL | 7 |
| spring-boot | Binder | 1 107k | BuildImageMojo#buildImage | 0.0106 | ConfigurationPropertyName | 5 |
| akka | TraversalBuilder | 106 628k | SystemMessageDeliverySpec | 0.0526 | ActorRef | 3 |
| spark | SparkContext | 714 504k | BaseSessionStateBuilder | 0.1034 | Expression | 4 |
| Class Collaboration Network |  |  |  |  |  |  |
| \cdashline1-7 retrofit | Retrofit | 0.243k | HttpServiceMethod | 0.0490 | Retrofit | 8 |
| commons-io | AbstractFileFilter | 0.075k | Uncheck | 0.0636 | IOFileFilter | 4 |
| playframework | Result | 2.4k | Helpers | 0.0377 | RequestHeader | 5 |
| metals | BuildTargets | 1.2k | DebugProvider | 0.0773 | BuildTargets | 4 |
| glide | Glide | 6.0k | Glide | 0.0827 | RequestManager | 5 |
| vert.x | Vertx | 13.7k | VertxImpl | 0.1507 | JsonObject | 4 |
| RxJava | Flowable | 12.5k | Single | 0.0197 | Flowable | 8 |
| dubbo | ApplicationModel | 51.0k | DubboBootstrap | 0.0355 | ApplicationModel | 5 |
| spring-boot | SpringApplication | 1.2k | Builder | 0.0095 | ConfigurationPropertyName | 4 |
| akka | Props | 2.7k | UnzipWithApply | 0.0084 | ActorRef | 4 |
| spark | SparkContext | 256.1k | SparkSession | 0.0200 | Expression | 5 |
| Call Graph |  |  |  |  |  |  |
| \cdashline1-7 retrofit | Retrofit#create | 15k | Builder#parseParameterAnnotation | 0.0895 | Builder#parseParameterAnnotation | 4 |
| commons-io | FilenameUtils#getPrefixLength | 2k | XmlStreamReader | 0.0131 | FilenameUtils#doNormalize | 4 |
| playframework | RangeResult#ofSource | 1k | PlayRequestHandler#handle | 0.0127 | Configuration#get | 3 |
| metals | MetalsLanguageServer#executeCommand | 35k | MetalsLanguageServer#executeCommand | 0.0627 | MetalsLanguageServer#executeCommand | 4 |
| glide | Glide#initializeGlide | 107k | MultiRequestTest#(…)whenRequestListenerIsCalled | 0.0167 | Glide#with | 4 |
| vert.x | TCPSSLOptions | 16k | BareCommand#startVertx | 0.0108 | ContextInternal#promise | 3 |
| RxJava | SpscLinkedArrayQueue | 1690 | MemoryPerf#main | 0.0028 | DisposableHelper#dispose | 4 |
| dubbo | FrameworkModel#defaultModel | 1 408k | ReferenceConfig#init | 0.0113 | Node#getUrl | 3 |
| spring-boot | SpringApplication#run | 30k | BuildImageMojo#buildImage | 0.0061 | SpringApplication#run | 4 |
| akka | GraphStageLogic#internalCompleteStage | 137k | ClusterCoreDaemon#initialized() | 0.0034 | GraphStageLogic#pull | 4 |
| spark | SparkContext#clean | 242k | ALSExample#main | 0.0052 | Params#set | 3 |

Table 8: Top nodes in the studied projects in terms of distance-based centrality metrics (7. Betweennness Centrality, 8. Harmonic Centrality) and according to the proposed 9. combined metric. \*the value of Betweennes Centrality was not normalized and the total number of shortest paths going through a particular node is used for more convenient result presentation.

Finally, there are nodes ranked highly according to multiple metrics, indicating units particularly important for the entire project. Our combined importance metric was proposed with the purpose of finding such cases. The top three nodes according to the combined importance metric for each project are presented in Tab. [9](/html/2310.02128v2/#S6.T9 "Table 9 ‣ 6.4 Discovering critical project entities ‣ 6 Empirical Software Comprehension with Semantic Code Graph ‣ Semantic Code Graph – an information model to facilitate software comprehension"). It is particularly interesting to observe the difference in results obtained from the Full SCG versus the Call Graph and Class Collaboration Network. For example, the critical SCG nodes for the metals project are classes MetalsLanguageServer, BuildTargets, and MetalsLanguageClient. These nodes are important from the project structure perspective, i.e., for the purpose of software comprehension in the context of project understanding or planning refactoring activities. Indeed, metals is a Language Server Protocol implementation for Scala, where MetalsLanguageServer#languageClient represents the tool (IDE) and MetalsLanguageServer implements all the functionalities required by the client, so these are two most important and complementary classes. BuildTargets is a non-obvious candidate for the important node, but on the closer inspection we can learn that BuildTargets is a in-memory cache for looking up build server metadata and is involved in most of the metals functionalities. For the Class Collaboration Network, BuildTargets is also the most important node, followed by Cancelable and Compilers. Cancelable is a trait that is extended by more than twenty different classes, making it an important node from the class inheritance perspective. The Compilers class is used in eight different places as a constructor argument for eight top-level classes in Metals, and because of that, it has a high influence score (it is a top node according to Eigenvector Centrality and Page Rank metrics). On the other hand, the results obtained from the Call Graph clearly reflect the runtime perspective, focusing on invocation dependencies. For the metals project, the important nodes in the Call Graph are the MetalsLanguageServer#executeCommand method which is responsible for executing a large set of commands, the MetalsLanguageServer#updateWorkspaceDirectory method responsible for initialization of almost forty different providers in MetalsLanguageServer, and the XtensionJavaFuture#asScala helper method used in all the places when metals interacts directly with the underlying Java based LSP4J³⁸³⁸38[https://projects.eclipse.org/projects/technology.lsp4j](https://projects.eclipse.org/projects/technology.lsp4j) client. These methods are critical from the runtime, and hence performance and program execution correctness, perspective.

|  |  |  |  |  |  |  |
|----|----|----|----|----|----|----|
| Name | \#1 | \# | \#2 | \# | \#3 | \# |
| Semantic Code Graph |  |  |  |  |  |  |
| \cdashline1-7 retrofit | Retrofit | 5 | parseParameterAnnotation | 4 | Converter | 4 |
| commons-io | IOConsumer | 4 | IOCase | 3 | IOStream | 3 |
| playframework | RequestHeader | 5 | Result | 4 | AkkaHttpServer | 3 |
| metals | MetalsLanguageServer | 4 | BuildTargets | 2 | MetalsLanguageServer#languageClient. | 2 |
| glide | RequestBuilder | 7 | RequestManager | 4 | Request | 3 |
| vert.x | VertxImpl | 4 | ContextInternal | 4 | Future | 4 |
| RxJava | Flowable | 7 | Observable | 6 | Single | 5 |
| dubbo | URL | 7 | ApplicationModel | 4 | Invoker | 3 |
| spring-boot | ConfigurationPropertyName | 5 | SpringApplication | 3 | ConfigurationPropertySource | 3 |
| akka | ActorRef | 3 | Source | 3 | ActorRef#! | 2 |
| spark | Expression | 4 | SparkContext | 3 | RDD | 3 |
| Class Collaboration Network |  |  |  |  |  |  |
| \cdashline1-7 retrofit | Retrofit | 8 | Factory | 6 | Call | 5 |
| commons-io | IOFileFilter | 4 | IOStream | 4 | AbstractFileFilter | 4 |
| playframework | RequestHeader | 5 | Result | 5 | PlayBodyParsers | 4 |
| metals | BuildTargets | 4 | Cancelable | 4 | Compilers | 4 |
| glide | RequestManager | 5 | RequestBuilder | 5 | Key | 4 |
| vert.x | JsonObject | 4 | Vertx | 4 | Handler | 4 |
| RxJava | Flowable | 8 | Single | 6 | Maybe | 5 |
| dubbo | ApplicationModel | 5 | URL | 5 | ModuleModel | 5 |
| spring-boot | ConfigurationPropertyName | 4 | ServerProperties | 4 | ConditionOutcome | 4 |
| akka | ActorRef | 4 | SubFlow | 3 | GraphStageLogic | 3 |
| spark | Expression | 5 | DataType | 4 | RDD | 4 |
| Call Graph |  |  |  |  |  |  |
| \cdashline1-7 retrofit | parseParameterAnnotation | 4 | Utils#resolve | 4 | RequestFactory.Builder#build | 4 |
| commons-io | FilenameUtils#doNormalize | 4 | XmlStreamReader#calculateHttpEncoding | 3 | IOBaseStream#unwrap | 3 |
| playframework | Configuration#get | 3 | RequestHeader#attrs | 3 | Route#call | 3 |
| metals | MetalsLanguageServer#executeCommand | 4 | updateWorkspaceDirectory | 3 | XtensionJavaFuture#asScala | 3 |
| glide | Glide#with | 4 | Preconditions#checkNotNull | 3 | LoadBytesTest#context | 3 |
| vert.x | TCPServerBase#listen | 3 | ContextInternal#promise | 3 | BufferImpl#buffer | 3 |
| RxJava | DisposableHelper#dispose | 4 | ConcatMapEagerMainObserver#drain | 4 | DisposableHelper#setOnce | 4 |
| dubbo | Node#getUrl | 3 | DubboCodec#decodeBody | 3 | StringUtils#isEmpty | 3 |
| spring-boot | SpringApplication#run | 4 | PropertyMapper#get | 3 | FlywayConfiguration#configureProperties | 3 |
| akka | GraphStageLogic#pull | 4 | GraphStageLogic#completeStage | 4 | ActorRef#! | 3 |
| spark | Column#expr | 3 | Params#set | 3 | Expression#dataType | 3 |

Table 9: Top 3 nodes in the studied projects according to the combined importance calculated for the full SCG, the Class Collaboration Network, and the Call Graph.

To evaluate the performance of the SCG model in finding critical entities compared to CCN and CG, we conducted a survey based on the data presented in Table [9](/html/2310.02128v2/#S6.T9 "Table 9 ‣ 6.4 Discovering critical project entities ‣ 6 Empirical Software Comprehension with Semantic Code Graph ‣ Semantic Code Graph – an information model to facilitate software comprehension"). The survey posed a single question: "What is the most important entity set in terms of software maintenance for a given project?" For each of the eleven projects, participants were presented with three options to choose from, i.e., the top three combined nodes for SCG, CCN, or CG, respectively. Participants were instructed to vote only if they were familiar with the project in question. The results are presented in Fig. [17](/html/2310.02128v2/#S6.F17 "Figure 17 ‣ 6.4 Discovering critical project entities ‣ 6 Empirical Software Comprehension with Semantic Code Graph ‣ Semantic Code Graph – an information model to facilitate software comprehension").

Figure 17: The survey results to evaluate the performance of SCG, CCN and CG in finding crucial entities. Participants were asked the question, "What is the most important entity set in terms of software maintenance for a given project?" For each project, participants were provided with three sets of the three most important nodes computed using the SCG, CCN, and CG models, respectively. Results are presented only for projects with more than 10 answers.

We received a total of 26 survey responses; however, some projects garnered fewer answers, likely due to lesser familiarity among the respondents. For further quantitative analysis we considered only projects with 10 or more responses, thus excluding dubbo (two answers), glide (two answers), commons-io (six answers), retrofit (six answers), and vert.x (eight answers) projects.

*Conclusions.* An overview of survey results is presented in Fig. [18](/html/2310.02128v2/#S6.F18 "Figure 18 ‣ 6.4 Discovering critical project entities ‣ 6 Empirical Software Comprehension with Semantic Code Graph ‣ Semantic Code Graph – an information model to facilitate software comprehension"). On average, users pointed to SCG-based results as the most important set 64% of the time, while CCN and CG models were chosen 25% and 10% of the time, respectively. Interestingly, for every project except RxJava, the SCG-based set received the highest number of votes. Consequently, the survey indicates that the SCG model led to more accurate results in comparison with CCN and CG models.

Figure 18: The comparison of SCG, CCN and CG performance for crucial nodes discovery based on survey results presented in Fig. [17](/html/2310.02128v2/#S6.F17 "Figure 17 ‣ 6.4 Discovering critical project entities ‣ 6 Empirical Software Comprehension with Semantic Code Graph ‣ Semantic Code Graph – an information model to facilitate software comprehension"). The figure illustrates the percentage of votes assigned to each set of nodes for every project with 10 or more responses in the survey. This provides a detailed overview of the user preferences and highlights the comparative performance of SCG, CCN, and CG in terms of crucial nodes discovery.

### 6.5 Interactive visualizations and answering reachability questions

SCG can be used as a base model to visualize the dependencies of the source code entities and answer different reachability questions \[[42](/html/2310.02128v2/#bib.bib42)\] effectively. Thanks to SCG, showing a call hierarchy is simply a matter of traversing the CALL edges from the given starting point node. Finding a path between two nodes can be solved with any shortest path algorithm. Due to SCG richness, interactive browsing can be augmented with structural details to show where the nodes are defined or what other important code relations are involved. Also, with SCG, we can create documentation of parts of the system and share it with other developers. These functionalities can be implemented in close relation to the source code thanks to the required SCG location property of each node and edge. The SCG was utilized in this way in Graph Buddy ³⁹³⁹39[https://github.com/VirtusLab/graphbuddy](https://github.com/VirtusLab/graphbuddy), a code browsing and visualization tool (Figure [19](/html/2310.02128v2/#S6.F19 "Figure 19 ‣ 6.5 Interactive visualizations and answering reachability questions ‣ 6 Empirical Software Comprehension with Semantic Code Graph ‣ Semantic Code Graph – an information model to facilitate software comprehension")). Answering reachability questions and documenting parts of the system with Graph Buddy was described in detail in \[[13](/html/2310.02128v2/#bib.bib13)\].

Figure 19: Visual Studio Code IDE with Graph Buddy, a tool for interactive source code visualization based on the SCG information model. The screenshot shows highlighted isCancelled declaration edge in the graph and the corresponding code.

Using Graph Buddy, developers could complete typical code browsing tasks in a more convenient way than using features available in popular IDEs. Moreover, thanks to language-independence of the SCG model and the algorithm for stable identifiers described in section [4.6](/html/2310.02128v2/#S4.SS6 "4.6 Stable symbol identifiers for a multi-language SCG model ‣ 4 Semantic Code Graph extraction process ‣ Semantic Code Graph – an information model to facilitate software comprehension"), this tool uniquely supports multilingual projects that contain Java and Scala source code. Fig. [20](/html/2310.02128v2/#S6.F20 "Figure 20 ‣ 6.5 Interactive visualizations and answering reachability questions ‣ 6 Empirical Software Comprehension with Semantic Code Graph ‣ Semantic Code Graph – an information model to facilitate software comprehension") presents the visualization of our demo project⁴⁰⁴⁰40[https://github.com/liosedhel/semantic-code-graph-jvm-interop](https://github.com/liosedhel/semantic-code-graph-jvm-interop) where the Java class JavaGreeting is instantiated and later called from the Scala Hello companion object.

// ScalaGreeting.scala

class ScalaGreeting() {

  def greeting(): String =

    "Scala␣Greeting"

}

// JavaGreeting.java

public class JavaGreeting {

    public String greeting() {

        return "Java␣Greeting!";

    }

}

// Main.scala

object Hello extends App {

  val scalaGreeting =

    new ScalaGreeting()

  val javaGreeting =

    new JavaGreeting()

  println(

    scalaGreeting.greeting()

  )

  println(

    javaGreeting.greeting()

  )

}

(a) Scala and Java code mixed in one project.

(b) Interactive visualization of multi-language Semantic Code Graph in Graph Buddy tool.

Figure 20: The Semantic Code Graph generates stable element identifiers that allows for multilanguage analysis and visualization.

Conclusions. SCG-powered interactive visualization was described in detail in our previous work \[[13](/html/2310.02128v2/#bib.bib13)\], where we also presented its quantitative evaluation. To this end, we asked ten programmers to complete three programming tasks using Graph Buddy, all involving the metals project : (1) finding a specific call hierarchy, (2) finding a call path, (3) learning about a specific code entity. The participants achieved a very high success rate of 80-100% and in a survey they agreed that at least two of the tasks would be difficult to solve without Graph Buddy. Similar interactive browsing capabilities would not be possible to achieve with either CCN or CG models, as they represent only a portion of code entities and they lack a direct connection to the source code.

### 6.6 Finding code similarities

Finding code similarities in the project can help both in software comprehension and directly in software maintenance. To better understand the software, we can look for cases of similar code in the project in order to discover not obvious relations and analyze subtle differences between them \[[55](/html/2310.02128v2/#bib.bib55)\]. In software maintenance, we use clone detection to find and refactor code duplication \[[23](/html/2310.02128v2/#bib.bib23)\] or to apply bug fixes in multiple places. It has been proven that graph based representation of the source code (such as Program Dependence Graph \[[22](/html/2310.02128v2/#bib.bib22)\]) can be used to find code similarities \[[40](/html/2310.02128v2/#bib.bib40), [38](/html/2310.02128v2/#bib.bib38)\]. Using the SCG graph, we can find semantically similar code fragments within the project. Existing algorithms are typically based on computing graph similarity \[[40](/html/2310.02128v2/#bib.bib40), [71](/html/2310.02128v2/#bib.bib71), [38](/html/2310.02128v2/#bib.bib38)\]. However, the disadvantage of this approach is its high computational complexity and, consequently, slow performance for large code bases. We propose a simple and effective heuristic for quick finding similarity between methods in a given project using the SCG. The heuristic, fully presented in Listing [7](/html/2310.02128v2/#LST7 "Listing 7 ‣ 6.6 Finding code similarities ‣ 6 Empirical Software Comprehension with Semantic Code Graph ‣ Semantic Code Graph – an information model to facilitate software comprehension"), can be summarized as follows:

- •
  Step 1. Generate a list of all method pairs in the project.
- •
  Step 2. For each method in a pair, retrieve a set of its adjacent nodes; then compute the intersection of the sets.
- •
  Step 3. Determine the similarity between methods based on the size of their intersection set. Two nodes are treated as similar if for both nodes the minimal size of the intersection is higher than s_min and the fraction of the intersecting nodes (within all adjacent nodes) is higher than s_min_p.
- •
  Step 4. Discard similar methods having the same parent to exclude similarities occurring in the same code unit and focus on non obvious ones.

import itertools as it

import scg

\# min. 5 nodes in intersection

s_min = 5

\# min. 50% of method nodes has to be the same

s_min_p = 50

scg_files = scg.read_scg("data/metals")

G = scg.create_graph(scg_files)

\# find all method nodes

\# Step 1.

methods = \[

    n

    for n in G.nodes()

    if G.nodes\[n\].get("scg_node").kind == "METHOD"

\]

\# generate all method pairs

methods_comb = list(it.combinations(methods, 2))

\# find defining node for given node n

def parent(G, n):

    return \[

        p

        for p in G.predecessors(n)

        if G\[p\]\[n\]\["type"\] == "DECLARATION"

    \]

similar = \[\]

for (

    n1,

    n2,

) in methods_comb:

    \# Step 2.

    n1_n = set(G.successors(n1))

    n2_n = set(G.successors(n2))

    s = len(set(n1_n).intersection(n2_n))

    \# fraction of common nodes in each method

    n1_p = 0 if s==0 else int(s / len(n1_n) \* 100)

    n2_p = 0 if s==0 else int(s / len(n2_n) \* 100)

    \# Step 3.

    if s \>= s_min and (

        n1_p \>= s_min_p and n2_p \>= s_min_p

    ):

        \# Step 4.

        if parent(G, n1) != parent(G, n2):

            similar.append((n1,n2,s,n1_s,n2_s))

\# ’similar’ contains pairs of similar methods

print(similar)

Listing 7: Algorithm for finding similar methods in a project.

Even such a simplified heuristic can reveal interesting similarities, for example in the metals project, as shown in Fig. [21](/html/2310.02128v2/#S6.F21 "Figure 21 ‣ 6.6 Finding code similarities ‣ 6 Empirical Software Comprehension with Semantic Code Graph ‣ Semantic Code Graph – an information model to facilitate software comprehension"). Two similar methods –oldReloadResult and oldInstallResult – were found which could be refactored into a common method presented in Listing [10](/html/2310.02128v2/#LST10 "Listing 10 ‣ Figure 21 ‣ 6.6 Finding code similarities ‣ 6 Empirical Software Comprehension with Semantic Code Graph ‣ Semantic Code Graph – an information model to facilitate software comprehension").

def oldReloadResult(

    digest: String

): Option\[WorkspaceLoadedStatus\] = {

    if (tables.dismissedNotifications

            .ImportChanges.isDismissed) {

      Some(WorkspaceLoadedStatus.Dismissed)

    } else {

      tables.digests.last().collect {

        case Digest(md5, status, \_)

            if md5 == digest =\>

          WorkspaceLoadedStatus.Duplicate(status)

      }

    }

}

Listing 8: metals method from WorkspaceReload class.

private def oldInstallResult(

  digest: String

): Option\[WorkspaceLoadedStatus\] = {

    if (notification.isDismissed) {

      Some(WorkspaceLoadedStatus.Dismissed)

    } else {

      tables.digests.last().collect {

        case Digest(md5, status, \_)

            if md5 == digest =\>

          WorkspaceLoadedStatus.Duplicate(status)

      }

    }

}

Listing 9: metals method from BloopInstall class.

private def common(

  digest: String,

  condition: Boolean,

  tables: Tables

): Option\[WorkspaceLoadedStatus\] = {

    if (condition) {

      Some(WorkspaceLoadedStatus.Dismissed)

    } else {

      tables.digests.last().collect {

        case Digest(md5, status, \_)

            if md5 == digest =\>

          WorkspaceLoadedStatus.Duplicate(status)

      }

    }

}

Listing 10: Extracted common code from oldReloadResult and oldInstallResult methods.

Figure 21: Method oldReloadResult and oldReloadResult from metals project are similar, differing only in naming and the first condition statement. Consequently, a common method shown in Listing [10](/html/2310.02128v2/#LST10 "Listing 10 ‣ Figure 21 ‣ 6.6 Finding code similarities ‣ 6 Empirical Software Comprehension with Semantic Code Graph ‣ Semantic Code Graph – an information model to facilitate software comprehension") can be used to replace them.

*Conclusions.* Listing [7](/html/2310.02128v2/#LST7 "Listing 7 ‣ 6.6 Finding code similarities ‣ 6 Empirical Software Comprehension with Semantic Code Graph ‣ Semantic Code Graph – an information model to facilitate software comprehension") demonstrates how code analysis algorithms can be implemented using the raw SCG graph data structures. The example reveals code similarity computed based on the code structure represented in the SCG model, containing entities and relations not available in CCN or CG alone (e.g., PARAMETER, RETURN_TYPE). Additionally, thanks to the rich dependency model of the SCG, we were able to easily adjust the similarity search algorithm and discard results found within same parent in order to focus on less obvious cases. Such analysis would not be feasible based on CCN since methods are not represented in the CCN model, limiting similarity computations to the class level only. Similarly, the CG model lacks parent-child relations like the SCG DECLARATION available in the SCG model. It is worth to mention that more complex algorithms for finding code similarities with the SCG model can be implemented in a similar fashion, however, it is out of scope of this paper.

### 6.7 Answering research questions

Answer to RQ1: Does the SCG model enhance software comprehension capabilities in comparison with the Class Collaboration Network and the Call Graph models?

In the case of project structure comprehension, we have combined the computation of project metrics with data analysis based on the split-apply-combine approach \[[90](/html/2310.02128v2/#bib.bib90)\]. The richness of the full SCG model allowed us to discover interesting properties of the analyzed software which could not have been found based on the Call Graph or Class Collaboration Network alone. For example, we have discovered excessive use of variables in the spring-boot project and localized the relevant places in the project (Section [6.2](/html/2310.02128v2/#S6.SS2 "6.2 Project overview ‣ 6 Empirical Software Comprehension with Semantic Code Graph ‣ Semantic Code Graph – an information model to facilitate software comprehension")). Additionally, we have shown a power law distribution of node degrees in software projects and focused on finding outliers. Thanks to the richness of the SCG model, we could identify all unique hub outliers for both classes (e.g., ActorRef) and methods (e.g., ActorRef#!).

In the case of top important code entities, we have shown that the full SCG model, Class Collaboration Network, and the Call Graph model provide different perspectives on the project structure. Each perspectives is useful and the SCG model supports all of them, being a superset of both CG and CCN.

Unique properties of the SCG model (such as the required location property) allow interactive source browsing in the full context of detailed dependencies and code entities that are neither with standard Call Graph analysis nor Class Collaboration Network (Section [6.5](/html/2310.02128v2/#S6.SS5 "6.5 Interactive visualizations and answering reachability questions ‣ 6 Empirical Software Comprehension with Semantic Code Graph ‣ Semantic Code Graph – an information model to facilitate software comprehension")).

Answer to RQ2: Does SCG-based data analysis enable actionable software comprehension insights? Several project comprehension activities presented earlier led to useful insights regarding code problems and possible solutions. In section [6.2](/html/2310.02128v2/#S6.SS2 "6.2 Project overview ‣ 6 Empirical Software Comprehension with Semantic Code Graph ‣ Semantic Code Graph – an information model to facilitate software comprehension") we discovered an excessive number of variables in the spring-boot project. A closer look into the source code allowed us to understand the issue and propose the refactoring exercise to apply final modifier to reduce accidental mutability and in consequence improve the code readability.

In Section [6.3](/html/2310.02128v2/#S6.SS3 "6.3 Project structure comprehension ‣ 6 Empirical Software Comprehension with Semantic Code Graph ‣ Semantic Code Graph – an information model to facilitate software comprehension"), which focuses on project structure comprehension, we identified an anomaly in the Retrofit project. Specifically, the parseParameterAnnotation method exhibited an unusually high outgoing degree. We conducted an analysis to understand the cause of this anomaly and proposed refactoring activities.

Finally, in Section [6.6](/html/2310.02128v2/#S6.SS6 "6.6 Finding code similarities ‣ 6 Empirical Software Comprehension with Semantic Code Graph ‣ Semantic Code Graph – an information model to facilitate software comprehension"), we were able to find similar methods in different places in the code, which is not only relevant for software comprehension, but also led to proposing an improvement of the source code by extracting the common method (presented in Listing [10](/html/2310.02128v2/#LST10 "Listing 10 ‣ Figure 21 ‣ 6.6 Finding code similarities ‣ 6 Empirical Software Comprehension with Semantic Code Graph ‣ Semantic Code Graph – an information model to facilitate software comprehension")) and removing code duplication.

## 7 Impact of results

We believe that the presented results of our research indicate that the Semantic Code Graph (SCG) represents a significant development in the field of code dependency analysis and software comprehension. For researchers and experts, this work carries several benefits:

1.  1.
    Comprehensive code dependency analysis: SCG offers a detailed source code information model providing insight into code structure, including code definitions, declarations, and their relationships. This offers significant depth of analysis which opens up new avenues for understanding software systems. We have demonstrated the usefulness of the SCG model in diverse software comprehension applications, including code structure visualization, identification of crucial software entities, investigation of code quality issues, and software mining using data analytics.
2.  2.
    Practical utility: The empirical evaluation of the SCG on real-world projects demonstrates its practical utility. This utility has been demonstrated by using SCG as foundation of several tools for software comprehension: the Graph Buddy plugin for interactive code dependency visualization in popular IDEs, and the scg-cli tool. Researchers can use the tools that we have provided to conduct similar experiments for the purpose of software comprehension or validation of their own models. This emphasis on empirical validation helps bridge the gap between theoretical work and real-world applications on software projects.
3.  3.
    Actionable insights: We have shown that the SCG capability has led to concrete useful insights, e.g., identification of excessive usage of mutable variables, identification of outliers with extreme number of dependencies, or finding similar methods and suggesting project refactoring actions. Researchers can build on this capability to develop automated code quality improvement tools. SCG’s high level of detail enables deriving other graph-based code representation models, such as Class Collaboration Network (CCN) and Call Graph (CG), which are already provided by the scg-cli tool. Our experiments have shown that these models provide additional insights into software structure and execution dependencies.
4.  4.
    External integrations: Along with the SCG model we have provided its portable intermediate representation, tools and APIs that enable integrations with external tools such as Gephi, Jupyter Notebook or any tool capable of reading a protobuf format.
5.  5.
    Community Contribution and Future Research: SCG detailed description and protobuf based intermediate representation facilitates creation of new extractors for other programming languages and the scg-cli tool helps in SCG data analysis, establishing a solid foundation for future research endeavors in code dependency analysis, software monitoring, maintenance, and tool development.
6.  6.
    Cost Reduction in Project Maintenance: With its emphasis on practical utility, the proposed SCG model and tools have the potential to influence development of future tools that help reducing project maintenance costs by expediting activities related to software comprehension.

In conclusion, the work on the Semantic Code Graph offers a rich source of inspiration and practical insights for potential researchers and experts. It encourages a shift toward empirical validation, visualization, tool development, and collaborative efforts in the realm of code dependency analysis and software comprehension, ultimately contributing to more efficient and effective software maintenance practices.

## 8 Conclusions

We introduced the Semantic Code Graph (SCG), a comprehensive source code information model. The SCG is a form of software network which focuses on highly detailed source code-level dependencies, capable of representing all code definitions, declarations, and the relationships between them. SCG introduces diverse properties crucial for subsequent analysis, as well as a simple yet effective intermediate representation in the form of a protobuf schema. We have described the implementation of the SCG model and the extraction of SCG data for Scala and Java languages.

The SCG model properties enable advanced analysis and visualization of source code structure, as well as integration with external tools. Practical capabilities of SCG have been proven in empirical evaluation on eleven popular open source projects written in Java and Scala. For each project we have extracted their SCG, Class Collaboration Network, and Call Graph models, and conducted diverse comparative software comprehension experiments. Thanks to the level of detail in SCG, even a simple distribution analysis of SCG node types can provide valuable insights, such as identifying excessive usage of mutable variables and suggesting project refactoring actions.

Class Collaboration Network (CCN) and Call Graph (CG) also provide interesting perspectives on the software. CCN focuses on the high-level code structure, while CG analyzes important dependencies from a program execution perspective. Both CCN and CG can be effectively extracted from the more general SCG model. SCG, CCN, and CG exhibit a power-law distribution in each project, indicating that the software structure displays characteristics of a scale-free network, with a significant number of outlier nodes. These outlier nodes can sometimes be identified as places for direct refactoring improvements to enhance project readability and structural quality. The most important nodes in each network may be of interest for a different reasons: in the CCN network they are crucial from a project structure perspective, while in the CG graph the represent code entities having a major impact on program execution. The SCG combines these perspectives to identify a unique set of nodes critical for overall project comprehension.

The SCG model has enabled effective interactive code dependency visualization, proving its usefulness in the Graph Buddy plugin for popular IDEs. We have also demonstrated the utility of SCG in general software mining (discovery of similar code snippets) leveraging data analysis in external tools, such as Jupyter Notebook with Python data frames environment.

We argue that our research, which focuses on empirical experiments on real projects, helps address the gap between theoretical code representation models and their applications, as well as the surprising lack of concrete and widely used software comprehension tools in the common developer workflow. To encourage future research in this direction, i.e., one that emphasizes practical usability aspects of the underlying theoretical work, we have published our tools and focused on their usability, notably scg-cli, a tool for SCG extraction⁴¹⁴¹41Currently scg-cli supports SCG extraction for Java projects. For Scala, which requires a different approach, we have developed a compiler plugin for this purpose available at [https://github.com/VirtusLab/scg-scala](https://github.com/VirtusLab/scg-scala) and analysis. We hope that our work will contribute to the emergence of practical research and applications in the code structure analysis and software comprehension field.

## Acknowledgments

Krzysztof Borowski was supported in part by AGH University of Krakow and the "Doktorat Wdrozeniowy" program of the Polish Ministry of Science and Higher Education, and by the VirtusLab company.

## References

- \[1\] Mithun Acharya and Brian Robinson. Practical change impact analysis based on static program slicing for industrial software systems. In Proceedings of the 33rd international conference on software engineering, pages 746–755, 2011.
- \[2\] Nedhal A. Al-Saiyd. Source code comprehension analysis in software maintenance. In 2017 2nd International Conference on Computer and Communication Systems (ICCCS), pages 1–5, July 2017.
- \[3\] Rakan Alanazi, Gharib Gharibi, and Yugyung Lee. Facilitating program comprehension with call graph multilevel hierarchical abstractions. Journal of Systems and Software, 176:110945, 2021.
- \[4\] Frances E Allen. Control flow analysis. ACM Sigplan Notices, 5(7):1–19, 1970.
- \[5\] Ritu Arora and Sanjay Goel. Javarelationshipgraphs (jrg): Transforming java projects into graphs using neo4j graph databases. In Proceedings of the 2nd International Conference on Software Engineering and Information Management, ICSIM 2019, page 80–84, New York, NY, USA, 2019. Association for Computing Machinery.
- \[6\] Ritu Arora, Sanjay Goel, and R. K. Mittal. Using dependency graphs to support collaboration over github: The neo4j graph database approach. In 2016 Ninth International Conference on Contemporary Computing (IC3), pages 1–7, Aug 2016.
- \[7\] Vinay Arora, Rajesh Kumar Bhatia, and Maninder Pal Singh. Evaluation of flow graph and dependence graphs for program representation. International Journal of Computer Applications, 56:18–23, 2012.
- \[8\] Michael Backes, Konrad Rieck, Malte Skoruppa, Ben Stock, and Fabian Yamaguchi. Efficient and flexible discovery of php application vulnerabilities. In 2017 IEEE European Symposium on Security and Privacy (EuroS&P), pages 334–349, April 2017.
- \[9\] A. Bandi, B. J. Williams, and E. B. Allen. Empirical evidence of code decay: A systematic mapping study. In 2013 20th Working Conference on Reverse Engineering (WCRE), pages 341–350, 2013.
- \[10\] Gabriele Bavota, Andrea De Lucia, Andrian Marcus, and Rocco Oliveto. Using structural and semantic measures to improve software modularization. Empirical Software Engineering, 18(5):901–932, 2013.
- \[11\] Pamela Bhattacharya, Marios Iliofotou, Iulian Neamtiu, and Michalis Faloutsos. Graph-based analysis and prediction for software evolution. In 2012 34th International Conference on Software Engineering (ICSE), pages 419–429, June 2012.
- \[12\] Phillip Bonacich. Power and centrality: A family of measures. American journal of sociology, 92(5):1170–1182, 1987.
- \[13\] Krzysztof Borowski, Bartosz Baliś, and Tomasz Orzechowski. Graph buddy — an interactive code dependency browsing and visualization tool. In 2022 Working Conference on Software Visualization (VISSOFT), 2022.
- \[14\] Ulrik Brandes. A faster algorithm for betweenness centrality. The Journal of Mathematical Sociology, 25, 03 2004.
- \[15\] Sergey Brin and Lawrence Page. The anatomy of a large-scale hypertextual web search engine. Computer Networks and ISDN Systems, 30(1):107–117, 1998.
- \[16\] Aline Brito, Andre Hora, and Marco Tulio Valente. Refactoring graphs: Assessing refactoring over time. In 2020 IEEE 27th International Conference on Software Analysis, Evolution and Reengineering (SANER), pages 367–377, Feb 2020.
- \[17\] Máté Cserép and Anett Fekete. Integration of incremental build systems into software comprehension tools. In ICAI, pages 85–93, 2020.
- \[18\] Xin Du, Tian Wang, Weifeng Pan, Muchou Wang, Bo Jiang, Yiming Xiang, Chunlai Chai, Jiale Wang, and Chengxiang Yuan. Cospa: Identifying key classes in object-oriented software using preference aggregation. IEEE Access, 9:114767–114780, 2021.
- \[19\] B. Du Bois, S. Demeyer, and J. Verelst. Refactoring - improving coupling and cohesion of existing code. In 11th Working Conference on Reverse Engineering, pages 144–151, Nov 2004.
- \[20\] S.G. Eick, T.L. Graves, A.F. Karr, J.S. Marron, and A. Mockus. Does code decay? assessing the evidence from change management data. IEEE Transactions on Software Engineering, 27(1):1–12, Jan 2001.
- \[21\] Daniel Falci, Orlando Gomes, and Fernando Silva Parreiras. Complex networks analysis for software architecture: an hibernate call graph study. 06 2017.
- \[22\] Jeanne Ferrante, Karl J. Ottenstein, and Joe D. Warren. The program dependence graph and its use in optimization. ACM Trans. Program. Lang. Syst., 9(3):319–349, July 1987.
- \[23\] Martin Fowler. Refactoring: Improving the design of existing code. In 11th European Conference. Jyväskylä, Finland, 1997.
- \[24\] Carlos Galindo, Sergio Pérez, and Josep Silva. Data dependencies in object-oriented programs. In 11th Workshop on Tools for Automatic Program Analysis, 2020.
- \[25\] Sergi Gomez. Centrality in Networks: Finding the Most Important Nodes, pages 401–433. Springer International Publishing, Cham, 2019.
- \[26\] David Grove, Greg DeFouw, Jeffrey Dean, and Craig Chambers. Call graph construction in object-oriented languages. SIGPLAN Not., 32(10):108–124, oct 1997.
- \[27\] Dick Grune, Kees van Reeuwijk, Henri E. Bal, Ceriel J. H. Jacobs, and Koen Langendoen. Modern Compiler Design, pages 1–51. Springer New York, New York, NY, 2012.
- \[28\] Yang Guo, Zheng-xu Zhao, and Wei Wang. Complexity analysis of software based on function-call graph. In Ershi Qi, Jiang Shen, and Runliang Dou, editors, The 19th International Conference on Industrial Engineering and Engineering Management, pages 269–277, Berlin, Heidelberg, 2013. Springer Berlin Heidelberg.
- \[29\] Susan Horwitz, Thomas Reps, and David Binkley. Interprocedural slicing using dependence graphs. In Proceedings of the ACM SIGPLAN 1988 conference on Programming Language design and Implementation, pages 35–46, 1988.
- \[30\] Hamel Husain, Ho-Hsiang Wu, Tiferet Gazit, Miltiadis Allamanis, and Marc Brockschmidt. Codesearchnet challenge: Evaluating the state of semantic code search. arXiv preprint arXiv:1909.09436, 2019.
- \[31\] David Hyland-Wood, David Carrington, and Simon Kaplan. Scale-free nature of java software package, class and method collaboration graphs. In Proceedings of the 5th International Symposium on Empirical Software Engineering. Citeseer, 2006.
- \[32\] Ayaz Isazadeh, Habib Izadkhah, and Islam Elgedawy. Techniques for the Evaluation of Software Modularizations, pages 179–216. Springer International Publishing, Cham, 2017.
- \[33\] S. Jenkins and S.R. Kirk. Software architecture graphs as complex networks: A novel partitioning scheme to measure stability and evolution. Information Sciences, 177(12):2587–2601, 2007.
- \[34\] Sesha Kalyur and G.S. Nagaraja. Paracite: Auto-parallelization of a sequential program using the program dependence graph. In 2016 International Conference on Computation System and Information Technology for Sustainable Solutions (CSITSS), pages 7–12, Oct 2016.
- \[35\] Stephen H Kan. Metrics and models in software quality engineering. Addison-Wesley Professional, 2003.
- \[36\] Abdul vahab karuthedath, Sreekutty Vijayan, and Vipin Kumar K. S. System dependence graph based test case generation for object oriented programs. In 2020 International Conference on Power, Instrumentation, Control and Computing (PICC), pages 1–6, Dec 2020.
- \[37\] Leo Katz. A new status index derived from sociometric analysis. Psychometrika, 18(1):39–43, 1953.
- \[38\] Jinhyun Kim, HyukGeun Choi, Hansang Yun, and Byung-Ro Moon. Measuring source code similarity by finding similar subgraph with an incremental genetic algorithm. In Proceedings of the Genetic and Evolutionary Computation Conference 2016, GECCO ’16, pages 925–932, New York, NY, USA, 2016. Association for Computing Machinery.
- \[39\] Joris Kinable and Orestis Kostakis. Malware classification based on call graph clustering. Journal in Computer Virology, 7(4):233–245, 2011.
- \[40\] J. Krinke. Identifying similar code with program dependence graphs. In Proceedings Eighth Working Conference on Reverse Engineering, pages 301–309, Oct 2001.
- \[41\] Patrick Lam, Eric Bodden, Ondrej Lhoták, and Laurie Hendren. The soot framework for java program analysis: a retrospective. In Cetus Users and Compiler Infastructure Workshop (CETUS 2011), volume 15, 2011.
- \[42\] Thomas D. LaToza and Brad A. Myers. Developers ask reachability questions. In 2010 ACM/IEEE 32nd International Conference on Software Engineering, volume 1, pages 185–194, May 2010.
- \[43\] Thomas D. LaToza and Brad A. Myers. Visualizing call graphs. In 2011 IEEE Symposium on Visual Languages and Human-Centric Computing (VL/HCC), pages 117–124, 2011.
- \[44\] Steffen Lehnert. A taxonomy for software change impact analysis. In Proceedings of the 12th International Workshop on Principles of Software Evolution and the 7th Annual ERCIM Workshop on Software Evolution, IWPSE-EVOL ’11, pages 41–50, New York, NY, USA, 2011. Association for Computing Machinery.
- \[45\] Bixin Li, Xiaobing Sun, Hareton Leung, and Sai Zhang. A survey of code-based change impact analysis techniques. Software Testing, Verification and Reliability, 23(8):613–646, 2013.
- \[46\] Hao Li, Tian Wang, Weifeng Pan, Muchou Wang, Chunlai Chai, Pengyu Chen, Jiale Wang, and Jing Wang. Mining key classes in java projects by examining a very small number of classes: A complex network-based approach. IEEE Access, 9:28076–28088, 2021.
- \[47\] Huan Liu, Yubo Tao, Wenda Huang, and Hai Lin. Visual exploration of dependency graph in source code via embedding-based similarity. Journal of Visualization, 24(3):565–581, 2021.
- \[48\] Thibaud Lutellier, Devin Chollak, Joshua Garcia, Lin Tan, Derek Rayside, Nenad Medvidović, and Robert Kroeger. Measuring the impact of code dependencies on software architecture recovery techniques. IEEE Transactions on Software Engineering, 44(2):159–181, Feb 2018.
- \[49\] Anna-Liisa Mattila, Petri Ihantola, Terhi Kilamo, Antti Luoto, Mikko Nurminen, and Heli Väätäjä. Software visualization today: Systematic literature review. In Proceedings of the 20th International Academic Mindtrek Conference, AcademicMindtrek ’16, pages 262–271, New York, NY, USA, 2016. Association for Computing Machinery.
- \[50\] T.J. McCabe. A complexity measure. IEEE Transactions on Software Engineering, SE-2(4):308–320, Dec 1976.
- \[51\] Shane McIntosh, Yasutaka Kamei, Bram Adams, and Ahmed E. Hassan. An empirical study of the impact of modern code review practices on software quality. Empirical Software Engineering, 21(5):2146–2189, 2016.
- \[52\] Nikita Mehrotra, Navdha Agarwal, Piyush Gupta, Saket Anand, David Lo, and Rahul Purandare. Modeling functional similarity in source code with graph-based siamese networks. IEEE Transactions on Software Engineering, 48(10):3771–3789, Oct 2022.
- \[53\] Yulong Meng, Dong Xu, Ziying Zhang, and Wencai Li. System dependency graph construction algorithm based on equivalent substitution. In 2015 Eighth International Conference on Internet Computing for Science and Engineering (ICICSE), pages 106–110, 2015.
- \[54\] P. Meyer, Harvey Siy, and Sanjukta Bhowmick. Identifying important classes of large software systems through k-core decomposition. Advances in Complex Systems, 17:1550004, 04 2015.
- \[55\] Justin Middleton and Kathryn T. Stolee. Understanding similar code through comparative comprehension. In 2022 IEEE Symposium on Visual Languages and Human-Centric Computing (VL/HCC), pages 1–11, Sep. 2022.
- \[56\] Christopher R Myers. Software systems as complex networks: Structure, function, and evolvability of software collaboration graphs. Physical review E, 68(4):046116, 2003.
- \[57\] Aravind Nair, Avijit Roy, and Karl Meinke. Funcgnn: A graph neural network approach to program similarity. In Proceedings of the 14th ACM / IEEE International Symposium on Empirical Software Engineering and Measurement (ESEM), ESEM ’20, New York, NY, USA, 2020. Association for Computing Machinery.
- \[58\] M. Newman. Networks. OUP Oxford, 2018.
- \[59\] Martin Odersky and al. An overview of the scala programming language. Technical Report IC/2004/64, EPFL Lausanne, Switzerland, 2004.
- \[60\] Martin Odersky, Eugene Burmako, and Dmytro Petrashko. Tasty reference manual. page 21, 2016.
- \[61\] Rocco Oliveto, Malcom Gethers, Gabriele Bavota, Denys Poshyvanyk, and Andrea De Lucia. Identifying method friendships to remove the feature envy bad smell: Nier track. In 2011 33rd International Conference on Software Engineering (ICSE), pages 820–823, May 2011.
- \[62\] Weifeng Pan, Beibei Song, Kangshun Li, and Kejun Zhang. Identifying key classes in object-oriented software using generalized k-core decomposition. Future Generation Computer Systems, 81:188–202, 2018.
- \[63\] Zoltán Porkoláb, Tibor Brunner, Dániel Krupp, and Márton Csordás. Codecompass: An open software comprehension framework for industrial usage. In Proceedings of the 26th Conference on Program Comprehension, ICPC ’18, pages 361–369, New York, NY, USA, 2018. Association for Computing Machinery.
- \[64\] Zoltán Porkoláb, Tibor Brunner, Dániel Krupp, and Márton Csordás. Codecompass: an open software comprehension framework for industrial usage. In Proceedings of the 26th Conference on Program Comprehension, pages 361–369, 2018.
- \[65\] Babak Pourasghar, Habib Izadkhah, Ayaz Isazadeh, and Shahriar Lotfi. A graph-based clustering algorithm for software systems modularization. Information and Software Technology, 133:106469, 2021.
- \[66\] Christian R. Prause and Stefan Apelt. An approach for continuous inspection of source code. In Proceedings of the 6th International Workshop on Software Quality, WoSQ ’08, pages 17–22, New York, NY, USA, 2008. Association for Computing Machinery.
- \[67\] Mehwish Riaz, Muhammad Sulayman, and Husnain Naqvi. Architectural decay during continuous software evolution and impact of ‘design for change’ on software architecture. In Dominik Slezak, Tai-hoon Kim, Akingbehin Kiumi, Tao Jiang, June Verner, and Silvia Abrahão, editors, Advances in Software Engineering, pages 119–126, Berlin, Heidelberg, 2009. Springer Berlin Heidelberg.
- \[68\] Yannick Rochat. Closeness centrality extended to unconnected graphs: The harmonic centrality index. Technical report, 2009.
- \[69\] Oscar Rodriguez-Prieto, Alan Mycroft, and Francisco Ortin. An efficient and scalable platform for java source code analysis using overlaid graph representations. IEEE Access, 8:72239–72260, 2020.
- \[70\] Linda H. Rosenberg and Lawrence E. Hyatt. Software quality metrics for object-oriented system environments.  1995.
- \[71\] Chanchal Kumar Roy and James R Cordy. A survey on software clone detection research. Queen’s School of Computing TR, 541(115):64–68, 2007.
- \[72\] B.G. Ryder. Constructing the call graph of a program. IEEE Transactions on Software Engineering, SE-5(3):216–226, May 1979.
- \[73\] Miloš Savić, Miloš Radovanović, and Mirjana Ivanović. Community detection and analysis of community evolution in apache ant class collaboration networks. In Proceedings of the Fifth Balkan Conference in Informatics, pages 229–234, 2012.
- \[74\] Miloš Savić, Gordana Rakić, Zoran Budimac, and Mirjana Ivanović. A language-independent approach to the extraction of dependencies between source code entities. Information and Software Technology, 56(10):1268–1288, 2014.
- \[75\] Anthony Savidis. and Crystallia Savaki. Software architecture mining from source code with dependency graph clustering and visualization. In Proceedings of the 17th International Joint Conference on Computer Vision, Imaging and Computer Graphics Theory and Applications (VISIGRAPP 2022) - IVAPP, pages 179–186. INSTICC, SciTePress, 2022.
- \[76\] Michael D. Shah and Samuel Z. Guyer. An interactive microarray call-graph visualization. In 2016 IEEE Working Conference on Software Visualization (VISSOFT), pages 86–90, Oct 2016.
- \[77\] Gang Shu, Boya Sun, Tim A.D. Henderson, and Andy Podgurski. JavaPDG: A new platform for program dependence analysis. In 2013 IEEE Sixth International Conference on Software Testing, Verification and Validation. IEEE, mar 2013.
- \[78\] Janet Siegmund. Program comprehension: Past, present, and future. In 2016 IEEE 23rd International Conference on Software Analysis, Evolution, and Reengineering (SANER), volume 5, pages 13–20, March 2016.
- \[79\] Michael Smit, Barry Gergel, H. James Hoover, and Eleni Stroulia. Code convention adherence in evolving software. In 2011 27th IEEE International Conference on Software Maintenance (ICSM), pages 504–507, Sep. 2011.
- \[80\] Muttipati Srinuvasu and Poosapati Padmaja. Unfolding and boosting based graph partitioning approach for object-oriented system. IARJSET, 3:122–128, 07 2016.
- \[81\] Sean Stapleton, Yashmeet Gambhir, Alexander LeClair, Zachary Eberhart, Westley Weimer, Kevin Leach, and Yu Huang. A human study of comprehension and code summarization. In Proceedings of the 28th International Conference on Program Comprehension, ICPC ’20, pages 2–13, New York, NY, USA, 2020. Association for Computing Machinery.
- \[82\] Sahil Suneja, Yunhui Zheng, Yufan Zhuang, Jim Laredo, and Alessandro Morari. Learning to map source code to software vulnerability using code-as-a-graph. ArXiv, abs/2006.08614, 2020.
- \[83\] Frank Tip. A survey of program slicing techniques. Centrum voor Wiskunde en Informatica Amsterdam, 1994.
- \[84\] Divya Tyagi, Ritu Arora, and Yashvardhan Sharma. Application of java relationship graphs to academics for detection of plagiarism in java projects. In Milan Tuba, Shyam Akashe, and Amit Joshi, editors, ICT Systems and Sustainability, pages 761–772, Singapore, 2022. Springer Nature Singapore.
- \[85\] Raoul-Gabriel Urma and Alan Mycroft. Source-code queries with graph databases—with application to programming language usage and evolution. Science of Computer Programming, 97:127–134, 2015.
- \[86\] Raja Vallée-Rai, Phong Co, Etienne Gagnon, Laurie Hendren, Patrick Lam, and Vijay Sundaresan. Soot: A java bytecode optimization framework. In CASCON First Decade High Impact Papers, pages 214–224. 2010.
- \[87\] Stephane Vaucher, Foutse Khomh, Naouel Moha, and Yann-Gaël Guéhéneuc. Tracking design smells: Lessons from a study of god classes. In 2009 16th working conference on reverse engineering, pages 145–154. IEEE, 2009.
- \[88\] N. Walkinshaw, M. Roper, and M. Wood. The java system dependence graph. In Proceedings Third IEEE International Workshop on Source Code Analysis and Manipulation, pages 55–64, Sep. 2003.
- \[89\] R. Wheeldon and S. Counsell. Power law distributions in class relationships. In Proceedings Third IEEE International Workshop on Source Code Analysis and Manipulation, pages 45–54, Sep. 2003.
- \[90\] Hadley Wickham. The split-apply-combine strategy for data analysis. Journal of statistical software, 40:1–29, 2011.
- \[91\] Xin Xia, Lingfeng Bao, David Lo, Zhenchang Xing, Ahmed E. Hassan, and Shanping Li. Measuring program comprehension: A large-scale field study with professionals. IEEE Transactions on Software Engineering, 44(10):951–976, Oct 2018.
- \[92\] Fabian Yamaguchi, Nico Golde, Daniel Arp, and Konrad Rieck. Modeling and discovering vulnerabilities with code property graphs. In 2014 IEEE Symposium on Security and Privacy, pages 590–604, May 2014.
- \[93\] Siham Yousfi and Dalila Chiadmi. Graph file format for etl. In 2014 Second World Conference on Complex Systems (WCCS), pages 189–195, Nov 2014.
- \[94\] Dongjin Yu, Quanxin Yang, Xin Chen, Jie Chen, and Yihang Xu. Graph-based code semantics learning for efficient semantic code clone detection. Information and Software Technology, 156:107130, 2023.
- \[95\] Jianjun Zhao. Applying program dependence analysis to java software. 06 2001.

Generated on Mon Jan 1 16:50:03 2024 by [LATExml![\[LOGO\]]()](http://dlmf.nist.gov/LaTeXML/)
