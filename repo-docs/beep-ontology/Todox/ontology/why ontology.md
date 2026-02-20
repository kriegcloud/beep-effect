# Why create an Ontology?

Organizations can gain several key benefits from building and using an Ontology to organize and leverage their data, as described below:

- [[#Connectivity at scale]]
- [[Inter]]

In practice, these benefits are realized by using Todox's Ontology-aware applications which enable rapid analysis, workflow development, and decision capture. [[applications|Learn more about Ontology-aware applications.]]
## Connectivity at scale

The Ontology is a shared source of truth for decision-making and decision capture across an organization.

By providing a single source of truth, the Ontology enables users to easily discover and understand the data available across their organization as well as view their local decisions in a more global context, providing connectivity at scale. The Ontology is used not only to read data, but also to write data back and capture decisions made by users.

Operating from standard data lakes can lead to unmanageable complexity from an ever-growing number of datasets, dashboards, and applications. Over time, increasing effort is required simply to understand what data assets exist or should be used, while new projects "reinvent the wheel" instead of reusing or leveraging existing data assets.

In contrast, the Ontology provides a well-defined system into which new information is modeled into a common language for the organization. With an Ontology, organizations can make the most of their data as the data asset grows, enabling a digital transformation at scale, while controlling complexity and reducing the difficulty of data management.

<div style="position: relative; border: 1px solid; padding: 1rem"><svg class="ptcom-design__icon__19o1cwu" width="20" height="20" viewBox="0 0 20 20" role="img" fill="currentColor"><path d="M10,2a8,8,0,1,0,8,8A8,8,0,0,0,10,2Zm1,13H9V10H7V8h4ZM10,7a1,1,0,1,1,1-1A1,1,0,0,1,10,7Z"></path></svg><div class="ptcom-design__title__19o1cwu">Example</div><p>A wealth management firm uses the Ontology to create a shared view of a client’s portfolio health and performance across financial advisors, portfolio managers, risk &amp; compliance teams, and client service/operations staff. Instead of building several isolated views of the client relationship (e.g., separate dashboards for performance, suitability, and risk), they contribute their inputs to the same Ontology <em>Client Portfolio</em> object type—connecting holdings, goals, risk profile, constraints, communications, and approvals in one place. This shared model allows day-to-day decisions (like rebalancing, tax-loss harvesting, or resolving suitability flags) and longer-term decisions (like adjusting the client’s strategic asset allocation or planning for major life events) to be generated from the same information and insights.</p></div>


## Interpretability

The most challenging element of operating as a data-driven organization is deploying the data to the various decision makers across the organization. In particular, many decision makers are not technical users comfortable with code or IT concepts such as datasets or joins.

The Ontology abstracts away these digital concepts and allows users to engage with data represented in the standard terms they use every day. More importantly, the Ontology provides a shared language across different users and functions, allowing them to collaborate without lengthy reconciliation processes to confirm that everyone is looking at the same information.

<div class="border: 1px solid; position: relative; padding: 1rem"><svg class="ptcom-design__icon__19o1cwu" width="20" height="20" viewBox="0 0 20 20" role="img" fill="currentColor"><path d="M10,2a8,8,0,1,0,8,8A8,8,0,0,0,10,2Zm1,13H9V10H7V8h4ZM10,7a1,1,0,1,1,1-1A1,1,0,0,1,10,7Z"></path></svg><div class="ptcom-design__title__19o1cwu">Example</div><p>At a wealth management firm, key client and portfolio data (holdings, transactions, performance, tax lots, fees, restrictions, suitability documentation, and client communications) was previously hard for both advisors and analytics teams to use due to its scale, fragmentation across systems, and complex financial data formats. Today, because an Ontology is modeled on top of this data, advisors and client service teams can search for a client, see a clear view of related accounts and holdings, understand performance drivers, identify concentrations or constraint breaches, and trace the history of recommendations and approvals—without needing to think about tables, joins, or a complex data preparation process. Although this data was among the most valuable in the organization, under the previous system preparing it for analysis could take days or weeks, limiting its use to special reporting requests. Now, the same data is immediately accessible not only to data scientists, but to advisors, portfolio managers, risk &amp; compliance teams, and operations staff.</p></div>
## Economies of scale

The Ontology enables significant economies of scale in the construction of an operational platform by converging effort onto a single reusable data asset that supports all analytical work and application development.

Rather than requiring a dedicated data integration and data layer effort for every new use case or project, data integration is only required for new data entering the platform. Entire applications and use cases can be built on the existing Ontology; the shared data asset lets application builders focus on the organizational problem and the user workflow, instead of on data wrangling.


## Decision capture

As an organization's "digital twin", the Ontology supports data writeback and continuous improvement by capturing decisions being made in the organization as data. The Ontology allows for the configuration of writeback and [[action types]], which define how users can edit and enrich the data backing the Ontology.

Capturing decision-making outcomes in the Ontology enables organizations to learn from and improve their decision-making. Data writeback also allows the value of the data asset to compound over time, as insights captured by one user can contribute to the decision-making of another user.

## Powering operational AI/ML

For data science and AI/ML teams, the Ontology enables collaboration with operational teams and others on a shared platform. Models (and their features) can be bound directly to the building blocks and processes that drive the organization. This allows models to be governed, released, and implemented directly into core applications and systems, without additional adapters or glue code, before being served in-platform (batch, streaming, or query-driven) or externally. As decisions are made and actions are taken, operational and process data are written back into the Ontology, creating a feedback loop that enables model monitoring, evaluation, re-training, and MLOps.

Todox enables quick iteration towards outcomes. The Ontology and other best-in-class tooling make it easy to get started and deliver AI/ML-enabled operational outcomes, whether through new applications or by augmenting existing systems. Subsequent use cases can leverage interconnected datasets and model assets throughout the enterprise, decreasing time-to-value for new projects.

Learn more about [[Models in the Ontology]]
