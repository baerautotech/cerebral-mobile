#!/usr/bin/env python3
"""Enforce shared logging and metrics usage across Cerebral repositories.

Modes:
    --check (default): Exit non-zero if banned patterns are present.
    --fix: Replace legacy logging patterns with LoggerFactory usage.

Rules Enforced:
    1. Disallow direct usage of `logging.getLogger`.
    2. Disallow instantiation of `MetricsRegistry()`.

The fixer updates files in-place and injects `LoggerFactory` imports when missing.
Use from repo root:
    python scripts/enforce_logging_metrics.py --check
    python scripts/enforce_logging_metrics.py --fix
"""

from __future__ import annotations

import argparse
import dataclasses
import pathlib
import re
import sys
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from collections.abc import Iterable

LOGGER_PATTERN = re.compile(r"\blogging\.getLogger\s*\(")
LOGGER_FACTORY_USAGE_PATTERN = re.compile(r"\bLoggerFactory\.get_logger\s*\(")
METRICS_PATTERN = re.compile(r"\bMetricsRegistry\s*\(")
LOGGER_IMPORT_PATTERN = re.compile(
    r"from\s+backend_python\.shared\.logging_lib\s+import\s+LoggerFactory"
)

SKIP_DIR_KEYWORDS: tuple[str, ...] = (
    ".git",
    "__pycache__",
    "node_modules",
    "vendor",
    "build",
    "dist",
    ".venv",
    "venv",
    ".mypy_cache",
)

SKIP_PATH_PREFIXES: tuple[str, ...] = (
    "backend_python/shared/logging",
    "backend_python/archive",
    "scripts/enforce_logging_metrics.py",
)

REPO_ROOT = pathlib.Path(__file__).resolve().parent.parent


@dataclasses.dataclass
class Violation:
    """Represents a single enforcement violation."""

    path: pathlib.Path
    description: str


def _should_skip(relative_str: str, parts: tuple[str, ...]) -> bool:
    if any(part in SKIP_DIR_KEYWORDS for part in parts):
        return True
    return any(relative_str.startswith(prefix) for prefix in SKIP_PATH_PREFIXES)


def iter_python_files(root: pathlib.Path) -> Iterable[pathlib.Path]:
    """Yield python files under root respecting skip lists."""

    if root.is_file():
        relative = root.resolve().relative_to(REPO_ROOT)
        if _should_skip(str(relative), relative.parts):
            return
        if root.suffix == ".py":
            yield root
        return

    for path in root.rglob("*.py"):
        relative = path.resolve().relative_to(REPO_ROOT)
        if _should_skip(str(relative), relative.parts):
            continue
        yield path


def needs_logger_factory_import(text: str) -> bool:
    """Determine if file needs LoggerFactory import injection."""

    if not LOGGER_FACTORY_USAGE_PATTERN.search(text):
        return False
    return not LOGGER_IMPORT_PATTERN.search(text)


def insert_logger_import(text: str) -> str:
    """Insert LoggerFactory import into module."""

    lines = text.splitlines()
    insert_idx = 0

    if lines and lines[0].startswith("#!"):
        insert_idx = 1

    while insert_idx < len(lines) and not lines[insert_idx].strip():
        insert_idx += 1

    if insert_idx < len(lines) and lines[insert_idx].strip().startswith(('"""', "'''")):
        quote = lines[insert_idx].strip()[:3]
        insert_idx += 1
        while insert_idx < len(lines):
            if lines[insert_idx].strip().endswith(quote):
                insert_idx += 1
                break
            insert_idx += 1

    last_import_idx = insert_idx
    for idx in range(insert_idx, len(lines)):
        stripped = lines[idx].strip()
        if stripped.startswith(("import ", "from ")):
            last_import_idx = idx + 1
        elif stripped == "":
            continue
        else:
            break

    import_line = "from backend_python.shared.logging_lib import LoggerFactory"
    lines.insert(last_import_idx, import_line)
    return "\n".join(lines) + ("\n" if text.endswith("\n") else "")


def fix_logging_usage(_path: pathlib.Path, text: str) -> str:
    """Replace logging.getLogger usage with LoggerFactory variant."""

    updated = LOGGER_PATTERN.sub("LoggerFactory.get_logger(", text)
    if needs_logger_factory_import(updated):
        updated = insert_logger_import(updated)
    return updated


def fix_file(path: pathlib.Path) -> bool:
    """Apply fixes to a file if needed."""

    try:
        original = path.read_text(encoding="utf-8")
    except FileNotFoundError:
        return False
    updated = original

    if LOGGER_PATTERN.search(updated):
        updated = fix_logging_usage(path, updated)

    if needs_logger_factory_import(updated):
        updated = insert_logger_import(updated)

    if updated != original:
        path.write_text(updated, encoding="utf-8")
        return True
    return False


def find_violations(path: pathlib.Path) -> list[Violation]:
    """Collect violations in a file."""

    try:
        text = path.read_text(encoding="utf-8")
    except FileNotFoundError:
        return []
    violations: list[Violation] = []

    if LOGGER_PATTERN.search(text):
        violations.append(
            Violation(
                path=path, description="uses logging.getLogger instead of LoggerFactory"
            )
        )

    if METRICS_PATTERN.search(text):
        violations.append(
            Violation(path=path, description="instantiates MetricsRegistry() directly")
        )

    return violations


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Enforce shared logging/metrics usage."
    )
    parser.add_argument(
        "--fix",
        action="store_true",
        help="Rewrite files to use LoggerFactory.get_logger.",
    )
    parser.add_argument(
        "--paths",
        nargs="*",
        default=["."],
        help="Directories or files to scan (default: current directory).",
    )
    args = parser.parse_args()

    root_paths = [pathlib.Path(p).resolve() for p in args.paths]

    if args.fix:
        for root in root_paths:
            for file_path in iter_python_files(root):
                fix_file(file_path)
        return 0

    violations: list[Violation] = []
    for root in root_paths:
        for file_path in iter_python_files(root):
            violations.extend(find_violations(file_path))

    if not violations:
        return 0

    for violation in violations:
        print(f"{violation.path.relative_to(REPO_ROOT)}: {violation.description}")
    print(
        "\nERROR: Found legacy logging/metrics usage. Run with --fix to auto-migrate.",
        file=sys.stderr,
    )
    return 1


if __name__ == "__main__":
    sys.exit(main())
