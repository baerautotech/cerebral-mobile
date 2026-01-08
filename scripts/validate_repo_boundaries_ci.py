#!/usr/bin/env python3
"""CI validator for repo ownership boundaries.

CI should be deterministic and must not rely on cross-repo pre-commit hook fetches.
This reads `repo-boundaries.toml` and enforces a minimal set of guardrails.
"""

from __future__ import annotations

import fnmatch
import sys
from pathlib import Path

import tomllib

REPO_ROOT = Path(__file__).resolve().parents[1]
CONFIG_PATH = REPO_ROOT / "repo-boundaries.toml"


def _fail(msg: str) -> None:
    print(f"REPO_BOUNDARIES_CI_FAILED: {msg}", file=sys.stderr)


def _matches_any_glob(rel: str, globs: list[str]) -> bool:
    return any(fnmatch.fnmatch(rel, g) for g in globs)


def _iter_text_files(root: Path) -> list[Path]:
    if not root.exists():
        return []
    out: list[Path] = []
    for p in root.rglob("*"):
        if p.is_file() and p.suffix.lower() in {".md", ".txt"}:
            out.append(p)
    return out


def _check_forbidden_paths(forbid: list[str]) -> list[str]:
    errors: list[str] = []
    for rel in forbid:
        if not rel:
            continue
        p = (REPO_ROOT / rel).resolve()
        try:
            p.relative_to(REPO_ROOT)
        except ValueError:
            errors.append(f"forbid path escapes repo root: {rel}")
            continue
        if p.exists():
            errors.append(f"forbidden path exists: {rel}")
    return errors


def _check_app_repo_k8s_no_manifests() -> list[str]:
    errors: list[str] = []

    # Allow k8s/README.md redirect, forbid manifests anywhere under k8s/
    k8s_dir = REPO_ROOT / "k8s"
    if k8s_dir.exists():
        for p in k8s_dir.rglob("*"):
            if p.is_file() and p.suffix.lower() in {".yaml", ".yml", ".json"}:
                errors.append(f"k8s manifests are infra-owned; forbidden file: {p.relative_to(REPO_ROOT)}")

    # Also forbid microservices/*/k8s manifests (if present)
    ms_root = REPO_ROOT / "microservices"
    if ms_root.exists():
        for svc in ms_root.iterdir():
            if not svc.is_dir():
                continue
            svc_k8s = svc / "k8s"
            if not svc_k8s.exists():
                continue
            for p in svc_k8s.rglob("*"):
                if p.is_file() and p.suffix.lower() in {".yaml", ".yml", ".json"}:
                    errors.append(
                        f"microservice k8s manifests are infra-owned; forbidden file: {p.relative_to(REPO_ROOT)}"
                    )

    return errors


def _check_docs_forbidden_snippets(
    doc_roots: list[str],
    archive_globs: list[str],
    allowlist: list[str],
    forbid_snippets: list[str],
) -> list[str]:
    errors: list[str] = []
    allow = {a for a in allowlist if a}

    for root_rel in doc_roots:
        root = REPO_ROOT / root_rel
        for p in _iter_text_files(root):
            rel = p.relative_to(REPO_ROOT).as_posix()

            if rel in allow:
                continue
            if _matches_any_glob(rel, archive_globs):
                continue

            text = p.read_text(encoding="utf-8", errors="replace")
            for snippet in forbid_snippets:
                if snippet and snippet in text:
                    errors.append(f"forbidden snippet in {rel}: {snippet!r}")

    return errors


def main() -> int:
    if not CONFIG_PATH.exists():
        _fail("repo-boundaries.toml not found")
        return 2

    cfg = tomllib.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    repo_type = ((cfg.get("repo") or {}).get("type") or "").strip()
    paths = cfg.get("paths") or {}
    docs = cfg.get("docs") or {}

    forbid_paths = list(paths.get("forbid") or [])

    doc_roots = list(docs.get("roots") or [])
    archive_globs = list(docs.get("archive_globs") or [])
    allowlist = list(docs.get("allowlist") or [])
    forbid_snippets = list(docs.get("forbid_snippets") or [])

    errors: list[str] = []
    errors.extend(_check_forbidden_paths(forbid_paths))

    if repo_type == "app":
        errors.extend(_check_app_repo_k8s_no_manifests())

    errors.extend(
        _check_docs_forbidden_snippets(
            doc_roots=doc_roots,
            archive_globs=archive_globs,
            allowlist=allowlist,
            forbid_snippets=forbid_snippets,
        )
    )

    if errors:
        print("REPO_BOUNDARIES_VALIDATION_FAILED:", file=sys.stderr)
        for e in errors[:200]:
            print(f"- {e}", file=sys.stderr)
        if len(errors) > 200:
            print(f"... and {len(errors) - 200} more", file=sys.stderr)
        return 1

    print("Repo boundaries validation PASSED")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
