#!/usr/bin/env python3
"""
Redacted secret scanner (repo-safe).

CI uses this to fail PRs if tracked source contains likely secret material.
No secret values are ever printed.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Iterable, List, Optional


SKIP_DIRS = {
    ".git",
    "node_modules",
    ".venv",
    ".mypy_cache",
    "dist",
    "build",
    "coverage",
}

MAX_FILE_BYTES = 2_000_000

DOTENV_NAME_RE = re.compile(r"(^|/)\.env(\..+)?$")
KEY_FILE_RE = re.compile(r"\.(pem|key|p12|pfx|jks|der)$", re.IGNORECASE)
CRED_JSON_RE = re.compile(r"(service[-_]?account|credentials|client_secret).+\.json$", re.IGNORECASE)

ASSIGNMENT_RE = re.compile(
    r"""(?ix)
    (?P<key>
        (?:api[_-]?key|secret|secret[_-]?key|client[_-]?secret|private[_-]?key|
           access[_-]?token|refresh[_-]?token|webhook[_-]?secret|jwt[_-]?secret|
           supabase[_-]?(?:anon|service|jwt)?[_-]?key|
           github[_-]?(?:token|pat)|slack[_-]?token|cloudflare[_-]?token|
           database[_-]?url|pgpassword|redis[_-]?password)
    )
    \s*[:=]\s*
    (?P<quote>['\"])
    (?P<val>[^'\"]{12,})
    (?P=quote)
    """
)

BEGIN_PRIVATE_KEY_RE = re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH |)PRIVATE KEY-----")
GITHUB_PAT_RE = re.compile(r"\b(ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})\b")
SLACK_TOKEN_RE = re.compile(r"\b(xox[baprs]-[A-Za-z0-9-]{10,})\b")


@dataclass(frozen=True)
class Finding:
    category: str
    file: str
    line: Optional[int] = None
    key: Optional[str] = None
    value_len: Optional[int] = None
    note: Optional[str] = None


def _iter_files(root: Path) -> Iterable[Path]:
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for fn in filenames:
            yield Path(dirpath) / fn


def _is_probably_binary(p: Path) -> bool:
    try:
        with open(p, "rb") as f:
            chunk = f.read(2048)
        return b"\x00" in chunk
    except Exception:
        return True


def scan_repo(root: Path) -> List[Finding]:
    findings: List[Finding] = []

    for p in _iter_files(root):
        try:
            rel = str(p.relative_to(root))
        except Exception:
            continue

        rel_norm = "/" + rel.replace("\\", "/")

        if DOTENV_NAME_RE.search(rel_norm):
            findings.append(Finding(category="dotenv_file", file=rel))

        if KEY_FILE_RE.search(p.name):
            findings.append(Finding(category="key_material_file", file=rel))

        if CRED_JSON_RE.search(p.name):
            findings.append(Finding(category="credential_json_file", file=rel))

        try:
            if p.stat().st_size > MAX_FILE_BYTES:
                continue
        except Exception:
            continue

        if _is_probably_binary(p):
            continue

        try:
            with open(p, "r", encoding="utf-8", errors="ignore") as f:
                for i, line in enumerate(f, start=1):
                    if BEGIN_PRIVATE_KEY_RE.search(line):
                        findings.append(Finding(category="private_key_block", file=rel, line=i))
                        break

                    m = ASSIGNMENT_RE.search(line)
                    if m:
                        findings.append(
                            Finding(
                                category="inline_secret_assignment",
                                file=rel,
                                line=i,
                                key=m.group("key").lower(),
                                value_len=len(m.group("val")),
                            )
                        )

                    if GITHUB_PAT_RE.search(line):
                        findings.append(Finding(category="github_pat_like", file=rel, line=i))
                    if SLACK_TOKEN_RE.search(line):
                        findings.append(Finding(category="slack_token_like", file=rel, line=i))
        except Exception:
            continue

    return findings


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("repo_root")
    ap.add_argument("--json-out", required=True)
    args = ap.parse_args()

    root = Path(args.repo_root).resolve()
    findings = scan_repo(root)
    Path(args.json_out).write_text(
        json.dumps({"repo_root": str(root), "findings": [asdict(f) for f in findings]}, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())


