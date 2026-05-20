# traversals

- have parent array that stores the ids of immediate ancestor of current node
- this should make it easier to traverse up the tree to the root

# data representation
- store all nodes in a map, the id is key and the data or object is the value
- the node would store its children
- if I want to traverse I look up the node to find the next ids and continue from there
- best to do it this way for memory effiency, maybe. The alternative would be storing the parent nodes within the child node which means having references to the parent nodes within the child node, which feels wrong


## steps

- read data from api endpoint, it's a list of nodes and their prerequesites, which are basically the ancestral forms. This would be implemented as a hook used at the root component within its own module
- construct the graph by going through each form noting their prerequisites and updating the child nodes ancestor field as I discover which ones are parents
-
