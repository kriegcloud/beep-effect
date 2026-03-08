"""Tests for language-specific parsing."""

import pytest
from jcodemunch_mcp.parser import parse_file


JAVASCRIPT_SOURCE = '''
/** Greet a user. */
function greet(name) {
    return `Hello, ${name}!`;
}

class Calculator {
    /** Add two numbers. */
    add(a, b) {
        return a + b;
    }
}

const MAX_RETRY = 5;
'''


def test_parse_javascript():
    """Test JavaScript parsing."""
    symbols = parse_file(JAVASCRIPT_SOURCE, "app.js", "javascript")
    
    # Should have function, class, method, constant
    func = next((s for s in symbols if s.name == "greet"), None)
    assert func is not None
    assert func.kind == "function"
    assert "Greet a user" in func.docstring
    
    cls = next((s for s in symbols if s.name == "Calculator"), None)
    assert cls is not None
    assert cls.kind == "class"
    
    method = next((s for s in symbols if s.name == "add"), None)
    assert method is not None
    assert method.kind == "method"


TYPESCRIPT_SOURCE = '''
interface User {
    name: string;
}

/** Get user by ID. */
function getUser(id: number): User {
    return { name: "Test" };
}

class UserService {
    private users: User[] = [];
    
    @cache()
    findById(id: number): User | undefined {
        return this.users.find(u => u.id === id);
    }
}

type ID = string | number;
'''


def test_parse_typescript():
    """Test TypeScript parsing."""
    symbols = parse_file(TYPESCRIPT_SOURCE, "service.ts", "typescript")
    
    # Should have interface, function, class, method, type alias
    func = next((s for s in symbols if s.name == "getUser"), None)
    assert func is not None
    assert func.kind == "function"
    
    interface = next((s for s in symbols if s.name == "User"), None)
    assert interface is not None
    assert interface.kind == "type"


GO_SOURCE = '''
package main

import "fmt"

// Person represents a person.
type Person struct {
    Name string
}

// Greet prints a greeting.
func (p *Person) Greet() {
    fmt.Println("Hello, " + p.Name)
}

// Add adds two numbers.
func Add(a, b int) int {
    return a + b
}

const MaxCount = 100
'''


def test_parse_go():
    """Test Go parsing."""
    symbols = parse_file(GO_SOURCE, "main.go", "go")
    
    # Should have type, method, function, constant
    person = next((s for s in symbols if s.name == "Person"), None)
    assert person is not None
    assert person.kind == "type"
    
    greet = next((s for s in symbols if s.name == "Greet"), None)
    assert greet is not None
    assert greet.kind == "method"


RUST_SOURCE = '''
/// A user in the system.
pub struct User {
    name: String,
}

impl User {
    /// Create a new user.
    pub fn new(name: &str) -> Self {
        Self { name: name.to_string() }
    }
    
    /// Get the user's name.
    pub fn name(&self) -> &str {
        &self.name
    }
}

pub const MAX_USERS: usize = 1000;
'''


def test_parse_rust():
    """Test Rust parsing."""
    symbols = parse_file(RUST_SOURCE, "user.rs", "rust")
    
    # Should have struct, impl, methods, constant
    user = next((s for s in symbols if s.name == "User"), None)
    assert user is not None
    assert user.kind == "type"


JAVA_SOURCE = '''
/**
 * A simple calculator.
 */
public class Calculator {
    public static final int MAX_VALUE = 100;
    
    /**
     * Add two numbers.
     */
    public int add(int a, int b) {
        return a + b;
    }
}

interface Operable {
    int operate(int a, int b);
}
'''


def test_parse_java():
    """Test Java parsing."""
    symbols = parse_file(JAVA_SOURCE, "Calculator.java", "java")

    # Should have class, method, interface
    calc = next((s for s in symbols if s.name == "Calculator"), None)
    assert calc is not None
    assert calc.kind == "class"

    add = next((s for s in symbols if s.name == "add"), None)
    assert add is not None
    assert add.kind == "method"


PHP_SOURCE = '''<?php

const MAX_RETRIES = 3;

/**
 * Authenticate a user token.
 */
function authenticate(string $token): bool
{
    return strlen($token) > 0;
}

/**
 * Manages user operations.
 */
class UserService
{
    /**
     * Get a user by ID.
     */
    public function getUser(int $userId): array
    {
        return ['id' => $userId];
    }
}

interface Authenticatable
{
    public function authenticate(string $token): bool;
}

trait Timestampable
{
    public function getCreatedAt(): string
    {
        return date(\'Y-m-d\');
    }
}

enum Status
{
    case Active;
    case Inactive;
}
'''


def test_parse_php():
    """Test PHP parsing."""
    symbols = parse_file(PHP_SOURCE, "service.php", "php")

    func = next((s for s in symbols if s.name == "authenticate"), None)
    assert func is not None
    assert func.kind == "function"
    assert "Authenticate a user token" in func.docstring

    cls = next((s for s in symbols if s.name == "UserService"), None)
    assert cls is not None
    assert cls.kind == "class"

    method = next((s for s in symbols if s.name == "getUser"), None)
    assert method is not None
    assert method.kind == "method"
    assert "Get a user by ID" in method.docstring

    interface = next((s for s in symbols if s.name == "Authenticatable"), None)
    assert interface is not None
    assert interface.kind == "type"

    trait = next((s for s in symbols if s.name == "Timestampable"), None)
    assert trait is not None
    assert trait.kind == "type"

    enum = next((s for s in symbols if s.name == "Status"), None)
    assert enum is not None
    assert enum.kind == "type"


DART_SOURCE = '''
/// Greet a user by name.
String greet(String name) {
  return 'Hello, $name!';
}

/// A simple calculator.
class Calculator {
  /// Add two numbers.
  int add(int a, int b) {
    return a + b;
  }

  /// Whether the result is positive.
  bool get isPositive => true;
}

/// Scrollable behavior for widgets.
mixin Scrollable on Calculator {
  /// Scroll to offset.
  void scrollTo(double offset) {}
}

/// Status of a task.
enum Status { pending, active, done }

/// Helpers for String manipulation.
extension StringExt on String {
  /// Whether the string is blank.
  bool get isBlank => trim().isEmpty;
}

/// A JSON map alias.
typedef JsonMap = Map<String, dynamic>;

/// An abstract repository.
abstract class Repository {
  /// Get all items.
  @override
  Future<List<String>> getAll() {
    return Future.value([]);
  }
}
'''


C_SOURCE = '''
#define MAX_USERS 100

/* Represents a user in the system. */
struct User {
    char *name;
    int age;
};

/* Status codes for operations. */
enum Status {
    STATUS_OK,
    STATUS_ERROR,
    STATUS_PENDING
};

/* Get user by ID. */
struct User *get_user(int id) {
    return NULL;
}

/* Authenticate a token string. */
int authenticate(const char *token) {
    return token != NULL;
}
'''


CPP_SOURCE = '''
#define MAX_USERS 100

namespace sample {

using UserId = int;

enum class Status {
    STATUS_ACTIVE,
    STATUS_DISABLED,
};

/* A generic value container. */
template <typename T>
class Box {
public:
    explicit Box(T value) : value_(value) {}
    ~Box() = default;

    T get() const {
        return value_;
    }

    bool operator==(const Box& other) const {
        return value_ == other.value_;
    }

private:
    T value_;
};

/* Identity for generic values. */
template <typename T>
T identity(T value) {
    return value;
}

/* Add two integers. */
int add(int a, int b);
int add(int a, int b) {
    return a + b;
}

}  // namespace sample
'''


CPP_HEADER_SOURCE = '''
namespace sample {
class Widget {
public:
    Widget();
    ~Widget();
    int Get() const;
};
}
'''


C_ONLY_HEADER_SOURCE = '''
int only_c(void) {
    int values[] = (int[]){1, 2, 3};
    return values[0];
}
'''


CPP_EDGE_SOURCE = '''
namespace outer {
namespace inner {

class Ops {
public:
    int operator[](int idx) const { return idx; }
    int operator()(int x) const { return x; }
    explicit operator bool() const { return true; }
    int value = 0;
};

int (*make_callback(int seed))(int) {
    return nullptr;
}

int consume_ref(int& v) { return v; }

}  // namespace inner
}  // namespace outer
'''


MIXED_HEADER_SOURCE = '''
class MaybeCpp {
public:
    int get() const;
};

int only_c(void) {
    int values[] = (int[]){1, 2, 3};
    return values[0];
}
'''


CXX_KEYWORDS_HEADER_SOURCE = '''
constexpr int id(int x) noexcept {
    return x;
}

[[nodiscard]] inline int succ(int x) {
    return x + 1;
}
'''


def test_parse_dart():
    """Test Dart parsing."""
    symbols = parse_file(DART_SOURCE, "app.dart", "dart")

    # Top-level function
    func = next((s for s in symbols if s.name == "greet"), None)
    assert func is not None
    assert func.kind == "function"
    assert "Greet a user by name" in func.docstring

    # Class
    cls = next((s for s in symbols if s.name == "Calculator"), None)
    assert cls is not None
    assert cls.kind == "class"
    assert "simple calculator" in cls.docstring

    # Method
    method = next((s for s in symbols if s.name == "add"), None)
    assert method is not None
    assert method.kind == "method"
    assert "Add two numbers" in method.docstring

    # Getter
    getter = next((s for s in symbols if s.name == "isPositive"), None)
    assert getter is not None
    assert getter.kind == "method"

    # Mixin
    mixin = next((s for s in symbols if s.name == "Scrollable"), None)
    assert mixin is not None
    assert mixin.kind == "class"

    # Enum
    enum = next((s for s in symbols if s.name == "Status"), None)
    assert enum is not None
    assert enum.kind == "type"

    # Extension
    ext = next((s for s in symbols if s.name == "StringExt"), None)
    assert ext is not None
    assert ext.kind == "class"

    # Typedef
    typedef = next((s for s in symbols if s.name == "JsonMap"), None)
    assert typedef is not None
    assert typedef.kind == "type"

    # Abstract class with @override decorator
    repo = next((s for s in symbols if s.name == "Repository"), None)
    assert repo is not None
    assert repo.kind == "class"
    repo_method = next((s for s in symbols if s.name == "getAll"), None)
    assert repo_method is not None
    assert repo_method.kind == "method"
    assert "@override" in repo_method.decorators

    # Qualified names
    assert method.qualified_name == "Calculator.add"
    assert getter.qualified_name == "Calculator.isPositive"


CSHARP_SOURCE = '''
using System;
using System.Collections.Generic;

namespace SampleApp
{
    /// <summary>Manages user data and operations.</summary>
    public class UserService
    {
        /// <summary>Initializes the service.</summary>
        public UserService() {}

        /// <summary>Gets a user by identifier.</summary>
        [Obsolete("Use GetUserAsync instead")]
        public string GetUser(int userId) => $"user-{userId}";

        /// <summary>Removes a user.</summary>
        public bool DeleteUser(int userId) { return true; }
    }

    /// <summary>Repository contract.</summary>
    public interface IRepository
    {
        List<string> GetAll();
    }

    /// <summary>Request status codes.</summary>
    public enum Status { Pending, Active, Done }

    /// <summary>A 2D coordinate.</summary>
    public struct Point { public int X; public int Y; }

    /// <summary>Event delegate.</summary>
    public delegate void EventCallback(object sender, EventArgs e);

    /// <summary>An immutable person record.</summary>
    public record Person(string Name, int Age);
}
'''


def test_parse_csharp():
    """Test C# parsing."""
    symbols = parse_file(CSHARP_SOURCE, "Sample.cs", "csharp")

    # Class
    cls = next((s for s in symbols if s.name == "UserService" and s.kind == "class"), None)
    assert cls is not None
    assert "Manages user data" in cls.docstring

    # Constructor (method inside class)
    ctor = next((s for s in symbols if s.name == "UserService" and s.kind == "method"), None)
    assert ctor is not None
    assert ctor.qualified_name == "UserService.UserService"

    # Method with attribute
    method = next((s for s in symbols if s.name == "GetUser"), None)
    assert method is not None
    assert method.kind == "method"
    assert "Gets a user" in method.docstring
    assert any("[Obsolete" in d for d in method.decorators)
    assert method.qualified_name == "UserService.GetUser"

    # Another method
    delete = next((s for s in symbols if s.name == "DeleteUser"), None)
    assert delete is not None
    assert delete.kind == "method"

    # Interface
    iface = next((s for s in symbols if s.name == "IRepository"), None)
    assert iface is not None
    assert iface.kind == "type"

    # Enum
    enum = next((s for s in symbols if s.name == "Status"), None)
    assert enum is not None
    assert enum.kind == "type"

    # Struct
    struct = next((s for s in symbols if s.name == "Point"), None)
    assert struct is not None
    assert struct.kind == "type"

    # Delegate
    delegate = next((s for s in symbols if s.name == "EventCallback"), None)
    assert delegate is not None
    assert delegate.kind == "type"

    # Record
    record = next((s for s in symbols if s.name == "Person"), None)
    assert record is not None
    assert record.kind == "class"


SWIFT_SOURCE = '''
/// Greet a user by name.
func greet(name: String) -> String {
    return "Hello, \\(name)!"
}

/// A simple animal.
class Animal {
    /// Initialize with a name.
    init(name: String) {}

    /// Make the animal speak.
    func speak() {}
}

/// A 2D point.
struct Point {
    var x: Double
    var y: Double
}

/// Drawable objects.
protocol Drawable {
    func draw()
}

/// Cardinal directions.
enum Direction {
    case north, south, east, west
}

let MAX_SPEED = 100
'''


def test_parse_swift():
    """Test Swift parsing."""
    symbols = parse_file(SWIFT_SOURCE, "app.swift", "swift")

    # Top-level function
    func = next((s for s in symbols if s.name == "greet"), None)
    assert func is not None
    assert func.kind == "function"
    assert "Greet a user by name" in func.docstring

    # Class
    cls = next((s for s in symbols if s.name == "Animal"), None)
    assert cls is not None
    assert cls.kind == "class"
    assert "simple animal" in cls.docstring

    # init inside class
    init = next((s for s in symbols if s.name == "init"), None)
    assert init is not None
    assert init.kind == "method"

    # Method inside class
    speak = next((s for s in symbols if s.name == "speak"), None)
    assert speak is not None
    assert speak.kind in ("function", "method")

    # Struct (maps to class)
    point = next((s for s in symbols if s.name == "Point"), None)
    assert point is not None
    assert point.kind == "class"

    # Protocol (maps to type)
    drawable = next((s for s in symbols if s.name == "Drawable"), None)
    assert drawable is not None
    assert drawable.kind == "type"

    # Enum (maps to class via class_declaration)
    direction = next((s for s in symbols if s.name == "Direction"), None)
    assert direction is not None
    assert direction.kind == "class"

    # Constant
    speed = next((s for s in symbols if s.name == "MAX_SPEED"), None)
    assert speed is not None
    assert speed.kind == "constant"


def test_parse_c():
    """Test C parsing."""
    symbols = parse_file(C_SOURCE, "sample.c", "c")

    # Should have functions
    func = next((s for s in symbols if s.name == "authenticate"), None)
    assert func is not None
    assert func.kind == "function"
    assert "Authenticate a token string" in func.docstring

    get_user = next((s for s in symbols if s.name == "get_user"), None)
    assert get_user is not None
    assert get_user.kind == "function"

    # Should have struct
    user = next((s for s in symbols if s.name == "User"), None)
    assert user is not None
    assert user.kind == "type"

    # Should have enum
    status = next((s for s in symbols if s.name == "Status"), None)
    assert status is not None
    assert status.kind == "type"

    # Should have constant
    const = next((s for s in symbols if s.name == "MAX_USERS"), None)
    assert const is not None
    assert const.kind == "constant"


def test_parse_cpp():
    """Test C++ parsing."""
    symbols = parse_file(CPP_SOURCE, "sample.cpp", "cpp")

    # Namespace-qualified class
    cls = next((s for s in symbols if s.name == "Box" and s.kind == "class"), None)
    assert cls is not None
    assert cls.qualified_name == "sample.Box"
    assert "generic value container" in cls.docstring.lower()

    # Constructor + destructor + method
    ctor = next((s for s in symbols if s.name == "Box" and s.kind == "method"), None)
    assert ctor is not None
    assert ctor.qualified_name == "sample.Box.Box"

    dtor = next((s for s in symbols if s.name == "~Box"), None)
    assert dtor is not None
    assert dtor.kind == "method"
    assert dtor.qualified_name == "sample.Box.~Box"

    get_method = next((s for s in symbols if s.name == "get"), None)
    assert get_method is not None
    assert get_method.kind == "method"
    assert get_method.qualified_name == "sample.Box.get"

    # Operator overload
    op = next((s for s in symbols if "operator" in s.name and "==" in s.name), None)
    assert op is not None
    assert op.kind == "method"

    # Type alias + enum + constant
    alias = next((s for s in symbols if s.name == "UserId"), None)
    assert alias is not None
    assert alias.kind == "type"
    assert alias.qualified_name == "sample.UserId"

    enum = next((s for s in symbols if s.name == "Status"), None)
    assert enum is not None
    assert enum.kind == "type"
    assert enum.qualified_name == "sample.Status"

    const = next((s for s in symbols if s.name == "MAX_USERS"), None)
    assert const is not None
    assert const.kind == "constant"

    # Template function signature should include template prefix.
    identity = next((s for s in symbols if s.name == "identity"), None)
    assert identity is not None
    assert identity.kind == "function"
    assert identity.qualified_name == "sample.identity"
    assert "template <typename T>" in identity.signature

    # Overload IDs should be disambiguated.
    add_symbols = [s for s in symbols if s.name == "add" and s.kind == "function"]
    assert len(add_symbols) >= 2
    add_ids = [s.id for s in add_symbols]
    assert any(i.endswith("~1") for i in add_ids)
    assert any(i.endswith("~2") for i in add_ids)


def test_parse_cpp_header_stays_cpp():
    """C++-style headers should stay in C++ mode."""
    symbols = parse_file(CPP_HEADER_SOURCE, "sample.h", "cpp")
    assert symbols
    assert all(s.language == "cpp" for s in symbols)
    widget = next((s for s in symbols if s.name == "Widget" and s.kind == "class"), None)
    assert widget is not None
    method = next((s for s in symbols if s.name == "Get"), None)
    assert method is not None
    assert method.kind == "method"


def test_parse_cpp_header_falls_back_to_c():
    """C-only headers should fall back to C when C++ extraction fails."""
    symbols = parse_file(C_ONLY_HEADER_SOURCE, "sample.h", "cpp")
    assert symbols
    assert all(s.language == "c" for s in symbols)
    only_c = next((s for s in symbols if s.name == "only_c"), None)
    assert only_c is not None
    assert only_c.kind == "function"


def test_parse_cpp_edge_operator_and_declarator_names():
    """C++ edge declarator/operator names should be extracted and scoped."""
    symbols = parse_file(CPP_EDGE_SOURCE, "edge.cpp", "cpp")

    cls = next((s for s in symbols if s.name == "Ops" and s.kind == "class"), None)
    assert cls is not None
    assert cls.qualified_name == "outer.inner.Ops"

    op_index = next((s for s in symbols if "operator[" in s.name), None)
    assert op_index is not None
    assert op_index.kind == "method"
    assert op_index.qualified_name.startswith("outer.inner.Ops.")

    op_call = next((s for s in symbols if "operator(" in s.name), None)
    assert op_call is not None
    assert op_call.kind == "method"

    op_conv = next((s for s in symbols if "operator bool" in s.name), None)
    assert op_conv is not None
    assert op_conv.kind == "method"

    callback = next((s for s in symbols if s.name == "make_callback"), None)
    assert callback is not None
    assert callback.kind == "function"
    assert callback.qualified_name == "outer.inner.make_callback"

    consume_ref = next((s for s in symbols if s.name == "consume_ref"), None)
    assert consume_ref is not None
    assert consume_ref.kind == "function"
    assert consume_ref.qualified_name == "outer.inner.consume_ref"


def test_parse_cpp_declaration_filter_ignores_variables():
    """Variable declarations should not be indexed as functions in C++."""
    symbols = parse_file(CPP_EDGE_SOURCE, "edge.cpp", "cpp")
    variable_names = {"value"}
    assert all(s.name not in variable_names for s in symbols)


def test_parse_cpp_mixed_header_deterministic_selection():
    """Mixed C/C++ headers should produce deterministic language selection."""
    run1 = parse_file(MIXED_HEADER_SOURCE, "mixed.h", "cpp")
    run2 = parse_file(MIXED_HEADER_SOURCE, "mixed.h", "cpp")

    assert run1 and run2
    langs1 = {s.language for s in run1}
    langs2 = {s.language for s in run2}
    assert langs1 == langs2
    assert len(langs1) == 1


def test_parse_cpp_header_with_cpp_keywords_stays_cpp():
    """C++ keywords in headers should strongly select C++ parsing."""
    symbols = parse_file(CXX_KEYWORDS_HEADER_SOURCE, "keywords.h", "cpp")
    assert symbols
    assert all(s.language == "cpp" for s in symbols)
    names = {s.name for s in symbols if s.kind in {"function", "method"}}
    assert "id" in names
    assert "succ" in names


