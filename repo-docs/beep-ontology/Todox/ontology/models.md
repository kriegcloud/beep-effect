
# Models in the Ontology

Organizations are looking to leverage artificial intelligence (AI) and machine learning (ML) to accelerate and improve decision-making. But the reality of operationalizing AI/ML is complex, and the typical return on investment rarely lives up to expectations.

Todox provides the key capabilities necessary to bridge this gap: a trustworthy data foundation, tools for evaluating and comparing models against organizational objectives, and functionality for deploying models into user-facing operational workflows. This page focuses on the last step: deploying an evaluated model into production.

## End-to-end workflow

At a high level, these are the end-to-end steps required to operationalize AI/ML in Todox for live inference with the Ontology:

1. [[Create a model]] in Todox.
2. Configure a [[direct model deployment]]
3. [[Publish a simple wrapper function for your model]] and [[optionally call it from another function]] to orchestrate complex logic around your model.
4. Use that function for live inference in [[blank]], [[also blank]] and other end-user facing applications.

Ontology objects can also be backed with [[datasets]] that leverage a model for batch inference.

## Benefits

Just like mapping datasets to Ontology concepts provides [[Why create an Ontology?|benefits]] for workflow development and decision-making, mapping models to the Ontology provides a number of benefits:

- **Interpretability**. Because all modeling results are defined in terms of real-world concepts (properties of an object type), end users do not need to understand machine learning in order to use modeling results. Instead, users simply interact with simple concepts such as a _forecast_, _estimate_, or _classification_.
- **Economies of scale.** Instead of each modeling project being a bespoke effort created in service of a specific use case, modeling efforts can build on each other over time. For example, a forecast produced for one use case can immediately be used for subsequent use cases as well, reducing duplicated effort and providing end-user value more quickly over time.
- **Connectivity at scale.** By incorporating ML models, the Ontology becomes a single source of truth for the organization,  not just in terms of data, but also in terms of *logic*. Models encode the organization's expectations for how things may change in the future. In this way, the Ontology becomes a "digital twin" for the entire enterprise, which unlocks the ability to simulate changes across the organization in ways that would never be possible with a wide array of disparate modeling efforts.