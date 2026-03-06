"""Tests for get_file_tree language labeling behavior."""

from jcodemunch_mcp.parser import Symbol
from jcodemunch_mcp.storage import IndexStore
from jcodemunch_mcp.tools.get_file_tree import get_file_tree


def _flatten_file_nodes(tree_nodes: list[dict]) -> dict[str, dict]:
    """Return {file_path: node} for all file nodes in a tree response."""
    out: dict[str, dict] = {}
    for node in tree_nodes:
        if node.get("type") == "file":
            out[node["path"]] = node
        elif node.get("type") == "dir":
            out.update(_flatten_file_nodes(node.get("children", [])))
    return out


def test_get_file_tree_prefers_symbol_language_over_extension(tmp_path):
    """A .h file with C symbols should show language='c' instead of extension default."""
    store = IndexStore(base_path=str(tmp_path))
    sym = Symbol(
        id="include-api-h::only_c#function",
        file="include/api.h",
        name="only_c",
        qualified_name="only_c",
        kind="function",
        language="c",
        signature="int only_c(void)",
        byte_offset=0,
        byte_length=20,
    )

    store.save_index(
        owner="tree",
        name="demo",
        source_files=["include/api.h", "src/orphan.cpp"],
        symbols=[sym],
        raw_files={
            "include/api.h": "int only_c(void) { return 0; }\n",
            "src/orphan.cpp": "// no symbols here\n",
        },
        languages={"c": 1, "cpp": 1},
    )

    result = get_file_tree("tree/demo", storage_path=str(tmp_path))
    assert "error" not in result
    files = _flatten_file_nodes(result["tree"])
    assert files["include/api.h"]["language"] == "c"
    assert files["include/api.h"]["symbol_count"] == 1


def test_get_file_tree_falls_back_to_extension_without_symbol_language(tmp_path):
    """When a file has no symbols, get_file_tree should infer language from extension."""
    store = IndexStore(base_path=str(tmp_path))
    sym = Symbol(
        id="src-main-cpp::main#function",
        file="src/main.cpp",
        name="main",
        qualified_name="main",
        kind="function",
        language="cpp",
        signature="int main()",
        byte_offset=0,
        byte_length=10,
    )

    store.save_index(
        owner="tree",
        name="demo2",
        source_files=["src/main.cpp", "include/no_symbols.h"],
        symbols=[sym],
        raw_files={
            "src/main.cpp": "int main() { return 0; }\n",
            "include/no_symbols.h": "/* header with no symbols */\n",
        },
        languages={"cpp": 2},
    )

    result = get_file_tree("tree/demo2", storage_path=str(tmp_path))
    assert "error" not in result
    files = _flatten_file_nodes(result["tree"])
    assert files["include/no_symbols.h"]["language"] == "cpp"
    assert files["include/no_symbols.h"]["symbol_count"] == 0
