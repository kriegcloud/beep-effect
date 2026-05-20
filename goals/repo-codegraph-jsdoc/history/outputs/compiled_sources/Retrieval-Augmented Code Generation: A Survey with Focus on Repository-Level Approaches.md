# Retrieval-Augmented Code Generation: A Survey with Focus on Repository-Level Approaches

Source: https://arxiv.org/html/2510.04905v1

Yicheng Tao
Carnegie Mellon University
yichengtao@cmu.edu
   Yao Qin
Chinese University of Hong Kong
1155240806@link.cuhk.edu.hk
   Yepang Liu
Southern University of Science and Technology
liuyp1@sustech.edu.cn
Corresponding author.

###### Abstract

Recent advancements in large language models (LLMs) have substantially improved automated code generation. While function-level and file-level generation have achieved promising results, real-world software development typically requires reasoning across entire repositories. This gives rise to the challenging task of Repository-Level Code Generation (RLCG), where models must capture long-range dependencies, ensure global semantic consistency, and generate coherent code spanning multiple files or modules. To address these challenges, Retrieval-Augmented Generation (RAG) has emerged as a powerful paradigm that integrates external retrieval mechanisms with LLMs, enhancing context-awareness and scalability. In this survey, we provide a comprehensive review of research on Retrieval-Augmented Code Generation (RACG), with an emphasis on repository-level approaches. We categorize existing work along several dimensions, including generation strategies, retrieval modalities, model architectures, training paradigms, and evaluation protocols. Furthermore, we summarize widely used datasets and benchmarks, analyze current limitations, and outline key challenges and opportunities for future research. Our goal is to establish a unified analytical framework for understanding this rapidly evolving field and to inspire continued progress in AI-powered software engineering.

## 1 Introduction

In recent years, advances in Large Language Models (LLMs) have not only revolutionized natural language processing but also increasingly catalyzed applications in software engineering. Notably, cutting-edge general-purpose models such as GPT-5 \[[1](https://arxiv.org/html/2510.04905v1#bib.bib1)\], Claude Opus 4.1 \[[2](https://arxiv.org/html/2510.04905v1#bib.bib2)\], and Gemini 2.5 Pro \[[3](https://arxiv.org/html/2510.04905v1#bib.bib3)\] frequently compete for state-of-the-art performance on benchmarks like SWE-Bench \[[4](https://arxiv.org/html/2510.04905v1#bib.bib4)\], underscoring the centrality of code understanding and generation to real-world productivity. Complementing these efforts, a dedicated line of code-oriented LLMs—including CodeLlama \[[5](https://arxiv.org/html/2510.04905v1#bib.bib5)\], Qwen-Coder \[[6](https://arxiv.org/html/2510.04905v1#bib.bib6)\] and StarCoder \[[7](https://arxiv.org/html/2510.04905v1#bib.bib7)\]—has demonstrated impressive capabilities in producing syntactically correct and semantically meaningful code. Popular IDEs such as GitHub Copilot \[[8](https://arxiv.org/html/2510.04905v1#bib.bib8)\], Cursor \[[9](https://arxiv.org/html/2510.04905v1#bib.bib9)\], Windsurf \[[10](https://arxiv.org/html/2510.04905v1#bib.bib10)\], and TRAE \[[11](https://arxiv.org/html/2510.04905v1#bib.bib11)\] exemplify this trend, providing real-time code suggestions, semantic navigation, and in-context code explanations. These advancements have facilitated the widespread adoption of LLMs across a variety of software engineering tasks, including code completion, bug fixing, code translation, refactoring, test case generation, and automated documentation. More recently, leading technology companies have introduced their own code agent solutions, such as OpenAI Codex \[[12](https://arxiv.org/html/2510.04905v1#bib.bib12)\], Gemini CLI \[[13](https://arxiv.org/html/2510.04905v1#bib.bib13)\], and Claude Code \[[14](https://arxiv.org/html/2510.04905v1#bib.bib14)\], signaling a shift toward highly autonomous, agent-driven workflows that further enhance developer productivity and reduce manual coding effort.

Despite the remarkable progress of LLMs in code generation and IDE-assisted development, most deployed systems mentioned above still offer only basic context retrieval, typically limited to file- or text-based search within agent frameworks. While such methods are interpretable, they may lead to redundant lookups and underutilization of structural context. Meanwhile, generative models further face challenges in consuming retrieved contexts: strong models (e.g., GPT-4o) often gain little from retrieval on library-related tasks due to prior “memorization”, while weaker models benefit more but risk context overload, leading to verbose or erroneous outputs  \[[15](https://arxiv.org/html/2510.04905v1#bib.bib15)\].

## Figure 1: Comparison between General Code Generation and Repository-Level Code Generation

In real-world scenarios, software systems are composed of complex, modular architectures with interdependent components spread across multiple files and directories. Developers must reason across different modules and architectural boundaries to maintain correctness and consistency. Addressing this challenge has given rise to the emerging research direction of Repository-Level Code Generation (RLCG), which seeks to endow LLMs with holistic reasoning capabilities over entire code repositories. RLCG emphasizes generation and modification of code informed by information distributed across an entire repository. Unlike isolated code snippets, Repository-Level Code Generation must satisfy several critical requirements:

- •
  Long-range dependency modeling: In repository-scale code, relevant context is often spread across dozens or even hundreds of files, requiring models to capture dependencies over long distances.
- •
  Global semantic consistency: Generated code must adhere to project-wide naming conventions, correctly reference existing APIs, and respect type hierarchies to maintain overall semantic coherence.
- •
  Cross-file linkage: Coherent code generation demands reasoning over definitions of variables, functions, and classes that are distributed across multiple files.
- •
  Incremental evolution: Insertions, deletions, and modifications should preserve the correctness and functionality of the entire codebase throughout its evolution.

Although scaling LLMs and extending context windows offer partial solutions to long-range reasoning and global coherence, such techniques are generally restricted to large, cloud-based models that undergo extensive post-training. In practice, most currently commonly used models lack these properties, limiting their ability to support project-scale code understanding and memory-efficient operation.

Moreover, privacy and data protection are critical concerns for many organizations, as transmitting sensitive code or data to external cloud services may breach compliance or expose proprietary information. Even anonymized prompts are vulnerable, since reverse engineering may re-identify private information, and pretrained models can inadvertently recall memorized data \[[16](https://arxiv.org/html/2510.04905v1#bib.bib16)\]\[[17](https://arxiv.org/html/2510.04905v1#bib.bib17)\].

Compounding these challenges, current LLMs are pretrained predominantly on public repositories, with limited access to private or enterprise codebases that are critical in real-world applications. Additionally, most training data reflects code snapshots from before 2024, limiting models’ awareness of recent practices and evolving library ecosystems \[[18](https://arxiv.org/html/2510.04905v1#bib.bib18)\]. While fine-tuning can help bridge these gaps, it demands task-specific data and incurs substantial computational overhead, especially for large-scale models.

To overcome these limitations, the community has increasingly embraced Retrieval-Augmented Generation (RAG) as a promising paradigm for repository-scale tasks. RAG-based frameworks retrieve relevant content from the repository to construct dynamic, context-aware prompts for generation. This approach enables models to transcend fixed context windows and leverage external knowledge, facilitating more informed and scalable code generation.

Beyond scalability, retrieval-based techniques improve explainability, controllability, and interpretability by surfacing human-readable artifacts during the generation process. As the field advances, diverse RAG strategies have emerged, including sparse and dense retrieval, graph-based retrieval, hybrid pipelines, and agent-style retrieval that integrates static code analysis, tool invocation, and iterative refinement \[[19](https://arxiv.org/html/2510.04905v1#bib.bib19)\]\[[20](https://arxiv.org/html/2510.04905v1#bib.bib20)\]\[[21](https://arxiv.org/html/2510.04905v1#bib.bib21)\]\[[22](https://arxiv.org/html/2510.04905v1#bib.bib22)\]. In recent literature, this research direction is also referred to as Retrieval-Augmented Code Generation (RACG), highlighting its growing importance at the intersection of software engineering and LLM research.

As illustrated in Figure [1](https://arxiv.org/html/2510.04905v1#S1.F1 "Figure 1 ‣ 1 Introduction ‣ Retrieval-Augmented Code Generation: A Survey with Focus on Repository-Level Approaches"), existing surveys on LLMs generally proceed from either the perspective of general code generation—emphasizing the synthesis of isolated snippets from natural language instructions—or from broader software engineering dimensions, such as testing, debugging, and program repair \[[23](https://arxiv.org/html/2510.04905v1#bib.bib23)\]\[[24](https://arxiv.org/html/2510.04905v1#bib.bib24)\]. While informative, such studies often overlook the practical applicability and inherent complexity of large-scale software development. From a purely retrieval-augmented generation perspective, surveys remain scarce and typically provide only limited discussion of code-related scenarios \[[25](https://arxiv.org/html/2510.04905v1#bib.bib25)\]\[[26](https://arxiv.org/html/2510.04905v1#bib.bib26)\]. Moreover, unlike from an agentic perspective, Retrieval-Augmented Code Generation is still underexplored, and Repository-Level Code Generation has yet to be systematically investigated \[[27](https://arxiv.org/html/2510.04905v1#bib.bib27)\]\[[28](https://arxiv.org/html/2510.04905v1#bib.bib28)\]\[[29](https://arxiv.org/html/2510.04905v1#bib.bib29)\].

To conclude, despite advances in LLMs and code agents, real-world Repository-Level Code Generation still faces key challenges: reasoning over dependencies across multiple files, ensuring privacy for sensitive code, and effectively leveraging retrieval-augmented generation techniques. Existing models and RAG methods address these issues only partially, leaving a gap between current capabilities and the requirements of practical software development. Our work aims to address this gap by presenting a comprehensive literature review on recent advances in Retrieval-Augmented Code Generation (RACG), with a particular focus on Repository-Level techniques while also covering representative non-repository methods for completeness. We systematically categorize current research across multiple dimensions, including retrieval strategies, role of training, agent architectures, backbone models, language support, downstream tasks, and benchmark datasets. By synthesizing the state of the art and identifying key open problems, this work seeks to establish a foundational reference for advancing AI-powered software engineering with retrieval.

##### Key Contributions.

- •
  We present a comprehensive survey of the emerging field of Retrieval-Augmented Code Generation, highlighting unique challenges faced at Repository Level such as long-range dependencies, global semantic consistency, and cross-file reasoning.
- •
  We systematically analyze Retrieval-Augmented Code Generation techniques mainly in the context of RLCG, categorizing methods by retrieval strategy, generation architecture, and integration pipeline.
- •
  We compare recent works across dimensions such as model design, task specialization, benchmark datasets, providing a structured taxonomy of the field.
- •
  We outline key limitations in current approaches and identify promising directions for future research, including multimodal code generation, memory-efficient context construction, repository-wide consistency mechanisms, and more nuanced and fine-grained evaluation metrics.

## 2 Preliminaries

In this section, we define key concepts and establish the foundational terminology used throughout this survey. These definitions help distinguish Repository-Level Code Generation from traditional code generation tasks and clarify the components of Retrieval-Augmented Code Generation frameworks.

### 2.1 Repository-Level Code Generation (RLCG)

Repository-Level Code Generation refers to the process of generating, modifying, or reasoning about code in the context of an entire software repository, rather than isolated code segments. Unlike general code generation tasks that operate at the function-level or file-level, RLCG aims to address real-world software development needs that involve large-scale, multi-module, and interdependent codebases, introducing a higher level of complexity.

## Typical applications of RLCG include the following tasks that require project-wide understanding and reasoning:

- •
  Cross-file Code Completion: This task refers to predicting or synthesizing missing code segments based on repository-wide context. Such segments can range from completing individual lines of code to generating entire functions or methods. It can be broadly divided into two subtypes:

  - –
    Intra-module Completion: Filling in partial implementations within a module by leveraging type definitions, utility functions, or class hierarchies defined across different files within the same module.
  - –
    Inter-module Completion: Generating code that integrates with or extends other modules, requiring the model to understand APIs, dependency graphs, or plugin architectures that span the entire project.
- •
  GitHub Issue Resolution: Automatically resolving open issues or pull requests by generating or modifying code relevant to the reported problem. This task requires the model to jointly understand natural language descriptions, repository structure, and relevant code segments. It often involves identifying the root cause, locating affected files, and generating patches that conform to project conventions and constraints.

Beyond these, tasks such as unit test generation, bug localization and fixing, automatic program repair, and repository-wide refactoring can also be regarded as important applications of RLCG. In summary, key characteristics and technical challenges of RLCG include: long-range dependency modeling, global semantic consistency, cross-file linkage, and incremental evolution. RLCG sits at the intersection of software engineering and language modeling, and it represents a critical step toward building intelligent programming assistants that can operate at the scale of real-world projects.

## Figure 2: Retrieval-Augmented Code Generation, with a focus on Repository-Level approaches

### 2.2 Retrieval-Augmented Code Generation (RACG)

Retrieval-Augmented Code Generation is an emerging paradigm that enhances large language models with external software knowledge through retrieval mechanisms. In contrast to vanilla LLM-based generation, where outputs rely solely on the model’s internal parameters and limited input context, RACG methods dynamically retrieve relevant information from a large corpus—such as code files, documentation, or structural representations—to inform generation.

In the context of Repository-Level Code Generation, RACG is especially promising due to its ability to incorporate long-range, project-wide knowledge without exceeding model context limits. A typical RACG pipeline includes two primary components:

- •
  Retriever: A module that selects relevant context from the repository based on the input query or partial code. Retrieval can be implemented in various forms:

  - –
    Identifier Matching: This is the most basic and widely used strategy. It relies on exact matches of identifiers such as variable names, function signatures, or class references across files.
  - –
    Sparse Retrieval: Relies on lexical or keyword-based matching (e.g., TF-IDF, BM25, Jaccard Similarity) with sparse vectors, focusing on exact or near-exact term overlaps.
  - –
    Dense (Vector-based) Retrieval: Encodes both queries and candidate code chunks into neural embeddings (e.g., UniXcoder, CodeBERT) and retrieves relevant items through approximate nearest neighbor search in the embedding space.
  - –
    Graph-based Retrieval: Exploits structured code representations such as abstract syntax trees (ASTs), call graphs, control/data flow graphs, or module dependency graphs. Retrieval is typically conducted via graph traversal, similarity propagation, or subgraph matching.
  - –
    Hybrid Retrieval: Integrates multiple signals—such as lexical matching, embedding similarity, and graph structure—to achieve more balanced trade-offs between retrieval precision and recall.
- •
  Generator: A language model (e.g., GPT-4o, CodeLlama) that consumes the retrieved context alongside the input prompt to generate context-aware, semantically consistent code.

The diversity in retrieval strategies directly influences the quality and granularity of the generated code. While vector-based methods are efficient and flexible, they may lack structural understanding. On the other hand, graph-based retrieval excels at capturing architectural and dependency relationships, making it particularly suited for tasks involving global consistency or cross-file reasoning.

Moreover, recent works have explored iterative or agent-style RACG frameworks, where retrieval and generation are conducted in multi-step loops with intermediate reasoning, tool execution, or reflection \[[19](https://arxiv.org/html/2510.04905v1#bib.bib19)\]\[[30](https://arxiv.org/html/2510.04905v1#bib.bib30)\]. These interactive paradigms further enhance the adaptability and robustness of RACG systems in complex repository-scale environments.

Overall, RACG provides a modular and extensible foundation for bridging the gap between LLM capabilities and the structural, large-scale nature of modern software repositories.

## 3 Methodology

This section outlines the methodology used to conduct a systematic literature review. We adopt a structured review approach inspired by established guidelines in software engineering literature \[[31](https://arxiv.org/html/2510.04905v1#bib.bib31)\]\[[28](https://arxiv.org/html/2510.04905v1#bib.bib28)\]\[[23](https://arxiv.org/html/2510.04905v1#bib.bib23)\]. The methodology encompasses research question formulation, data collection, inclusion and exclusion filtering, quality assessment, snowballing, and topic categorization.

|  |  |  |  |
|----|----|----|----|
| Domain |  |  Venue | Acronym |
| AI |  |  International Conference on Learning Representations | ICLR |
|  |  |  Neural Information Processing Systems | NeurIPS |
|  |  |  International Conference on Machine Learning | ICML |
|  |  |  International Joint Conference on Artificial Intelligence | IJCAI |
|  |  |  AAAI Conference on Artificial Intelligence | AAAI |
|  |  |  Journal of Machine Learning Research | JMLR |
|  |  |  Artificial Intelligence Journal | AIJ |
|  |  |  Annual Meeting of the Association for Computational Linguistics | ACL |
|  |  |  Empirical Methods in Natural Language Processing | EMNLP |
|  |  |  North American Chapter of the Association for Computational Linguistics | NAACL |
|  |  |  International Conference on Computational Linguistics | COLING |
| SE |  |  International Conference on Software Engineering | ICSE |
|  |  |  The ACM International Conference on the Foundations of Software Engineering¹¹1From 2017 to 2023, FSE was jointly held with ESEC under the name The ACM Joint European Software Engineering Conference and Symposium on the Foundations of Software Engineering (ESEC/FSE). Since 2024, it has been held independently as The ACM International Conference on the Foundations of Software Engineering (FSE). | FSE |
|  |  |  International Conference on Automated Software Engineering | ASE |
|  |  |  Transactions on Software Engineering and Methodology | TOSEM |
|  |  |  Transactions on Software Engineering | TSE |
|  |  |  International Symposium on Software Testing and Analysis | ISSTA |

Table 1: Publication venues for conference proceedings and journal articles used for manual review.

### 3.1 Research Questions

To define the scope and guide the review process, we formulate the following research questions (RQs), each targeting a key dimension of the evolving research landscape in Retrieval-Augmented Code Generation.

- •
  RQ1: How is Retrieval-Augmented Generation applied to code, and what innovations exist?
  This question investigates how RAG techniques are adapted for both code-level and repository-level generation scenarios. It encompasses the design of retrieval modules, fusion strategies, training paradigms, and agent architectures that enhance long-range dependency modeling and global code consistency.
- •
  RQ2: What are the core settings and evaluation practices in Repository-Level Code Generation?
  This question examines the general setup of RLCG systems, covering downstream task types, supported programming languages, and backbone model choices. It also discusses how evaluation benchmarks and metrics reflect practical software development demands.
- •
  RQ3: What are the main bottlenecks and future directions for Retrieval-Augmented Code Generation?
  This question identifies current limitations in RACG research, including retrieval noise, graph complexity, and scalability challenges. It further explores emerging directions that bridge the gap between research prototypes and real-world software engineering applications.

### 3.2 Data Collection Process

To investigate the above research questions (RQs) and build a comprehensive corpus on Retrieval-Augmented Code Generation (RACG), we followed a sequential, two-stage data collection process.

First, guided by our RQs, we performed a manual review of recent proceedings from top-tier conferences and journals in natural language processing, machine learning, and software engineering. The full list of venues considered in this stage is shown in Table [1](https://arxiv.org/html/2510.04905v1#S3.T1 "Table 1 ‣ 3 Methodology ‣ Retrieval-Augmented Code Generation: A Survey with Focus on Repository-Level Approaches"). The manual review aimed to identify seminal and influential works that keyword-only searches might miss. From this manual screening we distilled an initial set of candidate search terms; these terms were then iteratively refined based on inspection of retrieved papers and early search results. The final, iteratively-optimized keyword set is shown in Table [2](https://arxiv.org/html/2510.04905v1#S3.T2 "Table 2 ‣ 3.2 Data Collection Process ‣ 3 Methodology ‣ Retrieval-Augmented Code Generation: A Survey with Focus on Repository-Level Approaches"). Notably, we did not include LLM-related keywords in this filtering stage, as we observed that RACG papers almost invariably involve LLMs; including such terms would therefore lead to redundant filtering. Instead, LLM-specific criteria were applied in subsequent stages of the review.

Second, using the iteratively-refined keywords, we conducted automated queries across multiple bibliographic platforms to retrieve a broad set of candidate papers. The platforms queried include *ACM Digital Library*, *IEEE Xplore*, *arXiv*, and *OpenReview*, as well as the *ACL Anthology* and selected official conference or journal websites where necessary. These searches were designed to capture work at the intersection of pretrained LLMs, RAG, code generation, and repository-level tasks. To ensure fairness across platforms and maintain efficiency, the automated queries were restricted to paper titles and abstracts. We did not include keywords, since *arXiv* does not provide them and, in most cases, keyword lists are subsets of the information conveyed in titles and abstracts. We also did not search full texts, as this would be prohibitively costly and unlikely to substantially improve recall.

All searches covered the period from January 1, 2023 through August 31, 2025. We selected January 2023 as the start date to capture research produced after the initial public adoption of ChatGPT in late 2022. For EMNLP 2025 and ASE 2025, although the acceptance decisions were announced in August 2025, the full papers were not yet publicly available at the time of our search and were therefore excluded. We curated an initial set of 579 candidate papers published between January 2023 and September 2025. Each paper was subsequently screened using the inclusion and exclusion criteria presented in Section [3.3](https://arxiv.org/html/2510.04905v1#S3.SS3 "3.3 Inclusion and Exclusion Criteria ‣ 3 Methodology ‣ Retrieval-Augmented Code Generation: A Survey with Focus on Repository-Level Approaches").

|  |
|----|
|  Retrieval-Augmented Code Generation, Retrieval Augmented Code Generation, Repository-Level Code Generation, Repository Level Code Generation, Code Retrieval, Code Search, Code RAG, RACG, Code Completion |

Table 2: Keywords related to RACG tasks for automated search.

### 3.3 Inclusion and Exclusion Criteria

## A paper was included in our corpus if it satisfied all of the following criteria:

- •
  The task involves retrieval-augmented, cross-file, or repository-level settings that enhance code generation, or at minimum, includes a discussion of how RAG influences code generation.
- •
  The work introduces a novel RAG-based method or provides an analysis of its effects, with broader contributions in knowledge localization, effective retrieval of external support, and overall enhancement of generation quality. Notably, some long-context approaches are also included as special cases for comparison with RAG-based methods.
- •
  The full text is accessible and written in English.

## Conversely, a paper was excluded if it met any of the following conditions:

## Figure 3: Selected Paper Distribution

- •
  The focus is mainly on standalone code generation tasks where neither the problem nor the solution involves any contextual understanding (e.g., algorithm implementation or problem-solving without repository context).
- •
  Language models are mentioned only as future work or peripheral discussion, rather than being central to the proposed method.
- •
  Pretrained language models are not the backbone of the system, with the focus instead placed on static IDE tooling or handcrafted architectures (e.g., pure attention-based non-pretrained models).
- •
  RAG is merely treated as a minor subcomponent in a broader framework, without introducing novel retrieval strategies or making substantive contributions.
- •
  Research emphasizing vulnerability detection, clone detection, or other retrieval-centric software engineering tasks generally falls outside the scope of this survey.
- •
  Research that focuses solely on training dense retrieval models is excluded, as it falls under the domain of code search. However, if a study examines their impact on RACG tasks—such as issue resolution—it will be retained.
- •
  The paper primarily discusses direction, vision, or ethical concerns without presenting a concrete and usable technical solution or finding.

The above criteria serve as the basic selection rules; however, papers with special relevance to the goals of this survey were also included on a case-by-case basis. For example, when analyzing the effectiveness of RAG techniques, we additionally incorporated a small number of code generation approaches that do not employ RAG, in order to provide a meaningful point of comparison.

### 3.4 Quality Assessment

## Each paper was assessed using a quality rubric, evaluating the following dimensions:

- •
  Relevance to RAG-enhanced or repository-level code generation.
- •
  Clarity in describing the contributions and methodology.
- •
  Explicit discussion of retrieval and generation components.
- •
  Completeness of the experimental setup and reproducibility.

Any paper found to exhibit substantial deficiencies in any of the above dimensions was excluded from the final corpus. For arXiv submissions, we required a detailed method section and adequate experimental results to be considered.

### 3.5 Snowballing and Final Corpus

To ensure comprehensive coverage, we conducted backward snowballing by examining the references cited in key papers identified during the initial search phase. This process proved especially valuable in retrieving earlier foundational works and relevant studies that may not include explicit keywords but nevertheless contribute to Retrieval-Aumented Code Generation tasks. Many recent papers inherently cite seminal studies on LLMs and RAG, allowing us to trace their conceptual and methodological lineage. These papers were included after confirming their relevance through manual inspection and annotation.

After screening and quality filtering, our final corpus consists of 110 papers. The complete dataset reflects the interdisciplinary and evolving nature of RACG, spanning multiple subfields including software engineering, natural language processing, and machine learning.

### 3.6 Topic Categorization and Analysis

We manually annotated each selected paper based on its primary research focus, model architecture, retrieval technique, and target task. These annotations formed the basis for the taxonomy and thematic analysis presented in the subsequent sections. In addition, we analyzed publication trends, distribution across venues, and the breakdown of research topics over time.

Figure 4: Top contributing universities and companies in RACG-related research.

Figure [3](https://arxiv.org/html/2510.04905v1#S3.F3 "Figure 3 ‣ 3.3 Inclusion and Exclusion Criteria ‣ 3 Methodology ‣ Retrieval-Augmented Code Generation: A Survey with Focus on Repository-Level Approaches") shows the distribution of admission results across 110 papers. ArXiv dominates with 41 papers (37.3%), reflecting the widespread use of preprints for rapid dissemination. Among peer-reviewed venues, ACL (9, 8.2%), FSE (6, 5.5%), ICSE (6, 5.5%), ASE (6, 5.5%), EMNLP (5, 4.5%), and ICML/ICLR (4 each, 3.6%) are the most frequent, indicating a concentration in top-tier NLP, ML, and software engineering conferences. Other venues such as ISSTA, TSE, NeurIPS, NAACL, COLM, TOSEM, and COLING contribute only two papers each. This long-tail distribution suggests dominance by a few leading venues but sustained diversity across research communities. However, it should not be overinterpreted as a direct measure of venue popularity, since some conferences held three editions during the observation period whereas others had only two.

The trend reveals a polarization: many works appear on ArXiv without peer review, while a substantial portion of peer-reviewed studies cluster in top-tier venues like ACL and EMNLP. This reflects both the speed of open dissemination in AI and the competitiveness of flagship conferences. Compared with traditional software engineering venues, the AI community hosts a larger number of premier events, emphasizing openness, scalability, and cross-disciplinary collaboration. Code-centric research—covering generation, repair, and reasoning—has become integral to large language model (LLM) studies, making programming-oriented evaluation an essential indicator of technical progress.

As shown in Figure [4](https://arxiv.org/html/2510.04905v1#S3.F4 "Figure 4 ‣ 3.6 Topic Categorization and Analysis ‣ 3 Methodology ‣ Retrieval-Augmented Code Generation: A Survey with Focus on Repository-Level Approaches"), we further analyzed the institutional affiliations of the papers, considering only the first author (including co-first authors), as they typically lead the work. If the first author conducted the research while interning at a company, that company was counted as an affiliation. The institutional distribution again exhibits a long-tail pattern. Among universities, Zhejiang University, Peking University, and the University of Chinese Academy of Sciences are the leading contributors, followed by Carnegie Mellon University, Nanyang Technological University, and the University of Illinois Urbana–Champaign, each producing several papers. A second tier of active institutions includes Nanjing University, Shanghai Jiao Tong University, and Fudan University.

In industry, major research labs such as Microsoft, Ant Group, Alibaba, Amazon, Salesforce, and ByteDance play a visible role, often collaborating with universities and publishing at top-tier venues.

Geographically, Chinese institutions dominate the landscape, but there is also substantial participation from North America, Europe, and Singapore, reflecting the increasingly international and collaborative nature of this research area.

## 4 Literature Review

Figure 5: Mapping between research questions and corresponding survey sections. Each flow indicates the relationship between a specific RQ and the sections that address it, providing a clear roadmap for readers to navigate the survey content.

This section surveys recent advances in Retrieval-Augmented Code Generation (RACG), with particular emphasis on repository-level settings. Our survey is organized around three core research questions, which together provide a structured understanding of how retrieval-augmented paradigms enhance code generation capabilities across scales, as illustrated in Figure [5](https://arxiv.org/html/2510.04905v1#S4.F5 "Figure 5 ‣ 4 Literature Review ‣ Retrieval-Augmented Code Generation: A Survey with Focus on Repository-Level Approaches").

RQ1 (RACG Adaptation & Innovations) explores how retrieval-augmented generation techniques are applied and extended in code contexts. This includes analyses of retrieval strategies ([4.1](https://arxiv.org/html/2510.04905v1#S4.SS1 "4.1 RAG Strategies ‣ 4 Literature Review ‣ Retrieval-Augmented Code Generation: A Survey with Focus on Repository-Level Approaches")), training paradigms ([4.2](https://arxiv.org/html/2510.04905v1#S4.SS2 "4.2 The Role of Training in Enhancing RACG Performance ‣ 4 Literature Review ‣ Retrieval-Augmented Code Generation: A Survey with Focus on Repository-Level Approaches")), and agent architectures ([4.3](https://arxiv.org/html/2510.04905v1#S4.SS3 "4.3 The Application of Agent Architectures in RACG Tasks ‣ 4 Literature Review ‣ Retrieval-Augmented Code Generation: A Survey with Focus on Repository-Level Approaches")), which together reveal innovations for improving long-range dependency and global consistency.

RQ2 (RLCG Settings & Evaluation) focuses on the general setup of repository-level code generation, examining downstream task formulations ([4.4](https://arxiv.org/html/2510.04905v1#S4.SS4 "4.4 Downstream Tasks and Benchmarks for RLCG ‣ 4 Literature Review ‣ Retrieval-Augmented Code Generation: A Survey with Focus on Repository-Level Approaches")), supported programming languages ([4.5](https://arxiv.org/html/2510.04905v1#S4.SS5 "4.5 Programming Language Support ‣ 4 Literature Review ‣ Retrieval-Augmented Code Generation: A Survey with Focus on Repository-Level Approaches")), and backbone models for retrieval and generation ([4.6](https://arxiv.org/html/2510.04905v1#S4.SS6 "4.6 Backbone Models for Retrieval and Generation ‣ 4 Literature Review ‣ Retrieval-Augmented Code Generation: A Survey with Focus on Repository-Level Approaches")). This perspective highlights how evaluation benchmarks and technical choices reflect real-world software development requirements.

RQ3 (Bottlenecks & Future Directions) identifies major challenges and open problems and further discusses emerging opportunities, as detailed in our analyses of current limitations ([5.1](https://arxiv.org/html/2510.04905v1#S5.SS1 "5.1 Limitations of Existing Approaches ‣ 5 Challenges & Opportunities ‣ Retrieval-Augmented Code Generation: A Survey with Focus on Repository-Level Approaches")) and prospective directions ([5.2](https://arxiv.org/html/2510.04905v1#S5.SS2 "5.2 Future Directions ‣ 5 Challenges & Opportunities ‣ Retrieval-Augmented Code Generation: A Survey with Focus on Repository-Level Approaches")). While nearly every section touches on issues relevant to RQ3, we summarize here only the most direct contributions.

Specifically, in this section, we examine the design of retrieval strategies, contrasting non-graph-based and graph-based approaches alongside hybrid pipelines. We analyze how training paradigms—ranging from fine-tuning to reinforcement learning—enhance RACG performance by aligning retrieval and generation modules. We discuss the growing application of agent-based architectures, which introduce iteration, tool usage, and autonomy into RACG systems. Additionally, we analyze representative downstream tasks and benchmark datasets that support systematic evaluation, summarize programming language coverage in current studies, and review the backbone models adopted for retrieval and generation.

Through this structured taxonomy, we identify common patterns and design choices, as well as gaps in retrieval precision, training methodology, evaluation realism, and deployment readiness. This analysis not only contextualizes existing research but also establishes a foundation for identifying promising future directions in software engineering.

### 4.1 RAG Strategies

\pgfqpointtransformed\pgfqpointtransformed\pgfqpointtransformed\pgfqpointtransformed\pgfqpointtransformed\pgfqpointtransformed\pgfqpointtransformed\pgfqpointtransformed\pgfqpointtransformed\pgfqpointtransformed\pgfqpointtransformed\pgfqpointtransformed\pgfqpointtransformed\pgfqpointtransformed\pgfqpointtransformed\pgfqpointtransformed\pgfqpointtransformed\pgfqpointtransformed\pgfqpointtransformed\pgfqpointtransformed\pgfqpointtransformed\pgfqpointtransformed\pgfqpointtransformed\pgfqpointtransformed\pgfqpointtransformed\pgfqpointtransformed

Figure 6: Taxonomy of RAG Strategies.

Retrieval-Augmented Code Generation methods can be broadly categorized into two major paradigms: non-graph-based and graph-based implementations. Each offers distinct advantages and recent advances have seen increasing convergence between the two. Hybrid approaches are grouped according to their predominant reliance on graph-based or non-graph-based components.

Non-graph-based RAG approaches typically retrieve relevant code snippets, comments, or documentation based on lexical similarity (including basic identifier matching) or semantic similarity via dense embeddings. Importantly, recent developments have significantly extended the capabilities of non-graph-based methods. Many now incorporate additional contextual signals, such as file paths, surrounding code blocks, dependency metadata, or even pseudo-structural cues. This evolution has transformed non-graph-based retrieval into a sophisticated and adaptable framework, capable of supporting complex, repository-level tasks.

In contrast, graph-based RAG methods leverage the inherently structured nature of code to construct explicit graph representations, such as Abstract Syntax Trees (ASTs), data-flow graphs, or dependency graphs. Nodes typically represent code entities (e.g., functions, classes, variables), while edges encode relationships such as function calls, inheritance, import statements, or data/control flow. By exploiting graph connectivity and traversal patterns, graph-based methods enable more structurally grounded and contextually precise retrieval, which is particularly beneficial for tasks requiring global reasoning, such as cross-file completion or multi-module consistency checking. While graph-based methods offer high fidelity and structural awareness, they also introduce challenges in preprocessing, graph maintenance, and computational overhead—especially when applied to large-scale, heterogeneous repositories.

#### 4.1.1 Non-Graph-based RAG

Non-graph-based RAG methods retrieve relevant code snippets or documentation without explicitly constructing or relying on graph representations. Traditionally, these approaches treat the code repository as a flat collection of text segments—typically functions, files, or documentation blocks—and retrieve relevant chunks via lexical or semantic similarity. Early systems relied on simple identifier matching and classical lexical retrieval techniques such as BM25 \[[99](https://arxiv.org/html/2510.04905v1#bib.bib99)\] or Jaccard similarity \[[100](https://arxiv.org/html/2510.04905v1#bib.bib100)\], and more recent efforts leverage dense retrieval models such as GraphCodeBERT \[[101](https://arxiv.org/html/2510.04905v1#bib.bib101)\] or UniXcoder \[[102](https://arxiv.org/html/2510.04905v1#bib.bib102)\] to perform embedding-based matching.

While originally lightweight and straightforward to implement as it’s universally adopted in RAG systems in various domains, non-graph-based approaches specialized in code have evolved substantially. Modern RACG systems often enhance basic retrieval pipelines through optimization along three main axes: retrieval strategies, retrieval content construction, and static analysis integration.

##### Retrieval Strategy Optimization.

Numerous works focus on improving retrieval effectiveness through architectural or algorithmic innovations. Early efforts such as ReACC \[[32](https://arxiv.org/html/2510.04905v1#bib.bib32)\], CEDAR \[[33](https://arxiv.org/html/2510.04905v1#bib.bib33)\] and RAP-Gen \[[34](https://arxiv.org/html/2510.04905v1#bib.bib34)\] integrate hybrid retrieval (BM25 + dense embeddings) to balance precision and recall. RepoCoder \[[19](https://arxiv.org/html/2510.04905v1#bib.bib19)\], a foundational work in RACG, introduces iterative retrieval, where retrieved context is progressively refined over multiple rounds. CODEGENAPI \[[35](https://arxiv.org/html/2510.04905v1#bib.bib35)\] targets private repositories by retrieving potentially useful APIs. kNM-LM \[[36](https://arxiv.org/html/2510.04905v1#bib.bib36)\] decouples the domain database from the language model (storing only tokens the LM fails to predict) and applies Bayesian inference to combine database outputs with LM predictions. Subsequent works introduce increasingly sophisticated retrieval and context selection mechanisms to enhance the adaptability and precision of RACG systems.

(1) Adaptive Retrieval and Policy Learning. Several systems focus on dynamically adjusting retrieval behavior. kNN-TRANX \[[37](https://arxiv.org/html/2510.04905v1#bib.bib37)\] employs a three-stage optimization process, featuring syntax-constrained token-level retrieval via ASDL rules, a meta-*k* network that adapts retrieval weights using distance and count features, and a confidence network that fuses kNN and neural predictions based on confidence- and k-value–aware weighting. ProCC \[[38](https://arxiv.org/html/2510.04905v1#bib.bib38)\] leverages LinUCB \[[103](https://arxiv.org/html/2510.04905v1#bib.bib103)\] for online adaptation of retrieval strategies, while FT2Ra \[[39](https://arxiv.org/html/2510.04905v1#bib.bib39)\] exploits $`\Delta`$logits as retrieval signals, simulating fine-tuning effects via adaptive learning rates and multi-round retrieval. ARCS \[[40](https://arxiv.org/html/2510.04905v1#bib.bib40)\] introduces an *agentic* mechanism that decomposes complex queries into sub-queries to handle retrieval difficulty adaptively. CODEFILTER \[[41](https://arxiv.org/html/2510.04905v1#bib.bib41)\] introduces explicit retrieval-control tokens (\, \) and polarity markers (\, \, \) to guide selective context integration. SWE-Fixer \[[42](https://arxiv.org/html/2510.04905v1#bib.bib42)\] adopts a coarse-to-fine paradigm, using BM25 for candidate narrowing followed by a fine-tuned 7B model (e.g., Qwen2.5) for re-ranking.

(2) Scalable and Information-Efficient Context Selection. To address scalability in large codebases, HCP \[[43](https://arxiv.org/html/2510.04905v1#bib.bib43)\] proposes *hierarchical context pruning* to retain structurally relevant functions while discarding unrelated content. RepoMinCoder \[[44](https://arxiv.org/html/2510.04905v1#bib.bib44)\] formulates context selection as an *information-loss minimization* problem, identifying the most informative subset of code segments under strict length constraints.

(3) Retrieval Fidelity and Structural Awareness. Several methods aim to enhance retrieval precision through structure- and semantics-aware optimization. CoRet \[[45](https://arxiv.org/html/2510.04905v1#bib.bib45)\] jointly models code semantics, repository structure, and call-graph dependencies to improve retrieval fidelity. CCCI \[[46](https://arxiv.org/html/2510.04905v1#bib.bib46)\] employs file-level classifiers to ensure contextual consistency, while HyRACC \[[47](https://arxiv.org/html/2510.04905v1#bib.bib47)\] fuses probability distributions from both the LM and a token database for adaptive confidence calibration. De-Hallucinator \[[48](https://arxiv.org/html/2510.04905v1#bib.bib48)\] retrieves project-specific API references to mitigate hallucinations in LLM-based generation. Fedrushkov et al. \[[49](https://arxiv.org/html/2510.04905v1#bib.bib49)\] introduce explicit indentation tokens to capture syntactic hierarchy and employ contrastive learning to eliminate hard negatives during training.

(4) Learning from Feedback and Self-Expression. Beyond traditional retrieval pipelines, RepoGenReflex \[[50](https://arxiv.org/html/2510.04905v1#bib.bib50)\] builds on a *Verbal Reinforcement Learning* framework, where a Reflector module produces natural-language feedback that is iteratively stored and reused. Similarly, SelfRACG \[[51](https://arxiv.org/html/2510.04905v1#bib.bib51)\] enables LLMs to explicitly express their information needs, thereby improving self-guided retrieval and contextual grounding.

(5) Low-Resource Retrieval. To support underrepresented programming languages, RAR \[[52](https://arxiv.org/html/2510.04905v1#bib.bib52)\] employs a dual-retriever design: the driver retriever ($`R_{D}`$) first retrieves information from either the example corpus ($`E`$) or the document grammar library ($`D`$), while the influenced retriever ($`R_{I}`$) subsequently retrieves the complementary type by leveraging the results of $`R_{D}`$, thereby maximizing data utilization in low-resource settings. PERC \[[53](https://arxiv.org/html/2510.04905v1#bib.bib53)\] also targets underrepresented code by retrieving examples that contain reusable algorithmic plans and converting source code into pseudocode to better align low-resource programming languages with high-resource ones.

##### Retrieval Content Construction.

Another line of research improves retrieval effectiveness by enriching or restructuring the retrieval corpus and query formulation. Typical techniques include context pruning, which selectively retains structurally relevant code segments to reduce noise and memory overhead; query rewriting and optimization, where initial queries are reformulated (e.g., through prompt engineering or multi-perspective construction) to better capture semantic intent; and knowledge base curation and augmentation, which reorganizes repository artifacts or supplements missing content (e.g., API descriptions or documentation) to enhance the informativeness of retrieved contexts.

(1) Query Reformulation and Multi-Perspective Retrieval. Several methods focus on improving query expressiveness and semantic alignment. ProCC \[[38](https://arxiv.org/html/2510.04905v1#bib.bib38)\] proposes a prompt-based multi-perspective retriever, constructing queries from lexical semantics, hypothesis lines, and code summaries. RLPG \[[54](https://arxiv.org/html/2510.04905v1#bib.bib54)\] defines multiple rule-based strategies to extract relevant contexts and trains a predictor to assess whether a candidate context is beneficial for generation. RRG \[[55](https://arxiv.org/html/2510.04905v1#bib.bib55)\] adds a reconstruction step to mitigate retrieval–generation preference misalignment, thereby improving prompt informativeness. ReCo \[[56](https://arxiv.org/html/2510.04905v1#bib.bib56)\] rewrites both the query and the codebase using an LLM to ensure stylistic consistency and semantic alignment between them.

A related subdirection under query reformulation focuses on conversion-based retrieval, where code or documentation is transformed into alternative textual forms to improve semantic compatibility between queries and targets. SACL \[[57](https://arxiv.org/html/2510.04905v1#bib.bib57)\] mitigates biases through semantically enhanced code reranking (generating functional descriptions of code and fusing the retrieval scores of code and descriptions) and contextual localization (generating semantic descriptions for repository files). Kondo et al. \[[58](https://arxiv.org/html/2510.04905v1#bib.bib58)\] convert code snippets into text using LLMs and adopt a “Pred+Explain” strategy—predicting the next line alongside a natural-language explanation—to enhance retrieval quality. Similarly, Code2JSON \[[59](https://arxiv.org/html/2510.04905v1#bib.bib59)\] bridges the gap between code and natural language by extracting semantic representations through structured parsing. Chen et al. \[[60](https://arxiv.org/html/2510.04905v1#bib.bib60)\] propose three retrieval strategies: *Header2Code* (using method headers as queries), *NL2Code* (using code comments as queries), and *NL2NL* (retrieving similar comments and then their associated code), with the last strategy yielding the best performance. CodeBridge \[[61](https://arxiv.org/html/2510.04905v1#bib.bib61)\] further decomposes query–code matching into two simpler tasks—query–comment and code–code matching—to bridge domain gaps.

(2) Context Structuring and Hierarchical Construction. A second direction focuses on reorganizing or compressing the retrieval corpus to provide structured and information-dense contexts. cAST \[[62](https://arxiv.org/html/2510.04905v1#bib.bib62)\] recursively partitions ASTs and merges text nodes into semantically coherent units, preserving both structure and meaning. R²C²-Coder \[[63](https://arxiv.org/html/2510.04905v1#bib.bib63)\] constructs both abstract- and fragment-level retrieval pools and dynamically composes prompts using coarse-grained global and fine-grained local contexts. A³-CodGen \[[64](https://arxiv.org/html/2510.04905v1#bib.bib64)\] integrates information from local code elements (e.g., functions, attributes), cross-file entities, and third-party libraries to enrich prompt construction. RepoFuse \[[65](https://arxiv.org/html/2510.04905v1#bib.bib65)\] combines dual contexts—similar code and structurally related methods—and applies a rank-truncated generation strategy to compress prompt length while preserving informativeness. RAMBO \[[66](https://arxiv.org/html/2510.04905v1#bib.bib66)\] further identifies repository-specific “key code elements” and related usages to construct highly relevant prompts. Finally, RepoGenix \[[67](https://arxiv.org/html/2510.04905v1#bib.bib67)\] employs context-aware selection by combining analogous context (dependency-related code) and relevant context (similar code blocks) into fixed-length prompts, introducing a relevance score as a proactive filtering criterion.

(3) Knowledge Base Expansion and API Integration. Another strand of work enhances the retrieval corpus itself through adaptive updates or content curation. EVOR \[[68](https://arxiv.org/html/2510.04905v1#bib.bib68)\] supports dynamic expansion of the knowledge base through iterative updates, enabling continuous adaptation to evolving codebases. AllianceCoder \[[69](https://arxiv.org/html/2510.04905v1#bib.bib69)\] leverages LLMs to generate API-level descriptions as retrieval queries, improving semantic matching for usage-related tasks. And Deng et al. \[[70](https://arxiv.org/html/2510.04905v1#bib.bib70)\] retrieve APIs based on LLM-generated code drafts, bypassing explicit import statements to capture implicit dependencies.

##### Static Analysis Integration.

| System | Usage |
|----|----|
| STALL+ \[[71](https://arxiv.org/html/2510.04905v1#bib.bib71)\] | Cross-file Dependent Contexts used in Prompt Formulation, Decoding Control, Post-processing |
| MGD \[[72](https://arxiv.org/html/2510.04905v1#bib.bib72)\] | Feedback Loop Ensures Generation with Consistent Type, Identifiers, API protocol, Enum Values |
| IDECoder \[[73](https://arxiv.org/html/2510.04905v1#bib.bib73)\] | Retrieve Contexts of Code Element, Project Structure, Developer Intention, Error Feedback |
| CatCoder \[[74](https://arxiv.org/html/2510.04905v1#bib.bib74)\] | Build a Type Dependency Graph to Guide Prompts within Scope for Practicality |
| RRR \[[75](https://arxiv.org/html/2510.04905v1#bib.bib75)\] | Iteratively Refines Context for Undefined Symbols & Dependencies, Class & Member Metadata |

Table 3: Static analysis integration.

To better align retrieval with the actual code semantics, several recent systems incorporate static analysis directly into the retrieval pipeline. STALL+ \[[71](https://arxiv.org/html/2510.04905v1#bib.bib71)\] integrates static analysis outputs at multiple stages—including prompt formulation, decoding control, and post-processing—to improve retrieval precision. Monitor-Guided Decoding (MGD) \[[72](https://arxiv.org/html/2510.04905v1#bib.bib72)\] builds a feedback loop between a static analyzer and the LLM decoder, adjusting logits via masking to enforce type-consistent generation. IDECoder \[[73](https://arxiv.org/html/2510.04905v1#bib.bib73)\] exploits IDE-level static analysis to retrieve precise contexts directly from the repository. CatCoder \[[74](https://arxiv.org/html/2510.04905v1#bib.bib74)\] employs a type-dependency graph constructed via static analysis to guide prompt composition. Retrieve-Repotools-Reflect (RRR) \[[75](https://arxiv.org/html/2510.04905v1#bib.bib75)\] iteratively refines repository context via static analysis tools and integrates feedback from test outcomes to improve the quality.

Overall, the non-graph-based paradigm has undergone substantial evolution beyond early lexical retrieval. With the integration of advanced dense retrievers, dynamic corpus construction, and static-analysis-guided context selection, these systems can now support complex repository-level tasks with impressive flexibility, precision, and scalability.

#### 4.1.2 Graph-based RAG

Graph-based RAG integrates explicit code structure through graph representations. Rather than treating code as a flat sequence, these methods encode syntactic and semantic relationships via graphs, enabling more accurate context retrieval and improved global consistency during code generation. While each method introduces unique innovations and focuses on different aspects, they share several common design principles.

Table [4](https://arxiv.org/html/2510.04905v1#S4.T4 "Table 4 ‣ 4.1.2 Graph-based RAG ‣ 4.1 RAG Strategies ‣ 4 Literature Review ‣ Retrieval-Augmented Code Generation: A Survey with Focus on Repository-Level Approaches") provides a systematic comparison of recent graph-based RAG approaches, categorized by the types of nodes and edges used in their graph construction. This comparison highlights the structural richness and semantic coverage of each method. To facilitate a clearer understanding, we next outline the common edge and node types as well as the observed design patterns that underpin these graph constructions.

|  |  |  |  |  |  |  |  |  |  |  |  |
|----|----|----|----|----|----|----|----|----|----|----|----|
| Method | Edge Types |  |  |  |  |  | Node Types |  |  |  |  |
|  |  Contain |  Import |  Inherit |  Invoke |  Data F. |  Ctrl F. |  Directory |  Module |  Class |  Function |  Line |
| DraCo \[[76](https://arxiv.org/html/2510.04905v1#bib.bib76)\] |  ✓ |  ✓ |  ✓ |  ✓ |  ✓ |  $`\times`$ |  ✓ |  ✓ |  ✓ |  ✓ |  $`\times`$ |
| RepoGraph \[[20](https://arxiv.org/html/2510.04905v1#bib.bib20)\] |  ✓ |  $`\times`$ |  $`\times`$ |  ✓ |  $`\times`$ |  $`\times`$ |  $`\times`$ |  $`\times`$ |  ✓ |  ✓ |  ✓ |
| PKG \[[80](https://arxiv.org/html/2510.04905v1#bib.bib80)\] |  ✓ |  $`\times`$ |  $`\times`$ |  $`\times`$ |  $`\times`$ |  $`\times`$ |  $`\times`$ |  $`\times`$ |  $`\times`$ |  ✓ |  ✓ |
| CodeGRAG \[[77](https://arxiv.org/html/2510.04905v1#bib.bib77)\] |  ✓ |  $`\times`$ |  $`\times`$ |  ✓ |  ✓ |  ✓ |  $`\times`$ |  $`\times`$ |  $`\times`$ |  ✓ |  $`\times`$ |
| GraphCoder \[[78](https://arxiv.org/html/2510.04905v1#bib.bib78)\] |  $`\times`$ |  $`\times`$ |  $`\times`$ |  ✓ |  ✓ |  ✓ |  $`\times`$ |  $`\times`$ |  $`\times`$ |  $`\times`$ |  ✓ |
| CoCoMIC \[[91](https://arxiv.org/html/2510.04905v1#bib.bib91)\] |  ✓ |  ✓ |  $`\times`$ |  $`\times`$ |  $`\times`$ |  $`\times`$ |  $`\times`$ |  ✓ |  ✓ |  ✓ |  $`\times`$ |
| RepoHYPER \[[85](https://arxiv.org/html/2510.04905v1#bib.bib85)\] |  ✓ |  ✓ |  ✓ |  ✓ |  $`\times`$ |  $`\times`$ |  $`\times`$ |  ✓ |  ✓ |  ✓ |  $`\times`$ |
| CodexGraph \[[104](https://arxiv.org/html/2510.04905v1#bib.bib104)\] |  ✓ |  $`\times`$ |  ✓ |  ✓ |  $`\times`$ |  $`\times`$ |  $`\times`$ |  ✓ |  ✓ |  ✓ |  $`\times`$ |
| LingmaAgent \[[87](https://arxiv.org/html/2510.04905v1#bib.bib87)\] |  ✓ |  $`\times`$ |  ✓ |  ✓ |  $`\times`$ |  $`\times`$ |  ✓ |  ✓ |  ✓ |  ✓ |  $`\times`$ |
| CocoGen \[[88](https://arxiv.org/html/2510.04905v1#bib.bib88)\] |  ✓ |  ✓ |  ✓ |  $`\times`$ |  $`\times`$ |  $`\times`$ |  $`\times`$ |  ✓ |  ✓ |  ✓ |  $`\times`$ |
| CodePlan \[[105](https://arxiv.org/html/2510.04905v1#bib.bib105)\] |  ✓ |  ✓ |  ✓ |  ✓ |  $`\times`$ |  $`\times`$ |  $`\times`$ |  ✓ |  ✓ |  ✓ |  $`\times`$ |
| CodeRAG \[[92](https://arxiv.org/html/2510.04905v1#bib.bib92)\] |  ✓ |  ✓ |  ✓ |  ✓ |  $`\times`$ |  $`\times`$ |  $`\times`$ |  ✓ |  ✓ |  ✓ |  $`\times`$ |
| ContextModule \[[81](https://arxiv.org/html/2510.04905v1#bib.bib81)\] |  ✓ |  $`\times`$ |  $`\times`$ |  ✓ |  $`\times`$ |  $`\times`$ |  $`\times`$ |  ✓ |  ✓ |  ✓ |  $`\times`$ |
| CGM \[[93](https://arxiv.org/html/2510.04905v1#bib.bib93)\] |  ✓ |  ✓ |  ✓ |  ✓ |  $`\times`$ |  $`\times`$ |  ✓ |  ✓ |  ✓ |  ✓ |  $`\times`$ |
| OrcaLoca \[[30](https://arxiv.org/html/2510.04905v1#bib.bib30)\] |  ✓ |  $`\times`$ |  $`\times`$ |  ✓ |  $`\times`$ |  $`\times`$ |  ✓ |  ✓ |  ✓ |  ✓ |  $`\times`$ |
| LocAgent \[[94](https://arxiv.org/html/2510.04905v1#bib.bib94)\] |  ✓ |  ✓ |  ✓ |  ✓ |  $`\times`$ |  $`\times`$ |  ✓ |  ✓ |  ✓ |  ✓ |  $`\times`$ |
| CoSIL \[[95](https://arxiv.org/html/2510.04905v1#bib.bib95)\] |  ✓ |  ✓ |  ✓ |  ✓ |  $`\times`$ |  $`\times`$ |  ✓ |  ✓ |  ✓ |  ✓ |  $`\times`$ |
| KGCompass \[[82](https://arxiv.org/html/2510.04905v1#bib.bib82)\] |  ✓ |  $`\times`$ |  $`\times`$ |  ✓ |  $`\times`$ |  $`\times`$ |  $`\times`$ |  ✓ |  ✓ |  ✓ |  $`\times`$ |
| AutoCodeRover \[[86](https://arxiv.org/html/2510.04905v1#bib.bib86)\] |  ✓ |  $`\times`$ |  $`\times`$ |  $`\times`$ |  $`\times`$ |  $`\times`$ |  $`\times`$ |  ✓ |  ✓ |  ✓ |  $`\times`$ |
| Mihir et al. \[[106](https://arxiv.org/html/2510.04905v1#bib.bib106)\] |  ✓ |  $`\times`$ |  $`\times`$ |  $`\times`$ |  $`\times`$ |  $`\times`$ |  $`\times`$ |  ✓ |  ✓ |  ✓ |  $`\times`$ |
| SWE-Debate \[[107](https://arxiv.org/html/2510.04905v1#bib.bib107)\] |  ✓ |  ✓ |  ✓ |  ✓ |  $`\times`$ |  $`\times`$ |  $`\times`$ |  $`\times`$ |  ✓ |  ✓ |  $`\times`$ |
| HCGS \[[96](https://arxiv.org/html/2510.04905v1#bib.bib96)\] |  ✓ |  ✓ |  ✓ |  ✓ |  $`\times`$ |  $`\times`$ |  $`\times`$ |  ✓ |  ✓ |  ✓ |  $`\times`$ |
| Prometheus \[[84](https://arxiv.org/html/2510.04905v1#bib.bib84)\] |  ✓ |  $`\times`$ |  $`\times`$ |  $`\times`$ |  $`\times`$ |  $`\times`$ |  ✓ |  ✓ |  ✓ |  ✓ |  $`\times`$ |
| RepoScope \[[90](https://arxiv.org/html/2510.04905v1#bib.bib90)\] |  ✓ |  ✓ |  ✓ |  ✓ |  $`\times`$ |  $`\times`$ |  $`\times`$ |  $`\times`$ |  ✓ |  ✓ |  $`\times`$ |
| SynFix \[[98](https://arxiv.org/html/2510.04905v1#bib.bib98)\] |  ✓ |  ✓ |  $`\times`$ |  ✓ |  $`\times`$ |  $`\times`$ |  ✓ |  ✓ |  ✓ |  ✓ |  $`\times`$ |
| SaraCoder \[[79](https://arxiv.org/html/2510.04905v1#bib.bib79)\] |  ✓ |  ✓ |  $`\times`$ |  $`\times`$ |  ✓ |  ✓ |  $`\times`$ |  ✓ |  ✓ |  ✓ |  $`\times`$ |

## Table 4: Comparison of Graph-Based RAG Methods

##### Edge Types.

Edges represent relationships or dependencies between code entities. We consider six common types:

- •
  Contain: Captures structural inclusion, most commonly representing classes containing functions. Methods that model inclusion relationships across multiple code blocks are also categorized under this type.
- •
  Import: Encodes static dependencies via language-level import/include statements across modules or packages.
- •
  Inherit: Represents class-level inheritance relationships.
- •
  Invoke: Captures runtime call relations between functions or methods, crucial for modeling execution semantics.
- •
  Data Flow (Data F.): Tracks how data flows between variables, parameters, or return values.
- •
  Control Flow (Ctrl F.): Reflects control dependencies induced by conditionals, loops, or branching.

##### Node Types.

## Nodes are the fundamental units representing code entities at different granularity levels:

- •
  Directory: The top-level physical organization of a repository.
- •
  Module: Corresponds to a single source file (e.g., .py, .java, .cpp); though often called File in prior work, we distinguish Module here as the logical layer between Directory and Class.
- •
  Class / Function: Core units in most programming languages and frequent retrieval targets in downstream tasks.
- •
  Line: The smallest addressable unit in code. Its use indicates support for fine-grained retrieval, highlighting line-level indexing and alignment.

##### Observed Design Patterns.

## From the table, several trends and insights emerge:

- •
  Contain and Invoke as Foundational Edges. Most methods include Contain and Invoke edges, indicating their foundational role in representing code structure. Even methods that do not explicitly model invocation likely assume it implicitly or extract it externally.
- •
  Three-Level Node Hierarchy Dominance. Module–Class–Function nodes often co-occur, forming a de facto standard three-tier abstraction. Models that include Line-level nodes (e.g., PKG \[[80](https://arxiv.org/html/2510.04905v1#bib.bib80)\], GraphCoder \[[78](https://arxiv.org/html/2510.04905v1#bib.bib78)\]) usually lack higher-level context like Module or Class, favoring fine-grained reasoning at the cost of global awareness.
- •
  DataFlow as a Semantic Enhancer. Only a few methods (DraCo \[[76](https://arxiv.org/html/2510.04905v1#bib.bib76)\], CodeGRAG \[[77](https://arxiv.org/html/2510.04905v1#bib.bib77)\], GraphCoder \[[78](https://arxiv.org/html/2510.04905v1#bib.bib78)\], and SaraCoder \[[79](https://arxiv.org/html/2510.04905v1#bib.bib79)\]) explicitly model DataFlow, capturing variable-level semantics for tasks like code completion or bug detection. Incorporating data flow in RAG systems is challenging, as models must rely on static analysis rather than executing code, often requiring language-specific parsing and limiting scalability. Despite this, it remains a promising direction for improving semantic precision in RACG.
- •
  Limited Use of ControlFlow Edges. While most methods do not incorporate ControlFlow edges, some—such as CodeGRAG \[[77](https://arxiv.org/html/2510.04905v1#bib.bib77)\], SaraCoder \[[79](https://arxiv.org/html/2510.04905v1#bib.bib79)\] and GraphCoder \[[78](https://arxiv.org/html/2510.04905v1#bib.bib78)\] have explored their use. However, widespread adoption remains limited due to the complexity of extracting control-flow graphs (CFGs), ambiguity in cross-function control flows, and the observation that many downstream tasks rely more heavily on structural and semantic cues than on precise execution traces.
- •
  Multi-Level Graph Integration as a Future Trend. Recent models like LocAgent \[[94](https://arxiv.org/html/2510.04905v1#bib.bib94)\] and CoSIL \[[95](https://arxiv.org/html/2510.04905v1#bib.bib95)\] construct graphs that span from directories to functions, enabling holistic repository modeling. Others like DraCo \[[76](https://arxiv.org/html/2510.04905v1#bib.bib76)\] and CodeGRAG \[[77](https://arxiv.org/html/2510.04905v1#bib.bib77)\] emphasize integrating both structure and semantics, suggesting that future work may focus on multi-perspective graphs combining hierarchical structure with data and control flows.

##### Graph-specific Innovations and Limitations.

Beyond standard graph construction strategies, several studies introduce distinctive innovations in graph-based code retrieval. As mentioned earlier, data flow and control flow remain relatively underexplored, yet works such as DraCo \[[76](https://arxiv.org/html/2510.04905v1#bib.bib76)\], CodeGRAG \[[77](https://arxiv.org/html/2510.04905v1#bib.bib77)\], and GraphCoder \[[78](https://arxiv.org/html/2510.04905v1#bib.bib78)\] have actively investigated these areas. CoCoMIC \[[91](https://arxiv.org/html/2510.04905v1#bib.bib91)\] adopts a causal attention mechanism, encoding each code node into a single token to enable fine-grained dependency modeling. CodeRAG \[[92](https://arxiv.org/html/2510.04905v1#bib.bib92)\] proposes a dual-graph architecture capturing deep correlations between requirements and code, further enhanced with dynamic reasoning tools. CGM \[[93](https://arxiv.org/html/2510.04905v1#bib.bib93)\] integrates semantic and structural information by mapping code graph nodes into the LLM input space while introducing graph structures through attention masks. LocAgent \[[94](https://arxiv.org/html/2510.04905v1#bib.bib94)\] presents a graph-guided LLM agent framework, exposing the graph to the LLM as a tool to support multi-hop reasoning. CoSIL \[[95](https://arxiv.org/html/2510.04905v1#bib.bib95)\] leverages a module call graph to precisely identify suspicious files and iteratively explores context via the function call graph. HCGS \[[96](https://arxiv.org/html/2510.04905v1#bib.bib96)\] performs bottom-up traversal of the code graph, aggregating low-level function context into higher-level summaries to generate code representations rich in dependency information. CodeRCSG \[[97](https://arxiv.org/html/2510.04905v1#bib.bib97)\] encodes semantic graphs using a GNN and maps the graph embeddings to the same feature space as language model embeddings. SynFix \[[98](https://arxiv.org/html/2510.04905v1#bib.bib98)\] constructs a RelationGraph to ensure that all dependencies are updated when fixing issues. Finally, External identifier disambiguation enhancement in SaraCoder \[[79](https://arxiv.org/html/2510.04905v1#bib.bib79)\] constructs a cross-file symbolic association graph via a structured symbol table and import statement parsing, accurately mapping symbol references in the current file to entity definitions in external files.

Some approaches further adopt knowledge graph (KG)-based designs, incorporating external or contextual information beyond code-only structures. ContextModule \[[81](https://arxiv.org/html/2510.04905v1#bib.bib81)\] logs user behavior and aggregates multiple information sources for retrieval. KGCompass \[[82](https://arxiv.org/html/2510.04905v1#bib.bib82)\] integrates code entities (files, classes, functions) with repository artifacts (issues, pull requests) into a comprehensive KG, retrieving relevant nodes based on function-level similarity. PKG \[[80](https://arxiv.org/html/2510.04905v1#bib.bib80)\] represents both code and text as a directed acyclic graph (DAG) and employs tree-pruning techniques to enhance semantic search precision. Abedu \[[83](https://arxiv.org/html/2510.04905v1#bib.bib83)\] collects software repository data—including commits, issues, files, and users—to construct a knowledge graph, while Prometheus \[[84](https://arxiv.org/html/2510.04905v1#bib.bib84)\] converts the entire codebase into a unified knowledge graph using multi-agent mechanisms, supporting multiple programming languages and equipped with Docker-based execution tools.

Although many works emphasize graph construction, the retrieval algorithms over these graphs are often underexplored. Typically, initial code snippets are located via matching and then expanded using kNN, $`n`$-hop subgraphs, BFS, or DFS. Some methods enhance this with hybrid similarity metrics. RepoHYPER \[[85](https://arxiv.org/html/2510.04905v1#bib.bib85)\] combines search-extension strategies with link prediction to refine the retrieved context. AutoCodeRover \[[86](https://arxiv.org/html/2510.04905v1#bib.bib86)\] integrates hierarchical code search with Spectrum-Based Fault Localization to guide the search. LingmaAgent \[[87](https://arxiv.org/html/2510.04905v1#bib.bib87)\] employs Monte Carlo Tree Search (MCTS) to navigate large-scale code graphs and accurately localize target code. CocoGen \[[88](https://arxiv.org/html/2510.04905v1#bib.bib88)\] stores the graph in a database and translates compiler errors into SQL queries for code location, whereas OrcaLoca \[[30](https://arxiv.org/html/2510.04905v1#bib.bib30)\] uses an action scheduler queue to dynamically guide LLM-based graph traversal. DSrepair \[[89](https://arxiv.org/html/2510.04905v1#bib.bib89)\] stores graphs as RDF triples and queries them via SPARQL. RepoScope \[[90](https://arxiv.org/html/2510.04905v1#bib.bib90)\] starts from import entities to perform depth-first search, scoring entities based on similarity and intra-repository call patterns to predict potential call chains. SaraCoder \[[79](https://arxiv.org/html/2510.04905v1#bib.bib79)\] proposes Decaying Subgraph Edit Distance (D-SED) to make graph similarity calculation more aligned with code "logical importance", thereby improving the semantic accuracy of retrieval.

Despite their strengths, graph-based methods often require substantial manual effort for detail handling and construction. Since syntax structures vary significantly across programming languages, such approaches suffer from reduced portability compared to non-graph-based methods.

#### 4.1.3 Data Source for RAG

In typical RACG tasks, the input is the current repository, and retrieval is restricted to the files within it \[[19](https://arxiv.org/html/2510.04905v1#bib.bib19)\]\[[76](https://arxiv.org/html/2510.04905v1#bib.bib76)\]. Another common practice is to combine API documentation, which reflects function-level usage from a complementary perspective \[[69](https://arxiv.org/html/2510.04905v1#bib.bib69)\]\[[70](https://arxiv.org/html/2510.04905v1#bib.bib70)\].

## However, several works have proposed alternative data sources to enrich retrieval and enhance model performance:

- •
  PKG \[[80](https://arxiv.org/html/2510.04905v1#bib.bib80)\] adopts the PythonAlpaca dataset (containing Python programming Q&A pairs) and the Tutorials dataset (containing programming tutorial texts) as knowledge sources.
- •
  EvoR \[[68](https://arxiv.org/html/2510.04905v1#bib.bib68)\] integrates heterogeneous data, including web search results (blogs, tutorials, community discussions), official documentation, execution feedback, and code snippets.
- •
  ContextModule \[[81](https://arxiv.org/html/2510.04905v1#bib.bib81)\] leverages user behavioral code datasets collected from real editing actions within a company environment. It records the final completed code (either generated by a model or manually written) and applies rule-based filtering plus manual annotation to curate high-quality samples.
- •
  A³-CodGen \[[64](https://arxiv.org/html/2510.04905v1#bib.bib64)\] constructs a knowledge base of function libraries and third-party libraries, showing stronger capabilities in library reuse compared to existing tools such as GitHub Copilot.
- •
  SWE-Exp \[[108](https://arxiv.org/html/2510.04905v1#bib.bib108)\] retrieves high-quality repair trajectory experiences to guide code modification.
- •
  CodeGuarder \[[109](https://arxiv.org/html/2510.04905v1#bib.bib109)\] extracts data from real-world vulnerability databases to inform secure code generation.
- •
  Abedu et al. \[[83](https://arxiv.org/html/2510.04905v1#bib.bib83)\] exploit software repository data, including commits, issues, files, users, and their relationships, as a structured knowledge graph.
- •
  Tony et al. \[[110](https://arxiv.org/html/2510.04905v1#bib.bib110)\] retrieve the top-10 related items from SecGuide, investigating the effect of integrating task-specific secure coding guidelines into LLM prompts for safer code generation.
- •
  RTLFixer \[[111](https://arxiv.org/html/2510.04905v1#bib.bib111)\] leverages compiler error logs by categorizing syntax errors and augmenting them with detailed human expert explanations. These logs, erroneous code snippets, and expert annotations are stored in a retrieval database to guide error correction.
- •
  Kranti et al. \[[112](https://arxiv.org/html/2510.04905v1#bib.bib112)\] focus on a Minecraft collaborative building task, where LLMs are trained to predict builders’ action sequences by framing action prediction as code generation—mapping in-game operations (e.g., placing or picking up blocks) to function calls such as place() or pick(). The retrieval dataset is derived from Minecraft collaborative dialogue interactions.

#### 4.1.4 Effectiveness of RAG Approaches

The effectiveness of RAG is not a settled issue, and the presence of a retrieval component does not necessarily guarantee superior performance. Peng et al. \[[113](https://arxiv.org/html/2510.04905v1#bib.bib113)\] conduct a systematic comparison between long-context language models (LC) and RAG-based methods in RLCG tasks. Their findings reveal that when repositories are relatively small and well-structured, LC models can match or even outperform RAG. However, as repository size grows or structural complexity increases, RAG demonstrates clear advantages.

Several studies have provided strong evidence for the effectiveness of RAG. For instance, CodeGen4Libs \[[114](https://arxiv.org/html/2510.04905v1#bib.bib114)\] confirm through a user study involving 66 developers the practical necessity of library-oriented code generation and retrieval-enhanced automation. Chen et al. \[[115](https://arxiv.org/html/2510.04905v1#bib.bib115)\] investigate the role of RAG when working with uncommon API libraries, demonstrating that retrieval substantially improves code generation accuracy. Interestingly, their work also finds that LLMs are tolerant to mild noise in documentation, and that BM25 retrieval achieves the best performance for code matching. Similarly, Yang et al. \[[116](https://arxiv.org/html/2510.04905v1#bib.bib116)\] show that RACG significantly improves model performance, where BM25 retrieval and Sequential Integration Fusion strike an appealing balance of simplicity and effectiveness, while Sketch Filling Fusion—though more computationally expensive—yields further gains. Marko et al. \[[117](https://arxiv.org/html/2510.04905v1#bib.bib117)\] also highlight that RAG-based models surpass small fine-tuned models for code retrieval tasks.

On the other hand, some works investigate the possibility of forgoing RAG entirely by strengthening the intrinsic capabilities of LLMs through long-context modeling. For example, SelectSolve \[[118](https://arxiv.org/html/2510.04905v1#bib.bib118)\] demonstrates that in fully observable environments such as SWE-bench, simply providing the entire codebase to a long-context LLM with proper prompting can achieve, and sometimes surpass, the performance of carefully designed multi-tool agent systems. Oskooei et al. \[[119](https://arxiv.org/html/2510.04905v1#bib.bib119)\] employ hierarchical summarization to facilitate repository-level comprehension. SoRFT \[[120](https://arxiv.org/html/2510.04905v1#bib.bib120)\] trains models on multiple localization and editing tasks through a combination of rejection sampling, supervised fine-tuning, and reinforcement learning with PPO. CoLT \[[121](https://arxiv.org/html/2510.04905v1#bib.bib121)\] further reinforces the utilization of long-context information through explicit RL signals. ToolGen \[[21](https://arxiv.org/html/2510.04905v1#bib.bib21)\] fine-tunes models with augmented functions annotated by a \ token, enabling the model to learn trigger points for invoking external completion tools. Blinn et al. \[[122](https://arxiv.org/html/2510.04905v1#bib.bib122)\] integrate LLM-based generation into a real-time sketching environment, leveraging the language server to supply semantically relevant contextual cues.

Industrial practice has also provided empirical evidence. Tencent explores RAG in the large-scale, closed-source WeChat codebase for code completion, showing that similarity-based retrieval outperforms identifier-based retrieval \[[123](https://arxiv.org/html/2510.04905v1#bib.bib123)\]. Also, Wang et al. \[[124](https://arxiv.org/html/2510.04905v1#bib.bib124)\] report that with the right embedding models, RAG achieves higher accuracy than fine-tuning alone, with BM25 again striking an excellent balance between retrieval effectiveness and efficiency. They further show that combining RAG with fine-tuning yields additional improvements. Researchers at Jetbrain find that despite being trained on only 1B repository-level tokens, their approach achieves competitive performance on the Long Code Arena benchmark \[[125](https://arxiv.org/html/2510.04905v1#bib.bib125)\].

### 4.2 The Role of Training in Enhancing RACG Performance

Although RACG systems can be implemented in a lightweight, zero-shot manner—without additional training—early work such as DraCo \[[76](https://arxiv.org/html/2510.04905v1#bib.bib76)\] and RepoGraph \[[20](https://arxiv.org/html/2510.04905v1#bib.bib20)\] still demonstrated promising results. However, recent research in RACG increasingly treats training as a vital component for improving performance. This shift reflects the growing recognition that aligning retrieval modules with downstream generation tasks and adapting pre-trained language models to code-specific domains. Most training strategies are self-supervised or unsupervised in nature, owing to the scarcity of high-quality labeled data and the inherent structure of code that enables meaningful learning signals without annotation.

##### Retrieval module training.

ReACC \[[32](https://arxiv.org/html/2510.04905v1#bib.bib32)\] constructs a hybrid retriever combining BM25 with a dense retriever initialized by GraphCodeBERT and further pre-trained using contrastive learning and semantics-preserving augmentations such as identifier renaming and dead code insertion. kNN-TRANX\[[37](https://arxiv.org/html/2510.04905v1#bib.bib37)\], one of the early code search works relevant to RACG, is built upon the BertranX seq2tree model to learn mappings from natural language queries to abstract syntax trees (ASTs). It additionally introduces a meta-*k* network and a confidence network, which are jointly trained to enhance retrieval reliability and prediction confidence. CodeGenAPI \[[35](https://arxiv.org/html/2510.04905v1#bib.bib35)\] targets the retrieval of potentially useful APIs from private library documentation, employing dual-encoder dense retrieval techniques to balance inference with retrieval. CodeGRAG \[[77](https://arxiv.org/html/2510.04905v1#bib.bib77)\] jointly encodes code and textual views using CodeT5+ and UniXCoder, while a graph neural network captures the structural view; the model is optimized through structure-preserving contrastive alignment. Similarly, InferFix \[[126](https://arxiv.org/html/2510.04905v1#bib.bib126)\] trains a retriever using contrastive learning to identify semantically similar bugs and corresponding fixes from historical data. CONAN-R \[[127](https://arxiv.org/html/2510.04905v1#bib.bib127)\] enhances code and documentation representations by pretraining CodeT5 with code–document alignment (CDA) and masked entity prediction (MEP). RLPG \[[54](https://arxiv.org/html/2510.04905v1#bib.bib54)\] generates multiple candidate contexts via prompt templates and trains a Prompt Proposal Classifier to select the most relevant one. CoRet \[[45](https://arxiv.org/html/2510.04905v1#bib.bib45)\] introduces a novel log-likelihood-based loss function and incorporates call graph and file path information during training. It ties the weights of the query and code encoders, replacing the \ token with mean pooling to produce robust embeddings. CodeFilter \[[41](https://arxiv.org/html/2510.04905v1#bib.bib41)\] also uses likelihood-based scoring methods to label each cross-file code block, employing special tokens (\, \ for retrieval control; \, \, \ for marking retrieval result polarity). SWE-Fixer \[[42](https://arxiv.org/html/2510.04905v1#bib.bib42)\] employs a coarse-to-fine retriever that combines BM25 with a fine-tuned 7B model to enhance retrieval precision. SweRank \[[128](https://arxiv.org/html/2510.04905v1#bib.bib128)\] utilizes dual-encoder embedding models as code retrievers and instruction-tuned LLMs as code re-rankers. CodeXEmbed \[[129](https://arxiv.org/html/2510.04905v1#bib.bib129)\] unifies various code-related tasks across multiple programming languages into a cohesive contrastive training framework. SelfRACG \[[51](https://arxiv.org/html/2510.04905v1#bib.bib51)\] enables LLMs to self-express information needs by performing inner product retrieval from hidden states of the next token, incorporating retrieval learning and preference alignment training.

##### Generation module training.

ReACC \[[32](https://arxiv.org/html/2510.04905v1#bib.bib32)\] fine-tunes a CodeGPT-adapted model by concatenating retrieved candidates with incomplete code to guide generation. RepoFormer \[[130](https://arxiv.org/html/2510.04905v1#bib.bib130)\] employs a multi-task self-supervised learning objective that jointly optimizes retrieval decision-making and code generation, thereby teaching the model when and how to leverage cross-file information. CoCoMic \[[88](https://arxiv.org/html/2510.04905v1#bib.bib88)\] introduces a special \ token and locale embeddings to cross-file nodes, which are encoded and integrated with in-file context via layer-wise joint attention. CONAN-G \[[127](https://arxiv.org/html/2510.04905v1#bib.bib127)\] employs dual-view code representations and a Fusion-in-Decoder (FiD) architecture, using documentation as prompts to improve semantic understanding. R²C²-Coder \[[63](https://arxiv.org/html/2510.04905v1#bib.bib63)\] builds a candidate training set incorporating both abstract structural and snippet-level contexts to fine-tune LLMs. InferFix \[[126](https://arxiv.org/html/2510.04905v1#bib.bib126)\] applies supervised fine-tuning on bug-labeled prompts augmented with retrieved fix examples. RepoFusion \[[131](https://arxiv.org/html/2510.04905v1#bib.bib131)\], based on RLPG \[[54](https://arxiv.org/html/2510.04905v1#bib.bib54)\], further aligns large language models with task objectives and retrieved contexts. CMFT \[[132](https://arxiv.org/html/2510.04905v1#bib.bib132)\] implements curriculum learning to gradually tackle increasingly challenging completions. CGM \[[93](https://arxiv.org/html/2510.04905v1#bib.bib93)\] uses a two-stage approach, beginning with subgraph reconstruction pre-training followed by noisy fine-tuning to align LLMs with downstream tasks. LocAgent \[[94](https://arxiv.org/html/2510.04905v1#bib.bib94)\] performs supervised fine-tuning and knowledge distillation on a 7B model after bootstrapping a larger Qwen2.5-32B model with successful planning trajectories. Meanwhile, SWE-Fixer \[[42](https://arxiv.org/html/2510.04905v1#bib.bib42)\]’s edit model generates patch completions using chain-of-thought (CoT) training data. Fedrushkov et al. \[[49](https://arxiv.org/html/2510.04905v1#bib.bib49)\] implement bidirectional training through bidirectional attention for masked next-token prediction and employ the top-k outputs (excluding ground truth) as hard negatives for contrastive learning. CodeRCSG \[[97](https://arxiv.org/html/2510.04905v1#bib.bib97)\] integrates queries, retrieved text, and graph representations, jointly fine-tuning the code language model, graph neural network, and projection mechanism.

Domain-specific tuning has also emerged as a key trend: DroidCoder \[[133](https://arxiv.org/html/2510.04905v1#bib.bib133)\] targets Android-specific code completion, while RTLRepoCoder \[[134](https://arxiv.org/html/2510.04905v1#bib.bib134)\] adapts models to Verilog.

##### Reinforcement learning has also been adopted to refine both retrievers and generators.

RLCoder \[[135](https://arxiv.org/html/2510.04905v1#bib.bib135)\] trains its retriever (RLRetriever) using a reward function based on weighted perplexity improvement, introducing a stop signal mechanism to identify useful candidates. RRR \[[55](https://arxiv.org/html/2510.04905v1#bib.bib55)\] adopts a two-stage training strategy: initially, a code refactorer is trained via supervised fine-tuning to generate concise, target-aligned code variants. Although SoRFT \[[120](https://arxiv.org/html/2510.04905v1#bib.bib120)\] and CoLT \[[121](https://arxiv.org/html/2510.04905v1#bib.bib121)\] do not explicitly employ RAG, they nonetheless demonstrate the potential of reinforcement learning (RL) in enhancing code generation tasks. These explorations illustrate how RL can serve as a bridge between retrieval quality and generation fidelity, enabling models to adapt their behavior rather than static supervision.

### 4.3 The Application of Agent Architectures in RACG Tasks

Agent-based systems have seen increasing adoption across diverse domains such as web search, robotics, scientific discovery, and software engineering \[[136](https://arxiv.org/html/2510.04905v1#bib.bib136), [137](https://arxiv.org/html/2510.04905v1#bib.bib137), [138](https://arxiv.org/html/2510.04905v1#bib.bib138), [139](https://arxiv.org/html/2510.04905v1#bib.bib139)\]. Their appeal lies in the ability to decompose complex tasks, iteratively refine outputs, and dynamically adapt based on feedback from the environment or user interactions.

Despite their growing presence, the definition of what constitutes an “agent” remains inconsistent across the literature. In this work, we define an agent as a system capable of perceiving its environment, making decisions via planning or learned policies, and executing actions iteratively to achieve a goal—with minimal reliance on hardcoded logic. The key objective is to transition from static, deterministic inference pipelines to dynamic, feedback-driven workflows that can reason, adapt, and recover from errors or uncertainty.

To assess the agent-based architectures in RACG, we introduce a three-tier classification framework, as illustrated in Figure [7](https://arxiv.org/html/2510.04905v1#S4.F7 "Figure 7 ‣ 4.3 The Application of Agent Architectures in RACG Tasks ‣ 4 Literature Review ‣ Retrieval-Augmented Code Generation: A Survey with Focus on Repository-Level Approaches"). This framework distinguishes systems by their architectural complexity and degree of autonomy:

Figure 7: Three-tier classification of agent-based architectures in RACG (left), ranging from non-agent systems (Level 0) to partial agent systems (Level 1) and fully autonomous agents (Level 2). The distribution of systems across levels is illustrated in the pie chart (right).

- •
  Level 0: Non-agent systems—Static, hardcoded workflows with no iteration or decision-making.
- •
  Level 1: Partial agent systems—Systems with partial agent-like properties such as self-checking or iterative refinement, or demonstrated compatibility with existing agent workflows.
- •
  Level 2: Fully autonomous agents—Architectures that autonomously plan, adapt, and interact with external tools or knowledge sources.

This three-tier categorization, visualized in Figure [7](https://arxiv.org/html/2510.04905v1#S4.F7 "Figure 7 ‣ 4.3 The Application of Agent Architectures in RACG Tasks ‣ 4 Literature Review ‣ Retrieval-Augmented Code Generation: A Survey with Focus on Repository-Level Approaches"), provides a structured basis for analyzing RACG systems.

\pgfqpointtransformed\pgfqpointtransformed\pgfqpointtransformed\pgfqpointtransformed\pgfqpointtransformed\pgfqpointtransformed\pgfqpointtransformed\pgfqpointtransformed\pgfqpointtransformed\pgfqpointtransformed\pgfqpointtransformed\pgfqpointtransformed\pgfqpointtransformed\pgfqpointtransformed\pgfqpointtransformed\pgfqpointtransformed\pgfqpointtransformed\pgfqpointtransformed\pgfqpointtransformed\pgfqpointtransformed\pgfqpointtransformed\pgfqpointtransformed\pgfqpointtransformed\pgfqpointtransformed\pgfqpointtransformed\pgfqpointtransformed

Figure 8: Taxonomy of Agent Architectures.

#### 4.3.1 Level 0: Non-agent Systems

Our survey reveals that the vast majority of RACG approaches to date fall under Level 0. These systems typically follow fixed pipelines without dynamic decision-making or environment interaction. On one hand, this reflects the highly goal-driven nature of many RACG tasks, where deterministic workflows can suffice. On the other hand, it highlights a largely untapped opportunity for agent-based exploration in this domain.

A particularly noteworthy Level 0 system is Agentless \[[142](https://arxiv.org/html/2510.04905v1#bib.bib142)\], which embraces simplicity through a “locate–repair–verify” workflow. By deliberately avoiding agent-like complexity, it offers two main advantages: (i) it removes the need for autonomous decision-making or tool usage by LLMs, making system behavior easier to interpret and debug; and (ii) it reduces computational and engineering overhead, making it more practical for real-world deployment. While lacking adaptivity, such systems demonstrate that well-crafted pipelines can still deliver strong performance in targeted usages.

The majority of training-intensive RACG systems remain at Level 0, indicating that current training efforts have predominantly concentrated on optimizing static components (e.g., retrievers or generators), with comparatively limited progress toward end-to-end autonomy or interactive reasoning.

#### 4.3.2 Level 1: Partial Agent Systems

Level 1 systems exhibit partial agent properties—such as iteration, refinement, or self-feedback—without being fully autonomous. Alternatively, some methods are designed for seamless integration with agent-based pipelines in a modular or “plug-and-play” fashion.

Two main categories can be observed. The first includes systems not explicitly structured as agents but highly interoperable with existing frameworks; for instance, RepoGraph \[[20](https://arxiv.org/html/2510.04905v1#bib.bib20)\] can be readily incorporated into pipelines such as SWE-Agent \[[22](https://arxiv.org/html/2510.04905v1#bib.bib22)\], demonstrating architectural flexibility and effectiveness. The second category performs explicit iterative refinement: RepoCoder \[[19](https://arxiv.org/html/2510.04905v1#bib.bib19)\] updates retrieval queries based on prior completions, EvoR \[[68](https://arxiv.org/html/2510.04905v1#bib.bib68)\] co-evolves queries and knowledge with runtime feedback, while CocoGen \[[88](https://arxiv.org/html/2510.04905v1#bib.bib88)\] and CoSIL \[[95](https://arxiv.org/html/2510.04905v1#bib.bib95)\] incorporate compiler signals or iterative graph search for repair. Tom et al. \[[110](https://arxiv.org/html/2510.04905v1#bib.bib110)\] propose a Recursive Criticism and Improvement paradigm combined with RAG. APT \[[140](https://arxiv.org/html/2510.04905v1#bib.bib140)\] leverages newly generated test cases to guide subsequent test generation. FT2Ra \[[39](https://arxiv.org/html/2510.04905v1#bib.bib39)\] simulates multi-round updates akin to model fine-tuning, but performs the updates using retrieved information rather than parameter modification. Finally, De-Hallucinator \[[48](https://arxiv.org/html/2510.04905v1#bib.bib48)\] iteratively retrieves suitable APIs based on initial predictions.

A key challenge for Level 1 systems is stability: iterative feedback may cause semantic drift or compounding errors if model preferences are misaligned. Addressing this requires more robust control and human-in-the-loop strategies.

#### 4.3.3 Level 2: Fully Autonomous Agent Frameworks

A small but growing number of RACG systems fall under Level 2, introducing fully agentic architectures with autonomous scanning, planning, tool usage, and reasoning capabilities.

SWE-agent \[[22](https://arxiv.org/html/2510.04905v1#bib.bib22)\] is a representative example that enhances LLM execution for software engineering tasks through a custom Agent–Computer Interface (ACI), enabling structured interaction with external tools. CodexGraph \[[104](https://arxiv.org/html/2510.04905v1#bib.bib104)\] coordinates two agents: a primary LLM agent that analyzes the task and produces natural language queries, and a translation agent that converts these into graph queries for iterative reasoning and retrieval. SWE-Exp \[[108](https://arxiv.org/html/2510.04905v1#bib.bib108)\] leverages trajectory experience for experience-driven software issue resolution. ARCS \[[40](https://arxiv.org/html/2510.04905v1#bib.bib40)\] introduces difficulty-aware retrieval, decomposing harder queries into sub-queries for more effective resolution.

Multi-agent systems also represent a promising direction. SWE-Debate \[[107](https://arxiv.org/html/2510.04905v1#bib.bib107)\] adopts a competitive multi-agent debate framework that generates fault-propagation chains guided by graphs and conducts three rounds of structured debate, effectively addressing the limited observation problem in software bug localization. Prometheus \[[84](https://arxiv.org/html/2510.04905v1#bib.bib84)\] is another multi-agent system that constructs a unified knowledge graph of code repositories and collaboratively resolves GitHub issues across multiple programming languages.

An emerging line of work emphasizes the integration of external tools into LLM-driven retrieval and reasoning. Retrieve-Repotools-Reflect (RRR) \[[75](https://arxiv.org/html/2510.04905v1#bib.bib75)\] empowers LLMs to iteratively explore and reason over repository-level contexts using static analysis tools within an agent loop. Similarly, CodeRAG \[[92](https://arxiv.org/html/2510.04905v1#bib.bib92)\] dynamically interleaves reasoning steps with tool calls—web search, graph reasoning, code testing—to acquire necessary knowledge throughout the generation process.

More sophisticated strategies are seen in systems like LingmaAgent \[[87](https://arxiv.org/html/2510.04905v1#bib.bib87)\], which uses Monte Carlo Tree Search (MCTS) to enhance repository exploration and patch generation, addressing the limited context scope of prior LLM agents. OrcaLoca \[[30](https://arxiv.org/html/2510.04905v1#bib.bib30)\] combines relevance-based action scheduling, action decomposition with correlation scoring, and context pruning to navigate large repositories efficiently. LocAgent \[[94](https://arxiv.org/html/2510.04905v1#bib.bib94)\] performs multi-hop reasoning over code graphs to identify relevant entities.

Some Level 2 systems extend beyond bug localization or patching. For instance, CodePlan \[[105](https://arxiv.org/html/2510.04905v1#bib.bib105)\] monitors AST changes to support synchronized, repository-wide updates rather than isolated repairs. AutoCodeRover \[[86](https://arxiv.org/html/2510.04905v1#bib.bib86)\] integrates AST traversal, iterative retrieval, and spectrum-based fault localization (SBFL) for enhanced contextual understanding and patch synthesis.

Lastly, OpenHands \[[141](https://arxiv.org/html/2510.04905v1#bib.bib141)\] proposes a human-like general-purpose agent that interacts with its environment via an AgentDelegateAction protocol. One of its domain-specific agents, CodeActAgent, has demonstrated strong performance across multiple code-generation tasks, suggesting promising directions for scalable, collaborative agent systems in future RACG pipelines.

### 4.4 Downstream Tasks and Benchmarks for RLCG

Since RACG is a broad topic, our survey reveals that the landscape of benchmarks is highly fragmented, with a large number of heterogeneous and sometimes loosely defined tasks. To ensure both clarity and reliability, we restrict our focus to benchmarks that are formally defined and directly relevant to RLCG. Narrowing the scope to benchmarks that are intrinsically linked to RLCG allows us to concentrate on the central problem of RAG for code generation, rather than being distracted by loosely related or underspecified tasks.

#### 4.4.1 Downstream Tasks

RLCG systems have been applied to a variety of downstream tasks, depending on the specific retrieval strategy and model design. Among these, three tasks have received the most attention: cross-file code completion, GitHub issue resolution, and coding ability evaluation. The first two have already been discussed in Section [2.1](https://arxiv.org/html/2510.04905v1#S2.SS1 "2.1 Repository-Level Code Generation (RLCG) ‣ 2 Preliminaries ‣ Retrieval-Augmented Code Generation: A Survey with Focus on Repository-Level Approaches"), as they address practical software engineering scenarios that require reasoning beyond a single file or function. Cross-file completion focuses on predicting missing or future code snippets using information from other files in the repository, while issue resolution attempts to automate the repair or implementation of functionalities linked to GitHub issues.

Coding ability evaluation tasks, represented by benchmarks such as HumanEval \[[143](https://arxiv.org/html/2510.04905v1#bib.bib143)\] and MBPP \[[144](https://arxiv.org/html/2510.04905v1#bib.bib144)\], aim to measure a model’s capacity to understand problem descriptions and generate correct, executable solutions. Although these benchmarks are less grounded in real-world development workflows, they provide a standardized environment to test whether RACG methods can enhance model reasoning and synthesis under external knowledge augmentation. This setting also facilitates systematic comparisons with other improvement strategies such as instruction tuning, data augmentation, or chain-of-thought prompting.

Beyond these, several additional downstream tasks have been explored. Code search (e.g., CoNaLa \[[145](https://arxiv.org/html/2510.04905v1#bib.bib145)\]) evaluates a model’s ability to retrieve or synthesize code snippets from natural language queries. Program repair (e.g., TFix \[[146](https://arxiv.org/html/2510.04905v1#bib.bib146)\]) focuses on generating patches for buggy code, while Test Generation investigates the synthesis of unit tests or assertions to verify program correctness. Together, these tasks illustrate the growing versatility of RACG systems across different dimensions of software intelligence.

#### 4.4.2 Benchmarks

We now turn to the benchmarks commonly used for evaluating RLCG systems. In our survey of existing literature, we observe that many works rely on self-constructed benchmarks. This trend can be attributed to two main factors: first, custom-designed benchmarks enable authors to emphasize the unique strengths of their proposed models; second, the creation of new benchmarks is relatively feasible, often involving data collection, static analysis, and unit test integration. However, the proliferation of such benchmarks introduces challenges for fair and consistent evaluation across systems.

It is worth noting that there exists a vast number of RACG/RLCG-related benchmark efforts, reflecting both the diversity and complexity of the field. While some of these benchmarks have even undergone peer review, in this survey we only include those that have been utilized in at least one other published work, ensuring rigor and validity. Based on their primary proposed tasks, we further categorize and introduce several representative benchmarks that have been widely adopted across multiple studies.

| Category | Benchmark | Size | Programming Language | Date | Link |
|----|----|----|----|----|----|
| Line Completion | RepoEval \[[19](https://arxiv.org/html/2510.04905v1#bib.bib19)\] | 3573 | Python | 2023-03 | [link](https://github.com/microsoft/CodeT/tree/main/RepoCoder) |
|  | RepoBench \[[147](https://arxiv.org/html/2510.04905v1#bib.bib147)\] | 49684³³3Calculated based on data from [RepoBench-Python](https://huggingface.co/datasets/tianyang/repobench_python_v1.1) and [RepoBench-Java](https://huggingface.co/datasets/tianyang/repobench_java_v1.1) on Hugging Face. | Python, Java | 2024-01 | [link](https://github.com/Leolty/repobench) |
|  | CrossCodeEval \[[148](https://arxiv.org/html/2510.04905v1#bib.bib148)\] | 9928 | Python, Java, TypeScript, and C# | 2023-11 | [link](https://github.com/amazon-science/cceval) |
| Function Generation | CoderEval \[[149](https://arxiv.org/html/2510.04905v1#bib.bib149)\] | 460 | Python, Java | 2024-02 | [link](https://github.com/CoderEval/CoderEval) |
|  | DevEval \[[150](https://arxiv.org/html/2510.04905v1#bib.bib150)\] | 1874 | Python | 2024-05 | [link](https://github.com/seketeam/DevEval) |
|  | EvoCodeBench \[[151](https://arxiv.org/html/2510.04905v1#bib.bib151)\] | 275 | Python | 2024-03 | [link](https://github.com/seketeam/EvoCodeBench) |
| Real-World Resolution | SWE-bench \[[4](https://arxiv.org/html/2510.04905v1#bib.bib4)\] | 2294 | Python | 2023-10 | [link](https://www.swebench.com) |
|  | Long Code Arena \[[152](https://arxiv.org/html/2510.04905v1#bib.bib152)\] | —-⁴⁴4Long Code Arena encompasses 6 distinct tasks, making it inappropriate to compute the overall size of the benchmark. | Python, Java, Kotlin | 2024-06 | [link](https://huggingface.co/spaces/JetBrains-Research/long-code-arena) |
| General Purpose | Aider Polyglot \[[153](https://arxiv.org/html/2510.04905v1#bib.bib153)\] | 225 | Multi-language | 2024-12 | [link](https://aider.chat/docs/leaderboards/) |
|  | LiveCodeBench \[[154](https://arxiv.org/html/2510.04905v1#bib.bib154)\] | 300+ | Python | 2024-03 | [link](https://livecodebench.github.io/) |
|  | HumanEval \[[143](https://arxiv.org/html/2510.04905v1#bib.bib143)\] | 164 | Python | 2021-07 | [link](https://huggingface.co/datasets/openai/openai_humaneval) |
|  | MBPP \[[144](https://arxiv.org/html/2510.04905v1#bib.bib144)\] | 974 | Python | 2021-08 | [link](https://github.com/google-research/google-research/tree/master/mbpp) |
|  | CodeXGLUE \[[155](https://arxiv.org/html/2510.04905v1#bib.bib155)\] | —-⁵⁵5CodeXGLUE encompasses 10 distinct tasks from 14 datasets, making it inappropriate to compute the overall size. | Multi-language | 2021-03 | [link](https://github.com/microsoft/CodeXGLUE) |

Table 5: Overview of representative benchmarks.

##### Repository-Level Line Completion.

- •
  RepoEval \[[19](https://arxiv.org/html/2510.04905v1#bib.bib19)\] is a RLCG benchmark from RepoCoder.It is built from high-quality Python repositories created in 2022 or later. It features 1,600 line completions, 1,600 API invocations, and 373 function body completions. Uniquely, RepoEval evaluates functional correctness using repository-native unit tests, ensuring reproducibility via snapshotting all repositories as of January 2023. The benchmark covers benchmarks at three levels of code completion granularity: lines, API calls, and function bodies.
- •
  RepoBench \[[147](https://arxiv.org/html/2510.04905v1#bib.bib147)\] supports both Python and Java, decomposes RLCG into retrieval (RepoBench-R, inputting in-file context and candidate snippets to retrieve golden ones via Accuracy@k), completion (RepoBench-C, using predefined context for next-line generation with 3 types of masking and EM/ES evaluation), and pipeline (RepoBench-P, combining retrieval and completion with long-context thresholds and EM/ES evaluation), using newly crawled GitHub data to avoid leakage and enable systematic assessment.
- •
  CrossCodeEval \[[148](https://arxiv.org/html/2510.04905v1#bib.bib148)\] addresses the limitation of in-file-only benchmarks by introducing 10,000 cross-file completion examples across Python, Java, TypeScript, and C#. It employs static analysis to construct examples that require import resolution and demonstrates the importance of cross-file retrieval. It adopts three prompt settings for code completion: in-file context only, retrieved cross-file context, and retrieval context combined with references.

##### Repository-Level Function Generation.

- •
  CoderEval \[[149](https://arxiv.org/html/2510.04905v1#bib.bib149)\] evaluates pragmatic code generation with 460 real-world problems (230 Python, 230 Java) spanning six levels of context dependency. Unlike HumanEval \[[143](https://arxiv.org/html/2510.04905v1#bib.bib143)\], it emphasizes non-standalone functions, which constitute over 70% of open-source code. By standardizing the input format as “signature + documentation + context,” the benchmark simulates realistic scenarios where developers implement new functions within an existing codebase. Evaluation is automated through Docker environments and reports both Pass@k and Acc@k metrics.
- •
  EvoCodeBench \[[151](https://arxiv.org/html/2510.04905v1#bib.bib151)\] (e.g., EvoCodeBench-2403) is an evolving benchmark aligned with the latest real-world repositories. It includes 275 annotated samples and emphasizes realistic dependency structures and dynamic updates to reduce data leakage. Each EvoCodeBench task pairs a natural language requirement with its function signature, reference implementation, dependencies, domain label, and test cases within a Python repository. Evaluation is based on Pass@k and Recall@k, showing that top LLMs still struggle in such settings.
- •
  DevEval \[[150](https://arxiv.org/html/2510.04905v1#bib.bib150)\] is a manually-annotated benchmark comprising 1,874 samples from 117 real-world repositories across 10 domains. The task formulates a RACG scenario where models are required to generate a target function that satisfies specific requirements, given the function signature, natural language descriptions of the requirements, and relevant repository context (including cross-file dependencies and existing code snippets).

##### Pragmatic and Real-World Issue Resolution.

- •
  SWE-bench \[[4](https://arxiv.org/html/2510.04905v1#bib.bib4)\] features 2,294 real-world software engineering issues from 12 Python repositories, where models generate patches and are evaluated via unit tests. As one of the most widely used benchmarks in AI, SWE-bench has since expanded into multiple variants, including SWE-bench-lite (a smaller subset for fast iteration), SWE-bench-verified (human-validated solvable issues), SWE-bench-multilingual (extending to diverse programming languages), and SWE-bench-multimodal \[[156](https://arxiv.org/html/2510.04905v1#bib.bib156)\] (incorporating visual elements).
- •
  Long Code Arena \[[152](https://arxiv.org/html/2510.04905v1#bib.bib152)\] consists of six long-context benchmarks designed to evaluate code models on project-wide tasks, such as bug localization and library-based code generation. It provides manually verified datasets from real-world open-source projects, baseline results from popular LLMs, and tailored evaluation tools.

##### Foundational General-Purpose Benchmarks.

- •
  Polyglot Leaderboard \[[153](https://arxiv.org/html/2510.04905v1#bib.bib153)\] is one of the most popular contemporary leaderboards for evaluating code LLMs across multiple programming languages. Hosted by Aider, it provides a unified benchmark suite and standardized pass@k evaluation, enabling fair cross-model comparison. Its wide adoption has made it a central reference point for assessing multilingual coding capabilities of modern LLMs.
- •
  LiveCodeBench \[[154](https://arxiv.org/html/2510.04905v1#bib.bib154)\] comprises over 300 high-quality programming problems released between May 2023 and February 2024, evaluating models on code generation, self-repair, test output prediction, and execution under rigorous metrics. Designed as a holistic and contamination-free benchmark, it leverages problem release dates to assess generalization on content published after model training cutoffs.
- •
  HumanEval \[[143](https://arxiv.org/html/2510.04905v1#bib.bib143)\] is a widely used benchmark consisting of 164 Python problems, each including a function signature, docstring, and unit tests. While effective for basic code generation assessment using the pass@k metric, it suffers from potential data leakage and limited realism.
- •
  MBPP \[[144](https://arxiv.org/html/2510.04905v1#bib.bib144)\] (Mostly Basic Programming Problems) includes 974 beginner-level Python problems expressed in natural language. It supports evaluation of synthesis from prompts in few-shot and fine-tuned settings and demonstrates a log-linear performance scale with model size.
- •
  CodeXGLUE \[[155](https://arxiv.org/html/2510.04905v1#bib.bib155)\] is a benchmark suite encompassing 10 code-related tasks (e.g., code translation, clone detection, completion), supported by 14 datasets. It offers baselines such as CodeBERT and CodeGPT, and an evaluation platform for standardized comparison.

### 4.5 Programming Language Support

## Figure 9: Programming Language Distribution

We analyzed the programming language distribution in retrieval-augmented code generation systems. The statistics are based on explicit mentions in papers about which languages were used for evaluation, including cases of cross-lingual transfer—where models trained on one language perform well on another. This allows us to observe the community’s preferences in testing languages.

As shown in Figure [9](https://arxiv.org/html/2510.04905v1#S4.F9 "Figure 9 ‣ 4.5 Programming Language Support ‣ 4 Literature Review ‣ Retrieval-Augmented Code Generation: A Survey with Focus on Repository-Level Approaches"), Python dominates with 79 occurrences, accounting for the majority of use cases. This is likely due to Python’s popularity in the AI and open-source ecosystems, as well as its dynamic syntax and widespread use in software engineering and data science. Java follows with 38 instances, reflecting its strong presence in enterprise and large-scale backend development. C++, C#, JavaScript and TypeScript appear in 6 cases, respectively, indicating some interest in supporting statically typed languages used in industry. A few other languages, such as Rust and Go, show limited support (1–2 occurrences each), possibly due to smaller community efforts or limited training data availability. Overall, the findings suggest that while some systems aim for broader multi-language capabilities, most research and applications remain focused on Python-centric workflows.

This distribution highlights a key trend: retrieval-augmented code generation research has largely centered on Python-centric scenarios. This focus can be attributed to both practical and experimental factors. From a research perspective, Python offers a favorable environment for rapid prototyping and model integration, given its minimal syntax, rich set of open-source libraries, and prevalence in academic benchmarks.

However, the limited support for languages like Rust or Go suggests a potential bias in model evaluation and training data, which may hinder generalization to real-world, multi-language codebases. For instance, statically typed and compiled languages often involve complex syntax and rigid structure that pose challenges for tokenization, retrieval alignment, and generation fidelity.

As the field matures, we expect greater emphasis on cross-language generalization, either through multilingual training, language-specific adapters, or language-agnostic embeddings. However, closing the gap between academic prototypes and practical deployment across heterogeneous code repositories remains an open challenge. This challenge is further exacerbated by the limited language diversity in current evaluation benchmarks—for instance, the original and the most used SWE-bench is exclusively Python-based, making it difficult to assess the effectiveness of systems on languages like Java, C++, or JavaScript that are prevalent in industrial codebases.

#### 4.5.1 Universal Language Support

Notably, cases with support for general-purpose programming languages rank third. This indicates that cross-language capabilities play a crucial role in retrieval-augmented code generation. Zhu et al. \[[157](https://arxiv.org/html/2510.04905v1#bib.bib157)\] demonstrate that cross-language RACG can significantly enhance the generation ability of multilingual code LLMs, which suggests that leveraging diverse programming languages for retrieval can improve model generalization and robustness.

Most of these works transform different programming languages into unified representations and architectures. Code2JSON \[[59](https://arxiv.org/html/2510.04905v1#bib.bib59)\] employs zero-shot LLM techniques to convert code into structured natural language features. CodeXEmbed \[[129](https://arxiv.org/html/2510.04905v1#bib.bib129)\] unifies all tasks (e.g., code retrieval, text retrieval) into a consistent format, supporting bidirectional conversion between text and code. CodeRCSG \[[97](https://arxiv.org/html/2510.04905v1#bib.bib97)\] constructs Cross-Lingual Semantic Graphs by encoding retrieved code semantic graphs with GNNs and integrating them with input text embeddings. Prometheus \[[84](https://arxiv.org/html/2510.04905v1#bib.bib84)\] provides a unified knowledge graph representation by transforming code from different languages into a common graph structure.

Other approaches introduce the Language Server Protocol (LSP), which offers several advantages: a unified interface, automated management, standardized protocols, and multi-language support. HCGS \[[96](https://arxiv.org/html/2510.04905v1#bib.bib96)\] utilizes a modified multilspy library as the LSP client, while Blinn et al. \[[122](https://arxiv.org/html/2510.04905v1#bib.bib122)\] propose ChatLSP, a framework that provides unified contextual services for diverse programming languages.

### 4.6 Backbone Models for Retrieval and Generation

In this section, we categorize and list the commonly used backbone models in RACG systems. Retrieval models are further divided into dense and sparse types based on their representation and matching strategies. We note that the models included here are representative rather than exhaustive, aiming to cover widely adopted examples across academic literature.

##### Dense Retrieval Models.

Dense retrievers rely on neural network encoders to produce continuous vector representations of queries and documents. Notable examples include:

- •
  UniXcoder \[[102](https://arxiv.org/html/2510.04905v1#bib.bib102)\]: A unified cross-modal pre-trained model that incorporates both code Abstract Syntax Trees (AST) and code comments. It uses a prefix-adapter to control masked attention and supports both understanding and generation tasks efficiently. Through multimodal contrastive learning, it produces precise and consistent semantic embeddings, enhancing retrieval performance. It is one of the most widely used dense retrieval models in code-related tasks.
- •
  CodeT5 \[[158](https://arxiv.org/html/2510.04905v1#bib.bib158)\]: A unified encoder-decoder pre-trained model that introduces identifier-aware pre-training and bimodal dual generation. It effectively captures semantic signals from variable and function names, achieving strong performance across code understanding and generation tasks.
- •
  Voyage-Code \[[159](https://arxiv.org/html/2510.04905v1#bib.bib159)\]: An advanced embedding model optimized for code retrieval, integrating Matryoshka learning and quantization-aware training. It leverages contrastive learning with curated code pairs (300+ languages) to boost embedding precision for code representation. Supporting flexible dimensions and quantized formats, it balances retrieval quality and cost.
- •
  Stella \[[160](https://arxiv.org/html/2510.04905v1#bib.bib160)\]: A high-performance text embedding model. It enables knowledge distillation via multi-stage training with three designed losses, supports vector dimensionality reduction through MRL, and delivers robust semantic embeddings for dense retrieval tasks.
- •
  GraphCodeBERT \[[101](https://arxiv.org/html/2510.04905v1#bib.bib101)\]: GraphCodeBERT is a unified pre-trained model that incorporates code data flow (a semantic-level structure encoding variable value source relations) instead of syntactic AST. It uses a graph-guided masked attention function and introduces two structure-aware pre-training tasks (predicting code structure edges and aligning source code with structure representations) based on Transformer.
- •
  CodeBERT \[[161](https://arxiv.org/html/2510.04905v1#bib.bib161)\]: A bimodal pre-trained model for programming and natural languages, based on Transformer. Trained with hybrid objectives using bimodal NL-PL pairs and unimodal data, it excels in natural language code search, code documentation generation, etc.
- •
  Ada-Embedding-002 \[[162](https://arxiv.org/html/2510.04905v1#bib.bib162)\]: A general-purpose text embedding model released by OpenAI, optimized for both performance and efficiency. It provides dense vector representations for natural language and code, widely used in retrieval-augmented generation, semantic search, and recommendation tasks. Though not specifically fine-tuned for code, its strong generalization and scalability make it a robust baseline for dense retrieval across modalities.

##### Sparse Retrieval Models.

These models retrieve relevant documents based on lexical overlap or hand-crafted similarity metrics. Despite lacking semantic understanding, they remain effective and interpretable:

- •
  BM25 \[[163](https://arxiv.org/html/2510.04905v1#bib.bib163)\]: BM25 (Best Matching 25) is a bag-of-words ranking function based on term frequency and inverse document frequency (TF-IDF). It scores documents by how well they match a query, taking into account term saturation and document length normalization. Despite its simplicity, BM25 remains a strong baseline for code retrieval, especially in scenarios where exact keyword matching plays a key role.
- •
  Jaccard Similarity\] \[[164](https://arxiv.org/html/2510.04905v1#bib.bib164)\]: Jaccard similarity computes the ratio of the intersection over the union of two sets. In code retrieval, it is often applied at the token or line level to measure the structural overlap between the query and candidate snippets. This metric is particularly useful in tasks where preserving code structure or shared function components is more important than semantics.

##### Code Generation Models.

These models generate code based on retrieved context and task instructions. We categorize them into open-source and proprietary models.

| Model | Organization | Size | Vocab | Context | Tokens | Date |
|----|----|----|----|----|----|----|
| CodeGen \[[165](https://arxiv.org/html/2510.04905v1#bib.bib165)\] | Salesforce AI | 350M, 2B, 6B, 16B | 50K | 2048 | 577.2B | 2022-03 |
| CodeGen2 \[[166](https://arxiv.org/html/2510.04905v1#bib.bib166)\] | Salesforce AI | 1B, 3.7B, 7B, 16B | 50K | 2048 | 400B-1.4T | 2023-03 |
| SantaCoder \[[167](https://arxiv.org/html/2510.04905v1#bib.bib167)\] | BigCode | 1.1B | 48K | 2048 | 236B | 2023-01 |
| StarCoder(Base) \[[168](https://arxiv.org/html/2510.04905v1#bib.bib168)\] | BigCode | 1B, 3B, 7B, 15.5B | 48K | 8192 | 1T | 2023-05 |
| StarCoder2 \[[169](https://arxiv.org/html/2510.04905v1#bib.bib169)\] | BigCode | 3B, 7B, 15B | 48K | 16K | 4T | 2024-02 |
| Code LLaMA \[[170](https://arxiv.org/html/2510.04905v1#bib.bib170)\] | Meta | 7B, 13B, 34B, 70B | 31K | 16K-100K | 500B-1T | 2023-08 |
| DeepSeek-Coder \[[171](https://arxiv.org/html/2510.04905v1#bib.bib171)\] | DeepSeek | 1.3B, 5.7B, 6.7B, 33B | 32K | 16K | 2T | 2024-01 |
| DeepSeek-Coder-V2 \[[172](https://arxiv.org/html/2510.04905v1#bib.bib172)\] | DeepSeek | 16B(2.4B), 236B(21B) | 100K | 16K-128K | 6T | 2024-06 |
| CodeQwen1.5 \[[173](https://arxiv.org/html/2510.04905v1#bib.bib173)\] | Alibaba | 7B | 90K | 64K | 3T | 2024-04 |
| Qwen2.5-Coder \[[174](https://arxiv.org/html/2510.04905v1#bib.bib174)\] | Alibaba | 0.5B, 1.5B, 3B, 7B, 14B, 32B | 149K | 32K-128K | 5.5T | 2024-11 |
| Qwen3-Coder \[[6](https://arxiv.org/html/2510.04905v1#bib.bib6)\] | Alibaba | 30B(3B), 480B(35B) | 148K | 256K-1M | 7.5T | 2025-07 |

Table 6: Overview of selected open-source code generation models, including details such as the developing organization, model size (with some MoE models in the format of "full parameters (activation parameters)"), vocabulary size, context window length, total number of training tokens, and release date.

## Open-source Model Series

- •
  CodeGen \[[165](https://arxiv.org/html/2510.04905v1#bib.bib165)\]: A decoder-only transformer model family released by Salesforce, trained on natural language and programming language data across multiple languages (up to $`\sim`$16B parameters). It exhibits strong zero-shot and multi-turn program synthesis abilities, remaining competitive on tasks like HumanEval and Multiturn Programming Benchmark (MTPB).
- •
  SantaCoder \[[167](https://arxiv.org/html/2510.04905v1#bib.bib167)\]: A 1.1B-parameter code LLM from the BigCode community, trained on Python, Java, and JavaScript using The Stack v1.1. It uses Multi-Query Attention and Fill-in-the-Middle (FIM) training to achieve efficient inference, strong infilling, and excellent per-token accuracy despite its compact size.
- •
  StarCoder \[[168](https://arxiv.org/html/2510.04905v1#bib.bib168)\]: A $`\sim`$15.5B-parameter code generation model trained on $`\sim`$1 trillion tokens from The Stack (80+ languages) and fine-tuned on Python. It supports long contexts (8K), multi-query attention, and FIM; it achieves $`\sim`$40% pass@1 on HumanEval and outperforms earlier open multilingual code LLMs.
- •
  Code LLaMA \[[170](https://arxiv.org/html/2510.04905v1#bib.bib170)\]: A code-specialized variant of Meta’s LLaMA 2 series, available in 7B, 13B, and 34B sizes. It supports long-context code completion and instruction-following, and achieves state-of-the-art performance among open models on code synthesis and infilling tasks.
- •
  DeepSeek-Coder \[[171](https://arxiv.org/html/2510.04905v1#bib.bib171)\]: A Chinese open-source model series, trained from scratch on $`\sim`$2 trillion tokens (87% code, 13% natural language). It uses project-level corpora and large context windows (up to 16K) with fill-in-the-blank objectives to perform code completion and infilling across English and Chinese codebases.
- •
  Qwen2.5-Coder \[[174](https://arxiv.org/html/2510.04905v1#bib.bib174)\]: Alibaba’s multilingual code LLM series based on Qwen2.5 architecture, with multiple sizes (up to 32B). It supports giant context windows (up to 128K tokens) and $`\sim`$92 programming languages, excelling in code completion, generation, repair, and reasoning across multilingual environments.

| Model             | Organization | Context | Cost (Input/Output) | Date    | SWE-bench |
|-------------------|--------------|---------|---------------------|---------|-----------|
| GPT-4o            | OpenAI       | 128K    | \$2.50/\$10.00      | 2024-05 | 21.62%    |
| GPT-5             | OpenAI       | 400K    | \$1.25/\$10.00      | 2025-08 | 65.00%    |
| GPT-5 mini        | OpenAI       | 400K    | \$0.25/\$2.00       | 2025-08 | 59.80%    |
| o3                | OpenAI       | 200K    | \$2.00/\$8.00       | 2025-04 | 58.40%    |
| Claude Opus 4     | Anthropic    | 200K    | \$15.00/\$75.00     | 2025-05 | 67.60%    |
| Claude Sonnet 4   | Anthropic    | 200K    | \$3.00/\$15.00      | 2025-05 | 64.93%    |
| Claude Sonnet 4.5 | Anthropic    | 200K    | \$3.00/\$15.00      | 2025-09 | 70.60%    |
| Gemini 2.5 Pro    | Google       | 1M      | \$1.25/\$10.00      | 2025-03 | 53.60%    |
| Gemini 2.5 Flash  | Google       | 1M      | \$0.30/\$2.50       | 2025-03 | 28.73%    |

- •
  \* SWE-bench Verified score with mini-swe-agent
- •
  Costs shown are per million tokens (input/output) with no cache in USD
- •
  Context window shown as input token limit for Gemini Model(K = thousand, M = million)

Table 7: Overview of selected proprietary code generation models, including details such as the developing organization, context window length, cost, release date and official SWE-bench score.

## Proprietary Model Series

- •
  GPT and o Series (e.g., GPT-5, GPT-5 mini, GPT-4o, o3) \[[1](https://arxiv.org/html/2510.04905v1#bib.bib1)\]: Developed by OpenAI, this series represents the forefront of code generation and reasoning. GPT-5 delivers high performance with a very large context window and advanced reasoning capabilities, suitable for complex coding tasks. The o series, including models like o3 and o4-mini, focuses on optimized multi-step reasoning and long-context handling, making them particularly effective for long-running or intricate coding workflows.
- •
  Claude Series (e.g., Claude Opus 4, Sonnet 4.5) \[[2](https://arxiv.org/html/2510.04905v1#bib.bib2)\]: Developed by Anthropic, Claude 4.5 models set new standards for coding and reasoning. Claude Opus 4 is billed as the world’s best coding model—excelling at long-running and agentic workflows—while Sonnet 4 delivers code precision in a cost-effective, free version.
- •
  Gemini Series (e.g., Gemini 2.5 Pro, Flash-Lite) \[[3](https://arxiv.org/html/2510.04905v1#bib.bib3)\]: Created by Google DeepMind, Gemini 2.5 Pro is an advanced “thinking” model with superior coding and multimodal reasoning capabilities, a 1 million-token context window, and deep benchmarking leadership. Flash-Lite offers an ultra cost-efficient variant ( \$0.10 input / \$0.40 output per million tokens) while maintaining strong code performance.

Figure 10: Distribution of base generation models used in the surveyed papers.

We also conducted a survey of the base generation models adopted in each paper, focusing specifically on the models used in the recommended configurations rather than those included solely for baseline comparison. This distinction allows us to better understand the models authors truly relied on in their proposed systems.

We categorized the models into three groups: (1) large open-source models (\>10B parameters), (2) small open-source models (\<10B parameters), and (3) proprietary models.

Our analysis reveals that small open-source models and proprietary models appear with comparable frequency and are significantly more popular than large open-source models. The prevalence of small models may be due to limited computational resources in academic or exploratory research settings, or because they can already achieve satisfactory performance on many tasks. Meanwhile, proprietary models are widely adopted, potentially due to two key reasons: (i) their superior performance on complex reasoning and generation tasks, and (ii) their ease of integration via API, reducing engineering and infrastructure overhead.

In contrast, large open-source models (\>10B) are used far less frequently. This may stem from their high resource demands, including substantial GPU memory and inference time, which can pose barriers to adoption in both academic and industrial settings without dedicated infrastructure.

## 5 Challenges & Opportunities

### 5.1 Limitations of Existing Approaches

Despite the rapid evolution of RACG systems, several core limitations continue to hinder their robustness and applicability in real-world scenarios.

First, context window constraints and long-range dependency modeling remain a fundamental bottleneck. Although RAG frameworks partially alleviate this issue by retrieving relevant content externally, the retrieved information often fails to fully preserve semantic continuity across distant code segments. Consequently, LLMs may struggle with global reasoning, producing outputs that lack coherence with repository-wide structures and dependencies.

Second, graph-based RAG models suffer from complexity and retrieval noise. While graph representations are well-suited to capturing structural relationships such as function calls and module hierarchies, their construction is computationally expensive and prone to introducing noise. The lack of standardized edge semantics or graph traversal algorithms often results in redundant context retrieval, which can impair generation quality and generalization.

Third, there is a persistent issue of insufficient dataset scale and diversity. Existing benchmarks are typically small in size, skewed toward Python-centric codebases, and constructed under synthetic assumptions. Few datasets evaluate systems on multilingual repositories or account for the dynamic nature of software evolution, which limits the ecological validity of current RACG evaluations.

Lastly, limited deployment readiness undermines the practical impact of current research. Many proposed models are designed and evaluated in isolated settings, lacking integration with modern development environments such as IDEs, continuous integration (CI) pipelines, or automated test suites. This gap prevents meaningful adoption by software engineers and reduces feedback opportunities for model refinement.

### 5.2 Future Directions

Looking ahead, we identify several promising research directions that may help address the aforementioned limitations and unlock new capabilities in RACG systems.

First, multimodal code generation represents an exciting frontier. By incorporating not only source code but also documentation, issue discussions, architectural diagrams, execution logs, and historical commits, models can reason over richer contextual information. This multimodal fusion has the potential to significantly improve the semantic grounding and relevance of generated code, particularly in complex or underspecified scenarios.

Second, integrating graph-based RAG with LLM agents opens up opportunities for interactive, task-driven code generation. Instead of static prompt-based workflows, agents can navigate code graphs, plan multi-step actions, invoke analysis tools, and refine outputs iteratively. Such systems can dynamically adapt to user intent and repository structure, offering greater autonomy, explainability, and repair capability.

Third, designing scalable and memory-efficient architectures remains critical. Long-context transformers, hierarchical retrieval mechanisms, and condensed memory summarization techniques may enable LLMs to reason over entire repositories without incurring prohibitive computational costs. Efficient memory management will be especially important for enabling real-time feedback and in-situ development support.

Fourth, supporting multilingual repositories is increasingly important. Modern software projects often combine multiple programming languages (e.g., mixed frontend–backend stacks), posing challenges for cross-language alignment, retrieval, and generation. Developing models and retrieval strategies that seamlessly operate across languages will be key to handling heterogeneous, real-world repositories.

Fifth, repository-wide coordinated editing tasks deserve more attention. Recent work such as CodePlan has introduced scenarios requiring large-scale, synchronized modifications—such as package migration, static analysis or testing fixes, and type annotation insertion. These tasks demand reasoning over inter-file dependencies and scaling beyond single-prompt contexts. Advancing this direction has concrete practical value and could substantially improve developer productivity.

Sixth, there is a pressing need for realistic evaluation in production-level software scenarios. Future benchmarks should simulate real engineering workflows—e.g., responding to bug reports, performing API migrations, or contributing to CI/CD pipelines. This would provide a more accurate picture of model performance, and support iterative development grounded in practical utility.

Seventh, we advocate for more nuanced and fine-grained evaluation metrics. Commonly used metrics like exact match or pass@k fail to capture semantic correctness, functional compatibility, or human usability. Instead, evaluations should include static analysis success rates, integration test pass rates, type-checking consistency, and even developer satisfaction scores to better reflect the true value of RACG systems in practice.

Eighth, an important direction lies in bridging the gap between retrieval and generation. Prior to the rise of LLMs, research in code intelligence largely focused on retrieval-based paradigms—such as *NL2Code* and *Code2Code* search—emphasizing accurate matching and semantic retrieval. With the advent of LLMs, attention has shifted toward generative modeling, aiming to directly synthesize or repair code, often by scaling model capacity and reasoning depth. However, effective integration between these two paradigms remains limited. Building tighter coupling and alignment between retrieval and generation—so that retrieved artifacts can dynamically inform and constrain generation—represents the core challenge and unique promise of RACG. This intersection is key to achieving models that are both grounded in real codebases and capable of creative, context-aware synthesis.

## 6 Conclusion

As software development increasingly relies on complex, modular, and large-scale code repositories, the limitations of traditional code generation systems—restricted to function- or file-level reasoning—have become more apparent. In this survey, we explored the emerging paradigm of Retrieval-Augmented Code Generation with a focus on Repository-Level, which emphasizes enhancing large language models with retrieval mechanisms that provide structurally and semantically relevant external context.

We provided a comprehensive taxonomy of retrieval strategies, fusion techniques, generation architectures, training methodologies, and evaluation protocols. We highlighted the strengths and trade-offs of non-graph-based versus graph-based retrieval-augmented systems, discussed the role of agent-based architectures in enabling interactive and autonomous reasoning, and analyzed common downstream tasks and benchmarks that shape current evaluation standards in RACG research.

Despite promising advances, RACG systems still face significant challenges—ranging from retrieval efficiency and context selection to graph complexity, benchmark scarcity, and real-world deployment barriers. These obstacles highlight a rich landscape of open problems and research opportunities.

Looking ahead, we envision RACG systems evolving toward more effective multimodal retrieval, robust graph-agent integration, memory-efficient long-context modeling, and tighter coupling with practical software engineering workflows. We also anticipate the emergence of more holistic evaluation metrics that capture semantic correctness, structural integrity, and practical usability.

Ultimately, by bridging retrieval-augmented language modeling with the structural semantics of large-scale codebases, RACG research holds the potential to transform LLMs from passive suggestion engines into intelligent, context-aware assistants capable of actively supporting collaborative software development.

## References

- \[1\] OpenAI. Introducing gpt-5. [https://openai.com/index/introducing-gpt-5/](https://openai.com/index/introducing-gpt-5/), August 2025. OpenAI official website.
- \[2\] Anthropic. Write beautiful code, ship powerful products. [https://www.anthropic.com/solutions/coding](https://www.anthropic.com/solutions/coding), August 2025. Anthropic official website, “Solutions – Coding” page.
- \[3\] Google DeepMind. Gemini. [https://deepmind.google/models/gemini/](https://deepmind.google/models/gemini/), August 2025. Google DeepMind official website.
- \[4\] Carlos E Jimenez, John Yang, Alexander Wettig, Shunyu Yao, Kexin Pei, Ofir Press, and Karthik R Narasimhan. SWE-bench: Can language models resolve real-world github issues? In The Twelfth International Conference on Learning Representations, 2024.
- \[5\] Baptiste Roziere, Jonas Gehring, Fabian Gloeckle, Sten Sootla, Itai Gat, Xiaoqing Ellen Tan, Yossi Adi, Jingyu Liu, Romain Sauvestre, Tal Remez, et al. Code llama: Open foundation models for code. arXiv preprint arXiv:2308.12950, 2023.
- \[6\] Qwen Team. Qwen3 technical report, 2025.
- \[7\] Raymond Li, Loubna Ben Allal, Yangtian Zi, Niklas Muennighoff, Denis Kocetkov, Chenghao Mou, Marc Marone, Christopher Akiki, Jia Li, Jenny Chim, et al. Starcoder: may the source be with you! arXiv preprint arXiv:2305.06161, 2023.
- \[8\] GitHub. Github copilot: Your ai pair programmer. [https://github.com/features/copilot](https://github.com/features/copilot), August 2025. GitHub features page.
- \[9\] Anysphere. Cursor: The ai code editor. [https://cursor.com/en](https://cursor.com/en), August 2025. Anysphere official website.
- \[10\] Codeium. Windsurf: The ai code editor. [https://windsurf.com/](https://windsurf.com/), August 2025. Codeium official website.
- \[11\] ByteDance. Trae: The real ai engineer. [https://www.trae.ai/](https://www.trae.ai/), August 2025. ByteDance official website.
- \[12\] OpenAI. Introducing codex. [https://openai.com/index/introducing-codex/](https://openai.com/index/introducing-codex/), May 2025. OpenAI blog post.
- \[13\] Google. Gemini cli. [https://google-gemini.github.io/gemini-cli/](https://google-gemini.github.io/gemini-cli/), August 2025. Google official website.
- \[14\] Anthropic. Claude code: Deep coding at terminal velocity. [https://www.anthropic.com/claude-code](https://www.anthropic.com/claude-code), August 2025. Anthropic official website.
- \[15\] Zora Zhiruo Wang, Akari Asai, Xinyan Velocity Yu, Frank F. Xu, Yiqing Xie, Graham Neubig, and Daniel Fried. CodeRAG-bench: Can retrieval augment code generation? In Luis Chiruzzo, Alan Ritter, and Lu Wang, editors, Findings of the Association for Computational Linguistics: NAACL 2025, pages 3199–3214, Albuquerque, New Mexico, April 2025. Association for Computational Linguistics.
- \[16\] Kang Chen, Xiuze Zhou, Yuanguo Lin, Shibo Feng, Li Shen, and Pengcheng Wu. A survey on privacy risks and protection in large language models. arXiv preprint arXiv:2505.01976, 2025.
- \[17\] God of Prompt. Local llm setup for privacy-conscious businesses. God of Prompt (blog), 2025. [https://www.godofprompt.ai/blog/local-llm-setup-for-privacy-conscious-businesses](https://www.godofprompt.ai/blog/local-llm-setup-for-privacy-conscious-businesses).
- \[18\] Otterly.AI Blog. Knowledge cutoff dates of all llms explained. [https://otterly.ai/blog/knowledge-cutoff/](https://otterly.ai/blog/knowledge-cutoff/), February 2024. Accessed on September 4, 2025.
- \[19\] Fengji Zhang, Bei Chen, Yue Zhang, Jacky Keung, Jin Liu, Daoguang Zan, Yi Mao, Jian-Guang Lou, and Weizhu Chen. RepoCoder: Repository-level code completion through iterative retrieval and generation. In Houda Bouamor, Juan Pino, and Kalika Bali, editors, Proceedings of the 2023 Conference on Empirical Methods in Natural Language Processing, pages 2471–2484, Singapore, December 2023. Association for Computational Linguistics.
- \[20\] Siru Ouyang, Wenhao Yu, Kaixin Ma, Zilin Xiao, Zhihan Zhang, Mengzhao Jia, Jiawei Han, Hongming Zhang, and Dong Yu. Repograph: Enhancing AI software engineering with repository-level code graph. In The Thirteenth International Conference on Learning Representations, 2025.
- \[21\] Chong Wang, Jian Zhang, Yebo Feng, Tianlin Li, Weisong Sun, Yang Liu, and Xin Peng. Teaching code llms to use autocompletion tools in repository-level code generation. ACM Trans. Softw. Eng. Methodol., 34(7), August 2025.
- \[22\] John Yang, Carlos E Jimenez, Alexander Wettig, Kilian Lieret, Shunyu Yao, Karthik Narasimhan, and Ofir Press. Swe-agent: Agent-computer interfaces enable automated software engineering. Advances in Neural Information Processing Systems, 37:50528–50652, 2024.
- \[23\] Juyong Jiang, Fan Wang, Jiasi Shen, Sungju Kim, and Sunghun Kim. A survey on large language models for code generation. ACM Trans. Softw. Eng. Methodol., July 2025. Just Accepted.
- \[24\] Junwei Liu, Kaixin Wang, Yixuan Chen, Xin Peng, Zhenpeng Chen, Lingming Zhang, and Yiling Lou. Large language model-based agents for software engineering: A survey, 2024.
- \[25\] Yunfan Gao, Yun Xiong, Xinyu Gao, Kangxiang Jia, Jinliu Pan, Yuxi Bi, Yi Dai, Jiawei Sun, Meng Wang, and Haofen Wang. Retrieval-augmented generation for large language models: A survey, 2024.
- \[26\] Wenqi Fan, Yujuan Ding, Liangbo Ning, Shijie Wang, Hengyun Li, Dawei Yin, Tat-Seng Chua, and Qing Li. A survey on rag meeting llms: Towards retrieval-augmented large language models. In Proceedings of the 30th ACM SIGKDD Conference on Knowledge Discovery and Data Mining, KDD ’24, page 6491–6501, New York, NY, USA, 2024. Association for Computing Machinery.
- \[27\] Yihong Dong, Xue Jiang, Jiaru Qian, Tian Wang, Kechi Zhang, Zhi Jin, and Ge Li. A survey on code generation with llm-based agents, 2025.
- \[28\] Junda He, Christoph Treude, and David Lo. Llm-based multi-agent systems for software engineering: Literature review, vision, and the road ahead. ACM Trans. Softw. Eng. Methodol., 34(5), May 2025.
- \[29\] Yanlin Wang, Wanjun Zhong, Yanxian Huang, Ensheng Shi, Min Yang, Jiachi Chen, Hui Li, Yuchi Ma, Qianxiang Wang, and Zibin Zheng. Agents in software engineering: survey, landscape, and vision. Automated Software Engineering, 32(2):70, 2025.
- \[30\] Zhongming Yu, Hejia Zhang, Yujie Zhao, Hanxian Huang, Matrix Yao, Ke Ding, and Jishen Zhao. Orcaloca: An LLM agent framework for software issue localization. In Forty-second International Conference on Machine Learning, 2025.
- \[31\] Kai Petersen, Robert Feldt, Shahid Mujtaba, and Michael Mattsson. Systematic mapping studies in software engineering. In Proceedings of the 12th International Conference on Evaluation and Assessment in Software Engineering, EASE’08, page 68–77, Swindon, GBR, 2008. BCS Learning & Development Ltd.
- \[32\] Shuai Lu, Nan Duan, Hojae Han, Daya Guo, Seung-won Hwang, and Alexey Svyatkovskiy. ReACC: A retrieval-augmented code completion framework. In Smaranda Muresan, Preslav Nakov, and Aline Villavicencio, editors, Proceedings of the 60th Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pages 6227–6240, Dublin, Ireland, May 2022. Association for Computational Linguistics.
- \[33\] Noor Nashid, Mifta Sintaha, and Ali Mesbah. Retrieval-based prompt selection for code-related few-shot learning. In 2023 IEEE/ACM 45th International Conference on Software Engineering (ICSE), pages 2450–2462, 2023.
- \[34\] Weishi Wang, Yue Wang, Shafiq Joty, and Steven C.H. Hoi. Rap-gen: Retrieval-augmented patch generation with codet5 for automatic program repair. In Proceedings of the 31st ACM Joint European Software Engineering Conference and Symposium on the Foundations of Software Engineering, ESEC/FSE 2023, page 146–158, New York, NY, USA, 2023. Association for Computing Machinery.
- \[35\] Daoguang Zan, Bei Chen, Yongshun Gong, Junzhi Cao, Fengji Zhang, Bingchao Wu, Bei Guan, Yilong Yin, and Yongji Wang. Private-library-oriented code generation with large language models. Knowledge-Based Systems, 326:113934, 2025.
- \[36\] Ze Tang, Jidong Ge, Shangqing Liu, Tingwei Zhu, Tongtong Xu, Liguo Huang, and Bin Luo. Domain adaptive code completion via language models and decoupled domain databases. In 2023 38th IEEE/ACM International Conference on Automated Software Engineering (ASE), pages 421–433, 2023.
- \[37\] Xiangyu Zhang, Yu Zhou, Guang Yang, and Taolue Chen. Syntax-aware retrieval augmented code generation. In Houda Bouamor, Juan Pino, and Kalika Bali, editors, Findings of the Association for Computational Linguistics: EMNLP 2023, pages 1291–1302, Singapore, December 2023. Association for Computational Linguistics.
- \[38\] Hanzhuo Tan, Qi Luo, Ling Jiang, Zizheng Zhan, Jing Li, Haotian Zhang, and Yuqun Zhang. Prompt-based code completion via multi-retrieval augmented generation. ACM Trans. Softw. Eng. Methodol., March 2025. Just Accepted.
- \[39\] Qi Guo, Xiaohong Li, Xiaofei Xie, Shangqing Liu, Ze Tang, Ruitao Feng, Junjie Wang, Jidong Ge, and Lei Bu. Ft2ra: A fine-tuning-inspired approach to retrieval-augmented code completion. In Proceedings of the 33rd ACM SIGSOFT International Symposium on Software Testing and Analysis, ISSTA 2024, page 313–324, New York, NY, USA, 2024. Association for Computing Machinery.
- \[40\] Manish Bhattarai, Miguel Cordova, Javier Santos, and Dan O’Malley. Arcs: Agentic retrieval-augmented code synthesis with iterative refinement, 2025.
- \[41\] Yanzhou Li, Shangqing Liu, Kangjie Chen, Tianwei Zhang, and Yang Liu. Impact-driven context filtering for cross-file code completion. In Second Conference on Language Modeling, 2025.
- \[42\] Chengxing Xie, Bowen Li, Chang Gao, He Du, Wai Lam, Difan Zou, and Kai Chen. SWE-fixer: Training open-source LLMs for effective and efficient GitHub issue resolution. In Wanxiang Che, Joyce Nabende, Ekaterina Shutova, and Mohammad Taher Pilehvar, editors, Findings of the Association for Computational Linguistics: ACL 2025, pages 1123–1139, Vienna, Austria, July 2025. Association for Computational Linguistics.
- \[43\] Lei Zhang, Yunshui Li, Jiaming Li, Xiaobo Xia, Jiaxi Yang, Run Luo, Minzheng Wang, Longze Chen, Junhao Liu, Qiang Qu, and Min Yang. Hierarchical context pruning: Optimizing real-world code completion with repository-level pretrained code llms. Proceedings of the AAAI Conference on Artificial Intelligence, 39(24):25886–25894, Apr. 2025.
- \[44\] Yifan Li, Ensheng Shi, Dewu Zheng, Kefeng Duan, Jiachi Chen, and Yanlin Wang. Repomincoder: Improving repository-level code generation based on information loss screening. In Proceedings of the 15th Asia-Pacific Symposium on Internetware, Internetware ’24, page 229–238, New York, NY, USA, 2024. Association for Computing Machinery.
- \[45\] Fabio Fehr, Prabhu Teja Sivaprasad, Luca Franceschi, and Giovanni Zappella. Coret: Improved retriever for code editing, 2025.
- \[46\] Hangzhan Jin and Mohammad Hamdaqa. Ccci: Code completion with contextual information for complex data transfer tasks using large language models, 2025.
- \[47\] Chuanyi Li, Jiwei Shang, Yi Feng, and Bin Luo. Hyracc: A hybrid retrieval-augmented framework for more efficient code completion. In 2025 IEEE/ACM Second International Conference on AI Foundation Models and Software Engineering (Forge), pages 61–66, 2025.
- \[48\] Aryaz Eghbali and Michael Pradel. De-hallucinator: Mitigating llm hallucinations in code generation tasks via iterative grounding, 2024.
- \[49\] Dmitriy Fedrushkov, Denis Tereshchenko, Sergey Kovalchuk, and Artem Aliev. Improving project-level code generation using combined relevant context. In Michael H. Lees, Wentong Cai, Siew Ann Cheong, Yi Su, David Abramson, Jack J. Dongarra, and Peter M. A. Sloot, editors, Computational Science – ICCS 2025, pages 438–445, Cham, 2025. Springer Nature Switzerland.
- \[50\] Jicheng Wang, Yifeng He, and Hao Chen. Repogenreflex: Enhancing repository-level code completion with verbal reinforcement and retrieval-augmented generation, 2024.
- \[51\] Qian Dong, Jia Chen, Qingyao Ai, Hongning Wang, Haitao Li, Yi Wu, Yao Hu, Yiqun Liu, and Shaoping Ma. Selfracg: Enabling llms to self-express and retrieve for code generation, 2025.
- \[52\] Avik Dutta, Mukul Singh, Gust Verbruggen, Sumit Gulwani, and Vu Le. RAR: Retrieval-augmented retrieval for code generation in low resource languages. In Yaser Al-Onaizan, Mohit Bansal, and Yun-Nung Chen, editors, Proceedings of the 2024 Conference on Empirical Methods in Natural Language Processing, pages 21506–21515, Miami, Florida, USA, November 2024. Association for Computational Linguistics.
- \[53\] Jaeseok Yoo, Hojae Han, Youngwon Lee, Jaejin Kim, and Seung-won Hwang. PERC: Plan-as-query example retrieval for underrepresented code generation. In Owen Rambow, Leo Wanner, Marianna Apidianaki, Hend Al-Khalifa, Barbara Di Eugenio, and Steven Schockaert, editors, Proceedings of the 31st International Conference on Computational Linguistics, pages 7982–7997, Abu Dhabi, UAE, January 2025. Association for Computational Linguistics.
- \[54\] Disha Shrivastava, Hugo Larochelle, and Daniel Tarlow. Repository-level prompt generation for large language models of code. In Proceedings of the 40th International Conference on Machine Learning, ICML’23. JMLR.org, 2023.
- \[55\] Xinyu Gao, Yun Xiong, Deze Wang, Zhenhan Guan, Zejian Shi, Haofen Wang, and Shanshan Li. Preference-guided refactored tuning for retrieval augmented code generation. In Proceedings of the 39th IEEE/ACM International Conference on Automated Software Engineering, ASE ’24, page 65–77, New York, NY, USA, 2024. Association for Computing Machinery.
- \[56\] Haochen Li, Xin Zhou, and Zhiqi Shen. Rewriting the code: A simple method for large language model augmented code search. In Lun-Wei Ku, Andre Martins, and Vivek Srikumar, editors, Proceedings of the 62nd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pages 1371–1389, Bangkok, Thailand, August 2024. Association for Computational Linguistics.
- \[57\] Dhruv Gupta, Gayathri Ganesh Lakshmy, and Yiqing Xie. Sacl: Understanding and combating textual bias in code retrieval with semantic-augmented reranking and localization, 2025.
- \[58\] Mizuki Kondo, Daisuke Kawahara, and Toshiyuki Kurabayashi. Improving repository-level code search with text conversion. In Yang (Trista) Cao, Isabel Papadimitriou, Anaelia Ovalle, Marcos Zampieri, Francis Ferraro, and Swabha Swayamdipta, editors, Proceedings of the 2024 Conference of the North American Chapter of the Association for Computational Linguistics: Human Language Technologies (Volume 4: Student Research Workshop), pages 130–137, Mexico City, Mexico, June 2024. Association for Computational Linguistics.
- \[59\] Aryan Singhal, Rajat Ghosh, Ria Mundra, Harshil Dadlani, and Debojyoti Dutta. Code2JSON: Can a zero-shot LLM agent extract code features for code RAG? In ICLR 2025 Third Workshop on Deep Learning for Code, 2025.
- \[60\] Junkai Chen, Xing Hu, Zhenhao Li, Cuiyun Gao, Xin Xia, and David Lo. Code search is all you need? improving code suggestions with code search. In Proceedings of the IEEE/ACM 46th International Conference on Software Engineering, ICSE ’24, New York, NY, USA, 2024. Association for Computing Machinery.
- \[61\] Keyu Liang, Zhongxin Liu, Chao Liu, Zhiyuan Wan, David Lo, and Xiaohu Yang. Zero-shot cross-domain code search without fine-tuning. Proc. ACM Softw. Eng., 2(FSE), June 2025.
- \[62\] Yilin Zhang, Xinran Zhao, Zora Zhiruo Wang, Chenyang Yang, Jiayi Wei, and Tongshuang Wu. cast: Enhancing code retrieval-augmented generation with structural chunking via abstract syntax tree, 2025.
- \[63\] Ken Deng, Jiaheng Liu, He Zhu, Congnan Liu, Jingxin Li, Jiakai Wang, Peng Zhao, Chenchen Zhang, Yanan Wu, Xueqiao Yin, Yuanxing Zhang, Wenbo Su, Bangyu Xiang, Tiezheng Ge, and Bo Zheng. R2c2-coder: Enhancing and benchmarking real-world repository-level code completion abilities of code large language models, 2024.
- \[64\] Dianshu Liao, Shidong Pan, Xiaoyu Sun, Xiaoxue Ren, Qing Huang, Zhenchang Xing, Huan Jin, and Qinying Li. $`\mathbf{A^{3}}`$A3-CodGen: A Repository-Level Code Generation Framework for Code Reuse With Local-Aware, Global-Aware, and Third-Party-Library-Aware . IEEE Transactions on Software Engineering, 50(12):3369–3384, December 2024.
- \[65\] Ming Liang, Xiaoheng Xie, Gehao Zhang, Xunjin Zheng, Peng Di, wei jiang, Hongwei Chen, Chengpeng Wang, and Gang Fan. Repofuse: Repository-level code completion with fused dual context, 2024.
- \[66\] Tuan-Dung Bui, Duc-Thieu Luu-Van, Thanh-Phat Nguyen, Thu-Trang Nguyen, Son Nguyen, and Hieu Dinh Vo. Rambo: Enhancing rag-based repository-level method body completion, 2024.
- \[67\] Ming Liang, Xiaoheng Xie, Gehao Zhang, Xunjin Zheng, Peng Di, Wei Jiang, Hongwei Chen, Chengpeng Wang, and Gang Fan. Repogenix: Dual context-aided repository-level code completion with language models. In Proceedings of the 39th IEEE/ACM International Conference on Automated Software Engineering, ASE ’24, page 2466–2467, New York, NY, USA, 2024. Association for Computing Machinery.
- \[68\] Hongjin Su, Shuyang Jiang, Yuhang Lai, Haoyuan Wu, Boao Shi, Che Liu, Qian Liu, and Tao Yu. EvoR: Evolving retrieval for code generation. In Yaser Al-Onaizan, Mohit Bansal, and Yun-Nung Chen, editors, Findings of the Association for Computational Linguistics: EMNLP 2024, pages 2538–2554, Miami, Florida, USA, November 2024. Association for Computational Linguistics.
- \[69\] Wenchao Gu, Juntao Chen, Yanlin Wang, Tianyue Jiang, Xingzhe Li, Mingwei Liu, Xilin Liu, Yuchi Ma, and Zibin Zheng. What to retrieve for effective retrieval-augmented code generation? an empirical study and beyond, 2025.
- \[70\] Le Deng, Xiaoxue Ren, Chao Ni, Ming Liang, David Lo, and Zhongxin Liu. Enhancing project-specific code completion by inferring internal api information. IEEE Transactions on Software Engineering, pages 1–17, 2025.
- \[71\] Junwei Liu, Yixuan Chen, Mingwei Liu, Xin Peng, and Yiling Lou. Stall+: Boosting llm-based repository-level code completion with static analysis, 2024.
- \[72\] Lakshya A Agrawal, Aditya Kanade, Navin Goyal, Shuvendu K. Lahiri, and Sriram K. Rajamani. Monitor-guided decoding of code lms with static analysis of repository context. In Proceedings of the 37th International Conference on Neural Information Processing Systems, NIPS ’23, Red Hook, NY, USA, 2023. Curran Associates Inc.
- \[73\] Yichen Li, Yun Peng, Yintong Huo, and Michael R. Lyu. Enhancing llm-based coding tools through native integration of ide-derived static context. In Proceedings of the 1st International Workshop on Large Language Models for Code, LLM4Code ’24, page 70–74, New York, NY, USA, 2024. Association for Computing Machinery.
- \[74\] Zhiyuan Pan, Xing Hu, Xin Xia, and Xiaohu Yang. Enhancing repository-level code generation with integrated contextual information, 2024.
- \[75\] Ajinkya Deshpande, Anmol Agarwal, Shashank Shet, Arun Iyer, Aditya Kanade, Ramakrishna Bairi, and Suresh Parthasarathy. Class-level code generation from natural language using iterative, tool-enhanced reasoning over repository, 2024.
- \[76\] Wei Cheng, Yuhan Wu, and Wei Hu. Dataflow-guided retrieval augmentation for repository-level code completion. In Lun-Wei Ku, Andre Martins, and Vivek Srikumar, editors, Proceedings of the 62nd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pages 7957–7977, Bangkok, Thailand, August 2024. Association for Computational Linguistics.
- \[77\] Kounianhua Du, Jizheng Chen, Renting Rui, Huacan Chai, Lingyue Fu, Wei Xia, Yasheng Wang, Ruiming Tang, Yong Yu, and Weinan Zhang. Codegrag: Bridging the gap between natural language and programming language via graphical retrieval augmented generation, 2025.
- \[78\] Wei Liu, Ailun Yu, Daoguang Zan, Bo Shen, Wei Zhang, Haiyan Zhao, Zhi Jin, and Qianxiang Wang. Graphcoder: Enhancing repository-level code completion via coarse-to-fine retrieval based on code context graph. In Proceedings of the 39th IEEE/ACM International Conference on Automated Software Engineering, ASE ’24, page 570–581, New York, NY, USA, 2024. Association for Computing Machinery.
- \[79\] Xiaohan Chen, Zhongying Pan, Quan Feng, Yu Tian, Shuqun Yang, Mengru Wang, Lina Gong, Yuxia Geng, Piji Li, and Xiang Chen. Saracoder: Orchestrating semantic and structural cues for profit-oriented repository-level code completion, 2025.
- \[80\] Iman Saberi and Fatemeh Fard. Context-augmented code generation using programming knowledge graphs. arXiv preprint arXiv:2410.18251, 2024.
- \[81\] Zhanming Guan, Junlin Liu, Jierui Liu, Chao Peng, Dexin Liu, Ningyuan Sun, Bo Jiang, Wenchao Li, Jie Liu, and Hang Zhu. Contextmodule: Improving code completion via repository-level contextual information. arXiv preprint arXiv:2412.08063, 2024.
- \[82\] Boyang Yang, Haoye Tian, Jiadong Ren, Shunfu Jin, Yang Liu, Feng Liu, and Bach Le. Enhancing repository-level software repair via repository-aware knowledge graphs, 2025.
- \[83\] Samuel Abedu, SayedHassan Khatoonabadi, and Emad Shihab. Synergizing llms and knowledge graphs: A novel approach to software repository-related question answering, 2024.
- \[84\] Zimin Chen, Yue Pan, Siyu Lu, Jiayi Xu, Claire Le Goues, Martin Monperrus, and He Ye. Prometheus: Unified knowledge graphs for issue resolution in multilingual codebases, 2025.
- \[85\] Huy N. Phan, Hoang N. Phan, Tien N. Nguyen, and Nghi D. Q. Bui. Repohyper: Search-expand-refine on semantic graphs for repository-level code completion. In 2025 IEEE/ACM Second International Conference on AI Foundation Models and Software Engineering (Forge), pages 14–25, 2025.
- \[86\] Yuntong Zhang, Haifeng Ruan, Zhiyu Fan, and Abhik Roychoudhury. Autocoderover: Autonomous program improvement. In Proceedings of the 33rd ACM SIGSOFT International Symposium on Software Testing and Analysis, ISSTA 2024, page 1592–1604, New York, NY, USA, 2024. Association for Computing Machinery.
- \[87\] Yingwei Ma, Qingping Yang, Rongyu Cao, Binhua Li, Fei Huang, and Yongbin Li. Alibaba lingmaagent: Improving automated issue resolution via comprehensive repository exploration. In Proceedings of the 33rd ACM International Conference on the Foundations of Software Engineering, FSE Companion ’25, page 238–249, New York, NY, USA, 2025. Association for Computing Machinery.
- \[88\] Zhangqian Bi, Yao Wan, Zheng Wang, Hongyu Zhang, Batu Guan, Fangxin Lu, Zili Zhang, Yulei Sui, Hai Jin, and Xuanhua Shi. Iterative refinement of project-level code context for precise code generation with compiler feedback. In Lun-Wei Ku, Andre Martins, and Vivek Srikumar, editors, Findings of the Association for Computational Linguistics: ACL 2024, pages 2336–2353, Bangkok, Thailand, August 2024. Association for Computational Linguistics.
- \[89\] Shuyin Ouyang, Jie M. Zhang, Zeyu Sun, and Albert Merono Penuela. Knowledge-enhanced program repair for data science code. In 2025 IEEE/ACM 47th International Conference on Software Engineering (ICSE), pages 898–910, 2025.
- \[90\] Yang Liu, Li Zhang, Fang Liu, Zhuohang Wang, Donglin Wei, Zhishuo Yang, Kechi Zhang, Jia Li, and Lin Shi. Enhancing repository-level code generation with call chain-aware multi-view context, 2025.
- \[91\] Yangruibo Ding, Zijian Wang, Wasi Ahmad, Murali Krishna Ramanathan, Ramesh Nallapati, Parminder Bhatia, Dan Roth, and Bing Xiang. CoCoMIC: Code completion by jointly modeling in-file and cross-file context. In Nicoletta Calzolari, Min-Yen Kan, Veronique Hoste, Alessandro Lenci, Sakriani Sakti, and Nianwen Xue, editors, Proceedings of the 2024 Joint International Conference on Computational Linguistics, Language Resources and Evaluation (LREC-COLING 2024), pages 3433–3445, Torino, Italia, May 2024. ELRA and ICCL.
- \[92\] Jia Li, Xianjie Shi, Kechi Zhang, Lei Li, Ge Li, Zhengwei Tao, Jia Li, Fang Liu, Chongyang Tao, and Zhi Jin. Coderag: Supportive code retrieval on bigraph for real-world code generation, 2025.
- \[93\] Hongyuan Tao, Ying Zhang, Zhenhao Tang, Hongen Peng, Xukun Zhu, Bingchang Liu, Yingguang Yang, Ziyin Zhang, Zhaogui Xu, Haipeng Zhang, Linchao Zhu, Rui Wang, Hang Yu, Jianguo Li, and Peng Di. Code graph model (cgm): A graph-integrated large language model for repository-level software engineering tasks, 2025.
- \[94\] Zhaoling Chen, Robert Tang, Gangda Deng, Fang Wu, Jialong Wu, Zhiwei Jiang, Viktor Prasanna, Arman Cohan, and Xingyao Wang. LocAgent: Graph-guided LLM agents for code localization. In Wanxiang Che, Joyce Nabende, Ekaterina Shutova, and Mohammad Taher Pilehvar, editors, Proceedings of the 63rd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pages 8697–8727, Vienna, Austria, July 2025. Association for Computational Linguistics.
- \[95\] Zhonghao Jiang, Xiaoxue Ren, Meng Yan, Wei Jiang, Yong Li, and Zhongxin Liu. Cosil: Software issue localization via llm-driven code repository graph searching, 2025.
- \[96\] David Sounthiraraj, Jared Hancock, Yassin Kortam, Ashok Javvaji, Prabhat Singh, and Shaila Shankar. Code-craft: Hierarchical graph-based code summarization for enhanced context retrieval, 2025.
- \[97\] Zhijie Jiang, Zejian Shi, Xinyu Gao, and Yun Xiong. Enhancing code generation through retrieval of cross-lingual semantic graphs. In 2024 31st Asia-Pacific Software Engineering Conference (APSEC), pages 151–160, 2024.
- \[98\] Xunzhu Tang, Jiechao Gao, Jin Xu, Tiezhu Sun, Yewei Song, Saad Ezzini, Wendkûuni C. Ouédraogo, Jacques Klein, and Tegawendé F. Bissyandé. SynFix: Dependency-aware program repair via RelationGraph analysis. In Wanxiang Che, Joyce Nabende, Ekaterina Shutova, and Mohammad Taher Pilehvar, editors, Findings of the Association for Computational Linguistics: ACL 2025, pages 4878–4894, Vienna, Austria, July 2025. Association for Computational Linguistics.
- \[99\] S. E. Robertson and S. Walker. Some simple effective approximations to the 2-poisson model for probabilistic weighted retrieval. In Bruce W. Croft and C. J. van Rijsbergen, editors, SIGIR ’94, pages 232–241, London, 1994. Springer London.
- \[100\] Paul Jaccard. Etude de la distribution florale dans une portion des alpes et du jura. Bulletin de la Societe Vaudoise des Sciences Naturelles, 37:547–579, 01 1901.
- \[101\] Daya Guo, Shuo Ren, Shuai Lu, Zhangyin Feng, Duyu Tang, Shujie LIU, Long Zhou, Nan Duan, Alexey Svyatkovskiy, Shengyu Fu, Michele Tufano, Shao Kun Deng, Colin Clement, Dawn Drain, Neel Sundaresan, Jian Yin, Daxin Jiang, and Ming Zhou. Graphcode{bert}: Pre-training code representations with data flow. In International Conference on Learning Representations, 2021.
- \[102\] Daya Guo, Shuai Lu, Nan Duan, Yanlin Wang, Ming Zhou, and Jian Yin. UniXcoder: Unified cross-modal pre-training for code representation. In Smaranda Muresan, Preslav Nakov, and Aline Villavicencio, editors, Proceedings of the 60th Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pages 7212–7225, Dublin, Ireland, May 2022. Association for Computational Linguistics.
- \[103\] Lihong Li, Wei Chu, John Langford, and Robert E. Schapire. A contextual-bandit approach to personalized news article recommendation. In Proceedings of the 19th International Conference on World Wide Web, WWW ’10, page 661–670, New York, NY, USA, 2010. Association for Computing Machinery.
- \[104\] Xiangyan Liu, Bo Lan, Zhiyuan Hu, Yang Liu, Zhicheng Zhang, Fei Wang, Michael Qizhe Shieh, and Wenmeng Zhou. CodexGraph: Bridging large language models and code repositories via code graph databases. In Luis Chiruzzo, Alan Ritter, and Lu Wang, editors, Proceedings of the 2025 Conference of the Nations of the Americas Chapter of the Association for Computational Linguistics: Human Language Technologies (Volume 1: Long Papers), pages 142–160, Albuquerque, New Mexico, April 2025. Association for Computational Linguistics.
- \[105\] Ramakrishna Bairi, Atharv Sonwane, Aditya Kanade, Vageesh D. C., Arun Iyer, Suresh Parthasarathy, Sriram Rajamani, B. Ashok, and Shashank Shet. Codeplan: Repository-level coding using llms and planning. Proc. ACM Softw. Eng., 1(FSE), July 2024.
- \[106\] Mihir Athale and Vishal Vaddina. Knowledge graph based repository-level code generation. In 2025 IEEE/ACM International Workshop on Large Language Models for Code (LLM4Code), page 169–176. IEEE, May 2025.
- \[107\] Han Li, Yuling Shi, Shaoxin Lin, Xiaodong Gu, Heng Lian, Xin Wang, Yantao Jia, Tao Huang, and Qianxiang Wang. Swe-debate: Competitive multi-agent debate for software issue resolution, 2025.
- \[108\] Silin Chen, Shaoxin Lin, Xiaodong Gu, Yuling Shi, Heng Lian, Longfei Yun, Dong Chen, Weiguo Sun, Lin Cao, and Qianxiang Wang. Swe-exp: Experience-driven software issue resolution, 2025.
- \[109\] Bo Lin, Shangwen Wang, Yihao Qin, Liqian Chen, and Xiaoguang Mao. Give llms a security course: Securing retrieval-augmented code generation via knowledge injection, 2025.
- \[110\] Catherine Tony, Emanuele Iannone, and Riccardo Scandariato. Retrieve, refine, or both? using task-specific guidelines for secure python code generation, 2025. manuscript available at [https://emaiannone.github.io/assets/pdf/c6.pdf](https://emaiannone.github.io/assets/pdf/c6.pdf).
- \[111\] Yunda Tsai, Mingjie Liu, and Haoxing Ren. Rtlfixer: Automatically fixing rtl syntax errors with large language model. In Proceedings of the 61st ACM/IEEE Design Automation Conference, DAC ’24, New York, NY, USA, 2024. Association for Computing Machinery.
- \[112\] Chalamalasetti Kranti, Sherzod Hakimov, and David Schlangen. Retrieval-augmented code generation for situated action generation: A case study on Minecraft. In Yaser Al-Onaizan, Mohit Bansal, and Yun-Nung Chen, editors, Findings of the Association for Computational Linguistics: EMNLP 2024, pages 11159–11170, Miami, Florida, USA, November 2024. Association for Computational Linguistics.
- \[113\] YIBO PENG, Zora Zhiruo Wang, and Daniel Fried. Can long-context language models solve repository-level code generation? In LTI Student Research Symposium 2025, 2025.
- \[114\] Mingwei Liu, Tianyong Yang, Yiling Lou, Xueying Du, Ying Wang, and Xin Peng. Codegen4libs: A two-stage approach for library-oriented code generation. In 2023 38th IEEE/ACM International Conference on Automated Software Engineering (ASE), pages 434–445, 2023.
- \[115\] Jingyi Chen, Songqiang Chen, Jialun Cao, Jiasi Shen, and Shing-Chi Cheung. When llms meet api documentation: Can retrieval augmentation aid code generation just as it helps developers?, 2025.
- \[116\] Zezhou Yang, Sirong Chen, Cuiyun Gao, Zhenhao Li, Xing Hu, Kui Liu, and Xin Xia. An empirical study of retrieval-augmented code generation: Challenges and opportunities. ACM Trans. Softw. Eng. Methodol., 34(7), August 2025.
- \[117\] Marko Hostnik and Marko Robnik-Šikonja. Retrieval-augmented code completion for local projects using large language models. Expert Systems with Applications, 292:128596, 2025.
- \[118\] Mingjian Jiang, Yangjun Ruan, Luis Lastras, Pavan Kapanipathi, and Tatsunori Hashimoto. Putting it all into context: Simplifying agents with lclms, 2025.
- \[119\] Amirkia Rafiei Oskooei, Selcan Yukcu, Mehmet Cevheri Bozoglan, and Mehmet S. Aktas. Repository-level code understanding by llms via hierarchical summarization: Improving code search and bug localization. In Osvaldo Gervasi, Beniamino Murgante, Chiara Garau, Yeliz Karaca, Maria Noelia Faginas Lago, Francesco Scorza, and Ana Cristina Braga, editors, Computational Science and Its Applications – ICCSA 2025 Workshops, pages 88–105, Cham, 2026. Springer Nature Switzerland.
- \[120\] Zexiong Ma, Chao Peng, Pengfei Gao, Xiangxin Meng, Yanzhen Zou, and Bing Xie. SoRFT: Issue resolving with subtask-oriented reinforced fine-tuning. In Wanxiang Che, Joyce Nabende, Ekaterina Shutova, and Mohammad Taher Pilehvar, editors, Proceedings of the 63rd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pages 11427–11441, Vienna, Austria, July 2025. Association for Computational Linguistics.
- \[121\] Jia Li, Hao Zhu, Huanyu Liu, Xianjie Shi, He Zong, Yihong Dong, Kechi Zhang, Siyuan Jiang, Zhi Jin, and Ge Li. aixcoder-7b-v2: Training llms to fully utilize the long context in repository-level code completion, 2025.
- \[122\] Andrew Blinn, Xiang Li, June Hyung Kim, and Cyrus Omar. Statically contextualizing large language models with typed holes. Proc. ACM Program. Lang., 8(OOPSLA2), October 2024.
- \[123\] Zezhou Yang, Ting Peng, Cuiyun Gao, Chaozheng Wang, Hailiang Huang, and Yuetang Deng. A deep dive into retrieval-augmented generation for code completion: Experience on wechat, 2025.
- \[124\] Chaozheng Wang, Zezhou Yang, Shuzheng Gao, Cuiyun Gao, Ting Peng, Hailiang Huang, Yuetang Deng, and Michael Lyu. Rag or fine-tuning? a comparative study on lcms-based code completion in industry. In Proceedings of the 33rd ACM International Conference on the Foundations of Software Engineering, FSE Companion ’25, page 93–104, New York, NY, USA, 2025. Association for Computing Machinery.
- \[125\] Maksim Sapronov and Evgeniy Glukhov. On pretraining for project-level code completion. In ICLR 2025 Third Workshop on Deep Learning for Code, 2025.
- \[126\] Matthew Jin, Syed Shahriar, Michele Tufano, Xin Shi, Shuai Lu, Neel Sundaresan, and Alexey Svyatkovskiy. Inferfix: End-to-end program repair with llms. In Proceedings of the 31st ACM Joint European Software Engineering Conference and Symposium on the Foundations of Software Engineering, ESEC/FSE 2023, page 1646–1656, New York, NY, USA, 2023. Association for Computing Machinery.
- \[127\] Xinze Li, Hanbin Wang, Zhenghao Liu, Shi Yu, Shuo Wang, Yukun Yan, Yukai Fu, Yu Gu, and Ge Yu. Building a coding assistant via the retrieval-augmented language model. ACM Trans. Inf. Syst., 43(2), January 2025.
- \[128\] Revanth Gangi Reddy, Tarun Suresh, JaeHyeok Doo, Ye Liu, Xuan Phi Nguyen, Yingbo Zhou, Semih Yavuz, Caiming Xiong, Heng Ji, and Shafiq Joty. Swerank: Software issue localization with code ranking, 2025.
- \[129\] Ye Liu, Rui Meng, Shafiq Joty, silvio savarese, Caiming Xiong, Yingbo Zhou, and Semih Yavuz. CodeXEmbed: A generalist embedding model family for multilingual and multi-task code retrieval. In Second Conference on Language Modeling, 2025.
- \[130\] Di Wu, Wasi Uddin Ahmad, Dejiao Zhang, Murali Krishna Ramanathan, and Xiaofei Ma. Repoformer: selective retrieval for repository-level code completion. In Proceedings of the 41st International Conference on Machine Learning, ICML’24. JMLR.org, 2024.
- \[131\] Disha Shrivastava, Denis Kocetkov, Harm de Vries, Dzmitry Bahdanau, and Torsten Scholak. Repofusion: Training code models to understand your repository, 2023.
- \[132\] Hitesh Sagtani, Rishabh Mehrotra, and Beyang Liu. Improving fim code completions via context & curriculum based learning. In Proceedings of the Eighteenth ACM International Conference on Web Search and Data Mining, WSDM ’25, page 801–810, New York, NY, USA, 2025. Association for Computing Machinery.
- \[133\] Xinran Yu, Chun Li, Minxue Pan, and Xuandong Li. Droidcoder: Enhanced android code completion with context-enriched retrieval-augmented generation. In Proceedings of the 39th IEEE/ACM International Conference on Automated Software Engineering, ASE ’24, page 681–693, New York, NY, USA, 2024. Association for Computing Machinery.
- \[134\] Peiyang Wu, Nan Guo, Junliang Lv, Xiao Xiao, and Xiaochun Ye. Rtlrepocoder: Repository-level rtl code completion through the combination of fine-tuning and retrieval augmentation, 2025.
- \[135\] Yanlin Wang, Yanli Wang, Daya Guo, Jiachi Chen, Ruikai Zhang, Yuchi Ma, and Zibin Zheng. RLCoder: Reinforcement Learning for Repository-Level Code Completion . In 2025 IEEE/ACM 47th International Conference on Software Engineering (ICSE), pages 1140–1152, Los Alamitos, CA, USA, May 2025. IEEE Computer Society.
- \[136\] Xiaoxi Li, Jiajie Jin, Guanting Dong, Hongjin Qian, Yutao Zhu, Yongkang Wu, Ji-Rong Wen, and Zhicheng Dou. Webthinker: Empowering large reasoning models with deep research capability, 2025.
- \[137\] Shyam Sundar Kannan, Vishnunandan L. N. Venkatesh, and Byung-Cheol Min. Smart-llm: Smart multi-agent robot task planning using large language models. In 2024 IEEE/RSJ International Conference on Intelligent Robots and Systems (IROS), pages 12140–12147, 2024.
- \[138\] Sirui Hong, Mingchen Zhuge, Jonathan Chen, Xiawu Zheng, Yuheng Cheng, Jinlin Wang, Ceyao Zhang, Zili Wang, Steven Ka Shing Yau, Zijuan Lin, Liyang Zhou, Chenyu Ran, Lingfeng Xiao, Chenglin Wu, and Jürgen Schmidhuber. MetaGPT: Meta programming for a multi-agent collaborative framework. In The Twelfth International Conference on Learning Representations, 2024.
- \[139\] Alireza Ghafarollahi and Markus J. Buehler. Sciagents: Automating scientific discovery through multi-agent intelligent graph reasoning, 2024.
- \[140\] Zhe Zhang, Xingyu Liu, Yuanzhang Lin, Xiang Gao, Hailong Sun, and Yuan Yuan. Llm-based unit test generation via property retrieval, 2024.
- \[141\] Xingyao Wang, Boxuan Li, Yufan Song, Frank F. Xu, Xiangru Tang, Mingchen Zhuge, Jiayi Pan, Yueqi Song, Bowen Li, Jaskirat Singh, Hoang H. Tran, Fuqiang Li, Ren Ma, Mingzhang Zheng, Bill Qian, Yanjun Shao, Niklas Muennighoff, Yizhe Zhang, Binyuan Hui, Junyang Lin, Robert Brennan, Hao Peng, Heng Ji, and Graham Neubig. Openhands: An open platform for AI software developers as generalist agents. In The Thirteenth International Conference on Learning Representations, 2025.
- \[142\] Chunqiu Steven Xia, Yinlin Deng, Soren Dunn, and Lingming Zhang. Demystifying llm-based software engineering agents. Proc. ACM Softw. Eng., 2(FSE), June 2025.
- \[143\] Mark Chen, Jerry Tworek, Heewoo Jun, Qiming Yuan, Henrique Ponde De Oliveira Pinto, Jared Kaplan, Harri Edwards, Yuri Burda, Nicholas Joseph, Greg Brockman, et al. Evaluating large language models trained on code. arXiv preprint arXiv:2107.03374, 2021.
- \[144\] Jacob Austin, Augustus Odena, Maxwell Nye, Maarten Bosma, Henryk Michalewski, David Dohan, Ellen Jiang, Carrie Cai, Michael Terry, Quoc Le, and Charles Sutton. Program synthesis with large language models, 2021.
- \[145\] Pengcheng Yin, Bowen Deng, Edgar Chen, Bogdan Vasilescu, and Graham Neubig. Learning to mine aligned code and natural language pairs from stack overflow. In International Conference on Mining Software Repositories, MSR, pages 476–486. ACM, 2018.
- \[146\] Berkay Berabi, Jingxuan He, Veselin Raychev, and Martin T. Vechev. Tfix: Learning to fix coding errors with a text-to-text transformer. In ICML, 2021.
- \[147\] Tianyang Liu, Canwen Xu, and Julian McAuley. Repobench: Benchmarking repository-level code auto-completion systems. In The Twelfth International Conference on Learning Representations, 2024.
- \[148\] Yangruibo Ding, Zijian Wang, Wasi Uddin Ahmad, Hantian Ding, Ming Tan, Nihal Jain, Murali Krishna Ramanathan, Ramesh Nallapati, Parminder Bhatia, Dan Roth, and Bing Xiang. Crosscodeeval: a diverse and multilingual benchmark for cross-file code completion. In Proceedings of the 37th International Conference on Neural Information Processing Systems, NIPS ’23, Red Hook, NY, USA, 2023. Curran Associates Inc.
- \[149\] Hao Yu, Bo Shen, Dezhi Ran, Jiaxin Zhang, Qi Zhang, Yuchi Ma, Guangtai Liang, Ying Li, Qianxiang Wang, and Tao Xie. Codereval: A benchmark of pragmatic code generation with generative pre-trained models. In Proceedings of the IEEE/ACM 46th International Conference on Software Engineering, ICSE ’24, New York, NY, USA, 2024. Association for Computing Machinery.
- \[150\] Jia Li, Ge Li, Yunfei Zhao, Yongmin Li, Huanyu Liu, Hao Zhu, Lecheng Wang, Kaibo Liu, Zheng Fang, Lanshen Wang, Jiazheng Ding, Xuanming Zhang, Yuqi Zhu, Yihong Dong, Zhi Jin, Binhua Li, Fei Huang, Yongbin Li, Bin Gu, and Mengfei Yang. DevEval: A manually-annotated code generation benchmark aligned with real-world code repositories. In Lun-Wei Ku, Andre Martins, and Vivek Srikumar, editors, Findings of the Association for Computational Linguistics: ACL 2024, pages 3603–3614, Bangkok, Thailand, August 2024. Association for Computational Linguistics.
- \[151\] Jia Li, Ge Li, Xuanming Zhang, Yunfei Zhao, Yihong Dong, Zhi Jin, Binhua Li, Fei Huang, and Yongbin Li. Evocodebench: an evolving code generation benchmark with domain-specific evaluations. In Proceedings of the 38th International Conference on Neural Information Processing Systems, NIPS ’24, Red Hook, NY, USA, 2025. Curran Associates Inc.
- \[152\] Egor Bogomolov, Aleksandra Eliseeva, Timur Galimzyanov, Evgeniy Glukhov, Anton Shapkin, Maria Tigina, Yaroslav Golubev, Alexander Kovrigin, Arie van Deursen, Maliheh Izadi, and Timofey Bryksin. Long code arena: a set of benchmarks for long-context code models, 2024.
- \[153\] Aider Team. Aider polyglot leaderboard. [https://aider.chat/docs/leaderboards/](https://aider.chat/docs/leaderboards/), 2024. Accessed: 2025-08-21.
- \[154\] Naman Jain, King Han, Alex Gu, Wen-Ding Li, Fanjia Yan, Tianjun Zhang, Sida Wang, Armando Solar-Lezama, Koushik Sen, and Ion Stoica. Livecodebench: Holistic and contamination free evaluation of large language models for code. In The Thirteenth International Conference on Learning Representations, 2025.
- \[155\] Shuai Lu, Daya Guo, Shuo Ren, Junjie Huang, Alexey Svyatkovskiy, Ambrosio Blanco, Colin Clement, Dawn Drain, Daxin Jiang, Duyu Tang, Ge Li, Lidong Zhou, Linjun Shou, Long Zhou, Michele Tufano, MING GONG, Ming Zhou, Nan Duan, Neel Sundaresan, Shao Kun Deng, Shengyu Fu, and Shujie LIU. CodeXGLUE: A machine learning benchmark dataset for code understanding and generation. In Thirty-fifth Conference on Neural Information Processing Systems Datasets and Benchmarks Track (Round 1), 2021.
- \[156\] John Yang, Carlos E Jimenez, Alex L Zhang, Kilian Lieret, Joyce Yang, Xindi Wu, Ori Press, Niklas Muennighoff, Gabriel Synnaeve, Karthik R Narasimhan, Diyi Yang, Sida Wang, and Ofir Press. SWE-bench multimodal: Do AI systems generalize to visual software domains? In The Thirteenth International Conference on Learning Representations, 2025.
- \[157\] Qiming Zhu, Jialun Cao, Xuanang Chen, Yaojie Lu, Hongyu Lin, Xianpei Han, Le Sun, and Shing-Chi Cheung. Across programming language silos: A study on cross-lingual retrieval-augmented code generation, 2025.
- \[158\] Yue Wang, Weishi Wang, Shafiq Joty, and Steven C.H. Hoi. CodeT5: Identifier-aware unified pre-trained encoder-decoder models for code understanding and generation. In Marie-Francine Moens, Xuanjing Huang, Lucia Specia, and Scott Wen-tau Yih, editors, Proceedings of the 2021 Conference on Empirical Methods in Natural Language Processing, pages 8696–8708, Online and Punta Cana, Dominican Republic, November 2021. Association for Computational Linguistics.
- \[159\] Voyage AI. voyage-code-3: more accurate code retrieval with lower dimensional, quantized embeddings. [https://blog.voyageai.com/2024/12/04/voyage-code-3/](https://blog.voyageai.com/2024/12/04/voyage-code-3/), December 2024. Voyage AI blog post.
- \[160\] Dun Zhang, Jiacheng Li, Ziyang Zeng, and Fulong Wang. Jasper and stella: distillation of sota embedding models. arXiv preprint arXiv:2412.19048, 2024.
- \[161\] Zhangyin Feng, Daya Guo, Duyu Tang, Nan Duan, Xiaocheng Feng, Ming Gong, Linjun Shou, Bing Qin, Ting Liu, Daxin Jiang, et al. Codebert: A pre-trained model for programming and natural languages. arXiv preprint arXiv:2002.08155, 2020.
- \[162\] OpenAI. text-embedding-ada-002. [https://platform.openai.com/docs/models/text-embedding-ada-002](https://platform.openai.com/docs/models/text-embedding-ada-002), August 2025. OpenAI API documentation.
- \[163\] Stephen E. Robertson, Steve Walker, Susan Jones, Micheline M. Hancock-Beaulieu, and Mike Gatford. Okapi at trec-3. Proceedings of the Third Text REtrieval Conference (TREC-3), pages 109–126, 1995.
- \[164\] Paul Jaccard. Comparative study of the floral distribution in a portion of the alps and the jura. Bulletin of the Vaud Society of Natural Sciences, 37:547–579, 1901.
- \[165\] Erik Nijkamp, Bo Pang, Hiroaki Hayashi, Lifu Tu, Huan Wang, Yingbo Zhou, Silvio Savarese, and Caiming Xiong. Codegen: An open large language model for code with multi-turn program synthesis. ICLR, 2023.
- \[166\] Erik Nijkamp, Hiroaki Hayashi, Caiming Xiong, Silvio Savarese, and Yingbo Zhou. Codegen2: Lessons for training llms on programming and natural languages. ICLR, 2023.
- \[167\] Loubna Ben Allal, Raymond Li, Denis Kocetkov, Chenghao Mou, Christopher Akiki, Carlos Munoz Ferrandis, Niklas Muennighoff, Mayank Mishra, Alex Gu, Manan Dey, et al. Santacoder: don’t reach for the stars! arXiv preprint arXiv:2301.03988, 2023.
- \[168\] Raymond Li, Loubna Ben Allal, Yangtian Zi, Niklas Muennighoff, Denis Kocetkov, Chenghao Mou, Marc Marone, Christopher Akiki, Jia Li, Jenny Chim, et al. Starcoder: may the source be with you! arXiv preprint arXiv:2305.06161, 2023.
- \[169\] Anton Lozhkov, Raymond Li, Loubna Ben Allal, Federico Cassano, Joel Lamy-Poirier, Nouamane Tazi, Ao Tang, Dmytro Pykhtar, Jiawei Liu, Yuxiang Wei, et al. Starcoder 2 and the stack v2: The next generation. arXiv preprint arXiv:2402.19173, 2024.
- \[170\] Baptiste Roziere, Jonas Gehring, Fabian Gloeckle, Sten Sootla, Itai Gat, Xiaoqing Ellen Tan, Yossi Adi, Jingyu Liu, Romain Sauvestre, Tal Remez, et al. Code llama: Open foundation models for code. arXiv preprint arXiv:2308.12950, 2023.
- \[171\] Daya Guo, Qihao Zhu, Dejian Yang, Zhenda Xie, Kai Dong, Wentao Zhang, Guanting Chen, Xiao Bi, Yu Wu, YK Li, et al. Deepseek-coder: When the large language model meets programming–the rise of code intelligence. arXiv preprint arXiv:2401.14196, 2024.
- \[172\] DeepSeek-AI, Qihao Zhu, Daya Guo, Zhihong Shao, Dejian Yang, Peiyi Wang, Runxin Xu, Y. Wu, Yukun Li, Huazuo Gao, Shirong Ma, Wangding Zeng, Xiao Bi, Zihui Gu, Hanwei Xu, Damai Dai, Kai Dong, Liyue Zhang, Yishi Piao, Zhibin Gou, Zhenda Xie, Zhewen Hao, Bingxuan Wang, Junxiao Song, Deli Chen, Xin Xie, Kang Guan, Yuxiang You, Aixin Liu, Qiushi Du, Wenjun Gao, Xuan Lu, Qinyu Chen, Yaohui Wang, Chengqi Deng, Jiashi Li, Chenggang Zhao, Chong Ruan, Fuli Luo, and Wenfeng Liang. Deepseek-coder-v2: Breaking the barrier of closed-source models in code intelligence, 2024.
- \[173\] Jinze Bai, Shuai Bai, Yunfei Chu, Zeyu Cui, Kai Dang, Xiaodong Deng, Yang Fan, Wenbin Ge, Yu Han, Fei Huang, Binyuan Hui, Luo Ji, Mei Li, Junyang Lin, Runji Lin, Dayiheng Liu, Gao Liu, Chengqiang Lu, Keming Lu, Jianxin Ma, Rui Men, Xingzhang Ren, Xuancheng Ren, Chuanqi Tan, Sinan Tan, Jianhong Tu, Peng Wang, Shijie Wang, Wei Wang, Shengguang Wu, Benfeng Xu, Jin Xu, An Yang, Hao Yang, Jian Yang, Shusheng Yang, Yang Yao, Bowen Yu, Hongyi Yuan, Zheng Yuan, Jianwei Zhang, Xingxuan Zhang, Yichang Zhang, Zhenru Zhang, Chang Zhou, Jingren Zhou, Xiaohuan Zhou, and Tianhang Zhu. Qwen technical report. arXiv preprint arXiv:2309.16609, 2023.
- \[174\] Binyuan Hui, Jian Yang, Zeyu Cui, Jiaxi Yang, Dayiheng Liu, Lei Zhang, Tianyu Liu, Jiajun Zhang, Bowen Yu, Keming Lu, et al. Qwen2. 5-coder technical report. arXiv preprint arXiv:2409.12186, 2024.

Generated on Mon Oct 6 15:18:56 2025 by [LaTeXML](http://dlmf.nist.gov/LaTeXML/)
