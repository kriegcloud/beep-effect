# Code Property Graph Specification

## Source: https://cpg.joern.io/
Source: https://cpg.joern.io/

# Code Property Graph Specification 1.1

#### *Contributors: Fabian Yamaguchi, Markus Lottmann, Niko Schmidt, Michael Pollmeier, Suchakra Sharma, Claudiu-Vlad Ursache.*

This is the specification of the Code Property Graph, a language-agnostic intermediate graph representation of code designed for code querying.

The code property graph is a directed, edge-labeled, attributed multigraph. This specification provides the graph schema, that is, the types of nodes and edges and their properties, as well as constraints that specify which source and destination nodes are permitted for each edge type.

The graph schema is structured into multiple layers, each of which provide node, property, and edge type definitions. A layer may depend on multiple other layers and make use of the types it provides.

In the following, we describe each layer in detail. Note that this specification faithfully represents the code property graph as implemented by the Joern static analysis framework, as it is generated from its code.

### MetaData

The Meta Data Layer contains information about CPG creation. In particular, it indicates which language frontend generated the CPG and which overlays have been applied. The layer consists of a single node - the Meta Data node - and language frontends MUST create this node. Overlay creators MUST edit this node to indicate that a layer has been successfully applied in all cases where applying the layer more than once is prohibitive.

#### META_DATA

This node contains the CPG meta data. Exactly one node of this type MUST exist per CPG. The \`HASH\` property MAY contain a hash value calculated over the source files this CPG was generated from. The \`VERSION\` MUST be set to the version of the specification ("1.1"). The language field indicates which language frontend was used to generate the CPG and the list property \`OVERLAYS\` specifies which overlays have been applied to the CPG.

PROPERTIES: [HASH](#prop-ref-hash)[LANGUAGE](#prop-ref-language)[OVERLAYS](#prop-ref-overlays)[ROOT](#prop-ref-root)[VERSION](#prop-ref-version)

#### LANGUAGE

This field indicates which CPG language frontend generated the CPG. Frontend developers may freely choose a value that describes their frontend so long as it is not used by an existing frontend. Reserved values are to date: C, LLVM, GHIDRA, PHP.

## CARDINALITY one

#### OVERLAYS

The field contains the names of the overlays applied to this CPG, in order of their application. Names are free-form strings, that is, this specification does not dictate them but rather requires tool producers and consumers to communicate them between each other.

## CARDINALITY list

#### ROOT

The path to the root directory of the source/binary this CPG is generated from.

## CARDINALITY one

### FileSystem

CPGs are created from sets of files and the File System Layer describes the layout of these files, that is, it provides information about source files and shared objects for source-based and machine-code-based frontends respectively. The purpose of including this information in the CPG is to allow nodes of the graph to be mapped back to file system locations.

#### FILE

File nodes represent source files or a shared objects from which the CPG was generated. File nodes serve as indices, that is, they allow looking up all elements of the code by file. For each file, the graph MUST contain exactly one File node. As file nodes are root nodes of abstract syntax tress, they are AstNodes and their order field is set to 0. This is because they have no sibling nodes, not because they are the first node of the AST. Each CPG MUST contain a special file node with name set to \`\\`. This node is a placeholder used in cases where a file cannot be determined at compile time. As an example, consider external library functions. As their code is not available on CPG construction, the file name is unknown. File nodes MUST NOT be created by the language frontend. Instead, the language frontend is assumed to fill out the \`FILENAME\` field wherever possible, allowing File nodes to be created automatically upon first loading the CPG.

PROPERTIES: [HASH](#prop-ref-hash)[NAME](#prop-ref-name)

INHERITED PROPERTIES: [CODE](#prop-ref-code)[COLUMN_NUMBER](#prop-ref-column_number)[LINE_NUMBER](#prop-ref-line_number)[ORDER](#prop-ref-order)

EXTENDS: [AST_NODE](#node-ref-ast_node)

#### SOURCE_FILE

This edge connects a node to the node that represents its source file. These edges MUST not be created by the language frontend but are automatically created based on \`FILENAME\` fields.

#### COLUMN_NUMBER

This optional fields provides the column number of the program construct represented by the node.

## CARDINALITY zeroOrOne

#### COLUMN_NUMBER_END

This optional fields provides the column number at which the program construct represented by the node ends.

## CARDINALITY zeroOrOne

#### FILENAME

The path of the source file this node was generated from, relative to the root path in the meta data node. This field must be set but may be set to the value \`\\` to indicate that no source file can be associated with the node, e.g., because the node represents an entity known to exist because it is referenced, but for which the file that is is declared in is unknown.

## CARDINALITY one

#### LINE_NUMBER

This optional field provides the line number of the program construct represented by the node.

## CARDINALITY zeroOrOne

#### LINE_NUMBER_END

This optional fields provides the line number at which the program construct represented by the node ends.

## CARDINALITY zeroOrOne

### Namespace

Many programming languages allow code to be structured into namespaces. The Namespace Layer makes these namespaces explicit and associates program constructs with the namespaces they are defined in.

#### NAMESPACE

This node represents a namespace. Similar to FILE nodes, NAMESPACE nodes serve as indices that allow all definitions inside a namespace to be obtained by following outgoing edges from a NAMESPACE node. NAMESPACE nodes MUST NOT be created by language frontends. Instead, they are generated from NAMESPACE_BLOCK nodes automatically upon first loading of the CPG.

PROPERTIES: [NAME](#prop-ref-name)

INHERITED PROPERTIES: [CODE](#prop-ref-code)[COLUMN_NUMBER](#prop-ref-column_number)[LINE_NUMBER](#prop-ref-line_number)[ORDER](#prop-ref-order)

EXTENDS: [AST_NODE](#node-ref-ast_node)

#### NAMESPACE_BLOCK

A reference to a namespace. We borrow the concept of a "namespace block" from C++, that is, a namespace block is a block of code that has been placed in the same namespace by a programmer. This block may be introduced via a \`package\` statement in Java or a \`namespace{ }\` statement in C++. The \`FULL_NAME\` field contains a unique identifier to represent the namespace block itself not just the namespace it references. So in addition to the namespace name it can be useful to use the containing file name to derive a unique identifier. The \`NAME\` field contains the namespace name in a human-readable format. The name should be given in dot-separated form where a dot indicates that the right hand side is a sub namespace of the left hand side, e.g., \`foo.bar\` denotes the namespace \`bar\` contained in the namespace \`foo\`.

PROPERTIES: [FILENAME](#prop-ref-filename)[FULL_NAME](#prop-ref-full_name)[NAME](#prop-ref-name)

INHERITED PROPERTIES: [CODE](#prop-ref-code)[COLUMN_NUMBER](#prop-ref-column_number)[LINE_NUMBER](#prop-ref-line_number)[ORDER](#prop-ref-order)

EXTENDS: [AST_NODE](#node-ref-ast_node)

### Method

The Method Layer contains declarations of methods, functions, and procedures. Input parameters and output parameters (including return parameters) are represented, however, method contents is not present in this layer.

#### METHOD

Programming languages offer many closely-related concepts for describing blocks of code that can be executed with input parameters and return output parameters, possibly causing side effects. In the CPG specification, we refer to all of these concepts (procedures, functions, methods, etc.) as methods. A single METHOD node must exist for each method found in the source program. The \`FULL_NAME\` field specifies the method's fully-qualified name, including information about the namespace it is contained in if applicable, the name field is the function's short name. The field \`IS_EXTERNAL\` indicates whether it was possible to identify a method body for the method. This is true for methods that are defined in the source program, and false for methods that are dynamically linked to the program, that is, methods that exist in an external dependency. Line and column number information is specified in the optional fields \`LINE_NUMBER\`, \`COLUMN_NUMBER\`, \`LINE_NUMBER_END\`, and \`COLUMN_NUMBER_END\` and the name of the source file is specified in \`FILENAME\`. An optional hash value MAY be calculated over the function contents and included in the \`HASH\` field. Finally, the fully qualified name of the program constructs that the method is immediately contained in is stored in the \`AST_PARENT_FULL_NAME\` field and its type is indicated in the \`AST_PARENT_TYPE\` field to be one of \`METHOD\`, \`TYPE_DECL\` or \`NAMESPACE_BLOCK\`.

PROPERTIES: [AST_PARENT_FULL_NAME](#prop-ref-ast_parent_full_name)[AST_PARENT_TYPE](#prop-ref-ast_parent_type)[COLUMN_NUMBER_END](#prop-ref-column_number_end)[FILENAME](#prop-ref-filename)[FULL_NAME](#prop-ref-full_name)[HASH](#prop-ref-hash)[IS_EXTERNAL](#prop-ref-is_external)[LINE_NUMBER_END](#prop-ref-line_number_end)[SIGNATURE](#prop-ref-signature)

INHERITED PROPERTIES: [CODE](#prop-ref-code)[COLUMN_NUMBER](#prop-ref-column_number)[LINE_NUMBER](#prop-ref-line_number)[NAME](#prop-ref-name)[ORDER](#prop-ref-order)

EXTENDS: [AST_NODE](#node-ref-ast_node)[CFG_NODE](#node-ref-cfg_node)[DECLARATION](#node-ref-declaration)

#### METHOD_PARAMETER_IN

This node represents a formal input parameter. The field \`NAME\` contains its name, while the field \`TYPE_FULL_NAME\` contains the fully qualified type name.

PROPERTIES: [EVALUATION_STRATEGY](#prop-ref-evaluation_strategy)[INDEX](#prop-ref-index)[IS_VARIADIC](#prop-ref-is_variadic)[TYPE_FULL_NAME](#prop-ref-type_full_name)

INHERITED PROPERTIES: [CODE](#prop-ref-code)[COLUMN_NUMBER](#prop-ref-column_number)[LINE_NUMBER](#prop-ref-line_number)[NAME](#prop-ref-name)[ORDER](#prop-ref-order)

EXTENDS: [AST_NODE](#node-ref-ast_node)[CFG_NODE](#node-ref-cfg_node)[DECLARATION](#node-ref-declaration)

#### METHOD_PARAMETER_OUT

This node represents a formal output parameter. Corresponding output parameters for input parameters MUST NOT be created by the frontend as they are automatically created upon first loading the CPG.

PROPERTIES: [EVALUATION_STRATEGY](#prop-ref-evaluation_strategy)[INDEX](#prop-ref-index)[IS_VARIADIC](#prop-ref-is_variadic)[TYPE_FULL_NAME](#prop-ref-type_full_name)

INHERITED PROPERTIES: [CODE](#prop-ref-code)[COLUMN_NUMBER](#prop-ref-column_number)[LINE_NUMBER](#prop-ref-line_number)[NAME](#prop-ref-name)[ORDER](#prop-ref-order)

EXTENDS: [AST_NODE](#node-ref-ast_node)[CFG_NODE](#node-ref-cfg_node)[DECLARATION](#node-ref-declaration)

#### METHOD_RETURN

This node represents an (unnamed) formal method return parameter. It carries its fully qualified type name in \`TYPE_FULL_NAME\`. The \`CODE\` field MAY be set freely, e.g., to the constant \`RET\`, however, subsequent layer creators MUST NOT depend on this value.

PROPERTIES: [EVALUATION_STRATEGY](#prop-ref-evaluation_strategy)[TYPE_FULL_NAME](#prop-ref-type_full_name)

INHERITED PROPERTIES: [CODE](#prop-ref-code)[COLUMN_NUMBER](#prop-ref-column_number)[LINE_NUMBER](#prop-ref-line_number)[ORDER](#prop-ref-order)

EXTENDS: [CFG_NODE](#node-ref-cfg_node)

#### IS_VARIADIC

Specifies whether a parameter is the variadic argument handling parameter of a variadic method. Only one parameter of a method is allowed to have this property set to true.

## CARDINALITY one

#### SIGNATURE

The method signature encodes the types of parameters in a string. The string SHOULD be human readable and suitable for differentiating methods with different parameter types sufficiently to allow for resolving of function overloading. The present specification does not enforce a strict format for the signature, that is, it can be chosen by the frontend implementor to fit the source language.

## CARDINALITY one

### Type

The Type Layer contains information about type declarations, relations between types, and type instantiation and usage. In its current form, it allows modelling of parametrized types, type hierarchies and aliases.

#### MEMBER

This node represents a type member of a class, struct or union, e.g., for the type declaration \`class Foo{ int i ; }\`, it represents the declaration of the variable \`i\`.

PROPERTIES: [TYPE_FULL_NAME](#prop-ref-type_full_name)

INHERITED PROPERTIES: [CODE](#prop-ref-code)[COLUMN_NUMBER](#prop-ref-column_number)[LINE_NUMBER](#prop-ref-line_number)[NAME](#prop-ref-name)[ORDER](#prop-ref-order)

EXTENDS: [AST_NODE](#node-ref-ast_node)[DECLARATION](#node-ref-declaration)

#### TYPE

This node represents a type instance, that is, a concrete instantiation of a type declaration.

PROPERTIES: [FULL_NAME](#prop-ref-full_name)[NAME](#prop-ref-name)[TYPE_DECL_FULL_NAME](#prop-ref-type_decl_full_name)

#### TYPE_ARGUMENT

An (actual) type argument as used to instantiate a parametrized type, in the same way an (actual) arguments provides concrete values for a parameter at method call sites. As it true for arguments, the method is not expected to interpret the type argument. It MUST however store its code in the \`CODE\` field.

INHERITED PROPERTIES: [CODE](#prop-ref-code)[COLUMN_NUMBER](#prop-ref-column_number)[LINE_NUMBER](#prop-ref-line_number)[ORDER](#prop-ref-order)

EXTENDS: [AST_NODE](#node-ref-ast_node)

#### TYPE_DECL

This node represents a type declaration as for example given by a class-, struct-, or union declaration. In contrast to a \`TYPE\` node, this node does not represent a concrete instantiation of a type, e.g., for the parametrized type \`List\[T\]\`, it represents \`List\[T\]\`, but not \`List\[Integer\]\` where \`Integer\` is a concrete type. The language frontend MUST create type declarations for all types declared in the source program and MAY provide type declarations for types that are not declared but referenced by the source program. If a declaration is present in the source program, the field \`IS_EXTERNAL\` is set to \`false\`. Otherwise, it is set to \`true\`. The \`FULL_NAME\` field specifies the type's fully-qualified name, including information about the namespace it is contained in if applicable, the name field is the type's short name. Line and column number information is specified in the optional fields \`LINE_NUMBER\`, \`COLUMN_NUMBER\`, \`LINE_NUMBER_END\`, and \`COLUMN_NUMBER_END\` and the name of the source file is specified in \`FILENAME\`. Base types can be specified via the \`INHERITS_FROM_TYPE_FULL_NAME\` list, where each entry contains the fully-qualified name of a base type. If the type is known to be an alias of another type (as for example introduced via the C \`typedef\` statement), the name of the alias is stored in \`ALIAS_TYPE_FULL_NAME\`. Finally, the fully qualified name of the program constructs that the type declaration is immediately contained in is stored in the \`AST_PARENT_FULL_NAME\` field and its type is indicated in the \`AST_PARENT_TYPE\` field to be one of \`METHOD\`, \`TYPE_DECL\` or \`NAMESPACE_BLOCK\`.

PROPERTIES: [ALIAS_TYPE_FULL_NAME](#prop-ref-alias_type_full_name)[AST_PARENT_FULL_NAME](#prop-ref-ast_parent_full_name)[AST_PARENT_TYPE](#prop-ref-ast_parent_type)[FILENAME](#prop-ref-filename)[FULL_NAME](#prop-ref-full_name)[INHERITS_FROM_TYPE_FULL_NAME](#prop-ref-inherits_from_type_full_name)[IS_EXTERNAL](#prop-ref-is_external)[NAME](#prop-ref-name)

INHERITED PROPERTIES: [CODE](#prop-ref-code)[COLUMN_NUMBER](#prop-ref-column_number)[LINE_NUMBER](#prop-ref-line_number)[ORDER](#prop-ref-order)

EXTENDS: [AST_NODE](#node-ref-ast_node)

#### TYPE_PARAMETER

This node represents a formal type parameter, that is, the type parameter as given in a type-parametrized method or type declaration. Examples for languages that support type parameters are Java (via Generics) and C++ (via templates). Apart from the standard fields of AST nodes, the type parameter carries only a \`NAME\` field that holds the parameters name.

PROPERTIES: [NAME](#prop-ref-name)

INHERITED PROPERTIES: [CODE](#prop-ref-code)[COLUMN_NUMBER](#prop-ref-column_number)[LINE_NUMBER](#prop-ref-line_number)[ORDER](#prop-ref-order)

EXTENDS: [AST_NODE](#node-ref-ast_node)

#### ALIAS_OF

This edge represents an alias relation between a type declaration and a type. The language frontend MUST NOT create \`ALIAS_OF\` edges as they are created automatically based on \`ALIAS_TYPE_FULL_NAME\` fields when the CPG is first loaded.

#### BINDS_TO

This edge connects type arguments to type parameters to indicate that the type argument is used to instantiate the type parameter.

#### INHERITS_FROM

Inheritance relation between a type declaration and a type. This edge MUST NOT be created by the language frontend as it is automatically created from \`INHERITS_FROM_TYPE_FULL_NAME\` fields then the CPG is first loaded.

#### ALIAS_TYPE_FULL_NAME

This property holds the fully qualified name of the type that the node is a type alias of.

## CARDINALITY zeroOrOne

#### INHERITS_FROM_TYPE_FULL_NAME

The static types a TYPE_DECL inherits from. This property is matched against the FULL_NAME of TYPE nodes and thus it is required to have at least one TYPE node for each TYPE_FULL_NAME

## CARDINALITY list

#### TYPE_DECL_FULL_NAME

The static type decl of a TYPE. This property is matched against the FULL_NAME of TYPE_DECL nodes. It is required to have exactly one TYPE_DECL for each different TYPE_DECL_FULL_NAME

## CARDINALITY one

#### TYPE_FULL_NAME

This field contains the fully-qualified static type name of the program construct represented by a node. It is the name of an instantiated type, e.g., \`java.util.List\\`, rather than \`java.util.List\[T\]\`. If the type cannot be determined, this field should be set to the empty string.

## CARDINALITY one

### Ast

The Abstract Syntax Tree (AST) Layer provides syntax trees for all compilation units. All nodes of the tree inherit from the same base class (\`AST_NODE\`) and are connected to their child nodes via outgoing \`AST\` edges. Syntax trees are typed, that is, when possible, types for all expressions are stored in the tree. Moreover, common control structure types are defined in the specification, making it possible to translate trees into corresponding control flow graphs if only these common control structure types are used, possibly by desugaring on the side of the language frontend. For cases where this is not an option, the AST specification provides means of storing language-dependent information in the AST that can be interpreted by language-dependent control flow construction passes. This layer MUST be created by the frontend.

#### AST_NODE

This is the base type for all nodes of the abstract syntax tree (AST). An AST node has a \`CODE\` and an \`ORDER\` field. The \`CODE\` field contains the code (verbatim) represented by the AST node. The \`ORDER\` field contains the nodes position among its siblings, encoded as an integer where the left most sibling has the position \`0\`. AST nodes contain optional \`LINE_NUMBER\` and \`COLUMN_NUMBER\` fields. For source-based frontends, these fields contain the start line number and start column number of the code represented by the node. For machine-code-based and bytecode-based frontends, \`LINE_NUMBER\` contains the address at which the code starts while \`COLUMN_NUMBER\` is undefined.

PROPERTIES: [CODE](#prop-ref-code)[COLUMN_NUMBER](#prop-ref-column_number)[LINE_NUMBER](#prop-ref-line_number)[ORDER](#prop-ref-order)

#### BLOCK

This node represents a compound statement. Compound statements are used in many languages to allow grouping a sequence of statements. For example, in C and Java, compound statements are statements enclosed by curly braces. Function/Method bodies are compound statements. We do not use the term "compound statement" because "statement" would imply that the block does not yield a value upon evaluation, that is, that it is not an expression. This is true in languages such as C and Java, but not for languages such as Scala where the value of the block is given by that of the last expression it contains. In fact, the Scala grammar uses the term "BlockExpr" (short for "block expression") to describe what in the CPG we call "Block".

PROPERTIES: [TYPE_FULL_NAME](#prop-ref-type_full_name)

INHERITED PROPERTIES: [ARGUMENT_INDEX](#prop-ref-argument_index)[ARGUMENT_NAME](#prop-ref-argument_name)[CODE](#prop-ref-code)[COLUMN_NUMBER](#prop-ref-column_number)[LINE_NUMBER](#prop-ref-line_number)[ORDER](#prop-ref-order)

EXTENDS: [EXPRESSION](#node-ref-expression)

#### CALL

A (function/method/procedure) call. The \`METHOD_FULL_NAME\` property is the name of the invoked method (the callee) while the \`TYPE_FULL_NAME\` is its return type, and therefore, the return type of the call when viewing it as an expression. For languages like Javascript, it is common that we may know the (short-) name of the invoked method, but we do not know at compile time which method will actually be invoked, e.g., because it depends on a dynamic import. In this case, we leave \`METHOD_FULL_NAME\` blank but at least fill out \`NAME\`, which contains the method's (short-) name and \`SIGNATURE\`, which contains any information we may have about the types of arguments and return value.

PROPERTIES: [DISPATCH_TYPE](#prop-ref-dispatch_type)[METHOD_FULL_NAME](#prop-ref-method_full_name)[TYPE_FULL_NAME](#prop-ref-type_full_name)

INHERITED PROPERTIES: [ARGUMENT_INDEX](#prop-ref-argument_index)[ARGUMENT_NAME](#prop-ref-argument_name)[CODE](#prop-ref-code)[COLUMN_NUMBER](#prop-ref-column_number)[LINE_NUMBER](#prop-ref-line_number)[NAME](#prop-ref-name)[ORDER](#prop-ref-order)[SIGNATURE](#prop-ref-signature)

EXTENDS: [CALL_REPR](#node-ref-call_repr)[EXPRESSION](#node-ref-expression)

#### CALL_REPR

This is the base class of \`CALL\` that language implementers may safely ignore.

PROPERTIES: [NAME](#prop-ref-name)[SIGNATURE](#prop-ref-signature)

INHERITED PROPERTIES: [CODE](#prop-ref-code)[COLUMN_NUMBER](#prop-ref-column_number)[LINE_NUMBER](#prop-ref-line_number)[ORDER](#prop-ref-order)

EXTENDS: [CFG_NODE](#node-ref-cfg_node)

#### CONTROL_STRUCTURE

This node represents a control structure as introduced by control structure statements as well as conditional and unconditional jumps. Its type is stored in the \`CONTROL_STRUCTURE_TYPE\` field to be one of several pre-defined types. These types are used in the construction of the control flow layer, making it possible to generate the control flow layer from the abstract syntax tree layer automatically. In addition to the \`CONTROL_STRUCTURE_TYPE\` field, the \`PARSER_TYPE_NAME\` field MAY be used by frontends to store the name of the control structure as emitted by the parser or disassembler, however, the value of this field is not relevant for construction of the control flow layer.

PROPERTIES: [CONTROL_STRUCTURE_TYPE](#prop-ref-control_structure_type)[PARSER_TYPE_NAME](#prop-ref-parser_type_name)

INHERITED PROPERTIES: [ARGUMENT_INDEX](#prop-ref-argument_index)[ARGUMENT_NAME](#prop-ref-argument_name)[CODE](#prop-ref-code)[COLUMN_NUMBER](#prop-ref-column_number)[LINE_NUMBER](#prop-ref-line_number)[ORDER](#prop-ref-order)

EXTENDS: [EXPRESSION](#node-ref-expression)

#### EXPRESSION

\`EXPRESSION\` is the base class for all nodes that represent code pieces that can be evaluated. Expression may be arguments in method calls. For method calls that do not involved named parameters, the \`ARGUMENT_INDEX\` field indicates at which position in the argument list the expression occurs, e.g., an \`ARGUMENT_INDEX\` of 1 indicates that the expression is the first argument in a method call. For calls that employ named parameters, \`ARGUMENT_INDEX\` is set to -1 and the \`ARGUMENT_NAME\` fields holds the name of the parameter.

PROPERTIES: [ARGUMENT_INDEX](#prop-ref-argument_index)[ARGUMENT_NAME](#prop-ref-argument_name)

INHERITED PROPERTIES: [CODE](#prop-ref-code)[COLUMN_NUMBER](#prop-ref-column_number)[LINE_NUMBER](#prop-ref-line_number)[ORDER](#prop-ref-order)

EXTENDS: [AST_NODE](#node-ref-ast_node)[CFG_NODE](#node-ref-cfg_node)

#### FIELD_IDENTIFIER

This node represents the field accessed in a field access, e.g., in \`a.b\`, it represents \`b\`. The field name as it occurs in the code is stored in the \`CODE\` field. This may mean that the \`CODE\` field holds an expression. The \`CANONICAL_NAME\` field MAY contain the same value is the \`CODE\` field but SHOULD contain the normalized name that results from evaluating \`CODE\` as an expression if such an evaluation is possible for the language frontend. The objective is to store an identifier in \`CANONICAL_NAME\` that is the same for two nodes iff they refer to the same field, regardless of whether they use the same expression to reference it.

PROPERTIES: [CANONICAL_NAME](#prop-ref-canonical_name)

INHERITED PROPERTIES: [ARGUMENT_INDEX](#prop-ref-argument_index)[ARGUMENT_NAME](#prop-ref-argument_name)[CODE](#prop-ref-code)[COLUMN_NUMBER](#prop-ref-column_number)[LINE_NUMBER](#prop-ref-line_number)[ORDER](#prop-ref-order)

EXTENDS: [EXPRESSION](#node-ref-expression)

#### IDENTIFIER

This node represents an identifier as used when referring to a variable by name. It holds the identifier's name in the \`NAME\` field and its fully-qualified type name in \`TYPE_FULL_NAME\`.

PROPERTIES: [NAME](#prop-ref-name)[TYPE_FULL_NAME](#prop-ref-type_full_name)

INHERITED PROPERTIES: [ARGUMENT_INDEX](#prop-ref-argument_index)[ARGUMENT_NAME](#prop-ref-argument_name)[CODE](#prop-ref-code)[COLUMN_NUMBER](#prop-ref-column_number)[LINE_NUMBER](#prop-ref-line_number)[ORDER](#prop-ref-order)

EXTENDS: [EXPRESSION](#node-ref-expression)

#### JUMP_LABEL

A jump label specifies the label and thus the JUMP_TARGET of control structures BREAK and CONTINUE. The \`NAME\` field holds the name of the label while the \`PARSER_TYPE_NAME\` field holds the name of language construct that this jump label is created from, e.g., "Label".

PROPERTIES: [NAME](#prop-ref-name)[PARSER_TYPE_NAME](#prop-ref-parser_type_name)

INHERITED PROPERTIES: [CODE](#prop-ref-code)[COLUMN_NUMBER](#prop-ref-column_number)[LINE_NUMBER](#prop-ref-line_number)[ORDER](#prop-ref-order)

EXTENDS: [AST_NODE](#node-ref-ast_node)

#### JUMP_TARGET

A jump target is any location in the code that has been specifically marked as the target of a jump, e.g., via a label. The \`NAME\` field holds the name of the label while the \`PARSER_TYPE_NAME\` field holds the name of language construct that this jump target is created from, e.g., "Label".

PROPERTIES: [ARGUMENT_INDEX](#prop-ref-argument_index)[NAME](#prop-ref-name)[PARSER_TYPE_NAME](#prop-ref-parser_type_name)

INHERITED PROPERTIES: [CODE](#prop-ref-code)[COLUMN_NUMBER](#prop-ref-column_number)[LINE_NUMBER](#prop-ref-line_number)[ORDER](#prop-ref-order)

EXTENDS: [AST_NODE](#node-ref-ast_node)[CFG_NODE](#node-ref-cfg_node)

#### LITERAL

This node represents a literal such as an integer or string constant. Literals are symbols included in the code in verbatim form and which are immutable. The \`TYPE_FULL_NAME\` field stores the literal's fully-qualified type name, e.g., \`java.lang.Integer\`.

PROPERTIES: [TYPE_FULL_NAME](#prop-ref-type_full_name)

INHERITED PROPERTIES: [ARGUMENT_INDEX](#prop-ref-argument_index)[ARGUMENT_NAME](#prop-ref-argument_name)[CODE](#prop-ref-code)[COLUMN_NUMBER](#prop-ref-column_number)[LINE_NUMBER](#prop-ref-line_number)[ORDER](#prop-ref-order)

EXTENDS: [EXPRESSION](#node-ref-expression)

#### LOCAL

This node represents a local variable. Its fully qualified type name is stored in the \`TYPE_FULL_NAME\` field and its name in the \`NAME\` field. The \`CODE\` field contains the entire local variable declaration without initialization, e.g., for \`int x = 10;\`, it contains \`int x\`.

PROPERTIES: [TYPE_FULL_NAME](#prop-ref-type_full_name)

INHERITED PROPERTIES: [CODE](#prop-ref-code)[COLUMN_NUMBER](#prop-ref-column_number)[LINE_NUMBER](#prop-ref-line_number)[NAME](#prop-ref-name)[ORDER](#prop-ref-order)

EXTENDS: [AST_NODE](#node-ref-ast_node)[DECLARATION](#node-ref-declaration)

#### METHOD_REF

This node represents a reference to a method/function/procedure as it appears when a method is passed as an argument in a call. The \`METHOD_FULL_NAME\` field holds the fully-qualified name of the referenced method and the \`TYPE_FULL_NAME\` holds its fully-qualified type name.

PROPERTIES: [METHOD_FULL_NAME](#prop-ref-method_full_name)[TYPE_FULL_NAME](#prop-ref-type_full_name)

INHERITED PROPERTIES: [ARGUMENT_INDEX](#prop-ref-argument_index)[ARGUMENT_NAME](#prop-ref-argument_name)[CODE](#prop-ref-code)[COLUMN_NUMBER](#prop-ref-column_number)[LINE_NUMBER](#prop-ref-line_number)[ORDER](#prop-ref-order)

EXTENDS: [EXPRESSION](#node-ref-expression)

#### MODIFIER

This field represents a (language-dependent) modifier such as \`static\`, \`private\` or \`public\`. Unlike most other AST nodes, it is NOT an expression, that is, it cannot be evaluated and cannot be passed as an argument in function calls.

PROPERTIES: [MODIFIER_TYPE](#prop-ref-modifier_type)

INHERITED PROPERTIES: [CODE](#prop-ref-code)[COLUMN_NUMBER](#prop-ref-column_number)[LINE_NUMBER](#prop-ref-line_number)[ORDER](#prop-ref-order)

EXTENDS: [AST_NODE](#node-ref-ast_node)

#### RETURN

This node represents a return instruction, e.g., \`return x\`. Note that it does NOT represent a formal return parameter as formal return parameters are represented via \`METHOD_RETURN\` nodes.

INHERITED PROPERTIES: [ARGUMENT_INDEX](#prop-ref-argument_index)[ARGUMENT_NAME](#prop-ref-argument_name)[CODE](#prop-ref-code)[COLUMN_NUMBER](#prop-ref-column_number)[LINE_NUMBER](#prop-ref-line_number)[ORDER](#prop-ref-order)

EXTENDS: [EXPRESSION](#node-ref-expression)

#### TYPE_REF

Reference to a type/class

PROPERTIES: [TYPE_FULL_NAME](#prop-ref-type_full_name)

INHERITED PROPERTIES: [ARGUMENT_INDEX](#prop-ref-argument_index)[ARGUMENT_NAME](#prop-ref-argument_name)[CODE](#prop-ref-code)[COLUMN_NUMBER](#prop-ref-column_number)[LINE_NUMBER](#prop-ref-line_number)[ORDER](#prop-ref-order)

EXTENDS: [EXPRESSION](#node-ref-expression)

#### UNKNOWN

Any AST node that the frontend would like to include in the AST but for which no suitable AST node is specified in the CPG specification may be included using a node of type \`UNKNOWN\`.

PROPERTIES: [CONTAINED_REF](#prop-ref-contained_ref)[PARSER_TYPE_NAME](#prop-ref-parser_type_name)[TYPE_FULL_NAME](#prop-ref-type_full_name)

INHERITED PROPERTIES: [ARGUMENT_INDEX](#prop-ref-argument_index)[ARGUMENT_NAME](#prop-ref-argument_name)[CODE](#prop-ref-code)[COLUMN_NUMBER](#prop-ref-column_number)[LINE_NUMBER](#prop-ref-line_number)[ORDER](#prop-ref-order)

EXTENDS: [EXPRESSION](#node-ref-expression)

#### AST

This edge connects a parent node to its child in the syntax tree.

#### CONDITION

The edge connects control structure nodes to the expressions that holds their conditions.

#### CANONICAL_NAME

This field holds the canonical name of a \`FIELD_IDENTIFIER\`. It is typically identical to the CODE field, but canonicalized according to source language semantics. Human readable names are preferable. \`FIELD_IDENTIFIER\` nodes must share identical \`CANONICAL_NAME\` if and only if they alias, e.g., in C-style unions (if the aliasing relationship is unknown or there are partial overlaps, then one must make a reasonable guess, and trade off between false negatives and false positives).

## CARDINALITY one

#### CONTROL_STRUCTURE_TYPE

The \`CONTROL_STRUCTURE_TYPE\` field indicates which kind of control structure a \`CONTROL_STRUCTURE\` node represents. The available types are the following: BREAK, CONTINUE, DO, WHILE, FOR, GOTO, IF, ELSE, TRY, THROW and SWITCH.

## CARDINALITY one

#### MODIFIER_TYPE

The modifier type is a free-form string. The following are known modifier types: \`STATIC\`, \`PUBLIC\`, \`PROTECTED\`, \`PRIVATE\`, \`ABSTRACT\`, \`NATIVE\`, \`CONSTRUCTOR\`, \`VIRTUAL\`.

## CARDINALITY one

#### ORDER

This integer indicates the position of the node among its siblings in the AST. The left-most child has an order of 0.

## CARDINALITY one

### CallGraph

The Call Graph Layer represents call relations between methods.

#### ARGUMENT

Argument edges connect call sites (node type \`CALL\`) to their arguments (node type \`EXPRESSION\`) as well as \`RETURN\` nodes to the expressions that return.

#### CALL

This edge connects call sites, i.e., nodes with the type \`CALL\`, to the method node that represent the method they invoke. The frontend MAY create \`CALL\` edges but is not required to do so. Instead, of the \`METHOD_FULL_NAME\` field of the \`CALL\` node is set correctly, \`CALL\` edges are created automatically as the CPG is first loaded.

#### RECEIVER

Similar to \`ARGUMENT\` edges, \`RECEIVER\` edges connect call sites to their receiver arguments. A receiver argument is the object on which a method operates, that is, it is the expression that is assigned to the \`this\` pointer as control is transferred to the method.

#### ARGUMENT_INDEX

AST-children of CALL nodes have an argument index, that is used to match call-site arguments with callee parameters. Explicit parameters are numbered from 1 to N, while index 0 is reserved for implicit self / this parameter. CALLs without implicit parameter therefore have arguments starting with index 1. AST-children of BLOCK nodes may have an argument index as well; in this case, the last argument index determines the return expression of a BLOCK expression. If the \`PARAMETER_NAME\` field is set, then the \`ARGUMENT_INDEX\` field is ignored. It is suggested to set it to -1.

## CARDINALITY one

#### ARGUMENT_NAME

For calls involving named parameters, the \`ARGUMENT_NAME\` field holds the name of the parameter initialized by the expression. For all other calls, this field is unset.

## CARDINALITY zeroOrOne

#### DISPATCH_TYPE

This field holds the dispatch type of a call, which is either \`STATIC_DISPATCH\` or \`DYNAMIC_DISPATCH\`. For statically dispatched method calls, the call target is known at compile time while for dynamically dispatched calls, it can only be determined at runtime as it may depend on the type of an object (as is the case for virtual method calls) or calculation of an offset.

## CARDINALITY one

#### EVALUATION_STRATEGY

For formal method input parameters, output parameters, and return parameters, this field holds the evaluation strategy, which is one of the following: 1) \`BY_REFERENCE\` indicates that the parameter is passed by reference, 2) \`BY_VALUE\` indicates that it is passed by value, that is, a copy is made, 3) \`BY_SHARING\` the parameter is a pointer/reference and it is shared with the caller/callee. While a copy of the pointer is made, a copy of the object that it points to is not made.

## CARDINALITY one

#### METHOD_FULL_NAME

The FULL_NAME of a method. Used to link CALL and METHOD nodes. It is required to have exactly one METHOD node for each METHOD_FULL_NAME

## CARDINALITY one

### Cfg

The Control Flow Graph Layer provides control flow graphs for each method. Control flow graphs are constructed by marking a sub set of the abstract syntax tree nodes as control flow nodes (\`CFG_NODE\`) and connecting these nodes via \`CFG\` edges. The control flow graph models both the control flow within the calculation of an expression as well as from expression to expression. The layer can be automatically generated from the syntax tree layer if only control structure types supported by this specification are employed.

#### CFG_NODE

This is the base class for all control flow nodes. It is itself a child class of \`AST_NODE\`, that is, all control flow graph nodes are also syntax tree nodes in the CPG specification.

INHERITED PROPERTIES: [CODE](#prop-ref-code)[COLUMN_NUMBER](#prop-ref-column_number)[LINE_NUMBER](#prop-ref-line_number)[ORDER](#prop-ref-order)

EXTENDS: [AST_NODE](#node-ref-ast_node)

#### CFG

This edge indicates control flow from the source to the destination node.

### Dominators

The Dominators Layer provides dominator- and post-dominator trees for all methods. It is constructed automatically from the control flow graph layer and is in turn used to automatically construct control dependence relations of the PDG layer.

#### DOMINATE

This edge indicates that the source node immediately dominates the destination node.

#### POST_DOMINATE

This edge indicates that the source node immediately post dominates the destination node.

### Pdg

The Program Dependence Graph Layer contains a program dependence graph for each method of the source program. A program dependence graph consists of a data dependence graph (DDG) and a control dependence graph (CDG), created by connecting nodes of the control flow graph via \`REACHING_DEF\` and \`CDG\` edges respectively.

#### CDG

A CDG edge expresses that the destination node is control dependent on the source node.

#### REACHING_DEF

A reaching definition edge indicates that a variable produced at the source node reaches the destination node without being reassigned on the way. The \`VARIABLE\` property indicates which variable is propagated.

#### VARIABLE

This edge property represents the variable propagated by a reaching definition edge.

### Comment

## A source code comment

PROPERTIES: [FILENAME](#prop-ref-filename)

INHERITED PROPERTIES: [CODE](#prop-ref-code)[COLUMN_NUMBER](#prop-ref-column_number)[LINE_NUMBER](#prop-ref-line_number)[ORDER](#prop-ref-order)

EXTENDS: [AST_NODE](#node-ref-ast_node)

### Finding

We allow findings (e.g., potential vulnerabilities, notes on dangerous practices) to be stored in the Findings Layer.

#### FINDING

Finding nodes may be used to store analysis results in the graph that are to be exposed to an end-user, e.g., information about potential vulnerabilities or dangerous programming practices. A Finding node may contain an abitrary list of key value pairs that characterize the finding, as well as a list of nodes that serve as evidence for the finding.

CONTAINED NODES: evidence -\>list[AnyNode](#node-ref-anynode)keyValuePairs -\>list[KEY_VALUE_PAIR](#node-ref-key_value_pair)

#### KEY_VALUE_PAIR

This node represents a key value pair, where both the key and the value are strings.

PROPERTIES: [KEY](#prop-ref-key)[VALUE](#prop-ref-value)

#### KEY

This property denotes a key of a key-value pair.

## CARDINALITY one

### Shortcuts

The Shortcuts Layer provides shortcut edges calculated to speed up subsequent queries. Language frontends MUST NOT create shortcut edges.

#### CONTAINS

This edge connects a node to the method that contains it.

#### EVAL_TYPE

This edge connects a node to its evaluation type.

#### PARAMETER_LINK

This edge connects a method input parameter to the corresponding method output parameter.

### TagsAndLocation

The Code Property Graph specification allows for tags to be attached to arbitrary nodes. Conceptually, this is similar to the creation of Finding nodes, however, tags are to be used for intermediate results rather than end-results that are to be reported to the user.

#### LOCATION

A location node summarizes a source code location.

PROPERTIES: [CLASS_NAME](#prop-ref-class_name)[CLASS_SHORT_NAME](#prop-ref-class_short_name)[FILENAME](#prop-ref-filename)[LINE_NUMBER](#prop-ref-line_number)[METHOD_FULL_NAME](#prop-ref-method_full_name)[METHOD_SHORT_NAME](#prop-ref-method_short_name)[NODE_LABEL](#prop-ref-node_label)[PACKAGE_NAME](#prop-ref-package_name)[SYMBOL](#prop-ref-symbol)

CONTAINED NODES: node -\>zeroOrOne[AnyNode](#node-ref-anynode)

#### TAG

This node represents a tag.

PROPERTIES: [NAME](#prop-ref-name)[VALUE](#prop-ref-value)

#### TAG_NODE_PAIR

This node contains an arbitrary node and an associated tag node.

CONTAINED NODES: node -\>one[AnyNode](#node-ref-anynode)tag -\>one[TAG](#node-ref-tag)

#### TAGGED_BY

Edges from nodes to the tags they are tagged by.

#### CLASS_NAME

## CARDINALITY one

#### CLASS_SHORT_NAME

## CARDINALITY one

#### METHOD_SHORT_NAME

## CARDINALITY one

#### NODE_LABEL

## CARDINALITY one

#### PACKAGE_NAME

## CARDINALITY one

#### SYMBOL

## CARDINALITY one

### Configuration

The code property graph specification currently does not contain schema elements for the representation of configuration files in a structured format, however, it does allow configuration files to be included verbatim in the graph to enable language-/framework- specific passes to access them. This layer provides the necessary schema elements for this basic support of configuration files.

#### CONFIG_FILE

This node type represent a configuration file, where \`NAME\` is the name of the file and \`content\` is its content. The exact representation of the name is left undefined and can be chosen as required by consumers of the corresponding configuration files.

PROPERTIES: [CONTENT](#prop-ref-content)[NAME](#prop-ref-name)

### Binding

We use the concept of "bindings" to support resolving of (method-name, signature) pairs at type declarations (\`TYPE_DECL\`). For each pair that we can resolve, we create a \`BINDING\` node that is connected the the type declaration via an incoming \`BINDS\` edge. The \`BINDING\` node is connected to the method it resolves to via an outgoing \`REF\` edge.

#### BINDING

\`BINDING\` nodes represent name-signature pairs that can be resolved at a type declaration (\`TYPE_DECL\`). They are connected to \`TYPE_DECL\` nodes via incoming \`BINDS\` edges. The bound method is either associated with an outgoing \`REF\` edge to a \`METHOD\` or with the \`METHOD_FULL_NAME\` property. The \`REF\` edge if present has priority.

PROPERTIES: [METHOD_FULL_NAME](#prop-ref-method_full_name)[NAME](#prop-ref-name)[SIGNATURE](#prop-ref-signature)

#### BINDS

This edge connects a type declaration (\`TYPE_DECL\`) with a binding node (\`BINDING\`) and indicates that the type declaration has the binding represented by the binding node, in other words, there is a (name, signature) pair that can be resolved for the type declaration as stored in the binding node.

### Annotation

Java Annotation related CPG definitions.

#### ANNOTATION

A method annotation. The semantics of the FULL_NAME property on this node differ from the usual FULL_NAME semantics in the sense that FULL_NAME describes the represented annotation class/interface itself and not the ANNOTATION node.

PROPERTIES: [FULL_NAME](#prop-ref-full_name)[NAME](#prop-ref-name)

INHERITED PROPERTIES: [ARGUMENT_INDEX](#prop-ref-argument_index)[ARGUMENT_NAME](#prop-ref-argument_name)[CODE](#prop-ref-code)[COLUMN_NUMBER](#prop-ref-column_number)[LINE_NUMBER](#prop-ref-line_number)[ORDER](#prop-ref-order)

EXTENDS: [EXPRESSION](#node-ref-expression)

#### ANNOTATION_LITERAL

A literal value assigned to an ANNOTATION_PARAMETER

PROPERTIES: [NAME](#prop-ref-name)

INHERITED PROPERTIES: [ARGUMENT_INDEX](#prop-ref-argument_index)[ARGUMENT_NAME](#prop-ref-argument_name)[CODE](#prop-ref-code)[COLUMN_NUMBER](#prop-ref-column_number)[LINE_NUMBER](#prop-ref-line_number)[ORDER](#prop-ref-order)

EXTENDS: [EXPRESSION](#node-ref-expression)

#### ANNOTATION_PARAMETER

## Formal annotation parameter

INHERITED PROPERTIES: [CODE](#prop-ref-code)[COLUMN_NUMBER](#prop-ref-column_number)[LINE_NUMBER](#prop-ref-line_number)[ORDER](#prop-ref-order)

EXTENDS: [AST_NODE](#node-ref-ast_node)

#### ANNOTATION_PARAMETER_ASSIGN

## Assignment of annotation argument to annotation parameter

INHERITED PROPERTIES: [CODE](#prop-ref-code)[COLUMN_NUMBER](#prop-ref-column_number)[LINE_NUMBER](#prop-ref-line_number)[ORDER](#prop-ref-order)

EXTENDS: [AST_NODE](#node-ref-ast_node)

#### ARRAY_INITIALIZER

## Initialization construct for arrays

INHERITED PROPERTIES: [ARGUMENT_INDEX](#prop-ref-argument_index)[ARGUMENT_NAME](#prop-ref-argument_name)[CODE](#prop-ref-code)[COLUMN_NUMBER](#prop-ref-column_number)[LINE_NUMBER](#prop-ref-line_number)[ORDER](#prop-ref-order)

EXTENDS: [AST_NODE](#node-ref-ast_node)[EXPRESSION](#node-ref-expression)

### Base

#### DECLARATION

This is the base node class for all declarations.

PROPERTIES: [NAME](#prop-ref-name)

#### REF

This edge indicates that the source node is an identifier that denotes access to the destination node. For example, an identifier may reference a local variable.

#### AST_PARENT_FULL_NAME

This field holds the FULL_NAME of the AST parent of an entity.

## CARDINALITY one

#### AST_PARENT_TYPE

The type of the AST parent. Since this is only used in some parts of the graph, the list does not include all possible parents by intention. Possible parents: METHOD, TYPE_DECL, NAMESPACE_BLOCK.

## CARDINALITY one

#### CODE

This field holds the code snippet that the node represents.

## CARDINALITY one

#### CONTENT

Certain files, e.g., configuration files, may be included in the CPG as-is. For such files, the \`CONTENT\` field contains the files content.

## CARDINALITY one

#### FULL_NAME

This is the fully-qualified name of an entity, e.g., the fully-qualified name of a method or type. The details of what constitutes a fully-qualified name are language specific. This field SHOULD be human readable.

## CARDINALITY one

#### HASH

This property contains a hash value in the form of a string. Hashes can be used to summarize data, e.g., to summarize the contents of source files or sub graphs. Such summaries are useful to determine whether code has already been analyzed in incremental analysis pipelines. This property is optional to allow its calculation to be deferred or skipped if the hash is not needed.

## CARDINALITY zeroOrOne

#### INDEX

Specifies an index, e.g., for a parameter or argument. Explicit parameters are numbered from 1 to N, while index 0 is reserved for implicit self / this parameter.

## CARDINALITY one

#### IS_EXTERNAL

Indicates that the construct (METHOD or TYPE_DECL) is external, that is, it is referenced but not defined in the code (applies both to insular parsing and to library functions where we have header files only)

## CARDINALITY one

#### NAME

Name of represented object, e.g., method name (e.g. "run")

## CARDINALITY one

#### PARSER_TYPE_NAME

AST node type name emitted by parser.

## CARDINALITY one

#### VALUE

This property denotes a string value as used in a key-value pair.

## CARDINALITY one

#### VERSION

A version, given as a string. Used, for example, in the META_DATA node to indicate which version of the CPG spec this CPG conforms to

## CARDINALITY one
