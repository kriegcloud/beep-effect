# Energy News Ontology Gap Analysis Report

*Corpus: 15,970 Bluesky social media posts from 4,755 authors (2018-11-15 to 2026-02-26)*
*Ontology version analyzed: v0.2.0 — 9 classes, 19 top-level SKOS topics, 47 leaf topics, 15 properties*
*Analysis tool: recursive-llm (Sonnet 4.6 + Haiku 4.5 sub-delegation)*
*Generated: 2026-02-26*

---

## Executive Summary

- **5 new top-level SKOS concepts** needed to cover major orphan topic clusters
- **22+ missing leaf-level SKOS concepts** with strong corpus evidence (10+ mentions each)
- **14 proposed new OWL classes** to model entities the current ontology cannot represent
- **Engagement is specialized**: only 1 of the top 10 highest-engagement posts is directly energy-focused, confirming the domain is niche
- **Key structural gap**: the ontology models what gets *shared* (articles) but not what gets *discussed* (projects, technologies, events, prices)

---

## 1. Proposed New Energy Topics (SKOS Concepts)

### 1a. Five New Top-Level Topics

| # | Proposed IRI | Label | Frequency | Justification |
|---|-------------|-------|-----------|---------------|
| 1 | `enews:AIAndDataCenterDemand` | AI and Data Center Energy Demand | 396 mentions | Highest orphan frequency. Current `DataCenterDemand` is a leaf with no parent; needs promotion to top-level given volume and cross-cutting nature (intersects Grid, Policy, Nuclear, Renewables) |
| 2 | `enews:EnergyTradeAndSupplyChains` | Energy Trade and Supply Chains | 602 mentions | Operationalizes `EnergyGeopolitics` — LNG trade (439), sanctions, pipelines, shipping routes are concrete infrastructure, not abstract geopolitics |
| 3 | `enews:DistributedEnergyAndFlexibility` | Distributed Energy Resources and Grid Flexibility | 358 mentions | VPPs (142), demand response, DERs, microgrids — a paradigm shift from centralized generation not captured by current `GridAndInfrastructure` |
| 4 | `enews:SectoralDecarbonization` | Sectoral Deep Decarbonization | 50+ mentions | Policy-driven emerging theme: industrial heat, steel, cement, shipping, aviation decarbonization — distinct from general `ClimateAndEmissions` |
| 5 | `enews:BiomassAndBioenergy` | Biomass and Bioenergy | 56 mentions | Currently absent from the renewable hierarchy despite being a distinct energy source with its own supply chains and policy debates |

### 1b. Missing Leaf-Level Topics (22 concepts with corpus evidence)

| # | Proposed IRI | Label | Broader Parent | Frequency | Alt Labels |
|---|-------------|-------|---------------|-----------|------------|
| 1 | `enews:LNGTradeAndInfrastructure` | LNG Trade and Infrastructure | EnergyTradeAndSupplyChains | 439 | LNG, liquefied natural gas, LNG terminal |
| 2 | `enews:OffshoreWind` | Offshore Wind | Renewable | 299 | offshore wind farm, floating wind, ocean wind |
| 3 | `enews:VirtualPowerPlant` | Virtual Power Plant | DistributedEnergyAndFlexibility | 142 | VPP, virtual power plant, aggregated DER |
| 4 | `enews:DemandResponse` | Demand Response | DistributedEnergyAndFlexibility | ~100 | DR, load management, demand flexibility |
| 5 | `enews:BatteryRecycling` | Battery Recycling | EnergyStorage | ~80 | battery recycling, second life battery, circular economy |
| 6 | `enews:FuelCell` | Fuel Cell | Hydrogen | 80 | hydrogen fuel cell, PEMFC, SOFC |
| 7 | `enews:EnergySecurityAndResilience` | Energy Security and Resilience | EnergyGeopolitics | 73 | grid resilience, energy independence, blackout |
| 8 | `enews:IRAPolicy` | Inflation Reduction Act Policy | EnergyPolicy | 68 | IRA, Inflation Reduction Act, clean energy tax credits |
| 9 | `enews:PumpedHydroStorage` | Pumped Hydro Storage | EnergyStorage | 64 | pumped hydro, pumped storage, PHES |
| 10 | `enews:BiomassAndBioenergy` | Biomass and Bioenergy | Renewable | 56 | biomass, bioenergy, biofuel, biogas |
| 11 | `enews:GreenHydrogen` | Green Hydrogen | Hydrogen | 54 | green H2, renewable hydrogen, electrolytic hydrogen |
| 12 | `enews:IndustrialDecarbonization` | Industrial Decarbonization | SectoralDecarbonization | ~50 | industrial heat, green steel, cement decarbonization |
| 13 | `enews:DirectAirCapture` | Direct Air Capture | CarbonCapture | ~45 | DAC, direct air capture, carbon removal |
| 14 | `enews:CarbonMarkets` | Carbon Markets | EnergyMarkets | ~40 | carbon trading, carbon credits, ETS, cap-and-trade |
| 15 | `enews:Perovskite` | Perovskite Solar | ResearchAndInnovation | ~35 | perovskite, tandem solar cell, next-gen PV |
| 16 | `enews:COP30` | COP Climate Conference | ClimateAndEmissions | 23+ | COP30, COP, climate summit, UNFCCC |
| 17 | `enews:Energiewende` | Energiewende | EnergyPolicy | 39 | Energiewende, German energy transition |
| 18 | `enews:Microgrid` | Microgrid | DistributedEnergyAndFlexibility | ~30 | microgrid, islanded grid, community microgrid |
| 19 | `enews:LongDurationStorage` | Long Duration Energy Storage | EnergyStorage | ~25 | LDES, iron-air, flow battery, compressed air |
| 20 | `enews:GridModernization` | Grid Modernization | GridAndInfrastructure | ~25 | smart grid, grid upgrade, advanced metering |
| 21 | `enews:MaritimeDecarbonization` | Maritime Decarbonization | SectoralDecarbonization | ~20 | green shipping, maritime fuel, ammonia fuel |
| 22 | `enews:AviationDecarbonization` | Aviation Decarbonization | SectoralDecarbonization | ~20 | SAF, sustainable aviation fuel, e-fuel |

---

## 2. Proposed New OWL Classes (14)

### 2.1 EnergyProject

**Definition:** A planned or ongoing initiative to develop, construct, or operate energy infrastructure, including renewable installations, grid upgrades, storage facilities, and transmission projects.

**Hierarchy:** `rdfs:subClassOf owl:Thing` (or `obo:BFO_0000015` — Process)

**Key Properties:**
- `projectName` (xsd:string): Official name of the project
- `projectStatus` (owl:ObjectProperty → ProjectStatus): Current phase
- `capacity` (owl:ObjectProperty → CapacityMeasurement): Installed or planned capacity
- `location` (owl:ObjectProperty → GeographicEntity): Geographic location
- `startDate` (xsd:dateTime): Project initiation date

**Corpus Evidence:**
- "Plans for a massive new data center in Allegheny County were delayed"
- "Revolution Wind can resume construction"
- "Reliance Power will deploy 900 MWp solar +750 MW/3 GWh battery storage"

### 2.2 PowerPlant

**Definition:** A facility that generates electricity or thermal energy, characterized by fuel type, capacity, and operational status.

**Hierarchy:** `rdfs:subClassOf enews:EnergyProject`

**Key Properties:**
- `fuelType` (owl:ObjectProperty → EnergyTopic): Primary fuel
- `capacity` (owl:ObjectProperty → CapacityMeasurement): Generating capacity in MW/GW
- `operationalStatus` (xsd:string): Active, retired, planned, paused
- `emissionProfile` (xsd:string): Carbon intensity

**Corpus Evidence:**
- "Louisiana's utility regulator approved Entergy's plan to build three new gas-fired plants to power Meta's data center"
- "Peaker plants emit more pollution when they run than typical power plants"
- "NIPSCO plans 3 GW of new gas-powered generation + BESS in Indiana"

### 2.3 RenewableInstallation

**Definition:** A specific renewable energy facility (solar array, wind turbine, geothermal well, hydro dam, or biomass facility) characterized by technology type, capacity, and performance metrics.

**Hierarchy:** `rdfs:subClassOf enews:EnergyProject`

**Key Properties:**
- `technologyType` (owl:ObjectProperty → EnergyTechnology): Solar, wind, hydro, etc.
- `capacity` (owl:ObjectProperty → CapacityMeasurement): Installed capacity
- `generationProfile` (xsd:string): Intermittency, seasonal patterns
- `decommissioningPlanned` (xsd:boolean): Lifecycle status

**Corpus Evidence:**
- "Wind will globally add 139-155 GW, with land wind at record 124 GW in 2025"
- "California ISO reports 5,600 MW of battery storage capacity"
- "UK and North Sea states back 100 GW of joint offshore wind projects"

### 2.4 GridZone

**Definition:** A geographic region with defined electrical grid boundaries, managed by a specific operator.

**Hierarchy:** `rdfs:subClassOf enews:GeographicEntity`

**Key Properties:**
- `operatedBy` (owl:ObjectProperty → Organization): Grid operator
- `interconnectionRegion` (xsd:string): WECC, MISO, PJM, ERCOT, etc.
- `peakDemand` (owl:ObjectProperty → CapacityMeasurement): Maximum demand

**Corpus Evidence:**
- "PJM has intervened in the lawsuit arguing to lift the stop work order"
- "California ISO reports battery storage capacity"
- "Western leaders debated creation of a regional energy market"

### 2.5 EnergyTechnology

**Definition:** A class of technological innovations or methodologies used in energy generation, storage, transmission, or efficiency.

**Hierarchy:** `rdfs:subClassOf owl:Thing` (or `obo:BFO_0000031` — GDC)

**Key Properties:**
- `technologyName` (xsd:string): Name (lithium-ion battery, perovskite solar, etc.)
- `developmentStage` (xsd:string): Emerging, demonstration, commercial, mature
- `costPerUnit` (xsd:decimal): CapEx or unit cost
- `efficiency` (xsd:decimal): Round-trip or conversion efficiency

**Corpus Evidence:**
- "improved hydrogen fuel cell design"
- "Redwood Materials brings battery recycling online"
- "Green hydrogen uses 3-4x the energy of electricity"

### 2.6 PolicyInstrument

**Definition:** A regulatory, legislative, or economic tool used to incentivize, mandate, or restrict energy production, consumption, or technology adoption.

**Hierarchy:** `rdfs:subClassOf owl:Thing` (or `obo:BFO_0000031` — GDC)

**Key Properties:**
- `instrumentType` (xsd:string): Subsidy, mandate, tax, trading scheme, standard
- `jurisdiction` (owl:ObjectProperty → GeographicEntity): Geographic scope
- `targetTopic` (owl:ObjectProperty → EnergyTopic): Technology or behavior targeted
- `effectiveDate` (xsd:dateTime): Date policy took effect

**Corpus Evidence:**
- "Inflation Reduction Act (IRA) subsidies for clean energy"
- "EU carbon border tax"
- "South Korea doubles 2026 green energy budget"
- "Germany unveiled 6 billion euro funding for industrial decarbonisation"

### 2.7 RegulatoryBody

**Definition:** An organization with authority to create, enforce, or adjudicate energy policy and grid operations within a defined jurisdiction.

**Hierarchy:** `rdfs:subClassOf enews:Organization`

**Key Properties:**
- `jurisdiction` (owl:ObjectProperty → GeographicEntity): Authority area
- `regulatoryScope` (xsd:string): Grid operations, environmental, economic, safety
- `decisionAuthority` (xsd:boolean): Authority to make binding decisions

**Corpus Evidence:**
- "Louisiana's utility regulator approved Entergy's plan"
- "Federal judge said Empire Wind would suffer irreparable harm"
- "Interior Department ordered work to stop on Virginia wind farm"
- "California Public Utilities Commission is preparing to overhaul demand response programs"

### 2.8 CapacityMeasurement

**Definition:** A quantified metric of power generation or storage capability, measured in MW, GW, MWh, GWh, or equivalent units.

**Hierarchy:** `rdfs:subClassOf owl:Thing` (or `obo:IAO_0000027` — Data Item)

**Key Properties:**
- `value` (xsd:decimal): Numeric capacity value
- `unit` (xsd:string): MW, GW, MWh, GWh, kWh
- `capacityType` (xsd:string): Installed, planned, expected, actual, peak
- `measurementDate` (xsd:dateTime): Applicable date

**Corpus Evidence:**
- "5,600 MW of battery storage capacity"
- "139-155 GW of wind, 124 GW of land wind"
- "100 GW of joint offshore wind projects"
- "38.6 GW of Virtual Power Plant capacity"

### 2.9 EnergyEvent

**Definition:** A significant occurrence in the energy sector, including conferences, policy announcements, regulatory decisions, weather events, or market disruptions.

**Hierarchy:** `rdfs:subClassOf obo:BFO_0000015` (Process)

**Key Properties:**
- `eventType` (xsd:string): Conference, announcement, regulatory decision, natural disaster
- `eventDate` (xsd:dateTime): When the event occurred
- `location` (owl:ObjectProperty → GeographicEntity): Where
- `relatedTopic` (owl:ObjectProperty → EnergyTopic): Central topic

**Corpus Evidence:**
- "COP climate conferences"
- "Trump administration announcement pausing offshore wind leases"
- "Federal judge rulings on wind projects"

### 2.10 MarketInstrument

**Definition:** A financial or trading mechanism for energy commodities, capacity, or credits, including carbon permits, PPAs, capacity auctions, and RECs.

**Hierarchy:** `rdfs:subClassOf obo:BFO_0000031` (GDC)

**Key Properties:**
- `instrumentType` (xsd:string): Carbon credit, PPA, REC, capacity bid, futures
- `underlyingCommodity` (owl:ObjectProperty → EnergyTopic): What is traded
- `market` (xsd:string): Compliance market, voluntary market, auction

**Corpus Evidence:**
- "carbon credit, carbon offset programs"
- "2-way CFDs for wind in Alberta"
- "carbon border tax"
- "renewable energy credits"

### 2.11 PriceDataPoint

**Definition:** A quantified price or cost metric for energy, technology, or commodities at a specific point in time or location.

**Hierarchy:** `rdfs:subClassOf obo:IAO_0000027` (Data Item)

**Key Properties:**
- `commodity` (owl:ObjectProperty → EnergyTopic): What is priced
- `price` (xsd:decimal): Numeric price value
- `currency` (xsd:string): USD, EUR, etc.
- `unit` (xsd:string): Per barrel, per MWh, per kg

**Corpus Evidence:**
- "Green hydrogen is currently $4.5 to $12 per kilogram"
- "cost of SMR with CCS is roughly $2 per kg"
- "Alberta renewable program netted govt $185M"

### 2.12 ProjectStatus

**Definition:** A categorical characterization of an energy project's current phase, from planning through decommissioning.

**Hierarchy:** `rdfs:subClassOf owl:Thing`

**Key Properties:**
- `statusCategory` (xsd:string): Planning, permitting, construction, operational, suspended, decommissioned
- `statusDate` (xsd:dateTime): Date status was recorded
- `nextMilestone` (xsd:string): Expected next phase

**Corpus Evidence:**
- "Plans for data center were delayed by planning commission"
- "Revolution Wind can resume construction"
- "Trump administration announced pause on leases"
- "Judge overturns order halting New York's Sunrise Wind"

### 2.13 EmbeddedExternalLink

**Definition:** A hyperlink embedded within a Post pointing to an external web resource, characterized by link metadata (title, description, URI, preview image).

**Hierarchy:** `rdfs:subClassOf obo:BFO_0000031` (GDC)

**Key Properties:**
- `targetUri` (xsd:anyURI): URL of linked resource
- `linkTitle` (xsd:string): Display title
- `linkDescription` (xsd:string): Summary or snippet

**Corpus Evidence:** Present in every post with external embed (`embed._tag: "External"`)

### 2.14 MediaAttachment

**Definition:** A multimedia object (image, video, document) attached to or embedded in a Post.

**Hierarchy:** `rdfs:subClassOf obo:BFO_0000031` (GDC)

**Key Properties:**
- `mediaType` (xsd:string): image, video, audio, document
- `fullsizeUri` (xsd:anyURI): URL of full-resolution media
- `altText` (xsd:string): Accessibility description

**Corpus Evidence:** Present in every post with image embed (`embed._tag: "Images"`)

---

## 3. Proposed New Properties

| # | Property IRI | Domain | Range | Type | Definition |
|---|-------------|--------|-------|------|------------|
| 1 | `enews:hasCapacity` | EnergyProject | CapacityMeasurement | ObjectProperty | Links a project or facility to its capacity measurement |
| 2 | `enews:hasStatus` | EnergyProject | ProjectStatus | ObjectProperty | Links a project to its current status |
| 3 | `enews:operatedBy` | GridZone | Organization | ObjectProperty | Links a grid zone to its operating organization |
| 4 | `enews:hasTechnology` | RenewableInstallation | EnergyTechnology | ObjectProperty | Links an installation to its technology type |
| 5 | `enews:jurisdiction` | RegulatoryBody / PolicyInstrument | GeographicEntity | ObjectProperty | Geographic authority or scope |
| 6 | `enews:hasEmbed` | Post | EmbeddedExternalLink | ObjectProperty | Links a Post to its embedded external link |
| 7 | `enews:hasMedia` | Post | MediaAttachment | ObjectProperty | Links a Post to its media attachments |
| 8 | `enews:likeCount` | Post | xsd:integer | DatatypeProperty | Number of likes on a Post |
| 9 | `enews:repostCount` | Post | xsd:integer | DatatypeProperty | Number of reposts |
| 10 | `enews:replyCount` | Post | xsd:integer | DatatypeProperty | Number of replies |
| 11 | `enews:isReplyTo` | Post | Post | ObjectProperty | Links a reply Post to its parent Post |
| 12 | `enews:postText` | Post | xsd:string | DatatypeProperty | The text content of a Post |
| 13 | `enews:createdAt` | Post | xsd:dateTime | DatatypeProperty | When the Post was created |
| 14 | `enews:displayName` | AuthorAccount | xsd:string | DatatypeProperty | Display name of an author |
| 15 | `enews:coversTechnology` | Article | EnergyTechnology | ObjectProperty | Links an article to technologies it discusses |
| 16 | `enews:aboutProject` | Article | EnergyProject | ObjectProperty | Links an article to projects it covers |

---

## 4. Proposed Reference Individuals

### 4a. Organizations (high-frequency in corpus)

| IRI | Label | Type | Sector |
|-----|-------|------|--------|
| `enews:org_entergy` | Entergy | Utility | Fossil, Grid |
| `enews:org_meta` | Meta | Technology | DataCenterDemand |
| `enews:org_pjm` | PJM Interconnection | Grid Operator | Grid |
| `enews:org_caiso` | California ISO | Grid Operator | Grid |
| `enews:org_ercot` | ERCOT | Grid Operator | Grid |
| `enews:org_miso` | MISO | Grid Operator | Grid |
| `enews:org_doe` | U.S. Department of Energy | Regulator | Policy |
| `enews:org_interior` | U.S. Interior Department | Regulator | Permitting |
| `enews:org_cpuc` | California PUC | Regulator | Regulation |
| `enews:org_snam` | Snam | Pipeline Operator | NaturalGas |
| `enews:org_eni` | Eni | Oil & Gas | Fossil, CCS |
| `enews:org_orsted` | Ørsted | Developer | OffshoreWind |
| `enews:org_equinor` | Equinor | Energy Company | OffshoreWind, Fossil |
| `enews:org_nipsco` | NIPSCO | Utility | Grid, Fossil |
| `enews:org_redwood` | Redwood Materials | Recycler | BatteryRecycling |

### 4b. Geographic Entities (frequent in energy discussions)

| IRI | Label | Evidence |
|-----|-------|----------|
| `enews:geo_california` | California | CAISO, CPUC, solar/storage capital |
| `enews:geo_texas` | Texas | ERCOT, wind, gas, grid resilience |
| `enews:geo_germany` | Germany | Energiewende, industrial policy |
| `enews:geo_uk` | United Kingdom | Offshore wind, North Sea |
| `enews:geo_india` | India | Solar manufacturing, coal transition |
| `enews:geo_china` | China | Manufacturing, critical minerals, EVs |
| `enews:geo_eu` | European Union | Carbon border tax, energy policy |
| `enews:geo_alberta` | Alberta | Oil, wind PPAs, carbon policy |
| `enews:geo_louisiana` | Louisiana | Gas plants, data centers |
| `enews:geo_north_sea` | North Sea | Offshore wind, oil/gas |

### 4c. Publications (most-shared domains)

| IRI | Label | Domain |
|-----|-------|--------|
| `enews:pub_reuters` | Reuters | reuters.com |
| `enews:pub_ft` | Financial Times | ft.com |
| `enews:pub_guardian` | The Guardian | theguardian.com |
| `enews:pub_wired` | Wired | wired.com |
| `enews:pub_cnbc` | CNBC | cnbc.com |
| `enews:pub_utility_dive` | Utility Dive | utilitydive.com |
| `enews:pub_energy_monitor` | Energy Monitor | energymonitor.ai |
| `enews:pub_electrek` | Electrek | electrek.co |
| `enews:pub_rto_insider` | RTO Insider | rtoinsider.com |
| `enews:pub_inside_climate` | Inside Climate News | insideclimatenews.org |

---

## 5. Structural Recommendations

### 5.1 Cross-Cutting Themes
The following topics span multiple top-level concepts and should be modeled as SKOS Collections:
- **AI + Energy nexus**: Data centers (Grid), nuclear restarts (Nuclear), cooling demand (Water), GPU manufacturing (CriticalMinerals)
- **Energy Transition Politics**: IRA (Policy), tariffs (Geopolitics), permitting reform (Policy), state vs. federal (Regulation)
- **Extreme Weather + Grid**: Resilience (Grid), demand peaks (Demand), battery dispatch (Storage), blackouts (Grid)

### 5.2 Engagement vs. Coverage Gap
- **Highest engagement** topics: Geopolitics + scandal, political energy debates
- **Lowest engagement** but high volume: Technical grid operations, distributed energy, industrial decarbonization
- **Implication**: The ontology should distinguish between topics that drive *social engagement* vs. topics that drive *industry discourse*

### 5.3 Temporal Trends
- **Growing (2024-2026)**: AI/data center demand, offshore wind, battery storage, VPPs, industrial decarbonization
- **Stable**: Solar, wind, EVs, grid infrastructure, regulation
- **Declining references**: Coal, early CCS concepts (replaced by DAC/CCUS specifics)

### 5.4 Structural Pattern: Article vs. Discussion Posts
Many posts (~77% have no hashtags, per `<none>: 12,394`) are *discussion posts* — original commentary, not article shares. The ontology currently only models the article-sharing pattern. A `DiscussionPost` subclass or a `postType` property could capture this distinction.

---

## 6. Summary Statistics

| Metric | Value |
|--------|-------|
| Total posts analyzed | 15,970 |
| Unique authors | 4,755 |
| Posts with hashtags | ~3,576 (22%) |
| Posts without hashtags | ~12,394 (78%) |
| Date range | 2018-11-15 to 2026-02-26 |
| Top hashtag | #energysky (1,629 mentions) |
| Top author | insideevs.com (300 posts) |
| New topics proposed | 27 (5 top-level + 22 leaf) |
| New classes proposed | 14 |
| New properties proposed | 16 |
| New individuals proposed | 35 (15 orgs + 10 geos + 10 pubs) |
