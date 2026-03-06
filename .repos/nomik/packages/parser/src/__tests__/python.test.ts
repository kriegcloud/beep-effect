import { describe, it, expect } from 'vitest';
import Parser from 'tree-sitter';
import { extractPythonFunctions, extractPythonClasses, extractPythonImports, extractPythonCalls } from '../extractors/python';

let parser: Parser;

async function getParser(): Promise<Parser> {
    if (parser) return parser;
    parser = new Parser();
    const mod = await import('tree-sitter-python');
    const lang = (mod as any).default ?? mod;
    parser.setLanguage(lang as Parser.Language);
    return parser;
}

function parse(code: string) {
    return getParser().then(p => p.parse(code));
}

const SAMPLE_PY = `
import os
import sys
from pathlib import Path
from typing import List, Optional

class BaseService:
    """Service de base"""
    def __init__(self, name: str):
        self.name = name

    def start(self):
        pass

class UserService(BaseService):
    """Gestion des utilisateurs"""
    _cache = {}

    def __init__(self, db):
        super().__init__("user")
        self.db = db

    async def get_user(self, user_id: int) -> Optional[dict]:
        result = self.db.query(user_id)
        return result

    def list_users(self) -> List[dict]:
        return self.db.find_all()

def create_app(config: dict) -> "App":
    """Cree l'application principale"""
    service = UserService(config["db"])
    service.start()
    return App(service)

async def main():
    app = create_app({"db": None})
    user = await app.service.get_user(1)
    print(user)
`;

describe('extractPythonFunctions', () => {
    it('extrait les fonctions Python avec parametres', async () => {
        const tree = await parse(SAMPLE_PY);
        const fns = extractPythonFunctions(tree, '/app/main.py');

        const names = fns.map(f => f.name);
        expect(names).toContain('create_app');
        expect(names).toContain('main');
        expect(names).toContain('__init__');
        expect(names).toContain('start');
        expect(names).toContain('get_user');
        expect(names).toContain('list_users');
    });

    it('detecte les fonctions async', async () => {
        const tree = await parse(SAMPLE_PY);
        const fns = extractPythonFunctions(tree, '/app/main.py');

        const mainFn = fns.find(f => f.name === 'main');
        expect(mainFn?.isAsync).toBe(true);

        const getUser = fns.find(f => f.name === 'get_user');
        expect(getUser?.isAsync).toBe(true);

        const createApp = fns.find(f => f.name === 'create_app');
        expect(createApp?.isAsync).toBe(false);
    });

    it('extrait les parametres sans self/cls', async () => {
        const tree = await parse(SAMPLE_PY);
        const fns = extractPythonFunctions(tree, '/app/main.py');

        const createApp = fns.find(f => f.name === 'create_app');
        expect(createApp?.params.map(p => p.name)).toContain('config');
        expect(createApp?.params.find(p => p.name === 'config')?.type).toBe('dict');
    });
});

describe('extractPythonClasses', () => {
    it('extrait les classes avec heritage', async () => {
        const tree = await parse(SAMPLE_PY);
        const classes = extractPythonClasses(tree, '/app/main.py');

        expect(classes.length).toBe(2);

        const base = classes.find(c => c.name === 'BaseService');
        expect(base).toBeDefined();
        expect(base?.superClass).toBeUndefined();

        const user = classes.find(c => c.name === 'UserService');
        expect(user).toBeDefined();
        expect(user?.superClass).toBe('BaseService');
    });

    it('extrait les methodes de la classe', async () => {
        const tree = await parse(SAMPLE_PY);
        const classes = extractPythonClasses(tree, '/app/main.py');

        const user = classes.find(c => c.name === 'UserService');
        expect(user?.methods).toContain('__init__');
        expect(user?.methods).toContain('get_user');
        expect(user?.methods).toContain('list_users');
    });
});

describe('extractPythonImports', () => {
    it('extrait import et from...import', async () => {
        const tree = await parse(SAMPLE_PY);
        const imports = extractPythonImports(tree, '/app/main.py');

        const sources = imports.map(i => i.source);
        expect(sources).toContain('os');
        expect(sources).toContain('sys');
        expect(sources).toContain('pathlib');
        expect(sources).toContain('typing');
    });

    it('extrait les specifiers du from...import', async () => {
        const tree = await parse(SAMPLE_PY);
        const imports = extractPythonImports(tree, '/app/main.py');

        const typingImport = imports.find(i => i.source === 'typing');
        expect(typingImport?.specifiers).toContain('List');
        expect(typingImport?.specifiers).toContain('Optional');
    });
});

describe('extractPythonCalls', () => {
    it('extracts function calls', async () => {
        const tree = await parse(SAMPLE_PY);
        const calls = extractPythonCalls(tree, '/app/main.py');

        const callNames = calls.map(c => c.calleeName);
        expect(callNames).toContain('UserService');
        expect(callNames).toContain('print');
    });

    it('uses __file__ for module-level calls (not <module>)', async () => {
        const code = `
import os
result = os.path.exists("/tmp")
helper()
`;
        const tree = await parse(code);
        const calls = extractPythonCalls(tree, '/app/main.py');
        const moduleLevelCalls = calls.filter(c => c.callerName === '__file__');
        expect(moduleLevelCalls.length).toBeGreaterThan(0);
        // No calls should use <module>
        expect(calls.every(c => c.callerName !== '<module>')).toBe(true);
    });

    it('splits method calls into receiver + callee', async () => {
        const code = `
def process():
    utils.helper()
    search_utils.get_results()
`;
        const tree = await parse(code);
        const calls = extractPythonCalls(tree, '/app/views.py');

        const helperCall = calls.find(c => c.calleeName === 'helper');
        expect(helperCall).toBeDefined();
        expect(helperCall?.receiverName).toBe('utils');
        expect(helperCall?.isMethodCall).toBe(true);

        const resultsCall = calls.find(c => c.calleeName === 'get_results');
        expect(resultsCall?.receiverName).toBe('search_utils');
    });

    it('marks self/cls calls as local identifiers', async () => {
        const code = `
class MyView:
    def get(self):
        self.render()
        cls.create()
`;
        const tree = await parse(code);
        const calls = extractPythonCalls(tree, '/app/views.py');

        const selfCall = calls.find(c => c.calleeName === 'render');
        expect(selfCall?.isLocalIdentifier).toBe(true);
        expect(selfCall?.receiverName).toBeUndefined();

        const clsCall = calls.find(c => c.calleeName === 'create');
        expect(clsCall?.isLocalIdentifier).toBe(true);
    });
});

describe('extractPythonImports — relative imports', () => {
    it('extracts specifiers from relative imports (from .models import X)', async () => {
        const code = `from .models import Product, Category`;
        const tree = await parse(code);
        const imports = extractPythonImports(tree, '/app/views.py');

        expect(imports.length).toBe(1);
        expect(imports[0].source).toBe('.models');
        expect(imports[0].specifiers).toContain('Product');
        expect(imports[0].specifiers).toContain('Category');
    });

    it('extracts specifiers from multi-dot relative imports (from ..utils import X)', async () => {
        const code = `from ..utils import helper_func`;
        const tree = await parse(code);
        const imports = extractPythonImports(tree, '/app/sub/views.py');

        expect(imports[0].source).toBe('..utils');
        expect(imports[0].specifiers).toContain('helper_func');
    });

    it('extracts bare dot imports (from . import models)', async () => {
        const code = `from . import models, utils`;
        const tree = await parse(code);
        const imports = extractPythonImports(tree, '/app/__init__.py');

        expect(imports[0].source).toBe('.');
        expect(imports[0].specifiers).toContain('models');
        expect(imports[0].specifiers).toContain('utils');
    });

    it('preserves alias format for cross-file resolver', async () => {
        const code = `from search.utils import get_results as fetch_results`;
        const tree = await parse(code);
        const imports = extractPythonImports(tree, '/app/views.py');

        expect(imports[0].specifiers).toContain('get_results as fetch_results');
    });

    it('handles wildcard imports', async () => {
        const code = `from search.utils import *`;
        const tree = await parse(code);
        const imports = extractPythonImports(tree, '/app/views.py');

        expect(imports[0].specifiers).toContain('*');
    });
});
