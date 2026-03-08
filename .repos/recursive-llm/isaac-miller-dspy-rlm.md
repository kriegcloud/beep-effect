# DSPy is the easiest way to use RLMs

*Source: https://blog.isaacbmiller.com/posts/rlm*
*Author: Isaac Miller*

---

Many of us are familiar with the perils of [context rot](https://research.trychroma.com/context-rot). As our contexts grow, LLM performance drops significantly for many types of tasks. For agentic and exploration tasks this is particularly problematic, as our context grows the longer the agent works.

[Recursive Language Models](https://alexzhang13.github.io/blog/2025/rlm/), a new strategy developed by Alex Zhang and Omar Khattab, addresses the context rot problem by providing LLMs with a separate environment to store information (in this case, a Python instance), from which the LLM can dynamically load context into the token space as needed. This environment is persisted and shared among subagents, allowing the LLM to ask questions about and explore the information without loading it into its main context.

This simple harness – a shared environment where LLMs can recursively interact with input context as variables – proves to be incredibly effective when dealing with very large inputs. We've used RLMs to summarize hundreds of megabytes of logs, perform coding tasks across massive multi-project codebases, and source evidence across a large collection of books.

We have implemented the RLM pattern in DSPy, allowing you to quickly and easily try RLMs with your existing DSPy programs or with new tasks. Today we're going to walk through how RLMs work, to establish a mental model for when and how might want to apply them, then get you up and running with an example in DSPy.

## RLMs Manage Two Buckets of Context

RLMs work by providing an LLM with a REPL-like interface (think: a Jupyter Notebook), where they can explore, analyze, and load information by writing Python code. There is the **variable space** (the information stored in the REPL) and the **token space** (the context extracted from the variable space).

In a normal coding agent, you might provide the following context:

```
Your inputs are the following: Context: {LONG_context}, Other Inputs: {LONG_other_inputs}
```

If your inputs are suffiently long, you could already be triggering context rot. Or, if your context is really long, you might not even fit in the model's context window.

With an RLM, on the other hand, the following context is provided:

```
Your inputs are the following: Context, Other Inputs.

You can access them inside your repl as variables. The variables are `context` and `other_inputs` respectively.

Previews:
context: {context[:100]}
other_inputs: {other_inputs[:100]}
```

Then we would prompt the LLM to write code in whatever language you have implemented the REPL in, which for both Alex's and DSPy's implementations is Python.

Then you run the code, append the output to history, and repeat.

### Recursively Prompting LLMs in the REPL

The "Recursion" in "RLM" describes the LLM's ability to prompt itself, which we allow it to do in the REPL. This ability is exposed as a function.

In the case of dspy.RLM, we implement a single `sub_llm()` call. The main LLM can prepare a prompt and task a sub LLM with working on some information in the variable space. The results are returned in the variable space, as with any other function in a REPL, which the LLM can choose or choose not to tokenize.

Part of the beauty of this is that how the LLM splits up the work is undefined. Given a list of 10 long documents, the LLM could choose to split the work into 10 subcalls, or combine the work and parse the outputs, chunk sequentially, etc.

**This kinda sounds like Claude Code**, or the way most coding agents work. They fire off subagents to do work, then return the output to the main context. It's similar, but there's a crucial difference: **Claude Code, out of the box, doesn't save outputs to a variable space that it can manipulate.** For example, a Claude Code subagent returns a blob of text back into the context by default.

If Claude Code were to adopt a pattern where subagents write their results to files, we could consider this an RLM pattern.

And this turns out to be the difference maker. By providing the LLMs with a shared space to explore and store information outside the token space, RLMs unlock some incredible capabilities. Context rot is mitigated and tasks that can't fit into a single context window are suddenly addressable.

## DSPy is the Easiest Way to Try RLMs

By extending DSPy with the RLM based paradigm, we are able to increase the capabilities and enforce some structure onto the RLM call.

For example, dspy.RLM gets to take advantage of the structure of the provided [Signature](https://dspy.ai/learn/programming/signatures/). If your inputs include typed parameters or arbitrary data structures, that information is immediately provided to the RLM. When passing only strings, we find RLMs will spend the first few iterations just exploring the shape of the information. Signatures help us avoid this step.

Perhaps the best feature of dspy.RLM is that it works with all your existing Signatures. No need to tweak them, redesign your parameters, or issue special instructions. dspy.RLM is simply a new inference time strategy (just like Predict or ChainOfThought) that we can modularly swap in or out.

The only detail to note is RLMs require LLMs with strong reasoning and coding capabilities. The RLM strategy leverages the coding skills of larger models to solve long context problems – that's the unlock. **GPT-5 and Opus versions work great with RLMs**, though we continue to be surprised at how effective Kimi K2 is as well, despite its low cost and speed.

## An Example RLM with DSPy

Creating an RLM with DSPy is easy:

```python
signature = "logs, question -> answer"
rlm = dspy.RLM(signature)
result = rlm(
    logs = all_my_logs
    question = "Did anyone ask my agent about ice cream this week?"
)
```

The only line above that's specific to RLMs is `dspy.RLM`, which is the [Module](https://dspy.ai/learn/programming/modules/) we use instead of Predict, ChainOfThought, or ReAct.

When you call a program using the RLM module, DSPy creates and manages a local, isolated Python sandbox using [Deno](https://deno.com).

> You can install Deno with: `curl -fsSL https://deno.land/install.sh | sh`

Your inputs are loaded into this environment as variables and the LLM is given a prompt DSPy prepares.

### Class-based Signatures

dspy.RLM works perfectly well with class-based signatures:

```python
class CodebaseSubset(dspy.Signature):
    """
    Find all of the files from the provided codebase that would be helpful for understanding the given feature.
    """
    code_tree: dict = dspy.InputField()
    feature: str = dspy.InputField()
    relevant_filepaths: List[str] = dspy.OutputField

codebase_subsetter = dspy.RLM(CodebaseUnderstanding)
```

What's important to note here is that all the input variables – in this case `code_tree` and `feature` – are treated the same way.

If you've read about RLM and/or tried Alex's [library](https://github.com/alexzhang13/rlm), you may be used to the pattern where an RLM is set up with one very long context resource (loaded into the REPL, of course), that is then used to answer a given query. It's helpful to realize that we don't need to follow this pattern – one big context and one question – with dspy.RLM. **Every input can be large or small, it doesn't matter: they're all loaded into the REPL.**

### Tools and Budget Control

We can pass in Python functions as tools the LLM can call within the REPL:

```python
def web_search(search_term):
    # Web search stuff

def github_search(search_term):
    # Gh search stuff

codebase_subsetter = dspy.RLM(
    CodebaseUnderstanding,
    tools = [web_search, github_search]
)
```

For harder problems, RLMs can run for quite awhile. We have two levers for budget:

- **max_iterations**: How many turns (reasoning + REPL call) the RLM gets. Default is 10, but 5 works for many tasks.
- **max_llm_calls**: How many sub-LLM calls the main RLM can fire off from the REPL (can be many per turn).

You can also specify a different (cheaper) LLM for sub-calls:

```python
codebase_subsetter = dspy.RLM(
    CodebaseUnderstanding,
    tools = [web_search, github_search],
    max_iterations = 5,
    max_llm_calls = 20,
    sub_lm = gpt_5_mini
)
```

### Optimization

dspy.RLM can be optimized like any other DSPy program. Behind the scenes, it's handled similarly to dspy.ReAct: tool descriptions and signature instructions are compiled together into an instruction block that is then optimized with GEPA, MiPRO, or whatever.

## Use Cases for RLMs

The main use case for an RLM is **tasks that require reasoning across long contexts**. Five problem shapes where RLMs shine:

### 1. Needle in a Haystack
Given a large set of documents, an RLM can search through to find documents that fit given criteria:
- Fuzzily filtering data or logs from a certain app/service
- Finding outlier reviews in a large dataset
- Scanning for incorrect traces from an LLM service

### 2. Long Context Summarization/QA
Codebase QA is an easy target. Find all relevant files for a given feature — RLM can do grep-style operations plus harder things like AST parsing.

### 3. Multi-hop Reasoning
One of the primary benchmarks is Browsecomp — find a fact inside a corpus, then chain multiple facts together to answer the ultimate claim.

### 4. Clustering and Categorization
Given a long list of items, RLM can investigate and come up with clusters based on what it sees. Useful for analyzing user data — reviews, traces, conversation intent, etc.

### 5. Dynamic Symbolic Manipulation of Long Fuzzy Contexts
Emergent decomposition based on fuzzy properties. Example: extract dates from documents where the format/location varies — RLM can investigate all cases, come up with extraction formats, or use sub_llm to extract per-file.

---

*Also published on [cmpnd.ai](https://www.cmpnd.ai/blog/rlms-in-dspy.html)*
