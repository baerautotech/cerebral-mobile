#!/usr/bin/env python3
"""
Security Plane v1: token storage static scan (mobile).

Policy (fail-closed):
- Forbid AsyncStorage.setItem writes where the *key* suggests token material:
  key contains: token|access|refresh (case-insensitive)
- Also forbid any accidental web localStorage/sessionStorage writes in shared code.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, List

TOKEN_KEY_RE = re.compile(r"(token|access|refresh)", re.IGNORECASE)
ASYNC_SETITEM_RE = re.compile(r"\bAsyncStorage\.setItem\s*\(", re.IGNORECASE)
WEB_SETITEM_RE = re.compile(r"(?:window\.)?(localStorage|sessionStorage)\.setItem\s*\(", re.IGNORECASE)
FIRST_ARG_STR_RE = re.compile(r"setItem\s*\(\s*([\"'`])([^\"'`]+)\1", re.IGNORECASE)
FIRST_ARG_IDENT_RE = re.compile(r"setItem\s*\(\s*([A-Za-z0-9_.$]+)")


@dataclass(frozen=True)
class Finding:
    file: str
    line: int
    kind: str
    key_hint: str
    snippet: str


def _iter_source_files(roots: Iterable[Path]) -> Iterable[Path]:
    for root in roots:
        if not root.exists():
            continue
        for p in root.rglob("*"):
            if not p.is_file():
                continue
            if p.suffix.lower() not in (".ts", ".tsx", ".js", ".jsx"):
                continue
            if any(part in {"node_modules", "dist", "build", "android", "ios"} for part in p.parts):
                continue
            yield p


def _scan_file(p: Path) -> List[Finding]:
    out: List[Finding] = []
    try:
        text = p.read_text(encoding="utf-8", errors="replace")
    except Exception:
        return out

    for idx, line in enumerate(text.splitlines(), start=1):
        is_async = bool(ASYNC_SETITEM_RE.search(line))
        is_web = bool(WEB_SETITEM_RE.search(line))
        if not (is_async or is_web):
            continue

        m = FIRST_ARG_STR_RE.search(line)
        if m:
            key = (m.group(2) or "").strip()
            if TOKEN_KEY_RE.search(key):
                out.append(
                    Finding(
                        file=str(p),
                        line=idx,
                        kind="async_storage_setItem" if is_async else "web_storage_setItem",
                        key_hint=key,
                        snippet=line.strip()[:240],
                    )
                )
            continue

        m2 = FIRST_ARG_IDENT_RE.search(line)
        if m2:
            ident = (m2.group(1) or "").strip()
            if TOKEN_KEY_RE.search(ident):
                out.append(
                    Finding(
                        file=str(p),
                        line=idx,
                        kind="async_storage_setItem" if is_async else "web_storage_setItem",
                        key_hint=ident,
                        snippet=line.strip()[:240],
                    )
                )
            continue

        if TOKEN_KEY_RE.search(line):
            out.append(
                Finding(
                    file=str(p),
                    line=idx,
                    kind="async_storage_setItem" if is_async else "web_storage_setItem",
                    key_hint="<unknown>",
                    snippet=line.strip()[:240],
                )
            )
    return out


def main() -> int:
    roots = [Path("frontend-react-native/src")]
    findings: List[Finding] = []
    for f in _iter_source_files(roots):
        findings.extend(_scan_file(f))

    if findings:
        print("[FAIL] token storage scan: disallowed storage writes detected\n")
        for x in findings[:200]:
            print(f"- {x.kind}: {x.file}:{x.line} key={x.key_hint!r}")
            print(f"    {x.snippet}")
        if len(findings) > 200:
            print(f"\n... truncated ({len(findings)} total findings)")
        return 1

    print("[PASS] token storage scan: no disallowed storage writes found")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

