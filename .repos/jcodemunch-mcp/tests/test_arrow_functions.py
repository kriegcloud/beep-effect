"""Tests for arrow function variable support in JS/TS."""

import pytest
from jcodemunch_mcp.parser import parse_file


# --- Arrow function assigned to const ---

JS_ARROW_BASIC = '''\
const add = (a, b) => a + b;
'''

def test_js_arrow_function_indexed():
    """const add = (a, b) => ... should be indexed as a function."""
    symbols = parse_file(JS_ARROW_BASIC, "utils.js", "javascript")
    func = next((s for s in symbols if s.name == "add"), None)
    assert func is not None
    assert func.kind == "function"
    assert func.id == "utils.js::add#function"


# --- Function expression assigned to const ---

JS_FUNCTION_EXPRESSION = '''\
const multiply = function(a, b) {
    return a * b;
};
'''

def test_js_function_expression_indexed():
    """const multiply = function() {} should be indexed as a function."""
    symbols = parse_file(JS_FUNCTION_EXPRESSION, "math.js", "javascript")
    func = next((s for s in symbols if s.name == "multiply"), None)
    assert func is not None
    assert func.kind == "function"


# --- Generator function expression ---

JS_GENERATOR_EXPRESSION = '''\
const generate = function*(items) {
    for (const item of items) yield item;
};
'''

def test_js_generator_expression_indexed():
    """const generate = function*() {} should be indexed as a function."""
    symbols = parse_file(JS_GENERATOR_EXPRESSION, "gen.js", "javascript")
    func = next((s for s in symbols if s.name == "generate"), None)
    assert func is not None
    assert func.kind == "function"


# --- Exported arrow function ---

JS_EXPORTED_ARROW = '''\
export const validate = (input) => {
    return input.length > 0;
};
'''

def test_js_exported_arrow_includes_export_in_signature():
    """Exported arrow functions should have 'export' in signature."""
    symbols = parse_file(JS_EXPORTED_ARROW, "validate.js", "javascript")
    func = next((s for s in symbols if s.name == "validate"), None)
    assert func is not None
    assert func.kind == "function"
    assert "export" in func.signature


# --- TypeScript arrow with type annotation ---

TS_ARROW_TYPED = '''\
export const validate = (input: string): boolean => {
    return input.length > 0;
};
'''

def test_ts_arrow_typed():
    """TypeScript arrow with type annotations should be indexed."""
    symbols = parse_file(TS_ARROW_TYPED, "validate.ts", "typescript")
    func = next((s for s in symbols if s.name == "validate"), None)
    assert func is not None
    assert func.kind == "function"
    assert "export" in func.signature


# --- Non-function assignments should NOT be indexed ---

JS_NON_FUNCTION_ASSIGNMENTS = '''\
const x = 5;
const arr = [1, 2, 3];
const obj = { key: "value" };
const str = "hello";
'''

def test_non_function_assignments_not_indexed():
    """Plain value assignments should not create function symbols."""
    symbols = parse_file(JS_NON_FUNCTION_ASSIGNMENTS, "vals.js", "javascript")
    func_symbols = [s for s in symbols if s.kind == "function"]
    assert len(func_symbols) == 0


# --- Inline arrow callbacks should NOT be indexed ---

JS_INLINE_ARROW = '''\
[1, 2, 3].map(x => x + 1);
const result = items.filter(item => item.active);
'''

def test_inline_arrow_not_indexed():
    """Arrow functions not assigned via variable_declarator should not be indexed."""
    symbols = parse_file(JS_INLINE_ARROW, "inline.js", "javascript")
    func_symbols = [s for s in symbols if s.kind == "function"]
    assert len(func_symbols) == 0


# --- Destructuring should NOT be indexed ---

JS_DESTRUCTURING = '''\
const { foo, bar } = require("something");
const [a, b] = [1, 2];
'''

def test_destructuring_not_indexed():
    """Destructuring assignments should not create function symbols."""
    symbols = parse_file(JS_DESTRUCTURING, "destructure.js", "javascript")
    func_symbols = [s for s in symbols if s.kind == "function"]
    assert len(func_symbols) == 0


# --- Docstring extraction from preceding comment ---

JS_ARROW_WITH_DOCSTRING = '''\
/** Adds two numbers together. */
const add = (a, b) => a + b;
'''

def test_arrow_docstring_extraction():
    """Arrow function should pick up preceding JSDoc comment."""
    symbols = parse_file(JS_ARROW_WITH_DOCSTRING, "doc.js", "javascript")
    func = next((s for s in symbols if s.name == "add"), None)
    assert func is not None
    assert "Adds two numbers" in func.docstring


# --- Signature includes params ---

JS_ARROW_MULTILINE = '''\
const processData = (data, options) => {
    return data;
};
'''

def test_arrow_signature_includes_params():
    """Arrow function signature should include parameter list."""
    symbols = parse_file(JS_ARROW_MULTILINE, "process.js", "javascript")
    func = next((s for s in symbols if s.name == "processData"), None)
    assert func is not None
    assert "data" in func.signature
    assert "options" in func.signature


# --- Multiple arrow functions in one file ---

JS_MULTIPLE_ARROWS = '''\
const foo = () => {};
function bar() {}
const baz = (x) => x * 2;
'''

def test_multiple_arrows_with_regular_functions():
    """Both arrow and regular functions should be indexed."""
    symbols = parse_file(JS_MULTIPLE_ARROWS, "multi.js", "javascript")
    names = {s.name for s in symbols if s.kind == "function"}
    assert "foo" in names
    assert "bar" in names
    assert "baz" in names
