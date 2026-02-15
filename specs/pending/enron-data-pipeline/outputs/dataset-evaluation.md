# Dataset Evaluation: Enron Corpus Formats

Last verified: 2026-02-15

## Decision Summary

- Canonical source should remain the CMU release (`enron_mail_20150507.tar.gz`) for Phase 1 parsing work.
- Kaggle is a useful convenience distribution, but download is login-gated and not reliable for unattended acquisition in this environment.
- HuggingFace variants are useful for downstream modeling experiments, not for source-of-truth RFC 2822 parsing validation.

## Availability Check

- CMU page is live and explicitly links the May 7, 2015 dataset version.
- CMU page describes "about 0.5M messages" and "about 1.7Gb, tarred and gzipped."
- Direct HEAD against CMU archive currently returns `Content-Length: 443254787`.
- Kaggle dataset page is live and references the same May 7, 2015 CMU version.
- Kaggle direct download URL redirects to login in this environment (not anonymous-download friendly).

## Format Comparison

| Format | Access Mechanics | Size Signals | Data Shape | RFC 2822 / MIME Fidelity | License / Usage Notes | Fit For TodoX P1 |
|---|---|---|---|---|---|---|
| CMU maildir tarball (`enron_mail_20150507.tar.gz`) | Public HTTP(S) download, no auth required | CMU page: ~1.7 GB (tar+gz); live HEAD: 443,254,787 bytes compressed | Raw maildir tree (user/folder/message files) | Highest fidelity; closest to original corpus representation | No explicit SPDX license on page; distributed for research use with privacy cautions | Best source-of-truth for parser + thread reconstruction |
| Kaggle dataset (`wcukierski/enron-email-dataset`) | Dataset metadata is public; file download redirects to login without credentials | JSON-LD distribution: 375,294,957 bytes (zip); Kaggle API `view`: 1,426,122,219 total bytes | Flattened convenience packaging of CMU release (commonly consumed as single CSV workflow) | Medium-high for header text if raw message text is preserved; less filesystem provenance than maildir | Kaggle label: "Data files © Original Authors" | Good convenience adapter if authenticated access is available |
| HuggingFace pre-processed (`corbt/enron-emails`) | Public | `num_examples: 517401`; `download_size: 493482449` | Parquet columns (`message_id`, `from`, `to`, `cc`, `bcc`, `date`, `subject`, `body`, `file_name`) | Medium; already parsed/normalized into columns | No explicit license tag in dataset metadata | Useful for analytics, not canonical raw parsing validation |
| HuggingFace transformed (`LLM-PBE/enron-email`) | Public | `num_examples: 490408`; `download_size: 980990740` | JSONL with text-focused field(s) | Low for header/thread reconstruction (header structure is flattened/lost) | Tagged `apache-2.0` on dataset metadata | Not suitable as primary input for RFC 2822 parser testing |

## Acquisition Outcome (Task 2 Context)

- Selected raw artifact for Phase 0 upload: CMU canonical archive.
- Downloaded file: `enron_mail_20150507.tar.gz`
- Local SHA-256: `b3da1b3fe0369ec3140bb4fbce94702c33b7da810ec15d718b3fadf5cd748ca7`
- Uploaded object: `s3://static.vaultctx.com/todox/test-data/enron/raw/enron_mail_20150507.tar.gz`
- Verified via S3 API: size `443254787`, SSE `AES256`.

## Recommendation

1. Use CMU maildir tarball as the canonical raw input for Phase 1 parser implementation and test fixtures.
2. Implement a secondary Kaggle adapter later (optional) for teams that prefer CSV-first local iteration and have Kaggle credentials.
3. Treat HuggingFace variants as downstream convenience datasets only, not as the parser correctness baseline.

## Sources

- https://www.cs.cmu.edu/~enron/
- https://www.cs.cmu.edu/~enron/enron_mail_20150507.tar.gz
- https://www.kaggle.com/datasets/wcukierski/enron-email-dataset
- https://www.kaggle.com/api/v1/datasets/view/wcukierski/enron-email-dataset
- https://www.kaggle.com/datasets/wcukierski/enron-email-dataset/download?datasetVersionNumber=2
- https://huggingface.co/api/datasets/corbt/enron-emails
- https://datasets-server.huggingface.co/info?dataset=corbt/enron-emails
- https://huggingface.co/api/datasets/LLM-PBE/enron-email
- https://datasets-server.huggingface.co/info?dataset=LLM-PBE/enron-email
