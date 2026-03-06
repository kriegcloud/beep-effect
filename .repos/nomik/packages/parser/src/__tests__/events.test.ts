import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { extractPythonEvents } from '../extractors/events';
import { createParserEngine } from '../parser';

function writeFile(p: string, content: string): void {
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, content, 'utf-8');
}

describe('events extractor', () => {
    // ── TypeScript / JavaScript (tree-sitter) ──

    it('detects emitter.emit() as EMITS edge', async () => {
        const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nomik-ev-'));
        try {
            const filePath = path.join(tmpDir, 'service.ts');
            writeFile(filePath, `
import { EventEmitter } from 'events';
const emitter = new EventEmitter();
export function notifyUser(userId: string) {
  emitter.emit('user:updated', { userId });
}
`);
            const engine = createParserEngine();
            const [result] = await engine.parseFiles([filePath]);

            const eventNodes = result.nodes.filter(n => n.type === 'event');
            expect(eventNodes).toHaveLength(1);
            expect(eventNodes[0]!.name).toBe('user:updated');

            const emitsEdges = result.edges.filter(e => e.type === 'EMITS');
            expect(emitsEdges).toHaveLength(1);

            const notifyFn = result.nodes.find(n => n.type === 'function' && n.name === 'notifyUser');
            expect(notifyFn).toBeDefined();
            expect(emitsEdges[0]!.sourceId).toBe(notifyFn!.id);
        } finally {
            fs.rmSync(tmpDir, { recursive: true, force: true });
        }
    });

    it('detects socket.on() as LISTENS_TO edge', async () => {
        const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nomik-ev-'));
        try {
            const filePath = path.join(tmpDir, 'socket.ts');
            writeFile(filePath, `
export function setupSocket(io: any) {
  io.on('connection', handleConnection);
  io.on('disconnect', handleDisconnect);
}
function handleConnection() {}
function handleDisconnect() {}
`);
            const engine = createParserEngine();
            const [result] = await engine.parseFiles([filePath]);

            const eventNodes = result.nodes.filter(n => n.type === 'event');
            expect(eventNodes).toHaveLength(2);
            expect(eventNodes.map(n => n.name).sort()).toEqual(['connection', 'disconnect']);

            const listenEdges = result.edges.filter(e => e.type === 'LISTENS_TO');
            expect(listenEdges).toHaveLength(2);

            const setupFn = result.nodes.find(n => n.type === 'function' && n.name === 'setupSocket');
            expect(setupFn).toBeDefined();
            for (const edge of listenEdges) {
                expect(edge.sourceId).toBe(setupFn!.id);
            }
        } finally {
            fs.rmSync(tmpDir, { recursive: true, force: true });
        }
    });

    it('detects multiple event methods: emit, on, once, addListener', async () => {
        const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nomik-ev-'));
        try {
            const filePath = path.join(tmpDir, 'bus.ts');
            writeFile(filePath, `
const bus = new EventEmitter();
bus.emit('start');
bus.on('data', processData);
bus.once('end', cleanup);
bus.addListener('error', handleError);
function processData() {}
function cleanup() {}
function handleError() {}
`);
            const engine = createParserEngine();
            const [result] = await engine.parseFiles([filePath]);

            const emitsEdges = result.edges.filter(e => e.type === 'EMITS');
            const listenEdges = result.edges.filter(e => e.type === 'LISTENS_TO');

            expect(emitsEdges).toHaveLength(1);
            expect(listenEdges).toHaveLength(3);
        } finally {
            fs.rmSync(tmpDir, { recursive: true, force: true });
        }
    });

    it('attributes event to __file__ when outside a function', async () => {
        const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nomik-ev-'));
        try {
            const filePath = path.join(tmpDir, 'init.ts');
            writeFile(filePath, `
const emitter = new EventEmitter();
emitter.on('ready', () => console.log('ready'));
`);
            const engine = createParserEngine();
            const [result] = await engine.parseFiles([filePath]);

            const listenEdges = result.edges.filter(e => e.type === 'LISTENS_TO');
            expect(listenEdges).toHaveLength(1);
            expect(listenEdges[0]!.sourceId).toBe(result.file.id);
        } finally {
            fs.rmSync(tmpDir, { recursive: true, force: true });
        }
    });

    // ── Python (regex) ──

    it('detects .emit() in Python', () => {
        const content = `
import socketio
sio = socketio.Server()

@sio.event
def connect(sid, environ):
    sio.emit('welcome', {'msg': 'hello'})

def broadcast(msg):
    sio.emit('message', msg)
`;
        const events = extractPythonEvents(content);
        const emits = events.filter(e => e.kind === 'emit');
        expect(emits).toHaveLength(2);
        expect(emits.map(e => e.eventName).sort()).toEqual(['message', 'welcome']);
    });

    it('detects .on() in Python', () => {
        const content = `
sio.on('connect', handle_connect)
sio.on('message', handle_message)
`;
        const events = extractPythonEvents(content);
        const listens = events.filter(e => e.kind === 'listen');
        expect(listens).toHaveLength(2);
        expect(listens.map(e => e.eventName).sort()).toEqual(['connect', 'message']);
    });

    it('detects Django signal.connect() in Python', () => {
        const content = `
from django.db.models.signals import post_save
post_save.connect(create_profile)
`;
        const events = extractPythonEvents(content);
        expect(events).toHaveLength(1);
        expect(events[0]!.eventName).toBe('post_save');
        expect(events[0]!.kind).toBe('listen');
        expect(events[0]!.handlerName).toBe('create_profile');
    });
});
