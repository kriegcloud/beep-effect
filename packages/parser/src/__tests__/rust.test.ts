import { describe, it, expect } from 'vitest';
import Parser from 'tree-sitter';
import { extractRustFunctions, extractRustClasses, extractRustImports, extractRustCalls } from '../extractors/rust';

let parser: Parser;

async function getParser(): Promise<Parser> {
    if (parser) return parser;
    parser = new Parser();
    const { default: Rust } = await import('tree-sitter-rust');
    parser.setLanguage(Rust as unknown as Parser.Language);
    return parser;
}

function parse(code: string) {
    return getParser().then(p => p.parse(code));
}

const SAMPLE_RS = `
use std::collections::HashMap;
use std::io::{self, Read};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Config {
    pub host: String,
    pub port: u16,
    pub database: String,
}

pub enum Status {
    Active,
    Inactive,
    Suspended,
}

pub trait Repository {
    fn find_by_id(&self, id: u64) -> Option<Config>;
    fn save(&mut self, config: Config) -> Result<(), String>;
}

pub struct AppState {
    config: Config,
    cache: HashMap<String, String>,
}

impl AppState {
    pub fn new(config: Config) -> Self {
        let cache = HashMap::new();
        Self { config, cache }
    }

    pub async fn get_value(&self, key: &str) -> Option<String> {
        self.cache.get(key).cloned()
    }
}

fn process_data(input: &[u8]) -> Vec<u8> {
    input.to_vec()
}

pub async fn start_server(config: Config) -> io::Result<()> {
    let state = AppState::new(config);
    println!("Server started");
    Ok(())
}
`;

describe('extractRustFunctions', () => {
    it('extrait les fonctions Rust (fn, impl fn)', async () => {
        const tree = await parse(SAMPLE_RS);
        const fns = extractRustFunctions(tree, '/src/main.rs');

        const names = fns.map(f => f.name);
        expect(names).toContain('new');
        expect(names).toContain('get_value');
        expect(names).toContain('process_data');
        expect(names).toContain('start_server');
    });

    it('detecte les fonctions async', async () => {
        const tree = await parse(SAMPLE_RS);
        const fns = extractRustFunctions(tree, '/src/main.rs');

        const getValue = fns.find(f => f.name === 'get_value');
        expect(getValue?.isAsync).toBe(true);

        const processData = fns.find(f => f.name === 'process_data');
        expect(processData?.isAsync).toBe(false);

        const startServer = fns.find(f => f.name === 'start_server');
        expect(startServer?.isAsync).toBe(true);
    });

    it('detecte la visibilite pub', async () => {
        const tree = await parse(SAMPLE_RS);
        const fns = extractRustFunctions(tree, '/src/main.rs');

        const startServer = fns.find(f => f.name === 'start_server');
        expect(startServer?.isExported).toBe(true);

        const processData = fns.find(f => f.name === 'process_data');
        expect(processData?.isExported).toBe(false);
    });
});

describe('extractRustClasses (struct, enum, trait)', () => {
    it('extrait les structs avec champs', async () => {
        const tree = await parse(SAMPLE_RS);
        const classes = extractRustClasses(tree, '/src/main.rs');

        const config = classes.find(c => c.name === 'Config');
        expect(config).toBeDefined();
        expect(config?.properties).toContain('host');
        expect(config?.properties).toContain('port');
        expect(config?.properties).toContain('database');
        expect(config?.isExported).toBe(true);
    });

    it('extrait les enums avec variantes', async () => {
        const tree = await parse(SAMPLE_RS);
        const classes = extractRustClasses(tree, '/src/main.rs');

        const status = classes.find(c => c.name === 'Status');
        expect(status).toBeDefined();
        expect(status?.properties).toContain('Active');
        expect(status?.properties).toContain('Inactive');
        expect(status?.properties).toContain('Suspended');
    });

    it('extrait les traits comme classes abstraites', async () => {
        const tree = await parse(SAMPLE_RS);
        const classes = extractRustClasses(tree, '/src/main.rs');

        const repo = classes.find(c => c.name === 'Repository');
        expect(repo).toBeDefined();
        expect(repo?.isAbstract).toBe(true);
        expect(repo?.methods).toContain('find_by_id');
        expect(repo?.methods).toContain('save');
    });
});

describe('extractRustImports', () => {
    it('extrait les use declarations', async () => {
        const tree = await parse(SAMPLE_RS);
        const imports = extractRustImports(tree, '/src/main.rs');

        expect(imports.length).toBeGreaterThanOrEqual(3);
        const sources = imports.map(i => i.source);
        expect(sources).toContain('std::collections');
        expect(sources).toContain('serde');
    });
});

describe('extractRustCalls', () => {
    it('extrait les appels de fonctions', async () => {
        const tree = await parse(SAMPLE_RS);
        const calls = extractRustCalls(tree, '/src/main.rs');

        const callNames = calls.map(c => c.calleeName);
        expect(callNames).toContain('HashMap::new');
        expect(callNames).toContain('AppState::new');
    });
});
