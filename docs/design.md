Design Choices
==============

Constant Metric Names
---------------------
This tool intentionally does not provide a mechanism to dynamically create a metric name at runtime,
only set tag values. This improves discoverability, allowing us to define generic dashboards based on
metric names which may be filtered based on dynamic tag values.

Unique Metric Names
-------------------
This schema does not allow the same name to be reused for multiple metric types, or combinations of tags.
A metric name should uniquely identify a metric, and provide clarity around precisely what tags are available.
When not all tags are available in every instance, it's important to consider whether that tag makes sense on
the metric, or it may be a leaky abstraction. As a fallback when other options have been exhausted, a stub
value (e.g. `unknown`) may be used. 

Staged Builders
---------------
Tags are always string values. When multiple tags are present, it's important to make it clear which parameter
is associated with a given tag. Furthermore, when tag order changes, staged builders produce a compile break
rather than silently allowing us to produce incorrect data. We intentionally avoid backwards compatibility
because generated metric utilities are **not** meant to be consumed by dependant libraries.

Metrics with zero or one arguments use a simple factory method because there's no risk of passing arguments
in the wrong order, and a single method is easier to read.