# P0: Ontology Research

## Status

COMPLETE

## Objective

Survey 7 published OWL ontologies to extract class hierarchies, object properties, and reasoning constraints relevant to intellectual property law, and produce a class-to-node-type mapping for the 15 planned graph node types.

## Method and Source Resolution Notes

- Source-of-truth spec: `README.md` contract table (S1-S7).
- Local artifacts analyzed from retrieval cache: `/tmp/p0-ontologies`.
- S1 retrieved as LKIF module set (`expression.owl`, `legal-action.owl`, `legal-role.owl`, `norm.owl` plus import hub).
- S2 retrieved at `https://dmag.ac.upc.edu/ontologies/ipronto.owl` (the ALIS/IPRonto OWL artifact behind the CORDIS project reference).
- S3 retrieved from Rhizomik ontology endpoints and parsed as Turtle.
- S4 contract URL `legalontology/JudO` no longer resolves; equivalent JudO artifacts were obtained from `Marceci/JudO`.
- S5 contract URL (SSRN paper) is publication metadata, not a direct ontology file; due access limitations, `Judging_Contracts_Core.owl` from the same JudO corpus was used as the nearest machine-readable proxy for legal case reasoning classes.
- S6 ESTRELLA namespace resolved through Internet Archive snapshot of LKIF module URL.
- S7 WIPO publishes IPC as XML master files (not an OWL file in the retrieved artifact). It is still useful for hierarchy and edge extraction but has no OWL DL axioms (cardinality/disjointness/transitivity) in this representation.

---

### S1: LKIF-Core

- Source URL:
  - Contract: `https://github.com/RinkeHoekstra/lkif-core`
  - Retrieved modules: `s1-expression.owl`, `s1-legal-action.owl`, `s1-legal-role.owl`, `s1-norm.owl`
- OWL Dialect: OWL DL profile (LKIF-Core modules)
- Serialization Format: RDF/XML
- Top-level class hierarchy (depth 2-3):
  - `Legal_Source` -> `Legal_Document`, `Precedent`, `Proclamation`, `International_Agreement`, `Soft_Law`
  - `Legal_Document` -> `Contract`, `Directive`, `Regulation`, `Statute`, `Treaty`, `Code`, `Decree`
  - `Norm` -> `Permission`, `Right`
  - `Right` -> `Obligative_Right`, `Liberty_Right`, `Liability_Right`, `Potestative_Right`, `Permissive_Right`, `Exclusionary_Right`
  - `Legal_Person` -> `Private_Legal_Person`, `Public_Body`; `Private_Legal_Person` -> `Company`, `Corporation`, `Association`, `Society`
  - `Legal_Expression` -> `Evaluative_Expression`, `Potestative_Expression`, `Definitional_Expression`, `Qualificatory_Expression`, `Existential_Expression`
- Object properties (IP-relevant subset):
  - Normative qualification/permissions: `allows`, `allowed_by`, `disallows`, `disallowed_by`, `commands`, `commanded_by`
  - Expression/document linkage: `bears`, `medium`, `utters`, `utterer`, `states`, `stated_by`, `asserts`, `asserted_by`
  - Qualification/role linkage: `qualifies`, `qualified_by`, `plays`, `played_by`, `holds`, `held_by`
  - Comparative normative reasoning: `normatively_equivalent_or_better`, `normatively_equivalent_or_worse`, `normatively_strictly_better`, `normatively_strictly_worse`, `strictly_equivalent`
- Reasoning constraints:
  - Transitive properties declared: `normatively_equivalent_or_better`, `normatively_strictly_better`, `normatively_strictly_worse`, `strictly_equivalent`
  - Disjointness axioms include: `Public_Body` disjoint `Private_Legal_Person`; `Document` disjoint `Custom`; `Treaty` disjoint `Non-binding_International_Agreement`
  - Inverse/subproperty structures include: `allowed_by` inverseOf `allows`; `disallowed_by` inverseOf `disallows`; `commands` subPropertyOf `allows`
  - Cardinality: no explicit cardinality predicates found in extracted LKIF modules
- IP law relevance:
  - Provides upper legal abstractions for legal actors, norms, legal documents, and legal expressions that can anchor all IP-domain specializations.

### S2: IPRonto / ALIS

- Source URL:
  - Contract: `https://cordis.europa.eu/project/id/IST-2001-33174`
  - Retrieved OWL artifact: `https://dmag.ac.upc.edu/ontologies/ipronto.owl`
- OWL Dialect: OWL DL style ontology
- Serialization Format: RDF/XML
- Top-level class hierarchy (depth 2-3):
  - `LegalConcept` -> `LegalEntity`, `IntellectualProperty`, `IntellectualPropertyRight`, `ExclusiveRight`
  - `LegalEntity` -> `CorporateLegalEntity`, `NaturalLegalEntity`
  - `IntellectualPropertyRight` -> `Copyright`, `NeighbouringRight`, `ExceptionsRight`, `SuiGenerisRight`
  - `Copyright` -> `ExploitationRight`, `MoralRight`
  - `ExploitationRight` -> `ReproductionRight`, `DistributionRight`, `CommunicationRight`, `TransformationRight`
  - `Agreement` -> `IPRContract`, `IPRLicense`; `IPRLicense` -> `DistributionLicense`, `PurchaseLicense`
  - `IPRTransfer` -> `CreationIPRTransfer`, `DistributionIPRTransfer`, `ExploitationIPRTransfer`
  - `GeographicArea` -> `Country`, `State`, `Continent`, `Area`
- Object properties (IP-relevant subset):
  - Licensing and transfer: `licensee`, `licenser`, `granter`, `grantee`, `transferredRight`, `transfer`
  - Ownership/rights state: `owner`, `possession`, `permission`, `prohibition`, `obligation`
  - Temporal and territorial scope: `timeFrom`, `timeTo`, `timePeriod`, `locationFrom`, `locationTo`, `location`
  - Work-expression-manifestation linkage: `hasExpression`, `hasFixation`, `hasRealization`, `hasCopy`, `isCopyOf`
- Reasoning constraints:
  - Disjointness axioms: `CorporateLegalEntity` disjoint `NaturalLegalEntity`; `Physical` disjoint `Abstract`; `Manifestation` disjoint `Replica`
  - Inverse property: `hasCopy` inverseOf `isCopyOf`
  - Property hierarchy: `licensee`/`licenser`/`grantee`/`granter` subPropertyOf consent/agent chains; `permission`/`prohibition`/`obligation` modeled as output-role properties of agreements
  - Transitivity: no explicit transitive object property declarations found
  - Cardinality: no explicit cardinality predicates found
- IP law relevance:
  - Primary ontology for IPR agreements, transfers, and right-holder relations.
  - Important gap: retrieved IPRonto artifact did not expose explicit `Patent` or `Trademark` classes.

### S3: Copyright Ontology

- Source URL:
  - Contract: `https://rhizomik.net/ontologies/copyrightonto/`
  - Retrieved artifacts:
    - `https://rhizomik.net/ontologies/copyrightonto.owl`
    - `https://rhizomik.net/ontologies/copyrightonto-creationmodel.owl`
    - `https://rhizomik.net/ontologies/copyrightonto-rightsmodel.owl`
- OWL Dialect: OWL DL style ontology modules
- Serialization Format: Turtle
- Top-level class hierarchy (depth 2-3):
  - Creation model: `Work`, `Manifestation`, `Instance`, `Recording`, `Performance`, `Communication`
  - Rights model: `Copyright` -> `EconomicRights`, `MoralRights`, `RelatedRights`, `CopyrightExceptions`
  - `EconomicRights` -> `ReproductionRight`, `DistributionRight`, `CommunicationRight`, `TransformationRight`, `FixationRight`, `PublicPerformanceRight`
  - `MoralRights` -> `AttributionRight`, `DisclosureRight`, `IntegrityRight`, `WithdrawalRight`
  - `RelatedRights` -> `BroadcastersRights`, `PerformersRights`, `ProducersRights`
- Object properties (IP-relevant subset):
  - Work decomposition and derivation: `hasManifestation`/`isManifestationOf`, `hasInstance`/`isInstanceOf`, `hasPart`/`isPartOf`, `hasDerivation`/`isDerivationOf`
  - Performance/recording links: `hasPerformance`/`isPerformanceOf`, `hasRecording`/`isRecordingOf`, `hasCommunication`/`isCommunicationOf`
  - Norm/rule modeling helpers: `condition`, `consequence`, `aim`, `manner`
- Reasoning constraints:
  - Transitive properties: `hasDerivation`, `isDerivationOf`, `hasPart`, `isPartOf`
  - Disjointness axioms include: `Broadcast` disjoint `MakeAvailable`; `PublicPlace` disjoint with multiple non-place classes (`Action`, `CreativeWork`, `LegalPerson`, `Copyright`)
  - Cardinality restrictions detected (21 predicates), including examples:
    - `Derive`: cardinality 1 on object/result relations
    - `Manifest`: cardinality 1 on point-in-time/location/object/result, with min 1 agent
    - `Use`: cardinality 1 on point-in-time/location with min 1 agent
  - Inverse and subproperty patterns: e.g. `hasManifestation` inverseOf `isManifestationOf`, `hasPart` inverseOf `isPartOf`
- IP law relevance:
  - Strong grounding for copyright works, rights bundles, exceptions, and rights-action relations.

### S4: JudO

- Source URL:
  - Contract: `https://github.com/legalontology/JudO` (unresolved at retrieval time)
  - Retrieved equivalent OWL artifact: `https://raw.githubusercontent.com/Marceci/JudO/master/Judging_Contracts_Domain.owl`
- OWL Dialect: OWL 2 XML syntax ontology
- Serialization Format: OWL/XML
- Top-level class hierarchy (depth 2-3):
  - `Judging_Contracts_Core:Judgement` <- `Judging_Contracts_Core:Adjudication`, `Judging_Contracts_Core:Judicial_Interpretation`
  - `Judging_Contracts_Core:Legal_Status` <- `#Exception`, `#Oppressive_Status`, `#NonOppressive_Status`
  - `Judging_Contracts_Core:Contractual_Agreement` <- `#Contract_Clause`, `#Full_Contract`, `#Inefficacious`
  - `Judging_Contracts_Core:Material_Circumstance` <- `Judging_Contracts_Core:Contractual_Agreement`, `Judging_Contracts_Core:Judicial_Interpretation`
- Object properties (IP-relevant subset):
  - Judicial reasoning links: `Judging_Contracts_Core:applies`, `applied_by`, `considers`, `considered_by`, `judged_as`
  - Exception handling links: `#assumption`, `#exception`
  - Imported LKIF norm/expression links: `qualified_by`, `qualifies`, `allows`, `disallows`
- Reasoning constraints:
  - Existential restrictions present (`ObjectSomeValuesFrom`) across adjudication and clause qualification structures (count 14)
  - Cardinality restriction present: `#Contract_Clause` includes an `ObjectMaxCardinality = 1` on `applies`
  - Disjointness axiom present: `#NonOppressive_Status` disjoint `#Oppressive_Status`
  - No explicit transitive property declarations in this artifact
- IP law relevance:
  - Strong for judicial process and decision structure; weaker for IP-domain specifics (patent/trademark specifics are not central in this module).

### S5: LCBR

- Source URL:
  - Contract: `https://papers.ssrn.com/sol3/papers.cfm?abstract_id=3689543` (paper metadata, not directly fetchable OWL in this environment)
  - Proxy OWL analyzed for case-based legal reasoning classes: `https://raw.githubusercontent.com/Marceci/JudO/master/Judging_Contracts_Core.owl`
- OWL Dialect: OWL 2 XML syntax ontology
- Serialization Format: OWL/XML
- Top-level class hierarchy (depth 2-3):
  - `#Judicially_Qualified` <- `#Judicial_Claim`, `#Judicial_Outcome`, `#Material_Circumstance`
  - `#Judgement` <- `#Adjudication`, `#Judicial_Interpretation`
  - `#Legal_Rule` -> `#Law_Declaration`, `#Legal_Consequence`, `#Legal_Status` (+ LKIF `norm:*` alignments)
  - `#Jurisdiction` -> aligns with `expression:Declaration` and `legal-action:Public_Body`
  - `#Contractual_Agreement` -> `#Agreement`, `#Legal_Status`, `#Material_Circumstance`
- Object properties (IP-relevant subset):
  - Core case reasoning links: `#applies`, `#applied_by`, `#considers`, `#considered_by`
  - LKIF links used in restrictions: `expression:qualified_by`, `expression:evaluated_by`, `expression:attitude`, `norm:allows`, `norm:disallows`
- Reasoning constraints:
  - Existential restrictions (`ObjectSomeValuesFrom`) present (count 13)
  - Universal restrictions (`ObjectAllValuesFrom`) present (count 4)
  - Equivalent class axiom: `#Judicially_Qualified` equivalent to classes satisfying `considered_by some #Judgement`
  - No explicit transitive declarations, disjoint axioms, or cardinality restrictions in this proxy artifact
- IP law relevance:
  - Useful for claim/outcome/precedent-style modeling in disputes.
  - Provenance caveat: this is a proxy for S5, not a directly retrieved LCBR OWL file from the SSRN source page.

### S6: ESTRELLA

- Source URL:
  - Contract: `https://cordis.europa.eu/project/id/IST-2004-027655`
  - Retrieved archived module URL: `https://web.archive.org/web/20110906034359if_/http://www.estrellaproject.org/lkif-core/norm.owl`
- OWL Dialect: OWL DL (LKIF norm module in ESTRELLA namespace)
- Serialization Format: RDF/XML
- Top-level class hierarchy (depth 2-3):
  - `Norm` -> `Permission`, `Right`
  - `Right` -> `Obligative_Right`, `Liability_Right`, `Liberty_Right`, `Permissive_Right`
  - `Legal_Document` -> `Contract`, `Directive`, `Regulation`, `Statute`, `Treaty`
  - `Legal_Source` -> `Legal_Document`, `Precedent`, `International_Agreement`, `Soft_Law`
- Object properties (IP-relevant subset):
  - Norm qualification: `allows`, `allowed_by`, `disallows`, `disallowed_by`, `commands`, `commanded_by`
  - Norm comparison: `normatively_equivalent_or_better`, `normatively_equivalent_or_worse`, `normatively_strictly_better`, `normatively_strictly_worse`, `strictly_equivalent`
- Reasoning constraints:
  - Transitive properties declared: `normatively_equivalent_or_better`, `normatively_strictly_better`, `normatively_strictly_worse`, `strictly_equivalent`
  - Disjointness axioms include: `Document` disjoint `Custom`; `Treaty` disjoint `Non-binding_International_Agreement`
  - Inverse/subproperty structures mirror LKIF normative comparison model (e.g., `normatively_strictly_better` inverseOf `normatively_strictly_worse`)
  - Cardinality: no explicit cardinality predicates found in retrieved module
- IP law relevance:
  - Reinforces normative/legal-document backbone; overlaps S1 by design.

### S7: WIPO IPC

- Source URL:
  - Contract: `https://www.wipo.int/classifications/ipc/en/`
  - Retrieved master file: `https://www.wipo.int/ipc/itos4ipc/ITSupport_and_download_area/20260101/MasterFiles/ipc_scheme_20260101.zip`
- OWL Dialect:
  - No explicit OWL ontology file in retrieved artifact; IPC is distributed as hierarchical XML taxonomy (`IPCScheme`)
- Serialization Format: XML (WIPO master schema)
- Top-level class hierarchy (taxonomy depth sample):
  - Section (`kind=s`): 8 total (e.g., `A`)
  - Class (`kind=c`): 132 total (e.g., `A01`)
  - Subclass (`kind=u`): 655 total (e.g., `A01B`)
  - Main group (`kind=m`): 7,668 total (e.g., `A01B0001000000`)
  - Subgroup levels (`kind=1..5`): deeply nested controlled hierarchy (e.g., `A01B0001020000` -> `A01B0001040000`)
- Object properties / relationship signals:
  - Hierarchical parent-child containment via nested `ipcEntry`
  - Cross-reference link types in text/reference bodies:
    - `sref` count 22,412
    - `mref` count 1,450
  - Example references: `A01B` references `A01C0005000000`, `A01D0042040000`, `E01`, `E02`
- Reasoning constraints:
  - No OWL cardinality/disjointness/transitivity axioms present in this XML representation
  - Taxonomic constraints are structural (single symbol tree path + explicit cross-reference edges)
- IP law relevance:
  - Primary source for patent classification code hierarchy and code-to-code cross-references.

---

## Synthesis

### Class-to-Node-Type Mapping

| Node Type | Candidate Ontology Classes / Concepts | Source(s) | Grounding | Notes |
|---|---|---|---|---|
| Patent | `IntellectualProperty`, `IntellectualPropertyRight` + IPC `ipcEntry` patent taxonomy symbols | S2, S7 | Weak | No explicit `Patent` class found in retrieved S2 artifact; needs ADR for concrete `Patent` node semantics. |
| Trademark | `IntellectualProperty`, `IntellectualPropertyRight`, `ExclusiveRight` | S2 | Weak | No explicit `Trademark` class found in retrieved S2 artifact. |
| CopyrightWork | `Work`, `CreativeWork`, `Manifestation`, `Instance`, `Recording` | S3 | Strong | Direct and rich copyright creation model. |
| LegalEntity | `LegalEntity`, `NaturalLegalEntity`, `CorporateLegalEntity`, `Legal_Person` | S1, S2 | Strong | Clear person/organization hierarchy. |
| IPRight | `IntellectualPropertyRight`, `Copyright`, `NeighbouringRight`, `SuiGenerisRight`, `EconomicRights`, `MoralRights` | S2, S3 | Strong | Rights as first-class concepts in both ontologies. |
| License | `IPRLicense`, `DistributionLicense`, `PurchaseLicense` | S2 | Medium | Strong for contract/licensing shape in S2; S3 contributes rights/actions but not a single canonical `License` class name. |
| Filing | `Transaction`, `Offer`, `PostAgreement`, `Create` (event proxies) | S2 | Weak | No explicit filing/application event class found; should be explicitly introduced or re-scoped. |
| Jurisdiction | `#Jurisdiction`, `Public_Body`, `Legal_Person` | S4, S5, S1 | Medium | Present in JudO/LCBR proxy artifacts; aligns with legal actor/public authority concepts. |
| ClassificationCode | IPC `ipcEntry` symbols across `kind=s/c/u/m/1..5` | S7 | Strong | Direct hierarchical coding system for patent classification. |
| Court | `#Jurisdiction` + `legal-action:Public_Body` (institutional proxy) | S4, S5 | Medium | No explicit `Court` class string in retrieved files; model as specialization of jurisdiction/public body. |
| Judgment | `#Judgement`, `Adjudication`, `Judicial_Interpretation` | S4, S5 | Strong | Directly represented. |
| LegalProvision | `Legal_Document`, `Statute`, `Regulation`, `Treaty`, `#Legal_Rule`, `#Law_Declaration` | S1, S5, S6 | Strong | Strong legal text/provision anchors across upper and judicial modules. |
| Norm | `Norm`, `Permission`, `Right`, `Normatively_Qualified` | S1, S6 | Strong | Core LKIF/ESTRELLA normative backbone. |
| Expression | `Expression`, `Legal_Expression`, `Qualification`, `Qualified`, `Communicated_Attitude` | S1, S5 | Strong | Directly represented and linked to norms and judgments. |
| Claim | `#Judicial_Claim` (legal claim), plus action/restriction proxies for copyright actions | S4, S5, S3 | Medium | Legal-claim grounding exists; patent-claim specificity is not explicit in retrieved artifacts. |

### Planned Node Types with Weak Ontological Grounding

- `Patent` (no explicit class in retrieved S2 artifact; relies on abstract IPR class + IPC taxonomy).
- `Trademark` (same issue as `Patent`).
- `Filing` (no direct filing class in retrieved artifacts; currently event/transaction proxy).
- `Court` (represented indirectly via `Jurisdiction` and `Public_Body` rather than explicit class label).
- `Claim` (legal-claim strong, patent-claim weak).

### Suggested Additional Edge Types Beyond the 11 Planned

| Suggested Edge Type | From -> To | Triggering Property / Structure | Source(s) | Why Add |
|---|---|---|---|---|
| `LICENSED_TO` | `License` -> `LegalEntity` | `licensee` | S2 | Separates license grantor/grantee roles from generic `HELD_BY`. |
| `LICENSED_BY` | `License` -> `LegalEntity` | `licenser` | S2 | Captures grantor side explicitly. |
| `TRANSFERS_RIGHT` | `IPRTransfer` -> `IPRight` | `transferredRight` | S2 | Makes right transfer event explicit. |
| `TRANSFER_TO` | `IPRTransfer` -> `LegalEntity` | `grantee` | S2 | Captures target holder in transfers. |
| `TRANSFER_FROM` | `IPRTransfer` -> `LegalEntity` | `granter` | S2 | Captures source holder in transfers. |
| `PERMITS_ACTION` | `Agreement/Norm` -> `Expression/Event` | `permission`, `allows` | S1, S2 | Distinguishes positive authorization from ownership. |
| `PROHIBITS_ACTION` | `Agreement/Norm` -> `Expression/Event` | `prohibition`, `disallows` | S1, S2 | Needed for compliance/infringement analytics. |
| `HAS_MANIFESTATION` | `CopyrightWork` -> `Manifestation` | `hasManifestation` | S3 | Critical for work-expression-manifestation chain. |
| `HAS_DERIVATION` | `CopyrightWork` -> `CopyrightWork` | `hasDerivation` (transitive) | S3 | Enables derivative-work traversal. |
| `HAS_PART` | `CopyrightWork` -> `CopyrightWork` | `hasPart` (transitive) | S3 | Supports composite works and portions. |
| `APPLIES_RULE` | `Judgment` -> `LegalProvision` | `applies` / `applied_by` | S4, S5 | Judicial reasoning edge absent from current 11. |
| `CONSIDERS` | `Judgment` -> `Claim/Fact` | `considers` / `considered_by` | S4, S5 | Captures evidentiary and claim consideration chains. |
| `NORMATIVELY_BETTER_THAN` | `Norm` -> `Norm` | `normatively_strictly_better` | S1, S6 | Enables priority/conflict analysis among norms. |
| `IPC_CROSS_REFERENCES` | `ClassificationCode` -> `ClassificationCode` | `sref`, `mref` in IPC XML | S7 | Adds non-tree semantic links between IPC codes. |

---

## Confirmed Constraints

- [x] All 7 ontology sections populated with non-empty class lists / hierarchy excerpts
- [x] Object properties documented for each ontology
- [x] Reasoning constraints documented (cardinality, disjointness, transitivity where present; explicit absence noted where not present)
- [x] Class-to-node-type mapping covers all 15 planned types
- [x] Gaps and weak groundings explicitly flagged

## Open Questions for P1

1. Should `Patent`, `Trademark`, and `Filing` remain first-class node tags without direct class names in retrieved S2, or be introduced via ADR as pragmatic domain classes?
2. Should `Court` be modeled as a subtype of `Jurisdiction`/`Public_Body` (ontology-faithful) or as a standalone node type with explicit ADR justification?
3. Should S5 be marked as provisional until a directly retrievable, authoritative LCBR OWL artifact is located?
4. Should S7 be treated as ontology input in XML-taxonomy form, or transformed into OWL/SKOS first to enforce uniform reasoning tooling in P1/P3?
