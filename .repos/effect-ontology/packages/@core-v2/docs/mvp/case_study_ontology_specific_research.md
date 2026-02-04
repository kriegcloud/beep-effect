Existing Ontologies to Model the Seattle Mayor Domain

To build a Seattle Mayor knowledge graph with time-indexed claims, roles, and provenance, we can leverage several high-quality, well-documented ontologies. By combining these, we cover people, organizations, roles/positions, events/times, and provenance of information. Below we detail each relevant ontology, what it provides (“unlocks”), and how they can work together in our context.

1. People and Agents – FOAF (Friend of a Friend)

What it is: FOAF is a widely used Semantic Web ontology for describing persons (and other agents) and their basic attributes and relationships ￼. It defines classes like foaf:Person and properties for names, depictions, etc.

What it unlocks: Using FOAF gives us a standard way to represent mayors and other people in our system with unique identifiers and common properties. It’s machine-readable and designed for interoperability – any FOAF profile can be merged or linked across datasets ￼. FOAF is lightweight yet expressive for basic personal info and social links (e.g. we could use foaf:name for a mayor’s name, foaf:knows for relationships if needed).

Usage in our model: We’ll represent each Seattle mayor, deputy mayor, etc., as a foaf:Person with properties like name, and possibly link them to other agents (e.g. a mayor could be linked to a WebID or external FOAF profile if available). FOAF is also commonly used alongside the Organization ontology (below) – in fact, the ORG spec uses foaf:Agent/foaf:Person to denote the people involved ￼. This means FOAF will integrate cleanly with our roles and org structure.

2. Organizations, Roles and Membership – W3C Organization Ontology (ORG)

What it is: The W3C ORG Ontology is a standard for describing organizations and their structure, including positions and membership relations ￼ ￼. It defines:
• org:Organization (and subclass org:FormalOrganization for recognized bodies like a city government) ￼.
• org:OrganizationalUnit for sub-units/departments ￼ (e.g. Seattle Mayor’s Office could be a unit within City of Seattle government).
• org:Post to represent a position (office) that exists independently of who holds it (e.g. “Mayor of Seattle” as a position) ￼.
• org:Membership as an n-ary relationship linking a person to an organization (or to a Post) with a specific role and period ￼ ￼.
• org:Role as a skos:Concept to classify the nature of a membership or post (e.g. “Mayor” could be a role concept) ￼.
• Properties like org:memberOf, org:hasPost, org:heldBy, and org:memberDuring to capture who is part of what, and when ￼.

What it unlocks: ORG gives us a rich, structured way to model the Seattle city government. We can represent the City of Seattle as an organization, the Mayor’s office as either an Organization or simply use the Post for Mayor. Crucially, ORG supports time-bound roles: using an org:Membership instance, we can specify a mayor’s tenure with start and end dates ￼. This means we can answer queries like “Who was mayor in 2010?” or “What dates did Person X serve as Deputy Mayor?” easily by looking at membership intervals. The ontology is designed to handle hierarchy (organizations containing sub-units) and multiple ways of modeling membership (direct or via posts) to fit different scenarios ￼. This flexibility is important for modeling a timeline of officials.

Usage in our model: We would likely declare City of Seattle as an org:Organization (possibly a subclass like gov:CityCouncil or just use org:FormalOrganization with a classification). The Mayor of Seattle post can be an org:Post linked to that organization ￼. Each term of a mayor is an org:Membership linking a specific person (org:member) to the City of Seattle (org:organization) in the capacity of Mayor (org:role or via the Post) with the duration specified. For example, we might create:
• ex:CityOfSeattle rdf:type org:Organization.
• ex:MayorOfSeattlePost rdf:type org:Post; org:postIn ex:CityOfSeattle; skos:prefLabel "Mayor of Seattle".
• ex:Membership123 rdf:type org:Membership; org:organization ex:CityOfSeattle; org:post ex:MayorOfSeattlePost; org:member ex:Person_JaneDoe; org:memberDuring [ a time:Interval; time:hasBeginning "2024-01-01"; time:hasEnd "2027-12-31" ] [oai_citation:15‡w3.org](https://www.w3.org/TR/vocab-org/#:~:text=%5B%5D%20a%20org%3AMembership%3B%20org%3Amember%20%3Chttp%3A%2F%2Fexample.com%2Fpeople,01T09%3A00%3A00Z%22%5E%5Exsd%3AdateTime).

This states Jane Doe was Mayor during 2024–2027. ORG (in combination with OWL-Time, see below) thus captures the sequence of mayors over time. It also allows unfilled posts or future appointments to be represented (a Post exists even if no one holds it at the moment ￼). Additionally, ORG defines org:headOf which could directly mark someone as the head of an org (e.g. Mayor as head of the city gov) ￼, but the Membership approach with roles is more expressive for our timeline.

Proven use: This FOAF+ORG pattern has been used in political ontologies before. For example, the POLARE ontology (for political relations) explicitly chose FOAF for persons and ORG for organizations/positions ￼ ￼. Likewise, the Popolo data standard (widely used for civic open data) reuses FOAF and ORG classes to model persons, posts, and memberships in legislatures ￼. Popolo essentially shows that “Person holds Office in Organization from X to Y” can be modeled by combining these standard vocabularies. Adopting ORG means we align with these best practices, making our Seattle Mayor ontology compatible with existing civic data schemas.

3. Time and Events – OWL-Time (Time Ontology) and Event Ontologies

What it is: The OWL-Time ontology (W3C Time Ontology in OWL) provides a vocabulary for representing dates, times, and intervals. It defines time:Instant and time:Interval classes, and properties like time:hasBeginning, time:hasEnd, time:inXSDDateTime etc., to describe temporal data ￼. This ontology is a W3C standard for handling time in RDF.

Additionally, if we need to explicitly represent events (like an appointment event or election event in which a mayor takes office), there are event ontologies such as LODE (Linking Open Descriptions of Events) or the Schema.org Event schema. LODE, for instance, is a minimal model to describe events with participants, place, and time ￼, while Schema.org offers a simple schema:Event with properties like startDate, location, etc. These can be layered on if needed for rich event descriptions.

What it unlocks:
• OWL-Time allows us to attach formal temporal information to facts. By representing a mayoral term as a time:Interval, queries like overlapping terms or calculating durations become possible. It also improves consistency (all dates can be compared on a timeline). ORG already anticipates use of OWL-Time for membership periods ￼ – for example, the org:memberDuring in the membership example is a Time ontology Interval with a start date. Using OWL-Time means we’re not just storing strings for dates but actual time objects that reasoners understand (e.g. one interval before/after another). This is vital for the “timeline of knowledge” aspect.
• Event ontologies (if used) let us explicitly represent things like “AppointmentEvent where Person A formally became Mayor on Date D”. This can be useful for narrative or UI, grouping the facts into events. While our core model could infer a new mayor from a membership’s start date, an event ontology would let us describe the event itself (who announced it, where it happened, etc.) if those details are needed. For a basic timeline, we may not need a full event model; the membership with dates might suffice. But it’s good to know we can integrate one. For example, we could use LODE to create an event:Event with properties linking to the new Mayor (as a participant) and the City (as context), and tie it to the date. LODE is designed to be lightweight and interoperable with other vocabularies ￼.

Usage in our model: We will use OWL-Time in conjunction with ORG for start/end dates of a Mayor’s tenure. Each org:Membership can have a org:memberDuring or similar property pointing to a time:Interval that specifies the begin and end times in XSD dateTime or date format ￼. This formalizes the timeline. If needed, we can also create a custom class like :MayorAppointmentEvent as a subclass of a general Event, and link it with prov:generatedAtTime (from PROV, below) or OWL-Time to denote when the event occurred, and prov:wasDerivedFrom to indicate it came from a news article, for example. The combination of ORG + OWL-Time is a proven pattern (used in government data models) to represent positions held during specific periods ￼, so we follow that.

(In summary, OWL-Time and potentially an event ontology ensure that the chronology in “time-indexed claims” is properly captured and queryable.)

4. Provenance and Evidence – W3C PROV Ontology

What it is: PROV-O (the Provenance Ontology) is a W3C recommendation for representing provenance information on the Web ￼. It defines a data model of Entities, Activities, and Agents and relationships like:
• prov:Entity (a piece of data or assertion),
• prov:Activity (an action or process that generates or uses entities),
• prov:Agent (a person or software agent responsible for activities or entities),
• and relations such as prov:wasGeneratedBy (entity produced by activity), prov:wasDerivedFrom (entity derived from another), prov:wasAttributedTo (entity attributed to an agent), etc. ￼ ￼.

Provenance in PROV is defined broadly as “information about entities, activities, and people involved in producing a piece of data or thing, which can be used to form assessments about its quality, reliability or trustworthiness” ￼. In other words, PROV is about capturing where a fact came from and how it got here.

What it unlocks: For our Seattle Mayor ontology, PROV-O is key to modeling the evidence and inference chain behind each claim:
• We can represent source documents (e.g. a news article announcing a new mayor) as prov:Entity with properties like prov:location (a URL) and timestamps (when published or retrieved).
• An extracted claim like “Alice was appointed Deputy Mayor of Seattle” can be another prov:Entity (or we might treat the RDF triple as an entity via reification or Named Graphs). We then link: claimEntity prov:wasDerivedFrom sourceDocumentEntity to say the claim came from that source ￼. We can also use prov:wasAttributedTo to credit the extraction or the author of the source as needed.
• Each ingestion or reasoning step can be a prov:Activity. For example, a “NewsIngestionActivity” that takes a document and produces some assertions would be an activity where the output assertions prov:wasGeneratedBy that activity. Likewise, a reasoning step (applying a rule to infer a new fact like “if someone is Deputy Mayor, they are part of the Mayor’s administration”) can be an activity that generates a new inferred assertion (Entity), derived from prior assertions. We can capture that an inferred triple “Bob is an AdministrationMember of Seattle” was derived from the asserted triple “Bob holds the DeputyMayor post” via prov:wasDerivedFrom.

Using PROV-O thus enables traceability: every fact in our knowledge graph can point to why we believe it (which source), and how it was produced (by extraction, by inference rule, by manual curation, etc.). This aligns with the platform’s goal of “time-indexed claims + provenance + inference deltas” – PROV gives a standard, interoperable way to represent those provenance links. It’s domain-independent and encourages extensions for specific needs ￼, meaning we can extend it if we need to (but it likely covers our needs).

Usage in our model: We will likely create a provenance graph where each Assertion (or each org:Membership triple stating someone’s role) is tied to PROV metadata. For example:
• A claim node :assertion123 a prov:Entity; prov:wasDerivedFrom :docXYZ; prov:generatedAtTime "2025-12-01T10:00:00Z"^^xsd:dateTime; prov:wasAttributedTo :ExtractorAgent.
• The source document :docXYZ a prov:Entity; prov:location <https://news.example.com/article>; dcterms:published "2025-12-01"^^xsd:date; prov:wasAttributedTo :NewsPublisher.
• If a reasoning rule inferred something, we could have :reasoningRun1 a prov:Activity; prov:used :assertion123; prov:generated :assertion456; prov:endedAtTime "2025-12-02T09:00:00Z".
• The new inferred assertion :assertion456 prov:wasDerivedFrom :assertion123; prov:wasGeneratedBy :reasoningRun1; prov:wasAttributedTo :InferenceEngine.

This way, at any point we can ask “Why do we believe person X is Mayor?” and traverse these PROV links to find the source evidence. PROV-O’s flexible, generic structure means it can represent simple provenance or complex workflows ￼. It can also align with OWL-Time (PROV’s prov:startedAtTime and prov:endedAtTime are essentially time instants ￼) to timestamp activities or entity creation. In fact, PROV is often used as a bridge to align with other ontologies like Time ￼. For us, it ensures the credibility and temporal dimension of knowledge updates are captured in a standardized way.

(In summary, PROV-O will be the backbone for the “knowledge commits” – capturing when assertions are added/removed and linking them to their source or inference process.)

5. Evidence Anchoring – Web Annotation for Text Spans

What it is: The Web Annotation Data Model (W3C Recommendation) provides a way to associate an annotation (like a comment or a tag) with a specific part of a document. In our case, we can use it to link a textual quote (evidence span) from a source document to the claim it supports. Web Annotation defines an oa:Annotation class with properties oa:hasTarget (what is being annotated, e.g. a segment of a source) and oa:hasBody (the content of the annotation, e.g. our claim or a pointer to the claim) ￼. It also includes Selector mechanisms to specify the exact snippet of text in a document – for example, a TextQuoteSelector that identifies a substring by providing the quote and context (prefix/suffix) ￼.

What it unlocks: This ontology allows us to capture “evidence spans” at a granular level. Rather than just linking a claim to a document as a whole, we can point to the exact sentence or paragraph that supports the claim. This greatly improves explainability: the system can highlight “Mayor Jane was sworn in on Jan 2” in the source article as the evidence for the triple (JaneDoe --holdsPost--> MayorOfSeattle). The TextQuoteSelector and related selectors ensure the quote can be re-identified even if the document is just plain text ￼. Essentially, Web Annotation gives us a standard way to attach provenance with context (the actual quotes) to our triples.

Usage in our model: When we create a Claim in the platform, we could also create an oa:Annotation linking the claim to the source document. For example:
• :anno1 a oa:Annotation;
oa:hasTarget :docXYZ#fragment1;
oa:hasBody :assertion123;
oa:motivatedBy oa:describing.

Here, :docXYZ#fragment1 would be a specific part of the document (the target). We could define that fragment via a selector, e.g.:
:docXYZ#fragment1 a oa:SpecificResource; oa:hasSource :docXYZ; oa:hasSelector [ a oa:TextQuoteSelector; oa:exact "Jane Doe was sworn in as the new Mayor of Seattle"; oa:prefix "On Monday, "; oa:suffix ", marking the beginning of her term." ] [oai_citation:39‡w3.org](https://www.w3.org/TR/annotation-vocab/#:~:text=The%20TextQuoteSelector%20describes%20a%20range,it%20to).

The annotation’s body (which could also be a textual explanation or the triple itself) points to our assertion entity. This way, whenever someone inspects a fact, the system can retrieve the snippet that was used as evidence. This complements PROV-O: PROV links things at a higher level (claim to source document), while the Web Annotation model can pinpoint where in the source the claim comes from. Both can be used together to enrich provenance.

6. Controlled Vocabularies – SKOS for Role Types (Optional)

What it is: SKOS (Simple Knowledge Organization System) is a W3C standard for defining controlled vocabularies and taxonomies (as a lightweight thesaurus structure). In our context, SKOS can be used to define terms like “Mayor”, “Deputy Mayor”, “City Council Member”, etc., in a consistent way. SKOS would treat each role name or category as a skos:Concept, possibly organized in a concept scheme (e.g. a “Political Roles” scheme).

What it unlocks: Using SKOS for roles or classifications provides flexibility and multilingual support for labels, as well as easy mapping to other vocabularies. Rather than hard-coding classes for every role, we can have a SKOS concept for Mayor that multiple cities or contexts can reference. ORG already anticipates this approach: it suggests either subclassing organizations/roles or using a classification property. In fact, the ORG ontology explicitly mentions that one can use org:classification with SKOS concepts to categorize organizations ￼. Similarly, in the POLARE political ontology, they use org:Role with a SKOS concept to indicate the type of role ￼. This means we could define an authority like:

ex:MayorRole a org:Role; skos:prefLabel "Mayor"; skos:broader ex:CityOfficialRole.

and then any membership that is a mayor uses org:role ex:MayorRole. This approach unifies the term “Mayor” across the data and allows adding metadata (say a definition or synonyms) to that concept.

Usage in our model: We can create a small SKOS concept scheme for relevant roles in Seattle government. This is especially useful if we plan to extend beyond just mayors – e.g., including council members, department heads, etc. Each concept has human-readable labels (which can be used in the UI) and IDs that can link to external vocabularies (for example, perhaps link “Mayor” to a DBpedia concept for Mayor). While not strictly required, adopting SKOS for roles and classifications would make our ontology more maintainable and extensible, since adding a new role doesn’t require a new OWL class, just a new concept entry.

7. Integrating These Ontologies for the Seattle Mayor Knowledge Graph

Each of the above ontologies addresses a different facet of the domain, and importantly they are designed to work together in RDF. Here’s how we combine them and the benefits we gain:
• FOAF + ORG: FOAF provides the class for Person (foaf:Person), and ORG uses foaf:Agent/foaf:Person for its membership relations ￼. So our individuals are FOAF Persons, and org:Membership links those to organizations. This combination is already exemplified in prior art (POLARE’s use of FOAF/ORG ￼, and Popolo’s reuse of them ￼), giving us confidence in their compatibility. We get a rich structure (from ORG) with well-known person identifiers (from FOAF).
• ORG + OWL-Time: ORG’s membership and post patterns directly incorporate time intervals for start/end of roles ￼. By using OWL-Time, we ensure all dates are machine-comparable. For example, we can detect overlapping mayorships or gaps by reasoning over the intervals. This also means timeline visualizations are easier to generate from the data.
• SKOS with ORG: We can attach SKOS concepts to ORG roles or organization types ￼ ￼. This gives a semantic layer for role names and categories, useful for filtering or grouping in the UI (e.g., grouping all roles that are executive positions).
• PROV with Domain Data: PROV is orthogonal and can wrap around any of the above. Our assertion that “Person X is Mayor of Seattle (from date A to B)” might be represented in RDF (using ORG+Time) in the asserted knowledge graph, and separately we have a PROV graph linking that assertion to sources and activities. Because PROV is a standard, we could even integrate external provenance if some facts came from Wikidata or other databases (many of which also use PROV or similar structures for provenance). PROV’s alignment with Time means we can mark when an assertion was added (prov:generatedAtTime), giving a bitemporal aspect: one time for the real-world event (the mayor’s term) and one for the knowledge update event (when our system learned about it).
• Web Annotation (OA) + PROV: We can consider the Web Annotation links as part of our provenance model. For instance, a PROV prov:Entity representing the claim can have a related OA annotation that pinpoints the evidence. The annotation itself might be considered a kind of provenance or just an auxiliary link. Both ontologies are compatible (they’re just RDF triples), so a claim entity could have both PROV and OA connections without conflict. This yields a very transparent knowledge graph: not only do we know which document supports a claim (PROV), we also know where in the document and what text (OA selectors). This level of detail is extremely helpful for users verifying information.
• Leveraging Community Standards: By using these ontologies, our Seattle Mayor ontology pack will align with widely-used standards. This means:
• Developers and data integrators are more likely to understand our data model (since FOAF, ORG, PROV, etc., are well-documented and have examples online).
• We can use existing tools and libraries. For example, many SPARQL endpoints understand PROV for provenance queries, many Linked Data platforms support FOAF/ORG out-of-the-box (some government open data already publish officials in this form), and there are libraries for processing Web Annotations.
• We avoid reinventing the wheel (each of these ontologies was developed by communities to solve exactly these modeling problems).

In conclusion, to fully model the Seattle Mayor domain, we will combine FOAF for people, ORG for organizations/positions, OWL-Time for temporal data, PROV-O for provenance of claims, and optionally Web Annotation for evidence quotes and SKOS for controlled vocabularies. This modular approach follows the best practices of separating concerns: the domain facts (who is mayor, when) are handled by FOAF/ORG/Time, and the meta-information (how we know it, where it came from) is handled by PROV and annotations ￼ ￼. By standing on these well-established ontologies, our Seattle Mayor knowledge graph will be robust, interoperable, and richly expressive – capable of handling timeline updates, conflicting claims (via provenance), and explanatory UI components with minimal custom ontology development.

Sources:
• W3C FOAF Spec and Wikipedia – FOAF ontology for describing persons (agents) ￼
• W3C Organization Ontology – modeling orgs, posts, and memberships with roles and time ￼ ￼
• Popolo Project / POLARE research – reuse of FOAF and ORG for political office data ￼ ￼
• W3C PROV Ontology – provenance model (Entities, Activities, Agents) for tracing data origins ￼ ￼
• Simon Cox et al. 2017 – noting PROV’s flexibility and alignment with OWL-Time for temporal reasoning ￼
• W3C Web Annotation Data Model – standard for anchoring annotations to segments of text (TextQuoteSelector for evidence snippets) ￼
• W3C Time Ontology in OWL – standard definitions for time instants and intervals (used with ORG for membership periods) ￼
• W3C SKOS Reference – for defining controlled vocabularies (used for role classifications in ORG profiles) ￼
