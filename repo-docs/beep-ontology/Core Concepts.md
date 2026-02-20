
This page describes major concepts related to the Ontology in Todox.

## Ontology

An ontology is a categorization of the world. In Todox, the Ontology is the digital twin of an organization, a rich semantic layer that sits  on top of the digital assets (datasets and models) integrated into Todox. The Todox Ontology create a complete picture of an organization's world by mapping [[datasets]] and [[models]] to [[object types]], [[properties]], [[link types]] and [[action types]].

- An [[object types|object type]] defines an entity or event in an organization
- A [[properties|property]] defines the object type's characteristics
- A [[link types|link type]] defines the relationship between two object types.
- An [[action types|action type]] defines how an object type can be modified.

The concepts that comprise the Ontology have parallels in the structure of a [[datasets|dataset]]. You can think of each object type as analogous to a dataset; an object is an instance of an object type, just as a row is one entry in a dataset. The columns in a dataset are analogous to properties of an object, as they provide additional information for a given row. The value in a dataset field (like a cell in a spreadsheet) is akin to the property value of an object. And just as datasets can be joined together in various ways, objects can have links between them based on property values. The table below summarizes this comparison:

<table><thead><tr><th>Datasets</th><th>Ontology</th></tr></thead><tbody><tr><td>Dataset</td><td>Object type</td></tr><tr><td>Row</td><td>Object</td></tr><tr><td>Column</td><td>Property</td></tr><tr><td>Field</td><td>Property value</td></tr><tr><td>Join</td><td>Link type</td></tr></tbody></table>

The diagram below demonstrates how these concepts can come together to create an Ontology. The content below continues to define the different components of the Ontology in more depth.

![[airline-ontology.png]]

## Object type

An **object type** is the schema definition of a real-world entity or event. An **object** refers to a single instance of an object type; an object corresponds to a single real-world entity or event. An **object set** refers to a collection of multiple object instances; that is, an object set represents a group of real-world entities or events.

[[object types|Learn more about object types]]

## Property

A **property** of an object type is the schema definition of a characteristic of a real-world entity or event. A **property value** refers to the value of a property on an object, or a single instance of that real world entity or event.

[[properties|Learn more about properties.]]

## Shared Property

A **shared property** is a property that can be used on multiple object types in your ontology. Shared properties allow for consistent data modeling across object types and centralized management of property metadata.

[[shared properties|Learn more about shared properties]]

## Link type

A **link type** is the schema definition of a relationship between two object types. A **link** refers to a single instance of that relationship between two objects.

[[link types|Learn more about link types.]]

## Action type

An **action type** is the schema definition of a set of changes or edits to objects, property values, and links that a user can take at once. It also includes the side effect behaviors that occur with action submission. Once an action type is configured in the Ontology, end users can make changes to objects by applying actions.

[[action types|Learn more about action types]]

## Roles

**Roles** are the central permissioning model in the Ontology. Ontology roles grant access to ontological resources. Roles can be granted on the Ontology level or the individual resource level.

Learn more about [[Ontology roles]] and how they are used for [[object types]], [[link types]] and [[action types]]

## Functions

A **function** is a piece of code-based logic that takes in input parameters and returns an output. Functions are natively integrated with the Ontology: they can take objects and object sets as input, read property values of objects, and be used across [[action types]] and [[applications]] that build on the Ontology

[[functions|Learn more about Functions in general]], or [[functions-on-objects|learn more about Ontology-based Functions]].

## Interfaces

An **interface** is an Ontology type that describes the shape of an object type and its capabilities. Interfaces provide object type polymorphism, allowing for consistent modeling of and interaction with object types that share a common shape.

Learn more about [[interfaces]].

## Object Views

**Object Views** are a central hub for all information and workflows related to a particular object. This includes key information about an object, any linked objects, and related metrics, as well as analyses, dashboards, and applications related to the object.

[[Object Views/Overview|Learn more about Object Views]]

