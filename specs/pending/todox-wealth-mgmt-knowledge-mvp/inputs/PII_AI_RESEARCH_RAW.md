# PII + AI Research Excerpt (RAW, Verbatim)

**Spec**: `specs/pending/todox-wealth-mgmt-knowledge-mvp`  
**Status**: Source-of-truth (verbatim excerpt captured from chat)

This file is intended to contain the verbatim PII/AI research excerpt referenced by:
- `outputs/R15_PII_AI_ARCHITECTURE_RESEARCH_SUMMARY.md`

## Verbatim Excerpt

# AI agents operating on schemas without accessing raw data: The emerging architecture

The privacy-preserving AI query space has matured rapidly, with **production-ready solutions now deployed at major financial institutions and healthcare systems**. The core pattern—AI generates queries from schema metadata while a trusted executor handles real data—is implemented through data privacy vaults, semantic layers, and token abstraction frameworks. Companies like JPMorgan, Goldman Sachs, and Kaiser Permanente have deployed these architectures at scale, while vendors including Skyflow, Privacera, and Snowflake offer commercial platforms. Academic research validates the approach, with MaskSQL achieving **55.66% execution accuracy** on benchmarks using fully abstracted schemas.

## Commercial products enabling schema-driven AI queries

The market divides into distinct product categories addressing the AI-on-sensitive-data challenge. **Data privacy vaults** represent the most direct implementation of the schema-only pattern. Skyflow's architecture stores original PII in a vault and exposes only polymorphic tokens to LLMs—tokens that maintain referential integrity for queries but contain no sensitive values. The company reports LLM-related revenue grew from zero to approximately **30% of total revenue** after launching its GPT Privacy Vault in 2023, with customers including GoodRx and Hippocratic AI.

Protecto takes a similar approach with context-aware PII/PHI masking that preserves semantic meaning. Unlike generic redaction that destroys analytical utility, their tokenization maintains patterns LLMs need to generate accurate queries. Protegrity's AI Team Edition extends this to agentic workflows, applying "fit-for-purpose protection" directly within AI pipelines—the company secures over **10 trillion operations annually** at a single major financial institution.

**Semantic layer platforms** offer another production-ready path. Snowflake's Cortex Analyst provides natural language queries against semantic models rather than raw tables—LLMs query metrics, dimensions, and relationships without accessing underlying data. Databricks Unity Catalog provides equivalent functionality with YAML-defined semantic models and built-in governance. The dbt Semantic Layer achieved **83% accuracy** on natural language queries in internal tests versus approximately 40% with raw SQL, demonstrating that well-defined metrics dramatically improve LLM performance while maintaining data isolation.

**Data governance platforms** have evolved to include AI-specific controls. Cyera's AI Guardian—backed by **$1.7 billion in funding** at a $9 billion valuation—converges DSPM, DLP, and identity management with real-time monitoring of AI inputs and outputs. Privacera's PAIG (open source available) scans prompts and responses against governance policies, with 160+ pre-built classification rules and fine-grained access control at the data-item level.

## Architectural patterns separating AI generation from trusted execution

**MaskSQL** represents the canonical academic implementation of the pattern where AI never sees real values. The framework abstracts sensitive elements using bijective mappings: table names become T1, T2; column names become C1, C2; literal values become V1, V2. The LLM receives prompts like "How many T1 did the V1 T3 with C3 as V2?" and generates SQL using these placeholders. A local reconstruction layer maps abstract tokens back to real values before execution. The system achieves production-quality results while ensuring the LLM cannot infer original values from context.

Google's **MCP Toolbox for Databases** implements a "safe buttons" pattern where AI cannot generate arbitrary queries. Engineers define specific SQL statements with parameters in YAML configuration files. The AI can only select from pre-approved queries and provide parameter values—it cannot invent new SQL. This trades flexibility for security: every possible query is auditable in version control, and the LLM's role reduces to query selection and parameterization rather than generation.

The **Vanna framework** (21,600 GitHub stars) demonstrates production RAG-based text-to-SQL. The system trains on DDL statements, documentation, and example queries—never on actual data values. User identity flows through the entire stack, enabling row-level security filtering on executed queries. Vanna 2.0 adds lifecycle hooks for rate limiting, audit logging, and enterprise authentication integration.

**Sandboxed execution environments** address the complementary problem of running AI-generated code safely. E2B uses Firecracker microVMs with approximately 150ms startup times, completely isolating execution from host systems. Daytona achieves sub-90ms sandbox creation. Vercel's sandbox supports 45-minute execution windows. These platforms enable AI-generated SQL or Python to run against data without the AI having any mechanism to exfiltrate results—output flows only through controlled APIs.

The **placeholder/template pattern** appears in frameworks like FACTS, which generates reusable Jinja2 templates alongside SQL queries. The LLM produces a query template with placeholders; a trusted executor fills placeholders with real values and renders natural language responses. Masked-AI provides a simpler implementation: automatically detect PII in prompts, replace with tokens like `[NAME_1]` and `[IP_1]`, send masked text to the LLM, then unmask responses locally.

## Privacy-preserving computation technologies and their applicability

**Confidential computing** has reached production maturity for LLM inference with minimal performance impact. Stanford's Hazy Research demonstrated that for models with 10 billion or more parameters running on NVIDIA H100 GPUs with confidential computing enabled, latency overhead drops below **1% with less than 0.3% QPS impact**. Apple's Private Cloud Compute deploys this architecture at massive scale for Apple Intelligence—custom silicon servers process requests ephemerally in hardware-enforced secure enclaves with cryptographic erasure on every reboot. Apple publishes all production builds to a transparency log for independent security researcher verification.

**Differential privacy** provides mathematical privacy guarantees for model training and inference. Google's VaultGemma—a 1 billion parameter model trained from scratch with DP—shows no detectable memorization of training data. Research demonstrates that private fine-tuning of RoBERTa-Large achieves **87.8% accuracy with ε=6.7** versus 90.2% non-private, a modest utility cost for formal privacy guarantees. For RAG systems, per-document privacy filters enable multiple queries while blocking documents whose privacy budget is exhausted.

**Federated learning** enables model training across organizations without centralizing sensitive data. The FL-GLM framework specifically addresses LLM fine-tuning, using split learning where embedding and output layers train locally while other parameters offload to a central server. NVIDIA FLARE provides production-grade federated learning with high availability, secure provisioning, and dashboard monitoring. However, only **5.2% of federated learning research** has reached real-world deployment—significant infrastructure and coordination requirements limit adoption.

**Homomorphic encryption** offers the strongest theoretical guarantees—computing directly on encrypted data without decryption—but remains impractical for LLMs. Zama's work on encrypted GPT-2 forward passes achieves **96% accuracy at 4-bit quantization** for single attention heads, but full LLM inference remains "orders of magnitude slower" than plaintext. The company projects that dedicated hardware accelerators targeting 1,000x speedups may enable practical encrypted AI within five years.

**Synthetic data generation** complements schema-only approaches for development and testing. Differential privacy during generation provides mathematical guarantees that no real individuals exist in synthetic datasets. MOSTLY AI's TabularARGN model with built-in DP achieves 100x faster training than previous approaches. The Department of Homeland Security awarded contracts to MOSTLY AI, Datacebo, and Betterdata AI for synthetic data generation capabilities, validating enterprise demand.

## Academic research on blind and schema-only LLM modes

The MaskSQL paper (arXiv 2509.23459) provides the foundational research for schema-only text-to-SQL. Beyond the abstraction methodology, the authors introduce a "re-identification score" metric measuring whether LLMs can infer original values from contextual clues in abstracted prompts. This enables quantitative comparison of different privacy policies' effectiveness.

"Ask Safely" (arXiv 2512.04852) extends the approach to knowledge graphs. The framework extracts graph structure as schema metadata, builds dictionaries of sensitive values, trains NER systems to recognize sensitive entities, and provides LLMs only schema-level information. The paper emphasizes that "because the prompt includes only schema-level information rather than the entire graph, it remains compact and token-efficient"—privacy protection improves both security and performance.

Research on differential privacy for LLMs has accelerated substantially. The ICLR 2022 paper "Large Language Models Can Be Strong Differentially Private Learners" demonstrated that larger models are better suited for private fine-tuning—a counterintuitive finding given larger models have greater memorization capacity. Recent work on user-level DP fine-tuning introduces novel privacy accountants for computing tight guarantees, with experiments on models with hundreds of millions of parameters.

**PrivLM-Bench** from Amazon provides a multi-perspective privacy evaluation benchmark quantifying leakage through membership inference and training data extraction attacks. **PII-Bench** offers 2,842 test samples across 55 PII subcategories, finding that while current LLMs achieve strong basic PII detection (F1 greater than 0.90), they show "limited capability in determining query relevance"—they can find PII but struggle to determine which PII actually matters for a given query.

SafeGPT research (arXiv 2601.06366) demonstrates the necessity of two-sided guardrails. Neither input-side filtering (preventing sensitive data from reaching the LLM) nor output-side filtering (blocking leakage in responses) alone provides sufficient protection. The paper advocates graduated enforcement with blocking, warnings, and automatic redaction calibrated to sensitivity levels.

## How regulated industries deploy AI on sensitive data

**JPMorgan Chase** created LLM Suite, a proprietary portal providing 60,000+ employees access to external LLMs through controlled wrappers. After initially banning ChatGPT over data concerns, the bank built infrastructure ensuring customer data never trains external models. Chief Data & Analytics Officer Teresa Heitsenrether stated directly: "Since our data is a key differentiator, we don't want it being used to train the model." The bank runs **600+ AI use cases in production** including fraud prevention saving hundreds of millions annually and COIN, which processes 12,000 credit agreements in seconds.

**Goldman Sachs** deployed its GS AI Platform as a "firewalled" centralized gateway—a single point of entry enabling effective monitoring while protecting client data. The platform integrates GPT-4o, Gemini, and Claude within secure architecture, with rollout to 10,000 employees in early 2025 and company-wide expansion planned.

**Kaiser Permanente** operates the largest ambient AI deployment in U.S. healthcare: Abridge clinical documentation across 40 hospitals, 600+ medical offices, and 24,000+ physicians. Seven principles govern their implementation: patient consent required, data encrypted at all stages, clinicians review all AI-generated notes before EHR entry, rigorous quality assurance, testing across diverse populations, peer-reviewed evaluation methods, and policy leader engagement. The key phrase repeated throughout their materials: "Clinical decision is still in the hands of the physician, not the AI."

Healthcare-specific compliance adds layers beyond general data protection. OpenAI's healthcare offering (customers include HCA, Cedars-Sinai, Memorial Sloan Kettering) provides Business Associate Agreements, data residency options, customer-managed encryption keys, and explicit guarantees that content is not used to train models. HIPAA requires minimum necessary data access, audit trails, and risk assessments that must be updated as AI capabilities evolve.

Financial services compliance frameworks span GLBA for privacy notices, PCI-DSS for payment card protection, FCRA for credit data, and model risk management guidance from regulators. The EU AI Act begins enforcement in **August 2026**, requiring conformity assessments for high-risk AI systems—including many financial applications. ISO 42001 for AI Management Systems is becoming the de facto enterprise governance standard.

## Key implementation patterns and practical recommendations

The research reveals five dominant architectural approaches, each with distinct tradeoffs:

- **Data privacy vaults** (Skyflow, Protecto): Full isolation with tokenization; best for real-time inference where AI needs to generate personalized outputs
- **Semantic layers** (Snowflake Cortex, dbt, Databricks): Schema-driven queries against business metrics; best for analytics and BI use cases where questions map to defined metrics
- **Token abstraction** (MaskSQL pattern): Bijective mapping of sensitive elements; best for ad-hoc SQL generation where flexibility matters
- **Pre-defined tool boundaries** (MCP Toolbox): AI selects from approved queries only; best for high-security environments accepting reduced flexibility
- **Confidential computing** (Apple PCC, Azure H100): Hardware-enforced isolation with minimal overhead; best for model IP protection and highest-sensitivity inference

Organizations successfully deploying AI on sensitive data follow consistent patterns: centralized AI gateways providing single points of control, human-in-the-loop requirements for high-risk decisions, consent-first approaches for patient and customer data, comprehensive audit logging, and extensive piloting before scale deployment. The key insight across regulated industries is that organizations are not keeping AI away from sensitive data—they are building infrastructure that allows AI to work with sensitive data safely through isolation, transformation, and governance.
