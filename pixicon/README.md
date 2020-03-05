# Pixicon

Pixicon is a '*hashicon*' generator which produces colorful random pixel patterns.
It is still a work in progress, subject to change, and not ready for release.

## Design goals

The original goal was to have small visual representations of hashes that were easily differentiable. Almost any available solution can meet this demand, but there is the concern of **collisions**. Some existing solutions produce results that appear too similar, or have low combinatorial complexity, and this can result in collisions or difficulty in comparing.

So the goal is to maximize the variation of visually distinct outputs, by procedurally generating the icon with as many different code paths as possible. Random pixel data is generated, and assigned to squares or other shapes, and layered together in various densities and symmetries to produce the final composite image.

