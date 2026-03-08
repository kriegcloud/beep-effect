## Members

<dl>
<dt><a href="#term">term</a> ⇒ <code>undefined</code> | <code>Term</code></dt>
<dd><p>Gets the current RDF/JS term or undefined if pointer has no context</p>
</dd>
<dt><a href="#terms">terms</a> ⇒ <code>Array.&lt;Term&gt;</code></dt>
<dd><p>Gets the current terms or an empty array if the pointer has no context</p>
</dd>
<dt><a href="#value">value</a> ⇒ <code>undefined</code> | <code>string</code></dt>
<dd><p>Gets the string representation of term</p>
</dd>
<dt><a href="#values">values</a> ⇒ <code>Array.&lt;string&gt;</code></dt>
<dd><p>Gets the string representation of terms</p>
</dd>
<dt><a href="#dataset">dataset</a> ⇒ <code>undefined</code> | <code>DatasetCore</code></dt>
<dd><p>Gets the current context&#39;s dataset, or undefined if there are multiple</p>
</dd>
<dt><a href="#datasets">datasets</a> ⇒ <code>Array.&lt;DatasetCore&gt;</code></dt>
<dd><p>Gets the current context&#39;s datasets</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#any">any()</a> ⇒ <code>Clownface</code></dt>
<dd><p>Removes current pointers from the context and return an &quot;any pointer&quot;.
The returned object can be used to find any nodes in the dataset</p>
</dd>
<dt><a href="#isList">isList()</a> ⇒ <code>boolean</code></dt>
<dd><p>Returns true if the current term is a rdf:List</p>
</dd>
<dt><a href="#list">list()</a> ⇒ <code>Iterable</code> | <code>null</code></dt>
<dd><p>Creates an iterator which iterates and rdf:List of the current term</p>
</dd>
<dt><a href="#toArray">toArray()</a> ⇒ <code>Array.&lt;Clownface&gt;</code></dt>
<dd><p>Returns an array of graph pointers where each one has a single _context</p>
</dd>
<dt><a href="#filter">filter(callback)</a> ⇒ <code>Clownface</code></dt>
<dd><p>Returns graph pointers which meet the condition specified in a callback function</p>
</dd>
<dt><a href="#forEach">forEach(callback)</a> ⇒ <code>Clownface</code></dt>
<dd><p>Performs the specified action on every graph pointer</p>
</dd>
<dt><a href="#map">map(callback)</a> ⇒ <code>Array.&lt;T&gt;</code></dt>
<dd><p>Calls a defined callback function on each graph pointer, and returns an array that contains the results.</p>
</dd>
<dt><a href="#node">node(values, [options])</a> ⇒ <code>Clownface</code></dt>
<dd><p>Creates graph pointer to one or more node(s)</p>
<p>Depending on the value creates pointers to:</p>
<ul>
<li>blank node context for null <code>values</code></li>
<li>literal for string <code>values</code> and no <code>options</code> paramter</li>
<li>matching RDF/JS term</li>
<li>term created according to <code>options.type</code> parameter</li>
</ul>
</dd>
<dt><a href="#blankNode">blankNode([values])</a> ⇒ <code>Clownface</code></dt>
<dd><p>Creates graph pointer to one or more blank nodes</p>
</dd>
<dt><a href="#literal">literal(values, [languageOrDatatype])</a> ⇒ <code>Clownface</code></dt>
<dd><p>Creates graph pointer to one or more literal nodes</p>
</dd>
<dt><a href="#namedNode">namedNode(values)</a> ⇒ <code>Clownface</code></dt>
<dd><p>Creates graph pointer to one or more named nodes</p>
</dd>
<dt><a href="#in">in([predicates])</a> ⇒ <code>Clownface</code></dt>
<dd><p>Creates a graph pointer to nodes which are linked to the current pointer by <code>predicates</code></p>
</dd>
<dt><a href="#out">out([predicates], [options])</a> ⇒ <code>Clownface</code></dt>
<dd><p>Creates a graph pointer to the result nodes after following a predicate, or after
following any predicates in an array, starting from the subject(s) (current graph pointer) to the objects.</p>
</dd>
<dt><a href="#has">has(predicates, [objects])</a> ⇒ <code>Clownface</code></dt>
<dd><p>Creates a graph pointer to nodes which are subjects of predicates, optionally also with specific objects</p>
<p>If the current context is empty, will check all potential subjects</p>
</dd>
<dt><a href="#addIn">addIn(predicates, subjects, [callback])</a> ⇒ <code>Clownface</code></dt>
<dd><p>Creates a new quad(s) in the dataset where the current context is the object</p>
</dd>
<dt><a href="#addOut">addOut(predicates, objects, [callback])</a> ⇒ <code>Clownface</code></dt>
<dd><p>Creates a new quad(s) in the dataset where the current context is the subject</p>
</dd>
<dt><a href="#addList">addList(predicates, items)</a> ⇒ <code>Clownface</code></dt>
<dd><p>Creates a new RDF list or lists containing the given items</p>
</dd>
<dt><a href="#deleteIn">deleteIn([predicates], [subjects])</a> ⇒ <code>Clownface</code></dt>
<dd><p>Deletes all quads where the current graph pointer contexts are the objects</p>
</dd>
<dt><a href="#deleteOut">deleteOut([predicates], [objects])</a> ⇒ <code>Clownface</code></dt>
<dd><p>Deletes all quads where the current graph pointer contexts are the subjects</p>
</dd>
<dt><a href="#deleteList">deleteList(predicates)</a> ⇒ <code>Clownface</code></dt>
<dd><p>Deletes entire RDF lists where the current graph pointer is the subject</p>
</dd>
<dt><a href="#filterTaggedLiterals">filterTaggedLiterals(terms, [options])</a> ⇒ <code>Array.&lt;Term&gt;</code></dt>
<dd></dd>
</dl>

## Typedefs

<dl>
<dt><a href="#GraphPointerCallback">GraphPointerCallback</a> : <code>function</code></dt>
<dd></dd>
<dt><a href="#FilterCallback">FilterCallback</a> ⇒ <code>boolean</code></dt>
<dd></dd>
<dt><a href="#ForEachCallback">ForEachCallback</a> : <code>function</code></dt>
<dd></dd>
<dt><a href="#MapCallback">MapCallback</a> ⇒ <code>T</code></dt>
<dd></dd>
</dl>

<a name="term"></a>

## term ⇒ <code>undefined</code> \| <code>Term</code>
Gets the current RDF/JS term or undefined if pointer has no context

**Kind**: global variable  
<a name="terms"></a>

## terms ⇒ <code>Array.&lt;Term&gt;</code>
Gets the current terms or an empty array if the pointer has no context

**Kind**: global variable  
<a name="value"></a>

## value ⇒ <code>undefined</code> \| <code>string</code>
Gets the string representation of term

**Kind**: global variable  
<a name="values"></a>

## values ⇒ <code>Array.&lt;string&gt;</code>
Gets the string representation of terms

**Kind**: global variable  
<a name="dataset"></a>

## dataset ⇒ <code>undefined</code> \| <code>DatasetCore</code>
Gets the current context's dataset, or undefined if there are multiple

**Kind**: global variable  
<a name="datasets"></a>

## datasets ⇒ <code>Array.&lt;DatasetCore&gt;</code>
Gets the current context's datasets

**Kind**: global variable  
<a name="any"></a>

## any() ⇒ <code>Clownface</code>
Removes current pointers from the context and return an "any pointer".
The returned object can be used to find any nodes in the dataset

**Kind**: global function  
<a name="isList"></a>

## isList() ⇒ <code>boolean</code>
Returns true if the current term is a rdf:List

**Kind**: global function  
<a name="list"></a>

## list() ⇒ <code>Iterable</code> \| <code>null</code>
Creates an iterator which iterates and rdf:List of the current term

**Kind**: global function  
<a name="toArray"></a>

## toArray() ⇒ <code>Array.&lt;Clownface&gt;</code>
Returns an array of graph pointers where each one has a single _context

**Kind**: global function  
<a name="filter"></a>

## filter(callback) ⇒ <code>Clownface</code>
Returns graph pointers which meet the condition specified in a callback function

**Kind**: global function  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>callback</td><td><code><a href="#FilterCallback">FilterCallback</a></code></td>
    </tr>  </tbody>
</table>

<a name="forEach"></a>

## forEach(callback) ⇒ <code>Clownface</code>
Performs the specified action on every graph pointer

**Kind**: global function  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>callback</td><td><code><a href="#ForEachCallback">ForEachCallback</a></code></td>
    </tr>  </tbody>
</table>

<a name="map"></a>

## map(callback) ⇒ <code>Array.&lt;T&gt;</code>
Calls a defined callback function on each graph pointer, and returns an array that contains the results.

**Kind**: global function  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>callback</td><td><code>MapCallback.&lt;T&gt;</code></td>
    </tr>  </tbody>
</table>

<a name="node"></a>

## node(values, [options]) ⇒ <code>Clownface</code>
Creates graph pointer to one or more node(s)

Depending on the value creates pointers to:

- blank node context for null `values`
- literal for string `values` and no `options` paramter
- matching RDF/JS term
- term created according to `options.type` parameter

**Kind**: global function  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>values</td><td><code>null</code> | <code>string</code> | <code>Array.&lt;string&gt;</code> | <code>Term</code> | <code>Array.&lt;Term&gt;</code> | <code>Clownface</code> | <code>Array.&lt;Clownface&gt;</code></td><td></td>
    </tr><tr>
    <td>[options]</td><td><code>Object</code></td><td></td>
    </tr><tr>
    <td>[options.type]</td><td><code>&quot;NamedNode&quot;</code> | <code>&quot;BlankNode&quot;</code> | <code>&quot;Literal&quot;</code></td><td><p>explicit type for nodes</p>
</td>
    </tr><tr>
    <td>[options.language]</td><td><code>string</code></td><td><p>language tag of literals</p>
</td>
    </tr><tr>
    <td>[options.datatype]</td><td><code>string</code></td><td><p>datatype of literals</p>
</td>
    </tr>  </tbody>
</table>

<a name="blankNode"></a>

## blankNode([values]) ⇒ <code>Clownface</code>
Creates graph pointer to one or more blank nodes

**Kind**: global function  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>[values]</td><td><code>null</code> | <code>string</code> | <code>Array.&lt;string&gt;</code> | <code>BlankNode</code> | <code>Array.&lt;BlankNode&gt;</code> | <code>Clownface</code> | <code>Array.&lt;Clownface&gt;</code></td><td><p>blank node identifiers (generates it when falsy) or existing RDF/JS blank node(s)</p>
</td>
    </tr>  </tbody>
</table>

<a name="literal"></a>

## literal(values, [languageOrDatatype]) ⇒ <code>Clownface</code>
Creates graph pointer to one or more literal nodes

**Kind**: global function  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>values</td><td><code>string</code> | <code>Array.&lt;string&gt;</code> | <code>boolean</code> | <code>Array.&lt;boolean&gt;</code> | <code>number</code> | <code>Array.&lt;number&gt;</code> | <code>Literal</code> | <code>Array.&lt;Literal&gt;</code> | <code>Clownface</code> | <code>Array.&lt;Clownface&gt;</code></td><td><p>literal values as JS objects or RDF/JS Literal(s)</p>
</td>
    </tr><tr>
    <td>[languageOrDatatype]</td><td><code>string</code> | <code>Term</code></td><td><p>a language tag string or datatype term</p>
</td>
    </tr>  </tbody>
</table>

<a name="namedNode"></a>

## namedNode(values) ⇒ <code>Clownface</code>
Creates graph pointer to one or more named nodes

**Kind**: global function  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>values</td><td><code>string</code> | <code>Array.&lt;string&gt;</code> | <code>NamedNode</code> | <code>Array.&lt;NamedNode&gt;</code> | <code>Clownface</code> | <code>Array.&lt;Clownface&gt;</code></td><td><p>URI(s) or RDF/JS NamedNode(s)</p>
</td>
    </tr>  </tbody>
</table>

<a name="in"></a>

## in([predicates]) ⇒ <code>Clownface</code>
Creates a graph pointer to nodes which are linked to the current pointer by `predicates`

**Kind**: global function  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>[predicates]</td><td><code>Term</code> | <code>Array.&lt;Term&gt;</code> | <code>Clownface</code> | <code>Array.&lt;Clownface&gt;</code></td><td><p>one or more RDF/JS term identifying a property</p>
</td>
    </tr>  </tbody>
</table>

<a name="out"></a>

## out([predicates], [options]) ⇒ <code>Clownface</code>
Creates a graph pointer to the result nodes after following a predicate, or after
following any predicates in an array, starting from the subject(s) (current graph pointer) to the objects.

**Kind**: global function  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>[predicates]</td><td><code>Term</code> | <code>Array.&lt;Term&gt;</code> | <code>Clownface</code> | <code>Array.&lt;Clownface&gt;</code></td><td><p>any predicates to follow</p>
</td>
    </tr><tr>
    <td>[options]</td><td><code>object</code></td><td></td>
    </tr><tr>
    <td>[options.language]</td><td><code>string</code> | <code>Array.&lt;string&gt;</code> | <code>undefined</code></td><td></td>
    </tr>  </tbody>
</table>

<a name="has"></a>

## has(predicates, [objects]) ⇒ <code>Clownface</code>
Creates a graph pointer to nodes which are subjects of predicates, optionally also with specific objects

If the current context is empty, will check all potential subjects

**Kind**: global function  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>predicates</td><td><code>Term</code> | <code>Array.&lt;Term&gt;</code> | <code>Clownface</code> | <code>Array.&lt;Clownface&gt;</code></td><td><p>RDF property identifiers</p>
</td>
    </tr><tr>
    <td>[objects]</td><td><code>*</code></td><td><p>object values to match</p>
</td>
    </tr>  </tbody>
</table>

<a name="addIn"></a>

## addIn(predicates, subjects, [callback]) ⇒ <code>Clownface</code>
Creates a new quad(s) in the dataset where the current context is the object

**Kind**: global function  
**Returns**: <code>Clownface</code> - current graph pointer  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>predicates</td><td><code>Term</code> | <code>Array.&lt;Term&gt;</code> | <code>Clownface</code> | <code>Array.&lt;Clownface&gt;</code></td><td></td>
    </tr><tr>
    <td>subjects</td><td><code>NamedNode</code> | <code>Array.&lt;NamedNode&gt;</code> | <code>Clownface</code> | <code>Array.&lt;Clownface&gt;</code></td><td><p>one or more nodes to use as subjects</p>
</td>
    </tr><tr>
    <td>[callback]</td><td><code><a href="#GraphPointerCallback">GraphPointerCallback</a></code></td><td><p>called for each object, with subject pointer as parameter</p>
</td>
    </tr>  </tbody>
</table>

<a name="addOut"></a>

## addOut(predicates, objects, [callback]) ⇒ <code>Clownface</code>
Creates a new quad(s) in the dataset where the current context is the subject

**Kind**: global function  
**Returns**: <code>Clownface</code> - current graph pointer  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>predicates</td><td><code>Term</code> | <code>Array.&lt;Term&gt;</code> | <code>Clownface</code> | <code>Array.&lt;Clownface&gt;</code></td><td></td>
    </tr><tr>
    <td>objects</td><td><code>*</code></td><td><p>one or more values to use for objects</p>
</td>
    </tr><tr>
    <td>[callback]</td><td><code><a href="#GraphPointerCallback">GraphPointerCallback</a></code></td><td><p>called for each subject, with object pointer as parameter</p>
</td>
    </tr>  </tbody>
</table>

<a name="addList"></a>

## addList(predicates, items) ⇒ <code>Clownface</code>
Creates a new RDF list or lists containing the given items

**Kind**: global function  
**Returns**: <code>Clownface</code> - current graph pointer  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>predicates</td><td><code>Term</code> | <code>Array.&lt;Term&gt;</code> | <code>Clownface</code> | <code>Array.&lt;Clownface&gt;</code></td><td></td>
    </tr><tr>
    <td>items</td><td><code>*</code></td><td><p>one or more values to use for subjects</p>
</td>
    </tr>  </tbody>
</table>

<a name="deleteIn"></a>

## deleteIn([predicates], [subjects]) ⇒ <code>Clownface</code>
Deletes all quads where the current graph pointer contexts are the objects

**Kind**: global function  
**Returns**: <code>Clownface</code> - current graph pointer  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>[predicates]</td><td><code>Term</code> | <code>Array.&lt;Term&gt;</code> | <code>Clownface</code> | <code>Array.&lt;Clownface&gt;</code></td>
    </tr><tr>
    <td>[subjects]</td><td><code>Term</code> | <code>Array.&lt;Term&gt;</code> | <code>Clownface</code> | <code>Array.&lt;Clownface&gt;</code></td>
    </tr>  </tbody>
</table>

<a name="deleteOut"></a>

## deleteOut([predicates], [objects]) ⇒ <code>Clownface</code>
Deletes all quads where the current graph pointer contexts are the subjects

**Kind**: global function  
**Returns**: <code>Clownface</code> - current graph pointer  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>[predicates]</td><td><code>Term</code> | <code>Array.&lt;Term&gt;</code> | <code>Clownface</code> | <code>Array.&lt;Clownface&gt;</code></td>
    </tr><tr>
    <td>[objects]</td><td><code>Term</code> | <code>Array.&lt;Term&gt;</code> | <code>Clownface</code> | <code>Array.&lt;Clownface&gt;</code></td>
    </tr>  </tbody>
</table>

<a name="deleteList"></a>

## deleteList(predicates) ⇒ <code>Clownface</code>
Deletes entire RDF lists where the current graph pointer is the subject

**Kind**: global function  
**Returns**: <code>Clownface</code> - current graph pointer  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>predicates</td><td><code>Term</code> | <code>Array.&lt;Term&gt;</code> | <code>Clownface</code> | <code>Array.&lt;Clownface&gt;</code></td>
    </tr>  </tbody>
</table>

<a name="filterTaggedLiterals"></a>

## filterTaggedLiterals(terms, [options]) ⇒ <code>Array.&lt;Term&gt;</code>
**Kind**: global function  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>terms</td><td><code>Array.&lt;Term&gt;</code></td>
    </tr><tr>
    <td>[options]</td><td><code>object</code></td>
    </tr><tr>
    <td>[options.language]</td><td><code>string</code> | <code>Array.&lt;string&gt;</code></td>
    </tr>  </tbody>
</table>

<a name="GraphPointerCallback"></a>

## GraphPointerCallback : <code>function</code>
**Kind**: global typedef  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>pointer</td><td><code>Clownface</code></td><td><p>graph pointer to the new or existing node</p>
</td>
    </tr>  </tbody>
</table>

<a name="FilterCallback"></a>

## FilterCallback ⇒ <code>boolean</code>
**Kind**: global typedef  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>pointer</td><td><code>Clownface</code></td>
    </tr><tr>
    <td>index</td><td><code>number</code></td>
    </tr><tr>
    <td>pointers</td><td><code>Array.&lt;Clownface&gt;</code></td>
    </tr>  </tbody>
</table>

<a name="ForEachCallback"></a>

## ForEachCallback : <code>function</code>
**Kind**: global typedef  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>pointer</td><td><code>Clownface</code></td>
    </tr>  </tbody>
</table>

<a name="MapCallback"></a>

## MapCallback ⇒ <code>T</code>
**Kind**: global typedef  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>pointer</td><td><code>Clownface</code></td>
    </tr>  </tbody>
</table>

