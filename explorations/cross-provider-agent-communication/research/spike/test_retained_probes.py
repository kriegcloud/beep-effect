"""Zero-model regressions: load actual function ASTs without launching providers."""
import ast
import io
import json
from pathlib import Path
from types import SimpleNamespace
import time
import unittest

ROOT = Path(__file__).resolve().parent


def functions(path, names, namespace):
    tree = ast.parse(path.read_text())
    selected = [node for node in tree.body if isinstance(node, ast.FunctionDef) and node.name in names]
    assert len(selected) == len(names)
    exec(compile(ast.Module(body=selected, type_ignores=[]), str(path), 'exec'), namespace)
    return namespace


class ClaudeWaiters(unittest.TestCase):
    def fixture(self, events):
        payload = b''.join(json.dumps(event).encode() + b'\n' for event in events)
        batches = [payload]
        key = SimpleNamespace(fileobj=SimpleNamespace(fileno=lambda: 1), data='stdout')
        namespace = dict(json=json, time=time, pending=[], events=[], session_ids=set(), init_summary={},
                         bufs={'stdout': b''}, log=io.BytesIO(),
                         os=SimpleNamespace(read=lambda *_: batches.pop(0)),
                         p=SimpleNamespace(poll=lambda: None),
                         sel=SimpleNamespace(select=lambda _: [(key, None)] if batches else []))
        return functions(ROOT / 'claude/probe.py', {'read', 'until_result', 'observed_busy'}, namespace)

    def test_two_results_keep_text_and_terminal_for_next_waiter(self):
        events = []
        for text in ('first', 'second'):
            events += [{'type': 'assistant', 'message': {'content': [{'type': 'text', 'text': text}]}},
                       {'type': 'result', 'result': text}]
        ns = self.fixture(events)
        self.assertEqual(ns['until_result'](.1)[1], 'first')
        self.assertEqual(len(ns['pending']), 2)
        self.assertEqual(ns['until_result'](.1)[1], 'second')
        self.assertEqual(ns['pending'], [])

    def test_stream_and_terminal_batch_is_not_busy_and_keeps_results(self):
        ns = self.fixture([{'type': 'stream_event', 'event': {'type': 'content_block_delta'}},
                           {'type': 'result', 'result': 'completed'},
                           {'type': 'result', 'result': 'followup'}])
        batch = ns['read']()
        self.assertFalse(ns['observed_busy'](batch, ('content_block_delta',)))
        self.assertEqual(ns['until_result'](.1)[0]['result'], 'completed')
        self.assertEqual(ns['until_result'](.1)[0]['result'], 'followup')

    def test_stream_only_is_busy(self):
        ns = self.fixture([])
        self.assertTrue(ns['observed_busy']([{'type': 'stream_event', 'event': {'type': 'message_start'}}],
                                          ('message_start',)))


class GrokAcknowledgement(unittest.TestCase):
    def setUp(self):
        self.validate = functions(ROOT / 'grok/roundtrip-probe.py', {'validate_ack'}, {})['validate_ack']
        self.peer = '{"nonce":"fixture","reply":"GROK_ACK"}'
        self.ack = {'nonce': 'fixture', 'acknowledgement': 'CODEX_ACK_GROK_REPLY', 'peerReplyEcho': self.peer}

    def test_exact_peer_echo_computes_digest(self):
        import hashlib
        self.assertEqual(self.validate(self.ack, 'fixture', self.peer), hashlib.sha256(self.peer.encode()).hexdigest())

    def test_foreign_peer_digest_cannot_substitute_for_echo(self):
        self.ack['peerReplyEcho'] = 'different peer payload'
        self.ack['peerReplySha256'] = 'controller supplied digest'
        with self.assertRaisesRegex(ValueError, 'echo mismatch'):
            self.validate(self.ack, 'fixture', self.peer)

    def test_nonce_marker_and_bound_are_checked(self):
        for field in ('nonce', 'acknowledgement'):
            with self.subTest(field=field), self.assertRaises(ValueError):
                self.validate(dict(self.ack, **{field: 'wrong'}), 'fixture', self.peer)
        with self.assertRaisesRegex(ValueError, '4096-byte'):
            self.validate(self.ack, 'fixture', 'x' * 4097)


if __name__ == '__main__':
    unittest.main()
